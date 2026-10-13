/**
 * Divine Rays — ambient freeze guard v3
 * ORIGINAL honeycomb (0962) stays. Typing/login never rebuilds ambient (freeze fix).
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_GUARD >= 3) return;
  window.__DR_AMBIENT_GUARD = 3;

  var snap = null;
  window.__DR_AMBIENT_LOCKED = false;

  function looksAmbient(fn) {
    if (typeof fn !== 'function') return false;
    var src = '';
    try { src = Function.prototype.toString.call(fn); } catch (e) { return false; }
    return (
      src.indexOf('lastAmbientKey') !== -1 ||
      src.indexOf('login-form') !== -1 ||
      src.indexOf('dr-login-ambient') !== -1 ||
      src.indexOf('ensureAmbient') !== -1 ||
      (src.indexOf('apply') !== -1 && src.length < 800)
    );
  }

  var origSI = window.setInterval.bind(window);
  window.setInterval = function (fn, ms) {
    if (looksAmbient(fn) || (window.__DR_AMBIENT_LOCKED && typeof fn === 'function' && ms >= 1000)) {
      return 0;
    }
    return origSI(fn, ms);
  };

  var origST = window.setTimeout.bind(window);
  window.setTimeout = function (fn, ms) {
    if (window.__DR_AMBIENT_LOCKED && looksAmbient(fn)) return 0;
    return origST(fn, ms);
  };

  var origAdd = document.addEventListener.bind(document);
  document.addEventListener = function (type, fn, opts) {
    if (typeof fn === 'function' && looksAmbient(fn)) {
      var wrapped = function (e) {
        if (window.__DR_AMBIENT_LOCKED) return;
        return fn.apply(this, arguments);
      };
      return origAdd(type, wrapped, opts);
    }
    return origAdd(type, fn, opts);
  };

  function capture() {
    var el = document.getElementById('dr-login-ambient');
    if (!el || !el.childNodes || el.childNodes.length < 2) return false;
    snap = el.innerHTML;
    window.__DR_AMBIENT_LOCKED = true;
    try {
      if (window.DRForceLightBg) window.DRForceLightBg.refresh = function () {};
    } catch (e) {}
    return true;
  }

  function protect() {
    if (!window.__DR_AMBIENT_LOCKED || !snap) return;
    var el = document.getElementById('dr-login-ambient');
    if (!el) return;
    if (!el.childNodes || el.childNodes.length < 2) {
      try { el.innerHTML = snap; } catch (e) {}
    }
  }

  ['click', 'input', 'keydown', 'focus', 'mousedown'].forEach(function (ev) {
    origAdd(ev, function () {
      if (window.__DR_AMBIENT_LOCKED) {
        origST(protect, 0);
        origST(protect, 50);
      }
    }, true);
  });

  var n = 0;
  var t = origSI(function () {
    if (capture() || ++n > 120) clearInterval(t);
  }, 80);
})();
