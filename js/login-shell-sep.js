/**
 * Divine Rays — exclusive login vs portal v3
 * Treats Tech Log mode (body.dr-tl-on) as logged-in.
 * NO MutationObserver.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_EXCLUSIVE_V3) return;
  window.__DR_LOGIN_EXCLUSIVE_V3 = 1;

  var busy = false;
  var lastMode = '';

  var CSS = [
    'body.dr-in #login-screen{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important}',
    'body.dr-out #app-shell{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'overflow:hidden!important;pointer-events:none!important}',
    'body.dr-out #login-screen{',
    'display:flex!important;visibility:visible!important;opacity:1!important;',
    'pointer-events:auto!important;position:relative!important;left:auto!important;',
    'height:auto!important;min-height:100vh!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-login-exclusive-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-exclusive-css';
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== CSS) el.textContent = CSS;
  }

  function portalOn() {
    try {
      if (document.body.classList.contains('dr-tl-on')) return true;
      try {
        if (sessionStorage.getItem('dr_app_mode') === 'techlog') return true;
      } catch (e) {}
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      return (
        (pa && pa.classList.contains('active')) ||
        (pc && pc.classList.contains('active'))
      );
    } catch (e) {
      return false;
    }
  }

  function exclusive() {
    if (busy) return;
    busy = true;
    try {
      inject();
      var on = portalOn();
      var mode = on ? 'in' : 'out';
      if (mode === lastMode) {
        busy = false;
        return;
      }
      lastMode = mode;
      if (on) {
        document.body.classList.add('dr-in');
        document.body.classList.remove('dr-out');
        var login = document.getElementById('login-screen');
        if (login) {
          login.hidden = true;
          login.classList.add('is-hidden');
        }
        var shell = document.getElementById('app-shell');
        if (shell) {
          shell.hidden = false;
          shell.classList.remove('is-hidden');
        }
      } else {
        document.body.classList.add('dr-out');
        document.body.classList.remove('dr-in');
        var shell2 = document.getElementById('app-shell');
        if (shell2) {
          shell2.hidden = true;
          shell2.classList.add('is-hidden');
        }
        var login2 = document.getElementById('login-screen');
        if (login2) {
          login2.hidden = false;
          login2.classList.remove('is-hidden');
        }
      }
    } catch (e) {}
    busy = false;
  }

  function forceOut() {
    try {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa) pa.classList.remove('active');
      if (pc) pc.classList.remove('active');
      document.body.classList.remove('dr-tl-on');
      try {
        sessionStorage.removeItem('dr_app_mode');
      } catch (e) {}
      lastMode = '';
      exclusive();
    } catch (e) {}
  }

  inject();
  document.body.classList.add('dr-out');
  setTimeout(exclusive, 400);
  setTimeout(exclusive, 1200);
  setTimeout(exclusive, 3000);
  setTimeout(exclusive, 6000);
  setInterval(exclusive, 4000);

  document.addEventListener(
    'click',
    function (e) {
      try {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('#btn-logout')) {
          setTimeout(forceOut, 0);
          setTimeout(forceOut, 400);
        }
        var txt = ((t.textContent || '') + '').toLowerCase();
        if (txt.indexOf('sign in') !== -1 && t.tagName === 'BUTTON') {
          lastMode = '';
          setTimeout(exclusive, 1000);
          setTimeout(exclusive, 2500);
        }
      } catch (err) {}
    },
    true
  );

  setTimeout(function () {
    try {
      var client = (window.DR && window.DR.supabase) || window.sb;
      if (client && client.auth && client.auth.onAuthStateChange) {
        client.auth.onAuthStateChange(function (event) {
          if (event === 'SIGNED_OUT') forceOut();
          if (event === 'SIGNED_IN') {
            lastMode = '';
            setTimeout(exclusive, 800);
            setTimeout(exclusive, 2500);
          }
        });
      }
    } catch (e) {}
  }, 1500);

  window.DRLoginShellSep = { sync: exclusive, forceLogout: forceOut };
})();
