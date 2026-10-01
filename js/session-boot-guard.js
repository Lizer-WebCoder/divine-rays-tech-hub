/**
 * Hide login flash on refresh when session already exists (v2)
 * Do NOT unhide app-shell — app.js trySession only boots when shell is still hidden.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SESSION_BOOT_GUARD_V2) return;
  window.__DR_SESSION_BOOT_GUARD_V2 = 1;

  function hasStoredSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (k.indexOf('sb-') === 0 && k.indexOf('auth-token') !== -1) {
          var v = localStorage.getItem(k);
          if (v && v.length > 20) return true;
        }
        if (k.indexOf('supabase.auth.token') !== -1) {
          var v2 = localStorage.getItem(k);
          if (v2 && v2.length > 20) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function hideLoginOnly() {
    var login = document.getElementById('login-screen');
    if (login) {
      login.hidden = true;
      login.classList.add('is-hidden');
      login.style.setProperty('display', 'none', 'important');
      login.style.setProperty('visibility', 'hidden', 'important');
    }
    /* Do NOT touch #app-shell.hidden — trySession requires it hidden to boot */
    var overlay = document.getElementById('dr-session-boot-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'dr-session-boot-overlay';
      overlay.textContent = 'Restoring session…';
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
        'background:#0c0c14;color:#9494ae;font-family:Inter,system-ui,sans-serif;font-size:0.95rem;';
      document.body.appendChild(overlay);
    }
  }

  function clearOverlay() {
    var overlay = document.getElementById('dr-session-boot-overlay');
    if (overlay) {
      try { overlay.parentNode.removeChild(overlay); } catch (e) {}
    }
  }

  function portalActive() {
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    return (pa && pa.classList.contains('active')) || (pc && pc.classList.contains('active'));
  }

  function tick() {
    if (portalActive() || document.getElementById('btn-logout')) {
      clearOverlay();
      return;
    }
    if (hasStoredSession()) hideLoginOnly();
  }

  if (hasStoredSession()) {
    hideLoginOnly();
  }

  var n = 0;
  var timer = setInterval(function () {
    tick();
    n++;
    if (portalActive()) {
      clearInterval(timer);
      clearOverlay();
      return;
    }
    if (n > 80) {
      clearInterval(timer);
      clearOverlay();
      if (!hasStoredSession()) {
        var login = document.getElementById('login-screen');
        if (login) {
          login.hidden = false;
          login.classList.remove('is-hidden');
          login.style.removeProperty('display');
          login.style.removeProperty('visibility');
        }
      }
    }
  }, 250);

  window.DRSessionBootGuard = { clear: clearOverlay, hideLogin: hideLoginOnly };
})();
