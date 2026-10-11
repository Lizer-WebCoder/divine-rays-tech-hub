/**
 * Divine Rays — Supabase 400 fix v2
 * Strips selects for columns that are not on this project's schema
 * so the browser console is not flooded with 400 Bad Request.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SUPABASE_400_FIX >= 2) return;
  window.__DR_SUPABASE_400_FIX = 2;

  /* Columns confirmed missing / optional on this project */
  var DROP_PROFILE = {
    branch: 1,
    position: 1,
    display_name: 1,
    name: 1
  };
  var DROP_TICKET = {
    assignee_id: 1,
    claimed_by: 1,
    agent_id: 1,
    display_name: 1,
    csat_score: 1,
    csat_comment: 1,
    csat_at: 1
  };

  function filterCols(cols, dropMap) {
    var s = String(cols == null ? '*' : cols).trim();
    if (!s || s === '*') return s;
    var parts = s.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var col = parts[i].split(':')[0].split('(')[0].trim();
      if (dropMap[col]) continue;
      out.push(parts[i]);
    }
    if (!out.length) return dropMap === DROP_PROFILE ? 'id,full_name,username' : 'id,title,status,priority,assigned_to';
    return out.join(',');
  }

  function patchClient(client) {
    if (!client || typeof client.from !== 'function' || client.__dr400Patched >= 2) return client;
    var origFrom = client.from.bind(client);
    client.from = function (table) {
      var builder = origFrom(table);
      if (!builder || typeof builder.select !== 'function') return builder;
      var origSelect = builder.select.bind(builder);
      builder.select = function (cols, opts) {
        var c = cols;
        try {
          if (table === 'profiles') c = filterCols(cols, DROP_PROFILE);
          else if (table === 'tickets') c = filterCols(cols, DROP_TICKET);
        } catch (e) {}
        return origSelect(c, opts);
      };
      return builder;
    };
    client.__dr400Patched = 2;
    return client;
  }

  function tryPatch() {
    try { if (window.__drSb) patchClient(window.__drSb); } catch (e) {}
    try { if (window.DR && DR.sb) patchClient(DR.sb); } catch (e2) {}
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function' && !window.supabase.createClient.__dr400) {
        var prev = window.supabase.createClient.bind(window.supabase);
        window.supabase.createClient = function () {
          var c = prev.apply(this, arguments);
          return patchClient(c);
        };
        window.supabase.createClient.__dr400 = 1;
      }
    } catch (e3) {}
  }

  tryPatch();
  setTimeout(tryPatch, 200);
  setTimeout(tryPatch, 800);
  setTimeout(tryPatch, 2000);
  setTimeout(tryPatch, 5000);
  setInterval(tryPatch, 10000);
})();
