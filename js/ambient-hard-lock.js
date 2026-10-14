/**
 * Divine Rays — ambient hard lock v2
 * Freeze particles after first paint; no restore loops.
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_HARD_LOCK >= 2) return;
  window.__DR_AMBIENT_HARD_LOCK = 2;

  var LAYER_ID = 'dr-login-ambient';
  var snap = null;
  var locked = false;
  var restoring = false;

  function getLayer() {
    return document.getElementById(LAYER_ID);
  }

  function capture() {
    var el = getLayer();
    if (!el || !el.childNodes || el.childNodes.length < 1) return false;
    snap = el.innerHTML;
    locked = true;
    window.__DR_AMBIENT_LOCKED = true;
    return true;
  }

  function restore() {
    if (!snap || restoring) return;
    restoring = true;
    try {
      var el = getLayer();
      if (!el) {
        el = document.createElement('div');
        el.id = LAYER_ID;
        el.setAttribute('aria-hidden', 'true');
        var host =
          document.getElementById('login-screen') ||
          document.querySelector('.login-screen') ||
          document.body;
        if (host) host.insertBefore(el, host.firstChild);
      }
      if (!el.childNodes || el.childNodes.length < 1) {
        var tmp = document.createElement('div');
        tmp.innerHTML = snap;
        while (tmp.firstChild) el.appendChild(tmp.firstChild);
      }
      el.style.display = 'block';
      window.__DR_AMBIENT_LOCKED = true;
    } catch (e) {
    } finally {
      setTimeout(function () { restoring = false; }, 300);
    }
  }

  function noop() {}

  function killRefreshers() {
    try {
      if (window.DRForceLightBg) {
        window.DRForceLightBg.refresh = noop;
        window.DRForceLightBg.__hardLock = 1;
      }
    } catch (e) {}
  }

  function onInteract() {
    killRefreshers();
    if (locked) {
      var el = getLayer();
      if (!el || !el.childNodes || el.childNodes.length < 1) restore();
    } else {
      capture();
    }
  }

  ['click', 'mousedown'].forEach(function (ev) {
    document.addEventListener(
      ev,
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (t.closest('.ltab') || t.closest('[data-ltab]') || t.closest('#login-screen')) {
          onInteract();
        }
      },
      true
    );
  });

  var n = 0;
  var t = setInterval(function () {
    killRefreshers();
    if (!locked) capture();
    if (locked || ++n > 40) clearInterval(t);
  }, 200);

  setTimeout(function () { killRefreshers(); capture(); }, 800);
  setTimeout(function () { killRefreshers(); capture(); }, 1600);

  window.DRAmbientHardLock = { refresh: onInteract, v: 2 };
})();
