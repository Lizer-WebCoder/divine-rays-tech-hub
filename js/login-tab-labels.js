/**
 * Divine Rays — login card display labels (UI only)
 * Tabs: Employee / Admin
 * Admin form: Email + Create Admin account
 * Register: End-User Registration; Create Admin Account + Admin Registration
 * No MutationObserver (avoids freeze).
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS >= 4) return;
  window.__DR_LOGIN_TAB_LABELS = 4;

  var _applying = false;

  function setText(el, want) {
    if (!el) return;
    var cur = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (cur !== want) el.textContent = want;
  }

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

  function applyAdminLoginForm() {
    var form = document.getElementById('login-agent');
    if (!form) return;

    var lab = form.querySelector('label[for="agent-username"]');
    if (lab) setText(lab, 'Email');

    var sw = form.querySelector('.login-switch');
    if (!sw) return;
    var link = sw.querySelector('a');
    if (!link) return;
    setText(link, 'Create Admin account');
    var nodes = Array.prototype.slice.call(sw.childNodes);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType === 3 && (n.textContent || '').replace(/\s+/g, '')) {
        n.textContent = '';
      }
    }
  }

  function applyRegisterCards() {
    /* Titles */
    document.querySelectorAll('.login-card-register .reg-title, #login-screen .reg-title').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/create\s+agent\s+account/i.test(t)) setText(el, 'Create Admin Account');
      else if (/create\s+end[-\s]?user\s+account/i.test(t)) setText(el, 'Create End-User Account');
    });

    /* Subtitles */
    document.querySelectorAll('.login-card-register .reg-sub, #login-screen .reg-sub').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/tech\s*support\s*registration/i.test(t) || /^agent\s*registration$/i.test(t)) {
        setText(el, 'Admin Registration');
      } else if (/end[-\s]?user\s*registration/i.test(t)) {
        setText(el, 'End-User Registration');
      }
    });

    /* Submit buttons on agent register form */
    var agentForm =
      document.getElementById('dr-register-form-agent') ||
      document.getElementById('register-agent') ||
      document.querySelector('#dr-register-card-agent form');
    if (agentForm) {
      agentForm.querySelectorAll('button[type="submit"]').forEach(function (btn) {
        var t = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (/create\s+agent\s+account/i.test(t) || /create\s+admin\s+account/i.test(t)) {
          setText(btn, 'Create Admin Account');
        }
      });
    }

    /* Fallback: any register card button with Agent wording */
    document.querySelectorAll('.login-card-register button[type="submit"]').forEach(function (btn) {
      var t = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (/create\s+agent\s+account/i.test(t)) setText(btn, 'Create Admin Account');
    });
  }

  function apply() {
    if (_applying) return;
    _applying = true;
    try {
      applyTabs();
      applyAdminLoginForm();
      applyRegisterCards();
    } catch (e) {
    } finally {
      _applying = false;
    }
  }

  function boot() {
    apply();
    var n = 0;
    var t = setInterval(function () {
      apply();
      n++;
      if (n >= 15) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setInterval(apply, 3000);
})();
