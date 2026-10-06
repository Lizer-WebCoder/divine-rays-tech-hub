/**
 * Divine Rays — Admin Portal lock v6 (no flicker, portal-aware brand)
 * Restores Admin UI; does not rewrite agent-name-display or top-bar role label.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_PORTAL_LOCK >= 6) return;
  window.__DR_ADMIN_PORTAL_LOCK = 6;

  var CDN = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@';
  var PINS = {
    'pending-approved-fix.js': '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1'
  };

  var scriptsLoaded = false;
  function forceLoadAll() {
    if (scriptsLoaded) return;
    scriptsLoaded = true;
    Object.keys(PINS).forEach(function (name) {
      var s = document.createElement('script');
      s.src = CDN + PINS[name] + '/js/' + name + '?lock=6&b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function injectCss() {
    if (document.getElementById('dr-admin-lock-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-admin-lock-css';
    el.textContent = [
      '#portal-agent .sidebar .brand-text p,',
      '#portal-agent .sidebar .brand p.brand-sub,',
      '#portal-agent .sidebar .brand-text .brand-sub{display:none!important}',
      '#agent-name-display .dr-role-pill, #agent-name-display .dr-side-role{',
      'display:inline-block;margin-left:.35rem;padding:.12rem .55rem;border-radius:999px;',
      'font-size:.68rem;font-weight:700;letter-spacing:.02em;vertical-align:middle}',
      '#agent-name-display .dr-role-pill[data-role="developer"], #agent-name-display .dr-side-role.developer{background:rgba(234,179,8,.2);color:#fbbf24;border:1px solid rgba(234,179,8,.45)}',
      '#agent-name-display .dr-role-pill[data-role="admin"], #agent-name-display .dr-side-role.admin{background:rgba(45,212,191,.15);color:#2dd4bf;border:1px solid rgba(45,212,191,.4)}',
      '#agent-name-display .dr-role-pill[data-role="owner"], #agent-name-display .dr-side-role.owner{background:rgba(168,85,247,.18);color:#c084fc;border:1px solid rgba(168,85,247,.4)}',
      '#agent-name-display .dr-role-pill[data-role="it tech support"], #agent-name-display .dr-side-role.agent,',
      '#agent-name-display .dr-role-pill[data-role="agent"]{background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.4)}',
      'body.dr-view-dashboard #ticket-list,',
      'body.dr-view-dashboard #dr-ticket-pager,',
      'body.dr-view-dashboard #dr-list-toolbar,',
      'body.dr-view-dashboard .dr-list-toolbar,',
      'body.dr-view-dashboard h3.stats-heading.dr-recent-label{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function setText(el, next) {
    if (!el) return;
    if ((el.textContent || '').trim() !== next) el.textContent = next;
  }

  function applyBrandAndRole() {
    var h1 = document.querySelector('#portal-agent .sidebar .brand-text h1, #portal-agent .sidebar .brand h1');
    setText(h1, 'Divine Rays Tech Hub');

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
      var brand = 'Divine Rays Tech Hub \u2022 Admin Portal';
      var strong = document.querySelector('.mode-brand strong');
      if (strong) setText(strong, brand);
    } else if (onEnd) {
      var brandEu = 'Divine Rays Tech Hub \u2022 Employees';
      var strongEu = document.querySelector('.mode-brand strong');
      if (strongEu) setText(strongEu, brandEu);
    }

    /* logged-user-label hidden by topbar-actions — role in sidebar */
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
