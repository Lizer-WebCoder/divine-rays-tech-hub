/**
 * Divine Rays — top bar brand + role label; suppress theme toasts
 * Brand: Divine Rays Tech Hub • Admin Portal
 * User: Name (Role) e.g. Kirzhian (Developer)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_BRAND_ROLE >= 1) return;
  window.__DR_TOPBAR_BRAND_ROLE = 1;

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, kirzhianthegreat: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };
  var BRAND = 'Divine Rays Tech Hub \u2022 Admin Portal';

  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s] || s.indexOf('kirzhian') === 0;
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
    if (!p) p = {};
    var un = String(p.username || '').toLowerCase().trim();
    var name = String(p.full_name || p.name || '').toLowerCase().trim();
    if (isDev(un) || isDev(name.split(/\s+/)[0])) return 'Developer';
    var staff = String(p.staff_role || p.job_title || '').trim();
    if (staff) {
      var sl = staff.toLowerCase();
      if (/developer|dev/.test(sl)) return 'Developer';
      if (sl === 'owner') return 'Owner';
      if (/admin/.test(sl) && !/tech/.test(sl)) return 'Admin';
      if (/tech support|agent/.test(sl)) return /tech support/i.test(staff) ? staff : 'IT Tech Support';
      return staff;
    }
    var r = String(p.role || '').toLowerCase().trim();
    if (r === 'developer' || r === 'dev') return 'Developer';
    if (r === 'owner') return 'Owner';
    if (r === 'admin' || r === 'administrator') return 'Admin';
    if (r === 'agent' || r === 'staff') return 'IT Tech Support';
    if (r === 'customer' || r === 'end-user' || r === 'enduser') return 'Employee';
    var lb = document.getElementById('logged-user-label');
    var first = lb ? (lb.textContent || '').replace(/\s*\(.*$/, '').trim().split(/\s+/)[0] : '';
    if (isDev(first)) return 'Developer';
    var an = document.getElementById('agent-name-display');
    var af = an ? (an.textContent || '').replace(/[·\u00b7\-].*$/, '').trim().split(/\s+/)[0] : '';
    if (isDev(af)) return 'Developer';
    return 'Admin';
  }

  function displayName(p) {
    if (p) {
      var n = (p.full_name || p.name || p.username || '').trim();
      if (n) return n.split(/\s+/)[0] || n;
    }
    var lb = document.getElementById('logged-user-label');
    if (lb) {
      var t = (lb.textContent || '').replace(/\s*\(.*$/, '').trim();
      if (t) return t.split(/\s+/)[0] || t;
    }
    var an = document.getElementById('agent-name-display');
    if (an) {
      var span = an.querySelector('.dr-side-name');
      if (span) return span.textContent.trim();
      var t2 = (an.textContent || '').replace(/[·\u00b7\-].*$/, '').trim();
      if (t2) return t2.split(/\s+/)[0];
    }
    return 'User';
  }

  function applyBrand() {
    var strong = document.querySelector('.mode-brand strong');
    if (strong) {
      if (strong.textContent.trim() !== BRAND) strong.textContent = BRAND;
      return;
    }
    var brand = document.querySelector('.mode-brand');
    if (!brand) return;
    var nodes = Array.prototype.slice.call(brand.childNodes);
    nodes.forEach(function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) {
        n.textContent = BRAND;
      }
    });
  }

  function applyUserLabel() {
    var lb = document.getElementById('logged-user-label');
    if (!lb) return;
    var p = profile();
    var name = displayName(p);
    var role = resolveRole(p);
    var next = name + ' (' + role + ')';
    if (lb.textContent.trim() !== next) lb.textContent = next;
  }

  function suppressThemeToasts() {
    try {
      if (window.DR && typeof window.DR.toast === 'function' && !window.DR.toast.__drNoThemeToast) {
        var prev = window.DR.toast;
        window.DR.toast = function (msg, type) {
          var m = String(msg || '');
          if (/^Light mode$/i.test(m) || /^Dark mode$/i.test(m)) return;
          return prev.apply(this, arguments);
        };
        window.DR.toast.__drNoThemeToast = 1;
      }
    } catch (e) {}
    try {
      document.querySelectorAll('.toast').forEach(function (el) {
        var t = (el.textContent || '').trim();
        if (t === 'Light mode' || t === 'Dark mode') {
          if (el.parentNode) el.parentNode.removeChild(el);
        }
      });
    } catch (e2) {}
  }

  function tick() {
    suppressThemeToasts();
    applyBrand();
    applyUserLabel();
  }

  tick();
  setInterval(tick, 1000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
