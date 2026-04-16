var N8N_WEBHOOK = 'https://n8n.rnd.webpromo.tools/webhook/pipedrive-report';

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  return t.evaluate().setTitle('Pipedrive — Звіти').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).addMetaTag('viewport','width=device-width,initial-scale=1');
}

function include(f) {
  return HtmlService.createHtmlOutputFromFile(f).getContent();
}

function buildAndFetchReport(conditions, groupBy, orConditions) {
  var payload = {action:'report', groupBy:groupBy};
  if (orConditions && orConditions.length) {
    payload.andConditions = conditions;
    payload.orConditions = orConditions;
  } else {
    payload.conditions = conditions;
  }
  return callN8n_(payload);
}

function countDeals(conditions, orConditions) {
  var payload = {action:'count'};
  if (orConditions && orConditions.length) {
    payload.andConditions = conditions;
    payload.orConditions = orConditions;
  } else {
    payload.conditions = conditions;
  }
  return callN8n_(payload);
}

function callN8n_(payload) {
  try {
    var opts = {method:'post', contentType:'application/json', payload:JSON.stringify(payload), muteHttpExceptions:true};
    var resp = UrlFetchApp.fetch(N8N_WEBHOOK, opts);
    var data = JSON.parse(resp.getContentText());

    // For report action: enrich with pipeline/stage names
    if (payload.action === 'report' && data.deals) {
      var pMap = {}, sMap = {};
      PIPELINES.forEach(function(p){pMap[p.id]=p.name;});
      for (var pid in STAGES) STAGES[pid].forEach(function(s){sMap[s.id]=s.name;});
      data.deals.forEach(function(d){
        d.pipeline_name = pMap[d.pipeline_id]||'';
        d.stage_name = sMap[d.stage_id]||'';
      });
    }
    return data;
  } catch(e) {
    return {error: e.message || String(e)};
  }
}
