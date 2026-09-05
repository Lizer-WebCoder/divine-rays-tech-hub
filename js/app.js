/**
 * Divine Rays Tech Hub — login fix + full app loader
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
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
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

  async function ensureProfile(user, extras) {
    extras = extras || {};
    var row = {
      id: user.id,
      email: user.email || extras.email || null,
      full_name: extras.full_name || (user.user_metadata && user.user_metadata.full_name) || user.email || 'User',
      role: extras.role || 'customer',
      username: extras.username || null
    };
    var r = await sb.from('profiles').upsert(row, { onConflict: 'id' }).select('*').maybeSingle();
    if (r.error) {
      var s = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return s.data || row;
    }
    return r.data || row;
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

  async function loadFullAppThen() {
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
      toast('Could not load workspace. Hard refresh (Ctrl+Shift+R).', 'error');
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
    }
  }

  function bindAuth() {
    var lc = document.getElementById('login-customer');
    if (lc) lc.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();
      if (!usingCloud) { showError('login-customer', 'Supabase not configured'); return; }
      var email = document.getElementById('cust-email').value.trim();
      var password = document.getElementById('cust-password').value;
      var r = await signIn(email, password);
      if (r.error) { showError('login-customer', r.error); return; }
      window.__drFullLoaded = true;
      loadFullAppThen();
    });

    var la = document.getElementById('login-agent');
    if (la) la.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();
      if (!usingCloud) { showError('login-agent', 'Supabase not configured'); return; }
      var id = document.getElementById('agent-username').value.trim();
      var password = document.getElementById('agent-password').value;
      var email = id;
      if (id.indexOf('@') === -1) {
        var q = await sb.from('profiles').select('email').eq('username', id).maybeSingle();
        if (q.data && q.data.email) email = q.data.email;
        else {
          showError('login-agent', 'Unknown username. Use your email instead.');
          return;
        }
      }
      var r = await signIn(email, password);
      if (r.error) { showError('login-agent', r.error); return; }
      window.__drFullLoaded = true;
      loadFullAppThen();
    });

    var rc = document.getElementById('register-customer');
    if (rc) rc.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();
      if (!usingCloud) { showError('register-customer', 'Supabase not configured'); return; }
      var name = document.getElementById('reg-cust-name').value.trim();
      var email = document.getElementById('reg-cust-email').value.trim();
      var password = document.getElementById('reg-cust-password').value;
      var r = await signUpCustomer(name, email, password);
      if (r.error) { showError('register-customer', r.error); return; }
      window.__drFullLoaded = true;
      loadFullAppThen();
    });

    var ra = document.getElementById('register-agent');
    if (ra) ra.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();
      if (!usingCloud) { showError('register-agent', 'Supabase not configured'); return; }
      var name = document.getElementById('reg-agent-name').value.trim();
      var email = document.getElementById('reg-agent-email').value.trim();
      var username = document.getElementById('reg-agent-username').value.trim();
      var password = document.getElementById('reg-agent-password').value;
      var r = await signUpAgent(name, username, password, email);
      if (r.error) { showError('register-agent', r.error); return; }
      window.__drFullLoaded = true;
      loadFullAppThen();
    });
  }

  async function trySession() {
    if (!usingCloud || window.__drFullLoaded) return;
    var res = await sb.auth.getSession();
    var session = res.data && res.data.session;
    if (session && session.user) {
      var shell = document.getElementById('app-shell');
      if (shell && (shell.hidden || shell.classList.contains('is-hidden'))) {
        window.__drFullLoaded = true;
        loadFullAppThen();
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
