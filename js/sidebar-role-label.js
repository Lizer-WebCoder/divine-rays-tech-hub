/**
 * Divine Rays — Sidebar role label v6
 * Show real role (Admin / Developer / etc). Only exact DEVS forced to Developer.
 * Developers (2 only): kirzhianquijano, iiyasora2002
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_ROLE_LABEL >= 6) return;
  window.__DR_SIDEBAR_ROLE_LABEL = 6;

  var DEVS = { kirzhianquijano: 1, iiyasora2002: 1 };
  var DEV_EMAILS = { 'kirzhianquijano@gmail.com': 1, 'iiyasora2002@gmail.com': 1 };

  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    if (DEVS[s] || DEV_EMAILS[s]) return true;
    return false;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function profile() {
    try {
      if (window.__drProfile) return window.__drProfile;
      if (window.DR && window.DR.currentProfile) return window.DR.currentProfile;
    } catch (e) {}
    return null;
  }

  function roleText(p) {
    if (!p) return '';
    var un = String(p.username || '').toLowerCase().trim();
    var em = String(p.email || '').toLowerCase().trim();
    if (isDev(un) || isDev(em)) return 'Developer';
    var staff = p.staff_role || p.job_title || '';
    if (staff) return String(staff);
    var r = String(p.role || '').toLowerCase();
    if (r === 'admin' || r === 'administrator') return 'Admin';
    if (r === 'agent' || r === 'tech support' || r === 'techsupport') return 'IT Tech Support';
    if (r === 'developer' || r === 'dev') return 'Developer';
    if (r === 'owner') return 'Owner';
    if (r === 'customer' || r === 'user' || r === 'end-user' || r === 'employee') return 'Employee';
    return p.role || '';
  }

  function apply() {
    var p = profile();
    var label = roleText(p);
    if (!label) return;
    var nodes = document.querySelectorAll(
      '.dr-role-label, #agent-role-label, [data-role-label], .sidebar-role, .user-role-badge'
    );
    nodes.forEach(function (el) {
      if (el.textContent !== label) el.textContent = label;
      if (label === 'Developer') {
        el.classList.add('badge-role-developer');
      }
    });
  }

  apply();
  setInterval(apply, 2000);
  window.DRSidebarRoleLabel = { refresh: apply, v: 6 };
})();
