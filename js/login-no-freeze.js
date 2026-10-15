/**
 * Divine Rays — login-no-freeze v6
 * Pause ECG timers while typing. Never display:none on ambient * children (that froze Password).
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_NO_FREEZE >= 6) return;
  window.__DR_LOGIN_NO_FREEZE = 6;

  var _safety = null;
  var _inFlight = false;

  function isLoginInput(el) {
    if (!el || !el.closest) return false;
    if (!el.closest('#login-screen, #login-agent, form.login-form, .login-card')) return false;
    var tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function killEcgTimers() {
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
  }

  function pauseOn() {
    window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
    try {
      document.body.classList.add('dr-typing');
    } catch (e) {}
    try {
      if (window.DRForceLightBg) window.DRForceLightBg.refresh = function () {};
    } catch (e2) {}
    killEcgTimers();
    try {
      var amb = document.getElementById('dr-login-ambient');
      if (amb) {
        amb.style.setProperty('animation-play-state', 'paused', 'important');
      }
    } catch (e3) {}
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
    'pointerdown',
    function (ev) {
      if (isLoginInput(ev.target)) pauseOn();
    },
    true
  );
  document.addEventListener(
    'focusout',
    function (ev) {
      if (!isLoginInput(ev.target)) return;
      setTimeout(function () {
        if (!isLoginInput(document.activeElement)) pauseOff();
      }, 120);
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
      'body.dr-typing #dr-login-ambient *{' +
      'animation-play-state:paused!important}' +
      'body.dr-typing #dr-lifeline{' +
      'animation-play-state:paused!important}';
  } catch (eC) {}

  function patchDoLogin() {
    var fn = window.__drDoAgentLogin;
    if (typeof fn !== 'function' || fn.__drNoFreeze6) return !!fn;
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
    window.__drDoAgentLogin.__drNoFreeze6 = 1;
    window.__drDoAgentLogin.__drOrigLogin = orig;
    return true;
  }

  var n = 0;
  var t = setInterval(function () {
    if (patchDoLogin() || ++n > 120) clearInterval(t);
  }, 50);

  window.DRLoginNoFreeze = { v: 6 };
})();
