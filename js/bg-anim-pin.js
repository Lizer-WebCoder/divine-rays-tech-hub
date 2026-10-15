/**
 * Divine Rays — bg-anim-pin v5
 * Pins heartbeat v31 only. Does not keep re-injecting old ECG.
 */
(function () {
  'use strict';
  if (window.__DR_BG_ANIM_PIN >= 5) return;
  window.__DR_BG_ANIM_PIN = 5;

  var HB_SHA = 'ee55f47e2ee25c39f696dff993dd30147d9b6398';
  var HB =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@' +
    HB_SHA +
    '/js/heartbeat-draw.js';
  var NEED = 31;

  function bootStillUp() {
    try {
      if (window.__DR_BOOT_DONE === true) {
        var oD = document.getElementById('dr-boot-overlay');
        if (!oD || oD.classList.contains('dr-boot-removed')) return false;
        if (oD.classList.contains('is-done')) {
          try {
            return parseFloat(window.getComputedStyle(oD).opacity || '0') > 0.08;
          } catch (e) { return false; }
        }
      }
      if (document.body && document.body.classList.contains('dr-boot-holding')) return true;
      var o = document.getElementById('dr-boot-overlay');
      if (o && !o.classList.contains('is-done') && !o.classList.contains('dr-boot-removed')) return true;
    } catch (e3) {}
    return false;
  }

  function assertFlags() {
    if (bootStillUp()) return;
    try {
      window.__DR_BOOT_DONE = true;
      window.__DR_ECG_OK = true;
      document.documentElement.setAttribute('data-ecg', 'on');
    } catch (e) {}
  }

  function ensureScript() {
    if (window.__DR_HEARTBEAT_DRAW >= NEED) return;
    try {
      var s = document.createElement('script');
      s.src = HB + '?b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  function neuterOldHeartbeats() {
    try {
      if (window.__DR_HEARTBEAT_DRAW < NEED && window.__DR_ECG_INTERVAL) {
        clearInterval(window.__DR_ECG_INTERVAL);
        window.__DR_ECG_INTERVAL = null;
      }
      if (window.__DR_ECG_TIMER) {
        clearTimeout(window.__DR_ECG_TIMER);
        window.__DR_ECG_TIMER = null;
      }
    } catch (e) {}
  }

  function tick() {
    neuterOldHeartbeats();
    ensureScript();
    assertFlags();
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);

  window.DRBgAnimPin = { refresh: tick, v: 5 };
})();
