/**
 * Divine Rays — login card labels v6
 * Tabs: Employee | Admin
 * Admin form: Email + you@company.com / password dots
 * Injected early; re-applies until stuck.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS >= 6) return;
  window.__DR_LOGIN_TAB_LABELS = 6;

  var _busy = false;

  function setText(el, want) {
    if (!el) return;
    var cur = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (cur !== want) el.textContent = want;
  }

  function applyTabs() {
    document.querySelectorAll('.ltab, button[data-ltab]').forEach(function (btn) {
      var tab = (btn.getAttribute('data-ltab') || '').toLowerCase();
      if (tab === 'customer') {
        setText(btn, 'Employee');
      } else if (tab === 'agent') {
        setText(btn, 'Admin');
      }
    });
    /* catch any leftover wording */
    document.querySelectorAll('.ltab').forEach(function (btn) {
      var tx = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (/end[-\s]?user|customer/i.test(tx)) setText(btn, 'Employee');
      if (/tech\s*support|\bagent\b/i.test(tx)) setText(btn, 'Admin');
    });
  }

  function applyAgentForm() {
    var form = document.getElementById('login-agent');
    if (!form) return;

    form.querySelectorAll('label').forEach(function (lab) {
      var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
      if (/username/i.test(t) || /email/i.test(t)) setText(lab, 'Email');
    });

    var user =
      document.getElementById('agent-username') ||
      form.querySelector('input[type="text"], input[type="email"]');
    if (user) {
      user.setAttribute('placeholder', 'you@company.com');
      try { user.type = 'email'; } catch (e) {}
    }

    var pass = document.getElementById('agent-password') || form.querySelector('input[type="password"]');
    if (pass) pass.setAttribute('placeholder', '••••••••');

    var sw = form.querySelector('.login-switch');
    if (sw) {
      var link = sw.querySelector('a');
      if (link) {
        var lt = (link.textContent || '').replace(/\s+/g, ' ').trim();
        if (/agent/i.test(lt) || /create/i.test(lt)) setText(link, 'Create Admin account');
      }
      Array.prototype.forEach.call(sw.childNodes, function (n) {
        if (n.nodeType === 3 && /agent/i.test(n.textContent || '')) {
          n.textContent = 'New admin? ';
        }
      });
    }

    form.querySelectorAll('button[type="submit"]').forEach(function (btn) {
      var t = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (/sign\s*in/i.test(t)) setText(btn, 'Sign in as Admin');
    });
  }

  function applyCustomerForm() {
    var form = document.getElementById('login-customer');
    if (!form) return;
    form.querySelectorAll('label').forEach(function (lab) {
      var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
      if (/username\s*or\s*email/i.test(t)) setText(lab, 'Email');
    });
    var email = document.getElementById('cust-email') || form.querySelector('input[type="email"]');
    if (email) email.setAttribute('placeholder', 'you@company.com');
    var pass = document.getElementById('cust-password') || form.querySelector('input[type="password"]');
    if (pass) pass.setAttribute('placeholder', '••••••••');
  }

  function applyRegister() {
    document.querySelectorAll('.login-card-register .reg-title, #login-screen .reg-title').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/create\s+agent/i.test(t)) setText(el, 'Create Admin Account');
    });
    document.querySelectorAll('.login-card-register .reg-sub').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/tech\s*support|agent\s*registration/i.test(t)) setText(el, 'Admin Registration');
    });
  }

  function apply() {
    if (_busy) return;
    _busy = true;
    try {
      applyTabs();
      applyAgentForm();
      applyCustomerForm();
      applyRegister();
    } catch (e) {
    } finally {
      _busy = false;
    }
  }

  function boot() {
    apply();
    var n = 0;
    var t = setInterval(function () {
      apply();
      if (++n >= 30) clearInterval(t);
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setInterval(apply, 1500);
  window.DRLoginTabLabels = { refresh: apply, v: 6 };
})();
