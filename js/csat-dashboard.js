/**
 * Divine Rays — CSAT dashboard (safe schema)
 * Quietly no-ops if tickets.csat_score is not in the database.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CSAT_DASH_SAFE) return;
  window.__DR_CSAT_DASH_SAFE = 1;

  function sb() {
    try {
      if (window.DR && DR.sb) return DR.sb;
      if (window.supabase && window.DR_CONFIG) {
        return window.__drSb || null;
      }
    } catch (e) {}
    return window.__drSb || null;
  }

  var cache = { byId: {}, byName: {}, avg: 0, n: 0, unassigned: null, ts: 0, disabled: false };

  function agentIdOf(t) {
    return t.assigned_to || t.assignee_id || t.claimed_by || t.agent_id || null;
  }

  async function fetchCsat() {
    var client = sb();
    if (!client) return cache;
    if (cache.disabled) return cache;
    if (Date.now() - cache.ts < 4000 && cache.n >= 0) return cache;
    try {
      /* Only columns that commonly exist — never assignee_id/claimed_by */
      var r = await client
        .from('tickets')
        .select('csat_score,assigned_to')
        .not('csat_score', 'is', null);
      if (r.error) {
        cache.disabled = true;
        cache.ts = Date.now();
        cache.n = 0;
        return cache;
      }
      var rows = r.data || [];
      var sum = 0;
      var byId = {};
      var unSum = 0, unN = 0;
      rows.forEach(function (t) {
        var sc = Number(t.csat_score) || 0;
        sum += sc;
        var aid = agentIdOf(t);
        if (!aid) {
          unSum += sc;
          unN++;
          return;
        }
        if (!byId[aid]) byId[aid] = { sum: 0, n: 0 };
        byId[aid].sum += sc;
        byId[aid].n++;
      });

      var names = {};
      var ids = Object.keys(byId);
      if (ids.length) {
        try {
          var pr = await client.from('profiles').select('id,full_name,username,email').in('id', ids);
          if (pr.error) {
            pr = await client.from('profiles').select('id,full_name,username').in('id', ids);
          }
          (pr.data || []).forEach(function (p) {
            names[p.id] = p.full_name || p.username || p.email || '';
          });
        } catch (e) {}
      }

      var byName = {};
      ids.forEach(function (id) {
        var av = byId[id].sum / byId[id].n;
        var entry = { avg: av, n: byId[id].n, id: id };
        byId[id] = entry;
        var nm = (names[id] || '').trim().toLowerCase();
        if (nm) {
          byName[nm] = entry;
          var first = nm.split(/\s+/)[0];
          if (first) byName[first] = entry;
        }
      });

      cache.byId = byId;
      cache.byName = byName;
      cache.n = rows.length;
      cache.avg = rows.length ? sum / rows.length : 0;
      cache.unassigned = unN ? { avg: unSum / unN, n: unN } : null;
      cache.ts = Date.now();
    } catch (e) {
      cache.disabled = true;
      cache.ts = Date.now();
    }
    return cache;
  }

  async function load() {
    return fetchCsat();
  }

  setTimeout(function () { load(); }, 2000);
  setInterval(function () { load(); }, 60000);

  window.DRCsatDash = { refresh: load, cache: cache };
})();
