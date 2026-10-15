/**
 * Divine Rays — ecg-single v1
 * Remove duplicate #dr-lifeline after boot; keep one ECG.
 */
(function () {
  'use strict';
  if (window.__DR_ECG_SINGLE >= 1) return;
  window.__DR_ECG_SINGLE = 1;

  function dedupe() {
    try {
      var list = document.querySelectorAll('#dr-lifeline, .dr-lifeline, svg.dr-lifeline');
      if (list.length <= 1) {
        /* still collapse extra cores in the one node */
      } else {
        for (var i = 1; i < list.length; i++) {
          try {
            list[i].parentNode && list[i].parentNode.removeChild(list[i]);
          } catch (e) {}
        }
      }
      var keep = document.getElementById('dr-lifeline') || list[0];
      if (keep) {
        var cores = keep.querySelectorAll('.dr-ecg-core');
        for (var j = 1; j < cores.length; j++) {
          try {
            cores[j].parentNode.removeChild(cores[j]);
          } catch (e2) {}
        }
        var glows = keep.querySelectorAll('.dr-ecg-glow');
        for (var k = 1; k < glows.length; k++) {
          try {
            glows[k].parentNode.removeChild(glows[k]);
          } catch (e3) {}
        }
      }
    } catch (e) {}
  }

  dedupe();
  setTimeout(dedupe, 200);
  setTimeout(dedupe, 800);
  setTimeout(dedupe, 2000);
  setTimeout(dedupe, 4000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') dedupe();
  });
})();
