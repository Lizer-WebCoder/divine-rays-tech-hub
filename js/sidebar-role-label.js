/**
 * Divine Rays — Sidebar role label
 * Shows real Admin role next to name (Developer, Admin, IT Tech Support, Owner)
 * with role colors. Does not touch Users Management.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_ROLE_LABEL >= 1) return;
  window.__DR_SIDEBAR_ROLE_LABEL = 1;

  var DEVS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };

  function injectCss() {
    if (document.getElementById('dr-sidebar-role-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-sidebar-role-css';
    el.textContent = [
      '#portal-agent #agent-name-display{',
      '  display:inline-flex!important;align-items:center;gap:0.4rem;flex-wrap:wrap;',
      '  justify-content:center;max-width:100%;line-height:1.25}',
      '#portal-agent #agent-name-display .dr-side-name{',
      '  font-weight:600;color:inherit}',
      '#portal-agent #agent-name-display .dr-side-role{',
      '  display:inline-flex;align-items:center;padding:0.12rem 0.45rem;',
      '  border-radius:999px;font-size:0.68rem;font-weight:700;',
      '  letter-spacing:0.02em;line-height:1.2;border:1px solid transparent;',
      '  white-space:nowrap}',
      '#portal-agent #agent-name-display .dr-side-role.developer{',
      '  background:rgba(251,191,36,0.2);color:#fbbf24;border-color:rgba(251,191,36,0.4)}',
      '#portal-agent #agent-name-display .dr-side-role.admin{',
      '  background:rgba(45,212,191,0.22);color:#2dd4bf;border-color:rgba(45,212,191,0.4)}',
      '#portal-agent #agent-name-display .dr-side-role.owner{',
      '  background:rgba(244,114,182,0.22);color:#f472b6;border-color:rgba(244,114,182,0.4)}',
      '#portal-agent #agent-name-display .dr-side-role.agent,',
      '#portal-agent #agent-name-display .dr-side-role.it-tech{',
      '  background:rgba(167,139,250,0.22);color:#c4b5fd;border-color:rgba(167,139,250,0.4)}',
      '#portal-agent #agent-name-display .dr-side-role.customer{',
      '  background:rgba(96,165,250,0.2);color:#60a5fa;border-color:rgba(96,165,250,0.35)}'
    ].join('');
    document.head.appendChild(el);
  }

  function profile() {
    try {
      if (window.__drProfile) return window.__drProfile;
      if (window.currentProfile) return window.currentProfile;
      if (window.DR && window.DR.profile) return window.DR.profile;
      if (window.DR && window.DR.user) return window.DR.user;
    } catch (e) {}
    return null;
  }

  function resolveRole(p) {
    if (!p) return null;
    var un = String(p.username || '').toLowerCase().trim();
    if (DEVS[un]) return { label: 'Developer', cls: 'developer' };

    var staff = String(p.staff_role || p.job_title || '').trim();
    if (staff) {
      var sl = staff.toLowerCase();
      if (sl === 'developer' || sl === 'dev') return { label: 'Developer', cls: 'developer' };
      if (sl === 'owner') return { label: 'Owner', cls: 'owner' };
      if (sl === 'admin' || sl === 'administrator') return { label: 'Admin', cls: 'admin' };
      if (sl.indexOf('tech support') !== -1 || sl === 'it tech support' || sl === 'agent') {
        return { label: /tech support/i.test(staff) ? staff : 'IT Tech Support', cls: 'it-tech' };
      }
      if (sl !== 'agent' && sl !== 'developer') {
        var cls = 'agent';
        if (/owner/i.test(staff)) cls = 'owner';
        else if (/admin/i.test(staff) && !/tech/i.test(staff)) cls = 'admin';
        else if (/developer/i.test(staff)) cls = 'developer';
        return { label: staff, cls: cls };
      }
    }

    var r = String(p.role || '').toLowerCase().trim();
    if (r === 'developer' || r === 'dev') return { label: 'Developer', cls: 'developer' };
    if (r === 'owner') return { label: 'Owner', cls: 'owner' };
    if (r === 'admin' || r === 'administrator') return { label: 'Admin', cls: 'admin' };
    if (r === 'agent' || r === 'staff') return { label: 'IT Tech Support', cls: 'it-tech' };
    if (r === 'customer' || r === 'end-user' || r === 'enduser') return { label: 'Employee', cls: 'customer' };
    if (r) return { label: r.charAt(0).toUpperCase() + r.slice(1), cls: 'agent' };
    return { label: 'Admin', cls: 'admin' };
  }

  function displayName(p) {
    if (!p) return '';
    var n = (p.full_name || p.name || p.username || '').trim();
    if (n) {
      var first = n.split(/\s+/)[0];
      return first || n;
    }
    return 'User';
  }

  function apply() {
    injectCss();
    var el = document.getElementById('agent-name-display');
    if (!el) return;
    var p = profile();
    if (!p) return;
    var role = resolveRole(p);
    if (!role) return;
    var name = displayName(p);
    var key = name + '|' + role.label;
    if (el.getAttribute('data-dr-role-key') === key) return;
    el.setAttribute('data-dr-role-key', key);
    el.innerHTML =
      '<span class="dr-side-name">' +
      escapeHtml(name) +
      '</span><span class="dr-side-role ' +
      escapeHtml(role.cls) +
      '">' +
      escapeHtml(role.label) +
      '</span>';
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tryCaptureProfile() {
    try {
      if (window.DR && window.DR.profile) window.__drProfile = window.DR.profile;
      if (window.currentProfile) window.__drProfile = window.currentProfile;
    } catch (e) {}
  }

  function hookShowApp() {
    try {
      if (window.DR && typeof window.DR.showApp === 'function' && !window.DR.showApp.__drRoleLabel) {
        var prev = window.DR.showApp;
        window.DR.showApp = function (p) {
          if (p) window.__drProfile = p;
          var r = prev.apply(this, arguments);
          setTimeout(apply, 0);
          setTimeout(apply, 200);
          return r;
        };
        window.DR.showApp.__drRoleLabel = 1;
      }
      if (typeof window.showApp === 'function' && !window.showApp.__drRoleLabel) {
        var prev2 = window.showApp;
        window.showApp = function (p) {
          if (p) window.__drProfile = p;
          var r = prev2.apply(this, arguments);
          setTimeout(apply, 0);
          setTimeout(apply, 200);
          return r;
        };
        window.showApp.__drRoleLabel = 1;
      }
    } catch (e) {}
  }

  function tick() {
    tryCaptureProfile();
    hookShowApp();
    apply();
  }

  tick();
  setInterval(tick, 1500);
  document.addEventListener('DOMContentLoaded', tick);
})();
