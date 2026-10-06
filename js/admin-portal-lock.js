/**
 * Divine Rays — Admin Portal lock v3 (no flicker)
 * Restores Admin UI; updates only when needed; low-frequency poll.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_PORTAL_LOCK >= 3) return;
  window.__DR_ADMIN_PORTAL_LOCK = 3;

  var CDN = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@';
  var PINS = {
    'users-nav.js': 'f87daa9cf712394f08b7c3150b834322e54f1265',
    'sidebar-role-label.js': '44b94a0ad4abfd721e4b09d03a1eda83670d7a87',
    'theme.js': '7ee0f900415b2bb33aaa4e9b212250814b7068eb',
    'topbar-brand-role.js': '7ee0f900415b2bb33aaa4e9b212250814b7068eb',
    'dashboard-no-tickets.js': '9cd76a3ce81dad052eb98af306130ca5c8b70032',
    'pending-approved-fix.js': '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1',
    'force-pending-block.js': 'f3988b77a2f35efc5cd53a040d78a56becb58261',
    'agent-approval-gate.js': '95399ebc6bf10275331a35b96b9b589bf25b6d7b',
    'login-tab-labels.js': '9beff1f929318ca08d9a71a1d4718ec4afebf539'
  };

  var scriptsLoaded = false;
  function forceLoadAll() {
    if (scriptsLoaded) return;
    scriptsLoaded = true;
    Object.keys(PINS).forEach(function (name) {
      var s = document.createElement('script');
      s.src = CDN + PINS[name] + '/js/' + name + '?lock=3&b=' + Date.now();
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
      '#agent-name-display .dr-role-pill{',
      'display:inline-block;margin-left:.35rem;padding:.12rem .55rem;border-radius:999px;',
      'font-size:.68rem;font-weight:700;letter-spacing:.02em;vertical-align:middle}',
      '#agent-name-display .dr-role-pill[data-role="developer"]{background:rgba(234,179,8,.2);color:#fbbf24;border:1px solid rgba(234,179,8,.45)}',
      '#agent-name-display .dr-role-pill[data-role="admin"]{background:rgba(45,212,191,.15);color:#2dd4bf;border:1px solid rgba(45,212,191,.4)}',
      '#agent-name-display .dr-role-pill[data-role="owner"]{background:rgba(168,85,247,.18);color:#c084fc;border:1px solid rgba(168,85,247,.4)}',
      '#agent-name-display .dr-role-pill[data-role="it tech support"],',
      '#agent-name-display .dr-role-pill[data-role="agent"]{background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.4)}',
      'body.dr-view-dashboard #ticket-list,',
      'body.dr-view-dashboard #dr-ticket-pager,',
      'body.dr-view-dashboard #dr-list-toolbar,',
      'body.dr-view-dashboard .dr-list-toolbar,',
      'body.dr-view-dashboard h3.stats-heading.dr-recent-label{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, kirzhianthegreat: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };
  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s] || s.indexOf('kirzhian') === 0;
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

    var brand = 'Divine Rays Tech Hub \u2022 Admin Portal';
    var strong = document.querySelector('.mode-brand strong');
    if (strong) setText(strong, brand);

    var lb = document.getElementById('logged-user-label');
    if (lb) {
      var raw = (lb.textContent || '').trim();
      var name = raw.replace(/\s*\(.*$/, '').trim().split(/\s+/)[0] || 'User';
      var role = isDev(name) || isDev(raw) ? 'Developer' : 'Admin';
      setText(lb, name + ' (' + role + ')');
    }

    var an = document.getElementById('agent-name-display');
    if (an) {
      var sn = an.querySelector('.dr-side-name');
      var rp = an.querySelector('.dr-role-pill');
      var text = (an.textContent || '').trim();
      var sideName = sn
        ? sn.textContent.trim()
        : text.replace(/[·\u00b7\-].*$/, '').trim().split(/\s+/)[0] || text;
      var sideRole = isDev(sideName) ? 'Developer' : 'Admin';
      if (sn && rp) {
        setText(sn, sideName);
        if (rp.textContent !== sideRole) {
          rp.textContent = sideRole;
          rp.setAttribute('data-role', sideRole.toLowerCase());
        }
      } else if (!sn) {
        an.innerHTML =
          '<span class="dr-side-name">' + sideName + '</span> ' +
          '<span class="dr-role-pill" data-role="' + sideRole.toLowerCase() + '">' + sideRole + '</span>';
      }
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
  tick();
  setTimeout(tick, 2500);
  setInterval(tick, 10000);

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
