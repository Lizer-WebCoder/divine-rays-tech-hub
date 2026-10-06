/**
 * Divine Rays — Top bar actions polish
 * - Hide User (Role) label (role is in sidebar)
 * - Ensure Profile + Logout are proper buttons
 * - Logout: red outline / red text
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_ACTIONS >= 1) return;
  window.__DR_TOPBAR_ACTIONS = 1;

  function injectCss() {
    if (document.getElementById('dr-topbar-actions-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-topbar-actions-css';
    el.textContent = [
      '.mode-bar #logged-user-label, .user-info #logged-user-label{',
      'display:none!important;visibility:hidden!important;width:0!important;height:0!important;',
      'overflow:hidden!important;margin:0!important;padding:0!important}',

      '.mode-bar .user-info{display:flex!important;align-items:center!important;gap:0.45rem!important;flex-wrap:wrap}',

      '.mode-bar .dr-topbar-btn, .mode-bar #btn-theme, .mode-bar #btn-profile, .mode-bar #btn-logout{',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'padding:0.35rem 0.85rem!important;border-radius:8px!important;font-size:0.82rem!important;',
      'font-weight:600!important;cursor:pointer!important;line-height:1.2!important;',
      'border:1px solid transparent!important;text-decoration:none!important;',
      'transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}',

      '.mode-bar #btn-theme, .mode-bar #btn-profile{',
      'background:rgba(124,106,240,0.12)!important;color:#c4b5fd!important;',
      'border-color:rgba(124,106,240,0.35)!important}',
      '.mode-bar #btn-theme:hover, .mode-bar #btn-profile:hover{',
      'background:rgba(124,106,240,0.22)!important;border-color:rgba(124,106,240,0.55)!important;color:#e9e5ff!important}',

      '.mode-bar #btn-logout{',
      'background:rgba(239,68,68,0.1)!important;color:#f87171!important;',
      'border-color:rgba(239,68,68,0.45)!important}',
      '.mode-bar #btn-logout:hover{',
      'background:rgba(239,68,68,0.2)!important;border-color:rgba(239,68,68,0.7)!important;color:#fca5a5!important}',

      'html[data-theme="light"] .mode-bar #btn-theme, html[data-theme="light"] .mode-bar #btn-profile{',
      'background:rgba(99,102,241,0.1)!important;color:#4f46e5!important;border-color:rgba(99,102,241,0.3)!important}',
      'html[data-theme="light"] .mode-bar #btn-logout{',
      'background:rgba(220,38,38,0.08)!important;color:#dc2626!important;border-color:rgba(220,38,38,0.35)!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function openProfile() {
    try {
      if (window.DR_PROFILE && typeof window.DR_PROFILE.open === 'function') {
        window.DR_PROFILE.open({ readOnly: false });
        return;
      }
    } catch (e) {}
    try {
      if (window.DRProfile && typeof window.DRProfile.open === 'function') {
        window.DRProfile.open();
        return;
      }
    } catch (e2) {}
    var existing = document.querySelector('[data-open-profile], #btn-open-profile, #btn-profile-link');
    if (existing) existing.click();
  }

  function ensureProfileBtn() {
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return;

    var btn = document.getElementById('btn-profile');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-profile';
      btn.className = 'btn btn-ghost btn-sm dr-topbar-btn';
      btn.textContent = 'Profile';
      var theme = document.getElementById('btn-theme');
      var logout = document.getElementById('btn-logout');
      if (theme && theme.parentNode === info) {
        if (theme.nextSibling) info.insertBefore(btn, theme.nextSibling);
        else info.appendChild(btn);
      } else if (logout && logout.parentNode === info) {
        info.insertBefore(btn, logout);
      } else {
        info.appendChild(btn);
      }
    } else {
      btn.textContent = 'Profile';
      btn.classList.add('dr-topbar-btn');
    }

    if (!btn.__drProfileBound) {
      btn.__drProfileBound = 1;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openProfile();
      });
    }
  }

  function styleLogout() {
    var logout = document.getElementById('btn-logout');
    if (!logout) return;
    logout.classList.add('dr-topbar-btn');
    if (logout.tagName === 'A') logout.classList.add('btn', 'btn-sm');
    if (!(logout.textContent || '').trim()) logout.textContent = 'Logout';
  }

  function hideRoleLabel() {
    var lb = document.getElementById('logged-user-label');
    if (lb) {
      lb.style.setProperty('display', 'none', 'important');
      lb.setAttribute('aria-hidden', 'true');
    }
  }

  function tick() {
    injectCss();
    hideRoleLabel();
    try { if (window.DRTheme && window.DRTheme.ensure) window.DRTheme.ensure(); } catch (e) {}
    ensureProfileBtn();
    styleLogout();
  }

  tick();
  setTimeout(tick, 600);
  setTimeout(tick, 2000);
  setInterval(tick, 20000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('.mode-bar')) {
      setTimeout(tick, 50);
    }
  }, true);

  window.DRTopbarActions = { refresh: tick, v: 1 };
})();
