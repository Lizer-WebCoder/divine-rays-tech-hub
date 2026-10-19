/**
 * Divine Rays — topbar-layout v1
 * Sticky top bar; hide Theme + Compact + Profile text btn;
 * Username (Role) is clickable and opens Profile.
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_LAYOUT >= 1) return;
  window.__DR_TOPBAR_LAYOUT = 1;

  var CSS_ID = 'dr-topbar-layout-css';
  var NAME_ID = 'dr-topbar-user-btn';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.is-portal .mode-bar, body.dr-portal-ok .mode-bar,',
      'body:has(#portal-agent.active) .mode-bar, body:has(#portal-customer.active) .mode-bar,',
      '.mode-bar{',
      'position:fixed!important;top:0!important;left:0!important;right:0!important;',
      'width:100%!important;z-index:12000!important;',
      'display:flex!important;align-items:center!important;justify-content:space-between!important;',
      'padding:0.55rem 1.25rem!important;box-sizing:border-box!important;',
      'background:rgba(18,16,28,0.96)!important;backdrop-filter:blur(10px);',
      'border-bottom:1px solid rgba(46,46,66,0.95)!important;',
      'box-shadow:0 4px 18px rgba(0,0,0,0.28)!important}',

      'body.is-portal, body.dr-portal-ok{padding-top:52px!important}',
      '#portal-agent.active, #portal-customer.active{padding-top:0}',

      '#btn-theme, button#btn-theme, [data-theme-toggle],',
      '#btn-density, button#btn-density,',
      '#btn-profile, #btn-my-profile, .mode-bar .dr-topbar-btn#btn-profile{',
      'display:none!important;visibility:hidden!important;pointer-events:none!important;',
      'width:0!important;height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important}',

      '#' + NAME_ID + '{',
      'display:inline-flex!important;align-items:center!important;gap:0.35rem!important;',
      'padding:0.35rem 0.85rem!important;border-radius:8px!important;',
      'font-size:0.82rem!important;font-weight:600!important;line-height:1.2!important;',
      'cursor:pointer!important;border:1px solid rgba(124,106,240,0.35)!important;',
      'background:rgba(124,106,240,0.12)!important;color:#c4b5fd!important;',
      'text-decoration:none!important;visibility:visible!important;opacity:1!important;',
      'pointer-events:auto!important;transition:background .15s ease,border-color .15s ease,color .15s ease}',
      '#' + NAME_ID + ':hover{',
      'background:rgba(124,106,240,0.22)!important;border-color:rgba(124,106,240,0.55)!important;color:#e9e5ff!important}',

      '#logged-user-label{display:none!important}',

      '.mode-bar .user-info{display:flex!important;align-items:center!important;gap:0.45rem!important;flex-wrap:nowrap!important}'
    ].join('');
  }

  function prettyName(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    if (s.indexOf('@') !== -1) s = s.split('@')[0];
    s = s.replace(/[._-]+/g, ' ');
    return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function roleLabel(p) {
    if (!p) return '';
    try {
      var em = String(p.email || '').toLowerCase();
      var un = String(p.username || '').toLowerCase();
      if (
        em === 'kirzhianquijano@gmail.com' ||
        em === 'iiyasora2002@gmail.com' ||
        un === 'kirzhianquijano' ||
        un === 'iiyasora2002'
      ) {
        return 'Developer';
      }
    } catch (e) {}
    var staff = String(p.staff_role || p.job_title || '').trim();
    if (staff) return staff;
    var r = String(p.role || '').toLowerCase().trim();
    if (r === 'admin' || r === 'administrator') return 'Admin';
    if (r === 'agent' || r === 'staff') return 'Admin';
    if (r === 'it' || r === 'it tech support' || r === 'tech support') return 'IT Tech Support';
    if (
      r === 'customer' ||
      r === 'employee' ||
      r === 'user' ||
      r === 'enduser' ||
      r === 'end-user'
    ) {
      return staff || 'Employee';
    }
    if (r) return r.charAt(0).toUpperCase() + r.slice(1);
    return '';
  }

  function displayLabel() {
    var p = window.__drProfile || {};
    var name =
      prettyName(p.full_name || p.name || p.username || '') ||
      prettyName(p.email || '') ||
      'User';
    var role = roleLabel(p);
    return role ? name + ' (' + role + ')' : name;
  }

  function openProfile() {
    try {
      if (window.DRProfile && typeof window.DRProfile.open === 'function') {
        window.DRProfile.open({ readOnly: false });
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.openProfile === 'function') {
        window.openProfile({ readOnly: false });
        return;
      }
    } catch (e2) {}
    try {
      var nav = document.querySelector(
        '[data-view="profile"], #nav-profile, button[data-nav="profile"], .nav-btn[data-view="profile"]'
      );
      if (nav) {
        nav.click();
        return;
      }
    } catch (e3) {}
    try {
      var view = document.getElementById('view-profile');
      if (view) {
        document.querySelectorAll('.view').forEach(function (v) {
          v.classList.remove('active');
          v.style.display = 'none';
        });
        view.classList.add('active');
        view.style.display = '';
      }
    } catch (e4) {}
  }

  function ensureUserBtn() {
    var info = document.querySelector('.mode-bar .user-info');
    if (!info) return;
    var btn = document.getElementById(NAME_ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = NAME_ID;
      btn.setAttribute('aria-label', 'Open profile');
      btn.title = 'Open profile';
      var logout = document.getElementById('btn-logout');
      if (logout && logout.parentNode === info) info.insertBefore(btn, logout);
      else info.appendChild(btn);
      btn.addEventListener('click', function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        openProfile();
      });
    }
    var next = displayLabel();
    if ((btn.textContent || '').trim() !== next) btn.textContent = next;
  }

  function hideUnwanted() {
    ['btn-theme', 'btn-density', 'btn-profile', 'btn-my-profile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.setProperty('display', 'none', 'important');
      el.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (el) {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  function markPortalBody() {
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      var on =
        (pa && pa.classList.contains('active')) ||
        (pc && pc.classList.contains('active')) ||
        document.body.classList.contains('dr-portal-ok');
      if (on) {
        document.body.classList.add('is-portal');
        document.body.classList.remove('is-login');
      }
    } catch (e) {}
  }

  function tick() {
    injectCss();
    markPortalBody();
    hideUnwanted();
    ensureUserBtn();
  }

  tick();
  var n = 0;
  var fast = setInterval(function () {
    tick();
    n += 1;
    if (n > 60) clearInterval(fast);
  }, 120);
  setInterval(tick, 3000);

  document.addEventListener(
    'click',
    function (e) {
      if (e.target && e.target.closest && e.target.closest('.mode-bar, .nav-btn, .sidebar')) {
        setTimeout(tick, 60);
      }
    },
    true
  );

  window.DRTopbarLayout = { v: 1, refresh: tick, openProfile: openProfile };
})();
