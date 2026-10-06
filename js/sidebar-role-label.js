/**
 * Divine Rays — Sidebar role label + brand v3
 * Force Developer role, Divine Rays Tech Hub brand, hide TECH SUPPORT
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SIDEBAR_ROLE_LABEL >= 3) return;
  window.__DR_SIDEBAR_ROLE_LABEL = 3;

  var DEVS = {
    kirzhian: 1,
    kirzhianquijano: 1,
    kirzhianthegreat: 1,
    jamesjerlow123: 1,
    liya: 1
  };

  function css() {
    var el = document.getElementById('dr-sidebar-role-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-sidebar-role-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#portal-agent #agent-name-display{display:inline-flex!important;align-items:center;gap:0.4rem;flex-wrap:wrap;justify-content:center;max-width:100%;line-height:1.25}',
      '#portal-agent #agent-name-display .dr-side-name{font-weight:600;color:inherit}',
      '#portal-agent #agent-name-display .dr-side-role{display:inline-flex;align-items:center;padding:0.12rem 0.45rem;border-radius:999px;font-size:0.68rem;font-weight:700;letter-spacing:0.02em;line-height:1.2;border:1px solid transparent;white-space:nowrap}',
      '#portal-agent #agent-name-display .dr-side-role.developer{background:rgba(251,191,36,0.2)!important;color:#fbbf24!important;border-color:rgba(251,191,36,0.4)!important}',
      '#portal-agent #agent-name-display .dr-side-role.admin{background:rgba(45,212,191,0.22)!important;color:#2dd4bf!important;border-color:rgba(45,212,191,0.4)!important}',
      '#portal-agent #agent-name-display .dr-side-role.owner{background:rgba(244,114,182,0.22)!important;color:#f472b6!important;border-color:rgba(244,114,182,0.4)!important}',
      '#portal-agent #agent-name-display .dr-side-role.it-tech,#portal-agent #agent-name-display .dr-side-role.agent{background:rgba(167,139,250,0.22)!important;color:#c4b5fd!important;border-color:rgba(167,139,250,0.4)!important}',
      '#portal-agent .sidebar .brand-text h1{font-size:0.92rem!important;line-height:1.2!important;white-space:normal!important}',
      '#portal-agent .sidebar .brand-text p{display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;font-size:0!important;opacity:0!important}'
    ].join('');
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    if (!s) return false;
    if (DEVS[s]) return true;
    return s.indexOf('kirzhian') === 0;
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

  function roleOf(p) {
    var un = p ? String(p.username || '').toLowerCase().trim() : '';
    var email = p ? String(p.email || '').toLowerCase().trim() : '';
    var nm = p ? String(p.full_name || p.name || '').toLowerCase().trim() : '';
    if (isDev(un) || isDev(email.split('@')[0]) || isDev(nm.split(/\s+/)[0])) {
      return { label: 'Developer', cls: 'developer' };
    }
    if (p) {
      var staff = String(p.staff_role || p.job_title || '').trim();
      if (staff) {
        var sl = staff.toLowerCase();
        if (/developer|dev/.test(sl)) return { label: 'Developer', cls: 'developer' };
        if (sl === 'owner') return { label: 'Owner', cls: 'owner' };
        if (/admin/.test(sl) && !/tech/.test(sl)) return { label: 'Admin', cls: 'admin' };
        if (/tech support|agent/.test(sl)) return { label: /tech support/i.test(staff) ? staff : 'IT Tech Support', cls: 'it-tech' };
        return { label: staff, cls: 'agent' };
      }
      var r = String(p.role || '').toLowerCase().trim();
      if (r === 'developer' || r === 'dev') return { label: 'Developer', cls: 'developer' };
      if (r === 'owner') return { label: 'Owner', cls: 'owner' };
      if (r === 'admin') return { label: 'Admin', cls: 'admin' };
      if (r === 'agent' || r === 'staff') return { label: 'IT Tech Support', cls: 'it-tech' };
    }
    var el = document.getElementById('agent-name-display');
    var txt = el ? (el.textContent || '') : '';
    var first = txt.replace(/[·\u00b7\-].*$/, '').trim().split(/\s+/)[0] || '';
    if (isDev(first)) return { label: 'Developer', cls: 'developer' };
    var lb = document.getElementById('logged-user-label');
    if (lb && /kirzhian/i.test(lb.textContent || '')) return { label: 'Developer', cls: 'developer' };
    return { label: 'Admin', cls: 'admin' };
  }

  function nameOf(p) {
    if (p) {
      var n = (p.full_name || p.name || p.username || '').trim();
      if (n) return n.split(/\s+/)[0];
    }
    var el = document.getElementById('agent-name-display');
    if (el) {
      var span = el.querySelector('.dr-side-name');
      if (span) return span.textContent.trim();
      var t = (el.textContent || '').replace(/[·\u00b7\-].*$/, '').trim();
      if (t && t !== 'Agent') return t.split(/\s+/)[0];
    }
    return 'User';
  }

  function applyBrand() {
    var h1 = document.querySelector('#portal-agent .sidebar .brand-text h1, #portal-agent .brand-text h1');
    if (h1 && h1.textContent.trim() !== 'Divine Rays Tech Hub') {
      h1.textContent = 'Divine Rays Tech Hub';
    }
    document.querySelectorAll('#portal-agent .sidebar .brand-text p, #portal-agent .brand-text p').forEach(function (p) {
      p.style.setProperty('display', 'none', 'important');
      p.textContent = '';
    });
  }

  function applyRole() {
    var el = document.getElementById('agent-name-display');
    if (!el) return;
    var p = profile();
    var role = roleOf(p);
    var name = nameOf(p);
    if (isDev(name)) role = { label: 'Developer', cls: 'developer' };
    var key = name + '|' + role.label;
    if (el.getAttribute('data-dr-role-key') === key && el.querySelector('.dr-side-role')) return;
    el.setAttribute('data-dr-role-key', key);
    el.innerHTML =
      '<span class="dr-side-name">' + esc(name) + '</span>' +
      '<span class="dr-side-role ' + esc(role.cls) + '">' + esc(role.label) + '</span>';
  }

  function capture() {
    try {
      if (window.DR && window.DR.profile) window.__drProfile = window.DR.profile;
      if (window.currentProfile) window.__drProfile = window.currentProfile;
    } catch (e) {}
  }

  function hook() {
    try {
      function wrap(obj, k) {
        if (!obj || typeof obj[k] !== 'function' || obj[k].__drRL3) return;
        var prev = obj[k];
        obj[k] = function (p) {
          if (p) window.__drProfile = p;
          var r = prev.apply(this, arguments);
          setTimeout(tick, 0);
          setTimeout(tick, 250);
          return r;
        };
        obj[k].__drRL3 = 1;
      }
      if (window.DR) wrap(window.DR, 'showApp');
      wrap(window, 'showApp');
    } catch (e) {}
  }

  function tick() {
    css();
    capture();
    hook();
    applyBrand();
    applyRole();
  }

  tick();
  setInterval(tick, 800);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
  try {
    var obs = new MutationObserver(function () {
      applyBrand();
      applyRole();
    });
    function watch() {
      var side = document.querySelector('#portal-agent .sidebar');
      if (side && !side.__drRoleObs) {
        side.__drRoleObs = 1;
        obs.observe(side, { childList: true, subtree: true, characterData: true });
      }
    }
    watch();
    setInterval(watch, 2000);
  } catch (e) {}
})();
