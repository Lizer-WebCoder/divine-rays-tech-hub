/**
 * Divine Rays — boot fade sync
 * - Real slow fade (opacity 1.2s) — no instant visibility:hidden
 * - ECG / flags enable only AFTER fade finishes
 * - Then lifeline starts immediately when login is on screen
 */
(function () {
  'use strict';
  if (window.__DR_BOOT_FADE_SYNC >= 1) return;
  window.__DR_BOOT_FADE_SYNC = 1;

  var FADE_MS = 1200;

  function injectCss() {
    var id = 'dr-boot-fade-sync-css';
    if (document.getElementById(id)) return;
    var el = document.createElement('style');
    el.id = id;
    el.textContent = [
      '#dr-boot-overlay{',
      'transition:opacity ' + (FADE_MS / 1000) + 's ease!important;',
      'opacity:1!important;visibility:visible!important;',
      '}',
      /* opacity only — visibility stays visible during fade */
      '#dr-boot-overlay.is-done{',
      'opacity:0!important;',
      'pointer-events:none!important;',
      'visibility:visible!important;',
      '}',
      '#dr-boot-overlay.dr-boot-removed{display:none!important;visibility:hidden!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function enableEcg() {
    try {
      window.__DR_BOOT_DONE = true;
      window.__DR_ECG_OK = true;
      document.documentElement.setAttribute('data-ecg', 'on');
    } catch (e) {}
    try {
      if (window.DRHeartbeatDraw && typeof window.DRHeartbeatDraw.force === 'function') {
        window.DRHeartbeatDraw.force();
      }
      if (window.DRHeartbeatDraw && typeof window.DRHeartbeatDraw.refresh === 'function') {
        window.DRHeartbeatDraw.refresh();
      }
    } catch (e2) {}
  }

  function dismissWithFade() {
    injectCss();
    var o = document.getElementById('dr-boot-overlay');
    if (!o) {
      try { document.body.classList.remove('dr-boot-holding', 'dr-session-restoring'); } catch (e) {}
      enableEcg();
      return;
    }
    if (o.getAttribute('data-dr-fading') === '1') return;
    o.setAttribute('data-dr-fading', '1');

    try { document.body.classList.remove('dr-boot-holding', 'dr-session-restoring'); } catch (e2) {}

    /* force reflow then fade */
    try {
      o.style.transition = 'opacity ' + (FADE_MS / 1000) + 's ease';
      o.style.opacity = '1';
      o.style.visibility = 'visible';
      void o.offsetWidth;
      o.classList.add('is-done');
      o.style.opacity = '0';
    } catch (e3) {
      o.classList.add('is-done');
    }

    setTimeout(function () {
      try {
        o.classList.add('dr-boot-removed');
        if (o.parentNode) o.parentNode.removeChild(o);
      } catch (e4) {}
      enableEcg();
    }, FADE_MS + 50);
  }

  function wrapDismiss() {
    var prev = window.__DR_DISMISS_BOOT;
    window.__DR_DISMISS_BOOT = function () {
      dismissWithFade();
    };
    /* if something already marked is-done without us, still run our path once */
    try {
      var o = document.getElementById('dr-boot-overlay');
      if (o && o.classList.contains('is-done') && o.getAttribute('data-dr-fading') !== '1') {
        dismissWithFade();
      }
    } catch (e) {}
    return prev;
  }

  injectCss();
  wrapDismiss();

  /* keep wrapping in case shell assigns dismiss later */
  var n = 0;
  var iv = setInterval(function () {
    n++;
    injectCss();
    wrapDismiss();
    if (n > 40) clearInterval(iv);
  }, 100);

  window.DRBootFadeSync = { dismiss: dismissWithFade, v: 1 };
})();
