/**
 * Divine Rays — ambient hard lock v1
 * Stops honeycomb + dashed-line particles from resetting on Employee/Admin tab clicks.
 * Freezes #dr-login-ambient after first paint; no-ops all rebuild/refresh paths.
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_HARD_LOCK >= 1) return;
  window.__DR_AMBIENT_HARD_LOCK = 1;

  var LAYER_ID = 'dr-login-ambient';
  var snap = null;
  var locked = false;
  var parentFrozen = null;

  function getLayer() {
    return document.getElementById(LAYER_ID);
  }

  function capture() {
    var el = getLayer();
    if (!el || !el.childNodes || el.childNodes.length < 1) return false;
    snap = el.innerHTML;
    parentFrozen = el.parentNode;
    locked = true;
    window.__DR_AMBIENT_LOCKED = true;
    try {
      Object.defineProperty(el, 'innerHTML', {
        configurable: true,
        enumerable: true,
        get: function () {
          return snap;
        },
        set: function () {
          /* ignore rebuilds */
        }
      });
    } catch (e) {}
    return true;
  }

  function restore() {
    if (!snap) return;
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
    try {
      var tmp = document.createElement('div');
      tmp.innerHTML = snap;
      while (el.firstChild) el.removeChild(el.firstChild);
      while (tmp.firstChild) el.appendChild(tmp.firstChild);
    } catch (e2) {
      try {
        el.innerHTML = snap;
      } catch (e3) {}
    }
    el.style.display = 'block';
    window.__DR_AMBIENT_LOCKED = true;
  }

  function noopRefresh() {}

  function killRefreshers() {
    try {
      if (window.DRForceLightBg) {
        window.DRForceLightBg.refresh = noopRefresh;
        window.DRForceLightBg.__noReset = 1;
        window.DRForceLightBg.__stable = 1;
        window.DRForceLightBg.__hardLock = 1;
      }
    } catch (e) {}
    try {
      if (window.DRLoginAmbient) window.DRLoginAmbient.refresh = noopRefresh;
    } catch (e2) {}
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

  try {
    var mo = new MutationObserver(function () {
      if (!locked || !snap) return;
      var el = getLayer();
      if (!el || !el.childNodes || el.childNodes.length < 1) {
        restore();
        return;
      }
      var net = el.querySelector('.dr-network');
      if (!net || !net.querySelector('svg')) restore();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (eMo) {}

  ['click', 'mousedown', 'pointerdown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(
      ev,
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        if (
          t.closest('.ltab') ||
          t.closest('[data-ltab]') ||
          t.closest('.login-tabs') ||
          t.closest('form.login-form') ||
          t.closest('.login-card') ||
          t.closest('#login-screen')
        ) {
          onInteract();
          setTimeout(onInteract, 0);
          setTimeout(onInteract, 40);
          setTimeout(onInteract, 200);
          setTimeout(onInteract, 500);
        }
      },
      true
    );
  });

  var n = 0;
  var t = setInterval(function () {
    killRefreshers();
    if (!locked) capture();
    if ((locked && snap) || ++n > 100) {
      if (locked) clearInterval(t);
    }
  }, 100);

  setTimeout(function () {
    killRefreshers();
    capture();
  }, 700);
  setTimeout(function () {
    killRefreshers();
    capture();
  }, 1500);

  window.DRAmbientHardLock = {
    refresh: function () {
      killRefreshers();
      if (locked) restore();
      else capture();
    },
    v: 1
  };
})();
