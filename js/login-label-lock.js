/**
 * Divine Rays — lock Admin login field labels v3
 * Email field stays "Email"; Password field stays "Password".
 * Never force every label to Email (that was the double-Email bug).
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_LABEL_LOCK >= 3) return;
  window.__DR_LOGIN_LABEL_LOCK = 3;

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
        emailInput.setAttribute('autocomplete', 'username');
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
    } catch (e2) {}
  }

  fix();

  try {
    var mo = new MutationObserver(function () {
      fix();
    });
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'type']
    });
  } catch (e3) {}

  setInterval(function () {
    try {
      var ls = document.getElementById('login-screen');
      if (ls && ls.offsetParent === null && document.body && document.body.classList.contains('is-portal')) return;
      fix();
    } catch (e4) {
      fix();
    }
  }, 400);

  var frames = 0;
  function rafBurst() {
    fix();
    if (++frames < 40) requestAnimationFrame(rafBurst);
  }
  try {
    requestAnimationFrame(rafBurst);
  } catch (e5) {
    fix();
  }

  window.DRLoginLabelLock = { refresh: fix, v: 3 };
})();
