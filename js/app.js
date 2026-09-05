/**
 * Divine Rays Tech Hub — login loader (safe role switch)
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
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  function toast(m, t) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var e = document.createElement('div');
    e.className = 'toast ' + (t || 'info');
    e.textContent = m;
    c.appendChild(e);
    setTimeout(function () { e.remove(); }, 3200);
  }

  function showError(formId, msg) {
    var f = document.getElementById(formId);
    if (!f) return;
    var e = f.querySelector('.login-error');
    if (!e) {
      e = document.createElement('div');
      e.className = 'login-error';
      f.insertBefore(e, f.firstChild);
    }
    e.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.login-error').forEach(function (e) { e.remove(); });
  }

  window.switchLoginTab = function (tab) {
    document.querySelectorAll('.ltab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-ltab') === tab);
    });
    document.querySelectorAll('.login-form').forEach(function (f) { f.classList.remove('active'); });
    var map = { customer: 'login-customer', agent: 'login-agent' };
    var el = document.getElementById(map[tab] || 'login-customer');
    if (el) el.classList.add('active');
  };

  window.showForm = function (id) {
    document.querySelectorAll('.login-form').forEach(function (f) { f.classList.remove('active'); });
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  };

  async function hardSignOut() {
    window.__drFullLoaded = false;
    window.__drBooting = false;
    try { sessionStorage.removeItem('dr_last_ticket'); } catch (e) {}
    try { if (sb) await sb.auth.signOut({ scope: 'local' }); } catch (e) {}
    try {
      if (window.DR && window.DR.sb) {
        var s2 = window.DR.sb();
        if (s2 && s2.auth) await s2.auth.signOut({ scope: 'local' });
      }
    } catch (e2) {}
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('supabase') !== -1 || k.indexOf('sb-') === 0) localStorage.removeItem(k);
      });
    } catch (e3) {}
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (pc) pc.classList.remove('active');
    if (pa) pa.classList.remove('active');
  }

  async function getProfile(userId) {
    var r = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
    return r.error ? null : r.data;
  }

  async function ensureProfile(user, extras) {
    extras = extras || {};
    var existing = await getProfile(user.id);
    if (existing) return existing;
    var row = {
      id: user.id,
      email: user.email || extras.email || null,
      full_name: extras.full_name || (user.user_metadata && user.user_metadata.full_name) || user.email || 'User',
      role: extras.role || (user.user_metadata && user.user_metadata.role) || 'customer',
      username: extras.username || (user.user_metadata && user.user_metadata.username) || null
    };
    var r = await sb.from('profiles').upsert(row, { onConflict: 'id' }).select('*').maybeSingle();
    if (r.error) return (await getProfile(user.id)) || row;
    return r.data || row;
  }

  async function resolveAgentEmail(login) {
    login = (login || '').trim();
    if (!login) return null;
    if (login.indexOf('@') !== -1) return login;
    var q = await sb.from('profiles').select('email').eq('username', login).maybeSingle();
    if (q.data && q.data.email) return q.data.email;
    var q2 = await sb.from('profiles').select('email').ilike('username', login).maybeSingle();
    if (q2.data && q2.data.email) return q2.data.email;
    return null;
  }

  async function signIn(email, password) {
    try { await sb.auth.signOut({ scope: 'local' }); } catch (e) {}
    var r = await sb.auth.signInWithPassword({ email: email, password: password });
    if (r.error) return { error: r.error.message };
    var user = r.data.user;
    var prof = await ensureProfile(user, {});
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
    if (!user) return { error: 'Check your email to confirm, then sign in.' };
    var prof = await ensureProfile(user, { full_name: name, role: 'customer', email: email });
    return { user: user, profile: prof };
  }

  async function signUpAgent(name, username, password, email) {
    var r = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: name, username: username, role: 'agent' } }
    });
    if (r.error) return { error: r.error.message };
    var user = r.data.user;
    if (!user) return { error: 'Check your email to confirm, then sign in.' };
    var prof = await ensureProfile(user, { full_name: name, role: 'agent', username: username, email: email });
    return { user: user, profile: prof };
  }

  function applyPortalForRole(role) {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (pc) pc.classList.remove('active');
    if (pa) pa.classList.remove('active');
    if (role === 'customer') {
      if (pc) pc.classList.add('active');
    } else {
      if (pa) pa.classList.add('active');
    }
  }

  async function loadFullAppThen(expectedRole) {
    if (window.__drBooting) return;
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

    code = code.replace(
      "function signInAgent(login,password){\n  var email=login.trim().indexOf('@')===-1?login.trim().toLowerCase().replace(/[^a-z0-9._-]/g,'')+'@agent.divinerays.app':login.trim();\n  return signInWithEmail(email,password);\n}",
      "async function signInAgent(login,password){\n  var email=login.trim();\n  if(email.indexOf('@')===-1){\n    var q=await sb.from('profiles').select('email').eq('username',email).maybeSingle();\n    if(q.data&&q.data.email)email=q.data.email; else return {error:'Unknown username. Use your email.'};\n  }\n  return signInWithEmail(email,password);\n}"
    );

    code = code.replace(
      "await sb.from('profiles').upsert({id:session.user.id,full_name:meta.full_name||'User',role:meta.role||'customer',username:meta.username||null});",
      "var __ex=await sb.from('profiles').select('id,role').eq('id',session.user.id).maybeSingle();if(!__ex.data){await sb.from('profiles').upsert({id:session.user.id,full_name:meta.full_name||'User',role:meta.role||'customer',username:meta.username||null});}"
    );

    code = code.replace(
      "function showApp(p){",
      "function showApp(p){if(p&&!p.name&&p.full_name)p.name=p.full_name;if(p&&!p.name)p.name=p.email||'User';"
    );

    code = code.replace(
      "async function signOut(){if(usingCloud)await sb.auth.signOut();currentProfile=null;}",
      "async function signOut(){currentProfile=null;window.__drFullLoaded=false;window.__drBooting=false;if(usingCloud){try{await sb.auth.signOut({scope:'local'});}catch(e){}}try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('supabase')!==-1||k.indexOf('sb-')===0)localStorage.removeItem(k);});}catch(e){} var pc=document.getElementById('portal-customer'),pa=document.getElementById('portal-agent');if(pc)pc.classList.remove('active');if(pa)pa.classList.remove('active');}"
    );

    try {
      (0, eval)(code);
    } catch (err) {
      console.error(err);
      toast('Workspace error — hard refresh', 'error');
      window.__drBooting = false;
      return;
    }

    try {
      var sess = await sb.auth.getSession();
      var user = sess.data && sess.data.session && sess.data.session.user;
      if (user) {
        var prof = await getProfile(user.id);
        if (prof) {
          var role = prof.role || 'customer';
          applyPortalForRole(role);
          if (window.DR && window.DR.renderStats) {
            try { window.DR.renderStats(); } catch (e) {}
          }
          var lb = document.getElementById('logged-user-label');
          var name = prof.full_name || prof.username || 'User';
          if (lb) {
            lb.textContent = name + (role === 'admin' ? ' (Admin)' : role === 'agent' ? ' (Agent)' : ' (Customer)');
          }
          var an = document.getElementById('agent-name-display');
          if (an && role !== 'customer') {
            an.textContent = name + (role === 'admin' ? ' · Admin' : '');
          }
          var navAdmin = document.getElementById('nav-admin');
          if (navAdmin) {
            if (role === 'admin') navAdmin.classList.remove('is-hidden');
            else navAdmin.classList.add('is-hidden');
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    window.__drFullLoaded = true;
    window.__drBooting = false;
  }

  function bindAuth() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-logout' || (t.closest && t.closest('#btn-logout')))) {
        e.preventDefault();
        e.stopPropagation();
        hardSignOut().then(function () {
          var login = document.getElementById('login-screen');
          var shell = document.getElementById('app-shell');
          if (login) {
            login.hidden = false;
            login.classList.remove('is-hidden');
            login.style.cssText = '';
          }
          if (shell) {
            shell.hidden = true;
            shell.classList.add('is-hidden');
          }
          clearErrors();
          window.switchLoginTab('customer');
          toast('Logged out', 'info');
        });
      }
    }, true);

    var lc = document.getElementById('login-customer');
    if (lc) lc.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearErrors();
      if (!usingCloud) { showError('login-customer', 'Supabase not configured'); return; }
      var email = document.getElementById('cust-email').value.trim();
      var password = document.getElementById('cust-password').value;
      var r = await signIn(email, password);
      if (r.error) { showError('login-customer', r.error); return; }
      await loadFullAppThen(r.profile && r.profile.role);
    });

    var la = document.getElementById('login-agent');
    if (la) la.addEventListener('submit', async function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearErrors();
      if (!usingCloud) { showError('login-agent', 'Supabase not configured'); return; }
      var id = document.getElementById('agent-username').value.trim();
      var password = document.getElementById('agent-password').value;
      var email = await resolveAgentEmail(id);
      if (!email) {
        showError('login-agent', 'Unknown username. Use your full email address.');
        return;
      }
      var r = await signIn(email, password);
      if (r.error) { showError('login-agent', r.error); return; }
      var role = r.profile && r.profile.role;
      if (role !== 'agent' && role !== 'admin') {
        await hardSignOut();
        showError('login-agent', 'This account is a customer, not agent/admin. Promote role in Supabase.');
        return;
      }
      await loadFullAppThen(role);
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
      var r = await signUpCustomer(name, email, password);
      if (r.error) { showError('register-customer', r.error); return; }
      await loadFullAppThen('customer');
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
      var r = await signUpAgent(name, username, password, email);
      if (r.error) { showError('register-agent', r.error); return; }
      await loadFullAppThen(r.profile && r.profile.role);
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
        await loadFullAppThen(prof && prof.role);
      }
    }
  }

  function boot() {
    bindAuth();
    trySession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
