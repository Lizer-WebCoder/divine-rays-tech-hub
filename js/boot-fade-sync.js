/**
 * Divine Rays — boot fade sync v1.1
 * Real 1.2s opacity fade (no instant visibility:hidden).
 * After fade → enable ECG and start lifeline immediately.
 */
(function () {
  'use strict';
  if (window.__DR_BOOT_FADE_SYNC >= 2) return;
  window.__DR_BOOT_FADE_SYNC = 2;

  var FADE_MS = 1200;

  function injectCss() {
    var id = 'dr-boot-fade-sync-css';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#dr-boot-overlay{',
      'transition:opacity 1.2s ease!important;',
      'opacity:1;',
      'visibility:visible!important;',
      '}',
      '#dr-boot-overlay.is-done{',
      'opacity:0!important;',
      'pointer-events:none!important;',
      'visibility:visible!important;',
      '}',
      '#dr-boot-overlay.dr-boot-removed{display:none!important;visibility:hidden!important}'
    ].join('');
  }

  function enableEcgAndStart() {
    try {
      window.__DR_BOOT_DONE = true;
      window.__DR_ECG_OK = true;
      document.documentElement.setAttribute('data-ecg', 'on');
    } catch (e) {}
    try {
      if (window.DRHeartbeatDraw && typeof window.DRHeartbeatDraw.force === 'function') {
        window.DRHeartbeatDraw.force();
      } else if (window.DRHeartbeatDraw && typeof window.DRHeartbeatDraw.refresh === 'function') {
        window.DRHeartbeatDraw.refresh();
      }
    } catch (e2) {}
  }

  function dismissWithFade() {
    injectCss();
    var o = document.getElementById('dr-boot-overlay');
    if (!o) {
      try { document.body.classList.remove('dr-boot-holding', 'dr-session-restoring'); } catch (e) {}
      enableEcgAndStart();
      return;
    }
    if (o.getAttribute('data-dr-fading') === '1') return;
    o.setAttribute('data-dr-fading', '1');

    try { document.body.classList.remove('dr-boot-holding', 'dr-session-restoring'); } catch (e2) {}

    try {
      o.style.setProperty('transition', 'opacity 1.2s ease', 'important');
      o.style.setProperty('visibility', 'visible', 'important');
      o.style.setProperty('opacity', '1', 'important');
      void o.offsetWidth;
      o.classList.add('is-done');
      o.style.setProperty('opacity', '0', 'important');
    } catch (e3) {
      o.classList.add('is-done');
    }

    setTimeout(function () {
      try {
        o.classList.add('dr-boot-removed');
        if (o.parentNode) o.parentNode.removeChild(o);
      } catch (e4) {}
      enableEcgAndStart();
    }, FADE_MS + 40);
  }

  function wrapDismiss() {
    window.__DR_DISMISS_BOOT = function () {
      dismissWithFade();
    };
  }

  injectCss();
  wrapDismiss();
  var n = 0;
  var iv = setInterval(function () {
    n++;
    injectCss();
    wrapDismiss();
    if (n > 50) clearInterval(iv);
  }, 80);

  window.DRBootFadeSync = { dismiss: dismissWithFade, v: 2 };
})();
