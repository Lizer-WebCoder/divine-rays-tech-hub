/**
 * Divine Rays — login card labels v8
 * One-shot labels. No perpetual interval (password freeze fix).
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_TAB_LABELS >= 8) return;
  window.__DR_LOGIN_TAB_LABELS = 8;

  function setText(el, want) {
    if (!el) return;
    var cur = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (cur !== want) el.textContent = want;
  }

  function apply() {
    if (window.__DR_PAUSE_LOGIN_SCRIPTS) return;
    try {
      document.querySelectorAll('.ltab, button[data-ltab]').forEach(function (btn) {
        var tab = (btn.getAttribute('data-ltab') || '').toLowerCase();
        if (tab === 'customer') setText(btn, 'Employee');
        else if (tab === 'agent') setText(btn, 'Admin');
      });

      var form = document.getElementById('login-agent');
      if (form) {
        var user =
          document.getElementById('agent-username') ||
          document.getElementById('agent-user');
        if (user) {
          var ug = user.closest ? user.closest('.form-group') : user.parentNode;
          var ulab = ug ? ug.querySelector('label') : null;
          if (ulab) setText(ulab, 'Email');
          if ((user.getAttribute('placeholder') || '') !== 'you@company.com') {
            user.setAttribute('placeholder', 'you@company.com');
          }
          if (!user.__drTypeLocked) {
            try {
              if (user.type !== 'email') user.type = 'email';
              user.__drTypeLocked = 1;
            } catch (e) {}
          }
        }
        var pass =
          document.getElementById('agent-password') ||
          form.querySelector('input[type="password"]');
        if (pass) {
          var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
          var plab = pg ? pg.querySelector('label') : null;
          if (plab) setText(plab, 'Password');
          if (document.activeElement !== pass) {
            var pph = pass.getAttribute('placeholder') || '';
            if (!pph) pass.setAttribute('placeholder', '••••••••');
          }
        }
        form.querySelectorAll('button[type="submit"]').forEach(function (btn) {
          var t = (btn.textContent || '').replace(/\s+/g, ' ').trim();
          if (/^sign\s*in/i.test(t) && t.indexOf('\u2026') === -1 && t.indexOf('...') === -1) {
            setText(btn, 'Sign in as Admin');
          }
        });
      }

      var cf = document.getElementById('login-customer');
      if (cf) {
        var email = document.getElementById('cust-email') || cf.querySelector('input[type="email"]');
        if (email) {
          var eg = email.closest ? email.closest('.form-group') : email.parentNode;
          var elab = eg ? eg.querySelector('label') : null;
          if (elab) setText(elab, 'Email');
        }
        var cpass = document.getElementById('cust-password') || cf.querySelector('input[type="password"]');
        if (cpass) {
          var cpg = cpass.closest ? cpass.closest('.form-group') : cpass.parentNode;
          var cplab = cpg ? cpg.querySelector('label') : null;
          if (cplab) setText(cplab, 'Password');
        }
      }
    } catch (e) {}
  }

  apply();
  setTimeout(apply, 400);
  setTimeout(apply, 1500);

  window.DRLoginTabLabels = { refresh: apply, v: 8 };
})();
