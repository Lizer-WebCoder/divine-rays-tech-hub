/**
 * Divine Rays — portal access v13
 * Switcher syncs data-dr-portal-pref + topbars so Employee/Admin switch works.
 */
(function () {
  'use strict';
  if (window.__DR_DEV_PORTAL >= 13) return;
  window.__DR_DEV_PORTAL = 13;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1,
    'kirzhianquijano': 1,
    'iiyasora2002': 1
  };

  var EMP_JOBS = {
    cashier: 1, doctor: 1, hr: 1, medtech: 1, radtech: 1, staff: 1, utility: 1, employee: 1
  };

  function norm(v) { return String(v || '').toLowerCase().trim(); }
  function isDev(v) { return !!DEVS[norm(v)]; }

  function isEmployeeRole(r) {
    r = String(r || '').toLowerCase().trim();
    if (!r) return false;
    if (r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'employee' || r === 'client') return true;
    if (EMP_JOBS[r]) return true;
    return false;
  }

  function isStaffRole(r) {
    r = String(r || '').toLowerCase().trim();
    if (!r) return false;
    if (EMP_JOBS[r]) return false;
    return (
      r === 'agent' || r === 'admin' || r === 'developer' || r === 'owner' || r === 'it' ||
      r === 'it tech support' || r === 'tech support' ||
      r.indexOf('admin') !== -1 ||
      (r.indexOf('support') !== -1 && r.indexOf('employee') === -1)
    );
  }

  function profileKind(p) {
    p = p || window.__drProfile || {};
    if (isDev(p.email) || isDev(p.username)) return 'dev';
    try { if (window.__drIsDeveloper) return 'dev'; } catch (e) {}
    var role = String(p.role || '').toLowerCase().trim();
    var staff = String(p.staff_role || p.job_title || p.title || '').toLowerCase().trim();
    if (role === 'customer' || role === 'employee' || role === 'user' || role === 'client') return 'employee';
    if (EMP_JOBS[staff] || EMP_JOBS[role]) return 'employee';
    if (role === 'agent' || role === 'admin' || role === 'owner') return 'staff';
    if (isStaffRole(role) || isStaffRole(staff)) return 'staff';
    if (isEmployeeRole(role) || isEmployeeRole(staff)) return 'employee';
    return 'employee';
  }

  function sessionEmail() {
    try {
      var p = window.__drProfile || {};
      if (p.email) return norm(p.email);
      var u = window.__drUser;
      if (u && u.email) return norm(u.email);
      return norm(sessionStorage.getItem('dr_session_email') || localStorage.getItem('dr_last_email') || '');
    } catch (e) { return ''; }
  }

  function sessionUser() {
    try {
      var p = window.__drProfile || {};
      if (p.username) return norm(p.username);
      return norm(sessionStorage.getItem('dr_session_user') || '');
    } catch (e) { return ''; }
  }

  function isDevSession() {
    try {
      if (window.__drIsDeveloper) return true;
      if (isDev(sessionEmail()) || isDev(sessionUser())) return true;
      var p = window.__drProfile || {};
      if (isDev(p.email) || isDev(p.username)) return true;
      if (String(p.role || '').toLowerCase() === 'developer') return true;
    } catch (e) {}
    return false;
  }

  function canSeeSwitcher() { return isDevSession(); }

  function rememberLoginTab(tab) {
    try { sessionStorage.setItem('dr_login_tab', tab === 'agent' ? 'agent' : 'customer'); } catch (e) {}
  }

  function getLoginTab() {
    try {
      var t = sessionStorage.getItem('dr_login_tab') || '';
      if (t === 'agent' || t === 'customer') return t;
      return '';
    } catch (e) { return ''; }
  }

  function setPreferredPortal(which) {
    try { sessionStorage.setItem('dr_dev_portal_pref', which); } catch (e) {}
  }

  function getPreferredPortal() {
    try {
      var tab = getLoginTab();
      if (tab === 'customer') return 'employee';
      if (tab === 'agent') return 'admin';
      var pref = sessionStorage.getItem('dr_dev_portal_pref');
      if (pref === 'employee' || pref === 'admin') return pref;
    } catch (e) {}
    if (isDevSession()) return 'admin';
    var kind = profileKind();
    if (kind === 'staff') return 'admin';
    return 'employee';
  }

  function injectBlockCss() {
    var st = document.getElementById('dr-tab-gate-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'dr-tab-gate-css';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      'html.dr-tab-blocked #portal-customer,html.dr-tab-blocked #portal-agent,' +
      'body.dr-tab-blocked #portal-customer,body.dr-tab-blocked #portal-agent,' +
      'html.dr-tab-blocked #dr-post-login-boot,html.dr-tab-blocked #dr-portal-loader,' +
      'body.dr-tab-blocked #dr-post-login-boot,body.dr-tab-blocked #dr-portal-loader,' +
      'html.dr-tab-blocked #dr-phase-boot,body.dr-tab-blocked #dr-phase-boot{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;z-index:-1!important}' +
      'html.dr-tab-blocked #login-screen,body.dr-tab-blocked #login-screen{' +
      'display:flex!important;visibility:visible!important;opacity:1!important;z-index:100001!important}' +
      'html.dr-tab-blocked body,body.dr-tab-blocked{overflow:auto!important}';
  }

  function hideAllPortalsAndLoaders() {
    try {
      document.body.classList.remove('dr-portal-ok', 'is-portal');
      document.body.classList.add('is-login', 'dr-tab-blocked');
      document.documentElement.classList.add('dr-tab-blocked');
    } catch (e) {}
    ['portal-customer', 'portal-agent', 'dr-post-login-boot', 'dr-portal-loader', 'dr-phase-boot'].forEach(function (id) {
      try {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('active', 'is-on');
        el.style.setProperty('display', 'none', 'important');
        el.hidden = true;
      } catch (e2) {}
    });
    try {
      var ls = document.getElementById('login-screen');
      if (ls) { ls.hidden = false; ls.removeAttribute('hidden'); ls.style.cssText = ''; }
    } catch (e3) {}
    try {
      var sw = document.getElementById('dr-dev-portal-switch');
      if (sw) { sw.classList.remove('is-on'); sw.style.display = 'none'; }
    } catch (e4) {}
  }

  function sealLoginOnly() {
    injectBlockCss();
    try {
      document.documentElement.classList.add('dr-tab-blocked');
      document.body.classList.add('dr-tab-blocked', 'is-login');
      document.body.classList.remove('dr-portal-ok', 'is-portal');
    } catch (e) {}
    hideAllPortalsAndLoaders();
  }

  function clearAllGates() {
    try {
      window.__DR_TAB_GATE_LOCK = 0;
      window.__DR_TAB_GATE_MSG = '';
      sessionStorage.removeItem('dr_tab_gate_err');
      document.body.classList.remove('dr-tab-blocked', 'dr-pending-blocked', 'is-login');
      document.documentElement.classList.remove('dr-tab-blocked');
    } catch (e) {}
  }

  function showPortal(which) {
    if ((window.__DR_TAB_GATE_LOCK || document.body.classList.contains('dr-tab-blocked')) && !isDevSession()) {
      sealLoginOnly();
      return;
    }
    clearAllGates();
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    var ls = document.getElementById('login-screen');
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('dr-pending-blocked', 'is-login', 'dr-tab-blocked');
      document.documentElement.classList.remove('dr-tab-blocked');
      document.documentElement.setAttribute('data-dr-portal-pref', which === 'employee' ? 'employee' : 'admin');
      document.documentElement.removeAttribute('data-dr-hold-portal');
      if (which === 'employee') {
        document.body.classList.add('is-portal-employee');
        document.body.classList.remove('is-portal-admin');
      } else {
        document.body.classList.add('is-portal-admin');
        document.body.classList.remove('is-portal-employee');
      }
    } catch (e) {}
    if (ls) {
      try { ls.hidden = true; ls.style.cssText = 'display:none!important'; } catch (e2) {}
    }
    if (which === 'employee') {
      if (pa) {
        pa.classList.remove('active');
        try { pa.style.setProperty('display', 'none', 'important'); } catch (e3) {}
      }
      if (pc) {
        pc.hidden = false;
        pc.removeAttribute('hidden');
        pc.classList.add('active');
        try {
          pc.style.removeProperty('display');
          pc.style.setProperty('display', 'block', 'important');
          pc.style.minHeight = '100vh';
          pc.style.visibility = 'visible';
          pc.style.opacity = '1';
        } catch (e4) {}
      }
      try {
        setPreferredPortal('employee');
        rememberLoginTab('customer');
      } catch (e4b) {}
    } else {
      if (pc) {
        pc.classList.remove('active');
        try { pc.style.setProperty('display', 'none', 'important'); } catch (e5) {}
      }
      if (pa) {
        pa.hidden = false;
        pa.removeAttribute('hidden');
        pa.classList.add('active');
        try {
          pa.style.removeProperty('display');
          pa.style.setProperty('display', 'flex', 'important');
          pa.style.visibility = 'visible';
          pa.style.opacity = '1';
        } catch (e6) {}
      }
      try {
        setPreferredPortal('admin');
        rememberLoginTab('agent');
      } catch (e6b) {}
    }
    try {
      if (window.DRTopbarLayout && typeof window.DRTopbarLayout.refresh === 'function') {
        window.DRTopbarLayout.refresh();
      }
    } catch (e7) {}
    try {
      if (window.DRPortalShell && typeof window.DRPortalShell.refresh === 'function') {
        window.DRPortalShell.refresh();
      }
    } catch (e8) {}
    updateSwitcher(which);
    try {
      if (window.DRPortalReadyGate && typeof window.DRPortalReadyGate.setPref === 'function') {
        window.DRPortalReadyGate.setPref(which);
      }
    } catch (e9) {}
  }

  function injectSwitcherCss() {
    if (document.getElementById('dr-dev-portal-css')) return;
    var st = document.createElement('style');
    st.id = 'dr-dev-portal-css';
    st.textContent = [
      '#dr-dev-portal-switch{position:fixed;bottom:1.1rem;right:1.1rem;z-index:9000;',
      'display:none;gap:0.35rem;padding:0.35rem;border-radius:12px;',
      'background:rgba(18,16,30,0.88);border:1px solid rgba(167,139,250,0.45);',
      'box-shadow:0 8px 28px rgba(0,0,0,0.45),0 0 20px rgba(139,92,246,0.25);',
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}',
      '#dr-dev-portal-switch.is-on{display:flex}',
      '#dr-dev-portal-switch button{border:0;border-radius:9px;padding:0.45rem 0.75rem;',
      'font-size:0.78rem;font-weight:600;cursor:pointer;background:transparent;color:#b4b4c8}',
      '#dr-dev-portal-switch button.is-active{background:#8b5cf6;color:#fff}',
      '#dr-dev-portal-switch button:hover:not(.is-active){color:#e9d5ff;background:rgba(139,92,246,0.15)}',
      'body:not(.dr-portal-ok):not(.is-portal) #dr-dev-portal-switch{display:none!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureSwitcher() {
    injectSwitcherCss();
    var el = document.getElementById('dr-dev-portal-switch');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'dr-dev-portal-switch';
    el.innerHTML =
      '<button type="button" data-dr-portal="employee">Employee</button>' +
      '<button type="button" data-dr-portal="admin">Admin</button>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var b = e.target && (e.target.closest ? e.target.closest('[data-dr-portal]') : null);
      if (!b || !canSeeSwitcher()) return;
      var w = b.getAttribute('data-dr-portal');
      if (w === 'employee') {
        setPreferredPortal('employee');
        rememberLoginTab('customer');
        showPortal('employee');
      } else if (w === 'admin') {
        setPreferredPortal('admin');
        rememberLoginTab('agent');
        showPortal('admin');
      }
    });
    return el;
  }

  function updateSwitcher(which) {
    var el = ensureSwitcher();
    if (!canSeeSwitcher()) {
      el.classList.remove('is-on');
      el.style.display = 'none';
      return;
    }
    if (!document.body.classList.contains('dr-portal-ok') && !document.body.classList.contains('is-portal')) {
      el.classList.remove('is-on');
      el.style.display = 'none';
      return;
    }
    el.classList.add('is-on');
    el.style.display = 'flex';
    el.querySelectorAll('[data-dr-portal]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-dr-portal') === which);
    });
  }

  function resolvePortal(profile) {
    var p = profile || window.__drProfile || {};
    var em = norm(p.email || sessionEmail());
    var un = norm(p.username || sessionUser());
    if (isDev(em) || isDev(un)) window.__drIsDeveloper = true;
    var tab = getLoginTab();
    var pref = '';
    try { pref = sessionStorage.getItem('dr_dev_portal_pref') || ''; } catch (e) {}
    var kind = profileKind(p);
    if (kind === 'employee') return 'employee';
    if (kind === 'staff') return 'admin';
    if (tab === 'customer') return 'employee';
    if (tab === 'agent') return 'admin';
    if (pref === 'employee') return 'employee';
    if (pref === 'admin') return 'admin';
    return getPreferredPortal();
  }

  function applyAccess(profile) {
    clearAllGates();
    var p = profile || window.__drProfile || {};
    var which = resolvePortal(p);
    showPortal(which);
  }

  function watch() {
    try {
      if (!document.body.classList.contains('dr-portal-ok') && !document.body.classList.contains('is-portal')) {
        updateSwitcher('');
        return;
      }
      var p = window.__drProfile || {};
      var kind = profileKind(p);
      var tab = getLoginTab();
      if (kind === 'employee' && tab === 'agent') {
        return;
      }
      if (kind === 'staff' && tab === 'customer') {
        return;
      }
      var want = resolvePortal(p);
      if (kind === 'employee') want = 'employee';
      if (kind === 'staff') want = 'admin';
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      var empOn = pc && pc.classList.contains('active');
      var admOn = pa && pa.classList.contains('active');
      if (want === 'employee' && !empOn) showPortal('employee');
      else if (want === 'admin' && !admOn) showPortal('admin');
      else updateSwitcher(want);
    } catch (e) {}
  }

  window.DRDevPortal = {
    v: 13,
    isDev: isDevSession,
    canSwitch: canSeeSwitcher,
    showEmployee: function () {
      if (!canSeeSwitcher()) return;
      setPreferredPortal('employee');
      rememberLoginTab('customer');
      showPortal('employee');
    },
    showAdmin: function () {
      if (!canSeeSwitcher()) return;
      setPreferredPortal('admin');
      rememberLoginTab('agent');
      showPortal('admin');
    },
    apply: applyAccess,
    resolve: resolvePortal
  };

  window.__drApplyDevPortal = applyAccess;

  injectBlockCss();
  setTimeout(watch, 400);
  setTimeout(watch, 1200);
  setTimeout(watch, 2500);
  var n = 0;
  var iv = setInterval(function () {
    n++;
    watch();
    if (n > 6) clearInterval(iv);
  }, 1000);
  setInterval(watch, 5000);
})();
