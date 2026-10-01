/**
 * Divine Rays — Agent/Admin auth
 * Register: Username + Email + Password + Role
 * Login: Username OR Email + Password
 * Email taken: same red glow + message as End-User register
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_AGENT_USERNAME_AUTH) return;
  window.__DR_AGENT_USERNAME_AUTH = 1;

  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c) return c;
      }
    } catch (e0) {}
    try {
      if (window.__drSb) return window.__drSb;
      if (window.__drAgentSb) return window.__drAgentSb;
    } catch (e1) {}
    try {
      var cfg = window.DR_CONFIG || {};
      var url = cfg.SUPABASE_URL;
      var key = cfg.SUPABASE_ANON_KEY;
      if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
        window.__drAgentSb = window.supabase.createClient(url, key, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
        return window.__drAgentSb;
      }
    } catch (e2) {}
    return null;
  }

  function ensureSupabaseReady() {
    return new Promise(function (resolve) {
      if (sb()) {
        resolve(sb());
        return;
      }
      var tries = 0;
      var t = setInterval(function () {
        tries++;
        var c = sb();
        if (c) {
          clearInterval(t);
          resolve(c);
          return;
        }
        if (tries >= 40) {
          clearInterval(t);
          resolve(null);
        }
      }, 100);
    });
  }

  function getRegisteredEmails() {
    try {
      return JSON.parse(localStorage.getItem('dr_registered_emails') || '[]') || [];
    } catch (e) {
      return [];
    }
  }

  function rememberRegisteredEmail(email) {
    var e = String(email || '').trim().toLowerCase();
    if (!e) return;
    var list = getRegisteredEmails();
    if (list.indexOf(e) === -1) {
      list.push(e);
      try {
        localStorage.setItem('dr_registered_emails', JSON.stringify(list));
      } catch (err) {}
    }
  }

  function isEmailTakenLocal(email) {
    var e = String(email || '').trim().toLowerCase();
    if (!e) return false;
    return getRegisteredEmails().indexOf(e) !== -1;
  }

  async function isEmailTakenRemote(email) {
    var e = String(email || '').trim().toLowerCase();
    if (!e || e.indexOf('@') === -1) return false;
    var client = sb();
    if (!client) return false;
    try {
      var r = await client.from('profiles').select('id').ilike('email', e).limit(1);
      if (r && !r.error && r.data && r.data.length) return true;
    } catch (err) {}
    try {
      var r2 = await client.from('profiles').select('id').eq('email', e).limit(1);
      if (r2 && !r2.error && r2.data && r2.data.length) return true;
    } catch (err2) {}
    return false;
  }

  function setAgentEmailTakenUI(input, taken) {
    if (!input) return;
    var form = input.closest ? input.closest('form') : null;
    var scope = form || (input.closest && input.closest('.login-card-register')) || document;
    var hint = scope.querySelector
      ? scope.querySelector('[data-dr-email-hint="' + input.id + '"]')
      : null;
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    var card = input.closest ? input.closest('.login-card-register, .login-card') : null;

    if (taken) {
      input.classList.add('dr-email-taken');
      input.setAttribute('data-email-taken', '1');
      if (hint) {
        hint.textContent = 'Email already exists. Please use another email.';
        hint.className = 'dr-email-hint is-bad';
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.55';
        submitBtn.style.cursor = 'not-allowed';
      }
      if (card) {
        card.classList.remove('login-pass-ok', 'login-fail-healing');
        card.classList.add('login-fail-glow');
      }
    } else {
      input.classList.remove('dr-email-taken');
      input.removeAttribute('data-email-taken');
      if (hint) {
        hint.textContent = '';
        hint.className = 'dr-email-hint';
      }
      if (submitBtn && form && !form.querySelector('.dr-pass-mismatch')) {
        var complete = true;
        form.querySelectorAll('input[required], select[required]').forEach(function (el) {
          if (!(el.value || '').trim()) complete = false;
        });
        if (complete) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          submitBtn.style.cursor = '';
        }
      }
      if (card && !card.querySelector('.dr-pass-mismatch') && !card.querySelector('.dr-email-taken')) {
        card.classList.remove('login-fail-glow');
      }
    }
  }

  function wireAgentEmailCheck(form) {
    var input = form && form.querySelector('#reg-agent-email');
    if (!input || input.__drAgentEmailWired) return;
    input.__drAgentEmailWired = 1;

    var group = input.closest ? input.closest('.form-group') : input.parentNode;
    if (group && !group.querySelector('[data-dr-email-hint="reg-agent-email"]')) {
      var p = document.createElement('p');
      p.className = 'dr-email-hint';
      p.setAttribute('data-dr-email-hint', 'reg-agent-email');
      p.setAttribute('aria-live', 'polite');
      group.appendChild(p);
    }

    var timer = null;
    function run() {
      var val = (input.value || '').trim();
      if (!val || val.indexOf('@') === -1 || val.indexOf('.') === -1) {
        setAgentEmailTakenUI(input, false);
        return;
      }
      if (isEmailTakenLocal(val)) {
        setAgentEmailTakenUI(input, true);
        return;
      }
      isEmailTakenRemote(val).then(function (taken) {
        if ((input.value || '').trim().toLowerCase() !== val.toLowerCase()) return;
        if (taken) {
          rememberRegisteredEmail(val);
          setAgentEmailTakenUI(input, true);
        } else {
          setAgentEmailTakenUI(input, false);
        }
      }).catch(function () {
        setAgentEmailTakenUI(input, isEmailTakenLocal(val));
      });
    }
    function schedule() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 120);
    }
    input.addEventListener('input', schedule);
    input.addEventListener('blur', run);
    input.addEventListener('change', run);
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
      if (g) {
        g.style.display = '';
        if (!g.querySelector('[data-dr-email-hint="reg-agent-email"]')) {
          var p = document.createElement('p');
          p.className = 'dr-email-hint';
          p.setAttribute('data-dr-email-hint', 'reg-agent-email');
          p.setAttribute('aria-live', 'polite');
          g.appendChild(p);
        }
      }
      return existing;
    }
    var un = form.querySelector('#reg-agent-username');
    var unGroup = un && un.closest ? un.closest('.form-group') : null;
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label for="reg-agent-email">Email</label>' +
      '<input type="email" id="reg-agent-email" required autocomplete="email" placeholder="you@company.com" />' +
      '<p class="dr-email-hint" data-dr-email-hint="reg-agent-email" aria-live="polite"></p>';
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
    wireAgentEmailCheck(form);
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

    if (emEl && (emEl.classList.contains('dr-email-taken') || emEl.getAttribute('data-email-taken') === '1')) {
      setAgentEmailTakenUI(emEl, true);
      return { error: 'Email already exists. Please use another email.' };
    }
    if (isEmailTakenLocal(email)) {
      setAgentEmailTakenUI(emEl, true);
      return { error: 'Email already exists. Please use another email.' };
    }

    var client = await ensureSupabaseReady();
    if (!client) {
      return {
        error:
          'Connection not ready. Please wait a moment and try again (refresh the page if this keeps happening).'
      };
    }

    var takenRemote = await isEmailTakenRemote(email);
    if (takenRemote) {
      rememberRegisteredEmail(email);
      setAgentEmailTakenUI(emEl, true);
      return { error: 'Email already exists. Please use another email.' };
    }

    var staffRole = roleRaw || 'IT Tech Support';
    var rLow = staffRole.toLowerCase();
    var role = 'agent';
    if (rLow === 'admin' || rLow === 'owner') role = 'admin';
    else role = 'agent';

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
          staff_role: staffRole,
          username: username,
          approval_status: 'pending',
          approved: false
        }
      }
    });
    if (r.error) {
      var msg = r.error.message || 'Registration failed';
      if (/already|registered|exists/i.test(msg)) {
        rememberRegisteredEmail(email);
        setAgentEmailTakenUI(emEl, true);
        return { error: 'Email already exists. Please use another email.' };
      }
      return { error: msg };
    }
    var user = r.data && r.data.user;
    if (user) {
      var row = {
        id: user.id,
        full_name: username,
        username: username,
        email: email,
        role: role,
        staff_role: staffRole
      };
      try {
        await client.from('profiles').upsert(row);
      } catch (e1) {
        try {
          delete row.staff_role;
          await client.from('profiles').upsert(row);
        } catch (e2) {
          try {
            await client.from('profiles').upsert({
              id: user.id,
              full_name: username,
              username: username,
              role: role
            });
          } catch (e3) {}
        }
      }
    }

    rememberRegisteredEmail(email);

    try {
      if (window.DRAgentApproval && window.DRAgentApproval.markPending) {
        window.DRAgentApproval.markPending(user && user.id, username, email);
        window.DRAgentApproval.saveRoleLabel(username, staffRole);
      } else {
        var key = 'dr_staff_approval';
        var map = {};
        try {
          map = JSON.parse(localStorage.getItem(key) || '{}') || {};
        } catch (e4) {}
        if (user && user.id) map[user.id] = 'pending';
        map['pending:' + username.toLowerCase()] = 'pending';
        map['pending:' + email.toLowerCase()] = 'pending';
        map['role:' + username.toLowerCase()] = staffRole;
        localStorage.setItem(key, JSON.stringify(map));
      }
    } catch (e5) {}

    try {
      await client.auth.signOut({ scope: 'local' });
    } catch (e6) {}

    return { ok: true, user: user, email: email, staff_role: staffRole };
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

        var emEl = form.querySelector('#reg-agent-email');
        if (emEl && (emEl.classList.contains('dr-email-taken') || emEl.getAttribute('data-email-taken') === '1')) {
          setAgentEmailTakenUI(emEl, true);
          return;
        }

        var pass = form.querySelector('#reg-agent-password');
        var confirm = form.querySelector('#reg-agent-password-confirm');
        if (pass && confirm && pass.value !== confirm.value) {
          if (window.DR && window.DR.toast) window.DR.toast('Passwords do not match', 'error');
          else alert('Passwords do not match');
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
            if (/email already exists/i.test(res.error)) return;
            if (window.DR && window.DR.toast) window.DR.toast(res.error, 'error');
            else if (window.DRDialog && window.DRDialog.alert) window.DRDialog.alert(res.error);
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
