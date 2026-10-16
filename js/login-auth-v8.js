/**
 * Divine Rays — login-auth v8 (Phase B)
 * 1) unknown != pending — fixes false "needs approval" / not identified
 * 2) Developer emails always approved
 * 3) Restores 830dac purple radial login bg (pinned style)
 * 4) Prefer single window.__drSb client
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_AUTH_V8 >= 1) return;
  window.__DR_LOGIN_AUTH_V8 = 1;

  var DEVS = {
    kirzhianquijano: 1,
    iiyasora2002: 1,
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1
  };
  function norm(s) { return String(s || '').trim().toLowerCase(); }
  function isDev(n) { return !!(norm(n) && DEVS[norm(n)]); }

  function clearFalsePending() {
    try {
      ['dr_staff_approval', 'dr_approval_map'].forEach(function (k) {
        var m = JSON.parse(localStorage.getItem(k) || '{}') || {};
        var ch = false;
        Object.keys(m).forEach(function (key) {
          var raw = key.replace(/^(pending:|u:|e:)/, '');
          if (isDev(raw) || isDev(key)) {
            delete m[key];
            ch = true;
          }
        });
        if (ch) localStorage.setItem(k, JSON.stringify(m));
      });
    } catch (e) {}
  }
  clearFalsePending();

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

  function showError(msg) {
    try {
      var f = document.getElementById('login-agent');
      if (!f) return;
      var e = f.querySelector('.login-error');
      if (!e) {
        e = document.createElement('div');
        e.className = 'login-error';
        f.insertBefore(e, f.firstChild);
      }
      e.textContent = msg || '';
      e.style.display = msg ? 'block' : 'none';
    } catch (err) {}
  }

  async function doLogin(triggerEl) {
    clearFalsePending();
    try {
      if (window.DRForcePending && window.DRForcePending.clearPendingUI) {
        window.DRForcePending.clearPendingUI();
      }
    } catch (e) {}

    var la = document.getElementById('login-agent');
    if (!la) return;
    var au =
      document.getElementById('agent-username') ||
      document.getElementById('agent-user') ||
      la.querySelector('input[type="email"], input[type="text"], input:not([type="password"]):not([type="hidden"])');
    var passEl = document.getElementById('agent-password') || la.querySelector('input[type="password"]');
    var userOrEmail = au ? String(au.value || '').trim() : '';
    var password = passEl ? passEl.value : '';
    if (!userOrEmail || !password) {
      showError(!userOrEmail ? 'Enter your email' : 'Enter your password');
      return;
    }

    var email = userOrEmail;
    var emHint = userOrEmail.indexOf('@') !== -1 ? norm(userOrEmail) : '';
    var unHint = userOrEmail.indexOf('@') === -1 ? norm(userOrEmail) : '';

    try {
      var m = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}') || {};
      var isExplPending =
        (!isDev(emHint) && !isDev(unHint)) &&
        ((emHint && m['pending:' + emHint] === 'pending') ||
          (unHint && m['pending:' + unHint] === 'pending'));
      if (isExplPending) {
        showError('Account needs approval.');
        try {
          if (window.DRForcePending && window.DRForcePending.blockNow) window.DRForcePending.blockNow();
        } catch (eP) {}
        return;
      }
    } catch (eM) {}

    var btn =
      triggerEl && triggerEl.tagName === 'BUTTON'
        ? triggerEl
        : la.querySelector('button[type="submit"], button.btn-primary, button.btn');
    var prev = btn ? btn.textContent : 'Sign in as Admin';
    function setBusy(on) {
      try {
        window.__drAgentLoginBusy = !!on;
        if (!btn) return;
        btn.disabled = !!on;
        btn.textContent = on ? 'Signing in…' : prev;
        btn.style.opacity = on ? '0.85' : '';
      } catch (eB) {}
    }

    var client = sb();
    if (!client) {
      showError('Supabase not configured');
      return;
    }

    setBusy(true);
    try {
      if (userOrEmail.indexOf('@') === -1) {
        var r0 = await client.from('profiles').select('email').eq('username', userOrEmail).maybeSingle();
        if (!r0.data || !r0.data.email) {
          showError('Username not found');
          setBusy(false);
          return;
        }
        email = r0.data.email;
        emHint = norm(email);
      }

      /* Mark approved in local map so original pre-check cannot false-block */
      try {
        var m2 = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}') || {};
        if (emHint) {
          m2['e:' + emHint] = 'approved';
          delete m2['pending:' + emHint];
        }
        if (unHint) {
          m2['u:' + unHint] = 'approved';
          delete m2['pending:' + unHint];
        }
        localStorage.setItem('dr_staff_approval', JSON.stringify(m2));
      } catch (eL) {}

      setBusy(false);
      var orig = doLogin.__drAuthV8Orig;
      if (typeof orig === 'function') {
        return orig.call(window, triggerEl);
      }

      var r = await client.auth.signInWithPassword({ email: email, password: password });
      if (r.error) {
        showError(r.error.message || 'Login failed');
        return;
      }
      try {
        if (window.DR && window.DR.toast) window.DR.toast('Successfully logged in', 'success');
        document.body.classList.add('dr-portal-ok');
        document.body.classList.remove('dr-pending-blocked', 'is-login');
        var ls = document.getElementById('login-screen');
        if (ls) {
          ls.hidden = true;
          ls.style.cssText = 'display:none!important';
        }
        var pa = document.getElementById('portal-agent');
        if (pa) pa.classList.add('active');
      } catch (eP) {}
    } catch (err) {
      console.error(err);
      showError(err.message || String(err));
      setBusy(false);
    }
  }

  function install() {
    var prev = window.__drDoAgentLogin;
    if (prev && prev.__drAuthV8) return;
    if (prev) doLogin.__drAuthV8Orig = prev;
    doLogin.__drAuthV8 = 1;
    window.__drDoAgentLogin = doLogin;
  }
  install();
  setTimeout(install, 300);
  setTimeout(install, 1000);
  setTimeout(install, 2500);

  try {
    var st = document.createElement('style');
    st.id = 'dr-login-bg-830dac';
    st.textContent = [
      'html,body{background:#0f0f14!important;',
      'background-image:radial-gradient(ellipse at top,#1a1530 0%,#0f0f14 60%)!important;',
      'background-attachment:fixed!important}',
      '#login-screen,.login-screen{',
      'background:radial-gradient(ellipse at top,#1a1530 0%,#0f0f14 60%)!important}',
      '#dr-login-ambient{opacity:0.38!important;pointer-events:none!important}',
      '#dr-login-ambient .dr-honeycomb{opacity:0.12!important}',
      '#dr-login-ambient .dr-network{opacity:0.38!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  } catch (eCss) {}

  window.DRLoginAuthV8 = { v: 8, doLogin: doLogin };
})();
