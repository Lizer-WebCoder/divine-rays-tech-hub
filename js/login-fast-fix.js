/**
 * Divine Rays — login-fast-fix v2
 * Owns first Sign in click; clears stuck earlyFired/busy; Enter key.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_FAST_FIX >= 2) return;
  window.__DR_LOGIN_FAST_FIX = 2;

  var _locking = false;

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

  function clearStuck() {
    window.__drAgentLoginBusy = false;
    window.__drEarlyFired = 0;
    window.__drEarlyLoginQueued = null;
  }

  function doLogin(btn) {
    if (window.__drBooting) return;
    if (_locking) return;
    _locking = true;
    setTimeout(function () {
      _locking = false;
    }, 1500);

    btn = btn || findBtn();
    clearStuck();
    setSigning(btn);

    try {
      if (window.DRForcePending && window.DRForcePending.isPendingIdentity && window.DRForcePending.isPendingIdentity()) {
        clearStuck();
        try {
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = '';
            btn.style.pointerEvents = '';
            btn.textContent = btn.getAttribute('data-dr-prev-label') || 'Sign in as Admin';
          }
        } catch (e) {}
        return;
      }
    } catch (eP) {}

    function call() {
      clearStuck();
      if (typeof window.__drDoAgentLogin === 'function') {
        window.__drDoAgentLogin(btn || null);
        return true;
      }
      return false;
    }

    if (call()) return;
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (call()) clearInterval(t);
      else if (n > 80) {
        clearInterval(t);
        clearStuck();
        try {
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = '';
            btn.style.pointerEvents = '';
            btn.textContent = btn.getAttribute('data-dr-prev-label') || 'Sign in as Admin';
          }
        } catch (e2) {}
      }
    }, 50);
  }

  document.addEventListener(
    'pointerdown',
    function (ev) {
      if (ev.button != null && ev.button !== 0) return;
      var btn = isSignInTarget(ev.target);
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
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
      ev.stopPropagation();
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
      ev.stopPropagation();
      doLogin(findBtn());
    },
    true
  );

  window.DRLoginFastFix = { doLogin: doLogin, v: 2 };
})();
