/**
 * Divine Rays — force-light-bg stub v16
 * Ambient honeycomb is handled by login-ambient-oneshot.js (one-shot, freeze-safe).
 * This file only keeps login transparent so ECG + ambient show through.
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG >= 16) return;
  window.__DR_FORCE_LIGHT_BG = 16;

  function apply() {
    try {
      document.querySelectorAll('#login-screen, .login-screen').forEach(function (el) {
        el.style.setProperty('background', 'transparent', 'important');
        el.style.setProperty('background-image', 'none', 'important');
      });
    } catch (e) {}
  }

  apply();
  setTimeout(apply, 300);
  window.DRForceLightBg = { refresh: apply };
})();
