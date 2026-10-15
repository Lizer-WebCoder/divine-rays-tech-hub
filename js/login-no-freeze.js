/**
 * Divine Rays — login-no-freeze v1
 * Single-flight login; yield UI before heavy loadFullAppThen.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NO_FREEZE >= 1) return;
  window.__DR_LOGIN_NO_FREEZE = 1;

  var _safety = null;

  function patchDoLogin() {
    var fn = window.__drDoAgentLogin;
    if (typeof fn !== 'function' || fn.__drNoFreeze) return !!fn;
    window.__drDoAgentLogin = function (btn) {
      if (window.__drAgentLoginBusy || window.__drBooting) return;
      window.__drAgentLoginBusy = true;
      if (_safety) clearTimeout(_safety);
      _safety = setTimeout(function () {
        window.__drAgentLoginBusy = false;
      }, 20000);
      setTimeout(function () {
        try {
          var ret = fn.call(window, btn);
          if (ret && typeof ret.then === 'function') {
            ret.then(function () {
              if (_safety) clearTimeout(_safety);
            }, function () {
              window.__drAgentLoginBusy = false;
              if (_safety) clearTimeout(_safety);
            });
          }
        } catch (e) {
          console.error(e);
          window.__drAgentLoginBusy = false;
        }
      }, 30);
    };
    window.__drDoAgentLogin.__drNoFreeze = 1;
    return true;
  }

  try {
    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        if (!t.closest('#login-agent, form.login-form, .login-card')) return;
        if (window.DRForceLightBg) {
          try { window.DRForceLightBg.refresh = function () {}; } catch (e) {}
        }
      },
      true
    );
  } catch (e2) {}

  var n = 0;
  var t = setInterval(function () {
    if (patchDoLogin() || ++n > 80) clearInterval(t);
  }, 100);
  setTimeout(patchDoLogin, 50);
  setTimeout(patchDoLogin, 500);
})();
