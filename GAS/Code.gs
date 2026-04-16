var N8N_WEBHOOK = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-report';
var SHEET_ID = '1L8oNHhBswImiK23iekB5H6HeuM-IEiIzncMqDT-ubGM';

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  return t.evaluate().setTitle('Pipedrive — Звіти').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).addMetaTag('viewport','width=device-width,initial-scale=1');
}

function include(f) {
  return HtmlService.createHtmlOutputFromFile(f).getContent();
}

// ===== REFRESH DATA: metadata + deals → Google Sheet =====

function refreshData(dateFrom, dateTo) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);

    // 1. Load metadata from n8n
    var meta = callN8n_({action:'metadata'});
    if (meta.error) return {error: meta.error};

    // Save metadata sheets
    writeSheet_(ss, 'Fields', meta.fields, ['field_id','key','name','type']);
    writeSheet_(ss, 'Users', meta.users, ['id','name','active']);
    writeSheet_(ss, 'Pipelines', meta.pipelines, ['id','name']);
    writeStagesSheet_(ss, 'Stages', meta.stages);

    // 2. Load deals for date range
    var conditions = [
      {field_id:12465, operator:'>=', value:dateFrom},
      {field_id:12465, operator:'<=', value:dateTo}
    ];
    var result = callN8n_({action:'report', conditions:conditions, groupBy:'none'});
    if (result.error) return {error: result.error};

    // Save deals — all fields
    if (result.deals && result.deals.length) {
      var allKeys = Object.keys(result.deals[0]);
      writeSheet_(ss, 'Deals', result.deals, allKeys);
    } else {
      var dealsSheet = getOrCreateSheet_(ss, 'Deals');
      dealsSheet.clear();
      dealsSheet.getRange(1,1).setValue('Немає угод за цей період');
    }

    // 3. Save refresh timestamp
    var infoSheet = getOrCreateSheet_(ss, 'Info');
    infoSheet.clear();
    infoSheet.getRange(1,1,3,2).setValues([
      ['Останнє оновлення', new Date().toLocaleString('uk-UA')],
      ['Період', dateFrom + ' — ' + dateTo],
      ['Кількість угод', result.deals.length]
    ]);

    return {success:true, deals:result.deals.length, period:dateFrom+' — '+dateTo};
  } catch(e) {
    return {error: e.message || String(e)};
  }
}

function writeSheet_(ss, name, data, cols) {
  var sheet = getOrCreateSheet_(ss, name);
  sheet.clear();
  if (!data || !data.length) { sheet.getRange(1,1).setValue('Немає даних'); return; }
  var headers = cols || Object.keys(data[0]);
  var rows = [headers];
  data.forEach(function(item) {
    rows.push(headers.map(function(h) {
      var v = item[h];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    }));
  });
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
}

function writeStagesSheet_(ss, name, stagesObj) {
  var sheet = getOrCreateSheet_(ss, name);
  sheet.clear();
  var rows = [['pipeline_id','stage_id','name']];
  for (var pid in stagesObj) {
    stagesObj[pid].forEach(function(s) { rows.push([parseInt(pid), s.id, s.name]); });
  }
  sheet.getRange(1, 1, rows.length, 3).setValues(rows);
}

function getOrCreateSheet_(ss, name) {
  var s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  return s;
}

// ===== BUILD REPORT FROM SHEET =====

