/**
 * Divine Rays — login card display labels (UI only)
 * Tabs: Employee / Admin; Admin form: Email + Create Admin account
 * No MutationObserver (avoids freeze). Apply only when text differs.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS >= 3) return;
  window.__DR_LOGIN_TAB_LABELS = 3;

  var _applying = false;

  function applyTabs() {
    document.querySelectorAll('.ltab').forEach(function (btn) {
      var tab = (btn.getAttribute('data-ltab') || '').toLowerCase();
      var tx = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (tab === 'customer') {
        if (tx !== 'Employee') btn.textContent = 'Employee';
      } else if (tab === 'agent') {
        if (tx !== 'Admin') btn.textContent = 'Admin';
      } else if (/end[-\s]?user|customer/i.test(tx) && tx !== 'Employee') {
        btn.textContent = 'Employee';
      } else if (/tech\s*support|\bagent\b/i.test(tx) && tx !== 'Admin') {
        btn.textContent = 'Admin';
      }
    });
  }

  function applyAdminForm() {
    var form = document.getElementById('login-agent');
    if (!form) return;

    var lab = form.querySelector('label[for="agent-username"]');
    if (lab) {
      var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
      if (t !== 'Email') lab.textContent = 'Email';
    }

    var sw = form.querySelector('.login-switch');
    if (!sw) return;
    var link = sw.querySelector('a');
    if (!link) return;

    if ((link.textContent || '').trim() !== 'Create Admin account') {
      link.textContent = 'Create Admin account';
    }

    /* Strip "New agent?" text nodes once */
    var nodes = Array.prototype.slice.call(sw.childNodes);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType === 3 && (n.textContent || '').replace(/\s+/g, '')) {
        n.textContent = '';
      }
    }
  }

  function apply() {
    if (_applying) return;
    _applying = true;
    try {
      applyTabs();
      applyAdminForm();
    } catch (e) {
    } finally {
      _applying = false;
    }
  }

  function boot() {
    apply();
    /* Few retries while shell finishes writing login HTML — no observer */
    var n = 0;
    var t = setInterval(function () {
      apply();
      n++;
      if (n >= 12) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Occasional light check (not every mutation) */
  setInterval(apply, 3000);
})();
