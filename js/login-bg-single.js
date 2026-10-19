/**
 * Divine Rays — login-bg-single v3
 * Never force is-login when session is a portal restore (hard refresh).
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_BG_SINGLE >= 3) return;
  window.__DR_LOGIN_BG_SINGLE = 3;

  var CSS_ID = 'dr-login-bg-single-css';

  function isPortalSession() {
    try {
      var tab = sessionStorage.getItem('dr_login_tab') || '';
      var pref = sessionStorage.getItem('dr_dev_portal_pref') || '';
      if (tab === 'customer' || tab === 'agent') return true;
      if (pref === 'employee' || pref === 'admin') return true;
      var dp = document.documentElement.getAttribute('data-dr-portal-pref') || '';
      if (dp === 'employee' || dp === 'admin') return true;
      if (
        document.body &&
        (document.body.classList.contains('dr-portal-ok') ||
          document.body.classList.contains('is-portal') ||
          document.body.classList.contains('is-portal-employee') ||
          document.body.classList.contains('is-portal-admin'))
      )
        return true;
    } catch (e) {}
    return false;
  }

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.is-login #dr-login-ambient{display:block!important;visibility:visible!important;opacity:1!important;',
      'position:fixed!important;inset:0!important;z-index:0!important;pointer-events:none!important;overflow:hidden!important}',
      'body.is-login #dr-login-ambient .dr-honeycomb{opacity:0.22!important}',
      'body.is-login #dr-login-ambient .dr-network{opacity:0.5!important}',
      'body.is-login #dr-portal-ambient{display:none!important;visibility:hidden!important;opacity:0!important}',
      'html:not([data-dr-portal-pref]) body:not(.dr-portal-ok):not(.is-portal) #dr-portal-ambient{display:none!important}',
      'body.is-login:not(.dr-portal-ok):not(.is-portal) #dr-lifeline .dr-spin-cw,',
      'body.is-login:not(.dr-portal-ok):not(.is-portal) #dr-lifeline .dr-spin-ccw,',
      'body.is-login:not(.dr-portal-ok):not(.is-portal) #dr-lifeline .dr-spin-cw-fast,',
      'body.is-login:not(.dr-portal-ok):not(.is-portal) #dr-lifeline .dr-spin-ccw-slow{display:none!important}',
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw,body.is-portal #dr-lifeline .dr-spin-cw,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw,body.is-portal #dr-lifeline .dr-spin-ccw,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw-fast,body.is-portal #dr-lifeline .dr-spin-cw-fast,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw-slow,body.is-portal #dr-lifeline .dr-spin-ccw-slow,',
      'html[data-dr-portal-pref] #dr-lifeline .dr-spin-cw,html[data-dr-portal-pref] #dr-lifeline .dr-spin-ccw,',
      'html[data-dr-portal-pref] #dr-lifeline .dr-spin-cw-fast,html[data-dr-portal-pref] #dr-lifeline .dr-spin-ccw-slow{',
      'display:block!important;visibility:visible!important;opacity:1!important}',
      'html[data-dr-portal-pref] #dr-lifeline,body.dr-portal-ok #dr-lifeline,body.is-portal #dr-lifeline{',
      'display:block!important;visibility:visible!important;opacity:1!important;z-index:0!important}',
      'body.is-login #dr-lifeline{display:block!important;visibility:visible!important;opacity:1!important;z-index:1!important}',
      'body.is-login #dr-lifeline .dr-ecg-core,body.is-login #dr-lifeline .dr-ecg-glow{display:block!important;visibility:visible!important}'
    ].join('');
  }

  function loginVisible() {
    try {
      if (isPortalSession()) return false;
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
      if (isPortalSession()) {
        try {
          document.body.classList.remove('is-login');
          document.body.classList.add('dr-portal-ok', 'is-portal');
          var want = document.documentElement.getAttribute('data-dr-portal-pref') || '';
          if (!want) {
            try {
              var tab = sessionStorage.getItem('dr_login_tab') || '';
              want = tab === 'agent' ? 'admin' : tab === 'customer' ? 'employee' : '';
            } catch (eW) {}
          }
          if (want) document.documentElement.setAttribute('data-dr-portal-pref', want);
        } catch (eP) {}
        try {
          if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.ensureGears)
            window.DRHeartbeatDraw.ensureGears(true);
          else if (window.DRGearsStable && window.DRGearsStable.kick) window.DRGearsStable.kick();
        } catch (eG) {}
        return;
      }

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
              if (!isPortalSession()) window.DRHeartbeatDraw.force();
            }
          }
        } catch (eE) {}
      }
    } catch (e2) {}
  }

  dedupe();
  setTimeout(dedupe, 50);
  setTimeout(dedupe, 300);
  setTimeout(dedupe, 900);
  setTimeout(dedupe, 2000);
  setInterval(dedupe, 6000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) dedupe();
  });
  window.DRLoginBgSingle = { v: 3, refresh: dedupe };
})();
