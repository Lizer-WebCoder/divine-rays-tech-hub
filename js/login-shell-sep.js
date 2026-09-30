/**
 * Divine Rays — login/shell separator (stable, non-destructive)
 * Does NOT strip portal.active on a timer. Only forces UI on real logout.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_SHELL_SEP_V4) return;
  window.__DR_LOGIN_SHELL_SEP_V4 = 1;

  var forceOutUntil = 0;
  var bootGraceUntil = Date.now() + 5000;

  var CSS = [
    'body.dr-logged-out #app-shell,',
    'body.dr-logged-out #app-shell.is-hidden,',
    'body.dr-logged-out #app-shell[hidden]{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'max-height:0!important;overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important}',

    'body.dr-logged-out #portal-agent,',
    'body.dr-logged-out #portal-customer,',
    'body.dr-logged-out .mode-bar{',
    'display:none!important;visibility:hidden!important;pointer-events:none!important;',
    'height:0!important;max-height:0!important;overflow:hidden!important;opacity:0!important}',

    'body.dr-logged-out #login-screen,',
    'body.dr-logged-out .login-screen{',
    'display:flex!important;visibility:visible!important;height:auto!important;',
    'min-height:100vh!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;opacity:1!important;z-index:500!important}',

    'body.dr-logged-in #login-screen,',
    'body.dr-logged-in .login-screen{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'max-height:0!important;overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important}',

    'body.dr-logged-in #app-shell{',
    'display:block!important;visibility:visible!important;height:auto!important;',
    'max-height:none!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;opacity:1!important}',

    'body.dr-logged-in .mode-bar{',
    'display:flex!important;visibility:visible!important;opacity:1!important;',
    'height:auto!important;max-height:none!important}'
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

  function portalActive() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa && pa.classList.contains('active')) return 'agent';
    if (pc && pc.classList.contains('active')) return 'customer';
    return null;
  }

  function liveProfile() {
    try {
      if (window.DR && typeof window.DR.getProfile === 'function') {
        var p = window.DR.getProfile();
        if (p && (p.id || p.email || p.role)) return p;
      }
    } catch (e) {}
    try {
      if (window.__drProfile && (window.__drProfile.id || window.__drProfile.email)) return window.__drProfile;
    } catch (e) {}
    try {
      if (window.currentProfile && (window.currentProfile.id || window.currentProfile.email)) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function shellVisible() {
    var shell = document.getElementById('app-shell');
    if (!shell) return false;
    if (shell.hidden || shell.classList.contains('is-hidden')) return false;
    return true;
  }

  function isLoggedInState() {
    if (Date.now() < forceOutUntil) return false;
    if (portalActive()) return true;
    if (liveProfile()) return true;
    if (Date.now() < bootGraceUntil && shellVisible() && !document.body.classList.contains('dr-logged-out')) {
      return true;
    }
    return false;
  }

  function setLoggedIn() {
    document.body.classList.add('dr-logged-in');
    document.body.classList.remove('dr-logged-out');
    var login = document.getElementById('login-screen');
    if (login) {
      login.hidden = true;
      login.classList.add('is-hidden');
    }
    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = false;
      shell.classList.remove('is-hidden');
      shell.style.removeProperty('display');
    }
  }

  function setLoggedOut() {
    document.body.classList.add('dr-logged-out');
    document.body.classList.remove('dr-logged-in');

    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = true;
      shell.classList.add('is-hidden');
    }

    if (Date.now() < forceOutUntil) {
      var pa = document.getElementById('portal-agent');
      var pc = document.getElementById('portal-customer');
      if (pa) pa.classList.remove('active');
      if (pc) pc.classList.remove('active');
    }

    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (login) {
      login.hidden = false;
      login.classList.remove('is-hidden');
      login.style.removeProperty('display');
      login.style.removeProperty('visibility');
      login.style.removeProperty('opacity');
      login.style.removeProperty('height');
      login.style.removeProperty('left');
      login.style.removeProperty('position');
    }

    var any = document.querySelector('form.login-form.active');
    if (!any) {
      var lc = document.getElementById('login-customer');
      if (lc) lc.classList.add('active');
    }
  }

  function forceLogoutUI() {
    forceOutUntil = Date.now() + 5000;
    try {
      window.currentProfile = null;
      window.__drProfile = null;
      if (window.DR) {
        try { window.DR.currentProfile = null; } catch (e) {}
        if (typeof window.DR.setProfile === 'function') {
          try { window.DR.setProfile(null); } catch (e) {}
        }
      }
    } catch (e) {}
    setLoggedOut();
    setTimeout(setLoggedOut, 100);
    setTimeout(setLoggedOut, 400);
  }

  function sync() {
    inject();
    if (isLoggedInState()) {
      setLoggedIn();
    } else {
      setLoggedOut();
    }
  }

  inject();
  document.body.classList.add('dr-logged-out');
  document.body.classList.remove('dr-logged-in');

  setTimeout(sync, 600);
  setTimeout(sync, 2000);
  setTimeout(function () {
    bootGraceUntil = Date.now() + 2000;
    sync();
  }, 4500);

  setInterval(function () {
    inject();
    var logged = isLoggedInState();
    if (logged) {
      if (!document.body.classList.contains('dr-logged-in')) setLoggedIn();
    } else if (Date.now() >= forceOutUntil) {
      if (!portalActive() && !liveProfile()) {
        if (!document.body.classList.contains('dr-logged-out')) setLoggedOut();
      }
    }
  }, 3000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('#btn-logout, [data-action="logout"]');
      var txt = ((t.textContent || '') + ' ' + (t.id || '')).toLowerCase();
      if (btn || txt.indexOf('logout') !== -1 || txt.indexOf('sign out') !== -1) {
        forceLogoutUI();
      }
      if (txt.indexOf('sign in') !== -1) {
        forceOutUntil = 0;
        bootGraceUntil = Date.now() + 8000;
        setTimeout(sync, 800);
        setTimeout(sync, 2000);
      }
    },
    true
  );

  function wireAuth() {
    try {
      var client =
        (window.DR && window.DR.supabase) ||
        window.__drSb ||
        window.sb;
      if (!client || !client.auth || !client.auth.onAuthStateChange) return;
      if (window.__DR_SHELL_AUTH_WIRED_V4) return;
      window.__DR_SHELL_AUTH_WIRED_V4 = 1;
      client.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_OUT' || !session) {
          forceLogoutUI();
        } else if (event === 'SIGNED_IN') {
          forceOutUntil = 0;
          bootGraceUntil = Date.now() + 8000;
          setTimeout(sync, 400);
          setTimeout(sync, 1500);
        }
      });
    } catch (e) {}
  }
  setTimeout(wireAuth, 800);
  setTimeout(wireAuth, 2500);

  window.DRLoginShellSep = { sync: sync, forceLogout: forceLogoutUI };
})();
