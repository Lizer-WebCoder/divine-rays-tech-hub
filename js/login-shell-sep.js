/**
 * Divine Rays — hard separate login screen from app shell / portals
 * Prevents login + admin portal stacking on the same page.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_SHELL_SEP) return;
  window.__DR_LOGIN_SHELL_SEP = 1;

  var CSS = [
    'body:not(.dr-logged-in) #app-shell,',
    'body:not(.dr-logged-in) #app-shell.is-hidden,',
    'body:not(.dr-logged-in) #app-shell[hidden],',
    '#app-shell.is-hidden,',
    '#app-shell[hidden]{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'max-height:0!important;overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important}',

    'body:not(.dr-logged-in) #portal-agent,',
    'body:not(.dr-logged-in) #portal-customer,',
    'body:not(.dr-logged-in) .mode-bar{',
    'display:none!important;visibility:hidden!important;pointer-events:none!important;',
    'height:0!important;overflow:hidden!important}',

    'body:not(.dr-logged-in) #login-screen,',
    'body:not(.dr-logged-in) .login-screen{',
    'display:flex!important;visibility:visible!important;height:auto!important;',
    'min-height:100vh!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;opacity:1!important}',

    'body.dr-logged-in #login-screen,',
    'body.dr-logged-in .login-screen,',
    '#login-screen.is-hidden,',
    '#login-screen[hidden]{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'max-height:0!important;overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important}',

    'body.dr-logged-in #app-shell{',
    'display:block!important;visibility:visible!important;height:auto!important;',
    'max-height:none!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;opacity:1!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-login-shell-sep');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-shell-sep';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function hasSession() {
    try {
      if (window.DR && typeof window.DR.getProfile === 'function') {
        var p = window.DR.getProfile();
        if (p && (p.id || p.email || p.role)) return true;
      }
    } catch (e) {}
    try {
      if (window.__drProfile && (window.__drProfile.id || window.__drProfile.email)) return true;
    } catch (e) {}
    try {
      if (window.currentProfile && (window.currentProfile.id || window.currentProfile.email)) return true;
    } catch (e) {}
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (k.indexOf('sb-') === 0 && k.indexOf('auth-token') !== -1) {
          var v = localStorage.getItem(k);
          if (v && v.length > 20 && v.indexOf('access_token') !== -1) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function hideShell() {
    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = true;
      shell.classList.add('is-hidden');
      shell.style.setProperty('display', 'none', 'important');
    }
    ['portal-agent', 'portal-customer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.style.setProperty('display', 'none', 'important');
      }
    });
    document.querySelectorAll('.mode-bar').forEach(function (bar) {
      bar.style.setProperty('display', 'none', 'important');
    });
  }

  function showShell() {
    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = false;
      shell.classList.remove('is-hidden');
      shell.style.removeProperty('display');
    }
  }

  function showLogin() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (login) {
      login.hidden = false;
      login.classList.remove('is-hidden');
      login.style.removeProperty('display');
      login.style.removeProperty('visibility');
      login.style.removeProperty('height');
      login.style.removeProperty('opacity');
      login.style.removeProperty('left');
      login.style.removeProperty('position');
    }
  }

  function hideLogin() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (login) {
      login.hidden = true;
      login.classList.add('is-hidden');
      login.style.setProperty('display', 'none', 'important');
    }
  }

  function sync() {
    inject();
    var loggedIn = hasSession();
    if (loggedIn) {
      document.body.classList.add('dr-logged-in');
      hideLogin();
      showShell();
    } else {
      document.body.classList.remove('dr-logged-in');
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa) pa.classList.remove('active');
      if (pc) pc.classList.remove('active');
      hideShell();
      showLogin();
    }
  }

  inject();
  sync();
  setTimeout(sync, 200);
  setTimeout(sync, 800);
  setTimeout(sync, 2000);
  setInterval(sync, 2500);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    var txt = (t.textContent || '').toLowerCase();
    if (/sign in|log out|logout|sign out|create an account/i.test(txt)) {
      setTimeout(sync, 400);
      setTimeout(sync, 1200);
    }
  }, true);

  window.DRLoginShellSep = { sync: sync };
})();
