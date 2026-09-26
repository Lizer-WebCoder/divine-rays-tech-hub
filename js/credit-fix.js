/**
 * Divine Rays — unified credit text
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CREDIT_FIX) return;
  window.__DR_CREDIT_FIX = 1;

  var TEXT = 'Boyz at the Back LRK · All Rights Reserved';

  function apply() {
    try {
      document.querySelectorAll('.credit, .credit-side, .credit-footer').forEach(function (el) {
        if (el.textContent.trim() !== TEXT) el.textContent = TEXT;
      });
      document.querySelectorAll('p, span, small, div').forEach(function (el) {
        if (el.children && el.children.length) return;
        var t = (el.textContent || '').trim();
        if (/lizzz?\s*[·•\-–]?\s*all\s*rights\s*reserved/i.test(t)) {
          el.textContent = TEXT;
        }
        if (/boyz at the back\s*[·•]?\s*all\s*rights\s*reserved/i.test(t) && t !== TEXT) {
          el.textContent = TEXT;
        }
      });
    } catch (e) {}
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  setTimeout(apply, 400);
  setTimeout(apply, 1500);
  setTimeout(apply, 4000);
  setInterval(apply, 10000);

  window.DRCreditFix = { refresh: apply, text: TEXT };
})();
