/**
 * Divine Rays — Admin Portal lock v19 — sidebar profile layout
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_PORTAL_LOCK >= 19) return;
  window.__DR_ADMIN_PORTAL_LOCK = 19;

  var CDN = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@';
  var FILTERS_SHA = 'd76969f7e13ff322fb8b37fb061a1bfed8fc8c20';
  var PRIORITY_FORCE_SHA = '1a8c72424c7698af6fc25ecf8e2c5476e864d906';
  var PRIORITY_SHA = '7f3c726173a05a238a628ee3a6a7f22c7008cc3c';
  var SUPA_400_SHA = '39e8c69ab7c04cb4900cc40992419ecffb482735';
  var CSAT_DASH_SHA = '0c8e40f8342306007a98e1751531db063af37e48';
  var TICKET_STABLE_SHA = 'd987fd7a6e51a612230c882e1da3138486010593';
  var AVATAR_SHA = '51facff11f44ff41c897107bad8583c6f9d5f3bf';
  var TICKET_CSS_SHA = '4326d1ddf5e9a5628834aa36f87999d7e0a4b87a';
  var TICKET_RENDER_SHA = '895cb8b253e0fab3ad79e2d06fa06f30feded687';
  var SIDEBAR_PROFILE_SHA = '545afd29cbaede602653f78631d8c97ce7558683';
  var PINS = {
    'supabase-400-fix.js': SUPA_400_SHA,
    'ticket-stable.js': TICKET_STABLE_SHA,
    'ticket-card-css.js': TICKET_CSS_SHA,
    'ticket-card-render.js': TICKET_RENDER_SHA,
    'avatar-fix.js': AVATAR_SHA,
    'sidebar-profile-layout.js': SIDEBAR_PROFILE_SHA,
    'priority-force.js': PRIORITY_FORCE_SHA,
    'filters.js': FILTERS_SHA,
    'priority-p1-display.js': PRIORITY_SHA,
    'csat-dashboard.js': CSAT_DASH_SHA,
    'pending-approved-fix.js': '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1',
    'filters-toolbar-fix.js': '45f63dc9924d354f246b3cc18d6f0cb0459a9997'
  };

  var scriptsLoaded = false;
  function forceLoadAll() {
    if (scriptsLoaded) return;
    scriptsLoaded = true;
    Object.keys(PINS).forEach(function (name) {
      var s = document.createElement('script');
      s.src = CDN + PINS[name] + '/js/' + name + '?lock=19&b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function ensureBound() {
    try {
      if (!window.__DR_SIDEBAR_PROFILE_LAYOUT) {
        var sP = document.createElement('script');
        sP.src = CDN + SIDEBAR_PROFILE_SHA + '/js/sidebar-profile-layout.js?lock=19r&b=' + Date.now();
        sP.async = false;
        (document.head || document.documentElement).appendChild(sP);
      }
      if (!window.__DR_AVATAR_FIX_V3) {
        var sA = document.createElement('script');
        sA.src = CDN + AVATAR_SHA + '/js/avatar-fix.js?lock=19r&b=' + Date.now();
        sA.async = false;
        (document.head || document.documentElement).appendChild(sA);
      }
      if (!window.__DR_TICKET_CARD_RENDER || window.__DR_TICKET_CARD_RENDER < 3) {
        var sR = document.createElement('script');
        sR.src = CDN + TICKET_RENDER_SHA + '/js/ticket-card-render.js?lock=19r&b=' + Date.now();
        sR.async = false;
        (document.head || document.documentElement).appendChild(sR);
      }
      if (!window.__DR_FILTERS_V18) {
        var s = document.createElement('script');
        s.src = CDN + FILTERS_SHA + '/js/filters.js?lock=19r&b=' + Date.now();
        s.async = false;
        (document.head || document.documentElement).appendChild(s);
      }
    } catch (e) {}
  }

  function injectCss() {
    var _old = document.getElementById('dr-admin-lock-css');
    if (_old) _old.remove();
    var el = document.createElement('style');
    el.id = 'dr-admin-lock-css';
    el.textContent = [
      '#portal-agent .sidebar .brand-text p,',
      '#portal-agent .sidebar .brand p.brand-sub,',
      '#portal-agent .sidebar .brand-text .brand-sub{display:none!important}',
      '#sidebar-avatar-chip{display:none!important}',
      '#portal-agent .sidebar .profile{position:relative!important;padding-bottom:0.35rem!important;margin-bottom:0.15rem!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function setText(el, text) {
    if (!el) return;
    if ((el.textContent || '').trim() !== text) el.textContent = text;
  }

  function applyBrandAndRole() {
    document.querySelectorAll('#portal-agent .sidebar .brand-text p, #portal-agent .sidebar .brand p').forEach(function (p) {
      var t = (p.textContent || '').trim().toUpperCase();
      if (t.indexOf('TECH SUPPORT') !== -1 || t === 'TECHSUPPORT') {
        if (p.style.display !== 'none') p.style.display = 'none';
      }
    });
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    var onAdmin = pa && pa.classList.contains('active');
    var onEnd = pc && pc.classList.contains('active');
    if (onAdmin && !onEnd) {
      var strong = document.querySelector('.mode-brand strong');
      if (strong) setText(strong, 'Divine Rays Tech Hub \u2022 Admin Portal');
    } else if (onEnd) {
      var strongEu = document.querySelector('.mode-brand strong');
      if (strongEu) setText(strongEu, 'Divine Rays Tech Hub \u2022 Employees');
    }
  }

  function markDashboard() {
    var nav = document.querySelector('#portal-agent .nav-btn.active');
    var isDash = false;
    if (nav) {
      var v = (nav.getAttribute('data-view') || '').toLowerCase();
      var t = (nav.textContent || '').trim().toLowerCase();
      isDash = v === 'dashboard' || t === 'dashboard';
      if (/my ticket|unassigned|all ticket|users|knowledge|admin/.test(t) && t !== 'dashboard') isDash = false;
    }
    var on = document.body.classList.contains('dr-view-dashboard');
    if (isDash !== on) document.body.classList.toggle('dr-view-dashboard', isDash);
    if (isDash) {
      var list = document.getElementById('ticket-list');
      if (list && list.style.display !== 'none') list.style.setProperty('display', 'none', 'important');
    }
  }

  function suppressThemeToasts() {
    try {
      if (window.DR && typeof window.DR.toast === 'function' && !window.DR.toast.__drNoThemeToast) {
        var prev = window.DR.toast;
        window.DR.toast = function (msg) {
          var m = String(msg || '');
          if (/^Light mode$/i.test(m) || /^Dark mode$/i.test(m)) return;
          return prev.apply(this, arguments);
        };
        window.DR.toast.__drNoThemeToast = 1;
      }
    } catch (e) {}
  }

  function tick() {
    injectCss();
    applyBrandAndRole();
    markDashboard();
    suppressThemeToasts();
  }

  forceLoadAll();
  setTimeout(ensureBound, 500);
  setTimeout(ensureBound, 1800);
  setTimeout(ensureBound, 4000);
  tick();
  setTimeout(tick, 2000);
  setInterval(tick, 30000);

  document.addEventListener(
    'click',
    function (e) {
      if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
        setTimeout(tick, 80);
      }
    },
    true
  );
})();
