/**
 * Divine Rays — portal access v7
 *
 * ACCESS MATRIX
 * ─────────────
 * Developers (kirzhianquijano, iiyasora2002):
 *   • Employee tab → Employee portal
 *   • Admin tab    → Admin portal
 *   • Switcher allowed (both portals)
 *   • No approval gate
 *
 * Employee accounts (Cashier, Doctor, HR, MedTech, RadTech, Staff, Utility):
 *   • Employee tab only
 *   • No approval required
 *   • Never Admin portal / Admin tab login (no portal peek)
 *
 * Admin / IT Tech Support:
 *   • Admin tab only → Admin portal
 *   • New accounts: pending until Developer approves
 *   • Never Employee portal / Employee tab login
 */
(function () {
  'use strict';
  if (window.__DR_DEV_PORTAL >= 7) return;
  window.__DR_DEV_PORTAL = 7;

  var DEVS = {
    'kirzhianquijano@gmail.com': 1,
    'iiyasora2002@gmail.com': 1,
    'kirzhianquijano': 1,
    'iiyasora2002': 1
  };

  var EMP_JOBS = {
    cashier: 1,
    doctor: 1,
    hr: 1,
    medtech: 1,
    radtech: 1,
    staff: 1,
    utility: 1,
    employee: 1
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
    r = String(r || '').toLowerCase().trim();
    if (!r) return false;
    if (
      r === 'customer' ||
      r === 'user' ||
      r === 'end-user' ||
      r === 'enduser' ||
      r === 'employee' ||
      r === 'client'
    )
      return true;
    if (EMP_JOBS[r]) return true;
    return false;
  }

  function isStaffRole(r) {
    r = String(r || '').toLowerCase().trim();
    if (!r) return false;
    if (EMP_JOBS[r]) return false;
    return (
      r === 'agent' ||
      r === 'admin' ||
      r === 'developer' ||
      r === 'owner' ||
      r === 'it' ||
      r === 'it tech support' ||
      r === 'tech support' ||
      r.indexOf('admin') !== -1 ||
      (r.indexOf('support') !== -1 && r.indexOf('employee') === -1)
    );
  }

  function profileKind(p) {
    p = p || window.__drProfile || {};
    if (isDev(p.email) || isDev(p.username)) return 'dev';
    try {
      if (window.__drIsDeveloper) return 'dev';
    } catch (e) {}
    var role = String(p.role || '').toLowerCase().trim();
    var staff = String(p.staff_role || p.job_title || p.title || '').toLowerCase().trim();
    if (role === 'customer' || role === 'employee' || role === 'user' || role === 'client')
      return 'employee';
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
    var kind = profileKind();
    if (kind === 'staff') return 'admin';
    return 'employee';
  }

  function injectBlockCss() {
    if (document.getElementById('dr-tab-gate-css')) return;
    var st = document.createElement('style');
    st.id = 'dr-tab-gate-css';
    st.textContent =
      'html.dr-tab-blocked #portal-customer,html.dr-tab-blocked #portal-agent,' +
      'body.dr-tab-blocked #portal-customer,body.dr-tab-blocked #portal-agent,' +
      'html.dr-tab-blocked #dr-post-login-boot,html.dr-tab-blocked #dr-portal-loader,' +
      'body.dr-tab-blocked #dr-post-login-boot,body.dr-tab-blocked #dr-portal-loader{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important}' +
      'html.dr-tab-blocked #login-screen,body.dr-tab-blocked #login-screen{' +
      'display:flex!important;visibility:visible!important;opacity:1!important}';
    (document.head || document.documentElement).appendChild(st);
  }

  function hideAllPortalsAndLoaders() {
    try {
      document.body.classList.remove('dr-portal-ok', 'is-portal');
      document.body.classList.add('is-login', 'dr-tab-blocked');
      document.documentElement.classList.add('dr-tab-blocked');
    } catch (e) {}
    ['portal-customer', 'portal-agent', 'dr-post-login-boot', 'dr-portal-loader', 'dr-phase-boot'].forEach(
      function (id) {
        try {
          var el = document.getElementById(id);
          if (!el) return;
          el.classList.remove('active', 'is-on');
          el.style.setProperty('display', 'none', 'important');
          el.hidden = true;
        } catch (e2) {}
      }
    );
    try {
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = false;
        ls.removeAttribute('hidden');
        ls.style.cssText = '';
      }
    } catch (e3) {}
    try {
      var sw = document.getElementById('dr-dev-portal-switch');
      if (sw) {
        sw.classList.remove('is-on');
        sw.style.display = 'none';
      }
    } catch (e4) {}
  }

  function showPortal(which) {
    if (window.__DR_TAB_GATE_LOCK || document.body.classList.contains('dr-tab-blocked')) {
      hideAllPortalsAndLoaders();
      return;
    }
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    var ls = document.getElementById('login-screen');
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('dr-pending-blocked', 'is-login', 'dr-tab-blocked');
      document.documentElement.classList.remove('dr-tab-blocked');
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

  function markHintsFromLogin() {
    try {
      var form =
        document.querySelector('#login-agent:not([hidden])') ||
        document.querySelector('#login-customer:not([hidden])') ||
        document.querySelector('#login-agent, #login-customer');
      if (!form) return;
      var input =
        form.querySelector('input[type="email"], input[name="email"], #agent-username, #agent-user, #cust-email') ||
        form.querySelector('input');
      var raw = input && input.value ? String(input.value).trim() : '';
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
    var kind = profileKind(p);

    if (kind === 'employee') return 'employee';
    if (kind === 'staff') return 'admin';

    if (tab === 'customer') return 'employee';
    if (tab === 'agent') return 'admin';
    if (pref === 'employee') return 'employee';
    if (pref === 'admin') return 'admin';
    return getPreferredPortal();
  }

  function showLoginCardError(msg) {
    injectBlockCss();
    hideAllPortalsAndLoaders();
    var tab = getLoginTab();
    var formId = tab === 'agent' ? 'login-agent' : 'login-customer';
    try {
      if (typeof window.showForm === 'function') window.showForm(formId);
      if (typeof window.switchLoginTab === 'function')
        window.switchLoginTab(tab === 'agent' ? 'agent' : 'customer');
    } catch (e) {}
    var form =
      document.getElementById(formId) ||
      document.querySelector('#login-agent, #login-customer, .login-card form');
    var card =
      (form && form.closest && form.closest('.login-card')) || document.querySelector('.login-card');
    var box = null;
    if (form) box = form.querySelector('.form-error, .error, .login-error, [data-dr-login-err]');
    if (!box && card) box = card.querySelector('.form-error, .error, .login-error, [data-dr-login-err]');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-error dr-tab-gate-err';
      box.setAttribute('data-dr-login-err', '1');
      box.setAttribute('role', 'alert');
      box.style.cssText =
        'display:block;margin:0 0 0.85rem;padding:0.65rem 0.85rem;border-radius:10px;' +
        'background:rgba(127,29,29,.35);border:1px solid rgba(248,113,113,.45);' +
        'color:#fecaca;font-size:0.84rem;line-height:1.4;text-align:center;font-weight:500';
      if (form) form.insertBefore(box, form.firstChild);
      else if (card) card.insertBefore(box, card.firstChild);
      else document.body.appendChild(box);
    }
    box.textContent = msg || '';
    box.style.display = 'block';
    box.classList.add('is-on');
    try {
      if (card) {
        card.style.borderColor = 'rgba(248,113,113,.7)';
        card.style.boxShadow =
          '0 0 0 1px rgba(239,68,68,.45),0 0 24px rgba(239,68,68,.5),0 0 56px rgba(185,28,28,.35)';
      }
    } catch (e2) {}
  }

  async function softSignOut() {
    try {
      if (window.__drSb && window.__drSb.auth) await window.__drSb.auth.signOut({ scope: 'local' });
      else if (window.DR && typeof window.DR.sb === 'function') {
        var c = window.DR.sb();
        if (c && c.auth) await c.auth.signOut({ scope: 'local' });
      }
    } catch (e) {}
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('supabase') !== -1 || k.indexOf('sb-') === 0) localStorage.removeItem(k);
      });
    } catch (e2) {}
    try {
      sessionStorage.removeItem('dr_skip_boot_gear');
      sessionStorage.removeItem('dr_post_login_boot');
    } catch (e3) {}
    window.__drFullLoaded = false;
    window.__drBooting = false;
    window.__drProfile = null;
    window.__drUser = null;
  }

  function blockWrongTab(msg) {
    if (window.__DR_TAB_GATE_LOCK) return true;
    window.__DR_TAB_GATE_LOCK = 1;
    injectBlockCss();
    hideAllPortalsAndLoaders();
    try {
      sessionStorage.setItem('dr_tab_gate_err', msg);
    } catch (e) {}
    showLoginCardError(msg);
    softSignOut();
    setTimeout(function () {
      window.__DR_TAB_GATE_LOCK = 0;
    }, 1500);
    return true;
  }

  function consumeStoredTabError() {
    try {
      var msg = sessionStorage.getItem('dr_tab_gate_err');
      if (!msg) return;
      sessionStorage.removeItem('dr_tab_gate_err');
      setTimeout(function () {
        showLoginCardError(msg);
      }, 200);
      setTimeout(function () {
        showLoginCardError(msg);
      }, 800);
    } catch (e) {}
  }

  function applyAccess(profile) {
    var p = profile || window.__drProfile || {};
    var kind = profileKind(p);
    var tab = getLoginTab();

    if (kind === 'employee' && tab === 'agent') {
      blockWrongTab('Employee accounts must sign in on the Employee tab.');
      return;
    }
    if (kind === 'staff' && tab === 'customer') {
      blockWrongTab('Admin accounts must sign in on the Admin tab.');
      return;
    }

    try {
      document.body.classList.remove('dr-tab-blocked');
      document.documentElement.classList.remove('dr-tab-blocked');
      sessionStorage.removeItem('dr_tab_gate_err');
    } catch (e) {}

    var which = resolvePortal(p);
    if (kind === 'employee') which = 'employee';
    if (kind === 'staff') which = 'admin';
    if (kind === 'dev') {
      if (tab === 'customer') which = 'employee';
      else if (tab === 'agent') which = 'admin';
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
    window.applyPortalForRole.__drDevPatch7 = 1;

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
      var p = window.__drProfile || {};
      var kind = profileKind(p);
      var tab = getLoginTab();
      if (kind === 'employee' && tab === 'agent') {
        blockWrongTab('Employee accounts must sign in on the Employee tab.');
        return;
      }
      if (kind === 'staff' && tab === 'customer') {
        blockWrongTab('Admin accounts must sign in on the Admin tab.');
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
    v: 7,
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
  consumeStoredTabError();
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
