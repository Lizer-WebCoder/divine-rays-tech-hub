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
    if (!c) {
      console.log('[toast]', m);
      return;
    }
    var e = document.createElement('div');
    e.className = 'toast ' + (t || 'info');
    e.textContent = m;
    c.appendChild(e);
    setTimeout(function () { e.remove(); }, 3200);
  }

  function showError(formId, msg) {
    var f = document.getElementById(formId);
    if (!f) {
      alert(msg);
      return;
    }
    var e = f.querySelector('.login-error');
    if (!e) {
      e = document.createElement('div');
      e.className = 'login-error';
      e.style.color = '#f87171';
      e.style.marginBottom = '0.5rem';
      e.style.fontSize = '0.9rem';
      f.insertBefore(e, f.firstChild);
    }
    e.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.login-error').forEach(function (e) { e.remove(); });
  }

  window.switchLoginTab = function (tab) {
    document.querySelectorAll('.ltab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });
    document.querySelectorAll('.lpanel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'panel-' + tab);
    });
    clearErrors();
  };

  async function hardSignOut() {
    if (sb) {
      try { await sb.auth.signOut({ scope: 'local' }); } catch (e) {}
    }
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
    if (user) await ensureProfile(user, 'customer');
    return { user: user, profile: user ? await getProfile(user.id) : null };
  }

  async function signUpAgent(name, username, password, email) {
    var r = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: name, role: 'agent', username: username } }
    });
    if (r.error) return { error: r.error.message };
    var user = r.data.user;
    if (user) await ensureProfile(user, 'agent');
    return { user: user, profile: user ? await getProfile(user.id) : null };
  }

  function applyPortalForRole(role) {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (pc) pc.classList.remove('active');
    if (pa) pa.classList.remove('active');
    if (role === 'agent' || role === 'admin') {
      if (pa) pa.classList.add('active');
    } else {
      if (pc) pc.classList.add('active');
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

    // Fix: save status alone first so Resolved/Closed always sticks
    code = code.replace(
      "async function updateTicket(id,p){var r=await sb.from('tickets').update(p).eq('id',id).select().single();return r.error?{error:r.error.message}:{ticket:r.data};}",
      "async function updateTicket(id,p){var r=await sb.from('tickets').update(p).eq('id',id).select().single();if(r.error){console.warn('[updateTicket]',r.error);return{error:r.error.message||String(r.error)};}return{ticket:r.data};}"
    );
    code = code.replace(
      "var r=await updateTicket(currentTicketId,{assigned_to:document.getElementById('assign-agent').value||null,status:document.getElementById('quick-status').value});if(r.error){toast(r.error,'error');return;}toast('Updated','success');openTicket(currentTicketId);",
      "var __st=(document.getElementById('quick-status')||{}).value;var __as=(document.getElementById('assign-agent')||{}).value||null;var r=await updateTicket(currentTicketId,{status:__st});if(r.error){toast(r.error,'error');return;}if(__as!==null){var r2=await updateTicket(currentTicketId,{assigned_to:__as});if(r2.error){r2=await updateTicket(currentTicketId,{assignee_id:__as});}if(r2&&r2.error)console.warn('assign',r2.error);}toast('Updated: '+__st,'success');openTicket(currentTicketId);"
    );

    code = code.replace(/async\s+async\s+function/g, 'async function');
    code = code.replace(/async\s+async\s+function/g, 'async function');

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
      var session = sess.data && sess.data.session;
      if (session && session.user) {
        var prof = await getProfile(session.user.id);
        if (!prof) prof = await ensureProfile(session.user, expectedRole);
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
      try {
        if (userOrEmail.indexOf('@') === -1) {
          var resolved = await resolveAgentEmail(userOrEmail);
          if (!resolved) { showError('login-agent', 'Username not found'); return; }
          email = resolved;
        }
        var r = await signIn(email, password);
        if (r.error) { showError('login-agent', r.error); return; }
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
