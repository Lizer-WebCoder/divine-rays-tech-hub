/**
 * Divine Rays — hide portal chrome on login; restore FAB sizes when logged in
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_CHROME_HIDE_V2) return;
  window.__DR_LOGIN_CHROME_HIDE_V2 = 1;

  var STYLE_ID = 'dr-login-chrome-hide-css';
  var FAB_SIZE = '56px';
  var ICON_SIZE = '24px';
  var SELECTORS = [
    '.mode-bar',
    '#dr-staff-notif-fab',
    '#dr-staff-notif-panel',
    '#dr-staff-notif-bd',
    '#dr-notif-fab',
    '#dr-notif-panel',
    '#dr-notif-panel-bd',
    '#dr-notif-btn',
    '#dr-chat-fab',
    '.dr-notif-fab',
    '[id*="notif-fab"]'
  ];

  function inject() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = [
      'body.is-login .mode-bar,body:not(.is-portal) .mode-bar,',
      'body.is-login #dr-staff-notif-fab,body:not(.is-portal) #dr-staff-notif-fab,',
      'body.is-login #dr-staff-notif-panel,body:not(.is-portal) #dr-staff-notif-panel,',
      'body.is-login #dr-staff-notif-bd,body:not(.is-portal) #dr-staff-notif-bd,',
      'body.is-login #dr-notif-fab,body:not(.is-portal) #dr-notif-fab,',
      'body.is-login #dr-notif-panel,body:not(.is-portal) #dr-notif-panel,',
      'body.is-login #dr-notif-panel-bd,body:not(.is-portal) #dr-notif-panel-bd,',
      'body.is-login #dr-notif-btn,body:not(.is-portal) #dr-notif-btn,',
      'body.is-login #dr-chat-fab,body:not(.is-portal) #dr-chat-fab,',
      'body.is-login .dr-notif-fab,body:not(.is-portal) .dr-notif-fab,',
      'body.is-login [id*="notif-fab"],body:not(.is-portal) [id*="notif-fab"]{',
      'display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important}',

      'body.is-portal .mode-bar{display:flex!important;visibility:visible!important}',

      'body.is-portal #dr-staff-notif-fab,body.is-portal #dr-notif-fab,body.is-portal #dr-chat-fab{',
      'display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;',
      'width:' + FAB_SIZE + '!important;height:' + FAB_SIZE + '!important;',
      'min-width:' + FAB_SIZE + '!important;min-height:' + FAB_SIZE + '!important;',
      'max-width:' + FAB_SIZE + '!important;max-height:' + FAB_SIZE + '!important;',
      'border-radius:50%!important;box-sizing:border-box!important;',
      'align-items:center!important;justify-content:center!important',
      '}',
      'body.is-portal #dr-staff-notif-fab svg,body.is-portal #dr-notif-fab svg,body.is-portal #dr-chat-fab svg{',
      'width:' + ICON_SIZE + '!important;height:' + ICON_SIZE + '!important',
      '}',
    ].join('');
    if (el.parentNode) el.parentNode.appendChild(el);
  }

  function isLoginVisible() {
    var shell = document.getElementById('app-shell');
    if (shell) {
      var shellHidden =
        shell.hasAttribute('hidden') ||
        shell.classList.contains('is-hidden') ||
        shell.classList.contains('hidden') ||
        shell.style.display === 'none';
      if (!shellHidden) return false;
    }
    var login = document.getElementById('login-screen');
    if (!login) return true;
    if (login.hasAttribute('hidden') || login.classList.contains('hidden') || login.classList.contains('is-hidden')) return false;
    if (login.style.display === 'none') return false;
    return true;
  }

  function sizeFab(el) {
    if (!el) return;
    el.style.setProperty('width', FAB_SIZE, 'important');
    el.style.setProperty('height', FAB_SIZE, 'important');
    el.style.setProperty('min-width', FAB_SIZE, 'important');
    el.style.setProperty('min-height', FAB_SIZE, 'important');
    el.style.setProperty('max-width', FAB_SIZE, 'important');
    el.style.setProperty('max-height', FAB_SIZE, 'important');
    el.style.setProperty('border-radius', '50%', 'important');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('align-items', 'center', 'important');
    el.style.setProperty('justify-content', 'center', 'important');
    el.querySelectorAll('svg').forEach(function (svg) {
      svg.style.setProperty('width', ICON_SIZE, 'important');
      svg.style.setProperty('height', ICON_SIZE, 'important');
    });
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
  setInterval(apply, 2000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drLchT);
      window.__drLchT = setTimeout(apply, 40);
    }).observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['hidden', 'class', 'style', 'data-theme']
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

  window.DRLoginChromeHide = { refresh: apply, v: 2 };
})();
