var N8N_WEBHOOK = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-report';
var N8N_SYNC = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-sync';
var N8N_DB = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-db';
var ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
var AI_MODEL = 'claude-haiku-4-5-20251001';

// ===== AI Assistant =====
// Stores the Anthropic API key in Script Properties; set once via
// setAnthropicKey('sk-ant-...') from the Apps Script editor.
function setAnthropicKey(key) {
  if (!key || typeof key !== 'string' || key.indexOf('sk-ant-') !== 0) {
    return {error: 'Ключ має починатися з sk-ant-'};
  }
  PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', key.trim());
  return {ok: true};
}

function isAIConfigured() {
  var k = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  return !!(k && k.indexOf('sk-ant-') === 0);
}

function askAI(userPrompt) {
  try {
    var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
    if (!apiKey) return {error: 'ANTHROPIC_API_KEY не налаштовано. Запустіть setAnthropicKey("sk-ant-...").'};
    if (!userPrompt || !userPrompt.trim()) return {error: 'Порожній запит'};

    var schemaText = buildAISchema();
    var instructions = 'Ти — асистент для побудови звітів по угодах Pipedrive. Користувач описує бажаний звіт природною мовою. Твоя задача — повернути ЛИШЕ валідний JSON без коментарів у форматі: {"filters":[{"field_id":int,"operator":"=|!=|>=|<=|>|<|LIKE|IN|IS NULL|IS NOT NULL","value":<string|number|array>}],"explanation":"коротко що саме відфільтровано"}. Правила: для дат завжди зазначай поле 12465 (add_time) якщо інше явно не сказано, з окремими фільтрами >= та <=. Для мультивибору стейджів використовуй operator:"IN" і value:[id,id,...]. Для enum полів використовуй id зі списку опцій (окрім поля 12475 lost_reason — там пиши label). Для країни (label) Україна=22, Казахстан=23. Жодних пояснень поза JSON.';
    var resp = UrlFetchApp.fetch(ANTHROPIC_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: {'x-api-key': apiKey, 'anthropic-version': '2023-06-01'},
      muteHttpExceptions: true,
      payload: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1500,
        system: [
          {type: 'text', text: instructions},
          {type: 'text', text: schemaText, cache_control: {type: 'ephemeral'}}
        ],
        messages: [{role: 'user', content: userPrompt}]
      })
    });
    var code = resp.getResponseCode();
    var body = resp.getContentText();
    if (code >= 400) return {error: 'HTTP ' + code + ': ' + body.substring(0, 400)};
    var data = JSON.parse(body);
    var text = data.content && data.content[0] && data.content[0].text;
    if (!text) return {error: 'Порожня відповідь від моделі'};
    var m = text.match(/\{[\s\S]*\}/);
    if (!m) return {error: 'Не знайдено JSON у відповіді', raw: text};
    try {
      var parsed = JSON.parse(m[0]);
      if (!Array.isArray(parsed.filters)) return {error: 'filters має бути масивом', raw: text};
      return {result: parsed, raw: text, usage: data.usage || null};
    } catch (e) {
      return {error: 'Невалідний JSON: ' + e.message, raw: text};
    }
  } catch (e) {
    return {error: e.message || String(e)};
  }
}

function buildAISchema() {
  var lines = [];
  lines.push('=== ПОЛЯ (field_id, label, type) ===');
  FIELDS.forEach(function(f) {
    var line = f.field_id + '  ' + f.label + '  [' + f.type + ']';
    if (f.options && f.options.length) {
      var opts = f.options.slice(0, 30).map(function(o){return o.id + '=' + o.label;}).join(' | ');
      line += '  options: ' + opts + (f.options.length > 30 ? ' ...' : '');
    }
    line += '  ops: ' + (f.operators || []).join(',');
    lines.push(line);
  });

  lines.push('');
  lines.push('=== ВОРОНКИ (pipeline_id=12460) ===');
  PIPELINES.forEach(function(p){ lines.push(p.id + '  ' + p.name); });

  lines.push('');
  lines.push('=== ЕТАПИ (stage_id=12462, по воронках) ===');
  PIPELINES.forEach(function(p){
    (STAGES[p.id] || []).forEach(function(s){
      lines.push(s.id + '  [' + p.name + ']  ' + s.name);
    });
  });

  lines.push('');
  lines.push('=== КОРИСТУВАЧІ (owner_id=12455, creator=12454, c_kp_specialist=12528) ===');
  USERS.filter(function(u){return u.active;}).forEach(function(u){
    lines.push(u.id + '  ' + u.name);
  });

  lines.push('');
  lines.push('=== ПРИКЛАДИ ===');
  lines.push('Запит: "КП за 2026 рік"');
  lines.push('Відповідь: {"filters":[{"field_id":12465,"operator":">=","value":"2026-01-01"},{"field_id":12465,"operator":"<=","value":"2026-12-31"},{"field_id":12462,"operator":"IN","value":[8,9,10,11,13,14]}],"explanation":"Комерційні пропозиції за 2026 рік на етапах КП воронки Теплі ліди"}');
  lines.push('');
  lines.push('Запит: "Угоди Karina Tkach за останні 30 днів в Україні"');
  lines.push('Відповідь: {"filters":[{"field_id":12455,"operator":"=","value":22953971},{"field_id":12465,"operator":">=","value":"<сьогодні-30д>"},{"field_id":12465,"operator":"<=","value":"<сьогодні>"},{"field_id":12463,"operator":"=","value":22}],"explanation":"Угоди Karina Tkach за 30 днів в Україні"}');
  lines.push('');
  lines.push('Для відносних дат повертай справжні ISO-дати (YYYY-MM-DD), обчислені від СЬОГОДНІ=' + Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd') + '.');

  return lines.join('\n');
}

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
    var start = Date.now();
    var opts = {method:'post', contentType:'application/json', muteHttpExceptions:true,
      payload:JSON.stringify({entity:'all', dateFrom:dateFrom, dateTo:dateTo})};
    UrlFetchApp.fetch(N8N_SYNC, opts);
    var elapsed = Math.round((Date.now() - start) / 1000);
    // n8n sync webhook replies with a Telegram API response rather than
    // structured sync stats, so we read authoritative counts from the DB.
    var rows = dbQueryRows(
      "SELECT 'deals' AS entity, COUNT(*)::bigint AS total FROM pipedrive.deals WHERE add_time >= '" + dateFrom + "' AND add_time < ('" + dateTo + "'::date + INTERVAL '1 day')" +
      " UNION ALL SELECT 'persons', COUNT(*) FROM pipedrive.persons" +
      " UNION ALL SELECT 'organizations', COUNT(*) FROM pipedrive.organizations" +
      " UNION ALL SELECT 'activities', COUNT(*) FROM pipedrive.activities" +
      " UNION ALL SELECT 'products', COUNT(*) FROM pipedrive.products" +
      " UNION ALL SELECT 'notes', COUNT(*) FROM pipedrive.notes"
    );
    var order = {deals:1, persons:2, organizations:3, activities:4, products:5, notes:6};
    rows.sort(function(a,b){return (order[a.entity]||99)-(order[b.entity]||99);});
    var results = rows.map(function(r){
      var n = Number(r.total) || 0;
      return {entity:r.entity, total:n, inserted:n, errors:0, elapsed:0};
    });
    if (results.length) results[0].elapsed = elapsed;
    return {results: results};
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
