/**
 * Divine Rays — portal access v5
 *
 * ACCESS MATRIX
 * ─────────────
 * Developers (kirzhianquijano, iiyasora2002):
 *   • Employee tab → Employee portal
 *   • Admin tab    → Admin portal
 *   • Switcher allowed (both portals)
 *   • No approval gate
 *
 * Employee accounts:
 *   • Employee tab only (no Admin tab login)
 *   • No approval required (new or existing)
 *   • Never Admin portal
 *
 * Admin / IT Tech Support:
 *   • Admin tab only → Admin portal
 *   • New accounts: pending until a Developer approves in Users Management
 *   • Approved: Admin portal anytime
 *   • Never Employee portal, no switcher
 */
(function () {
  'use strict';
  if (window.__DR_DEV_PORTAL >= 5) return;
  window.__DR_DEV_PORTAL = 5;

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

  function roleOf(p) {
    p = p || window.__drProfile || {};
    return String(p.role || p.staff_role || p.title || '').toLowerCase().trim();
  }

  function isEmployeeRole(r) {
    r = String(r || '').toLowerCase();
    return (
      !r ||
      r === 'customer' ||
      r === 'user' ||
      r === 'end-user' ||
      r === 'enduser' ||
      r === 'employee' ||
      r === 'client'
    );
  }

  function isStaffRole(r) {
    r = String(r || '').toLowerCase();
    return (
      r === 'agent' ||
      r === 'admin' ||
      r === 'developer' ||
      r === 'owner' ||
      r === 'staff' ||
      r === 'it' ||
      r.indexOf('admin') !== -1 ||
      r.indexOf('support') !== -1 ||
      r.indexOf('tech') !== -1
    );
  }

  function sessionEmail() {
    try {
      var p = window.__drProfile || {};
      if (p.email) return norm(p.email);
      var u = window.__drUser;
      if (u && u.email) return norm(u.email);
      return norm(
        sessionStorage.getItem('dr_session_email') ||
          localStorage.getItem('dr_last_email') ||
          ''
      );
    } catch (e) {
      return '';
    }
  }

  function sessionUser() {
    try {
      var p = window.__drProfile || {};
      if (p.username) return norm(p.username);
      return norm(sessionStorage.getItem('dr_session_user') || '');
    } catch (e) {
      return '';
    }
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
    return isDevSession();
  }

  function rememberLoginTab(tab) {
    try {
      sessionStorage.setItem('dr_login_tab', tab === 'agent' ? 'agent' : 'customer');
    } catch (e) {}
  }

  function getLoginTab() {
    try {
      var t = sessionStorage.getItem('dr_login_tab') || '';
      if (t === 'agent' || t === 'customer') return t;
      var agent = document.getElementById('login-agent');
      var cust = document.getElementById('login-customer');
      if (agent && cust) {
        var as = window.getComputedStyle ? getComputedStyle(agent) : null;
        var cs = window.getComputedStyle ? getComputedStyle(cust) : null;
        var agentVis = agent.offsetParent !== null || (as && as.display !== 'none');
        var custVis = cust.offsetParent !== null || (cs && cs.display !== 'none');
        if (agentVis && !custVis) return 'agent';
        if (custVis && !agentVis) return 'customer';
      }
      var activeTab = document.querySelector(
        '.ltab.active, button[data-ltab].active, .login-tabs .active'
      );
      if (activeTab) {
        var d = (activeTab.getAttribute('data-ltab') || activeTab.textContent || '').toLowerCase();
        if (d.indexOf('agent') !== -1 || d.indexOf('admin') !== -1) return 'agent';
        if (d.indexOf('customer') !== -1 || d.indexOf('employee') !== -1) return 'customer';
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  function setPreferredPortal(which) {
    try {
      sessionStorage.setItem('dr_dev_portal_pref', which);
    } catch (e) {}
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
      try {
        ls.hidden = true;
        ls.style.cssText = 'display:none!important';
      } catch (e2) {}
    }
    if (which === 'employee') {
      if (pa) {
        pa.classList.remove('active');
        try {
          pa.style.setProperty('display', 'none', 'important');
        } catch (e3) {}
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
        try {
          pc.style.setProperty('display', 'none', 'important');
        } catch (e5) {}
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
      '#dr-dev-portal-switch button:hover:not(.is-active){color:#e9d5ff;background:rgba(139,92,246,0.15)}',
      'body:not(.dr-portal-ok):not(.is-portal) #dr-dev-portal-switch{display:none!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureSwitcher() {
    injectSwitcherCss();
    var el = document.getElementById('dr-dev-portal-switch');
    if (el) {
      try {
        el.querySelectorAll('.dr-dev-label').forEach(function (n) {
          n.remove();
        });
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
      rememberLoginTab(which === 'employee' ? 'customer' : 'agent');
      showPortal(which);
    });
    return el;
  }

  function updateSwitcher(active) {
    if (!canSeeSwitcher()) {
      var off = document.getElementById('dr-dev-portal-switch');
      if (off) {
        off.classList.remove('is-on');
        off.style.display = 'none';
      }
      return;
    }
    var onPortal =
      document.body.classList.contains('dr-portal-ok') ||
      document.body.classList.contains('is-portal');
    if (!onPortal) {
      var sw0 = document.getElementById('dr-dev-portal-switch');
      if (sw0) {
        sw0.classList.remove('is-on');
        sw0.style.display = 'none';
      }
      return;
    }
    var el = ensureSwitcher();
    el.style.display = 'flex';
    el.classList.add('is-on');
    el.querySelectorAll('button[data-portal]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-portal') === active);
    });
  }

  function markHintsFromLogin() {
    try {
      var au =
        document.getElementById('agent-username') ||
        document.getElementById('agent-user');
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

  function resolvePortal(profile) {
    markHintsFromLogin();
    var p = profile || window.__drProfile || {};
    var em = norm(p.email || sessionEmail());
    var un = norm(p.username || sessionUser());
    if (isDev(em) || isDev(un)) window.__drIsDeveloper = true;

    var tab = getLoginTab();
    var pref = '';
    try {
      pref = sessionStorage.getItem('dr_dev_portal_pref') || '';
    } catch (e) {}
    var r = roleOf(p);

    if (!isDevSession() && isEmployeeRole(r) && !isStaffRole(r)) {
      return 'employee';
    }

    if (!isDevSession() && isStaffRole(r)) {
      return 'admin';
    }

    if (isDevSession()) {
      if (tab === 'customer') return 'employee';
      if (tab === 'agent') return 'admin';
      if (pref === 'employee') return 'employee';
      if (pref === 'admin') return 'admin';
      return getPreferredPortal();
    }

    return getPreferredPortal();
  }

  function applyAccess(profile) {
    var which = resolvePortal(profile);
    if (!isDevSession()) {
      var r = roleOf(profile);
      if (isStaffRole(r) && !isEmployeeRole(r)) which = 'admin';
      if (isEmployeeRole(r) && !isStaffRole(r)) which = 'employee';
    }
    if (which === 'employee') setPreferredPortal('employee');
    else setPreferredPortal('admin');
    showPortal(which);
  }

  function patchApply() {
    window.applyPortalForRole = function (role) {
      markHintsFromLogin();
      applyAccess(window.__drProfile || { role: role });
    };
    window.applyPortalForRole.__drDevPatch5 = 1;

    window.showApp = function (p) {
      if (p) window.__drProfile = p;
      markHintsFromLogin();
      applyAccess(p || window.__drProfile);
    };
    window.showApp.__drWrapped = 1;

    if (window.DR) {
      window.DR.showApp = window.showApp;
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      var t =
        e.target &&
        (e.target.closest
          ? e.target.closest('.ltab, button[data-ltab], .login-tabs button')
          : null);
      if (t) {
        var tab = (t.getAttribute('data-ltab') || '').toLowerCase();
        if (tab === 'agent' || tab === 'customer') rememberLoginTab(tab);
        else if (/admin|agent/i.test(t.textContent || '')) rememberLoginTab('agent');
        else if (/employee|customer|end.?user/i.test(t.textContent || ''))
          rememberLoginTab('customer');
      }
      var btn =
        e.target &&
        (e.target.closest
          ? e.target.closest('button[type="submit"], button.btn-primary')
          : null);
      if (btn) {
        if (btn.closest('#login-agent')) {
          rememberLoginTab('agent');
          setPreferredPortal('admin');
        }
        if (btn.closest('#login-customer')) {
          rememberLoginTab('customer');
          setPreferredPortal('employee');
        }
        markHintsFromLogin();
      }
    },
    true
  );

  function watch() {
    patchApply();
    try {
      if (
        !document.body.classList.contains('dr-portal-ok') &&
        !document.body.classList.contains('is-portal')
      ) {
        updateSwitcher('');
        return;
      }
      var want = resolvePortal(window.__drProfile);
      if (!isDevSession()) {
        var r = roleOf();
        if (isStaffRole(r) && !isEmployeeRole(r)) want = 'admin';
        if (isEmployeeRole(r) && !isStaffRole(r)) want = 'employee';
      }
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
    v: 5,
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

  patchApply();
  setTimeout(patchApply, 200);
  setTimeout(patchApply, 800);
  setTimeout(patchApply, 2000);
  setTimeout(watch, 400);
  setTimeout(watch, 1200);
  setTimeout(watch, 2500);
  var n = 0;
  var iv = setInterval(function () {
    n++;
    watch();
    if (n > 15) clearInterval(iv);
  }, 500);
  setInterval(watch, 3000);
})();
