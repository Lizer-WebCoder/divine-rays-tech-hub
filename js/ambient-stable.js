/**
 * Divine Rays — ambient-stable v2
 * Stops force-light-bg from rebuilding #dr-login-ambient on login form clicks (page freeze fix).
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_STABLE >= 2) return;
  window.__DR_AMBIENT_STABLE = 2;

  var LAYER = 'dr-login-ambient';
  var snapshot = null;
  var restoring = false;

  function grab() {
    var el = document.getElementById(LAYER);
    if (el && el.childNodes && el.childNodes.length > 1) {
      snapshot = el.innerHTML;
      return true;
    }
    return false;
  }

  function restore() {
    if (!snapshot || restoring) return;
    var el = document.getElementById(LAYER);
    if (!el) return;
    if (el.childNodes && el.childNodes.length > 1) return;
    restoring = true;
    try {
      el.innerHTML = snapshot;
    } catch (e) {}
    restoring = false;
  }

  function patch() {
    if (!window.DRForceLightBg || window.DRForceLightBg.__stable) return !!window.DRForceLightBg;
    var orig = window.DRForceLightBg.refresh;
    if (typeof orig !== 'function') return false;
    window.DRForceLightBg.refresh = function () {
      grab();
      var el = document.getElementById(LAYER);
      if (el && el.childNodes && el.childNodes.length > 1 && snapshot) {
        return;
      }
      try {
        orig.apply(this, arguments);
      } catch (e) {}
      grab();
    };
    window.DRForceLightBg.__stable = 1;
    return true;
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('form.login-form') || t.closest('.login-card') || t.closest('#login-screen .login-tabs')) {
        setTimeout(restore, 0);
        setTimeout(restore, 50);
        setTimeout(restore, 300);
        setTimeout(restore, 800);
      }
    },
    true
  );

  var n = 0;
  var t = setInterval(function () {
    patch();
    grab();
    if ((window.DRForceLightBg && window.DRForceLightBg.__stable && snapshot) || ++n > 80) {
      clearInterval(t);
    }
  }, 150);

  setTimeout(function () {
    patch();
    grab();
  }, 100);
})();
