/**
 * Divine Rays - overlay-pin-v2
 * Late-load critical auth/bg fixes if bootloader pins are stale.
 */
(function () {
  'use strict';
  if (window.__DR_OVERLAY_PIN_V1 >= 2) return;
  window.__DR_OVERLAY_PIN_V1 = 2;
  var CDN = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@';
  var pins = [
    ['27555b8dba5baa16509d49bd6cef0cbe7d116ca3', 'js/portal-bg-clean.js', '__DR_PORTAL_BG_CLEAN'],
    ['7d382fcc8ac7dbdbd7c83490d9b044b17d23a3fc', 'js/login-auth-v11.js', '__DR_LOGIN_AUTH_V12'],
    ['042f9445771a542db7bf8cc38e74b2f0a90dab5c', 'js/login-auth-fields-fix.js', '__DR_LOGIN_AUTH_FIELDS'],
    ['85f1defcdbc2e1e627865313a5c505bb007b9ee0', 'js/emp-login-fix.js', '__DR_EMP_LOGIN_FIX']
  ];
  pins.forEach(function (p) {
    try {
      if (p[2] === '__DR_LOGIN_AUTH_V12' && window.__DR_LOGIN_AUTH_V12 >= 14) return;
      if (p[2] && p[2] !== '__DR_LOGIN_AUTH_V12' && window[p[2]]) return;
      var s = document.createElement('script');
      s.src = CDN + p[0] + '/' + p[1] + '?b=' + Date.now();
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  });
})();
