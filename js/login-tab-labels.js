/**
 * Divine Rays — login card labels v7
 * Tabs: Employee | Admin
 * Admin form: Email + Password (never overwrite Password with Email)
 * Placeholders: you@company.com / ••••••••
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS >= 7) return;
  window.__DR_LOGIN_TAB_LABELS = 7;

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
    document.querySelectorAll('.ltab').forEach(function (btn) {
      var tx = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (/end[-\s]?user|customer/i.test(tx)) setText(btn, 'Employee');
      if (/tech\s*support|\bagent\b/i.test(tx)) setText(btn, 'Admin');
    });
  }

  function applyAgentForm() {
    var form = document.getElementById('login-agent');
    if (!form) return;

    var user =
      document.getElementById('agent-username') ||
      form.querySelector('input[type="text"], input[type="email"]');
    if (user) {
      var ug = user.closest ? user.closest('.form-group') : user.parentNode;
      var ulab = ug ? ug.querySelector('label') : null;
      if (ulab) setText(ulab, 'Email');
      user.setAttribute('placeholder', 'you@company.com');
      try { user.type = 'email'; } catch (e) {}
    }

    var pass = document.getElementById('agent-password') || form.querySelector('input[type="password"]');
    if (pass) {
      var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
      var plab = pg ? pg.querySelector('label') : null;
      if (plab) setText(plab, 'Password');
      pass.setAttribute('placeholder', '••••••••');
    }

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

    var email = document.getElementById('cust-email') || form.querySelector('input[type="email"]');
    if (email) {
      var eg = email.closest ? email.closest('.form-group') : email.parentNode;
      var elab = eg ? eg.querySelector('label') : null;
      if (elab) {
        var t = (elab.textContent || '').replace(/\s+/g, ' ').trim();
        if (/username/i.test(t) || /email/i.test(t)) setText(elab, 'Email');
      }
      email.setAttribute('placeholder', 'you@company.com');
    }

    var pass = document.getElementById('cust-password') || form.querySelector('input[type="password"]');
    if (pass) {
      var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
      var plab = pg ? pg.querySelector('label') : null;
      if (plab) setText(plab, 'Password');
      pass.setAttribute('placeholder', '••••••••');
    }
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
  window.DRLoginTabLabels = { refresh: apply, v: 7 };
})();
