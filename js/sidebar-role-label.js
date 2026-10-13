/**
 * Divine Rays — Sidebar role label v5
 * Show real role (Admin / Developer / etc). Only exact DEVS forced to Developer.
 * kirzhianthegreat is NOT a forced Developer — uses profile role.
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_ROLE_LABEL >= 5) return;
  window.__DR_SIDEBAR_ROLE_LABEL = 5;

  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };

  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s];
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function profile() {
    try {
      if (window.__drProfile) return window.__drProfile;
      if (window.DR && window.DR.profile) return window.DR.profile;
      if (window.DR && window.DR.user) return window.DR.user;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function roleOf(p) {
    if (!p) return { label: 'Admin', cls: 'admin' };
    var r = String(p.role || p.staff_role || '').toLowerCase().trim();
    var un = String(p.username || p.name || '').toLowerCase().trim();
    if (isDev(un)) return { label: 'Developer', cls: 'developer' };
    if (r === 'developer' || r === 'dev') return { label: 'Developer', cls: 'developer' };
    if (r === 'owner') return { label: 'Owner', cls: 'owner' };
    if (r === 'admin' || r === 'administrator') return { label: 'Admin', cls: 'admin' };
    if (r === 'agent' || r === 'tech' || r === 'tech support' || r === 'support') return { label: 'Tech Support', cls: 'agent' };
    if (r) return { label: r.charAt(0).toUpperCase() + r.slice(1), cls: 'admin' };
    return { label: 'Admin', cls: 'admin' };
  }

  function apply() {
    try {
      var p = profile();
      var info = roleOf(p);
      var name = '';
      if (p) name = p.username || p.full_name || p.name || '';
      document.querySelectorAll('.sidebar-role, .role-badge, [data-role-label], .dr-role-label').forEach(function (el) {
        el.textContent = info.label;
        el.className = (el.className || '').replace(/\b(developer|admin|owner|agent)\b/g, '').trim() + ' ' + info.cls;
      });
      var badge = document.querySelector('.sidebar .role-pill, .sidebar-user-role, #sidebar-role');
      if (badge) {
        badge.textContent = info.label;
        badge.classList.remove('developer', 'admin', 'owner', 'agent');
        badge.classList.add(info.cls);
      }
      /* orange Developer pill in sidebar header */
      document.querySelectorAll('.sidebar .user-meta, .sidebar-profile, .sidebar-user').forEach(function (wrap) {
        var pills = wrap.querySelectorAll('span, .badge, .pill');
        pills.forEach(function (sp) {
          var t = String(sp.textContent || '').trim().toLowerCase();
          if (t === 'developer' || t === 'admin' || t === 'owner' || t === 'tech support') {
            sp.textContent = info.label;
            sp.classList.remove('developer', 'admin');
            sp.classList.add(info.cls);
          }
        });
      });
    } catch (e) {}
  }

  apply();
  setTimeout(apply, 400);
  setTimeout(apply, 1200);
  setInterval(apply, 2000);
  window.DRSidebarRole = { refresh: apply };
})();
