/**
 * Divine Rays — PINNED background animations guard
 * ECG lifeline (login) + Steam gears (portals) MUST stay enabled.
 * Re-asserts flags and reloads heartbeat-draw if stripped.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_BG_ANIM_PIN >= 1) return;
  window.__DR_BG_ANIM_PIN = 1;

  var HB = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@a9046e485443b24e800a4f4d10747c10146ca663/js/heartbeat-draw.js';

  function assertFlags() {
    try {
      window.__DR_ECG_OK = true;
      document.documentElement.setAttribute('data-ecg', 'on');
    } catch (e) {}
  }

  function ensureScript() {
    assertFlags();
    if (window.__DR_HEARTBEAT_DRAW >= 25) return;
    try {
      var existing = document.querySelector('script[src*="heartbeat-draw.js"]');
      if (existing && window.__DR_HEARTBEAT_DRAW) return;
      var s = document.createElement('script');
      s.src = HB + (HB.indexOf('?') === -1 ? '?' : '&') + 'b=' + Date.now();
      s.async = false;
      (document.body || document.documentElement).appendChild(s);
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
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);
  setInterval(tick, 8000);

  window.DRBgAnimPin = { refresh: tick, v: 1 };
})();
