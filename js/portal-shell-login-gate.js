/**
 * Divine Rays - portal-shell-login-gate v1
 * portal-shell earlyWarm() calls ensureAmbient(true) which paints gears
 * on the login page. Gate: never show #dr-portal-ambient while login is visible.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_SHELL_LOGIN_GATE >= 1) return;
  window.__DR_PORTAL_SHELL_LOGIN_GATE = 1;

  var CSS_ID = 'dr-portal-shell-login-gate-css';

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

  function portalActive() {
    try {
      if (
        document.body &&
        (document.body.classList.contains('dr-portal-ok') ||
          document.body.classList.contains('is-portal') ||
          document.body.classList.contains('is-portal-employee') ||
          document.body.classList.contains('is-portal-admin'))
      )
        return true;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active') && getComputedStyle(pc).display !== 'none') return true;
      if (pa && pa.classList.contains('active') && getComputedStyle(pa).display !== 'none') return true;
    } catch (e) {}
    return false;
  }

  function hidePortalAmbient() {
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
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'html:not([data-dr-portal-pref]) #dr-portal-ambient,',
      'body.is-login:not(.dr-portal-ok):not(.is-portal) #dr-portal-ambient,',
      'body:not(.dr-portal-ok):not(.is-portal):not(.is-portal-employee):not(.is-portal-admin) #dr-portal-ambient{',
      'display:none!important;visibility:hidden!important;opacity:0!important;',
      'pointer-events:none!important;z-index:-1!important}',
      'body:has(#login-screen:not([hidden])) #dr-portal-ambient{',
      'display:none!important;opacity:0!important;visibility:hidden!important}'
    ].join('');
  }

  function patchShell() {
    try {
      if (!window.DRPortalShell || !window.DRPortalShell.ensureAmbient) return false;
      if (window.DRPortalShell.__drLoginGate) return true;
      var orig = window.DRPortalShell.ensureAmbient;
      window.DRPortalShell.ensureAmbient = function (forceShow) {
        if (loginVisible() && !portalActive()) {
          hidePortalAmbient();
          return false;
        }
        var r = orig.call(window.DRPortalShell, forceShow && portalActive());
        if (loginVisible() && !portalActive()) hidePortalAmbient();
        return r;
      };
      window.DRPortalShell.__drLoginGate = 1;
      return true;
    } catch (e) {
      return false;
    }
  }

  function apply() {
    injectCss();
    if (loginVisible() && !portalActive()) hidePortalAmbient();
    patchShell();
  }

  injectCss();
  apply();
  var n = 0;
  var iv = setInterval(function () {
    n++;
    apply();
    if ((window.DRPortalShell && window.DRPortalShell.__drLoginGate) || n > 40) clearInterval(iv);
  }, 100);
  setTimeout(apply, 500);
  setTimeout(apply, 1500);
  setInterval(function () {
    if (loginVisible() && !portalActive()) hidePortalAmbient();
  }, 2000);

  window.DRPortalShellLoginGate = { v: 1, refresh: apply };
})();
