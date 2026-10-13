/**
 * Divine Rays — ambient freeze guard v2
 * ORIGINAL honeycomb stays. Blocks rebuild on click AND input (typing freeze fix).
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_GUARD >= 2) return;
  window.__DR_AMBIENT_GUARD = 2;

  var snap = null;
  window.__DR_AMBIENT_LOCKED = false;

  var origAdd = document.addEventListener.bind(document);
  document.addEventListener = function (type, fn, opts) {
    if ((type === 'click' || type === 'input' || type === 'keydown' || type === 'keyup' || type === 'focus' || type === 'blur') && typeof fn === 'function') {
      var src = '';
      try { src = Function.prototype.toString.call(fn); } catch (e) {}
      if (
        src.indexOf('lastAmbientKey') !== -1 ||
        src.indexOf('login-form') !== -1 ||
        src.indexOf('login-screen') !== -1 ||
        (src.indexOf('apply') !== -1 && src.indexOf('setTimeout') !== -1 && src.length < 500)
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

  ['click', 'input', 'keydown', 'focus'].forEach(function (ev) {
    document.addEventListener(ev, function () {
      if (window.__DR_AMBIENT_LOCKED) {
        setTimeout(protect, 0);
        setTimeout(protect, 40);
      }
    }, true);
  });

  var n = 0;
  var t = setInterval(function () {
    if (capture() || ++n > 100) clearInterval(t);
  }, 100);
})();
