/**
 * Divine Rays — unified credit text (centered)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_CREDIT_FIX = 1;

  var TEXT = 'Boyz at the Back LRK · All Rights Reserved';

  function apply() {
    try {
      document.querySelectorAll('.credit, .credit-side, .credit-footer, [class*="credit"]').forEach(function (el) {
        if ((el.textContent || '').trim() !== TEXT && /rights reserved|lizzz|boyz at the back/i.test(el.textContent || '')) {
          el.textContent = TEXT;
        }
        el.style.textAlign = 'center';
        el.style.display = 'block';
        el.style.width = '100%';
        el.style.marginLeft = 'auto';
        el.style.marginRight = 'auto';
      });
      document.querySelectorAll('p, span, small, div').forEach(function (el) {
        if (el.children && el.children.length) return;
        var t = (el.textContent || '').trim();
        if (/lizzz?\s*[·•\-–]?\s*all\s*rights\s*reserved/i.test(t)) {
          el.textContent = TEXT;
          el.style.textAlign = 'center';
          el.style.display = 'block';
          el.style.width = '100%';
        }
        if (/boyz at the back/i.test(t) && /rights reserved/i.test(t) && t !== TEXT) {
          el.textContent = TEXT;
          el.style.textAlign = 'center';
          el.style.display = 'block';
          el.style.width = '100%';
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
