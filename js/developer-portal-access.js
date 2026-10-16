/**
 * Divine Rays — Developer dual-portal access
 * Developers (kirzhianquijano, iiyasora2002) can open Employee + Admin portals.
 * Employee accounts → Employee portal only.
 * Admin/agent accounts → Admin portal only.
 */
(function () {
  'use strict';
  if (window.__DR_DEV_PORTAL >= 1) return;
  window.__DR_DEV_PORTAL = 1;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1,
    'kirzhianquijano': 1,
    'iiyasora2002': 1
  };

  function norm(v) {
    return String(v || '').toLowerCase().trim();
  }

  function isDev(v) {
    return !!DEVS[norm(v)];
  }

  function isDevSession() {
    try {
      if (window.__drIsDeveloper) return true;
      var p = window.__drProfile || {};
      if (isDev(p.email) || isDev(p.username)) return true;
      var em = sessionStorage.getItem('dr_session_email') || localStorage.getItem('dr_last_email') || '';
      var un = sessionStorage.getItem('dr_session_user') || '';
      if (isDev(em) || isDev(un)) return true;
      var u = window.__drUser || (window.DR && window.DR.user);
      if (u && (isDev(u.email) || isDev(u.user_metadata && u.user_metadata.username))) return true;
    } catch (e) {}
    return false;
  }

  function markDevHintsFromLogin() {
    try {
      var au =
        document.getElementById('agent-username') ||
        document.getElementById('agent-user');
      var ce = document.getElementById('cust-email');
      var raw = (au && au.value) || (ce && ce.value) || '';
      raw = norm(raw);
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

  function rememberLoginTab(tab) {
    try {
      sessionStorage.setItem('dr_login_tab', tab === 'agent' ? 'agent' : 'customer');
    } catch (e) {}
  }

  function getPreferredPortal() {
    try {
      var pref = sessionStorage.getItem('dr_dev_portal_pref');
      if (pref === 'employee' || pref === 'admin') return pref;
      var tab = sessionStorage.getItem('dr_login_tab');
      if (tab === 'agent') return 'admin';
      if (tab === 'customer') return 'employee';
    } catch (e) {}
    return 'admin';
  }

  function setPreferredPortal(which) {
    try {
      sessionStorage.setItem('dr_dev_portal_pref', which);
    } catch (e) {}
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
      try {
        ls.hidden = true;
        ls.style.cssText = 'display:none!important';
      } catch (e2) {}
    }
    if (which === 'employee') {
      if (pa) {
        pa.classList.remove('active');
        try { pa.style.display = 'none'; } catch (e3) {}
      }
      if (pc) {
        pc.classList.add('active');
        try {
          pc.style.removeProperty('display');
          pc.style.display = '';
        } catch (e4) {}
      }
    } else {
      if (pc) {
        pc.classList.remove('active');
        try { pc.style.display = 'none'; } catch (e5) {}
      }
      if (pa) {
        pa.classList.add('active');
        try {
          pa.style.removeProperty('display');
          pa.style.display = '';
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
      '#dr-dev-portal-switch button:hover:not(.is-active){color:#e9d5ff;background:rgba(139,92,246,0.15)}',
      '#dr-dev-portal-switch .dr-dev-label{font-size:0.68rem;color:#7c7c96;padding:0 0.35rem;align-self:center}'
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
      '<span class="dr-dev-label">Developer</span>' +
      '<button type="button" data-portal="employee">Employee</button>' +
      '<button type="button" data-portal="admin">Admin</button>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var b = e.target && (e.target.closest ? e.target.closest('button[data-portal]') : null);
      if (!b) return;
      var which = b.getAttribute('data-portal');
      if (!isDevSession()) return;
      setPreferredPortal(which);
      showPortal(which);
    });
    return el;
  }

  function updateSwitcher(active) {
    if (!isDevSession()) {
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

  function roleOf(profile) {
    var p = profile || window.__drProfile || {};
    return String(p.role || p.staff_role || '').toLowerCase().trim();
  }

  function isEmployeeRole(r) {
    r = String(r || '').toLowerCase();
    return !r || r === 'customer' || r === 'user' || r === 'end-user' || r === 'enduser' || r === 'employee' || r === 'client';
  }

  function isAdminRole(r) {
    r = String(r || '').toLowerCase();
    return r === 'agent' || r === 'admin' || r === 'developer' || r === 'owner' || r === 'staff';
  }

  function applyAccess(profile) {
    markDevHintsFromLogin();
    var p = profile || window.__drProfile || {};
    var em = norm(p.email || sessionStorage.getItem('dr_session_email') || '');
    var un = norm(p.username || sessionStorage.getItem('dr_session_user') || '');
    var dev = isDev(em) || isDev(un) || isDevSession();
    if (dev) window.__drIsDeveloper = true;

    if (dev) {
      showPortal(getPreferredPortal());
      return;
    }

    var sw = document.getElementById('dr-dev-portal-switch');
    if (sw) sw.classList.remove('is-on');

    var r = roleOf(p);
    if (isAdminRole(r) && !isEmployeeRole(r)) {
      showPortal('admin');
    } else {
      showPortal('employee');
    }
  }

  function patchApply() {
    if (typeof window.applyPortalForRole === 'function' && !window.applyPortalForRole.__drDevPatch) {
      var orig = window.applyPortalForRole;
      window.applyPortalForRole = function (role) {
        markDevHintsFromLogin();
        if (isDevSession()) {
          showPortal(getPreferredPortal());
          return;
        }
        return orig.apply(this, arguments);
      };
      window.applyPortalForRole.__drDevPatch = 1;
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target && (e.target.closest ? e.target.closest('.ltab, button[data-ltab]') : null);
      if (t) {
        var tab = (t.getAttribute('data-ltab') || '').toLowerCase();
        if (tab === 'agent' || tab === 'customer') rememberLoginTab(tab);
      }
      var btn = e.target && (e.target.closest ? e.target.closest('button[type="submit"]') : null);
      if (btn) {
        if (btn.closest('#login-agent')) rememberLoginTab('agent');
        if (btn.closest('#login-customer')) rememberLoginTab('customer');
        markDevHintsFromLogin();
      }
    },
    true
  );

  function watch() {
    patchApply();
    try {
      if (document.body.classList.contains('dr-portal-ok') || document.body.classList.contains('is-portal')) {
        if (isDevSession()) {
          var pref = getPreferredPortal();
          var pa = document.getElementById('portal-agent');
          var pc = document.getElementById('portal-customer');
          var adminOn = pa && pa.classList.contains('active');
          var empOn = pc && pc.classList.contains('active');
          if (!adminOn && !empOn) showPortal(pref);
          else updateSwitcher(adminOn ? 'admin' : 'employee');
        } else {
          var p = window.__drProfile || {};
          var r = roleOf(p);
          var pa2 = document.getElementById('portal-agent');
          var pc2 = document.getElementById('portal-customer');
          if (isEmployeeRole(r) && pa2 && pa2.classList.contains('active')) {
            showPortal('employee');
          } else if (isAdminRole(r) && !isEmployeeRole(r) && pc2 && pc2.classList.contains('active')) {
            showPortal('admin');
          }
          var sw = document.getElementById('dr-dev-portal-switch');
          if (sw) sw.classList.remove('is-on');
        }
      }
    } catch (e) {}
  }

  window.DRDevPortal = {
    v: 1,
    isDev: isDevSession,
    showEmployee: function () {
      if (!isDevSession()) return;
      setPreferredPortal('employee');
      showPortal('employee');
    },
    showAdmin: function () {
      if (!isDevSession()) return;
      setPreferredPortal('admin');
      showPortal('admin');
    },
    apply: applyAccess
  };

  patchApply();
  setTimeout(patchApply, 500);
  setTimeout(patchApply, 1500);
  setInterval(watch, 1500);
  setTimeout(watch, 800);
  setTimeout(watch, 2000);

  window.__drApplyDevPortal = applyAccess;
})();
