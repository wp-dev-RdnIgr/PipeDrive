var N8N_WEBHOOK = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-report';
var N8N_SYNC = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-sync';
var N8N_DB = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-db';

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  return t.evaluate().setTitle('Pipedrive — Звіти').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).addMetaTag('viewport','width=device-width,initial-scale=1');
}

function include(f) {
  return HtmlService.createHtmlOutputFromFile(f).getContent();
}

function refreshAllData(dateFrom, dateTo) {
  try {
    var opts = {method:'post', contentType:'application/json', muteHttpExceptions:true,
      payload:JSON.stringify({entity:'all', dateFrom:dateFrom, dateTo:dateTo})};
    var resp = UrlFetchApp.fetch(N8N_SYNC, opts);
    return JSON.parse(resp.getContentText());
  } catch(e) {
    return {error: e.message || String(e)};
  }
}

function buildReportFromDB(filters, groupBy) {
  try {
    var where = [];
    if (filters && filters.length) {
      filters.forEach(function(f) {
        if (f.op === '=') where.push(f.field + " = '" + f.value + "'");
        else if (f.op === '!=') where.push(f.field + " != '" + f.value + "'");
        else if (f.op === 'in') where.push(f.field + " IN (" + f.value.join(',') + ")");
        else if (f.op === 'contains') where.push(f.field + " ILIKE '%" + f.value + "%'");
      });
    }
    var whereStr = where.length ? ' WHERE ' + where.join(' AND ') : '';
    var sql = "SELECT d.*, s.name as stage_name, p.name as pipeline_name FROM pipedrive.deals d LEFT JOIN pipedrive.stages s ON d.stage_id=s.id LEFT JOIN pipedrive.pipelines p ON d.pipeline_id=p.id" + whereStr + " ORDER BY d.add_time DESC";
    var opts = {method:'post', contentType:'application/json', muteHttpExceptions:true,
      payload:JSON.stringify({query:sql})};
    var resp = UrlFetchApp.fetch(N8N_DB, opts);
    var data = JSON.parse(resp.getContentText());
    var deals = Array.isArray(data) ? data : [data];
    if (deals.length === 1 && !deals[0].id) deals = [];

    var totals = {total:deals.length, won:0, lost:0, open:0, won_value:0, lost_value:0, open_value:0};
    deals.forEach(function(r) {
      var v = parseFloat(r.value) || 0;
      if(r.status==='won'){totals.won++;totals.won_value+=v;}
      else if(r.status==='lost'){totals.lost++;totals.lost_value+=v;}
      else if(r.status==='open'){totals.open++;totals.open_value+=v;}
    });
    totals.conversion_rate = totals.total>0 ? Math.round(totals.won/totals.total*10000)/100 : 0;

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

    return {deals:deals, totals:totals, groups:groups, generated_at:new Date().toISOString()};
  } catch(e) {
    return {error: e.message || String(e)};
  }
}

function buildAndFetchReport(conditions, groupBy, orConditions) {
  var payload = {action:'report', groupBy:groupBy};
  if (orConditions && orConditions.length) { payload.andConditions=conditions; payload.orConditions=orConditions; }
  else { payload.conditions=conditions; }
  try {
    var opts = {method:'post', contentType:'application/json', payload:JSON.stringify(payload), muteHttpExceptions:true};
    var resp = UrlFetchApp.fetch(N8N_WEBHOOK, opts);
    return JSON.parse(resp.getContentText());
  } catch(e) {
    return {error: e.message || String(e)};
  }
}

function countDeals(conditions, orConditions) {
  var payload = {action:'count'};
  if (orConditions && orConditions.length) { payload.andConditions=conditions; payload.orConditions=orConditions; }
  else { payload.conditions=conditions; }
  try {
    var opts = {method:'post', contentType:'application/json', payload:JSON.stringify(payload), muteHttpExceptions:true};
    var resp = UrlFetchApp.fetch(N8N_WEBHOOK, opts);
    return JSON.parse(resp.getContentText());
  } catch(e) {
    return {error: e.message || String(e)};
  }
}
