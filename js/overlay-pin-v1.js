/**
 * Divine Rays - overlay-pin-v8
 * Late-load critical auth/bg fixes if bootloader pins are stale.
 */
(function () {
  'use strict';
  if (window.__DR_OVERLAY_PIN_V1 >= 8) return;
  window.__DR_OVERLAY_PIN_V1 = 8;
  var CDN = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@';
  try {
    if (!document.getElementById('dr-pin-early-ambient-hide')) {
      var st = document.createElement('style');
      st.id = 'dr-pin-early-ambient-hide';
      st.textContent =
        'body:not(.dr-portal-ok):not(.is-portal) #dr-portal-ambient{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}';
      (document.head || document.documentElement).appendChild(st);
    }
  } catch (e0) {}
  var pins = [
    ['e51a6a54c855992cd69d4fed15f30332dde7aa0b', 'js/portal-shell-v10-override.js', '__DR_PORTAL_SHELL_V10_OVERRIDE'],
    ['6c5c2d8c58d3aa71ed8e30e8b5bbc2c7a27b0f45', 'js/portal-bg-clean.js', '__DR_PORTAL_BG_CLEAN'],
    ['f74fd928fedf7ac72685c4ded0e3903331f00822', 'js/portal-bg-stable.js', '__DR_PORTAL_BG_STABLE'],
    ['e51a6a54c855992cd69d4fed15f30332dde7aa0b', 'js/portal-gears-keep.js', '__DR_PORTAL_GEARS_KEEP'],
    ['8bb699a833056590a8f40a790b48e56fcd7a8fc4', 'js/gears-kick.js', '__DR_GEARS_KICK'],
    ['a6b03b13271210063dad2202c184ff73bd6d6180', 'js/post-login-layout-lock.js', '__DR_POST_LOGIN_LAYOUT'],
    ['fcd78a8524e76fc1f343b2a1d39aac3190095683', 'js/login-top-seal.js', '__DR_LOGIN_TOP_SEAL'],
    ['fcd78a8524e76fc1f343b2a1d39aac3190095683', 'js/login-auth-fail-hard.js', '__DR_LOGIN_AUTH_FAIL_HARD'],
    ['7d382fcc8ac7dbdbd7c83490d9b044b17d23a3fc', 'js/login-auth-v11.js', '__DR_LOGIN_AUTH_V12'],
    ['042f9445771a542db7bf8cc38e74b2f0a90dab5c', 'js/login-auth-fields-fix.js', '__DR_LOGIN_AUTH_FIELDS'],
    ['85f1defcdbc2e1e627865313a5c505bb007b9ee0', 'js/emp-login-fix.js', '__DR_EMP_LOGIN_FIX']
  ];
  pins.forEach(function (p) {
    try {
      if (p[2] === '__DR_LOGIN_AUTH_V12' && window.__DR_LOGIN_AUTH_V12 >= 14) return;
      if (p[2] === '__DR_GEARS_KICK' && window.__DR_GEARS_KICK >= 2) return;
      if (p[2] === '__DR_PORTAL_SHELL_V10_OVERRIDE' && window.__DR_PORTAL_SHELL_V10_OVERRIDE >= 3) return;
      if (p[2] === '__DR_PORTAL_BG_STABLE' && window.__DR_PORTAL_BG_STABLE >= 2) return;
      if (p[2] === '__DR_PORTAL_BG_CLEAN' && window.__DR_PORTAL_BG_CLEAN >= 2) return;
      if (p[2] === '__DR_PORTAL_GEARS_KEEP' && window.__DR_PORTAL_GEARS_KEEP >= 2) return;
      if (p[2] && window[p[2]] && p[2].indexOf('PORTAL') === -1 && p[2].indexOf('LOGIN_AUTH') === -1) return;
      var s = document.createElement('script');
      s.src = CDN + p[0] + '/' + p[1] + '?b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  });
})();
