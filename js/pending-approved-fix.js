/**
 * Divine Rays — pending approved fix v2
 * Approved staff never get orange login glow; clears stale localStorage pending marks.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PENDING_APPROVED_FIX >= 2) return;
  window.__DR_PENDING_APPROVED_FIX = 2;

  var KEY = 'dr_staff_approval';
  var DEVS = { kirzhian: 1, kirzhianquijano: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };

  function map() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function markApproved(id, un, em) {
    var m = map();
    if (id) m[id] = 'approved';
    un = un ? String(un).toLowerCase().trim() : '';
    em = em ? String(em).toLowerCase().trim() : '';
    if (un) { m['u:' + un] = 'approved'; delete m['pending:' + un]; }
    if (em) { m['e:' + em] = 'approved'; delete m['pending:' + em]; }
    if (id && m[id] === 'pending') m[id] = 'approved';
    save(m);
  }
  function isDev(n) {
    n = String(n || '').toLowerCase().trim();
    return !!DEVS[n] || n.indexOf('kirzhian') === 0;
  }
  function isApprovedProfile(p, meta) {
    meta = meta || {};
    if (meta.approval_status === 'approved' || meta.approved === true) return true;
    if (!p) return false;
    if (p.approval_status === 'approved' || p.approved === true) return true;
    var st = String(p.approval_status || p.status || '').toLowerCase().trim();
    return st === 'approved' || st === 'active';
  }
  function clearGlow() {
    try {
      document.querySelectorAll('.login-card').forEach(function (c) {
        c.classList.remove('login-pending-glow', 'dr-login-pending', 'login-pending-shake');
      });
      document.body.classList.remove('dr-pending-blocked');
    } catch (e) {}
  }

  (function clearDevPending() {
    var m = map();
    var changed = false;
    Object.keys(DEVS).forEach(function (u) {
      if (m['pending:' + u] === 'pending') { delete m['pending:' + u]; changed = true; }
      m['u:' + u] = 'approved';
    });
    if (changed) save(m);
  })();

  function patch() {
    try {
      if (window.DRForcePending && typeof window.DRForcePending.shouldBlock === 'function' && !window.DRForcePending.__apFix) {
        var prev = window.DRForcePending.shouldBlock;
        window.DRForcePending.shouldBlock = function (user, profile, hint) {
          var meta = (user && user.user_metadata) || {};
          var un = String(meta.username || (profile && profile.username) || hint || '').toLowerCase().trim();
          var em = String((user && user.email) || (profile && profile.email) || '').toLowerCase();
          var id = user && user.id;
          if (isDev(un) || isApprovedProfile(profile, meta)) {
            markApproved(id, un, em);
            clearGlow();
            return false;
          }
          return prev.apply(this, arguments);
        };
        window.DRForcePending.__apFix = 1;
      }
    } catch (e) {}
    try {
      if (window.DRAgentApproval && typeof window.DRAgentApproval.isPending === 'function' && !window.DRAgentApproval.__apFix) {
        var prev2 = window.DRAgentApproval.isPending;
        window.DRAgentApproval.isPending = function (user, profile, hint) {
          var meta = (user && user.user_metadata) || {};
          var un = String(meta.username || (profile && profile.username) || hint || '').toLowerCase().trim();
          var em = String((user && user.email) || (profile && profile.email) || '').toLowerCase();
          var id = user && user.id;
          if (isDev(un) || isApprovedProfile(profile, meta)) {
            markApproved(id, un, em);
            clearGlow();
            return false;
          }
          return prev2.apply(this, arguments);
        };
        window.DRAgentApproval.__apFix = 1;
      }
    } catch (e2) {}
  }

  function wrapShowApp() {
    function wrap(obj, key) {
      if (!obj || typeof obj[key] !== 'function' || obj[key].__apFix) return;
      var prev = obj[key];
      obj[key] = function (p) {
        if (p) {
          var un = String(p.username || '').toLowerCase().trim();
          var em = String(p.email || '').toLowerCase();
          if (isDev(un) || isApprovedProfile(p, {})) {
            markApproved(p.id, un, em);
            clearGlow();
          }
        }
        return prev.apply(this, arguments);
      };
      obj[key].__apFix = 1;
    }
    try { if (window.DR) wrap(window.DR, 'showApp'); } catch (e) {}
    try { wrap(window, 'showApp'); } catch (e2) {}
  }

  async function checkSession() {
    try {
      var client = null;
      if (window.DR && typeof window.DR.sb === 'function') client = window.DR.sb();
      if (!client) return;
      var s = await client.auth.getSession();
      var user = s && s.data && s.data.session && s.data.session.user;
      if (!user) return;
      var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
      var p = pr && pr.data;
      var meta = user.user_metadata || {};
      var un = String(meta.username || (p && p.username) || '').toLowerCase().trim();
      var em = String(user.email || (p && p.email) || '').toLowerCase();
      if (isDev(un) || isApprovedProfile(p, meta)) {
        markApproved(user.id, un, em);
        clearGlow();
      }
    } catch (e) {}
  }

  try {
    var obs = new MutationObserver(function () {
      var inp = document.getElementById('agent-username') || document.getElementById('agent-user');
      var un = inp ? String(inp.value || '').toLowerCase().trim() : '';
      if (isDev(un)) {
        markApproved(null, un, null);
        clearGlow();
      }
      var card = document.querySelector('.login-card.login-pending-glow, .login-card.dr-login-pending');
      if (card && isDev(un)) clearGlow();
    });
    obs.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class'] });
  } catch (e) {}

  function tick() {
    patch();
    wrapShowApp();
  }
  tick();
  setInterval(tick, 1200);
  setTimeout(checkSession, 600);
  setTimeout(checkSession, 2000);
  setTimeout(checkSession, 5000);
})();
