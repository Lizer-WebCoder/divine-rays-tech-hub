/**
 * Divine Rays — ambient-stable v3
 * Never rebuild ambient on password/input typing (freeze fix).
 * Snapshot once; restore only if layer was emptied, not on every click.
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_STABLE >= 3) return;
  window.__DR_AMBIENT_STABLE = 3;

  var LAYER = 'dr-login-ambient';
  var snapshot = null;
  var restoring = false;
  var lastRestore = 0;

  function grab() {
    try {
      var el = document.getElementById(LAYER);
      if (el && el.childNodes && el.childNodes.length > 1) {
        snapshot = el.innerHTML;
        return true;
      }
    } catch (e) {}
    return false;
  }

  function restore() {
    if (!snapshot || restoring) return;
    if (window.__DR_PAUSE_LOGIN_SCRIPTS) return;
    var now = Date.now();
    if (now - lastRestore < 2000) return;
    var el = document.getElementById(LAYER);
    if (!el) return;
    if (el.childNodes && el.childNodes.length > 1) return;
    restoring = true;
    lastRestore = now;
    try {
      el.innerHTML = snapshot;
    } catch (e) {}
    restoring = false;
  }

  function isTypingTarget(t) {
    if (!t) return false;
    var tag = (t.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (t.isContentEditable) return true;
    return false;
  }

  function patch() {
    if (!window.DRForceLightBg || window.DRForceLightBg.__stable3) return !!window.DRForceLightBg;
    window.DRForceLightBg.refresh = function () {
      if (window.__DR_PAUSE_LOGIN_SCRIPTS) return;
      grab();
    };
    window.DRForceLightBg.__stable3 = 1;
    return true;
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (isTypingTarget(t)) return;
      if (window.__DR_PAUSE_LOGIN_SCRIPTS) return;
      if (!t.closest('#login-screen')) return;
      setTimeout(restore, 100);
    },
    true
  );

  document.addEventListener(
    'focusin',
    function (e) {
      if (isTypingTarget(e.target)) {
        window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
      }
    },
    true
  );
  document.addEventListener(
    'focusout',
    function (e) {
      if (isTypingTarget(e.target)) {
        setTimeout(function () {
          var a = document.activeElement;
          if (!isTypingTarget(a)) window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
        }, 50);
      }
    },
    true
  );

  var n = 0;
  var t = setInterval(function () {
    patch();
    grab();
    if ((window.DRForceLightBg && window.DRForceLightBg.__stable3 && snapshot) || ++n > 60) {
      clearInterval(t);
    }
  }, 200);

  setTimeout(function () {
    patch();
    grab();
  }, 100);
})();
