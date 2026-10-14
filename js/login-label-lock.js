/**
 * Divine Rays — lock Admin login field label to Email (no flicker)
 * Defeats agent-username-auth v1 setInterval that resets "Username or Email"
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_LABEL_LOCK >= 1) return;
  window.__DR_LOGIN_LABEL_LOCK = 1;

  function fix() {
    try {
      var form = document.getElementById('login-agent');
      if (!form) return;
      form.querySelectorAll('label').forEach(function (lab) {
        var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
        if (/username/i.test(t)) lab.textContent = 'Email';
      });
      var input = document.getElementById('agent-username');
      if (input) {
        var ph = input.getAttribute('placeholder') || '';
        if (/username/i.test(ph) || !ph) input.setAttribute('placeholder', 'you@company.com');
        try {
          if (input.type !== 'email') input.type = 'email';
        } catch (e) {}
      }
      var pass = document.getElementById('agent-password');
      if (pass) {
        var pph = pass.getAttribute('placeholder') || '';
        if (!pph || /password/i.test(pph) && pph.indexOf('•') === -1) {
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
      characterData: true
    });
  } catch (e3) {
    setInterval(fix, 200);
  }
  setInterval(fix, 800);

  window.DRLoginLabelLock = { refresh: fix, v: 1 };
})();
