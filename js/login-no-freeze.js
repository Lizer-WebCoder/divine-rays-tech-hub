/**
 * Divine Rays — login-no-freeze v3
 * Single-flight without blocking the real runAgentLogin.
 * Pause helpers while password focused.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NO_FREEZE >= 3) return;
  window.__DR_LOGIN_NO_FREEZE = 3;

  var _safety = null;
  var _inFlight = false;

  function isPass(el) {
    return el && (el.type === 'password' || el.id === 'agent-password' || el.id === 'cust-password');
  }

  document.addEventListener('focusin', function (ev) {
    if (isPass(ev.target)) window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
  }, true);
  document.addEventListener('focusout', function (ev) {
    if (isPass(ev.target)) window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
  }, true);

  function patchDoLogin() {
    var fn = window.__drDoAgentLogin;
    if (typeof fn !== 'function' || fn.__drNoFreeze3) return !!fn;
    var orig = fn.__drOrigLogin || fn;
    window.__drDoAgentLogin = function (btn) {
      if (window.__drBooting) return;
      if (_inFlight) return;
      _inFlight = true;
      if (_safety) clearTimeout(_safety);
      _safety = setTimeout(function () {
        _inFlight = false;
        window.__drAgentLoginBusy = false;
      }, 25000);
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
            }, 100);
          }
        } catch (e) {
          console.error(e);
          _inFlight = false;
          window.__drAgentLoginBusy = false;
        }
      }, 0);
    };
    window.__drDoAgentLogin.__drNoFreeze3 = 1;
    window.__drDoAgentLogin.__drOrigLogin = orig;
    return true;
  }

  try {
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (!t.closest('#login-agent, form.login-form, .login-card')) return;
      if (window.DRForceLightBg) {
        try { window.DRForceLightBg.refresh = function () {}; } catch (e) {}
      }
    }, true);
  } catch (e2) {}

  var n = 0;
  var t = setInterval(function () {
    if (patchDoLogin() || ++n > 100) clearInterval(t);
  }, 50);
  setTimeout(patchDoLogin, 20);
  setTimeout(patchDoLogin, 200);
  setTimeout(patchDoLogin, 800);
})();
