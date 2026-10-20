/**
 * Divine Rays — login-layout-lock v1
 * Stops login page "corrupted" feel:
 * - scrollbar appearing/disappearing (layout shift)
 * - honeycomb ambient briefly vanishing
 * - body height thrash from portal remnants
 * On login: fixed full-viewport, overflow hidden, ambient locked visible.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_LAYOUT_LOCK >= 1) return;
  window.__DR_LOGIN_LAYOUT_LOCK = 1;

  var STYLE_ID = 'dr-login-layout-lock-css';

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity || '1') < 0.05))
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function isPortal() {
    try {
      if (loginVisible()) return false;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active')) return true;
      if (pa && pa.classList.contains('active')) return true;
      return !!(document.body && document.body.classList.contains('dr-portal-ok') && !document.body.classList.contains('is-login'));
    } catch (e) {
      return false;
    }
  }

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.is-login,html.dr-login-lock,body.is-login html{',
      'overflow:hidden!important;height:100%!important;max-height:100%!important;',
      'overscroll-behavior:none!important}',
      'body.is-login{',
      'overflow:hidden!important;height:100vh!important;max-height:100vh!important;',
      'position:relative!important;min-height:100vh!important}',
      'body.is-login #login-screen,body.is-login .login-screen{',
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;',
      'max-height:100vh!important;min-height:100vh!important;overflow:hidden!important;',
      'z-index:2!important;margin:0!important;box-sizing:border-box!important}',
      'body.is-login #dr-login-ambient{',
      'position:fixed!important;inset:0!important;width:100%!important;height:100%!important;',
      'display:block!important;visibility:visible!important;opacity:1!important;',
      'pointer-events:none!important;z-index:0!important;overflow:hidden!important}',
      'body.is-login #dr-login-ambient .dr-honeycomb,',
      'body.is-login #dr-login-ambient .dr-hc{',
      'display:block!important;visibility:visible!important;opacity:1!important}',
      'body.is-login #dr-lifeline{',
      'position:fixed!important;inset:0!important;z-index:1!important;pointer-events:none!important}',
      'body.is-login #portal-customer,body.is-login #portal-agent,',
      'body.is-login #mode-bar-employee,body.is-login #mode-bar-admin,',
      'body.is-login .mode-bar,body.is-login #dr-dev-portal-switch,',
      'body.is-login #app-shell,body.is-login #dr-portal-ambient{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'height:0!important;max-height:0!important;overflow:hidden!important;',
      'pointer-events:none!important;position:absolute!important;left:-9999px!important}',
      'body.is-login #boot.is-done,body.is-login #dr-phase-boot.is-done,',
      'body.is-login #boot.dr-skip{display:none!important;height:0!important;overflow:hidden!important}'
    ].join('');
  }

  function seal() {
    if (isPortal()) {
      try {
        document.documentElement.classList.remove('dr-login-lock');
      } catch (e) {}
      return;
    }
    if (!loginVisible() && !(document.body && document.body.classList.contains('is-login'))) return;

    injectCss();
    try {
      document.documentElement.classList.add('dr-login-lock');
      document.body.classList.add('is-login');
      document.body.classList.remove('dr-portal-ok', 'is-portal', 'is-portal-employee', 'is-portal-admin');
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('height', '100vh', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    } catch (e) {}

    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls) {
        ls.style.setProperty('position', 'fixed', 'important');
        ls.style.setProperty('inset', '0', 'important');
        ls.style.setProperty('width', '100%', 'important');
        ls.style.setProperty('height', '100%', 'important');
        ls.style.setProperty('max-height', '100vh', 'important');
        ls.style.setProperty('overflow', 'hidden', 'important');
      }
    } catch (e2) {}

    try {
      var amb = document.getElementById('dr-login-ambient');
      if (amb) {
        amb.style.setProperty('display', 'block', 'important');
        amb.style.setProperty('visibility', 'visible', 'important');
        amb.style.setProperty('opacity', '1', 'important');
        amb.style.setProperty('position', 'fixed', 'important');
        amb.style.setProperty('inset', '0', 'important');
      }
      var pa = document.getElementById('dr-portal-ambient');
      if (pa) {
        pa.style.setProperty('display', 'none', 'important');
        pa.style.setProperty('opacity', '0', 'important');
        pa.style.setProperty('height', '0', 'important');
      }
    } catch (e3) {}
  }

  injectCss();
  seal();
  setTimeout(seal, 50);
  setTimeout(seal, 200);
  setTimeout(seal, 600);
  setTimeout(seal, 1200);
  setTimeout(seal, 2500);
  setInterval(function () {
    if (loginVisible() || (document.body && document.body.classList.contains('is-login') && !isPortal()))
      seal();
  }, 1500);

  window.DRLoginLayoutLock = { v: 1, seal: seal };
})();
