/**
 * Divine Rays — PINNED background animations guard v3.1
 * ECG only after boot; pins heartbeat v30.
 */
(function () {
  'use strict';
  if (window.__DR_BG_ANIM_PIN >= 4) return;
  window.__DR_BG_ANIM_PIN = 4;

  var HB_SHA = '80f8a73413ed5698b24c61856ddc5a1569714ac0';
  var HB =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@' +
    HB_SHA +
    '/js/heartbeat-draw.js';
  var NEED = 30;

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

  function tick() {
    ensureScript();
    assertFlags();
  }

  tick();
  setTimeout(tick, 300);
  setTimeout(tick, 1000);
  setInterval(tick, 2000);

  window.DRBgAnimPin = { refresh: tick, v: 4 };
})();
