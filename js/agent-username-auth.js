/**
 * Divine Rays — Agent/Admin login & register by Username only
 * End-User stays email + password. Supabase still needs an email internally,
 * so agents use a synthetic address: {username}@agent.divinerays.local
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_USERNAME_AUTH) return;
  window.__DR_AGENT_USERNAME_AUTH = 1;

  var DOMAIN = '@agent.divinerays.local';

  function syntheticEmail(username) {
    var u = String(username || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9._-]/g, '');
    if (!u) return '';
    return u + DOMAIN;
  }

  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return null;
  }

  function patchAgentLoginLabels() {
    var input =
      document.getElementById('agent-username') ||
      document.getElementById('agent-user');
    if (!input) return;
    var group = input.closest ? input.closest('.form-group') : input.parentNode;
    var label = group ? group.querySelector('label') : null;
    if (label) label.textContent = 'Username';
    input.setAttribute('type', 'text');
    input.setAttribute('autocomplete', 'username');
    input.setAttribute('placeholder', 'Enter username');
    input.removeAttribute('inputmode');
    /* clear any email-style pattern */
    input.removeAttribute('pattern');
  }

  function patchAgentRegisterCard() {
    var form = document.getElementById('dr-register-form-agent');
    if (!form) return;
    /* ensure no email field sneaks in */
    form.querySelectorAll('input[type="email"], #reg-agent-email').forEach(function (el) {
      try {
        var g = el.closest ? el.closest('.form-group') : el.parentNode;
        if (g) g.style.display = 'none';
        el.removeAttribute('required');
        el.disabled = true;
      } catch (e) {}
    });
    var un = form.querySelector('#reg-agent-username');
    if (un) {
      un.setAttribute('type', 'text');
      un.setAttribute('autocomplete', 'username');
      un.setAttribute('placeholder', 'Choose a username');
      var lab = un.closest('.form-group');
      if (lab) {
        var l = lab.querySelector('label');
        if (l) l.textContent = 'Username';
      }
    }
  }

  async function registerAgentByUsername(form) {
    var unEl = form.querySelector('#reg-agent-username');
    var passEl = form.querySelector('#reg-agent-password');
    var roleEl = form.querySelector('#reg-agent-role');
    var username = unEl ? (unEl.value || '').trim() : '';
    var password = passEl ? passEl.value : '';
    var roleRaw = roleEl ? (roleEl.value || '').trim() : '';
    if (!username || !password) return { error: 'Username and password are required' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };

    var email = syntheticEmail(username);
    if (!email) return { error: 'Invalid username' };

    /* Map UI roles → stored role */
    var role = 'agent';
    var rLow = roleRaw.toLowerCase();
    if (rLow === 'admin' || rLow === 'owner') role = 'admin';
    else if (rLow.indexOf('tech') !== -1 || rLow === 'it tech support') role = 'agent';

    var client = sb();
    if (!client) return { error: 'Supabase not configured' };

    try {
      var existing = await client
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      if (existing && existing.data) {
        return { error: 'Username already taken. Please choose another.' };
      }
    } catch (e0) {}

    var r = await client.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: username,
          role: role,
          username: username
        }
      }
    });
    if (r.error) return { error: r.error.message || 'Registration failed' };
    var user = r.data && r.data.user;
    if (user) {
      try {
        await client.from('profiles').upsert({
          id: user.id,
          full_name: username,
          username: username,
          email: email,
          role: role
        });
      } catch (e1) {
        try {
          await client.from('profiles').upsert({
            id: user.id,
            full_name: username,
            username: username,
            role: role
          });
        } catch (e2) {}
      }
    }

    /* pending approval marker */
    try {
      var key = 'dr_staff_approval';
      var map = {};
      try {
        map = JSON.parse(localStorage.getItem(key) || '{}') || {};
      } catch (e3) {}
      if (user && user.id) map[user.id] = 'pending';
      map['pending:' + username.toLowerCase()] = 'pending';
      localStorage.setItem(key, JSON.stringify(map));
    } catch (e4) {}

    return { ok: true, user: user, email: email };
  }

  function wireAgentRegister() {
    var form = document.getElementById('dr-register-form-agent');
    if (!form || form.__drUserAuthWired) return;
    form.__drUserAuthWired = 1;
    form.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        var pass = form.querySelector('#reg-agent-password');
        var confirm = form.querySelector('#reg-agent-password-confirm');
        if (pass && confirm && pass.value !== confirm.value) {
          if (window.DR && window.DR.toast) window.DR.toast('Passwords do not match', 'error');
          return;
        }

        var btn = form.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.55';
        }

        registerAgentByUsername(form).then(function (res) {
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = '';
          }
          if (res.error) {
            if (window.DR && window.DR.toast) window.DR.toast(res.error, 'error');
            else alert(res.error);
            return;
          }
          /* open success modal with agent message */
          var m = document.getElementById('dr-success-modal');
          if (!m && window.DRLoginTheme && window.DRLoginTheme.refresh) {
            try {
              window.DRLoginTheme.refresh();
            } catch (er) {}
            m = document.getElementById('dr-success-modal');
          }
          if (!m) {
            m = document.createElement('div');
            m.id = 'dr-success-modal';
            m.innerHTML =
              '<div class="dr-success-box" role="dialog">' +
              '<div class="dr-success-check" aria-hidden="true"><span class="dr-check-mark">✓</span></div>' +
              '<h3 id="dr-success-title">Successfully created!</h3>' +
              '<p id="dr-success-msg"></p>' +
              '<button type="button" class="dr-success-ok">Ok</button></div>';
            document.body.appendChild(m);
            m.querySelector('.dr-success-ok').addEventListener('click', function () {
              m.classList.remove('is-open');
              try {
                if (typeof window.showForm === 'function') window.showForm('login-agent');
              } catch (e5) {}
            });
          }
          m.setAttribute('data-reg-kind', 'agent');
          var msg = m.querySelector('#dr-success-msg') || m.querySelector('.dr-success-box p');
          if (msg) {
            msg.textContent =
              'Your account has been successfully created. A request has been sent to the Administrator for approval. Please wait for your account to be approved.';
          }
          m.classList.add('is-open');
          /* hide register card */
          try {
            var card = document.getElementById('dr-register-card-agent');
            if (card) {
              card.classList.remove('is-open');
              card.style.setProperty('display', 'none', 'important');
            }
          } catch (e6) {}
        });
      },
      true
    );
  }

  /* Strengthen agent login: resolve username → synthetic email if profile lookup fails */
  function wireAgentLoginEnhance() {
    var form = document.getElementById('login-agent');
    if (!form || form.__drUserLoginWired) return;
    form.__drUserLoginWired = 1;
    form.addEventListener(
      'submit',
      function (e) {
        var input =
          document.getElementById('agent-username') ||
          document.getElementById('agent-user');
        if (!input) return;
        var val = (input.value || '').trim();
        if (!val) return;
        /* if user typed a plain username, leave as-is; app.js resolves it.
           Also stash synthetic email as fallback attribute for resolvers. */
        if (val.indexOf('@') === -1) {
          input.setAttribute('data-synthetic-email', syntheticEmail(val));
        }
      },
      true
    );

    /* Patch resolveAgentEmail if available later */
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      if (window.DR && typeof window.DR.resolveAgentEmail === 'function' && !window.DR.__drSynthResolve) {
        window.DR.__drSynthResolve = 1;
        var orig = window.DR.resolveAgentEmail;
        window.DR.resolveAgentEmail = async function (username) {
          var r = await orig(username);
          if (r) return r;
          return syntheticEmail(username);
        };
        clearInterval(t);
      }
      if (tries > 40) clearInterval(t);
    }, 250);
  }

  function tick() {
    patchAgentLoginLabels();
    patchAgentRegisterCard();
    wireAgentRegister();
    wireAgentLoginEnhance();
  }

  tick();
  setInterval(tick, 2000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
