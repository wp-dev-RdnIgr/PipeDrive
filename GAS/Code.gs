var BASE_URL = 'https://api.pipedrive.com/v1';

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  return t.evaluate().setTitle('Pipedrive — Звіти').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).addMetaTag('viewport','width=device-width,initial-scale=1');
}

function include(f) {
  return HtmlService.createHtmlOutputFromFile(f).getContent();
}

function getApiToken_() {
  return PropertiesService.getScriptProperties().getProperty('PIPEDRIVE_API_TOKEN');
}

function buildAndFetchReport(conditions, groupBy) {
  var token = getApiToken_();
  if (!token) return {error:'API токен не налаштовано. Додайте PIPEDRIVE_API_TOKEN в Script Properties.'};
  var filterId = null;
  try {
    filterId = createFilter_(conditions, token);
    var deals = fetchAllDeals_(filterId, token);
    var result = processReport_(deals, groupBy);
    return result;
  } catch(e) {
    return {error: e.message || String(e)};
  } finally {
    if (filterId) try { deleteFilter_(filterId, token); } catch(e2) {}
  }
}

function countDeals(conditions) {
  var token = getApiToken_();
  if (!token) return {error:'API токен не налаштовано.'};
  var filterId = null;
  try {
    filterId = createFilter_(conditions, token);
    var url = BASE_URL + '/deals/summary?filter_id=' + filterId + '&api_token=' + token;
    var r = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    return {count: r.data.total_count, values: r.data.values_total};
  } catch(e) {
    return {error: e.message};
  } finally {
    if (filterId) try { deleteFilter_(filterId, token); } catch(e2) {}
  }
}

function createFilter_(conditions, token) {
  var payload = {
    name: 'gas_temp_' + Date.now(),
    type: 'deals',
    conditions: {glue:'and', conditions:[{glue:'and', conditions: conditions.map(function(c) {
      return {object:'deal', field_id:c.field_id, operator:c.operator, value:c.value, extra_value:c.extra_value||null};
    })}]}
  };
  var opts = {method:'post', contentType:'application/json', payload:JSON.stringify(payload), muteHttpExceptions:true};
  var r = JSON.parse(UrlFetchApp.fetch(BASE_URL + '/filters?api_token=' + token, opts).getContentText());
  if (!r.success) throw new Error('Помилка створення фільтра: ' + JSON.stringify(r));
  return r.data.id;
}

function fetchAllDeals_(filterId, token) {
  var all = [], start = 0, hasMore = true, pages = 0;
  while (hasMore && pages < 20) {
    var url = BASE_URL + '/deals?filter_id=' + filterId + '&limit=500&start=' + start + '&api_token=' + token;
    var r = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    if (r.data) all = all.concat(r.data);
    var p = r.additional_data && r.additional_data.pagination;
    hasMore = p && p.more_items_in_collection;
    if (hasMore) start = p.next_start;
    pages++;
  }
  return all;
}

function deleteFilter_(filterId, token) {
  UrlFetchApp.fetch(BASE_URL + '/filters/' + filterId + '?api_token=' + token, {method:'delete', muteHttpExceptions:true});
}

function processReport_(deals, groupBy) {
  var pMap = {}, sMap = {};
  PIPELINES.forEach(function(p){pMap[p.id]=p.name;});
  for (var pid in STAGES) STAGES[pid].forEach(function(s){sMap[s.id]=s.name;});
  var uMap = {};
  USERS.forEach(function(u){uMap[u.id]=u.name;});

  var rows = deals.map(function(d) {
    var ownerId = typeof d.user_id === 'object' ? d.user_id.id : d.user_id;
    var ownerName = typeof d.user_id === 'object' ? d.user_id.name : (uMap[d.user_id]||'');
    return {
      id:d.id, title:d.title, owner_name:ownerName, owner_id:ownerId,
      pipeline_name:pMap[d.pipeline_id]||'', stage_name:sMap[d.stage_id]||'',
      status:d.status, value:d.value||0, currency:d.currency||'UAH',
      add_time:d.add_time, won_time:d.won_time, lost_time:d.lost_time,
      label:d.label, lost_reason:d.lost_reason, product_name:d['product_name']||'',
      site:d['a600f66ee681cdbadd255ed1c5d3a1eef6fb1490']||'',
      utm_medium:d['d3427cdd75f047b75c5ea754c9b4231b38be32c8']||'',
      utm_campaign:d['c5accf0005ddb2f09157fcca17861081f77aa9b6']||'',
      utm_source:d['50b777b7baa179cee7c06d63d50b1338887285ce']||'',
      page:d['b3a97cc3db5a88f752797d1ac360952d0d3632a0']||'',
      quality:d['e664cf54795851840003239fba6262f7bb35ecba']||'',
      source_form:d['1338d3a3ecb513d7a68a32b5439872eb08c2a366']||'',
      kp_link:d['64ae14d237e29fe0796b6d88e3c86ffd34c50b8e']||'',
      comment:d['fbe73c1a96bd4170123745b5fd9a44f9a88438da']||'',
      processed:d['edd70f6d7138760fca5573f6f84868303eb6b38c']||''
    };
  });

  var totals = {total:rows.length, won:0, lost:0, open:0, won_value:0, lost_value:0, open_value:0};
  rows.forEach(function(r){
    if(r.status==='won'){totals.won++;totals.won_value+=r.value;}
    else if(r.status==='lost'){totals.lost++;totals.lost_value+=r.value;}
    else if(r.status==='open'){totals.open++;totals.open_value+=r.value;}
  });
  totals.conversion_rate = totals.total>0 ? Math.round(totals.won/totals.total*10000)/100 : 0;

  var groups = [];
  if (groupBy && groupBy !== 'none') {
    var gMap = {};
    rows.forEach(function(r){
      var gk = groupBy==='owner' ? r.owner_name : r.pipeline_name;
      if(!gMap[gk]) gMap[gk]={name:gk,total:0,won:0,lost:0,open:0,value:0};
      gMap[gk].total++;
      gMap[gk].value+=r.value;
      if(r.status==='won') gMap[gk].won++;
      else if(r.status==='lost') gMap[gk].lost++;
      else gMap[gk].open++;
    });
    groups = Object.keys(gMap).map(function(k){
      var g=gMap[k];
      g.conversion_rate=g.total>0?Math.round(g.won/g.total*10000)/100:0;
      return g;
    }).sort(function(a,b){return b.total-a.total;});
  }

  return {deals:rows, totals:totals, groups:groups, generated_at:new Date().toISOString()};
}
