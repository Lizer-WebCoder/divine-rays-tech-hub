/**
 * Divine Rays — exclusive login vs portal (no merge)
 * Rule: if any portal is .active OR app-shell is shown → hide login.
 * If neither portal active and shell hidden → show login only.
 * Does NOT strip portal.active on a timer.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_EXCLUSIVE_V1) return;
  window.__DR_LOGIN_EXCLUSIVE_V1 = 1;

  var CSS = [
    'body:has(#portal-agent.active) #login-screen,',
    'body:has(#portal-customer.active) #login-screen,',
    'body:has(#app-shell:not([hidden]):not(.is-hidden)) #login-screen{',
    'display:none!important;visibility:hidden!important;height:0!important;',
    'max-height:0!important;overflow:hidden!important;pointer-events:none!important;',
    'position:absolute!important;left:-9999px!important;opacity:0!important}',

    'body:not(:has(#portal-agent.active)):not(:has(#portal-customer.active)) #app-shell[hidden],',
    'body:not(:has(#portal-agent.active)):not(:has(#portal-customer.active)) #app-shell.is-hidden{',
    'display:none!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-login-exclusive-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-exclusive-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function portalOn() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    return (
      (pa && pa.classList.contains('active')) ||
      (pc && pc.classList.contains('active'))
    );
  }

  function shellOn() {
    var shell = document.getElementById('app-shell');
    if (!shell) return false;
    return !shell.hidden && !shell.classList.contains('is-hidden');
  }

  function hideLogin() {
    var login = document.getElementById('login-screen');
    if (!login) return;
    login.hidden = true;
    login.classList.add('is-hidden');
    login.style.setProperty('display', 'none', 'important');
    login.style.setProperty('visibility', 'hidden', 'important');
    login.style.setProperty('pointer-events', 'none', 'important');
  }

  function showLogin() {
    var login = document.getElementById('login-screen');
    if (!login) return;
    login.hidden = false;
    login.classList.remove('is-hidden');
    login.style.removeProperty('display');
    login.style.removeProperty('visibility');
    login.style.removeProperty('pointer-events');
    login.style.removeProperty('height');
    login.style.removeProperty('opacity');
    login.style.removeProperty('position');
    login.style.removeProperty('left');
  }

  function hideShell() {
    var shell = document.getElementById('app-shell');
    if (!shell) return;
    shell.hidden = true;
    shell.classList.add('is-hidden');
  }

  function showShell() {
    var shell = document.getElementById('app-shell');
    if (!shell) return;
    shell.hidden = false;
    shell.classList.remove('is-hidden');
    shell.style.removeProperty('display');
    shell.style.removeProperty('visibility');
  }

  function exclusive() {
    inject();
    if (portalOn()) {
      hideLogin();
      showShell();
      document.body.classList.add('dr-logged-in');
      document.body.classList.remove('dr-logged-out');
      return;
    }
    if (shellOn() && !portalOn()) {
      hideShell();
      showLogin();
      document.body.classList.add('dr-logged-out');
      document.body.classList.remove('dr-logged-in');
      return;
    }
    hideShell();
    showLogin();
    document.body.classList.add('dr-logged-out');
    document.body.classList.remove('dr-logged-in');
  }

  function onLogoutClick() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa) pa.classList.remove('active');
    if (pc) pc.classList.remove('active');
    try {
      sessionStorage.removeItem('dr_app_mode');
    } catch (e) {}
    document.body.classList.remove('dr-tl-on');
    hideShell();
    showLogin();
    document.body.classList.add('dr-logged-out');
    document.body.classList.remove('dr-logged-in');
    setTimeout(exclusive, 100);
    setTimeout(exclusive, 500);
  }

  inject();
  exclusive();
  setTimeout(exclusive, 500);
  setTimeout(exclusive, 1500);
  setTimeout(exclusive, 3500);

  try {
    var obs = new MutationObserver(function () {
      exclusive();
    });
    if (document.body) {
      obs.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'hidden']
      });
    }
  } catch (e) {}

  setInterval(exclusive, 2500);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#btn-logout')) {
        onLogoutClick();
      }
      var txt = (t.textContent || '').toLowerCase();
      if (txt.indexOf('sign in') !== -1 && t.tagName === 'BUTTON') {
        setTimeout(exclusive, 800);
        setTimeout(exclusive, 2000);
      }
    },
    true
  );

  try {
    var client = (window.DR && window.DR.supabase) || window.sb;
    if (client && client.auth && client.auth.onAuthStateChange) {
      client.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_OUT') onLogoutClick();
        if (event === 'SIGNED_IN') {
          setTimeout(exclusive, 500);
          setTimeout(exclusive, 2000);
        }
      });
    }
  } catch (e) {}

  window.DRLoginShellSep = { sync: exclusive, forceLogout: onLogoutClick };
})();
