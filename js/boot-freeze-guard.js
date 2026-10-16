/**
 * Divine Rays — boot freeze guard
 * Clear stuck loaders; never leave user on infinite Loading screen
 */
(function () {
  'use strict';
  if (window.__DR_BOOT_FREEZE_GUARD) return;
  window.__DR_BOOT_FREEZE_GUARD = 1;

  try {
    sessionStorage.removeItem('dr_post_login_boot');
  } catch (e) {}

  function clearLoaders() {
    try {
      ['dr-portal-loader', 'dr-phase-boot'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.classList.add('is-done');
          el.style.display = 'none';
          try {
            if (el.parentNode) el.parentNode.removeChild(el);
          } catch (e2) {}
        }
      });
    } catch (e3) {}
  }

  setTimeout(clearLoaders, 2500);
  setTimeout(clearLoaders, 5000);
  setTimeout(function () {
    try {
      window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
    } catch (e) {}
  }, 1500);
})();
