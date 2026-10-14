/**
 * Divine Rays — login-label-lock v4 (stable, no freeze)
 * Email/Password labels only; no MutationObserver characterData loops.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_LABEL_LOCK >= 4) return;
  window.__DR_LOGIN_LABEL_LOCK = 4;

  var _busy = false;
  function fix() {
    if (_busy) return;
    _busy = true;
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
        if (elab) {
          var et = (elab.textContent || '').replace(/\s+/g, ' ').trim();
          if (et !== 'Email') {
            elab.textContent = 'Email';
            elab.setAttribute('data-dr-locked-label', 'email');
          }
        }
        var ph = emailInput.getAttribute('placeholder') || '';
        if (/username/i.test(ph) || !ph || ph === 'Username or email') {
          emailInput.setAttribute('placeholder', 'you@company.com');
        }
        try {
          if (emailInput.type !== 'email') emailInput.type = 'email';
        } catch (e) {}
        try { emailInput.setAttribute('autocomplete', 'username'); } catch (e2) {}
      }

      var pass =
        document.getElementById('agent-password') ||
        form.querySelector('input[type="password"]');
      if (pass) {
        var pg = pass.closest ? pass.closest('.form-group') : pass.parentNode;
        var plab = pg ? pg.querySelector('label') : null;
        if (plab) {
          var pt = (plab.textContent || '').replace(/\s+/g, ' ').trim();
          if (pt !== 'Password') {
            plab.textContent = 'Password';
            plab.setAttribute('data-dr-locked-label', 'password');
          }
        }
        var pph = pass.getAttribute('placeholder') || '';
        if (!pph || (/password/i.test(pph) && pph.indexOf('\u2022') === -1 && pph.indexOf('•') === -1)) {
          pass.setAttribute('placeholder', '••••••••');
        }
      }
    } catch (e3) {
    } finally {
      setTimeout(function () { _busy = false; }, 50);
    }
  }

  fix();
  setTimeout(fix, 200);
  setTimeout(fix, 800);

  try {
    var mo = new MutationObserver(function () {
      if (_busy) return;
      fix();
    });
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['placeholder', 'type', 'class']
    });
  } catch (e4) {}

  setInterval(function () {
    try {
      if (document.body && document.body.classList.contains('is-portal')) return;
      fix();
    } catch (e5) {}
  }, 2000);

  window.DRLoginLabelLock = { refresh: fix, v: 4 };
})();
