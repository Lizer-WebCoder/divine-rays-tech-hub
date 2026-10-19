/**
 * Divine Rays - emp-login-fix v1
 * 1) Wire click + submit on Employee form (not submit-only)
 * 2) Read password from any filled field (eye toggle safe)
 * 3) Always show error in the login card
 * 4) Clear sticky post-login flags on failure
 */
(function () {
  'use strict';
  if (window.__DR_EMP_LOGIN_FIX >= 1) return;
  window.__DR_EMP_LOGIN_FIX = 1;

  function showCardError(form, msg) {
    try {
      var f = form || document.getElementById('login-customer');
      if (!f) return;
      var e = f.querySelector('.login-error, .dr-login-error');
      if (!e) {
        e = document.createElement('div');
        e.className = 'login-error dr-login-error';
        e.style.cssText =
          'display:block;color:#fca5a5;font-size:0.85rem;margin:0 0 0.65rem;padding:0.45rem 0.65rem;' +
          'background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:8px;';
        f.insertBefore(e, f.firstChild);
      }
      e.textContent = msg || '';
      e.style.display = msg ? 'block' : 'none';
    } catch (err) {}
  }

  function clearCardError(form) {
    showCardError(form, '');
  }

  function getFields(form) {
    var f = form || document.getElementById('login-customer');
    var emailEl =
      document.getElementById('cust-email') ||
      (f && f.querySelector('input[type="email"], input[autocomplete="username"]'));
    var passEl = document.getElementById('cust-password');
    if (f) {
      var list = f.querySelectorAll(
        'input[type="password"], input[type="text"][data-dr-pass], input[autocomplete="current-password"]'
      );
      for (var i = 0; i < list.length; i++) {
        if (list[i].id && /reg-|confirm/i.test(list[i].id)) continue;
        if (String(list[i].value || '').length) {
          passEl = list[i];
          break;
        }
        if (!passEl) passEl = list[i];
      }
    }
    return {
      form: f,
      email: emailEl ? String(emailEl.value || '').trim() : '',
      password: passEl ? String(passEl.value || '') : ''
    };
  }

  function setBusy(form, on) {
    try {
      var btns = (form || document).querySelectorAll(
        '#login-customer button[type="submit"], #login-customer button.btn-primary, #login-customer button.btn-full, #login-customer button.btn'
      );
      btns.forEach(function (b) {
        if (!b.getAttribute('data-dr-prev-label')) {
          var t = (b.textContent || '').trim();
          if (t && !/signing/i.test(t)) b.setAttribute('data-dr-prev-label', t);
        }
        b.disabled = !!on;
        b.textContent = on ? 'Signing in...' : b.getAttribute('data-dr-prev-label') || 'Sign in';
        b.style.opacity = on ? '0.85' : '';
      });
    } catch (e) {}
  }

  function sb() {
    try {
      if (window.__drSb) return window.__drSb;
      if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c) return c;
      }
      var cfg = window.DR_CONFIG || {};
      if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) {
        window.__drSb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        return window.__drSb;
      }
    } catch (e) {}
    return null;
  }

  async function doLogin(trigger) {
    var form = document.getElementById('login-customer');
    if (!form) return;
    if (window.__drEmpLoginBusy) return;
    window.__drEmpLoginBusy = true;

    var fields = getFields(form);
    clearCardError(form);

    if (!fields.email || !fields.password) {
      showCardError(form, !fields.email ? 'Enter your email' : 'Enter your password');
      window.__drEmpLoginBusy = false;
      setBusy(form, false);
      return;
    }

    setBusy(form, true);
    try {
      sessionStorage.setItem('dr_login_tab', 'customer');
      sessionStorage.setItem('dr_dev_portal_pref', 'employee');
      sessionStorage.removeItem('dr_tab_gate_err');
    } catch (e) {}

    var client = sb();
    if (!client) {
      showCardError(form, 'Connection not ready. Hard refresh and try again.');
      setBusy(form, false);
      window.__drEmpLoginBusy = false;
      return;
    }

    try {
      var r = await client.auth.signInWithPassword({
        email: fields.email,
        password: fields.password
      });
      if (r.error) {
        var msg = (r.error && r.error.message) || 'Login failed';
        if (/invalid login credentials/i.test(msg)) {
          msg = 'Invalid email or password. Please try again.';
        }
        showCardError(form, msg);
        setBusy(form, false);
        window.__drEmpLoginBusy = false;
        try {
          sessionStorage.removeItem('dr_skip_boot_gear');
          sessionStorage.removeItem('dr_post_login_boot');
        } catch (e2) {}
        return;
      }

      var user = r.data && r.data.user;
      window.__drUser = user;
      var profile = { email: fields.email, role: 'customer' };
      try {
        if (user && user.id) {
          var pr = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (pr && pr.data) profile = pr.data;
        }
      } catch (e3) {}
      window.__drProfile = profile;

      try {
        var em = String(fields.email || '').toLowerCase();
        if (em === 'kirzhianquijano@gmail.com' || em === 'iiyasora2002@gmail.com') {
          window.__drIsDeveloper = true;
        }
      } catch (eD) {}

      try {
        sessionStorage.setItem('dr_login_tab', 'customer');
        sessionStorage.setItem('dr_dev_portal_pref', 'employee');
        sessionStorage.setItem('dr_post_login_boot', '1');
        sessionStorage.setItem('dr_skip_boot_gear', '1');
        document.documentElement.setAttribute('data-dr-portal-pref', 'employee');
      } catch (e4) {}

      if (window.bootWorkspace) {
        await window.bootWorkspace('customer');
      } else {
        location.reload();
      }
    } catch (err) {
      var emsg = (err && err.message) || 'Login failed';
      if (/invalid login credentials/i.test(emsg)) {
        emsg = 'Invalid email or password. Please try again.';
      }
      showCardError(form, emsg);
      setBusy(form, false);
      window.__drEmpLoginBusy = false;
      try {
        sessionStorage.removeItem('dr_skip_boot_gear');
        sessionStorage.removeItem('dr_post_login_boot');
      } catch (e5) {}
    }
  }

  function wire() {
    var form = document.getElementById('login-customer');
    if (!form || form.__drEmpFix) return;
    form.__drEmpFix = 1;

    form.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        doLogin(e.submitter || form.querySelector('button'));
      },
      true
    );

    form
      .querySelectorAll(
        'button[type="submit"], button.btn-primary, button.btn-full, button.btn'
      )
      .forEach(function (b) {
        b.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            doLogin(b);
          },
          true
        );
      });
  }

  wire();
  setTimeout(wire, 300);
  setTimeout(wire, 1000);
  setTimeout(wire, 2500);

  try {
    if (window.DREmpPerfFix) {
      window.DREmpPerfFix.login = function () {
        return doLogin(null);
      };
    }
  } catch (e) {}

  window.DREmpLoginFix = { v: 1, login: doLogin };
})();
