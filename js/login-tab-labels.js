/**
 * Divine Rays — login card labels v5 (UI only)
 * Admin tab (not Tech Support), Email label + placeholders
 * End-User tab left as End-User
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS >= 5) return;
  window.__DR_LOGIN_TAB_LABELS = 5;

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
      if (tab === 'agent' || /tech\s*support|\bagent\b/i.test(tx)) {
        if (tx !== 'Admin') btn.textContent = 'Admin';
      }
      /* Keep End-User as End-User — do not force Employee */
      if (tab === 'customer' || /end[-\s]?user|customer/i.test(tx)) {
        if (/employee/i.test(tx)) btn.textContent = 'End-User';
        else if (tx !== 'End-User' && !/end[-\s]?user/i.test(tx)) {
          /* leave native End-User wording */
        }
        if (/tech\s*support/i.test(tx)) btn.textContent = 'Admin';
      }
    });
    /* hard pass: any tab still saying Tech Support */
    document.querySelectorAll('.ltab, [data-ltab="agent"], button').forEach(function (btn) {
      var tx = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (/^tech\s*support$/i.test(tx)) btn.textContent = 'Admin';
    });
  }

  function applyAdminLoginForm() {
    var form = document.getElementById('login-agent');
    if (!form) return;

    /* Label: Email only */
    var lab =
      form.querySelector('label[for="agent-username"]') ||
      form.querySelector('label[for="agent-email"]');
    if (lab) setText(lab, 'Email');

    form.querySelectorAll('label').forEach(function (l) {
      var t = (l.textContent || '').replace(/\s+/g, ' ').trim();
      if (/username\s*or\s*email/i.test(t) || /^username$/i.test(t)) setText(l, 'Email');
    });

    /* Placeholders from design: you@company.com + dots */
    var emailInput =
      form.querySelector('#agent-username') ||
      form.querySelector('#agent-email') ||
      form.querySelector('input[type="email"]') ||
      form.querySelector('input[name*="user"], input[name*="email"]');
    if (emailInput) {
      emailInput.setAttribute('placeholder', 'you@company.com');
      emailInput.setAttribute('type', 'email');
      emailInput.setAttribute('autocomplete', 'username');
    }

    var passInput =
      form.querySelector('#agent-password') ||
      form.querySelector('input[type="password"]');
    if (passInput) {
      passInput.setAttribute('placeholder', '••••••••');
      passInput.setAttribute('autocomplete', 'current-password');
    }

    var sw = form.querySelector('.login-switch');
    if (sw) {
      var link = sw.querySelector('a');
      if (link) {
        var lt = (link.textContent || '').replace(/\s+/g, ' ').trim();
        if (/create\s+agent/i.test(lt) || /new\s+agent/i.test(lt)) {
          setText(link, 'Create Admin account');
        }
      }
      var nodes = Array.prototype.slice.call(sw.childNodes);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.nodeType === 3 && /new\s+agent|agent\?/i.test(n.textContent || '')) {
          n.textContent = 'New admin? ';
        }
      }
    }
  }

  function applyRegisterCards() {
    document.querySelectorAll('.login-card-register .reg-title, #login-screen .reg-title').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/create\s+agent\s+account/i.test(t)) setText(el, 'Create Admin Account');
    });

    document.querySelectorAll('.login-card-register .reg-sub, #login-screen .reg-sub').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/tech\s*support\s*registration/i.test(t) || /^agent\s*registration$/i.test(t)) {
        setText(el, 'Admin Registration');
      }
    });

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
      if (n >= 20) clearInterval(t);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setInterval(apply, 2500);
  window.DRLoginTabLabels = { refresh: apply, v: 5 };
})();
