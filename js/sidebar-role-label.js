/**
 * Divine Rays — Sidebar role label + brand v2
 * Real role next to name with colors; brand = Divine Rays Tech Hub; hide Tech Support
 * Does not touch Users Management.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_ROLE_LABEL >= 2) return;
  window.__DR_SIDEBAR_ROLE_LABEL = 2;

  var DEVS = {
    kirzhian: 1,
    kirzhianquijano: 1,
    kirzhianthegreat: 1,
    jamesjerlow123: 1,
    liya: 1
  };

  function injectCss() {
    var el = document.getElementById('dr-sidebar-role-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-sidebar-role-css';
      document.head.appendChild(el);
    }
    el.textContent = [
      '#portal-agent #agent-name-display{',
      '  display:inline-flex!important;align-items:center;gap:0.4rem;flex-wrap:wrap;',
      '  justify-content:center;max-width:100%;line-height:1.25}',
      '#portal-agent #agent-name-display .dr-side-name{font-weight:600;color:inherit}',
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
      '  background:rgba(96,165,250,0.2);color:#60a5fa;border-color:rgba(96,165,250,0.35)}',
      '#portal-agent .sidebar .brand-text h1{',
      '  font-size:0.95rem!important;line-height:1.2!important;white-space:normal!important}',
      '#portal-agent .sidebar .brand-text p,',
      '#portal-agent .sidebar .brand-text .dr-brand-sub{',
      '  display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}'
    ].join('');
  }

  function profile() {
    try {
      if (window.__drProfile) return window.__drProfile;
      if (window.currentProfile) return window.currentProfile;
      if (window.DR && window.DR.profile) return window.DR.profile;
      if (window.DR && window.DR.user) return window.DR.user;
      if (window.DR && window.DR.me) return window.DR.me;
    } catch (e) {}
    return null;
  }

  function isDevUsername(s) {
    s = String(s || '').toLowerCase().trim();
    if (!s) return false;
    if (DEVS[s]) return true;
    if (s.indexOf('kirzhian') === 0) return true;
    return false;
  }

  function resolveRole(p) {
    var un = p ? String(p.username || '').toLowerCase().trim() : '';
    var email = p ? String(p.email || '').toLowerCase().trim() : '';
    var name = p ? String(p.full_name || p.name || '').toLowerCase().trim() : '';

    if (isDevUsername(un) || isDevUsername(email.split('@')[0]) || isDevUsername(name.split(/\s+/)[0])) {
      return { label: 'Developer', cls: 'developer' };
    }

    if (p) {
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
    }

    var el = document.getElementById('agent-name-display');
    var txt = el ? (el.textContent || '') : '';
    var first = txt.replace(/[·\-].*$/, '').trim().split(/\s+/)[0] || '';
    if (isDevUsername(first)) return { label: 'Developer', cls: 'developer' };

    var lb = document.getElementById('logged-user-label');
    var lt = lb ? (lb.textContent || '') : '';
    if (/kirzhian/i.test(lt) || isDevUsername(lt.replace(/\s*\(.*$/, '').trim().split(/\s+/)[0])) {
      return { label: 'Developer', cls: 'developer' };
    }

    return { label: 'Admin', cls: 'admin' };
  }

  function displayName(p) {
    if (p) {
      var n = (p.full_name || p.name || p.username || '').trim();
      if (n) return n.split(/\s+/)[0] || n;
    }
    var el = document.getElementById('agent-name-display');
    if (el) {
      var t = (el.textContent || '').replace(/[·\-].*$/, '').trim();
      if (t && t !== 'Agent') return t.split(/\s+/)[0] || t;
    }
    return 'User';
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyBrand() {
    var h1 = document.querySelector('#portal-agent .sidebar .brand-text h1');
    if (h1 && h1.textContent.trim() !== 'Divine Rays Tech Hub') {
      h1.textContent = 'Divine Rays Tech Hub';
    }
    var sub = document.querySelector('#portal-agent .sidebar .brand-text p');
    if (sub) {
      sub.style.display = 'none';
      sub.textContent = '';
    }
  }

  function applyRole() {
    var el = document.getElementById('agent-name-display');
    if (!el) return;
    var p = profile();
    var role = resolveRole(p);
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

  function tryCaptureProfile() {
    try {
      if (window.DR && window.DR.profile) window.__drProfile = window.DR.profile;
      if (window.currentProfile) window.__drProfile = window.currentProfile;
      if (window.DR && window.DR.me) window.__drProfile = window.DR.me;
    } catch (e) {}
  }

  function hookShowApp() {
    try {
      function wrap(obj, key) {
        if (!obj || typeof obj[key] !== 'function' || obj[key].__drRoleLabel) return;
        var prev = obj[key];
        obj[key] = function (p) {
          if (p) window.__drProfile = p;
          var r = prev.apply(this, arguments);
          setTimeout(tick, 0);
          setTimeout(tick, 300);
          return r;
        };
        obj[key].__drRoleLabel = 1;
      }
      if (window.DR) wrap(window.DR, 'showApp');
      wrap(window, 'showApp');
    } catch (e) {}
  }

  function tick() {
    injectCss();
    tryCaptureProfile();
    hookShowApp();
    applyBrand();
    applyRole();
  }

  tick();
  setInterval(tick, 1000);
  document.addEventListener('DOMContentLoaded', tick);
})();
