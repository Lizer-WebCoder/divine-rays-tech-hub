/**
 * Divine Rays - portal-shell v10 override v3
 * Stops portal gears flashing under/before the login page.
 * Clears leftover session portal keys on cold login (root cause of delayed gear takeover).
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL_V10_OVERRIDE >= 3) return;
  window.__DR_PORTAL_SHELL_V10_OVERRIDE = 3;

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls && !ls.hidden) {
        var st = window.getComputedStyle ? getComputedStyle(ls) : null;
        if (!st || (st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity || '1') > 0.05))
          return true;
      }
      if (document.body && document.body.classList.contains('is-login') && !document.body.classList.contains('dr-portal-ok'))
        return true;
    } catch (e) {}
    return false;
  }

  function isPostLogin() {
    try {
      return (
        sessionStorage.getItem('dr_skip_boot_gear') === '1' ||
        sessionStorage.getItem('dr_post_login_boot') === '1' ||
        document.documentElement.classList.contains('dr-post-login')
      );
    } catch (e) {
      return false;
    }
  }

  function hideAmbient() {
    try {
      var el = document.getElementById('dr-portal-ambient');
      if (!el) return;
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.removeAttribute('data-dr-ready');
    } catch (e) {}
  }

  function injectCss() {
    if (document.getElementById('dr-ps-v10-override-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-ps-v10-override-css';
    s.textContent = [
      'body:not(.dr-portal-ok):not(.is-portal):not(.is-portal-employee):not(.is-portal-admin) #dr-portal-ambient,',
      'body.is-login:not(.dr-portal-ok) #dr-portal-ambient{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'pointer-events:none!important;z-index:-1!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function clearStalePortalKeys() {
    if (isPostLogin()) return;
    try {
      if (loginVisible() || (document.body && document.body.classList.contains('is-login'))) {
        document.documentElement.removeAttribute('data-dr-portal-pref');
        sessionStorage.removeItem('dr_dev_portal_pref');
        if (!document.body.classList.contains('dr-portal-ok')) {
          var early = document.getElementById('dr-early-portal-pref');
          if (early && early.parentNode) early.parentNode.removeChild(early);
        }
      }
    } catch (e) {}
  }

  function sealLogin() {
    if (isPostLogin()) return;
    if (!loginVisible() && !(document.body && document.body.classList.contains('is-login'))) return;
    try {
      document.body.classList.add('is-login');
      document.body.classList.remove('dr-portal-ok', 'is-portal', 'is-portal-employee', 'is-portal-admin');
      ['portal-customer', 'portal-agent', 'mode-bar-employee', 'mode-bar-admin', 'dr-dev-portal-switch'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.classList.remove('active');
          el.style.setProperty('display', 'none', 'important');
        }
      });
      hideAmbient();
    } catch (e) {}
  }

  function patch() {
    injectCss();
    if (!isPostLogin()) {
      clearStalePortalKeys();
      sealLogin();
    }
    if (!window.DRPortalShell || !window.DRPortalShell.ensureAmbient) return false;
    if (window.DRPortalShell.__drV10Override >= 3) return true;
    var orig = window.DRPortalShell.ensureAmbient;
    window.DRPortalShell.ensureAmbient = function (forceShow) {
      if (loginVisible() || (document.body && document.body.classList.contains('is-login') && !document.body.classList.contains('dr-portal-ok'))) {
        hideAmbient();
        return false;
      }
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      var real =
        (pc && pc.classList.contains('active')) ||
        (pa && pa.classList.contains('active')) ||
        (document.body && document.body.classList.contains('dr-portal-ok'));
      if (!real) {
        hideAmbient();
        return false;
      }
      var r = orig.call(window.DRPortalShell, !!forceShow);
      if (loginVisible()) hideAmbient();
      return r;
    };
    window.DRPortalShell.__drV10Override = 3;
    return true;
  }

  injectCss();
  clearStalePortalKeys();
  hideAmbient();
  var n = 0;
  var iv = setInterval(function () {
    n++;
    patch();
    if (!isPostLogin()) sealLogin();
    if (n > 80) clearInterval(iv);
  }, 50);
  setInterval(function () {
    if (!isPostLogin() && (loginVisible() || (document.body && document.body.classList.contains('is-login')))) {
      sealLogin();
      hideAmbient();
    }
  }, 500);
})();
