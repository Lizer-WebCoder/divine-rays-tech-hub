/**
 * Divine Rays - portal-shell v10 override
 * Stops portal gears flashing under/before the login page.
 * Patches ensureAmbient + clears leftover portal-pref on cold login.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL_V10_OVERRIDE >= 2) return;
  window.__DR_PORTAL_SHELL_V10_OVERRIDE = 2;

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
      'body:not(.dr-portal-ok):not(.is-portal):not(.is-portal-employee):not(.is-portal-admin) #dr-portal-ambient{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'pointer-events:none!important;z-index:-1!important}',
      'html:not([data-dr-portal-pref]) #dr-portal-ambient{',
      'display:none!important;opacity:0!important;visibility:hidden!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function clearStalePortalPref() {
    if (isPostLogin()) return;
    try {
      if (!document.body || !document.body.classList.contains('dr-portal-ok')) {
        document.documentElement.removeAttribute('data-dr-portal-pref');
        var early = document.getElementById('dr-early-portal-pref');
        if (early && early.parentNode) early.parentNode.removeChild(early);
      }
    } catch (e) {}
  }

  function ensureLoginVisible() {
    if (isPostLogin()) return;
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls) {
        ls.hidden = false;
        ls.style.removeProperty('display');
        ls.style.setProperty('visibility', 'visible', 'important');
        ls.style.setProperty('opacity', '1', 'important');
      }
      document.body.classList.add('is-login');
      document.body.classList.remove('dr-portal-ok', 'is-portal', 'is-portal-employee', 'is-portal-admin');
      ['portal-customer', 'portal-agent', 'mode-bar-employee', 'mode-bar-admin'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.classList.remove('active');
          el.style.setProperty('display', 'none', 'important');
        }
      });
    } catch (e) {}
  }

  function patch() {
    injectCss();
    if (!isPostLogin()) {
      clearStalePortalPref();
      hideAmbient();
    }
    if (!window.DRPortalShell || !window.DRPortalShell.ensureAmbient) return false;
    if (window.DRPortalShell.__drV10Override) return true;
    var orig = window.DRPortalShell.ensureAmbient;
    window.DRPortalShell.ensureAmbient = function (forceShow) {
      if (loginVisible() || (!isPostLogin() && !document.body.classList.contains('dr-portal-ok'))) {
        hideAmbient();
        return false;
      }
      var r = orig.call(window.DRPortalShell, !!forceShow);
      if (loginVisible()) hideAmbient();
      return r;
    };
    window.DRPortalShell.__drV10Override = 1;
    return true;
  }

  injectCss();
  clearStalePortalPref();
  hideAmbient();
  var n = 0;
  var iv = setInterval(function () {
    n++;
    patch();
    if (!isPostLogin()) {
      hideAmbient();
      if (loginVisible()) ensureLoginVisible();
    }
    if (n > 60) clearInterval(iv);
  }, 50);
  setInterval(function () {
    if (!isPostLogin() && (loginVisible() || !document.body.classList.contains('dr-portal-ok'))) {
      hideAmbient();
    }
  }, 400);
})();
