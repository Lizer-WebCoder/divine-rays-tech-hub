/**
 * Divine Rays — gears-stable v5
 * Keep SMIL gears painted on portal; never wipe on alt-tab.
 * Force repaint when animateTransform missing (post-login / hard refresh).
 */
(function () {
  'use strict';
  if (window.__DR_GEARS_STABLE >= 5) return;
  window.__DR_GEARS_STABLE = 5;

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
      'filter:none!important;-webkit-filter:none!important}',
      '#dr-lifeline .dr-spin-cw,#dr-lifeline .dr-spin-ccw,#dr-lifeline .dr-spin-cw-fast,#dr-lifeline .dr-spin-ccw-slow{',
      'display:block!important;visibility:visible!important}',
      '#dr-portal-ambient,#dr-portal-ambient *{filter:none!important}',
      '#dr-post-login-boot,#dr-portal-loader{transition:opacity 0.85s ease,visibility 0.85s ease}',
      '#dr-post-login-boot.is-done,#dr-post-login-boot.is-fading,#dr-portal-loader.is-done,#dr-portal-loader.is-fading{',
      'opacity:0!important;visibility:hidden!important;pointer-events:none!important}'
    ].join('');
  }

  function hasLiveGears() {
    try {
      var box = document.getElementById('dr-lifeline');
      return !!(box && box.querySelector('.dr-spin-cw') && box.querySelector('animateTransform'));
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
      if (pref === 'employee' || pref === 'admin') return true;
      try {
        var t = sessionStorage.getItem('dr_login_tab') || '';
        if (t === 'customer' || t === 'agent') return true;
      } catch (e2) {}
      return false;
    } catch (e) {
      return false;
    }
  }

  function onLoginOnly() {
    try {
      if (onPortal()) return false;
      var ls = document.getElementById('login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function paint() {
    try {
      if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.ensureGears) {
        window.DRHeartbeatDraw.ensureGears(true);
      }
    } catch (e) {}
  }

  function patchHeartbeat() {
    try {
      if (!window.DRHeartbeatDraw) return false;
      var orig = window.DRHeartbeatDraw.ensureGears;
      if (typeof orig !== 'function') return false;
      if (orig.__drStable5) return true;

      window.DRHeartbeatDraw.ensureGears = function (force) {
        if (onLoginOnly()) return;
        if (!force && hasLiveGears() && locked) return;
        try {
          orig.call(window.DRHeartbeatDraw, !!force || !hasLiveGears());
        } catch (e2) {}
        if (hasLiveGears()) {
          locked = true;
          try {
            document.documentElement.setAttribute('data-dr-gears-ready', '1');
          } catch (e3) {}
        }
      };
      window.DRHeartbeatDraw.ensureGears.__drStable5 = 1;
      window.DRHeartbeatDraw.kickGears = function () {
        locked = false;
        paint();
      };
      window.DRHeartbeatDraw.force = function () {
        locked = false;
        paint();
      };
      return true;
    } catch (e) {
      return false;
    }
  }

  function tick() {
    injectCss();
    patchHeartbeat();
    if (onPortal() && !hasLiveGears()) {
      locked = false;
      paint();
    }
    if (hasLiveGears()) locked = true;
  }

  tick();
  setTimeout(tick, 80);
  setTimeout(tick, 400);
  setTimeout(tick, 1000);
  setTimeout(tick, 2000);
  setInterval(tick, 5000);

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && onPortal() && !hasLiveGears()) {
      locked = false;
      paint();
    }
  });

  window.DRGearsStable = {
    v: 5,
    refresh: tick,
    kick: function () {
      locked = false;
      paint();
    }
  };
})();
