/**
 * Divine Rays — portal access v2
 * Login tab wins. Switcher for staff (no Developer label).
 * Employee tab: Employees + Developers only.
 */
(function () {
  'use strict';
  if (window.__DR_DEV_PORTAL >= 2) return;
  window.__DR_DEV_PORTAL = 2;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1,
    'kirzhianquijano': 1,
    'iiyasora2002': 1
  };

  function norm(v) { return String(v || '').toLowerCase().trim(); }
  function isDev(v) { return !!DEVS[norm(v)]; }

  function roleOf(p) {
    p = p || window.__drProfile || {};
    return String(p.role || p.staff_role || p.title || '').toLowerCase().trim();
  }

  function isEmployeeRole(r) {
    r = String(r || '').toLowerCase();
    return !r || r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'employee' || r === 'client';
  }

  function isStaffRole(r) {
    r = String(r || '').toLowerCase();
    return r === 'agent' || r === 'admin' || r === 'developer' || r === 'owner' || r === 'staff' ||
      r === 'it' || r.indexOf('admin') !== -1 || r.indexOf('support') !== -1 || r.indexOf('tech') !== -1;
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

  function canSeeSwitcher() {
    if (isDevSession()) return true;
    var r = roleOf();
    if (isStaffRole(r) && !isEmployeeRole(r)) return true;
    return false;
  }

  function rememberLoginTab(tab) {
    try { sessionStorage.setItem('dr_login_tab', tab === 'agent' ? 'agent' : 'customer'); } catch (e) {}
  }

  function getLoginTab() {
    try { return sessionStorage.getItem('dr_login_tab') || ''; } catch (e) { return ''; }
  }

  function setPreferredPortal(which) {
    try { sessionStorage.setItem('dr_dev_portal_pref', which); } catch (e) {}
  }

  function getPreferredPortal() {
    try {
      var pref = sessionStorage.getItem('dr_dev_portal_pref');
      if (pref === 'employee' || pref === 'admin') return pref;
      var tab = getLoginTab();
      if (tab === 'customer') return 'employee';
      if (tab === 'agent') return 'admin';
    } catch (e) {}
    if (isDevSession()) return 'admin';
    var r = roleOf();
    if (isStaffRole(r) && !isEmployeeRole(r)) return 'admin';
    return 'employee';
  }

  function showPortal(which) {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    var ls = document.getElementById('login-screen');
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('dr-pending-blocked', 'is-login');
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
        pc.classList.add('active');
        try {
          pc.style.removeProperty('display');
          pc.style.setProperty('display', 'block', 'important');
          pc.style.minHeight = '100vh';
        } catch (e4) {}
      }
    } else {
      if (pc) {
        pc.classList.remove('active');
        try { pc.style.setProperty('display', 'none', 'important'); } catch (e5) {}
      }
      if (pa) {
        pa.classList.add('active');
        try {
          pa.style.removeProperty('display');
          pa.style.setProperty('display', 'flex', 'important');
        } catch (e6) {}
      }
    }
    updateSwitcher(which);
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
      '#dr-dev-portal-switch button:hover:not(.is-active){color:#e9d5ff;background:rgba(139,92,246,0.15)}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureSwitcher() {
    injectSwitcherCss();
    var el = document.getElementById('dr-dev-portal-switch');
    if (el) {
      // strip old Developer label if present
      try {
        el.querySelectorAll('.dr-dev-label').forEach(function (n) { n.remove(); });
      } catch (e) {}
      return el;
    }
    el = document.createElement('div');
    el.id = 'dr-dev-portal-switch';
    el.innerHTML =
      '<button type="button" data-portal="employee">Employee</button>' +
      '<button type="button" data-portal="admin">Admin</button>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var b = e.target && (e.target.closest ? e.target.closest('button[data-portal]') : null);
      if (!b || !canSeeSwitcher()) return;
      var which = b.getAttribute('data-portal');
      setPreferredPortal(which);
      showPortal(which);
    });
    return el;
  }

  function updateSwitcher(active) {
    if (!canSeeSwitcher()) {
      var off = document.getElementById('dr-dev-portal-switch');
      if (off) off.classList.remove('is-on');
      return;
    }
    var el = ensureSwitcher();
    el.classList.add('is-on');
    el.querySelectorAll('button[data-portal]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-portal') === active);
    });
  }

  function markHintsFromLogin() {
    try {
      var au = document.getElementById('agent-username') || document.getElementById('agent-user');
      var ce = document.getElementById('cust-email');
      var raw = norm((au && au.value) || (ce && ce.value) || '');
      if (!raw) return;
      if (raw.indexOf('@') !== -1) {
        sessionStorage.setItem('dr_session_email', raw);
        if (isDev(raw)) window.__drIsDeveloper = true;
      } else {
        sessionStorage.setItem('dr_session_user', raw);
        if (isDev(raw)) window.__drIsDeveloper = true;
      }
    } catch (e) {}
  }

  function applyAccess(profile) {
    markHintsFromLogin();
    var p = profile || window.__drProfile || {};
    var em = norm(p.email || sessionEmail());
    var un = norm(p.username || sessionUser());
    if (isDev(em) || isDev(un)) window.__drIsDeveloper = true;

    var tab = getLoginTab();
    var r = roleOf(p);

    // Real employees only
    if (!isDevSession() && isEmployeeRole(r) && !isStaffRole(r)) {
      setPreferredPortal('employee');
      showPortal('employee');
      return;
    }

    // Admin / IT (non-developer): Admin portal only
    if (!isDevSession() && isStaffRole(r)) {
      setPreferredPortal('admin');
      showPortal('admin');
      return;
    }

    // Developers: LOGIN TAB WINS
    if (isDevSession()) {
      if (tab === 'customer') {
        setPreferredPortal('employee');
        showPortal('employee');
        return;
      }
      if (tab === 'agent') {
        setPreferredPortal('admin');
        showPortal('admin');
        return;
      }
      showPortal(getPreferredPortal());
      return;
    }

    showPortal(getPreferredPortal());
  }

  function patchApply() {
    if (typeof window.applyPortalForRole === 'function' && !window.applyPortalForRole.__drDevPatch2) {
      window.applyPortalForRole = function (role) {
        markHintsFromLogin();
        applyAccess(window.__drProfile || { role: role });
      };
      window.applyPortalForRole.__drDevPatch2 = 1;
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target && (e.target.closest ? e.target.closest('.ltab, button[data-ltab]') : null);
      if (t) {
        var tab = (t.getAttribute('data-ltab') || '').toLowerCase();
        if (tab === 'agent' || tab === 'customer') rememberLoginTab(tab);
        else if (/admin|agent/i.test(t.textContent || '')) rememberLoginTab('agent');
        else if (/employee|customer/i.test(t.textContent || '')) rememberLoginTab('customer');
      }
      var btn = e.target && (e.target.closest ? e.target.closest('button[type="submit"]') : null);
      if (btn) {
        if (btn.closest('#login-agent')) rememberLoginTab('agent');
        if (btn.closest('#login-customer')) rememberLoginTab('customer');
        markHintsFromLogin();
      }
    },
    true
  );

  function watch() {
    patchApply();
    try {
      if (!document.body.classList.contains('dr-portal-ok') && !document.body.classList.contains('is-portal')) return;
      if (!canSeeSwitcher()) {
        var sw = document.getElementById('dr-dev-portal-switch');
        if (sw) sw.classList.remove('is-on');
        return;
      }
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      var adminOn = pa && pa.classList.contains('active');
      var empOn = pc && pc.classList.contains('active');
      if (getLoginTab() === 'customer' && sessionStorage.getItem('dr_force_emp_once') !== '1') {
        try { sessionStorage.setItem('dr_force_emp_once', '1'); } catch (e) {}
        setPreferredPortal('employee');
        showPortal('employee');
        return;
      }
      if (!adminOn && !empOn) showPortal(getPreferredPortal());
      else updateSwitcher(empOn ? 'employee' : 'admin');
    } catch (e) {}
  }

  window.DRDevPortal = {
    v: 2,
    isDev: isDevSession,
    canSwitch: canSeeSwitcher,
    showEmployee: function () {
      if (!canSeeSwitcher()) return;
      setPreferredPortal('employee');
      showPortal('employee');
    },
    showAdmin: function () {
      if (!canSeeSwitcher()) return;
      setPreferredPortal('admin');
      showPortal('admin');
    },
    apply: applyAccess
  };

  window.__drApplyDevPortal = applyAccess;
  patchApply();
  setTimeout(patchApply, 500);
  setTimeout(patchApply, 1500);
  setInterval(watch, 2000);
  setTimeout(watch, 600);
  setTimeout(watch, 1600);
})();
