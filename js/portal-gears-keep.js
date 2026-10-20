/**
 * Divine Rays — portal-gears-keep v2
 * Keep SMIL gears only when a real portal panel is active.
 * Never treat leftover sessionStorage / pref as portal (that caused empty gear flash on login).
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_GEARS_KEEP >= 2) return;
  window.__DR_PORTAL_GEARS_KEEP = 2;

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity || '1') < 0.05))
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function isPortal() {
    try {
      if (loginVisible()) return false;
      if (document.body && document.body.classList.contains('is-login') && !document.body.classList.contains('dr-portal-ok'))
        return false;
      var pc = document.getElementById('portal-customer');
      var pa = document.getElementById('portal-agent');
      if (pc && pc.classList.contains('active')) return true;
      if (pa && pa.classList.contains('active')) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  function hasGears() {
    try {
      var box = document.getElementById('dr-portal-ambient') || document.getElementById('dr-lifeline');
      return !!(box && box.querySelector('.dr-spin-cw') && box.querySelector('animateTransform'));
    } catch (e) {
      return false;
    }
  }

  function paint() {
    if (!isPortal()) return;
    try {
      if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
        window.DRPortalShell.ensureAmbient(true);
      }
      if (window.DRGearsKick && window.DRGearsKick.kick) window.DRGearsKick.kick();
    } catch (e2) {}
  }

  function tick() {
    if (!isPortal()) return;
    if (!hasGears()) paint();
  }

  setTimeout(tick, 100);
  setTimeout(tick, 500);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(tick, 6000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) setTimeout(tick, 50);
  });
  window.DRPortalGearsKeep = { v: 2, paint: paint };
})();
