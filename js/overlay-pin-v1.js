/**
 * Divine Rays - overlay-pin-v7
 * Late-load critical auth/bg fixes if bootloader pins are stale.
 */
(function () {
  'use strict';
  if (window.__DR_OVERLAY_PIN_V1 >= 7) return;
  window.__DR_OVERLAY_PIN_V1 = 7;
  var CDN = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@';
  /* Inject ultra-early hide CSS before anything else paints gears */
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
    ['LATEST_OVERRIDE', 'js/portal-shell-v10-override.js', '__DR_PORTAL_SHELL_V10_OVERRIDE'],
    ['27555b8dba5baa16509d49bd6cef0cbe7d116ca3', 'js/portal-bg-clean.js', '__DR_PORTAL_BG_CLEAN'],
    ['9d81f394dc777943bc12a97c737c1ed11bd633f0', 'js/portal-bg-stable.js', '__DR_PORTAL_BG_STABLE'],
    ['8bb699a833056590a8f40a790b48e56fcd7a8fc4', 'js/gears-kick.js', '__DR_GEARS_KICK'],
    ['a6b03b13271210063dad2202c184ff73bd6d6180', 'js/post-login-layout-lock.js', '__DR_POST_LOGIN_LAYOUT'],
    ['fcd78a8524e76fc1f343b2a1d39aac3190095683', 'js/login-top-seal.js', '__DR_LOGIN_TOP_SEAL'],
    ['fcd78a8524e76fc1f343b2a1d39aac3190095683', 'js/login-auth-fail-hard.js', '__DR_LOGIN_AUTH_FAIL_HARD'],
    ['7d382fcc8ac7dbdbd7c83490d9b044b17d23a3fc', 'js/login-auth-v11.js', '__DR_LOGIN_AUTH_V12'],
    ['042f9445771a542db7bf8cc38e74b2f0a90dab5c', 'js/login-auth-fields-fix.js', '__DR_LOGIN_AUTH_FIELDS'],
    ['85f1defcdbc2e1e627865313a5c505bb007b9ee0', 'js/emp-login-fix.js', '__DR_EMP_LOGIN_FIX']
  ];
  /* first pin uses commit of this push — replaced after we know SHA */
  pins.forEach(function (p) {
    try {
      if (p[2] === '__DR_LOGIN_AUTH_V12' && window.__DR_LOGIN_AUTH_V12 >= 14) return;
      if (p[2] === '__DR_GEARS_KICK' && window.__DR_GEARS_KICK >= 2) return;
      if (p[2] === '__DR_PORTAL_SHELL_V10_OVERRIDE' && window.__DR_PORTAL_SHELL_V10_OVERRIDE >= 2) return;
      if (p[2] && p[2] !== '__DR_LOGIN_AUTH_V12' && p[2] !== '__DR_GEARS_KICK' && p[2] !== '__DR_PORTAL_SHELL_V10_OVERRIDE' && window[p[2]]) return;
      var sha = p[0] === 'LATEST_OVERRIDE' ? 'main' : p[0];
      var s = document.createElement('script');
      s.src = CDN + sha + '/' + p[1] + '?b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  });
})();
