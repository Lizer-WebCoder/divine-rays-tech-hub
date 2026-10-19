/**
 * Divine Rays — ambient-stable v1
 * 1) Kill #boot / #dr-phase-boot the moment login is visible (stops login twitch overlay)
 * 2) Lock login ambient to one paint (stops double honeycomb)
 * 3) Never rebuild portal ambient gears after first paint
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_STABLE >= 1) return;
  window.__DR_AMBIENT_STABLE = 1;

  function loginVisible() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (!ls || ls.hidden) return false;
      var st = window.getComputedStyle ? getComputedStyle(ls) : null;
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function killBoot() {
    try {
      ['boot', 'dr-phase-boot'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        try {
          el.classList.add('is-done', 'dr-skip');
          el.style.cssText =
            'display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important';
          if (el.parentNode) el.parentNode.removeChild(el);
        } catch (e) {}
      });
      var st = document.getElementById('dr-boot-dead-css');
      if (!st) {
        st = document.createElement('style');
        st.id = 'dr-boot-dead-css';
        (document.head || document.documentElement).appendChild(st);
      }
      st.textContent =
        '#boot,#dr-phase-boot{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}';
    } catch (e2) {}
  }

  function lockLoginAmbient() {
    try {
      window.__DR_AMBIENT_LOCKED = true;
      if (window.DRAmbientGalaxy) {
        window.DRAmbientGalaxy.refresh = function () {};
      }
      var layers = document.querySelectorAll('#dr-login-ambient');
      for (var i = 1; i < layers.length; i++) {
        try {
          layers[i].parentNode.removeChild(layers[i]);
        } catch (e) {}
      }
      var amb = document.getElementById('dr-login-ambient');
      if (amb) {
        var hcs = amb.querySelectorAll('.dr-honeycomb');
        for (var h = 1; h < hcs.length; h++) {
          try {
            hcs[h].parentNode.removeChild(hcs[h]);
          } catch (eH) {}
        }
      }
      var pa = document.getElementById('dr-portal-ambient');
      if (pa && loginVisible()) {
        pa.style.display = 'none';
        pa.style.visibility = 'hidden';
        pa.style.opacity = '0';
      }
    } catch (e3) {}
  }

  function tick() {
    if (loginVisible()) {
      killBoot();
      lockLoginAmbient();
    }
  }

  tick();
  setTimeout(tick, 50);
  setTimeout(tick, 150);
  setTimeout(tick, 400);
  setTimeout(tick, 800);
  setTimeout(tick, 1500);
  setTimeout(tick, 2500);
  setInterval(function () {
    if (loginVisible()) killBoot();
  }, 3000);

  window.DRAmbientStable = { v: 1, refresh: tick };
})();
