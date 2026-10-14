/**
 * Divine Rays — login-click-fix v1
 * First-click Sign in always responds; fill empty portal after login.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_CLICK_FIX >= 1) return;
  window.__DR_LOGIN_CLICK_FIX = 1;

  function isPending() {
    try {
      if (window.DRForcePending && window.DRForcePending.isPendingIdentity) {
        return !!window.DRForcePending.isPendingIdentity();
      }
    } catch (e) {}
    return false;
  }

  function findBtn(t) {
    if (!t || !t.closest) return null;
    var form = t.closest('#login-agent');
    if (!form) return null;
    return t.closest('button, input[type="submit"]');
  }

  function runLogin(btn) {
    if (window.__drAgentLoginBusy || window.__drBooting) return;
    if (isPending()) return;
    try {
      if (typeof window.__drDoAgentLogin === 'function') {
        window.__drDoAgentLogin(btn || null);
        return;
      }
    } catch (e) {}
    try {
      var form = document.getElementById('login-agent');
      if (form) {
        var ev = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(ev);
      }
    } catch (e2) {}
  }

  function onPointer(ev) {
    var btn = findBtn(ev.target);
    if (!btn) return;
    if (isPending()) return;
    try {
      if (!btn.__drBusyFlash && !window.__drAgentLoginBusy) {
        btn.__drBusyFlash = 1;
        var prev = btn.textContent;
        btn.textContent = 'Signing in…';
        btn.disabled = true;
        btn.style.opacity = '0.85';
        setTimeout(function () {
          if (!window.__drAgentLoginBusy && !window.__drBooting) {
            try {
              btn.textContent = prev || 'Sign in as Admin';
              btn.disabled = false;
              btn.style.opacity = '';
              btn.__drBusyFlash = 0;
            } catch (e) {}
          }
        }, 8000);
      }
    } catch (e3) {}
    runLogin(btn);
  }

  document.addEventListener('click', function (ev) {
    if (!findBtn(ev.target)) return;
    if (isPending()) return;
    ev.preventDefault();
    ev.stopPropagation();
    onPointer(ev);
  }, true);

  function fillPortal() {
    try {
      document.body.classList.add('dr-portal-ok', 'is-portal');
      document.body.classList.remove('dr-pending-blocked', 'is-login', 'dr-boot-holding');
    } catch (e) {}
    try {
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
        pa.style.removeProperty('display');
        pa.style.removeProperty('visibility');
        pa.style.opacity = '1';
      }
      var side = document.getElementById('sidebar') || document.querySelector('.sidebar, aside.sidebar, #agent-sidebar');
      if (side) {
        side.hidden = false;
        side.style.removeProperty('display');
        side.style.visibility = 'visible';
        side.style.opacity = '1';
      }
      var main = document.getElementById('main-content') || document.querySelector('.main-content, #agent-main, .portal-main');
      if (main) {
        main.hidden = false;
        main.style.removeProperty('display');
      }
      var list = document.getElementById('ticket-list');
      if (list) {
        list.classList.add('dr-cards-ready');
        list.hidden = false;
        list.style.removeProperty('display');
      }
    } catch (e2) {}
    try {
      if (typeof window.showAgentView === 'function') window.showAgentView('dashboard');
    } catch (e3) {}
    try {
      if (typeof window.renderTicketList === 'function') window.renderTicketList();
    } catch (e4) {}
    try {
      if (typeof window.renderDashboard === 'function') window.renderDashboard();
    } catch (e5) {}
    try {
      if (window.DR && typeof window.DR.refreshTickets === 'function') window.DR.refreshTickets();
    } catch (e6) {}
    try {
      var ov = document.getElementById('dr-boot-overlay');
      if (ov) {
        ov.classList.add('is-done');
        setTimeout(function () {
          try { ov.parentNode && ov.parentNode.removeChild(ov); } catch (e) {}
        }, 500);
      }
    } catch (e7) {}
  }

  var _fillN = 0;
  setInterval(function () {
    if (!document.body.classList.contains('is-portal') && !document.body.classList.contains('dr-portal-ok')) return;
    var pa = document.getElementById('portal-agent');
    if (!pa || !pa.classList.contains('active')) return;
    var list = document.getElementById('ticket-list');
    var side = document.getElementById('sidebar') || document.querySelector('.sidebar');
    var empty = (!list || list.children.length === 0) && (!side || side.offsetParent === null || getComputedStyle(side).display === 'none');
    if (empty && _fillN < 12) {
      _fillN++;
      fillPortal();
    }
  }, 500);

  window.DRLoginClickFix = { runLogin: runLogin, fillPortal: fillPortal, v: 1 };
})();
