/**
 * Divine Rays — Top bar actions v3
 * One Profile, Light/Dark via theme.js, red Logout — Admin + Employees
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_ACTIONS >= 3) return;
  window.__DR_TOPBAR_ACTIONS = 3;

  function injectCss() {
    if (document.getElementById('dr-topbar-actions-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-topbar-actions-css';
    el.textContent = [
      '.mode-bar #logged-user-label, .user-info #logged-user-label{',
      'display:none!important;visibility:hidden!important;width:0!important;height:0!important;',
      'overflow:hidden!important;margin:0!important;padding:0!important}',

      '.mode-bar .user-info{display:flex!important;align-items:center!important;gap:0.45rem!important;flex-wrap:wrap}',

      '.mode-bar #btn-theme, .mode-bar #btn-profile, .mode-bar #btn-my-profile, .mode-bar #btn-logout,',
      '.mode-bar .dr-topbar-btn{',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'padding:0.35rem 0.85rem!important;border-radius:8px!important;font-size:0.82rem!important;',
      'font-weight:600!important;cursor:pointer!important;line-height:1.2!important;',
      'border:1px solid transparent!important;text-decoration:none!important;',
      'visibility:visible!important;opacity:1!important;pointer-events:auto!important;',
      'transition:background .15s ease,border-color .15s ease,color .15s ease}',

      '.mode-bar #btn-theme, .mode-bar #btn-profile, .mode-bar #btn-my-profile{',
      'background:rgba(124,106,240,0.12)!important;color:#c4b5fd!important;',
      'border-color:rgba(124,106,240,0.35)!important}',
      '.mode-bar #btn-theme:hover, .mode-bar #btn-profile:hover, .mode-bar #btn-my-profile:hover{',
      'background:rgba(124,106,240,0.22)!important;border-color:rgba(124,106,240,0.55)!important;color:#e9e5ff!important}',

      '.mode-bar #btn-logout{',
      'background:rgba(239,68,68,0.1)!important;color:#f87171!important;',
      'border-color:rgba(239,68,68,0.45)!important}',
      '.mode-bar #btn-logout:hover{',
      'background:rgba(239,68,68,0.2)!important;border-color:rgba(239,68,68,0.7)!important;color:#fca5a5!important}',

      'html[data-theme="light"] .mode-bar #btn-theme,',
      'html[data-theme="light"] .mode-bar #btn-profile,',
      'html[data-theme="light"] .mode-bar #btn-my-profile{',
      'background:rgba(99,102,241,0.1)!important;color:#4f46e5!important;border-color:rgba(99,102,241,0.3)!important}',
      'html[data-theme="light"] .mode-bar #btn-logout{',
      'background:rgba(220,38,38,0.08)!important;color:#dc2626!important;border-color:rgba(220,38,38,0.35)!important}',

      'body.is-portal .mode-bar #btn-theme{display:inline-flex!important;visibility:visible!important;pointer-events:auto!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function userInfo() {
    return document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
  }

  function openProfile() {
    try {
      if (window.DR_PROFILE && typeof window.DR_PROFILE.open === 'function') {
        window.DR_PROFILE.open({ readOnly: false });
        return;
      }
    } catch (e) {}
    var existing = document.getElementById('btn-my-profile');
    if (existing) existing.click();
  }

  function ensureThemeBtn() {
    var info = userInfo();
    if (!info) return null;

    var btn = document.getElementById('btn-theme');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-theme';
      btn.className = 'btn btn-ghost btn-sm btn-theme dr-topbar-btn';
      info.insertBefore(btn, info.firstChild);
    }

    var chip = document.getElementById('header-avatar-chip');
    if (chip && chip.parentNode === info) {
      if (btn.previousSibling !== chip) {
        if (chip.nextSibling) info.insertBefore(btn, chip.nextSibling);
        else info.appendChild(btn);
      }
    } else if (btn.parentNode === info && info.firstChild !== btn) {
      info.insertBefore(btn, info.firstChild);
    }

    btn.classList.add('dr-topbar-btn');
    btn.setAttribute('data-theme-toggle', '1');
    btn.type = 'button';
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.removeProperty('display');
    btn.style.removeProperty('visibility');

    var theme = 'dark';
    try {
      theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('dr_theme') || 'dark';
    } catch (e) {}
    btn.textContent = theme === 'light' ? 'Dark' : 'Light';
    btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

    /* click handled by theme.js capture-phase delegation */
    return btn;
  }

  function ensureOneProfileBtn() {
    var info = userInfo();
    if (!info) return;

    var mine = document.getElementById('btn-my-profile');
    var ours = document.getElementById('btn-profile');

    if (mine && ours) {
      if (ours.parentNode) ours.parentNode.removeChild(ours);
      ours = null;
    }

    var btn = mine || ours;
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-my-profile';
      btn.className = 'btn btn-ghost btn-sm dr-topbar-btn';
      btn.textContent = 'Profile';
      var logout = document.getElementById('btn-logout');
      var theme = document.getElementById('btn-theme');
      if (theme && theme.parentNode === info) {
        if (theme.nextSibling) info.insertBefore(btn, theme.nextSibling);
        else info.appendChild(btn);
      } else if (logout && logout.parentNode === info) {
        info.insertBefore(btn, logout);
      } else {
        info.appendChild(btn);
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

    btn.textContent = 'Profile';
    btn.classList.add('dr-topbar-btn');

    info.querySelectorAll('button, a').forEach(function (el) {
      if (el === btn) return;
      if (el.id === 'btn-theme' || el.id === 'btn-logout') return;
      var tx = (el.textContent || '').trim().toLowerCase();
      if (tx === 'profile' && el.id !== 'btn-my-profile') {
        if (el.parentNode) el.parentNode.removeChild(el);
      }
    });
  }

  function styleLogout() {
    var logout = document.getElementById('btn-logout');
    if (!logout) return;
    logout.classList.add('dr-topbar-btn');
    if (!(logout.textContent || '').trim()) logout.textContent = 'Logout';
  }

  function hideRoleLabel() {
    var lb = document.getElementById('logged-user-label');
    if (lb) {
      lb.style.setProperty('display', 'none', 'important');
      lb.setAttribute('aria-hidden', 'true');
    }
  }

  function orderButtons() {
    var info = userInfo();
    if (!info) return;
    var chip = document.getElementById('header-avatar-chip');
    var theme = document.getElementById('btn-theme');
    var profile = document.getElementById('btn-my-profile') || document.getElementById('btn-profile');
    var logout = document.getElementById('btn-logout');
    var nodes = [];
    if (chip && chip.parentNode === info) nodes.push(chip);
    if (theme) nodes.push(theme);
    if (profile) nodes.push(profile);
    if (logout) nodes.push(logout);
    nodes.forEach(function (n) { info.appendChild(n); });
  }

  function tick() {
    injectCss();
    hideRoleLabel();
    ensureThemeBtn();
    ensureOneProfileBtn();
    styleLogout();
    orderButtons();
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);
  setInterval(tick, 20000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('.mode-bar') && !e.target.closest('#btn-theme')) {
      setTimeout(tick, 80);
    }
  }, true);

  window.DRTopbarActions = { refresh: tick, v: 3 };
})();
