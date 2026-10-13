/**
 * Divine Rays — PINNED background animations guard v3
 * ECG flags only after boot overlay is done — keeps lifeline in sync with fade.
 */
(function () {
  'use strict';
  if (window.__DR_BG_ANIM_PIN >= 3) return;
  window.__DR_BG_ANIM_PIN = 3;

  var HB_SHA = '3bc50d042182f34d7c05eb077927231267170e5a';
  var HB =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@' +
    HB_SHA +
    '/js/heartbeat-draw.js';
  var NEED = 29;

  function bootStillUp() {
    try {
      if (window.__DR_BOOT_DONE === true) {
        var oD = document.getElementById('dr-boot-overlay');
        if (!oD) return false;
        if (oD.classList.contains('is-done')) {
          try {
            return parseFloat(window.getComputedStyle(oD).opacity || '0') > 0.05;
          } catch (e) { return false; }
        }
      }
      if (document.body && document.body.classList.contains('dr-boot-holding')) return true;
      var o = document.getElementById('dr-boot-overlay');
      if (o && !o.classList.contains('is-done')) return true;
      if (o && o.classList.contains('is-done')) {
        try {
          if (parseFloat(window.getComputedStyle(o).opacity || '0') > 0.05) return true;
        } catch (e2) {}
      }
      var boot = document.getElementById('boot');
      if (boot && !boot.hidden) {
        var st = window.getComputedStyle(boot);
        if (st.display !== 'none' && st.visibility !== 'hidden') return true;
      }
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
      if (bootStillUp()) {
        document.querySelectorAll('#dr-lifeline').forEach(function (el) {
          try {
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
          } catch (e) {}
        });
        return;
      }
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
      '#dr-lifeline{pointer-events:none!important}',
      'body.dr-boot-holding #dr-lifeline{opacity:0!important;visibility:hidden!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function tick() {
    protectCss();
    ensureScript();
    assertFlags();
    purgeGhosts();
  }

  tick();
  setTimeout(tick, 200);
  setTimeout(tick, 600);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(tick, 800);

  window.DRBgAnimPin = { refresh: tick, v: 3 };
})();
