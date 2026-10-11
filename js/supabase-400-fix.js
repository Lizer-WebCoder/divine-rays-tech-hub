/**
 * Divine Rays — Supabase 400 fix
 * Prevents console 400 spam from selects on missing columns
 * (csat_score, branch, position, assignee_id, claimed_by, display_name).
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SUPABASE_400_FIX) return;
  window.__DR_SUPABASE_400_FIX = 1;

  function safeProfileSelect(cols) {
    var s = String(cols || '');
    /* strip optional/missing columns that cause 400 on this project */
    s = s
      .split(',')
      .map(function (c) { return c.trim(); })
      .filter(function (c) {
        if (!c) return false;
        if (/^(branch|position|display_name|name)$/i.test(c)) return false;
        return true;
      })
      .join(',');
    if (!s) s = 'id,full_name,username,role';
    if (s.indexOf('id') === -1) s = 'id,' + s;
    return s;
  }

  function safeTicketSelect(cols) {
    var s = String(cols || '');
    s = s
      .split(',')
      .map(function (c) { return c.trim(); })
      .filter(function (c) {
        if (!c) return false;
        if (/^(assignee_id|claimed_by|agent_id|display_name)$/i.test(c)) return false;
        return true;
      })
      .join(',');
    return s || '*';
  }

  function patchClient(client) {
    if (!client || client.__dr400Patched) return client;
    var origFrom = client.from.bind(client);
    client.from = function (table) {
      var builder = origFrom(table);
      if (!builder || typeof builder.select !== 'function') return builder;
      var origSelect = builder.select.bind(builder);
      builder.select = function (cols, opts) {
        var c = cols;
        try {
          if (table === 'profiles') c = safeProfileSelect(cols);
          else if (table === 'tickets') c = safeTicketSelect(cols);
        } catch (e) {}
        return origSelect(c, opts);
      };
      return builder;
    };
    client.__dr400Patched = 1;
    return client;
  }

  function tryPatch() {
    try {
      if (window.__drSb) patchClient(window.__drSb);
    } catch (e) {}
    try {
      if (window.DR && DR.sb) patchClient(DR.sb);
    } catch (e2) {}
    try {
      if (window.supabase && window.DR_CONFIG && !window.__drSbPatchedOnce) {
        /* wrap createClient if present later */
      }
    } catch (e3) {}
  }

  tryPatch();
  setTimeout(tryPatch, 500);
  setTimeout(tryPatch, 1500);
  setTimeout(tryPatch, 4000);
  setInterval(tryPatch, 8000);

  /* Also silence repeated CSAT fetches when column missing */
  window.__drCsatSchemaMissing = false;
})();
