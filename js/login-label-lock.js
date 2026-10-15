/**
 * Divine Rays — login-label-lock v5
 * Labels only. No MutationObserver (typing freeze fix).
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_LABEL_LOCK >= 5) return;
  window.__DR_LOGIN_LABEL_LOCK = 5;

  function fix() {
    try {
      var form = document.getElementById('login-agent');
      if (!form) return;
      var emailInput =
        document.getElementById('agent-username') ||
        document.getElementById('agent-user') ||
        form.querySelector('input[type="email"], input[type="text"]');
      if (emailInput) {
        var eg = emailInput.closest ? emailInput.closest('.form-group') : emailInput.parentNode;
        var elab = eg ? eg.querySelector('label') : null;
        if (elab && (elab.textContent || '').replace(/\s+/g, ' ').trim() !== 'Email') {
          elab.textContent = 'Email';
        }
        var ph = emailInput.getAttribute('placeholder') || '';
        if (/username/i.test(ph) || !ph || ph === 'Username or email') {
          emailInput.setAttribute('placeholder', 'you@company.com');
        }
      }
      var pass =
        document.getElementById('agent-password') ||
        form.querySelector('input[type="password"]');
      if (pass) {
        var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
        var plab = pg ? pg.querySelector('label') : null;
        if (plab && (plab.textContent || '').replace(/\s+/g, ' ').trim() !== 'Password') {
          plab.textContent = 'Password';
        }
      }
    } catch (e) {}
  }

  fix();
  setTimeout(fix, 300);
  setTimeout(fix, 1200);
  setInterval(function () {
    try {
      if (document.body && document.body.classList.contains('is-portal')) return;
      fix();
    } catch (e2) {}
  }, 3000);

  window.DRLoginLabelLock = { refresh: fix, v: 5 };
})();
