/**
 * Divine Rays Tech Hub — login loader (safe role switch) + pending gate v2
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  document.addEventListener('submit', function (e) {
    var id = e.target && e.target.id;
    if (id && /^(login|register)-(customer|agent)$/.test(id)) {
      e.preventDefault();
    }
  }, true);

  var cfg = window.DR_CONFIG || {};
  var sb = null;
  var usingCloud = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  if (usingCloud) {
    if (window.__drSb) {
      sb = window.__drSb;
    } else {
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      window.__drSb = sb;
    }
  }

  var DR_APPROVAL_KEY = 'dr_staff_approval';
  var DR_DEVS = { kirzhianquijano: 1, iiyasora2002: 1 };
  var DR_DEV_EMAILS = { 'kirzhianquijano@gmail.com': 1, 'iiyasora2002@gmail.com': 1 };
  function drIsDev(n) {
    var s = String(n || '').toLowerCase().trim();
    return !!(s && (DR_DEVS[s] || DR_DEV_EMAILS[s]));
  }
  function drApprovalMap() {
    try { return JSON.parse(localStorage.getItem(DR_APPROVAL_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function drGetStatus(id, un, em) {
    un = String(un || '').toLowerCase().trim();
    em = String(em || '').toLowerCase().trim();
    if (drIsDev(un) || drIsDev(em)) return 'approved';
    var m = drApprovalMap();
    if (id && m[id] === 'approved') return 'approved';
    if (un && m['u:' + un] === 'approved') return 'approved';
    if (em && m['e:' + em] === 'approved') return 'approved';
    return 'pending';
  }
  function drIsCustomerRole(r) {
    r = String(r || '').toLowerCase().trim();
    return !r || r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'employee' || r === 'client';
  }
  function drMarkPending(id, un, em) {
    try {
      var m = drApprovalMap();
      if (id) m[id] = 'pending';
      un = String(un || '').toLowerCase().trim();
      em = String(em || '').toLowerCase().trim();
      if (un) { m['pending:' + un] = 'pending'; delete m['u:' + un]; }
      if (em) { m['pending:' + em] = 'pending'; delete m['e:' + em]; }
      localStorage.setItem(DR_APPROVAL_KEY, JSON.stringify(m));
    } catch (e) {}
  }
  function drShowPendingLogin() {
    try {
      if (window.DRForcePending && window.DRForcePending.blockNow) {
        window.DRForcePending.blockNow();
        return;
      }
    } catch (e) {}
    try {
      document.body.classList.add('dr-pending-blocked');
      document.body.classList.remove('dr-portal-ok');
      var pa = document.getElementById('portal-agent');
      if (pa) { pa.classList.remove('active'); pa.style.display = 'none'; }
      var card = document.querySelector('#login-screen .login-card, .login-card');
      if (card) {
        card.style.boxShadow = '0 0 22px rgba(251,146,60,0.9),0 0 52px rgba(249,115,22,0.6)';
        card.style.borderColor = 'rgba(251,146,60,0.95)';
      }
      if (window.DR && window.DR.toast) {
        window.DR.toast('Your account is pending Administrator approval. Please wait until a Developer/Admin approves your account.', 'error');
      }
    } catch (e2) {}
  }
  async function drHardSignOutLocal() {
    try {
      if (sb && sb.auth) await sb.auth.signOut({ scope: 'local' });
    } catch (e) {}
    try {
      window.__drFullLoaded = false;
      window.__drBooting = false;
      window.__drProfile = null;
    } catch (e2) {}
  }
  function drMustBlockStaff(profile, email, username) {
    if (!profile) return true;
    var role = profile.role || profile.staff_role || '';
    if (drIsCustomerRole(role)) return false;
    var un = String(username || profile.username || '').toLowerCase().trim();
    var em = String(email || profile.email || '').toLowerCase().trim();
    if (drIsDev(un) || drIsDev(em)) return false;
    if (drGetStatus(profile.id, un, em) === 'approved') return false;
    drMarkPending(profile.id, un, em);
    return true;
  }

  function toast(m, t) {
    try { if (window.DR && window.DR.toast) window.DR.toast(m, t || 'info'); } catch (e) {}
  }
  function showError(formId, msg) {
    try {
      var f = document.getElementById(formId);
      if (!f) return;
      var e = f.querySelector('.login-error');
      if (!e) { e = document.createElement('div'); e.className = 'login-error'; f.insertBefore(e, f.firstChild); }
      e.textContent = msg || '';
      e.style.display = msg ? 'block' : 'none';
    } catch (err) {}
  }
  function clearErrors() {
    document.querySelectorAll('.login-error').forEach(function (e) { e.textContent = ''; e.style.display = 'none'; });
  }

  window.showForm = function (id) {
    document.querySelectorAll('.login-form').forEach(function (f) { f.classList.remove('active'); });
    var f = document.getElementById(id);
    if (f) f.classList.add('active');
    var tab = id.indexOf('agent') !== -1 ? 'agent' : 'customer';
    document.querySelectorAll('.ltab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-ltab') === tab);
    });
    clearErrors();
  };

  async function hardSignOut() {
    if (sb) { try { await sb.auth.signOut({ scope: 'local' }); } catch (e) {} }
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('supabase') !== -1 || k.indexOf('sb-') === 0) localStorage.removeItem(k);
      });
    } catch (e) {}
  }

  async function getProfile(uid) {
    if (!sb || !uid) return null;
    var r = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
    return r.data || null;
  }

  async function ensureProfile(user, roleHint) {
    var prof = await getProfile(user.id);
    if (prof) return prof;
    var meta = user.user_metadata || {};
    var role = roleHint || meta.role || 'customer';
    await sb.from('profiles').upsert({
      id: user.id,
      full_name: meta.full_name || meta.name || 'User',
      role: role,
      username: meta.username || null,
      email: user.email || null
    });
    return getProfile(user.id);
  }

  async function resolveAgentEmail(username) {
    var r = await sb.from('profiles').select('email').eq('username', username).maybeSingle();
    return r.data && r.data.email;
  }

  async function signIn(email, password) {
    var r = await sb.auth.signInWithPassword({ email: email, password: password });
    if (r.error) return { error: r.error.message };
    var user = r.data.user;
    var prof = await ensureProfile(user);
    return { user: user, profile: prof };
  }

  async function signUpCustomer(name, email, password) {
    var r = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: name, role: 'customer' } }
    });
    if (r.error) return { error: r.error.message };
    var user = r.data.user;
    if (!user) return { error: 'Check email to confirm signup' };
    var prof = await ensureProfile(user, 'customer');
    return { user: user, profile: prof };
  }

  async function signUpAgent(name, username, password, email) {
    var r = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: name, role: 'agent', username: username } }
    });
    if (r.error) return { error: r.error.message };
    var user = r.data.user;
    if (!user) return { error: 'Check email to confirm signup' };
    var prof = await ensureProfile(user, 'agent');
    return { user: user, profile: prof };
  }

  function applyPortalForRole(role) {
    var r = String(role || '').toLowerCase();
    if (!drIsCustomerRole(r) && (r === 'agent' || r === 'admin' || r === 'developer' || r === 'owner' || r === 'staff')) {
      try {
        var p = window.__drProfile;
        var em = (p && p.email) || '';
        var un = (p && p.username) || '';
        if (drMustBlockStaff(p || { role: r }, em, un)) {
          drShowPendingLogin();
          return;
        }
      } catch (e) {}
    }
    try { document.body.classList.add('dr-portal-ok'); document.body.classList.remove('dr-pending-blocked'); } catch (e2) {}
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (pc) pc.classList.remove('active');
    if (pa) pa.classList.remove('active');
    if (r === 'agent' || r === 'admin' || r === 'developer' || r === 'owner') {
      if (pa) pa.classList.add('active');
    } else {
      if (pc) pc.classList.add('active');
    }
  }

  async function loadFullAppThen(expectedRole) {
    if (window.__drBooting) return;
    var er = String(expectedRole || '').toLowerCase();
    if (!drIsCustomerRole(er)) {
      try {
        var p0 = window.__drProfile;
        if (p0 && drMustBlockStaff(p0, p0.email, p0.username)) {
          drShowPendingLogin();
          await drHardSignOutLocal();
          return;
        }
        if (!p0) {
          var au = document.getElementById('agent-username') || document.getElementById('agent-user');
          var raw = au ? String(au.value || '').trim() : '';
          var un = raw.indexOf('@') === -1 ? raw.toLowerCase() : '';
          var em = raw.indexOf('@') !== -1 ? raw.toLowerCase() : '';
          if (raw && !drIsDev(un) && !drIsDev(em) && drGetStatus(null, un, em) !== 'approved') {
            drShowPendingLogin();
            await drHardSignOutLocal();
            return;
          }
        }
      } catch (e0) {}
    }
    window.__drBooting = true;
    toast('Signed in…', 'success');

    var urls = [
      'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@abdc47355c0342744e79b8545458cd7d729f93d1/js/app.js',
      'https://fastly.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@abdc47355c0342744e79b8545458cd7d729f93d1/js/app.js'
    ];
    var code = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i] + '?t=' + Date.now());
        if (r.ok) { code = await r.text(); break; }
      } catch (e) {}
    }
    if (!code) {
      window.__drBooting = false;
      toast('Could not load workspace. Hard refresh.', 'error');
      return;
    }

    code = code.replace(
      "document.addEventListener('DOMContentLoaded',async function(){",
      "async function __drBoot(){"
    );
    code = code.replace(/\}\);\s*\}\)\(\);\s*$/m, "}\n__drBoot();\n})();");

    try {
      (0, eval)(code);
    } catch (err) {
      console.error(err);
      toast('Workspace error — hard refresh', 'error');
      window.__drBooting = false;
      return;
    }

    try {
      var res = await sb.auth.getSession();
      var session = res.data && res.data.session;
      if (session && session.user) {
        var prof = await getProfile(session.user.id);
        window.__drProfile = prof;
        if (drMustBlockStaff(prof, session.user.email, prof && prof.username)) {
          window.__drBooting = false;
          drShowPendingLogin();
          await drHardSignOutLocal();
          return;
        }
        if (window.DR && window.DR.showApp) {
          window.DR.showApp(prof);
        } else if (typeof showApp === 'function') {
          showApp(prof);
        }
        applyPortalForRole(prof && prof.role);
        window.__drFullLoaded = true;
      }
    } catch (e) {
      console.warn(e);
    }
    window.__drBooting = false;
  }

  window.showApp = function (p) {
    applyPortalForRole(p && p.role);
  };

  async function signOut() {
    await hardSignOut();
    window.__drFullLoaded = false;
    window.__drBooting = false;
    location.reload();
  }
  window.signOut = signOut;

  function bindAuth() {
    var lc = document.getElementById('login-customer');
    if (lc) lc.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearErrors();
      if (!usingCloud) { showError('login-customer', 'Supabase not configured'); return; }
      var emailEl = document.getElementById('cust-email');
      var passEl = document.getElementById('cust-password');
      if (!emailEl || !passEl) { showError('login-customer', 'Login form incomplete'); return; }
      var email = emailEl.value.trim();
      var password = passEl.value;
      try {
        var r = await signIn(email, password);
        if (r.error) { showError('login-customer', r.error); return; }
        await loadFullAppThen(r.profile && r.profile.role);
      } catch (err) {
        console.error(err);
        showError('login-customer', err.message || String(err));
      }
    });

    var la = document.getElementById('login-agent');
    if (la) la.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearErrors();
      if (!usingCloud) { showError('login-agent', 'Supabase not configured'); return; }
      var __au = document.getElementById('agent-username') || document.getElementById('agent-user');
      if (!__au) { showError('login-agent', 'Login form missing username field'); return; }
      var userOrEmail = __au.value.trim();
      var password = document.getElementById('agent-password').value;
      var email = userOrEmail;
      var unHint = userOrEmail.indexOf('@') === -1 ? userOrEmail.toLowerCase() : '';
      var emHint = userOrEmail.indexOf('@') !== -1 ? userOrEmail.toLowerCase() : '';
      if (!drIsDev(unHint) && !drIsDev(emHint) && drGetStatus(null, unHint, emHint) !== 'approved') {
        drMarkPending(null, unHint, emHint);
        showError('login-agent', 'Account needs approval.');
        drShowPendingLogin();
        return;
      }
      try {
        if (userOrEmail.indexOf('@') === -1) {
          var resolved = await resolveAgentEmail(userOrEmail);
          if (!resolved) { showError('login-agent', 'Username not found'); return; }
          email = resolved;
          emHint = String(email).toLowerCase();
        }
        if (!drIsDev(unHint) && !drIsDev(emHint) && drGetStatus(null, unHint, emHint) !== 'approved') {
          drMarkPending(null, unHint, emHint);
          showError('login-agent', 'Account needs approval.');
          drShowPendingLogin();
          return;
        }
        var r = await signIn(email, password);
        if (r.error) { showError('login-agent', r.error); return; }
        if (drMustBlockStaff(r.profile, email, unHint || (r.profile && r.profile.username))) {
          showError('login-agent', 'Account needs approval.');
          drShowPendingLogin();
          await drHardSignOutLocal();
          return;
        }
        window.__drProfile = r.profile;
        await loadFullAppThen(r.profile && r.profile.role);
      } catch (err) {
        console.error(err);
        showError('login-agent', err.message || String(err));
      }
    });

    var rc = document.getElementById('register-customer');
    if (rc) rc.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearErrors();
      if (!usingCloud) { showError('register-customer', 'Supabase not configured'); return; }
      var name = document.getElementById('reg-cust-name').value.trim();
      var email = document.getElementById('reg-cust-email').value.trim();
      var password = document.getElementById('reg-cust-password').value;
      try {
        var r = await signUpCustomer(name, email, password);
        if (r.error) { showError('register-customer', r.error); return; }
        await loadFullAppThen('customer');
      } catch (err) {
        showError('register-customer', err.message || String(err));
      }
    });

    var ra = document.getElementById('register-agent');
    if (ra) ra.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearErrors();
      if (!usingCloud) { showError('register-agent', 'Supabase not configured'); return; }
      var name = document.getElementById('reg-agent-name').value.trim();
      var email = document.getElementById('reg-agent-email').value.trim();
      var username = document.getElementById('reg-agent-username').value.trim();
      var password = document.getElementById('reg-agent-password').value;
      try {
        var r = await signUpAgent(name, username, password, email);
        if (r.error) { showError('register-agent', r.error); return; }
        if (drMustBlockStaff(r.profile, email, username)) {
          showError('register-agent', 'Account needs approval.');
          drShowPendingLogin();
          await drHardSignOutLocal();
          return;
        }
        await loadFullAppThen(r.profile && r.profile.role);
      } catch (err) {
        showError('register-agent', err.message || String(err));
      }
    });
  }

  async function trySession() {
    if (!usingCloud || window.__drFullLoaded || window.__drBooting) return;
    var res = await sb.auth.getSession();
    var session = res.data && res.data.session;
    if (session && session.user) {
      var shell = document.getElementById('app-shell');
      if (shell && (shell.hidden || shell.classList.contains('is-hidden'))) {
        var prof = await getProfile(session.user.id);
        if (drMustBlockStaff(prof, session.user.email, prof && prof.username)) {
          drShowPendingLogin();
          await drHardSignOutLocal();
          return;
        }
        window.__drProfile = prof;
        await loadFullAppThen(prof && prof.role);
      }
    }
  }

  function boot() {
    bindAuth();
    trySession();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
})();
