/**
 * Divine Rays — Inline ECG DISABLED
 * Was causing early ECG on black boot screen.
 * Real ECG is heartbeat-draw.js only, gated by data-ecg=on.
 * Credit: Boyz at the Back LRK
 */
(function () {
  'use strict';
  window.__DR_ECG_INLINE = 99;
  /* no-op: do not draw anything */
})();
