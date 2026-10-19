/**
 * Divine Rays — portal-gears-keep v1
 * After hard refresh in portal, keep SMIL gears painted.
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_GEARS_KEEP >= 1) return;
  window.__DR_PORTAL_GEARS_KEEP = 1;

  function isPortal() {
    try {
      var tab = sessionStorage.getItem('dr_login_tab') || '';
      var pref = sessionStorage.getItem('dr_dev_portal_pref') || '';
      if (tab === 'customer' || tab === 'agent') return true;
      if (pref === 'employee' || pref === 'admin') return true;
      var dp = document.documentElement.getAttribute('data-dr-portal-pref') || '';
      if (dp === 'employee' || dp === 'admin') return true;
      if (
        document.body &&
        (document.body.classList.contains('dr-portal-ok') || document.body.classList.contains('is-portal'))
      )
        return true;
    } catch (e) {}
    return false;
  }

  function hasGears() {
    try {
      var box = document.getElementById('dr-lifeline');
      return !!(box && box.querySelector('.dr-spin-cw') && box.querySelector('animateTransform'));
    } catch (e) {
      return false;
    }
  }

  function paint() {
    if (!isPortal()) return;
    try {
      document.body.classList.remove('is-login');
      document.body.classList.add('dr-portal-ok', 'is-portal');
    } catch (e) {}
    try {
      if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.ensureGears) {
        window.DRHeartbeatDraw.ensureGears(true);
      }
      if (window.DRGearsStable && window.DRGearsStable.kick) window.DRGearsStable.kick();
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
  setTimeout(tick, 4000);
  setInterval(tick, 5000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) setTimeout(tick, 50);
  });
  window.DRPortalGearsKeep = { v: 1, paint: paint };
})();