function buildReportFromSheet(filters, groupBy) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName('Deals');
    if (!sheet) return {error:'Спочатку натисніть "Оновити дані"'};
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return {error:'Немає даних. Натисніть "Оновити дані"'};

    var headers = data[0];
    var deals = [];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      headers.forEach(function(h, idx) { row[h] = data[i][idx]; });
      deals.push(row);
    }

    // Enrich with names
    var pMap = {}, sMap = {};
    var pSheet = ss.getSheetByName('Pipelines');
    if (pSheet) { var pd = pSheet.getDataRange().getValues(); for(var i=1;i<pd.length;i++) pMap[pd[i][0]]=pd[i][1]; }
    var sSheet = ss.getSheetByName('Stages');
    if (sSheet) { var sd = sSheet.getDataRange().getValues(); for(var i=1;i<sd.length;i++) sMap[sd[i][1]]=sd[i][2]; }
    deals.forEach(function(d) { d.pipeline_name=pMap[d.pipeline_id]||''; d.stage_name=sMap[d.stage_id]||''; });

    // Apply client-side filters
    if (filters && filters.length) {
      deals = deals.filter(function(d) {
        return filters.every(function(f) {
          var val = d[f.field] || '';
          if (f.op === '=') return String(val) === String(f.value);
          if (f.op === '!=') return String(val) !== String(f.value);
          if (f.op === 'in') return Array.isArray(f.value) && f.value.map(String).indexOf(String(val)) >= 0;
          if (f.op === 'contains') return String(val).toLowerCase().indexOf(String(f.value).toLowerCase()) >= 0;
          return true;
        });
      });
    }

    // Calc totals
    var totals = {total:deals.length, won:0, lost:0, open:0, won_value:0, lost_value:0, open_value:0};
    deals.forEach(function(r) {
      var v = parseFloat(r.value) || 0;
      if(r.status==='won'){totals.won++;totals.won_value+=v;}
      else if(r.status==='lost'){totals.lost++;totals.lost_value+=v;}
      else if(r.status==='open'){totals.open++;totals.open_value+=v;}
    });
    totals.conversion_rate = totals.total>0 ? Math.round(totals.won/totals.total*10000)/100 : 0;

    // Groups
    var groups = [];
    if (groupBy && groupBy !== 'none') {
      var gMap = {};
      deals.forEach(function(r) {
        var gk = groupBy==='owner' ? r.owner_name : r.pipeline_name;
        if(!gMap[gk]) gMap[gk]={name:gk,total:0,won:0,lost:0,open:0,value:0};
        gMap[gk].total++; gMap[gk].value+=(parseFloat(r.value)||0);
        if(r.status==='won') gMap[gk].won++;
        else if(r.status==='lost') gMap[gk].lost++;
        else gMap[gk].open++;
      });
      groups = Object.keys(gMap).map(function(k){var g=gMap[k];g.conversion_rate=g.total>0?Math.round(g.won/g.total*10000)/100:0;return g;}).sort(function(a,b){return b.total-a.total;});
    }

    // Charts data
    var charts = buildChartsData_(deals);

    return {deals:deals, totals:totals, groups:groups, charts:charts, generated_at:new Date().toISOString()};
  } catch(e) {
    return {error: e.message || String(e)};
  }
}

function buildChartsData_(deals) {
  // 1. Conversion by owner
  var byOwner = {};
  deals.forEach(function(d) {
    var o = d.owner_name || 'Unknown';
    if(!byOwner[o]) byOwner[o]={name:o,won:0,lost:0,open:0};
    if(d.status==='won') byOwner[o].won++;
    else if(d.status==='lost') byOwner[o].lost++;
    else byOwner[o].open++;
  });
  var convByOwner = Object.values(byOwner).sort(function(a,b){return (b.won+b.lost+b.open)-(a.won+a.lost+a.open);});

  // 2. Deals by month
  var byMonth = {};
  deals.forEach(function(d) {
    if (!d.add_time) return;
    var m = String(d.add_time).substring(0,7); // YYYY-MM
    if(!byMonth[m]) byMonth[m]={month:m,total:0,won:0,lost:0,open:0};
    byMonth[m].total++;
    if(d.status==='won') byMonth[m].won++;
    else if(d.status==='lost') byMonth[m].lost++;
    else byMonth[m].open++;
  });
  var dealsByMonth = Object.values(byMonth).sort(function(a,b){return a.month.localeCompare(b.month);});

  // 3. By pipeline
  var byPipeline = {};
  deals.forEach(function(d) {
    var p = d.pipeline_name || d.pipeline_id || 'Unknown';
    if(!byPipeline[p]) byPipeline[p]={name:p,count:0};
    byPipeline[p].count++;
  });
  var dealsByPipeline = Object.values(byPipeline).sort(function(a,b){return b.count-a.count;});

  return {convByOwner:convByOwner, dealsByMonth:dealsByMonth, dealsByPipeline:dealsByPipeline};
}

// ===== N8N PROXY =====

function buildAndFetchReport(conditions, groupBy, orConditions) {
  var payload = {action:'report', groupBy:groupBy};
  if (orConditions && orConditions.length) { payload.andConditions=conditions; payload.orConditions=orConditions; }
  else { payload.conditions=conditions; }
  return callN8n_(payload);
}

function countDeals(conditions, orConditions) {
  var payload = {action:'count'};
  if (orConditions && orConditions.length) { payload.andConditions=conditions; payload.orConditions=orConditions; }
  else { payload.conditions=conditions; }
  return callN8n_(payload);
}

function callN8n_(payload) {
  try {
    var opts = {method:'post', contentType:'application/json', payload:JSON.stringify(payload), muteHttpExceptions:true};
    var resp = UrlFetchApp.fetch(N8N_WEBHOOK, opts);
    return JSON.parse(resp.getContentText());
  } catch(e) {
    return {error: e.message || String(e)};
  }
}
