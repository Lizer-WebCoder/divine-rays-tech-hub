/**
 * Divine Rays — separate login vs app shell without blanking either
 * Only hides login when a portal is actually active (or profile is live).
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_SHELL_SEP_V2) return;
  window.__DR_LOGIN_SHELL_SEP_V2 = 1;

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
    'height:0!important;overflow:hidden!important}',

    'body.dr-logged-out #login-screen,',
    'body.dr-logged-out .login-screen{',
    'display:flex!important;visibility:visible!important;height:auto!important;',
    'min-height:100vh!important;overflow:visible!important;pointer-events:auto!important;',
    'position:relative!important;left:auto!important;opacity:1!important}',

    'body.dr-logged-in #login-screen,',
    'body.dr-logged-in .login-screen{',
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

  function portalActive() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa && pa.classList.contains('active')) return 'agent';
    if (pc && pc.classList.contains('active')) return 'customer';
    return null;
  }

  function isLoggedInState() {
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
  }

  function setLoggedOut() {
    document.body.classList.add('dr-logged-out');
    document.body.classList.remove('dr-logged-in');
    var shell = document.getElementById('app-shell');
    if (shell) {
      shell.hidden = true;
      shell.classList.add('is-hidden');
    }
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa) pa.classList.remove('active');
    if (pc) pc.classList.remove('active');
    var login = document.getElementById('login-screen');
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
    var any = document.querySelector('form.login-form.active');
    if (!any) {
      var lc = document.getElementById('login-customer');
      if (lc) lc.classList.add('active');
    }
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
      if (!t) return;
      var txt = ((t.textContent || '') + ' ' + (t.id || '')).toLowerCase();
      if (/sign in|log out|logout|sign out|create an account|btn-logout/.test(txt)) {
        setTimeout(sync, 500);
        setTimeout(sync, 1500);
      }
    },
    true
  );

  window.DRLoginShellSep = { sync: sync };
})();
