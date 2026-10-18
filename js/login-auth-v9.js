/**
 * Divine Rays — login-auth v9 — role gate before portal (no peek)
 * 1) unknown != pending — fixes false "needs approval" / not identified
 * 2) Developer emails always approved
 * 3) Restores 830dac purple radial login bg (pinned style)
 * 4) Prefer single window.__drSb client
 * 5) Fetch profile after sign-in; Employee on Admin tab never opens portal
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_AUTH_V9 >= 1) return;
  window.__DR_LOGIN_AUTH_V9 = 1;

  var DEVS = {
    kirzhianquijano: 1,
    iiyasora2002: 1,
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1
  };
  function norm(s) { return String(s || '').trim().toLowerCase(); }
  function isDev(n) { return !!(norm(n) && DEVS[norm(n)]); }

  var EMP_JOBS = {
    cashier: 1, doctor: 1, hr: 1, medtech: 1, radtech: 1, staff: 1, utility: 1, employee: 1
  };
  function isEmployeeProfile(p) {
    if (!p) return false;
    if (isDev(p.email) || isDev(p.username)) return false;
    var role = String(p.role || '').toLowerCase().trim();
    var job = String(p.staff_role || p.job_title || p.title || '').toLowerCase().trim();
    if (role === 'customer' || role === 'employee' || role === 'user' || role === 'client') return true;
    if (EMP_JOBS[role] || EMP_JOBS[job]) return true;
    return false;
  }
  function isStaffProfile(p) {
    if (!p) return false;
    if (isDev(p.email) || isDev(p.username)) return true;
    if (isEmployeeProfile(p)) return false;
    var role = String(p.role || '').toLowerCase().trim();
    return role === 'agent' || role === 'admin' || role === 'owner' || role === 'developer' ||
      role.indexOf('admin') !== -1 || role.indexOf('support') !== -1;
  }

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
      sessionStorage.setItem('dr_login_tab', 'agent');
    } catch (eT) {}
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

      try {
        sessionStorage.setItem('dr_login_tab', 'agent');
      } catch (eTab) {}
      try {
        document.documentElement.classList.add('dr-tab-blocked');
        document.body.classList.add('dr-tab-blocked', 'is-login');
        document.body.classList.remove('dr-portal-ok', 'is-portal');
        ['portal-customer', 'portal-agent', 'dr-post-login-boot', 'dr-portal-loader'].forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          el.classList.remove('active', 'is-on');
          el.style.setProperty('display', 'none', 'important');
          el.hidden = true;
        });
        var st = document.getElementById('dr-tab-gate-css');
        if (!st) {
          st = document.createElement('style');
          st.id = 'dr-tab-gate-css';
          st.textContent =
            'html.dr-tab-blocked #portal-customer,html.dr-tab-blocked #portal-agent,' +
            'body.dr-tab-blocked #portal-customer,body.dr-tab-blocked #portal-agent,' +
            'html.dr-tab-blocked #dr-post-login-boot,body.dr-tab-blocked #dr-post-login-boot,' +
            'html.dr-tab-blocked #dr-portal-loader,body.dr-tab-blocked #dr-portal-loader{' +
            'display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important}' +
            'html.dr-tab-blocked #login-screen,body.dr-tab-blocked #login-screen{' +
            'display:flex!important;visibility:visible!important;opacity:1!important;z-index:100001!important}';
          (document.head || document.documentElement).appendChild(st);
        }
      } catch (eSeal) {}

      var r = await client.auth.signInWithPassword({ email: email, password: password });
      if (r.error) {
        showError(r.error.message || 'Login failed');
        setBusy(false);
        try {
          document.documentElement.classList.remove('dr-tab-blocked');
          document.body.classList.remove('dr-tab-blocked');
        } catch (eX) {}
        return;
      }

      var profile = { email: email, role: 'agent' };
      try {
        var uid = r.data && r.data.user && r.data.user.id;
        if (uid) {
          var pr = await client.from('profiles').select('*').eq('id', uid).maybeSingle();
          if (pr && pr.data) profile = pr.data;
        }
      } catch (ePr) {}
      window.__drProfile = profile;
      window.__drUser = r.data && r.data.user;

      if (isEmployeeProfile(profile)) {
        showError('Employee accounts must sign in on the Employee tab.');
        try {
          sessionStorage.setItem(
            'dr_tab_gate_err',
            'Employee accounts must sign in on the Employee tab.'
          );
        } catch (eG) {}
        try {
          if (window.DRDevPortal && typeof window.DRDevPortal.apply === 'function') {
            window.DRDevPortal.apply(profile);
          }
        } catch (eA) {}
        try {
          await client.auth.signOut({ scope: 'local' });
        } catch (eSo) {}
        try {
          document.body.classList.remove('dr-portal-ok', 'is-portal');
          document.body.classList.add('is-login', 'dr-tab-blocked');
          document.documentElement.classList.add('dr-tab-blocked');
          var ls0 = document.getElementById('login-screen');
          if (ls0) {
            ls0.hidden = false;
            ls0.removeAttribute('hidden');
            ls0.style.cssText = '';
          }
          ['portal-customer', 'portal-agent', 'dr-post-login-boot', 'dr-portal-loader'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            el.classList.remove('active', 'is-on');
            el.style.setProperty('display', 'none', 'important');
            el.hidden = true;
          });
        } catch (eUi) {}
        setBusy(false);
        if (btn) {
          try {
            btn.disabled = false;
            btn.textContent = 'Sign in';
            btn.style.opacity = '';
          } catch (eB2) {}
        }
        return;
      }

      try {
        if (window.DR && window.DR.toast) window.DR.toast('Successfully logged in', 'success');
        document.body.classList.add('dr-portal-ok');
        document.body.classList.remove('dr-pending-blocked', 'is-login', 'dr-tab-blocked');
        document.documentElement.classList.remove('dr-tab-blocked');
        var ls = document.getElementById('login-screen');
        if (ls) {
          ls.hidden = true;
          ls.style.cssText = 'display:none!important';
        }
        var pa = document.getElementById('portal-agent');
        if (pa) pa.classList.add('active');
        if (typeof window.showApp === 'function') {
          window.showApp(profile);
        }
      } catch (eP) {}
    } catch (err) {
      console.error(err);
      showError(err.message || String(err));
      setBusy(false);
    }
  }

  function install() {
    var prev = window.__drDoAgentLogin;
    if (prev && prev.__drAuthV9) return;
    if (prev) doLogin.__drAuthV9Orig = prev;
    doLogin.__drAuthV9 = 1;
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

  window.DRLoginAuthV9 = { v: 9, doLogin: doLogin };
})();
