/**
 * Divine Rays — login-fast-fix v1
 * Enter key + unstick busy pre-block that delayed first Sign in click.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_FAST_FIX >= 1) return;
  window.__DR_LOGIN_FAST_FIX = 1;

  function findBtn() {
    var form = document.getElementById('login-agent');
    if (!form) return null;
    return form.querySelector('button[type="submit"], button.btn-primary, button');
  }

  function doLogin(btn) {
    if (window.__drBooting) return;
    btn = btn || findBtn();
    try {
      if (btn) {
        btn.setAttribute('data-dr-prev-label', (btn.textContent || 'Sign in as Admin').trim());
        btn.textContent = 'Signing in…';
        btn.disabled = true;
        btn.style.opacity = '0.85';
      }
    } catch (e) {}
    window.__drAgentLoginBusy = false;
    window.__drEarlyFired = 0;
    if (typeof window.__drDoAgentLogin === 'function') {
      window.__drEarlyFired = 1;
      window.__drDoAgentLogin(btn);
    } else {
      window.__drEarlyLoginQueued = btn || true;
      var n = 0;
      var t = setInterval(function () {
        n++;
        if (typeof window.__drDoAgentLogin === 'function') {
          clearInterval(t);
          window.__drDoAgentLogin(btn);
        } else if (n > 80) {
          clearInterval(t);
          window.__drEarlyFired = 0;
          try {
            if (btn) {
              btn.disabled = false;
              btn.style.opacity = '';
              btn.textContent = btn.getAttribute('data-dr-prev-label') || 'Sign in as Admin';
            }
          } catch (e2) {}
        }
      }, 50);
    }
  }

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

  // Also intercept Sign in clicks at capture and clear stuck busy first
  document.addEventListener(
    'pointerdown',
    function (ev) {
      if (ev.button != null && ev.button !== 0) return;
      var t = ev.target;
      if (!t || !t.closest) return;
      var btn = t.closest('button, input[type="submit"]');
      if (!btn) return;
      if (!btn.closest('#login-agent, #login-screen')) return;
      var label = (btn.textContent || '').toLowerCase();
      if (label.indexOf('sign in') === -1 && label.indexOf('signing') === -1) return;
      // Clear stuck flags so real login can run
      if (window.__drAgentLoginBusy && !window.__drBooting) {
        window.__drAgentLoginBusy = false;
        window.__drEarlyFired = 0;
      }
    },
    true
  );

  window.DRLoginFastFix = { doLogin: doLogin, v: 1 };
})();
