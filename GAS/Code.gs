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

// n8n webhook returns only the first row of a multi-row SELECT, so we wrap
// queries in json_agg() to transport all rows as a single JSON array.
function dbQueryRows(sql) {
  var wrapped = "SELECT COALESCE(json_agg(t), '[]'::json) AS rows FROM (" + sql + ") t";
  var opts = {method:'post', contentType:'application/json', muteHttpExceptions:true,
    payload:JSON.stringify({query:wrapped})};
  var resp = UrlFetchApp.fetch(N8N_DB, opts);
  var data = JSON.parse(resp.getContentText());
  var row = Array.isArray(data) ? data[0] : data;
  if (!row) return [];
  var rows = row.rows;
  if (typeof rows === 'string') rows = JSON.parse(rows);
  return Array.isArray(rows) ? rows : [];
}

function getFieldOptionsFromDB() {
  try {
    var rows = dbQueryRows("SELECT id, options FROM pipedrive.deal_fields WHERE options IS NOT NULL AND jsonb_array_length(options) > 0");
    var map = {};
    rows.forEach(function(r){ if(r.id && r.options) map[r.id] = r.options; });
    return map;
  } catch(e) {
    return {};
  }
}

function getUsersFromDB() {
  try {
    return dbQueryRows("SELECT id, name, active FROM pipedrive.users ORDER BY active DESC, name");
  } catch(e) { return []; }
}

function getPipelinesFromDB() {
  try {
    return dbQueryRows("SELECT id, name FROM pipedrive.pipelines ORDER BY order_nr, name");
  } catch(e) { return []; }
}

function getStagesFromDB() {
  try {
    var rows = dbQueryRows("SELECT id, pipeline_id, name FROM pipedrive.stages ORDER BY pipeline_id, order_nr");
    var map = {};
    rows.forEach(function(r){ if(!map[r.pipeline_id]) map[r.pipeline_id]=[]; map[r.pipeline_id].push({id:r.id,name:r.name}); });
    return map;
  } catch(e) { return {}; }
}

function getProductNames() {
  try {
    var sql = "SELECT string_agg(name, '||' ORDER BY id) as names FROM pipedrive.products WHERE active_flag = true";
    var opts = {method:'post', contentType:'application/json', muteHttpExceptions:true,
      payload:JSON.stringify({query:sql})};
    var resp = UrlFetchApp.fetch(N8N_DB, opts);
    var data = JSON.parse(resp.getContentText());
    var row = Array.isArray(data) ? data[0] : data;
    if (row && row.names) return row.names.split('||').filter(function(x){return x;});
    return [];
  } catch(e) {
    return [];
  }
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
    console.log('FILTERS:', JSON.stringify(filters));
    var where = [];
    var productFilter = null;
    if (filters && filters.length) {
      filters.forEach(function(f) {
        // Special: product_name — use JOIN with deal_products
        if (f.field === 'product_name' || f.field === 'deal_product') {
          productFilter = f.value;
          return;
        }
        if (f.op === '=') where.push('d.' + f.field + " = '" + String(f.value).replace(/'/g,"''") + "'");
        else if (f.op === '!=') where.push('d.' + f.field + " != '" + String(f.value).replace(/'/g,"''") + "'");
        else if (f.op === '>=') where.push('d.' + f.field + " >= '" + f.value + "'");
        else if (f.op === '<=') {
          // For date-only values on timestamp columns, include the whole day.
          var dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(f.value));
          if (dateOnly) where.push('d.' + f.field + " < ('" + f.value + "'::date + INTERVAL '1 day')");
          else where.push('d.' + f.field + " <= '" + f.value + "'");
        }
        else if (f.op === 'in') where.push('d.' + f.field + " IN (" + f.value.join(',') + ")");
        else if (f.op === 'contains') where.push('d.' + f.field + " ILIKE '%" + String(f.value).replace(/'/g,"''") + "%'");
        else if (f.op === 'is null') where.push('d.' + f.field + " IS NULL");
        else if (f.op === 'is not null') where.push('d.' + f.field + " IS NOT NULL");
      });
    }
    if (productFilter) {
      where.push("EXISTS (SELECT 1 FROM pipedrive.deal_products dp WHERE dp.deal_id = d.id AND dp.name = '" + String(productFilter).replace(/'/g,"''") + "')");
    }
    var whereStr = where.length ? ' WHERE ' + where.join(' AND ') : '';
    var sql = "SELECT d.*, s.name as stage_name, p.name as pipeline_name FROM pipedrive.deals d LEFT JOIN pipedrive.stages s ON d.stage_id=s.id LEFT JOIN pipedrive.pipelines p ON d.pipeline_id=p.id" + whereStr + " ORDER BY d.add_time DESC";
    console.log('SQL:', sql);
    var deals = dbQueryRows(sql);

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

    return {deals:deals, totals:totals, groups:groups, generated_at:new Date().toISOString(), _debug:{inputFilters:filters, sql:sql, dealsCount:deals.length}};
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
    var body = resp.getContentText();
    if (resp.getResponseCode() >= 400) return {error:'HTTP '+resp.getResponseCode()+': '+body.substring(0,300)};
    if (!body) return {error:'Empty response from n8n webhook'};
    try { return JSON.parse(body); } catch(parseErr) { return {error:'JSON parse: '+body.substring(0,300)}; }
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
