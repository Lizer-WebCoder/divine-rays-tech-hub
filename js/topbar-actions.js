/**
 * Divine Rays — Top bar actions v5 — fast paint
 * One Profile, theme icon via theme.js, red Logout — Admin + Employees
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_ACTIONS >= 5) return;
  window.__DR_TOPBAR_ACTIONS = 5;

  function injectCss() {
    if (document.getElementById('dr-topbar-actions-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-topbar-actions-css';
    el.textContent = [
      '.mode-bar #logged-user-label, .user-info #logged-user-label{',
      'display:none!important;visibility:hidden!important;width:0!important;height:0!important;',
      'overflow:hidden!important;margin:0!important;padding:0!important}',

      '.mode-bar .user-info{display:flex!important;align-items:center!important;gap:0.45rem!important;flex-wrap:wrap}',

      '.mode-bar #btn-profile, .mode-bar #btn-my-profile, .mode-bar #btn-logout,',
      '.mode-bar .dr-topbar-btn:not(#btn-theme){',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'padding:0.35rem 0.85rem!important;border-radius:8px!important;font-size:0.82rem!important;',
      'font-weight:600!important;cursor:pointer!important;line-height:1.2!important;',
      'border:1px solid transparent!important;text-decoration:none!important;',
      'visibility:visible!important;opacity:1!important;pointer-events:auto!important;',
      'transition:background .15s ease,border-color .15s ease,color .15s ease}',

      '.mode-bar #btn-profile, .mode-bar #btn-my-profile{',
      'background:rgba(124,106,240,0.12)!important;color:#c4b5fd!important;',
      'border-color:rgba(124,106,240,0.35)!important}',
      '.mode-bar #btn-profile:hover, .mode-bar #btn-my-profile:hover{',
      'background:rgba(124,106,240,0.22)!important;border-color:rgba(124,106,240,0.55)!important;color:#e9e5ff!important}',

      '.mode-bar #btn-logout{',
      'background:rgba(239,68,68,0.1)!important;color:#f87171!important;',
      'border-color:rgba(239,68,68,0.45)!important}',
      '.mode-bar #btn-logout:hover{',
      'background:rgba(239,68,68,0.2)!important;border-color:rgba(239,68,68,0.7)!important;color:#fca5a5!important}',

      'html[data-theme="light"] .mode-bar #btn-profile,',
      'html[data-theme="light"] .mode-bar #btn-my-profile{',
      'background:rgba(99,102,241,0.1)!important;color:#4f46e5!important;border-color:rgba(99,102,241,0.3)!important}',
      'html[data-theme="light"] .mode-bar #btn-logout{',
      'background:rgba(220,38,38,0.08)!important;color:#dc2626!important;border-color:rgba(220,38,38,0.35)!important}',

      'body.is-portal .mode-bar #btn-theme{display:inline-flex!important;visibility:visible!important;pointer-events:auto!important}',
      '.mode-bar{visibility:visible!important;opacity:1!important}'
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
      btn.className = 'btn btn-ghost btn-sm btn-theme dr-topbar-btn dr-theme-icon';
      info.insertBefore(btn, info.firstChild);
    }
    btn.setAttribute('data-theme-toggle', '1');
    btn.type = 'button';
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    try { if (window.DRTheme && window.DRTheme.ensure) window.DRTheme.ensure(); } catch (e) {}
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
      btn.id = 'btn-profile';
      btn.className = 'btn btn-ghost btn-sm dr-topbar-btn';
      btn.textContent = 'Profile';
      info.appendChild(btn);
    }
    btn.textContent = 'Profile';
    btn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      openProfile();
    };
  }

  function styleLogout() {
    var btn = document.getElementById('btn-logout');
    if (!btn) return;
    btn.classList.add('dr-topbar-btn');
    btn.style.setProperty('visibility', 'visible', 'important');
    btn.style.setProperty('opacity', '1', 'important');
  }

  function orderButtons() {
    var info = userInfo();
    if (!info) return;
    var theme = document.getElementById('btn-theme');
    var profile = document.getElementById('btn-my-profile') || document.getElementById('btn-profile');
    var logout = document.getElementById('btn-logout');
    if (theme) info.appendChild(theme);
    if (profile) info.appendChild(profile);
    if (logout) info.appendChild(logout);
  }

  function hideLoggedLabel() {
    var lb = document.getElementById('logged-user-label');
    if (lb) {
      lb.style.setProperty('display', 'none', 'important');
      lb.setAttribute('aria-hidden', 'true');
    }
  }

  function tick() {
    injectCss();
    hideLoggedLabel();
    ensureThemeBtn();
    ensureOneProfileBtn();
    styleLogout();
    orderButtons();
  }

  tick();
  var n = 0;
  var fast = setInterval(function () {
    tick();
    n += 1;
    if (n > 50) clearInterval(fast);
  }, 150);
  setInterval(tick, 4000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('.mode-bar') && !e.target.closest('#btn-theme')) {
      setTimeout(tick, 80);
    }
  }, true);

  window.DRTopbarActions = { refresh: tick, v: 5 };
})();
