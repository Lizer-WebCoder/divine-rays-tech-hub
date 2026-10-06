/**
 * Divine Rays — hide portal chrome on login; restore FAB sizes when logged in
 * Quiet v3 — no 2s loop / no subtree MutationObserver (was causing flicker)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_CHROME_HIDE >= 3) return;
  window.__DR_LOGIN_CHROME_HIDE = 3;

  var SELECTORS = [
    '#btn-logout',
    '#logged-user-label',
    '.mode-user',
    '.mode-actions',
    '.mode-bar',
    '#theme-toggle',
    '[data-theme-toggle]',
    '#dr-staff-notif-fab',
    '#dr-notif-fab',
    '#dr-chat-fab',
    '.dr-notif-fab',
    '.dr-chat-fab'
  ];

  function isLoginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls) {
        var st = window.getComputedStyle(ls);
        if (st.display === 'none' || st.visibility === 'hidden' || ls.hidden) return false;
        if (ls.offsetParent === null && st.position !== 'fixed') return false;
        return true;
      }
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if ((pa && pa.classList.contains('active')) || (pc && pc.classList.contains('active'))) return false;
      return !document.body || !document.body.classList.contains('is-portal');
    } catch (e) {
      return false;
    }
  }

  function inject() {
    if (document.getElementById('dr-login-chrome-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-login-chrome-css';
    el.textContent = [
      'body.is-login .mode-bar,body:not(.is-portal) .mode-bar,',
      'body.is-login #btn-logout,body.is-login #logged-user-label,',
      'body.is-login #theme-toggle,body.is-login [data-theme-toggle],',
      'body.is-login #dr-staff-notif-fab,body.is-login #dr-notif-fab,body.is-login #dr-chat-fab{',
      'display:none!important;visibility:hidden!important;pointer-events:none!important}',
      'body.is-portal .mode-bar{display:flex!important;visibility:visible!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function sizeFab(el) {
    if (!el) return;
    el.style.setProperty('width', '56px', 'important');
    el.style.setProperty('height', '56px', 'important');
  }

  function apply() {
    inject();
    var onLogin = isLoginVisible();
    try {
      if (document.body) {
        document.body.classList.toggle('is-login', onLogin);
        document.body.classList.toggle('is-portal', !onLogin);
      }
    } catch (e) {}

    SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (onLogin) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
          el.setAttribute('data-dr-login-hide', '1');
        } else if (el.getAttribute('data-dr-login-hide') === '1') {
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
          el.style.removeProperty('pointer-events');
          el.removeAttribute('data-dr-login-hide');
        }
      });
    });

    if (!onLogin) {
      ['dr-staff-notif-fab', 'dr-notif-fab', 'dr-chat-fab'].forEach(function (id) {
        sizeFab(document.getElementById(id));
      });
    }
  }

  apply();
  setTimeout(apply, 150);
  setTimeout(apply, 600);
  setTimeout(apply, 1500);
  setInterval(apply, 20000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drLchT);
      window.__drLchT = setTimeout(apply, 500);
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['hidden', 'class', 'data-theme']
    });
  } catch (e) {}

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#btn-logout') || t.id === 'btn-logout' || (t.textContent && /logout|sign out/i.test(t.textContent))) {
      setTimeout(apply, 50);
      setTimeout(apply, 400);
    }
  }, true);

  window.DRLoginChromeHide = { refresh: apply, v: 3 };
})();
