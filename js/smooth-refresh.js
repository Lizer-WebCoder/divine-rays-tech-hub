/**
 * Divine Rays — smooth refresh (no logout flash, no messages)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SMOOTH_REFRESH) return;
  window.__DR_SMOOTH_REFRESH = 1;

  var ROLE_KEY = 'dr_last_role';
  var STYLE_ID = 'dr-smooth-refresh';

  function hasSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (k.indexOf('sb-') === 0 && k.indexOf('auth-token') !== -1) {
          var r = localStorage.getItem(k);
          if (r && r.length > 40) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function role() {
    try { return localStorage.getItem(ROLE_KEY) || ''; } catch (e) { return ''; }
  }

  function saveRole(r) {
    if (!r) return;
    try { localStorage.setItem(ROLE_KEY, r); } catch (e) {}
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      'html.dr-smooth #login-screen{opacity:0!important;pointer-events:none!important}',
      'html.dr-smooth #app-shell{opacity:1!important}',
      '#login-screen,#app-shell,#portal-customer,#portal-agent{transition:opacity .2s ease}'
    ].join('');
    document.head.appendChild(s);
  }

  function hideLoginQuiet() {
    var login = document.getElementById('login-screen');
    var shell = document.getElementById('app-shell');
    if (!hasSession()) return;
    document.documentElement.classList.add('dr-smooth');
    if (login) { login.hidden = true; login.classList.add('is-hidden'); }
    if (shell) { shell.hidden = false; shell.classList.remove('is-hidden'); }
    var r = role();
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (r === 'customer' && pc) {
      if (pa) pa.classList.remove('active');
      pc.classList.add('active');
    } else if ((r === 'agent' || r === 'admin') && pa) {
      if (pc) pc.classList.remove('active');
      pa.classList.add('active');
    }
  }

  function clearSmooth() {
    document.documentElement.classList.remove('dr-smooth');
  }

  function trackRole() {
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if (pc && pc.classList.contains('active')) saveRole('customer');
    else if (pa && pa.classList.contains('active')) {
      var lb = document.getElementById('logged-user-label');
      var t = (lb && lb.textContent) || '';
      saveRole(/admin/i.test(t) ? 'admin' : 'agent');
    }
  }

  function tick() {
    injectStyle();
    if (hasSession()) {
      hideLoginQuiet();
      trackRole();
    } else {
      clearSmooth();
    }
    var pc = document.getElementById('portal-customer');
    var pa = document.getElementById('portal-agent');
    if ((pc && pc.classList.contains('active')) || (pa && pa.classList.contains('active'))) {
      trackRole();
      clearSmooth();
    }
  }

  injectStyle();
  if (hasSession()) document.documentElement.classList.add('dr-smooth');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  } else {
    tick();
  }
  setTimeout(tick, 100);
  setTimeout(tick, 400);
  setTimeout(tick, 1000);
  setTimeout(tick, 2000);
  setTimeout(clearSmooth, 3500);

  document.addEventListener('click', function () { setTimeout(trackRole, 50); }, true);

  window.DRSmoothRefresh = { tick: tick, saveRole: saveRole };
})();
