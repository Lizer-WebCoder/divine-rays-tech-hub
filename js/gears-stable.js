/**
 * Divine Rays — gears-stable v1
 * Stop portal gears/honeycomb from resetting (twitch).
 * Patches ensureGears to paint once only.
 */
(function () {
  'use strict';
  if (window.__DR_GEARS_STABLE >= 1) return;
  window.__DR_GEARS_STABLE = 1;

  var painted = false;

  function stableEnsure() {
    try {
      var box = document.getElementById('dr-lifeline');
      if (box && box.querySelector('.dr-spin-cw')) {
        painted = true;
        document.documentElement.setAttribute('data-dr-gears-ready', '1');
        return;
      }
      if (window.DRHeartbeatDraw && typeof window.DRHeartbeatDraw.ensureGears === 'function') {
        // Call original only if missing
        if (!painted) {
          window.DRHeartbeatDraw.ensureGears(false);
          if (document.querySelector('#dr-lifeline .dr-spin-cw')) painted = true;
        }
      }
    } catch (e) {}
  }

  function patch() {
    try {
      if (!window.DRHeartbeatDraw) return false;
      var orig = window.DRHeartbeatDraw.ensureGears;
      if (typeof orig !== 'function') return false;
      if (orig.__drStable) return true;
      window.DRHeartbeatDraw.ensureGears = function (force) {
        try {
          var box = document.getElementById('dr-lifeline');
          if (box && box.querySelector('.dr-spin-cw')) {
            painted = true;
            document.documentElement.setAttribute('data-dr-gears-ready', '1');
            return;
          }
        } catch (e) {}
        return orig.call(window.DRHeartbeatDraw, false);
      };
      window.DRHeartbeatDraw.ensureGears.__drStable = 1;
      return true;
    } catch (e2) {
      return false;
    }
  }

  function tick() {
    patch();
    stableEnsure();
  }

  tick();
  setTimeout(tick, 100);
  setTimeout(tick, 500);
  setTimeout(tick, 1200);
  setInterval(tick, 5000);

  window.DRGearsStable = { v: 1, refresh: tick };
})();
