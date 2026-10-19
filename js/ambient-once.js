/**
 * Divine Rays — ambient-once v1
 * Stop galaxy/force-light from re-painting login ambient (kills double honeycomb).
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_ONCE >= 1) return;
  window.__DR_AMBIENT_ONCE = 1;

  function lock() {
    try {
      var layer = document.getElementById('dr-login-ambient');
      if (layer && layer.querySelector('.dr-honeycomb')) {
        window.__DR_AMBIENT_LOCKED = true;
        var hcs = layer.querySelectorAll('.dr-honeycomb');
        for (var i = 1; i < hcs.length; i++) {
          try {
            hcs[i].parentNode.removeChild(hcs[i]);
          } catch (e) {}
        }
      }
      if (window.DRAmbientGalaxy) {
        window.DRAmbientGalaxy.refresh = function () {};
      }
    } catch (e) {}
  }

  lock();
  setTimeout(lock, 200);
  setTimeout(lock, 600);
  setTimeout(lock, 1200);
  setTimeout(lock, 2500);
})();
