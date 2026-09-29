/**
 * Divine Rays — login ↔ shell separator + force login on logout
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_SHELL_SEP_V3) return;
  window.__DR_LOGIN_SHELL_SEP_V3 = 1;

  var forceOutUntil = 0;

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
    'height:0!important;max-height:0!important;overflow:hidden!important;',
    'opacity:0!important}',

    'body.dr-logged-out #login-screen,',
    'body.dr-logged-out .login-screen{',
    'display:flex!important;visibility:visible!important;height:auto!important;',
    'min-height:100vh!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;opacity:1!important;',
    'z-index:500!important}',

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

  function clearProfiles() {
    try {
      window.currentProfile = null;
      window.__drProfile = null;
      window.__drFullLoaded = false;
      window.__drBooting = false;
      if (window.DR) {
        try { window.DR.currentProfile = null; } catch (e) {}
        if (typeof window.DR.setProfile === 'function') {
          try { window.DR.setProfile(null); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  function liveProfile() {
    if (Date.now() < forceOutUntil) return null;
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

  function portalActive() {
    if (Date.now() < forceOutUntil) return null;
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa && pa.classList.contains('active')) return 'agent';
    if (pc && pc.classList.contains('active')) return 'customer';
    return null;
  }

  function isLoggedInState() {
    if (Date.now() < forceOutUntil) return false;
    if (portalActive()) return true;
    if (liveProfile()) return true;
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
    document.querySelectorAll('.mode-bar').forEach(function (bar) {
      bar.style.removeProperty('display');
      bar.style.removeProperty('visibility');
      bar.style.removeProperty('opacity');
      bar.style.removeProperty('height');
    });
  }

  function setLoggedOut() {
    document.body.classList.add('dr-logged-out');
    document.body.classList.remove('dr-logged-in');

    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = true;
      shell.classList.add('is-hidden');
      shell.style.setProperty('display', 'none', 'important');
    }

    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa) {
      pa.classList.remove('active');
      pa.style.setProperty('display', 'none', 'important');
    }
    if (pc) {
      pc.classList.remove('active');
      pc.style.setProperty('display', 'none', 'important');
    }

    document.querySelectorAll('.mode-bar').forEach(function (bar) {
      bar.style.setProperty('display', 'none', 'important');
      bar.style.setProperty('visibility', 'hidden', 'important');
    });

    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (login) {
      login.hidden = false;
      login.classList.remove('is-hidden');
      login.style.cssText = '';
      login.style.setProperty('display', 'flex', 'important');
      login.style.setProperty('visibility', 'visible', 'important');
      login.style.setProperty('opacity', '1', 'important');
      login.style.setProperty('z-index', '500', 'important');
    }

    var any = document.querySelector('form.login-form.active');
    if (!any) {
      var lc = document.getElementById('login-customer');
      if (lc) {
        document.querySelectorAll('form.login-form').forEach(function (f) {
          f.classList.remove('active');
        });
        lc.classList.add('active');
        lc.style.setProperty('display', 'block', 'important');
      }
    }
  }

  function forceLogoutUI() {
    forceOutUntil = Date.now() + 4000;
    clearProfiles();
    setLoggedOut();
    setTimeout(setLoggedOut, 50);
    setTimeout(setLoggedOut, 200);
    setTimeout(setLoggedOut, 600);
    setTimeout(setLoggedOut, 1500);
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
  sync();
  setTimeout(sync, 300);
  setTimeout(sync, 1000);
  setTimeout(sync, 2500);
  setInterval(sync, 2000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('#btn-logout, [data-action="logout"], button.logout, a.logout');
      var txt = ((t.textContent || '') + ' ' + (t.id || '') + ' ' + (btn ? btn.id || '' : '')).toLowerCase();
      var isLogout =
        !!btn ||
        txt.indexOf('logout') !== -1 ||
        txt.indexOf('log out') !== -1 ||
        txt.indexOf('sign out') !== -1;
      if (isLogout) {
        forceLogoutUI();
      }
      if (/sign in|create an account/.test(txt)) {
        setTimeout(sync, 500);
        setTimeout(sync, 1500);
      }
    },
    true
  );

  function wireAuth() {
    try {
      var client =
        (window.DR && window.DR.sb && window.DR.sb()) ||
        (window.DR && window.DR.supabase) ||
        window.__drSb ||
        window.sb;
      if (!client || !client.auth || !client.auth.onAuthStateChange) return;
      if (window.__DR_SHELL_AUTH_WIRED) return;
      window.__DR_SHELL_AUTH_WIRED = 1;
      client.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_OUT' || !session) {
          forceLogoutUI();
        } else if (event === 'SIGNED_IN') {
          forceOutUntil = 0;
          setTimeout(sync, 300);
          setTimeout(sync, 1200);
        }
      });
    } catch (e) {}
  }
  setTimeout(wireAuth, 500);
  setTimeout(wireAuth, 2000);

  window.DRLoginShellSep = { sync: sync, forceLogout: forceLogoutUI };
})();
