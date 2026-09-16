/**
 * Divine Rays — presence bootstrap (loads pinned good build)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_SP_BOOT) return;
  window.__DR_SP_BOOT = 1;
  var SHA = 'af065832c121e643c6c7e6149a1f0367fdf94920';
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@' + SHA + '/js/staff-presence.js?v=8.0.3';
  s.async = false;
  s.onerror = function () {
    var s2 = document.createElement('script');
    s2.src = 'https://raw.githubusercontent.com/Lizer-WebCoder/divine-rays-tech-hub/' + SHA + '/js/staff-presence.js?v=8.0.3';
    s2.async = false;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();
