/**
 * Divine Rays — login-bg-single v2
 * One login ambient layer. Portal honeycomb separate.
 * NEVER hide #dr-lifeline on login (ECG uses it).
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_BG_SINGLE >= 2) return;
  window.__DR_LOGIN_BG_SINGLE = 2;

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
      'body.is-login #dr-portal-ambient{display:none!important;visibility:hidden!important;opacity:0!important}',
      'html:not([data-dr-portal-pref]) body:not(.dr-portal-ok):not(.is-portal) #dr-portal-ambient{display:none!important}',
      'body.is-login #dr-lifeline .dr-spin-cw,body.is-login #dr-lifeline .dr-spin-ccw,',
      'body.is-login #dr-lifeline .dr-spin-cw-fast,body.is-login #dr-lifeline .dr-spin-ccw-slow{display:none!important}',
      'body.is-login #dr-lifeline{display:block!important;visibility:visible!important;opacity:1!important;z-index:1!important}',
      'body.is-login #dr-lifeline .dr-ecg-core,body.is-login #dr-lifeline .dr-ecg-glow{display:block!important;visibility:visible!important}'
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
        var pa = document.getElementById('dr-portal-ambient');
        if (pa) {
          pa.style.display = 'none';
          pa.style.visibility = 'hidden';
        }
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
        try {
          if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.force) {
            if (!document.querySelector('#dr-lifeline .dr-ecg-core')) {
              window.__DR_ECG_OK = true;
              window.DRHeartbeatDraw.force();
            }
          }
        } catch (eE) {}
      }
    } catch (e2) {}
  }

  dedupe();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dedupe);
  setTimeout(dedupe, 100);
  setTimeout(dedupe, 400);
  setTimeout(dedupe, 900);
  setTimeout(dedupe, 1800);
  setInterval(function () {
    try {
      if (loginVisible()) dedupe();
    } catch (e) {}
  }, 5000);

  window.DRLoginBgSingle = { v: 2, refresh: dedupe };
})();
