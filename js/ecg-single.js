/**
 * Divine Rays — ecg-single v2
 * Remove duplicate #dr-lifeline after boot; keep one ECG.
 */
(function () {
  'use strict';
  if (window.__DR_ECG_SINGLE >= 2) return;
  window.__DR_ECG_SINGLE = 2;

  function dedupe() {
    try {
      var list = document.querySelectorAll('#dr-lifeline');
      if (list.length > 1) {
        for (var i = 1; i < list.length; i++) {
          try {
            list[i].parentNode && list[i].parentNode.removeChild(list[i]);
          } catch (e) {}
        }
      }
      var extras = document.querySelectorAll('.dr-lifeline, svg.dr-lifeline');
      for (var x = 0; x < extras.length; x++) {
        var el = extras[x];
        if (el.id === 'dr-lifeline') continue;
        if (el.closest && el.closest('#dr-lifeline')) continue;
        try {
          el.parentNode && el.parentNode.removeChild(el);
        } catch (e2) {}
      }
      var keep = document.getElementById('dr-lifeline');
      if (keep) {
        var cores = keep.querySelectorAll('.dr-ecg-core');
        for (var j = 1; j < cores.length; j++) {
          try {
            cores[j].parentNode.removeChild(cores[j]);
          } catch (e3) {}
        }
        var glows = keep.querySelectorAll('.dr-ecg-glow');
        for (var k = 1; k < glows.length; k++) {
          try {
            glows[k].parentNode.removeChild(glows[k]);
          } catch (e4) {}
        }
      }
    } catch (e) {}
  }

  dedupe();
  [100, 300, 600, 1000, 1500, 2500, 4000, 6000].forEach(function (ms) {
    setTimeout(dedupe, ms);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') dedupe();
  });
  /* After boot flag */
  var n = 0;
  var iv = setInterval(function () {
    dedupe();
    if (window.__DR_BOOT_DONE || ++n > 40) clearInterval(iv);
  }, 250);
})();
