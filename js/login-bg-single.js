/**
 * Divine Rays — login-bg-single v1
 * Kill double login backgrounds (force-light + galaxy fighting).
 * Keep one #dr-login-ambient; hide portal ambient on login.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_BG_SINGLE >= 1) return;
  window.__DR_LOGIN_BG_SINGLE = 1;

  var CSS_ID = 'dr-login-bg-single-css';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#dr-login-ambient{position:absolute!important;inset:0!important;z-index:0!important;pointer-events:none!important;overflow:hidden!important}',
      '#dr-login-ambient .dr-honeycomb{opacity:0.22!important}',
      '#dr-login-ambient .dr-network{opacity:0.5!important}',
      'body.is-login #dr-portal-ambient,body.is-login #dr-lifeline,',
      '#login-screen:not([hidden]) ~ #dr-portal-ambient,',
      '#login-screen:not([hidden]) ~ #dr-lifeline{display:none!important;visibility:hidden!important;opacity:0!important}',
      'html:not([data-dr-portal-pref]) body:not(.dr-portal-ok):not(.is-portal) #dr-portal-ambient{display:none!important}',
      'html:not([data-dr-portal-pref]) body:not(.dr-portal-ok):not(.is-portal) #dr-lifeline .dr-spin-cw,',
      'html:not([data-dr-portal-pref]) body:not(.dr-portal-ok):not(.is-portal) #dr-lifeline .dr-spin-ccw{display:none!important}'
    ].join('');
  }

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function dedupe() {
    injectCss();
    try {
      if (loginVisible()) {
        document.body.classList.add('is-login');
        document.body.classList.remove('dr-portal-ok', 'is-portal');
        ['dr-portal-ambient'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          }
        });
        var layers = document.querySelectorAll('#dr-login-ambient');
        if (layers.length > 1) {
          for (var i = 1; i < layers.length; i++) {
            try {
              layers[i].parentNode.removeChild(layers[i]);
            } catch (e) {}
          }
        }
        var amb = document.getElementById('dr-login-ambient');
        if (amb && amb.querySelector('.dr-honeycomb, .dr-network, svg')) {
          window.__DR_AMBIENT_LOCKED = true;
        }
      }
    } catch (e2) {}
  }

  dedupe();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dedupe);
  }
  setTimeout(dedupe, 100);
  setTimeout(dedupe, 400);
  setTimeout(dedupe, 900);
  setTimeout(dedupe, 1800);
  setInterval(function () {
    try {
      if (loginVisible()) dedupe();
    } catch (e) {}
  }, 4000);

  window.DRLoginBgSingle = { v: 1, refresh: dedupe };
})();
