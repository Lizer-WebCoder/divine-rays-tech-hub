/**
 * Divine Rays — login-fast-fix v3
 * Owns first Sign in click. Ensures real app.js (__drDoAgentLogin) is present.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_FAST_FIX >= 3) return;
  window.__DR_LOGIN_FAST_FIX = 3;

  var APP_JS =
    'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@5e1107f239eb33e0c397f62839334c57b1d56edb/js/app.js';
  var _locking = false;
  var _loadingApp = false;

  window.DRLoginFastFix = { v: 3 };

  function findBtn() {
    var form = document.getElementById('login-agent');
    if (!form) return null;
    return form.querySelector('button[type="submit"], button.btn-primary, button');
  }

  function isSignInTarget(el) {
    if (!el || !el.closest) return null;
    var btn = el.closest('button, input[type="submit"], [role="button"]');
    if (!btn) return null;
    if (!btn.closest('#login-agent, #login-screen, .login-card, form.login-form')) return null;
    var tx = (btn.textContent || '').toLowerCase();
    if (tx.indexOf('sign') === -1 && btn.type !== 'submit') return null;
    return btn;
  }

  function setSigning(btn) {
    if (!btn) return;
    try {
      if (!btn.getAttribute('data-dr-prev-label')) {
        btn.setAttribute('data-dr-prev-label', (btn.textContent || 'Sign in as Admin').trim());
      }
      btn.textContent = 'Signing in…';
      btn.disabled = true;
      btn.style.opacity = '0.85';
      btn.style.pointerEvents = 'none';
    } catch (e) {}
  }

  function resetBtn(btn) {
    try {
      if (!btn) return;
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
      btn.textContent = btn.getAttribute('data-dr-prev-label') || 'Sign in as Admin';
    } catch (e) {}
  }

  function clearStuck() {
    window.__drAgentLoginBusy = false;
    window.__drEarlyFired = 0;
    window.__drEarlyLoginQueued = null;
    try {
      if (window.__drLoginInFlight) window.__drLoginInFlight = false;
    } catch (e) {}
  }

  function ensureDoLogin(cb) {
    if (typeof window.__drDoAgentLogin === 'function') {
      cb();
      return;
    }
    if (_loadingApp) {
      var n = 0;
      var t = setInterval(function () {
        n++;
        if (typeof window.__drDoAgentLogin === 'function') {
          clearInterval(t);
          cb();
        } else if (n > 100) {
          clearInterval(t);
          cb();
        }
      }, 50);
      return;
    }
    _loadingApp = true;
    try {
      var s = document.createElement('script');
      s.src = APP_JS + (APP_JS.indexOf('?') === -1 ? '?' : '&') + 'b=' + Date.now();
      s.onload = function () {
        _loadingApp = false;
        cb();
      };
      s.onerror = function () {
        _loadingApp = false;
        cb();
      };
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {
      _loadingApp = false;
      cb();
    }
  }

  function doLogin(btn) {
    if (window.__drBooting) return;
    if (_locking) return;
    _locking = true;
    setTimeout(function () {
      _locking = false;
    }, 2000);

    btn = btn || findBtn();
    clearStuck();
    setSigning(btn);

    try {
      if (
        window.DRForcePending &&
        window.DRForcePending.isPendingIdentity &&
        window.DRForcePending.isPendingIdentity()
      ) {
        clearStuck();
        resetBtn(btn);
        return;
      }
    } catch (eP) {}

    ensureDoLogin(function () {
      clearStuck();
      if (typeof window.__drDoAgentLogin === 'function') {
        try {
          window.__drDoAgentLogin(btn || null);
        } catch (e) {
          console.error(e);
          resetBtn(btn);
          clearStuck();
        }
        return;
      }
      var n = 0;
      var t = setInterval(function () {
        n++;
        clearStuck();
        if (typeof window.__drDoAgentLogin === 'function') {
          clearInterval(t);
          try {
            window.__drDoAgentLogin(btn || null);
          } catch (e2) {
            resetBtn(btn);
          }
        } else if (n > 80) {
          clearInterval(t);
          clearStuck();
          resetBtn(btn);
        }
      }, 50);
    });
  }

  document.addEventListener(
    'pointerdown',
    function (ev) {
      if (ev.button != null && ev.button !== 0) return;
      var btn = isSignInTarget(ev.target);
      if (!btn) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      doLogin(btn);
    },
    true
  );

  document.addEventListener(
    'click',
    function (ev) {
      var btn = isSignInTarget(ev.target);
      if (!btn) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (!_locking) doLogin(btn);
    },
    true
  );

  document.addEventListener(
    'keydown',
    function (ev) {
      if (ev.key !== 'Enter') return;
      var t = ev.target;
      if (!t || !t.closest) return;
      if (!t.closest('#login-agent, form#login-agent, #login-screen form.login-form')) return;
      if (window.__drBooting) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      doLogin(findBtn());
    },
    true
  );

  setTimeout(function () {
    if (typeof window.__drDoAgentLogin === 'function') return;
    ensureDoLogin(function () {});
  }, 800);

  window.DRLoginFastFix = { doLogin: doLogin, v: 3 };
})();
