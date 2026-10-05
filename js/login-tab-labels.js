/**
 * Divine Rays — login card display labels (UI only)
 * Tabs: End-User → Employee, Tech Support → Admin
 * Admin form: label Email, link "Create Admin account" (no "New agent?")
 * Backend roles unchanged.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS >= 2) return;
  window.__DR_LOGIN_TAB_LABELS = 2;

  function applyTabs() {
    try {
      document.querySelectorAll('.ltab').forEach(function (btn) {
        var tab = (btn.getAttribute('data-ltab') || '').toLowerCase();
        var tx = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (tab === 'customer' || /end[-\s]?user|customer|employee/i.test(tx)) {
          if (tx !== 'Employee') btn.textContent = 'Employee';
        } else if (tab === 'agent' || /tech\s*support|agent|admin/i.test(tx)) {
          if (tx !== 'Admin') btn.textContent = 'Admin';
        }
      });
    } catch (e) {}
  }

  function applyAdminForm() {
    try {
      var form = document.getElementById('login-agent');
      if (!form) return;

      /* Label: Username or Email / Email or Username → Email */
      var lab = form.querySelector('label[for="agent-username"]');
      if (lab) {
        var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
        if (/username|email/i.test(t) && t !== 'Email') lab.textContent = 'Email';
      }

      /* Switch line: drop "New agent?" and set link text */
      var sw = form.querySelector('.login-switch');
      if (sw) {
        var link = sw.querySelector('a');
        if (link) {
          if ((link.textContent || '').trim() !== 'Create Admin account') {
            link.textContent = 'Create Admin account';
          }
          /* Keep only the link — remove "New agent?" prefix text */
          Array.prototype.slice.call(sw.childNodes).forEach(function (n) {
            if (n.nodeType === 3) {
              n.textContent = '';
            }
          });
        } else {
          sw.textContent = '';
        }
      }
    } catch (e2) {}
  }

  function apply() {
    applyTabs();
    applyAdminForm();
  }

  apply();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  }
  setInterval(apply, 800);
  try {
    var obs = new MutationObserver(function () {
      apply();
    });
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
      });
    }
  } catch (e3) {}
})();
