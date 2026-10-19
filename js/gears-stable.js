/**
 * Divine Rays — gears-stable v2
 * Portal gears paint once and never rebuild (stops twitch).
 * Login ECG stays independent on same #dr-lifeline when on login.
 */
(function () {
  'use strict';
  if (window.__DR_GEARS_STABLE >= 2) return;
  window.__DR_GEARS_STABLE = 2;

  var painted = false;
  var CSS_ID = 'dr-gears-stable-css';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.dr-portal-ok #dr-lifeline,body.is-portal #dr-lifeline,',
      'html[data-dr-portal-pref] #dr-lifeline{',
      '  display:block!important;visibility:visible!important;opacity:1!important;',
      '  filter:none!important;-webkit-filter:none!important;',
      '  transition:none!important}',
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw,body.is-portal #dr-lifeline .dr-spin-cw,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw,body.is-portal #dr-lifeline .dr-spin-ccw,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw-fast,body.is-portal #dr-lifeline .dr-spin-cw-fast,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw-slow,body.is-portal #dr-lifeline .dr-spin-ccw-slow{',
      '  animation-play-state:running!important;filter:none!important}',
      '#dr-portal-ambient,#dr-portal-ambient *{filter:none!important;transition:none!important}',
      '#dr-portal-ambient .dr-hc{opacity:1!important}'
    ].join('');
  }

  function hasGears() {
    try {
      var box = document.getElementById('dr-lifeline');
      return !!(box && box.querySelector('.dr-spin-cw'));
    } catch (e) {
      return false;
    }
  }

  function onPortal() {
    try {
      if (
        document.body &&
        (document.body.classList.contains('dr-portal-ok') || document.body.classList.contains('is-portal'))
      )
        return true;
      var pref = document.documentElement.getAttribute('data-dr-portal-pref') || '';
      return pref === 'employee' || pref === 'admin';
    } catch (e) {
      return false;
    }
  }

  function onLogin() {
    try {
      var ls = document.getElementById('login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function patchHeartbeat() {
    try {
      if (!window.DRHeartbeatDraw) return false;
      var orig = window.DRHeartbeatDraw.ensureGears;
      if (typeof orig !== 'function') return false;
      if (orig.__drStable2) return true;

      window.DRHeartbeatDraw.ensureGears = function (force) {
        if (onLogin() && !onPortal()) return;
        if (hasGears()) {
          painted = true;
          try {
            document.documentElement.setAttribute('data-dr-gears-ready', '1');
          } catch (e) {}
          return;
        }
        try {
          return orig.call(window.DRHeartbeatDraw, false);
        } catch (e2) {}
      };
      window.DRHeartbeatDraw.ensureGears.__drStable2 = 1;

      try {
        if (window.__DR_ECG_INTERVAL) {
          clearInterval(window.__DR_ECG_INTERVAL);
          window.__DR_ECG_INTERVAL = setInterval(function () {
            try {
              if (onLogin() && window.__DR_ECG_OK && !document.querySelector('#dr-lifeline .dr-ecg-core')) {
                if (window.DRHeartbeatDraw.force) window.DRHeartbeatDraw.force();
              }
              if (onPortal() && !hasGears()) {
                window.DRHeartbeatDraw.ensureGears(false);
              }
            } catch (eI) {}
          }, 5000);
        }
      } catch (e3) {}
      return true;
    } catch (e) {
      return false;
    }
  }

  function tick() {
    injectCss();
    patchHeartbeat();
    if (onPortal() && !hasGears()) {
      try {
        if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.ensureGears)
          window.DRHeartbeatDraw.ensureGears(false);
      } catch (e) {}
    }
    if (hasGears()) painted = true;
  }

  tick();
  setTimeout(tick, 50);
  setTimeout(tick, 200);
  setTimeout(tick, 600);
  setTimeout(tick, 1500);
  setInterval(tick, 6000);

  window.DRGearsStable = { v: 2, refresh: tick };
})();
