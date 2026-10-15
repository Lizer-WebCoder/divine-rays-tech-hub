/**
 * Divine Rays — login-no-freeze v4
 * Pause ALL login helpers while any login input is focused.
 * Single-flight Sign in without blocking the real handler.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NO_FREEZE >= 4) return;
  window.__DR_LOGIN_NO_FREEZE = 4;

  var _safety = null;
  var _inFlight = false;

  function isLoginInput(el) {
    if (!el) return false;
    if (!el.closest) return false;
    if (!el.closest('#login-screen, #login-agent, form.login-form, .login-card')) return false;
    var tag = (el.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    return false;
  }

  function pauseOn() {
    window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
    try {
      document.body.classList.add('dr-typing');
    } catch (e) {}
    try {
      if (window.DRForceLightBg) window.DRForceLightBg.refresh = function () {};
    } catch (e2) {}
  }
  function pauseOff() {
    window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
    try {
      document.body.classList.remove('dr-typing');
    } catch (e) {}
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
        }, 80);
      }
    },
    true
  );

  try {
    var st = document.getElementById('dr-typing-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'dr-typing-css';
      st.textContent =
        'body.dr-typing #dr-login-ambient,body.dr-typing #dr-lifeline,body.dr-typing #dr-lifeline *{' +
        'animation-play-state:paused!important;transition:none!important}';
      (document.head || document.documentElement).appendChild(st);
    }
  } catch (eC) {}

  function patchDoLogin() {
    var fn = window.__drDoAgentLogin;
    if (typeof fn !== 'function' || fn.__drNoFreeze4) return !!fn;
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
    window.__drDoAgentLogin.__drNoFreeze4 = 1;
    window.__drDoAgentLogin.__drOrigLogin = orig;
    return true;
  }

  var n = 0;
  var t = setInterval(function () {
    if (patchDoLogin() || ++n > 120) clearInterval(t);
  }, 50);
  setTimeout(patchDoLogin, 20);
  setTimeout(patchDoLogin, 200);
  setTimeout(patchDoLogin, 800);
})();
