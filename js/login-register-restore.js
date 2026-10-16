/**
 * Divine Rays — restore Employee / Admin create-account format
 * Relabel shell register forms + alias for agent-username-auth
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_REGISTER_RESTORE >= 1) return;
  window.__DR_LOGIN_REGISTER_RESTORE = 1;

  function setText(el, want) {
    if (!el) return;
    var cur = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (cur !== want) el.textContent = want;
  }

  function ensureRoleSelect(form) {
    if (!form || form.querySelector('#reg-agent-role')) return;
    var pass = form.querySelector('#reg-agent-password');
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label for="reg-agent-role">Role</label>' +
      '<select id="reg-agent-role" required>' +
      '<option value="IT Tech Support">IT Tech Support</option>' +
      '<option value="Admin">Admin</option>' +
      '</select>';
    if (pass && pass.closest) {
      var pg = pass.closest('.form-group');
      if (pg && pg.parentNode) {
        pg.parentNode.insertBefore(group, pg);
        return;
      }
    }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) form.insertBefore(group, btn);
    else form.appendChild(group);
  }

  function ensureConfirmPassword(form) {
    if (!form || form.querySelector('#reg-agent-password-confirm')) return;
    var pass = form.querySelector('#reg-agent-password');
    if (!pass) return;
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label for="reg-agent-password-confirm">Confirm Password</label>' +
      '<input type="password" id="reg-agent-password-confirm" required minlength="6" placeholder="••••••••" autocomplete="new-password" />';
    var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
    if (pg && pg.parentNode) {
      if (pg.nextSibling) pg.parentNode.insertBefore(group, pg.nextSibling);
      else pg.parentNode.appendChild(group);
    }
  }

  function polishEmployee() {
    var form = document.getElementById('register-customer');
    if (!form) return;
    form.setAttribute('data-dr-reg', 'employee');

    var name = document.getElementById('reg-cust-name');
    if (name) {
      var g = name.closest ? name.closest('.form-group') : null;
      if (g) setText(g.querySelector('label'), 'Full Name');
      if (!name.getAttribute('placeholder')) name.setAttribute('placeholder', 'Jane Doe');
    }
    var email = document.getElementById('reg-cust-email');
    if (email) {
      var eg = email.closest ? email.closest('.form-group') : null;
      if (eg) setText(eg.querySelector('label'), 'Email');
      email.setAttribute('placeholder', 'you@company.com');
      email.setAttribute('autocomplete', 'email');
    }
    var pass = document.getElementById('reg-cust-password');
    if (pass) {
      var pg = pass.closest ? pass.closest('.form-group') : null;
      if (pg) setText(pg.querySelector('label'), 'Password');
      if (!pass.getAttribute('placeholder')) pass.setAttribute('placeholder', '••••••••');
    }
    form.querySelectorAll('button[type="submit"]').forEach(function (btn) {
      setText(btn, 'Create Employee Account');
    });
    form.querySelectorAll('.login-switch').forEach(function (p) {
      var a = p.querySelector('a');
      setText(p, '');
      p.appendChild(document.createTextNode('Already have an account? '));
      if (a) {
        setText(a, 'Sign in');
        p.appendChild(a);
      }
    });
  }

  function polishAdmin() {
    var form = document.getElementById('register-agent');
    if (!form) return;
    form.setAttribute('data-dr-reg', 'admin');

    if (!document.__drGetByIdPatched) {
      document.__drGetByIdPatched = 1;
      var orig = document.getElementById.bind(document);
      document.getElementById = function (id) {
        if (id === 'dr-register-form-agent') {
          return orig('dr-register-form-agent') || orig('register-agent');
        }
        if (id === 'dr-register-card-agent') {
          return orig('dr-register-card-agent') || document.querySelector('.login-card');
        }
        return orig(id);
      };
    }

    var name = document.getElementById('reg-agent-name');
    if (name) {
      var g = name.closest ? name.closest('.form-group') : null;
      if (g) setText(g.querySelector('label'), 'Full Name');
      if (!name.getAttribute('placeholder')) name.setAttribute('placeholder', 'Jane Doe');
    }
    var email = document.getElementById('reg-agent-email');
    if (email) {
      var eg = email.closest ? email.closest('.form-group') : null;
      if (eg) setText(eg.querySelector('label'), 'Email');
      email.setAttribute('placeholder', 'you@company.com');
      email.setAttribute('autocomplete', 'email');
    }
    var un = document.getElementById('reg-agent-username');
    if (un) {
      var ug = un.closest ? un.closest('.form-group') : null;
      if (ug) setText(ug.querySelector('label'), 'Username');
      un.setAttribute('placeholder', 'Choose a username');
      un.setAttribute('autocomplete', 'username');
    }
    ensureRoleSelect(form);
    var pass = document.getElementById('reg-agent-password');
    if (pass) {
      var pg = pass.closest ? pass.closest('.form-group') : null;
      if (pg) setText(pg.querySelector('label'), 'Password');
      if (!pass.getAttribute('placeholder')) pass.setAttribute('placeholder', '••••••••');
      pass.setAttribute('autocomplete', 'new-password');
    }
    ensureConfirmPassword(form);

    form.querySelectorAll('button[type="submit"]').forEach(function (btn) {
      setText(btn, 'Create Admin Account');
    });
    form.querySelectorAll('.login-switch').forEach(function (p) {
      var a = p.querySelector('a');
      setText(p, '');
      p.appendChild(document.createTextNode('Already have an account? '));
      if (a) {
        setText(a, 'Sign in');
        p.appendChild(a);
      }
    });
  }

  function polishLoginSwitches() {
    var lc = document.getElementById('login-customer');
    if (lc) {
      lc.querySelectorAll('.login-switch').forEach(function (p) {
        var a = p.querySelector('a');
        if (!a) return;
        setText(p, '');
        p.appendChild(document.createTextNode('New here? '));
        setText(a, 'Create an account');
        p.appendChild(a);
      });
      lc.querySelectorAll('button[type="submit"]').forEach(function (btn) {
        var t = (btn.textContent || '').trim();
        if (/^sign\s*in/i.test(t) && t.indexOf('\u2026') === -1) setText(btn, 'Sign In');
      });
    }
    var la = document.getElementById('login-agent');
    if (la) {
      la.querySelectorAll('.login-switch').forEach(function (p) {
        var a = p.querySelector('a');
        if (!a) return;
        setText(p, '');
        p.appendChild(document.createTextNode('New here? '));
        setText(a, 'Create an account');
        p.appendChild(a);
      });
    }
  }

  function apply() {
    try {
      polishEmployee();
      polishAdmin();
      polishLoginSwitches();
    } catch (e) {}
  }

  apply();
  setTimeout(apply, 400);
  setTimeout(apply, 1200);
  setTimeout(apply, 2500);

  window.DRLoginRegisterRestore = { v: 1, refresh: apply };
})();
