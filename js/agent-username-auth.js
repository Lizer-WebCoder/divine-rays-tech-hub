/**
 * Divine Rays — Agent/Admin auth
 * Register: Username + Email + Password + Role
 * Login: Username OR Email + Password
 * End-User unchanged (email + password only)
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_USERNAME_AUTH) return;
  window.__DR_AGENT_USERNAME_AUTH = 1;

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
    if (label) label.textContent = 'Username or Email';
    input.setAttribute('type', 'text');
    input.setAttribute('autocomplete', 'username');
    input.setAttribute('placeholder', 'Username or email');
    input.removeAttribute('inputmode');
    input.removeAttribute('pattern');
  }

  function ensureAgentEmailField(form) {
    if (!form) return null;
    var existing = form.querySelector('#reg-agent-email');
    if (existing) {
      existing.disabled = false;
      existing.setAttribute('required', 'required');
      existing.setAttribute('type', 'email');
      var g = existing.closest ? existing.closest('.form-group') : existing.parentNode;
      if (g) g.style.display = '';
      return existing;
    }
    var un = form.querySelector('#reg-agent-username');
    var unGroup = un && un.closest ? un.closest('.form-group') : null;
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label for="reg-agent-email">Email</label>' +
      '<input type="email" id="reg-agent-email" required autocomplete="email" placeholder="you@company.com" />';
    if (unGroup && unGroup.parentNode) {
      if (unGroup.nextSibling) unGroup.parentNode.insertBefore(group, unGroup.nextSibling);
      else unGroup.parentNode.appendChild(group);
    } else {
      form.insertBefore(group, form.firstChild);
    }
    return group.querySelector('#reg-agent-email');
  }

  function patchAgentRegisterCard() {
    var form = document.getElementById('dr-register-form-agent');
    if (!form) return;
    ensureAgentEmailField(form);
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

  async function registerAgent(form) {
    var unEl = form.querySelector('#reg-agent-username');
    var emEl = form.querySelector('#reg-agent-email');
    var passEl = form.querySelector('#reg-agent-password');
    var roleEl = form.querySelector('#reg-agent-role');
    var username = unEl ? (unEl.value || '').trim() : '';
    var email = emEl ? (emEl.value || '').trim() : '';
    var password = passEl ? passEl.value : '';
    var roleRaw = roleEl ? (roleEl.value || '').trim() : '';

    if (!username || !email || !password) {
      return { error: 'Username, email, and password are required' };
    }
    if (email.indexOf('@') === -1) return { error: 'Please enter a valid email address' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };

    var role = 'agent';
    var rLow = roleRaw.toLowerCase();
    if (rLow === 'admin' || rLow === 'owner') role = 'admin';
    else if (rLow.indexOf('tech') !== -1 || rLow === 'it tech support') role = 'agent';

    var client = sb();
    if (!client) return { error: 'Supabase not configured' };

    try {
      var byUser = await client.from('profiles').select('id').eq('username', username).maybeSingle();
      if (byUser && byUser.data) {
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

  function showAgentSuccessModal() {
    var m = document.getElementById('dr-success-modal');
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
    try {
      var card = document.getElementById('dr-register-card-agent');
      if (card) {
        card.classList.remove('is-open');
        card.style.setProperty('display', 'none', 'important');
      }
    } catch (e6) {}
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

        registerAgent(form).then(function (res) {
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = '';
          }
          if (res.error) {
            if (window.DR && window.DR.toast) window.DR.toast(res.error, 'error');
            else alert(res.error);
            return;
          }
          showAgentSuccessModal();
        });
      },
      true
    );
  }

  function tick() {
    patchAgentLoginLabels();
    patchAgentRegisterCard();
    wireAgentRegister();
  }

  tick();
  setInterval(tick, 2000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  }
})();
