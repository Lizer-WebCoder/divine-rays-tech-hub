/**
 * Divine Rays — topbar-layout v3
 * Separate sticky top bars for Employee + Admin portals.
 * Username opens Profile via DR_PROFILE; Employee brand ends with Employees Portal.
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_LAYOUT >= 3) return;
  window.__DR_TOPBAR_LAYOUT = 3;

  var CSS_ID = 'dr-topbar-layout-css';
  var EMP_BAR_ID = 'mode-bar-employee';
  var ADM_BAR_ID = 'mode-bar-admin';
  var EMP_USER_ID = 'dr-topbar-user-btn-employee';
  var ADM_USER_ID = 'dr-topbar-user-btn-admin';
  var EMP_LOGOUT_ID = 'btn-logout-employee';
  var ADM_LOGOUT_ID = 'btn-logout-admin';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '#' + EMP_BAR_ID + ', #' + ADM_BAR_ID + ', .mode-bar-employee, .mode-bar-admin{',
      'position:fixed!important;top:0!important;left:0!important;right:0!important;',
      'width:100%!important;z-index:12000!important;',
      'display:none!important;align-items:center!important;justify-content:space-between!important;',
      'padding:0.55rem 1.25rem!important;box-sizing:border-box!important;',
      'background:rgba(18,16,28,0.96)!important;backdrop-filter:blur(10px);',
      'border-bottom:1px solid rgba(46,46,66,0.95)!important;',
      'box-shadow:0 4px 18px rgba(0,0,0,0.28)!important}',

      'body.is-portal-employee #' + EMP_BAR_ID + ', #portal-customer.active #' + EMP_BAR_ID + ',',
      'body.is-portal-employee .mode-bar-employee{display:flex!important}',
      'body.is-portal-admin #' + ADM_BAR_ID + ', #portal-agent.active #' + ADM_BAR_ID + ',',
      'body.is-portal-admin .mode-bar-admin{display:flex!important}',

      'body.dr-split-topbars #app-shell > .mode-bar, body.dr-split-topbars > .mode-bar{',
      'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;',
      'padding:0!important;border:0!important;pointer-events:none!important}',

      'body.is-portal-employee, body.is-portal-admin, body.dr-portal-ok.is-portal{padding-top:52px!important}',

      '#btn-theme, button#btn-theme, [data-theme-toggle],',
      '#btn-density, button#btn-density,',
      '#btn-profile, #btn-my-profile{',
      'display:none!important;visibility:hidden!important;pointer-events:none!important;',
      'width:0!important;height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important}',

      '#' + EMP_USER_ID + ', #' + ADM_USER_ID + '{',
      'display:inline-flex!important;align-items:center!important;gap:0.35rem!important;',
      'padding:0.35rem 0.85rem!important;border-radius:8px!important;',
      'font-size:0.82rem!important;font-weight:600!important;line-height:1.2!important;',
      'cursor:pointer!important;border:1px solid rgba(124,106,240,0.35)!important;',
      'background:rgba(124,106,240,0.12)!important;color:#c4b5fd!important;',
      'text-decoration:none!important;visibility:visible!important;opacity:1!important;',
      'pointer-events:auto!important;transition:background .15s ease,border-color .15s ease,color .15s ease}',
      '#' + EMP_USER_ID + ':hover, #' + ADM_USER_ID + ':hover{',
      'background:rgba(124,106,240,0.22)!important;border-color:rgba(124,106,240,0.55)!important;color:#e9e5ff!important}',

      '#' + EMP_LOGOUT_ID + ', #' + ADM_LOGOUT_ID + '{',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'padding:0.35rem 0.85rem!important;border-radius:8px!important;font-size:0.82rem!important;',
      'font-weight:600!important;cursor:pointer!important;line-height:1.2!important;',
      'background:rgba(239,68,68,0.1)!important;color:#f87171!important;',
      'border:1px solid rgba(239,68,68,0.45)!important}',
      '#' + EMP_LOGOUT_ID + ':hover, #' + ADM_LOGOUT_ID + ':hover{',
      'background:rgba(239,68,68,0.2)!important;border-color:rgba(239,68,68,0.7)!important;color:#fca5a5!important}',

      '#logged-user-label{display:none!important}',
      '.mode-bar-employee .user-info, .mode-bar-admin .user-info{',
      'display:flex!important;align-items:center!important;gap:0.45rem!important;flex-wrap:nowrap!important}'
    ].join('');
  }

  function prettyName(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    if (s.indexOf('@') !== -1) s = s.split('@')[0];
    s = s.replace(/[._-]+/g, ' ');
    return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function roleLabel(p) {
    if (!p) return '';
    try {
      var em = String(p.email || '').toLowerCase();
      var un = String(p.username || '').toLowerCase();
      if (
        em === 'kirzhianquijano@gmail.com' ||
        em === 'iiyasora2002@gmail.com' ||
        un === 'kirzhianquijano' ||
        un === 'iiyasora2002'
      ) {
        return 'Developer';
      }
    } catch (e) {}
    var staff = String(p.staff_role || p.job_title || '').trim();
    if (staff) return staff;
    var r = String(p.role || '').toLowerCase().trim();
    if (r === 'admin' || r === 'administrator') return 'Admin';
    if (r === 'agent' || r === 'staff') return 'Admin';
    if (r === 'it' || r === 'it tech support' || r === 'tech support') return 'IT Tech Support';
    if (
      r === 'customer' ||
      r === 'employee' ||
      r === 'user' ||
      r === 'enduser' ||
      r === 'end-user'
    ) {
      return staff || 'Employee';
    }
    if (r) return r.charAt(0).toUpperCase() + r.slice(1);
    return '';
  }

  function displayLabel() {
    var p = window.__drProfile || {};
    var name =
      prettyName(p.full_name || p.name || p.username || '') ||
      prettyName(p.email || '') ||
      'User';
    var role = roleLabel(p);
    return role ? name + ' (' + role + ')' : name;
  }

  function brandSvg() {
    return (
      '<span class="logo-sm logo-gear">' +
      '<svg class="gear-icon" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">' +
      '<g transform="translate(32,32)" fill="currentColor">' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2"/>' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(45)"/>' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(90)"/>' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(135)"/>' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(180)"/>' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(225)"/>' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(270)"/>' +
      '<rect x="-3.2" y="-26" width="6.4" height="10" rx="1.2" transform="rotate(315)"/>' +
      '<circle r="17"/><circle r="9" fill="#1a1625"/><circle r="5"/><circle r="2.2" fill="#1a1625"/>' +
      '</g></svg></span>'
    );
  }

  function openProfile(which) {
    try {
      if (window.DR_PROFILE && typeof window.DR_PROFILE.open === 'function') {
        window.DR_PROFILE.open({ readOnly: false, portal: which });
        return;
      }
    } catch (e0) {}
    try {
      if (window.DRProfile && typeof window.DRProfile.open === 'function') {
        window.DRProfile.open({ readOnly: false, portal: which });
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.openProfile === 'function') {
        window.openProfile({ readOnly: false, portal: which });
        return;
      }
    } catch (e2) {}
    try {
      var legacy =
        document.getElementById('btn-my-profile') || document.getElementById('btn-profile');
      if (legacy) {
        legacy.click();
        return;
      }
    } catch (e3) {}
    try {
      var nav = document.querySelector(
        '[data-view="profile"], #nav-profile, button[data-nav="profile"], .nav-btn[data-view="profile"]'
      );
      if (nav) nav.click();
    } catch (e4) {}
  }

  function triggerLogout() {
    try {
      var orig = document.getElementById('btn-logout');
      if (orig) {
        orig.click();
        return;
      }
    } catch (e) {}
    try {
      if (window.DRLogout && typeof window.DRLogout.confirm === 'function') {
        window.DRLogout.confirm();
        return;
      }
    } catch (e2) {}
    try {
      if (typeof window.handleLogout === 'function') window.handleLogout();
    } catch (e3) {}
  }

  function ensureBar(opts) {
    var portal = document.getElementById(opts.portalId);
    if (!portal) return null;
    var bar = document.getElementById(opts.barId);
    if (!bar) {
      bar = document.createElement('div');
      bar.id = opts.barId;
      bar.className = 'mode-bar ' + opts.barClass;
      bar.setAttribute('data-portal-topbar', opts.which);
      bar.innerHTML =
        '<div class="mode-brand" data-topbar-brand="' +
        opts.which +
        '">' +
        brandSvg() +
        '<strong>' +
        opts.brand +
        '</strong></div>' +
        '<div class="user-info" data-topbar-actions="' +
        opts.which +
        '">' +
        '<button type="button" id="' +
        opts.userId +
        '" aria-label="Open profile" title="Open profile"></button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="' +
        opts.logoutId +
        '">Logout</button>' +
        '</div>';
      if (portal.firstChild) portal.insertBefore(bar, portal.firstChild);
      else portal.appendChild(bar);

      var userBtn = document.getElementById(opts.userId);
      if (userBtn) {
        userBtn.addEventListener('click', function (e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          openProfile(opts.which);
        });
      }
      var lo = document.getElementById(opts.logoutId);
      if (lo) {
        lo.addEventListener('click', function (e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          triggerLogout();
        });
      }
    }
    var ub = document.getElementById(opts.userId);
    if (ub) {
      var next = displayLabel();
      if ((ub.textContent || '').trim() !== next) ub.textContent = next;
    }
    var strong = bar.querySelector('.mode-brand strong');
    if (strong && (strong.textContent || '').trim() !== opts.brand) {
      strong.textContent = opts.brand;
    }
    return bar;
  }

  function activePortal() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    var emp =
      pc &&
      (pc.classList.contains('active') ||
        (pc.offsetParent !== null && (!pa || !pa.classList.contains('active'))));
    var adm = pa && pa.classList.contains('active');
    if (adm && !emp) return 'admin';
    if (emp) return 'employee';
    if (document.body.classList.contains('dr-portal-ok')) {
      try {
        var tab = sessionStorage.getItem('dr_login_tab') || '';
        var pref = sessionStorage.getItem('dr_dev_portal_pref') || '';
        if (tab === 'agent' || pref === 'admin') return 'admin';
        if (tab === 'customer' || pref === 'employee') return 'employee';
      } catch (e) {}
    }
    return '';
  }

  function markBody() {
    var which = activePortal();
    document.body.classList.add('dr-split-topbars');
    document.body.classList.remove('is-portal-employee', 'is-portal-admin');
    if (which === 'employee') {
      document.body.classList.add('is-portal', 'is-portal-employee', 'dr-portal-ok');
      document.body.classList.remove('is-login');
    } else if (which === 'admin') {
      document.body.classList.add('is-portal', 'is-portal-admin', 'dr-portal-ok');
      document.body.classList.remove('is-login');
    }
  }

  function hideUnwanted() {
    ['btn-theme', 'btn-density', 'btn-profile', 'btn-my-profile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.setProperty('display', 'none', 'important');
      el.setAttribute('aria-hidden', 'true');
    });
  }

  function tick() {
    injectCss();
    ensureBar({
      which: 'employee',
      portalId: 'portal-customer',
      barId: EMP_BAR_ID,
      barClass: 'mode-bar-employee',
      userId: EMP_USER_ID,
      logoutId: EMP_LOGOUT_ID,
      brand: 'Divine Rays Tech Hub · Employees Portal'
    });
    ensureBar({
      which: 'admin',
      portalId: 'portal-agent',
      barId: ADM_BAR_ID,
      barClass: 'mode-bar-admin',
      userId: ADM_USER_ID,
      logoutId: ADM_LOGOUT_ID,
      brand: 'Divine Rays Tech Hub · Admin Portal'
    });
    markBody();
    hideUnwanted();
  }

  tick();
  var n = 0;
  var fast = setInterval(function () {
    tick();
    n += 1;
    if (n > 80) clearInterval(fast);
  }, 120);
  setInterval(tick, 3000);

  document.addEventListener(
    'click',
    function (e) {
      if (
        e.target &&
        e.target.closest &&
        e.target.closest('.mode-bar, .nav-btn, .sidebar, #dr-dev-portal-switch')
      ) {
        setTimeout(tick, 80);
      }
    },
    true
  );

  window.DRTopbarLayout = {
    v: 3,
    refresh: tick,
    openProfile: openProfile,
    employeeBarId: EMP_BAR_ID,
    adminBarId: ADM_BAR_ID
  };
})();
