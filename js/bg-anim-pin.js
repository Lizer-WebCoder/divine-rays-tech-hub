/**
 * Divine Rays — PINNED background animations guard v2
 * Never re-injects old a9046e48. Pins heartbeat-draw v28.
 */
(function () {
  'use strict';
  if (window.__DR_BG_ANIM_PIN >= 2) return;
  window.__DR_BG_ANIM_PIN = 2;

  var HB_SHA = '0f5ae49d8c798d58d91acf840190dab5cf059408';
  var HB =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@' +
    HB_SHA +
    '/js/heartbeat-draw.js';
  var NEED = 28;

  function assertFlags() {
    try {
      window.__DR_ECG_OK = true;
      document.documentElement.setAttribute('data-ecg', 'on');
    } catch (e) {}
  }

  function stripOldScripts() {
    try {
      document.querySelectorAll('script[src*="heartbeat-draw.js"]').forEach(function (s) {
        var src = s.getAttribute('src') || '';
        if (src.indexOf('a9046e48') !== -1 || src.indexOf(HB_SHA) === -1) {
          try { s.parentNode && s.parentNode.removeChild(s); } catch (e) {}
        }
      });
    } catch (e2) {}
  }

  function ensureScript() {
    assertFlags();
    stripOldScripts();
    if (window.__DR_HEARTBEAT_DRAW >= NEED) return;
    try {
      var s = document.createElement('script');
      s.src = HB + '?b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  function purgeGhosts() {
    try {
      var main = document.getElementById('dr-lifeline');
      document.querySelectorAll('#dr-lifeline').forEach(function (el) {
        if (main && el !== main && el.parentNode) el.parentNode.removeChild(el);
      });
      document.querySelectorAll('.dr-ecg-core, .dr-ecg-glow').forEach(function (el) {
        if (!el.closest('#dr-lifeline') && el.parentNode) el.parentNode.removeChild(el);
      });
    } catch (e) {}
  }

  function protectCss() {
    var id = 'dr-bg-anim-pin-css';
    if (document.getElementById(id)) return;
    var el = document.createElement('style');
    el.id = id;
    el.textContent = [
      'html[data-ecg="on"] #dr-lifeline{display:block!important;visibility:visible!important;pointer-events:none!important}',
      '#dr-lifeline{pointer-events:none!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function tick() {
    assertFlags();
    protectCss();
    ensureScript();
    purgeGhosts();
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);
  setInterval(tick, 5000);

  window.DRBgAnimPin = { refresh: tick, v: 2 };
})();
