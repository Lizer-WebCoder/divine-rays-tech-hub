/**
 * Divine Rays — separate Employee / Admin registration cards
 * Same glass + glow as login; not the same card as login
 */
(function () {
  'use strict';
  if (window.__DR_REG_CARDS >= 1) return;
  window.__DR_REG_CARDS = 1;

  var CSS_ID = 'dr-reg-cards-css';
  var EMP_ID = 'dr-reg-card-employee';
  var ADM_ID = 'dr-reg-card-admin';

  var CSS = [
    '.dr-reg-overlay{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;',
    'padding:1.25rem;background:rgba(6,4,14,0.35);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}',
    '.dr-reg-overlay[hidden]{display:none!important}',
    '.dr-reg-card{',
    'width:100%;max-width:420px;padding:2rem 1.75rem;border-radius:16px;',
    'background:rgba(18,16,30,0.58)!important;',
    'backdrop-filter:blur(16px) saturate(1.25)!important;',
    '-webkit-backdrop-filter:blur(16px) saturate(1.25)!important;',
    'border:1px solid rgba(167,139,250,0.4)!important;',
    'box-shadow:0 0 0 1px rgba(124,106,240,0.3),0 0 24px rgba(139,92,246,0.55),0 0 56px rgba(109,40,217,0.45),0 0 100px rgba(76,29,149,0.3)!important;',
    'color:#eeeef6;position:relative',
    '}',
    '.dr-reg-card h2{margin:0 0 0.25rem;font-size:1.15rem;font-weight:650;text-align:center}',
    '.dr-reg-card .dr-reg-sub{margin:0 0 1.25rem;font-size:0.82rem;color:#9494ae;text-align:center}',
    '.dr-reg-card .form-group{margin-bottom:0.85rem}',
    '.dr-reg-card .form-group label{display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:#9898b0}',
    '.dr-reg-card .form-group input,.dr-reg-card .form-group select{',
    'width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border-radius:10px;',
    'background:rgba(10,10,18,0.75)!important;border:1px solid rgba(46,46,66,0.9);',
    'color:#eeeef6;font-size:0.92rem;outline:none',
    '}',
    '.dr-reg-card .form-group input:focus,.dr-reg-card .form-group select:focus{',
    'border-color:rgba(167,139,250,0.55);box-shadow:0 0 0 3px rgba(124,106,240,0.15)',
    '}',
    '.dr-reg-card .form-row{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}',
    '@media(max-width:420px){.dr-reg-card .form-row{grid-template-columns:1fr}}',
    '.dr-reg-card .btn-full{width:100%;margin-top:0.35rem;padding:0.75rem 1rem;border:none;border-radius:10px;',
    'background:#8b5cf6;color:#fff;font-weight:600;font-size:0.95rem;cursor:pointer}',
    '.dr-reg-card .btn-full:hover{filter:brightness(1.08)}',
    '.dr-reg-card .btn-full:disabled{opacity:0.55;cursor:wait}',
    '.dr-reg-card .login-switch{margin:0.9rem 0 0;text-align:center;font-size:0.85rem;color:#9494ae}',
    '.dr-reg-card .login-switch a{color:#a78bfa;text-decoration:none;font-weight:500}',
    '.dr-reg-card .login-switch a:hover{text-decoration:underline}',
    '.dr-reg-card .dr-reg-err{display:none;margin:0 0 0.75rem;padding:0.55rem 0.75rem;border-radius:8px;',
    'background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);color:#fca5a5;font-size:0.82rem}',
    '.dr-reg-card .dr-reg-err.is-on{display:block}',
    '.dr-reg-card .dr-reg-logo{width:40px;height:40px;border-radius:10px;margin:0 auto 0.75rem;display:block;',
    'background:linear-gradient(135deg,#6d5a9a,#2a1f3d);box-shadow:0 4px 16px rgba(109,90,154,0.35)}',
    '#login-screen #register-customer,#login-screen #register-agent{display:none!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function loginCard() {
    return document.querySelector('#login-screen .login-card, .login-card');
  }

  function setLoginVisible(on) {
    var card = loginCard();
    if (!card) return;
    if (on) {
      card.style.removeProperty('display');
      card.style.removeProperty('visibility');
      card.style.removeProperty('opacity');
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  }

  function hideAllReg() {
    [EMP_ID, ADM_ID].forEach(function (id) {
      var o = document.getElementById(id);
      if (o) {
        o.hidden = true;
        o.setAttribute('hidden', '');
      }
    });
  }

  function showReg(kind) {
    hideAllReg();
    setLoginVisible(false);
    var id = kind === 'admin' ? ADM_ID : EMP_ID;
    var o = document.getElementById(id);
    if (o) {
      o.hidden = false;
      o.removeAttribute('hidden');
    }
  }

  function showLogin() {
    hideAllReg();
    setLoginVisible(true);
    try {
      if (typeof window.showForm === 'function') {
        var activeTab = document.querySelector('.ltab.active, button[data-ltab].active');
        var tab = activeTab && (activeTab.getAttribute('data-ltab') || '');
        if (tab === 'agent') window.showForm('login-agent');
        else window.showForm('login-customer');
      }
    } catch (e) {}
  }

  function errBox(form, msg) {
    var e = form.querySelector('.dr-reg-err');
    if (!e) return;
    if (msg) {
      e.textContent = msg;
      e.classList.add('is-on');
    } else {
      e.textContent = '';
      e.classList.remove('is-on');
    }
  }

  function buildEmployeeCard() {
    if (document.getElementById(EMP_ID)) return;
    var o = document.createElement('div');
    o.id = EMP_ID;
    o.className = 'dr-reg-overlay';
    o.hidden = true;
    o.setAttribute('hidden', '');
    o.innerHTML =
      '<div class="dr-reg-card" role="dialog" aria-labelledby="dr-reg-emp-title">' +
      '<div class="dr-reg-logo" aria-hidden="true"></div>' +
      '<h2 id="dr-reg-emp-title">Employee Registration</h2>' +
      '<p class="dr-reg-sub">Create your employee support account</p>' +
      '<div class="dr-reg-err" role="alert"></div>' +
      '<form id="dr-form-reg-employee" autocomplete="on">' +
      '<div class="form-group"><label for="dr-emp-name">Full Name</label>' +
      '<input type="text" id="dr-emp-name" required placeholder="Jane Doe" autocomplete="name"/></div>' +
      '<div class="form-group"><label for="dr-emp-email">Email</label>' +
      '<input type="email" id="dr-emp-email" required placeholder="you@company.com" autocomplete="email"/></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label for="dr-emp-branch">Branch</label>' +
      '<select id="dr-emp-branch" required>' +
      '<option value="">Select branch</option>' +
      '<option value="Main Office">Main Office</option>' +
      '<option value="North Branch">North Branch</option>' +
      '<option value="South Branch">South Branch</option>' +
      '<option value="East Branch">East Branch</option>' +
      '<option value="West Branch">West Branch</option>' +
      '<option value="Remote">Remote</option>' +
      '</select></div>' +
      '<div class="form-group"><label for="dr-emp-role">Role</label>' +
      '<select id="dr-emp-role" required>' +
      '<option value="">Select role</option>' +
      '<option value="Staff">Staff</option>' +
      '<option value="Supervisor">Supervisor</option>' +
      '<option value="Manager">Manager</option>' +
      '<option value="Intern">Intern</option>' +
      '</select></div>' +
      '</div>' +
      '<div class="form-group"><label for="dr-emp-password">Password</label>' +
      '<input type="password" id="dr-emp-password" required minlength="4" placeholder="••••••••" autocomplete="new-password"/></div>' +
      '<button type="submit" class="btn-full">Create Employee Account</button>' +
      '</form>' +
      '<p class="login-switch">Already have an account? <a href="#" data-dr-back-login="1">Sign in</a></p>' +
      '</div>';
    document.body.appendChild(o);
    o.querySelector('[data-dr-back-login]').addEventListener('click', function (e) {
      e.preventDefault();
      showLogin();
    });
    o.querySelector('form').addEventListener('submit', onEmployeeSubmit);
  }

  function buildAdminCard() {
    if (document.getElementById(ADM_ID)) return;
    var o = document.createElement('div');
    o.id = ADM_ID;
    o.className = 'dr-reg-overlay';
    o.hidden = true;
    o.setAttribute('hidden', '');
    o.innerHTML =
      '<div class="dr-reg-card" role="dialog" aria-labelledby="dr-reg-adm-title">' +
      '<div class="dr-reg-logo" aria-hidden="true"></div>' +
      '<h2 id="dr-reg-adm-title">Admin Registration</h2>' +
      '<p class="dr-reg-sub">Create a staff account — requires Developer approval</p>' +
      '<div class="dr-reg-err" role="alert"></div>' +
      '<form id="dr-form-reg-admin" autocomplete="on">' +
      '<div class="form-group"><label for="dr-adm-name">Full Name</label>' +
      '<input type="text" id="dr-adm-name" required placeholder="Jane Doe" autocomplete="name"/></div>' +
      '<div class="form-group"><label for="dr-adm-email">Email</label>' +
      '<input type="email" id="dr-adm-email" required placeholder="you@company.com" autocomplete="email"/></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label for="dr-adm-username">Username</label>' +
      '<input type="text" id="dr-adm-username" required placeholder="Choose a username" autocomplete="username"/></div>' +
      '<div class="form-group"><label for="dr-adm-role">Role</label>' +
      '<select id="dr-adm-role" required>' +
      '<option value="IT Tech Support">IT Tech Support</option>' +
      '<option value="Admin">Admin</option>' +
      '</select></div>' +
      '</div>' +
      '<div class="form-group"><label for="dr-adm-password">Password</label>' +
      '<input type="password" id="dr-adm-password" required minlength="6" placeholder="••••••••" autocomplete="new-password"/></div>' +
      '<div class="form-group"><label for="dr-adm-password2">Confirm Password</label>' +
      '<input type="password" id="dr-adm-password2" required minlength="6" placeholder="••••••••" autocomplete="new-password"/></div>' +
      '<button type="submit" class="btn-full">Create Admin Account</button>' +
      '</form>' +
      '<p class="login-switch">Already have an account? <a href="#" data-dr-back-login="1">Sign in</a></p>' +
      '</div>';
    document.body.appendChild(o);
    o.querySelector('[data-dr-back-login]').addEventListener('click', function (e) {
      e.preventDefault();
      showLogin();
    });
    o.querySelector('form').addEventListener('submit', onAdminSubmit);
  }

  function getSb() {
    try {
      if (window.__drSb) return window.__drSb;
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return null;
  }

  async function onEmployeeSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    var form = e.target;
    errBox(form, '');
    var name = (document.getElementById('dr-emp-name').value || '').trim();
    var email = (document.getElementById('dr-emp-email').value || '').trim();
    var branch = document.getElementById('dr-emp-branch').value;
    var role = document.getElementById('dr-emp-role').value;
    var password = document.getElementById('dr-emp-password').value;
    if (!name || !email || !branch || !role || !password) {
      errBox(form, 'Please fill in all fields.');
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

    var client = getSb();
    if (!client) {
      errBox(form, 'Connection not ready. Refresh and try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Employee Account'; }
      return;
    }

    try {
      var r = await client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            role: 'customer',
            branch: branch,
            staff_role: role,
            job_title: role
          }
        }
      });
      if (r.error) throw r.error;
      try {
        var uid = r.data && r.data.user && r.data.user.id;
        if (uid) {
          await client.from('profiles').upsert({
            id: uid,
            email: email,
            full_name: name,
            role: 'customer',
            branch: branch,
            staff_role: role
          });
        }
      } catch (e3) {}
      if (window.DR && window.DR.toast) window.DR.toast('Employee account created — you can sign in', 'success');
      else alert('Employee account created — you can sign in');
      form.reset();
      showLogin();
      try { if (typeof window.showForm === 'function') window.showForm('login-customer'); } catch (e4) {}
    } catch (err) {
      errBox(form, (err && err.message) || 'Could not create account');
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Create Employee Account'; }
  }

  async function onAdminSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    var form = e.target;
    errBox(form, '');
    var name = (document.getElementById('dr-adm-name').value || '').trim();
    var email = (document.getElementById('dr-adm-email').value || '').trim();
    var username = (document.getElementById('dr-adm-username').value || '').trim();
    var role = document.getElementById('dr-adm-role').value;
    var password = document.getElementById('dr-adm-password').value;
    var password2 = document.getElementById('dr-adm-password2').value;
    if (!name || !email || !username || !role || !password) {
      errBox(form, 'Please fill in all fields.');
      return;
    }
    if (password !== password2) {
      errBox(form, 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      errBox(form, 'Password must be at least 6 characters.');
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

    var client = getSb();
    if (!client) {
      errBox(form, 'Connection not ready. Refresh and try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Admin Account'; }
      return;
    }

    try {
      var staffRole = role || 'IT Tech Support';
      var rLow = staffRole.toLowerCase();
      var dbRole = rLow === 'admin' || rLow === 'owner' ? 'admin' : 'agent';
      var r = await client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            username: username,
            role: dbRole,
            staff_role: staffRole
          }
        }
      });
      if (r.error) throw r.error;
      var uid = r.data && r.data.user && r.data.user.id;
      if (uid) {
        try {
          await client.from('profiles').upsert({
            id: uid,
            email: email,
            full_name: name,
            username: username,
            role: dbRole,
            staff_role: staffRole,
            approval_status: 'pending'
          });
        } catch (e2) {}
        try {
          var m = JSON.parse(localStorage.getItem('dr_staff_approval') || '{}') || {};
          m[uid] = 'pending';
          m['pending:' + username.toLowerCase()] = 'pending';
          m['pending:' + email.toLowerCase()] = 'pending';
          m['role:' + username.toLowerCase()] = staffRole;
          localStorage.setItem('dr_staff_approval', JSON.stringify(m));
        } catch (e3) {}
      }
      if (window.DR && window.DR.toast) {
        window.DR.toast('Account created — waiting for Developer approval', 'info');
      } else {
        alert('Account created. A request was sent for Developer approval.');
      }
      form.reset();
      showLogin();
      try { if (typeof window.showForm === 'function') window.showForm('login-agent'); } catch (e4) {}
    } catch (err) {
      errBox(form, (err && err.message) || 'Could not create account');
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Create Admin Account'; }
  }

  function wireCreateLinks() {
    document.addEventListener(
      'click',
      function (e) {
        var a = e.target && (e.target.closest ? e.target.closest('a') : null);
        if (!a) return;
        var href = a.getAttribute('href') || '';
        var onclick = a.getAttribute('onclick') || '';
        var text = (a.textContent || '').toLowerCase();
        var wantsCreate =
          /create\s*(an\s*)?account/i.test(text) ||
          /create\s*agent/i.test(text) ||
          onclick.indexOf('register-customer') !== -1 ||
          onclick.indexOf('register-agent') !== -1 ||
          href.indexOf('register') !== -1;
        if (!wantsCreate) return;

        e.preventDefault();
        e.stopPropagation();
        var isAdmin =
          onclick.indexOf('register-agent') !== -1 ||
          /agent/i.test(text) ||
          !!(a.closest && a.closest('#login-agent'));
        if (!isAdmin) {
          var active = document.querySelector('.ltab.active, button[data-ltab].active');
          var tab = active && (active.getAttribute('data-ltab') || '');
          if (tab === 'agent') isAdmin = true;
          if (a.closest && a.closest('#login-customer')) isAdmin = false;
        }
        showReg(isAdmin ? 'admin' : 'employee');
      },
      true
    );
  }

  function patchShowForm() {
    if (typeof window.showForm !== 'function') return;
    if (window.showForm.__drRegPatch) return;
    var orig = window.showForm;
    window.showForm = function (id) {
      if (id === 'register-customer') {
        showReg('employee');
        return;
      }
      if (id === 'register-agent') {
        showReg('admin');
        return;
      }
      if (id === 'login-customer' || id === 'login-agent') {
        hideAllReg();
        setLoginVisible(true);
      }
      return orig.apply(this, arguments);
    };
    window.showForm.__drRegPatch = 1;
  }

  function boot() {
    injectCss();
    buildEmployeeCard();
    buildAdminCard();
    wireCreateLinks();
    patchShowForm();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(function () { boot(); patchShowForm(); }, 1200);
  setTimeout(patchShowForm, 2500);

  window.DRRegCards = {
    v: 1,
    showEmployee: function () { showReg('employee'); },
    showAdmin: function () { showReg('admin'); },
    showLogin: showLogin
  };
})();
