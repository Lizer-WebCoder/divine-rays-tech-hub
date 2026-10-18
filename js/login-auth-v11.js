/**
 * Divine Rays — login-auth v11 — pending gate + role gate (no false approve)
 * Clears residual pending/tab-gate state so Developer login is not an empty shell.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_AUTH_V11 >= 1) return;
  window.__DR_LOGIN_AUTH_V11 = 1;

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

    var btn =
      triggerEl && triggerEl.tagName === 'BUTTON'
        ? triggerEl
        : la.querySelector('button[type="submit"], button.btn-primary, button.btn');
    var prev = 'Sign in';
    try {
      if (btn) {
        var cur = (btn.textContent || '').trim();
        if (cur && !/signing/i.test(cur)) prev = cur;
        else if (btn.getAttribute('data-dr-prev-label')) prev = btn.getAttribute('data-dr-prev-label');
        btn.setAttribute('data-dr-prev-label', prev);
      }
    } catch (ePrv) {}
    function setBusy(on) {
      try {
        window.__drAgentLoginBusy = !!on;
        if (!btn) return;
        btn.disabled = !!on;
        btn.textContent = on ? 'Signing in…' : prev;
        btn.style.opacity = on ? '0.85' : '';
      } catch (eB) {}
    }

    function triggerPendingUI(msg) {
      showError(msg || 'Account needs approval.');
      try {
        if (window.DRForcePending && window.DRForcePending.blockNow) {
          window.DRForcePending.blockNow();
        }
      } catch (eP) {}
      setBusy(false);
      if (btn) {
        try {
          btn.disabled = false;
          btn.textContent = prev;
          btn.style.opacity = '';
        } catch (eB3) {}
      }
    }

    var client = sb();
    if (!client) {
      showError('Supabase not configured');
      return;
    }

    setBusy(true);

    try {
      var m = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}') || {};
      var mA = JSON.parse(localStorage.getItem('dr_approval_map') || '{}') || {};
      var isExplPending =
        (!isDev(emHint) && !isDev(unHint)) &&
        (
          (emHint && m['pending:' + emHint] === 'pending') ||
          (unHint && m['pending:' + unHint] === 'pending') ||
          (emHint && mA[emHint] === 'pending') ||
          (unHint && mA[unHint] === 'pending')
        );
      if (isExplPending) {
        triggerPendingUI('Your account is pending Administrator approval.');
        return;
      }
    } catch (eM) {}

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
        if (isDev(emHint) || isDev(unHint)) {
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
        }
      } catch (eL) {}

      try {
        sessionStorage.setItem('dr_login_tab', 'agent');
      } catch (eTab) {}

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

      try {
        var ap = String(profile.approval_status || profile.status || '').toLowerCase().trim();
        if (ap === 'pending' && !isDev(profile.email) && !isDev(profile.username) && !isDev(emHint)) {
          try {
            var mp = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}') || {};
            if (emHint) mp['pending:' + emHint] = 'pending';
            if (unHint) mp['pending:' + unHint] = 'pending';
            localStorage.setItem('dr_staff_approval', JSON.stringify(mp));
            var ma = JSON.parse(localStorage.getItem('dr_approval_map') || '{}') || {};
            if (emHint) ma[emHint] = 'pending';
            if (unHint) ma[unHint] = 'pending';
            localStorage.setItem('dr_approval_map', JSON.stringify(ma));
          } catch (eMap) {}
          try { await client.auth.signOut({ scope: 'local' }); } catch (eSo2) {}
          try {
            document.body.classList.remove('dr-portal-ok', 'is-portal');
            document.body.classList.add('is-login', 'dr-tab-blocked');
            document.documentElement.classList.add('dr-tab-blocked');
            var lsP = document.getElementById('login-screen');
            if (lsP) { lsP.hidden = false; lsP.removeAttribute('hidden'); lsP.style.cssText = ''; }
            ['portal-customer', 'portal-agent', 'dr-post-login-boot', 'dr-portal-loader'].forEach(function (id) {
              var el = document.getElementById(id);
              if (!el) return;
              el.classList.remove('active', 'is-on');
              el.style.setProperty('display', 'none', 'important');
              el.hidden = true;
            });
          } catch (eUiP) {}
          triggerPendingUI('Your account is pending Administrator approval.');
          return;
        }
      } catch (eAp) {}

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
        window.__DR_TAB_GATE_LOCK = 0;
        window.__DR_TAB_GATE_MSG = '';
        try { sessionStorage.removeItem('dr_tab_gate_err'); } catch (eG2) {}
        try {
          if (window.DRForcePending && window.DRForcePending.clearPendingUI)
            window.DRForcePending.clearPendingUI(true);
          if (window.DRForcePending && window.DRForcePending.unlockPortal)
            window.DRForcePending.unlockPortal();
        } catch (eFp) {}
        document.body.classList.add('dr-portal-ok', 'is-portal');
        document.body.classList.remove('dr-pending-blocked', 'is-login', 'dr-tab-blocked');
        document.documentElement.classList.remove('dr-tab-blocked');
        var ls = document.getElementById('login-screen');
        if (ls) {
          ls.hidden = true;
          ls.style.cssText = 'display:none!important';
        }
        var pa = document.getElementById('portal-agent');
        if (pa) {
          pa.hidden = false;
          pa.removeAttribute('hidden');
          pa.classList.add('active');
          try {
            pa.style.removeProperty('display');
            pa.style.setProperty('display', 'flex', 'important');
            pa.style.visibility = 'visible';
            pa.style.opacity = '1';
          } catch (ePa) {}
        }
        var pc = document.getElementById('portal-customer');
        if (pc) {
          pc.classList.remove('active');
          try { pc.style.setProperty('display', 'none', 'important'); } catch (ePc) {}
        }
        if (window.DR && window.DR.toast) window.DR.toast('Successfully logged in', 'success');
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
    if (prev && prev.__drAuthV11) return;
    if (prev) doLogin.__drAuthV11Orig = prev;
    doLogin.__drAuthV11 = 1;
    window.__drDoAgentLogin = doLogin;
  }
  install();
  setTimeout(install, 300);
  setTimeout(install, 1000);
  setTimeout(install, 2500);

  window.DRLoginAuthV11 = { v: 11, doLogin: doLogin };
})();
