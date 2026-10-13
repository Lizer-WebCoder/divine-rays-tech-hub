/**
 * Divine Rays — ambient freeze guard
 * Keeps ORIGINAL force-light-bg (0962) honeycomb design.
 * After first paint, blocks rebuilds that freeze the page on password/login clicks.
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_GUARD) return;
  window.__DR_AMBIENT_GUARD = 1;

  var snap = null;
  window.__DR_AMBIENT_LOCKED = false;

  /* Intercept click listeners registered by force-light-bg that reset ambient */
  var origAdd = document.addEventListener.bind(document);
  document.addEventListener = function (type, fn, opts) {
    if (type === 'click' && typeof fn === 'function') {
      var src = '';
      try {
        src = Function.prototype.toString.call(fn);
      } catch (e) {}
      if (
        src.indexOf('lastAmbientKey') !== -1 ||
        src.indexOf('login-form') !== -1 ||
        src.indexOf('login-screen') !== -1 ||
        (src.indexOf('apply') !== -1 && src.indexOf('setTimeout') !== -1 && src.length < 400)
      ) {
        var wrapped = function (e) {
          if (window.__DR_AMBIENT_LOCKED) return;
          return fn.apply(this, arguments);
        };
        return origAdd(type, wrapped, opts);
      }
    }
    return origAdd(type, fn, opts);
  };

  function capture() {
    var el = document.getElementById('dr-login-ambient');
    if (!el || !el.childNodes || el.childNodes.length < 2) return false;
    snap = el.innerHTML;
    window.__DR_AMBIENT_LOCKED = true;
    try {
      if (window.DRForceLightBg) {
        window.DRForceLightBg.refresh = function () {};
      }
    } catch (e) {}
    return true;
  }

  function protect() {
    if (!window.__DR_AMBIENT_LOCKED || !snap) return;
    var el = document.getElementById('dr-login-ambient');
    if (!el) return;
    if (!el.childNodes || el.childNodes.length < 2) {
      try {
        el.innerHTML = snap;
      } catch (e) {}
    }
  }

  document.addEventListener(
    'click',
    function () {
      if (window.__DR_AMBIENT_LOCKED) {
        setTimeout(protect, 0);
        setTimeout(protect, 50);
      }
    },
    true
  );

  var n = 0;
  var t = setInterval(function () {
    if (capture() || ++n > 80) clearInterval(t);
  }, 120);
})();
