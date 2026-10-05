/**
 * Divine Rays — login card tab labels
 * End-User → Employee, Tech Support → Admin (display only)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS) return;
  window.__DR_LOGIN_TAB_LABELS = 1;

  function apply() {
    try {
      document.querySelectorAll('.ltab').forEach(function (btn) {
        var tab = (btn.getAttribute('data-ltab') || '').toLowerCase();
        var tx = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (tab === 'customer' || /end[-\s]?user|customer/i.test(tx)) {
          if (tx !== 'Employee') btn.textContent = 'Employee';
        } else if (tab === 'agent' || /tech\s*support|agent/i.test(tx)) {
          if (tx !== 'Admin') btn.textContent = 'Admin';
        }
      });
    } catch (e) {}
  }

  apply();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  }
  setInterval(apply, 800);
  try {
    var obs = new MutationObserver(function () { apply(); });
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
      });
    }
  } catch (e2) {}
})();
