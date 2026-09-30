/**
 * Divine Rays — login/shell separator v5
 * Hard logout always restores login card; never leave empty shell.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_SHELL_SEP_V5) return;
  window.__DR_LOGIN_SHELL_SEP_V5 = 1;

  var forceOutUntil = 0;
  var bootGraceUntil = Date.now() + 6000;

  var CSS = [
    'body.dr-logged-out #app-shell,',
    'body.dr-logged-out #app-shell.is-hidden,',
    'body.dr-logged-out #app-shell[hidden]{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'max-height:0!important;overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important;z-index:-1!important}',

    'body.dr-logged-out #portal-agent,',
    'body.dr-logged-out #portal-customer,',
    'body.dr-logged-out .mode-bar,',
    'body.dr-logged-out #dr-tech-log-root,',
    'body.dr-logged-out #btn-switch-techlog,',
    'body.dr-logged-out #btn-switch-support{',
    'display:none!important;visibility:hidden!important;pointer-events:none!important;',
    'height:0!important;max-height:0!important;overflow:hidden!important;opacity:0!important}',

    'body.dr-logged-out #login-screen,',
    'body.dr-logged-out .login-screen{',
    'display:flex!important;visibility:visible!important;height:auto!important;',
    'min-height:100vh!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;top:auto!important;opacity:1!important;',
    'z-index:5000!important}',

    'body.dr-logged-in #login-screen,',
    'body.dr-logged-in .login-screen{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'max-height:0!important;overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important}',

    'body.dr-logged-in #app-shell{',
    'display:block!important;visibility:visible!important;height:auto!important;',
    'max-height:none!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;opacity:1!important;z-index:1!important}',

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
      shell.style.removeProperty('visibility');
      shell.style.removeProperty('opacity');
      shell.style.removeProperty('height');
      shell.style.removeProperty('left');
      shell.style.removeProperty('position');
    }
  }

  function setLoggedOut(hard) {
    document.body.classList.add('dr-logged-out');
    document.body.classList.remove('dr-logged-in');
    document.body.classList.remove('dr-mode-techlog');
    document.body.classList.remove('dr-mode-support');

    try {
      sessionStorage.removeItem('dr_app_mode');
    } catch (e) {}

    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = true;
      shell.classList.add('is-hidden');
      shell.style.setProperty('display', 'none', 'important');
      shell.style.setProperty('visibility', 'hidden', 'important');
    }

    document.querySelectorAll('.mode-bar, #btn-switch-techlog, #btn-switch-support, #dr-tech-log-root').forEach(function (el) {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
    });

    if (hard) {
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
    }

    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (login) {
      login.hidden = false;
      login.classList.remove('is-hidden');
      login.style.setProperty('display', 'flex', 'important');
      login.style.setProperty('visibility', 'visible', 'important');
      login.style.setProperty('opacity', '1', 'important');
      login.style.setProperty('height', 'auto', 'important');
      login.style.setProperty('min-height', '100vh', 'important');
      login.style.setProperty('position', 'relative', 'important');
      login.style.setProperty('left', 'auto', 'important');
      login.style.setProperty('z-index', '5000', 'important');
      login.style.setProperty('pointer-events', 'auto', 'important');
    }

    var any = document.querySelector('form.login-form.active');
    if (!any) {
      var lc = document.getElementById('login-customer');
      if (lc) {
        document.querySelectorAll('form.login-form').forEach(function (f) {
          f.classList.remove('active');
        });
        lc.classList.add('active');
      }
    }
  }

  function clearProfiles() {
    try {
      window.currentProfile = null;
      window.__drProfile = null;
      window.__drFullLoaded = false;
      if (window.DR) {
        try { window.DR.currentProfile = null; } catch (e) {}
        if (typeof window.DR.setProfile === 'function') {
          try { window.DR.setProfile(null); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  function forceLogoutUI() {
    forceOutUntil = Date.now() + 8000;
    clearProfiles();
    setLoggedOut(true);
    setTimeout(function () { setLoggedOut(true); }, 50);
    setTimeout(function () { setLoggedOut(true); }, 200);
    setTimeout(function () { setLoggedOut(true); }, 600);
    setTimeout(function () { setLoggedOut(true); }, 1500);
    setTimeout(function () { setLoggedOut(true); }, 3000);
  }

  function sync() {
    inject();
    if (isLoggedInState()) {
      setLoggedIn();
    } else if (Date.now() >= forceOutUntil || !portalActive()) {
      setLoggedOut(Date.now() < forceOutUntil);
    }
  }

  inject();
  document.body.classList.add('dr-logged-out');
  document.body.classList.remove('dr-logged-in');

  setTimeout(sync, 800);
  setTimeout(sync, 2500);

  setInterval(function () {
    inject();
    if (Date.now() < forceOutUntil) {
      setLoggedOut(true);
      return;
    }
    if (isLoggedInState()) {
      if (!document.body.classList.contains('dr-logged-in')) setLoggedIn();
    } else if (!portalActive() && !liveProfile()) {
      if (!document.body.classList.contains('dr-logged-out')) setLoggedOut(false);
    }
  }, 2000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('#btn-logout, [data-action="logout"], button.logout');
      var txt = ((t.textContent || '') + ' ' + (t.id || '') + ' ' + (t.className || '')).toLowerCase();
      if (btn || /\blog\s*out\b|\bsign\s*out\b/.test(txt)) {
        forceLogoutUI();
      }
      if (/\bsign\s*in\b/.test(txt) && t.tagName === 'BUTTON') {
        forceOutUntil = 0;
        bootGraceUntil = Date.now() + 10000;
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
      if (window.__DR_SHELL_AUTH_WIRED_V5) return;
      window.__DR_SHELL_AUTH_WIRED_V5 = 1;
      client.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_OUT' || !session) {
          forceLogoutUI();
        } else if (event === 'SIGNED_IN') {
          forceOutUntil = 0;
          bootGraceUntil = Date.now() + 10000;
          setTimeout(sync, 500);
          setTimeout(sync, 2000);
        }
      });
    } catch (e) {}
  }
  setTimeout(wireAuth, 600);
  setTimeout(wireAuth, 2500);

  window.DRLoginShellSep = { sync: sync, forceLogout: forceLogoutUI };
})();
