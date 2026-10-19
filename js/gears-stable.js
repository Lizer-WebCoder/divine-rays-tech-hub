/**
 * Divine Rays — gears-stable v3
 * Paint portal gears once. Never rebuild on alt-tab / focus / visibility.
 */
(function () {
  'use strict';
  if (window.__DR_GEARS_STABLE >= 3) return;
  window.__DR_GEARS_STABLE = 3;

  var CSS_ID = 'dr-gears-stable-css';
  var locked = false;

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.dr-portal-ok #dr-lifeline,body.is-portal #dr-lifeline,html[data-dr-portal-pref] #dr-lifeline{',
      'display:block!important;visibility:visible!important;opacity:1!important;',
      'filter:none!important;-webkit-filter:none!important;transition:none!important}',
      '#dr-lifeline .dr-spin-cw,#dr-lifeline .dr-spin-ccw,#dr-lifeline .dr-spin-cw-fast,#dr-lifeline .dr-spin-ccw-slow{',
      'animation-play-state:running!important;filter:none!important}',
      '#dr-portal-ambient,#dr-portal-ambient *{filter:none!important;transition:none!important}',
      '#dr-post-login-boot,#dr-portal-loader{transition:opacity 0.65s ease,visibility 0.65s ease}',
      '#dr-post-login-boot.is-done,#dr-portal-loader.is-done{opacity:0!important;visibility:hidden!important;pointer-events:none!important}'
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
      if (orig.__drStable3) return true;

      window.DRHeartbeatDraw.ensureGears = function () {
        if (onLogin() && !onPortal()) return;
        if (hasGears() || locked) {
          locked = true;
          try {
            document.documentElement.setAttribute('data-dr-gears-ready', '1');
          } catch (e) {}
          return;
        }
        try {
          orig.call(window.DRHeartbeatDraw, false);
        } catch (e2) {}
        if (hasGears()) locked = true;
      };
      window.DRHeartbeatDraw.ensureGears.__drStable3 = 1;

      try {
        if (window.__DR_ECG_INTERVAL) {
          clearInterval(window.__DR_ECG_INTERVAL);
          window.__DR_ECG_INTERVAL = setInterval(function () {
            try {
              if (onLogin() && window.__DR_ECG_OK && !document.querySelector('#dr-lifeline .dr-ecg-core')) {
                if (window.DRHeartbeatDraw.force) window.DRHeartbeatDraw.force();
              }
              if (onPortal() && !hasGears() && !locked) {
                window.DRHeartbeatDraw.ensureGears(false);
              }
            } catch (eI) {}
          }, 6000);
        }
      } catch (e3) {}
      return true;
    } catch (e) {
      return false;
    }
  }

  function onVis() {
    if (hasGears()) {
      locked = true;
      try {
        var box = document.getElementById('dr-lifeline');
        if (box) {
          box
            .querySelectorAll('.dr-spin-cw, .dr-spin-ccw, .dr-spin-cw-fast, .dr-spin-ccw-slow')
            .forEach(function (g) {
              try {
                g.style.animationPlayState = 'running';
              } catch (e) {}
            });
        }
      } catch (e2) {}
    }
  }

  function tick() {
    injectCss();
    patchHeartbeat();
    if (onPortal() && !hasGears() && !locked) {
      try {
        if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.ensureGears)
          window.DRHeartbeatDraw.ensureGears(false);
      } catch (e) {}
    }
    if (hasGears()) locked = true;
  }

  tick();
  setTimeout(tick, 50);
  setTimeout(tick, 300);
  setTimeout(tick, 1000);
  setInterval(tick, 8000);

  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pageshow', onVis);
  window.addEventListener('focus', onVis);

  window.DRGearsStable = { v: 3, refresh: tick };
})();
