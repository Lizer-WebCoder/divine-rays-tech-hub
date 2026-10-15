/**
 * Divine Rays — login-label-lock v6
 * One-shot. Never touches focused password field.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_LABEL_LOCK >= 6) return;
  window.__DR_LOGIN_LABEL_LOCK = 6;

  function fix() {
    if (window.__DR_PAUSE_LOGIN_SCRIPTS) return;
    try {
      var form = document.getElementById('login-agent');
      if (!form) return;
      var emailInput =
        document.getElementById('agent-username') ||
        document.getElementById('agent-user');
      if (emailInput && document.activeElement !== emailInput) {
        var eg = emailInput.closest ? emailInput.closest('.form-group') : emailInput.parentNode;
        var elab = eg ? eg.querySelector('label') : null;
        if (elab && (elab.textContent || '').replace(/\s+/g, ' ').trim() !== 'Email') {
          elab.textContent = 'Email';
        }
      }
      var pass =
        document.getElementById('agent-password') ||
        form.querySelector('input[type="password"]');
      if (pass && document.activeElement !== pass) {
        var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
        var plab = pg ? pg.querySelector('label') : null;
        if (plab && (plab.textContent || '').replace(/\s+/g, ' ').trim() !== 'Password') {
          plab.textContent = 'Password';
        }
      }
    } catch (e) {}
  }

  fix();
  setTimeout(fix, 500);
  setTimeout(fix, 2000);

  window.DRLoginLabelLock = { refresh: fix, v: 6 };
})();
