/**
 * Divine Rays — portal-ambient-lock v1
 * After first gears paint, never rebuild #dr-portal-ambient (stops portal background twitch).
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_AMBIENT_LOCK >= 1) return;
  window.__DR_PORTAL_AMBIENT_LOCK = 1;

  function lockIfReady() {
    try {
      var el = document.getElementById('dr-portal-ambient');
      if (el && el.querySelector('.dr-spin-cw') && el.querySelector('animateTransform')) {
        window.__DR_PORTAL_AMBIENT_LOCKED = true;
        if (window.DRPortalShell && window.DRPortalShell.ensureAmbient) {
          var orig = window.DRPortalShell.ensureAmbient;
          if (!orig.__drLocked) {
            window.DRPortalShell.ensureAmbient = function (forceShow) {
              var el2 = document.getElementById('dr-portal-ambient');
              if (el2 && el2.querySelector('.dr-spin-cw') && el2.querySelector('animateTransform')) {
                var on =
                  forceShow ||
                  (document.body &&
                    (document.body.classList.contains('dr-portal-ok') ||
                      document.body.classList.contains('is-portal'))) ||
                  document.documentElement.getAttribute('data-dr-portal-pref') === 'employee' ||
                  document.documentElement.getAttribute('data-dr-portal-pref') === 'admin';
                if (on) {
                  el2.style.display = 'block';
                  el2.style.visibility = 'visible';
                  el2.style.opacity = '1';
                  el2.setAttribute('data-dr-ready', '1');
                  return true;
                }
                el2.style.display = 'none';
                return false;
              }
              return orig(forceShow);
            };
            window.DRPortalShell.ensureAmbient.__drLocked = true;
          }
        }
      }
    } catch (e) {}
  }

  lockIfReady();
  setTimeout(lockIfReady, 100);
  setTimeout(lockIfReady, 400);
  setTimeout(lockIfReady, 1000);
  setTimeout(lockIfReady, 2000);
  setTimeout(lockIfReady, 3500);
})();
