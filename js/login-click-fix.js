/**
 * Divine Rays — login-click-fix v3 (stable)
 * Backup click path only; early bridge owns first pointerdown.
 * Soft portal fill without aggressive intervals.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_CLICK_FIX >= 3) return;
  window.__DR_LOGIN_CLICK_FIX = 3;

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
      document.querySelector('#login-screen form.login-form.active');
  }

  function findBtn(t) {
    if (!t || !t.closest) return null;
    var form = agentForm();
    if (!form) return null;
    var btn = t.closest('button, input[type="submit"]');
    if (!btn) return null;
    if (form.contains(btn)) return btn;
    var card = form.closest('.login-card, #login-screen');
    return (card && card.contains(btn)) ? btn : null;
  }

  function runLogin(btn) {
    if (isPending()) return;
    if (window.__drAgentLoginBusy || window.__drBooting) return;
    if (window.__drEarlyLoginQueued) return;
    try {
      if (typeof window.__drDoAgentLogin === 'function') {
        window.__drDoAgentLogin(btn || null);
      }
    } catch (e) {}
  }

  document.addEventListener('click', function (ev) {
    var btn = findBtn(ev.target);
    if (!btn) return;
    if (isPending()) return;
    if (window.__drAgentLoginBusy || window.__drBooting) {
      ev.preventDefault();
      return;
    }
    if (window.__DR_EARLY_LOGIN) return;
    ev.preventDefault();
    runLogin(btn);
  }, true);

  var _filling = false;
  function fillPortal() {
    if (_filling) return;
    _filling = true;
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('dr-pending-blocked', 'is-login', 'dr-boot-holding');
      var ls = document.getElementById('login-screen');
      if (ls) {
        ls.hidden = true;
        ls.classList.add('is-hidden');
        ls.style.cssText = 'display:none!important';
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
      }
      if (typeof window.hideLoginShowApp === 'function') window.hideLoginShowApp();
      var p = window.__drProfile;
      if (p && typeof window.showApp === 'function') {
        var name = p.name || p.full_name || p.username || 'User';
        var role = p.role || 'admin';
        window.showApp(Object.assign({}, p, { name: name, role: role }));
      }
      if (typeof window.showAgentView === 'function') window.showAgentView('dashboard');
      if (typeof window.renderTicketList === 'function') window.renderTicketList();
      var list = document.getElementById('ticket-list');
      if (list) list.classList.add('dr-cards-ready');
      var ov = document.getElementById('dr-boot-overlay');
      if (ov) {
        ov.classList.add('is-done');
        setTimeout(function () {
          try { ov.parentNode && ov.parentNode.removeChild(ov); } catch (e) {}
        }, 400);
      }
    } catch (e) {
    } finally {
      setTimeout(function () { _filling = false; }, 500);
    }
  }

  var _fillTried = 0;
  function scheduleFill() {
    if (_fillTried >= 4) return;
    if (!document.body.classList.contains('is-portal') && !document.body.classList.contains('dr-portal-ok')) return;
    _fillTried++;
    fillPortal();
  }

  function wrapLoad() {
    if (typeof window.loadFullAppThen !== 'function' || window.loadFullAppThen.__drClickFix3) return;
    var prev = window.loadFullAppThen;
    window.loadFullAppThen = function () {
      var ret = prev.apply(this, arguments);
      function after() {
        setTimeout(scheduleFill, 300);
        setTimeout(scheduleFill, 900);
        setTimeout(scheduleFill, 1800);
      }
      if (ret && typeof ret.then === 'function') {
        return ret.then(function (v) { after(); return v; }).catch(function (err) { after(); throw err; });
      }
      after();
      return ret;
    };
    window.loadFullAppThen.__drClickFix3 = 1;
  }
  wrapLoad();
  setTimeout(wrapLoad, 1000);
  setTimeout(wrapLoad, 3000);

  window.DRLoginClickFix = { runLogin: runLogin, fillPortal: fillPortal, v: 3 };
})();
