/**
 * Divine Rays — login-click-fix v2
 * Mouse first-click parity with Enter; fill empty Admin portal after login.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_CLICK_FIX >= 2) return;
  window.__DR_LOGIN_CLICK_FIX = 2;

  function isPending() {
    try {
      if (window.DRForcePending && window.DRForcePending.isPendingIdentity) {
        return !!window.DRForcePending.isPendingIdentity();
      }
    } catch (e) {}
    return false;
  }

  function agentForm() {
    return document.getElementById('login-agent') ||
      document.querySelector('form.login-form#login-agent') ||
      document.querySelector('form.login-form[data-role="agent"]') ||
      document.querySelector('#login-screen form.login-form.active');
  }

  function findBtn(t) {
    if (!t || !t.closest) return null;
    var form = agentForm();
    if (!form) return null;
    var btn = t.closest('button, input[type="submit"], .btn-primary, [type="submit"]');
    if (!btn) return null;
    if (form.contains(btn)) return btn;
    var card = form.closest('.login-card, .login-panel, #login-screen');
    if (card && card.contains(btn)) return btn;
    return null;
  }

  function busyBtn(btn, on) {
    try {
      if (!btn) return;
      if (on) {
        btn.setAttribute('data-dr-prev-label', btn.textContent || 'Sign in as Admin');
        btn.textContent = 'Signing in…';
        btn.disabled = true;
        btn.style.opacity = '0.85';
      } else {
        btn.textContent = btn.getAttribute('data-dr-prev-label') || 'Sign in as Admin';
        btn.disabled = false;
        btn.style.opacity = '';
      }
    } catch (e) {}
  }

  function runLogin(btn) {
    if (isPending()) return;
    if (window.__drAgentLoginBusy || window.__drBooting) return;
    busyBtn(btn, true);
    try {
      if (typeof window.__drDoAgentLogin === 'function') {
        window.__drDoAgentLogin(btn || null);
        return;
      }
    } catch (e) {}
    try {
      var form = agentForm();
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit(btn || undefined);
        return;
      }
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    } catch (e2) {}
  }

  function onInteract(ev) {
    var btn = findBtn(ev.target);
    if (!btn) return;
    if (isPending()) return;
    runLogin(btn);
  }

  document.addEventListener('pointerdown', function (ev) {
    if (ev.button != null && ev.button !== 0) return;
    onInteract(ev);
  }, true);

  document.addEventListener('click', function (ev) {
    var btn = findBtn(ev.target);
    if (!btn) return;
    if (isPending()) return;
    if (window.__drAgentLoginBusy || window.__drBooting) {
      ev.preventDefault();
      return;
    }
    ev.preventDefault();
    onInteract(ev);
  }, true);

  function normalizeProfile(p) {
    if (!p) return null;
    var name = p.name || p.full_name || p.username || (p.email && p.email.split('@')[0]) || 'User';
    var role = p.role || p.staff_role || 'admin';
    return Object.assign({}, p, { name: name, role: role });
  }

  function fillPortal() {
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('dr-pending-blocked', 'is-login', 'dr-boot-holding', 'dr-session-restoring');
    } catch (e) {}
    try {
      if (typeof window.hideLoginShowApp === 'function') window.hideLoginShowApp();
    } catch (e0) {}
    try {
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = true;
        ls.classList.add('is-hidden');
        ls.style.cssText = 'display:none!important;height:0!important;overflow:hidden!important;';
      }
      var shell = document.getElementById('app-shell');
      if (shell) {
        shell.hidden = false;
        shell.classList.remove('is-hidden');
        shell.style.cssText = '';
      }
      var pa = document.getElementById('portal-agent');
      if (pa) {
        pa.classList.add('active');
        pa.hidden = false;
        pa.style.cssText = '';
        pa.style.visibility = 'visible';
        pa.style.opacity = '1';
      }
      var pc = document.getElementById('portal-customer');
      if (pc) pc.classList.remove('active');
    } catch (e1) {}

    var p = normalizeProfile(window.__drProfile || (window.DR && window.DR.getProfile && window.DR.getProfile()));
    try {
      if (p && typeof window.showApp === 'function') window.showApp(p);
    } catch (e2) {}
    try {
      if (typeof window.showAgentView === 'function') window.showAgentView('dashboard');
    } catch (e3) {}
    try {
      if (typeof window.renderTicketList === 'function') window.renderTicketList();
    } catch (e4) {}
    try {
      if (typeof window.renderStats === 'function') window.renderStats();
    } catch (e5) {}
    try {
      if (typeof window.renderDashboard === 'function') window.renderDashboard();
    } catch (e6) {}

    try {
      var selectors = [
        '#portal-agent', '#portal-agent .sidebar', '#portal-agent nav',
        '#agent-sidebar', '#sidebar', '.agent-sidebar', '.sidebar',
        '#view-dashboard', '#ticket-list', '#main-content', '.main-content',
        '#portal-agent .content', '#portal-agent .main', '#agent-main'
      ];
      selectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          el.hidden = false;
          el.classList.remove('is-hidden', 'hidden');
          if (el.style) {
            if (el.style.display === 'none') el.style.display = '';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          }
        });
      });
      var list = document.getElementById('ticket-list');
      if (list) list.classList.add('dr-cards-ready');
    } catch (e7) {}

    try {
      var ov = document.getElementById('dr-boot-overlay');
      if (ov) {
        ov.classList.add('is-done');
        setTimeout(function () {
          try { ov.parentNode && ov.parentNode.removeChild(ov); } catch (e) {}
        }, 400);
      }
    } catch (e8) {}
  }

  var _fillN = 0;
  setInterval(function () {
    if (!document.body.classList.contains('is-portal') && !document.body.classList.contains('dr-portal-ok')) return;
    var pa = document.getElementById('portal-agent');
    if (!pa || !pa.classList.contains('active')) return;
    var dash = document.getElementById('view-dashboard');
    var list = document.getElementById('ticket-list');
    var side = document.querySelector('#portal-agent .sidebar, #sidebar, .sidebar, #agent-sidebar');
    var looksEmpty =
      (list && list.children.length === 0 && (!dash || !dash.classList.contains('active'))) ||
      (side && (side.offsetWidth < 8 || getComputedStyle(side).display === 'none'));
    if ((looksEmpty || !side) && _fillN < 20) {
      _fillN++;
      fillPortal();
    }
  }, 400);

  function wrapLoad() {
    if (typeof window.loadFullAppThen !== 'function' || window.loadFullAppThen.__drClickFix2) return;
    var prev = window.loadFullAppThen;
    window.loadFullAppThen = function () {
      var ret = prev.apply(this, arguments);
      function after() {
        setTimeout(fillPortal, 200);
        setTimeout(fillPortal, 600);
        setTimeout(fillPortal, 1200);
        setTimeout(fillPortal, 2000);
      }
      if (ret && typeof ret.then === 'function') {
        return ret.then(function (v) { after(); return v; }).catch(function (err) { after(); throw err; });
      }
      after();
      return ret;
    };
    window.loadFullAppThen.__drClickFix2 = 1;
  }
  wrapLoad();
  setInterval(wrapLoad, 700);

  window.DRLoginClickFix = { runLogin: runLogin, fillPortal: fillPortal, v: 2 };
})();
