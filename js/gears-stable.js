/**
 * Divine Rays — gears-stable v4
 * Paint once; never rebuild on alt-tab.
 * Kick CSS spin after post-login so gears are not frozen.
 */
(function () {
  'use strict';
  if (window.__DR_GEARS_STABLE >= 4) return;
  window.__DR_GEARS_STABLE = 4;

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
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw,body.is-portal #dr-lifeline .dr-spin-cw,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw,body.is-portal #dr-lifeline .dr-spin-ccw,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-cw-fast,body.is-portal #dr-lifeline .dr-spin-cw-fast,',
      'body.dr-portal-ok #dr-lifeline .dr-spin-ccw-slow,body.is-portal #dr-lifeline .dr-spin-ccw-slow{',
      'display:block!important;visibility:visible!important;',
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

  function kickAnimations() {
    try {
      var box = document.getElementById('dr-lifeline');
      if (!box) return false;
      var nodes = box.querySelectorAll('.dr-spin-cw, .dr-spin-ccw, .dr-spin-cw-fast, .dr-spin-ccw-slow');
      if (!nodes.length) return false;
      for (var i = 0; i < nodes.length; i++) {
        var g = nodes[i];
        g.style.animation = 'none';
        g.style.animationPlayState = 'paused';
      }
      void box.offsetWidth;
      for (var j = 0; j < nodes.length; j++) {
        var g2 = nodes[j];
        var name2 = 'drGearCW';
        var dur2 = '30s';
        if (g2.classList.contains('dr-spin-cw-fast')) {
          name2 = 'drGearCW';
          dur2 = '18s';
        } else if (g2.classList.contains('dr-spin-ccw-slow')) {
          name2 = 'drGearCCW';
          dur2 = '36s';
        } else if (g2.classList.contains('dr-spin-ccw')) {
          name2 = 'drGearCCW';
          dur2 = '24s';
        }
        g2.style.animation = name2 + ' ' + dur2 + ' linear infinite';
        g2.style.animationPlayState = 'running';
      }
      locked = true;
      try {
        document.documentElement.setAttribute('data-dr-gears-ready', '1');
      } catch (e) {}
      return true;
    } catch (e2) {
      return false;
    }
  }

  function patchHeartbeat() {
    try {
      if (!window.DRHeartbeatDraw) return false;
      var orig = window.DRHeartbeatDraw.ensureGears;
      if (typeof orig !== 'function') return false;
      if (orig.__drStable4) return true;

      window.DRHeartbeatDraw.ensureGears = function () {
        if (onLogin() && !onPortal()) return;
        if (hasGears()) {
          locked = true;
          try {
            document.documentElement.setAttribute('data-dr-gears-ready', '1');
          } catch (e) {}
          return;
        }
        if (locked) return;
        try {
          orig.call(window.DRHeartbeatDraw, false);
        } catch (e2) {}
        if (hasGears()) {
          locked = true;
          setTimeout(kickAnimations, 30);
          setTimeout(kickAnimations, 200);
        }
      };
      window.DRHeartbeatDraw.ensureGears.__drStable4 = 1;
      window.DRHeartbeatDraw.kickGears = kickAnimations;

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
      if (!document.hidden) kickAnimations();
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
  setTimeout(function () {
    if (onPortal() && hasGears()) kickAnimations();
  }, 900);
  setTimeout(function () {
    if (onPortal() && hasGears()) kickAnimations();
  }, 1600);
  setInterval(tick, 8000);

  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pageshow', onVis);
  window.addEventListener('focus', function () {
    if (onPortal() && hasGears()) kickAnimations();
  });

  window.DRGearsStable = { v: 4, refresh: tick, kick: kickAnimations };
})();
