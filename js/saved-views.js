/**
 * Divine Rays — saved views helpers
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function fixEmpty() {
    var list = document.getElementById('saved-views-list');
    if (!list) return;
    if (!list.children.length || (list.textContent || '').indexOf('None yet') !== -1) {
      if (!list.querySelector('.sv-empty')) {
        list.innerHTML = '<p class="sv-empty kb-sub" style="opacity:0.7;margin:0.5rem 0">No saved views yet. Apply filters, then click Save view.</p>';
      }
    }
  }

  function boot() {
    fixEmpty();
    var list = document.getElementById('saved-views-list');
    if (list) {
      new MutationObserver(fixEmpty).observe(list, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 400);

  window.DR_SAVED_VIEWS = { refresh: fixEmpty };
})();
