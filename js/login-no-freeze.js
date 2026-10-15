/**
 * Divine Rays — login-no-freeze v5
 * HARD pause while typing: hide ambient/ECG, clear ECG timers/intervals.
 * Typing must never compete with SVG rebuilds on the main thread.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NO_FREEZE >= 5) return;
  window.__DR_LOGIN_NO_FREEZE = 5;

  var _safety = null;
  var _inFlight = false;

  function isLoginInput(el) {
    if (!el || !el.closest) return false;
    if (!el.closest('#login-screen, #login-agent, form.login-form, .login-card')) return false;
    var tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function killEcgWork() {
    try {
      if (window.__DR_ECG_TIMER) {
        clearTimeout(window.__DR_ECG_TIMER);
        window.__DR_ECG_TIMER = null;
      }
    } catch (e) {}
    try {
      if (window.__DR_ECG_INTERVAL) {
        clearInterval(window.__DR_ECG_INTERVAL);
        window.__DR_ECG_INTERVAL = null;
      }
    } catch (e2) {}
    try {
      if (window.DRHeartbeatDraw) {
        window.DRHeartbeatDraw.refresh = function () {};
        window.DRHeartbeatDraw.force = function () {};
      }
    } catch (e3) {}
  }

  function hideHeavyLayers() {
    try {
      var ll = document.getElementById('dr-lifeline');
      if (ll) {
        ll.style.setProperty('display', 'none', 'important');
        ll.style.setProperty('visibility', 'hidden', 'important');
      }
    } catch (e) {}
    try {
      var amb = document.getElementById('dr-login-ambient');
      if (amb) {
        amb.style.setProperty('visibility', 'hidden', 'important');
        amb.style.setProperty('pointer-events', 'none', 'important');
      }
    } catch (e2) {}
  }

  function showHeavyLayers() {
    try {
      var ll = document.getElementById('dr-lifeline');
      if (ll) {
        ll.style.removeProperty('display');
        ll.style.removeProperty('visibility');
      }
    } catch (e) {}
    try {
      var amb = document.getElementById('dr-login-ambient');
      if (amb) {
        amb.style.removeProperty('visibility');
        amb.style.removeProperty('pointer-events');
      }
    } catch (e2) {}
  }

  function pauseOn() {
    window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
    try {
      document.body.classList.add('dr-typing');
    } catch (e) {}
    try {
      if (window.DRForceLightBg) window.DRForceLightBg.refresh = function () {};
    } catch (e2) {}
    killEcgWork();
    hideHeavyLayers();
  }

  function pauseOff() {
    window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
    try {
      document.body.classList.remove('dr-typing');
    } catch (e) {}
    showHeavyLayers();
  }

  document.addEventListener(
    'focusin',
    function (ev) {
      if (isLoginInput(ev.target)) pauseOn();
    },
    true
  );
  document.addEventListener(
    'focusout',
    function (ev) {
      if (isLoginInput(ev.target)) {
        setTimeout(function () {
          if (!isLoginInput(document.activeElement)) pauseOff();
        }, 120);
      }
    },
    true
  );

  document.addEventListener(
    'keydown',
    function (ev) {
      if (isLoginInput(ev.target) || isLoginInput(document.activeElement)) {
        if (!window.__DR_PAUSE_LOGIN_SCRIPTS) pauseOn();
      }
    },
    true
  );

  try {
    var st = document.getElementById('dr-typing-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'dr-typing-css';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      'body.dr-typing #dr-login-ambient,' +
      'body.dr-typing #dr-lifeline,' +
      'body.dr-typing #dr-lifeline *{' +
      'display:none!important;visibility:hidden!important;' +
      'animation:none!important;transition:none!important;pointer-events:none!important}';
  } catch (eC) {}

  function patchDoLogin() {
    var fn = window.__drDoAgentLogin;
    if (typeof fn !== 'function' || fn.__drNoFreeze5) return !!fn;
    var orig = fn.__drOrigLogin || fn;
    window.__drDoAgentLogin = function (btn) {
      if (window.__drBooting) return;
      if (_inFlight) return;
      _inFlight = true;
      pauseOff();
      if (_safety) clearTimeout(_safety);
      _safety = setTimeout(function () {
        _inFlight = false;
        window.__drAgentLoginBusy = false;
      }, 25000);
      requestAnimationFrame(function () {
        setTimeout(function () {
          try {
            window.__drAgentLoginBusy = false;
            var ret = orig.call(window, btn);
            if (ret && typeof ret.then === 'function') {
              ret.then(
                function () {
                  _inFlight = false;
                  if (_safety) clearTimeout(_safety);
                },
                function () {
                  _inFlight = false;
                  window.__drAgentLoginBusy = false;
                  if (_safety) clearTimeout(_safety);
                }
              );
            } else {
              setTimeout(function () {
                if (!window.__drAgentLoginBusy) _inFlight = false;
              }, 200);
            }
          } catch (e) {
            console.error(e);
            _inFlight = false;
            window.__drAgentLoginBusy = false;
          }
        }, 0);
      });
    };
    window.__drDoAgentLogin.__drNoFreeze5 = 1;
    window.__drDoAgentLogin.__drOrigLogin = orig;
    return true;
  }

  try {
    if (isLoginInput(document.activeElement)) pauseOn();
  } catch (eA) {}

  var n = 0;
  var t = setInterval(function () {
    if (patchDoLogin() || ++n > 120) clearInterval(t);
  }, 50);
  setTimeout(patchDoLogin, 20);
  setTimeout(patchDoLogin, 200);
  setTimeout(patchDoLogin, 800);
})();
