/**
 * Divine Rays — lock Admin login field label to Email (no flicker) v2
 * Defeats any residual agent-username-auth v1 setInterval that resets
 * "Username or Email". Runs MutationObserver + fast interval + RAF burst.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_LABEL_LOCK >= 2) return;
  window.__DR_LOGIN_LABEL_LOCK = 2;

  function forceEmailLabel(lab) {
    if (!lab) return;
    var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
    if (t !== 'Email') {
      lab.textContent = 'Email';
      lab.setAttribute('data-dr-locked-label', 'email');
    }
  }

  function fix() {
    try {
      var form = document.getElementById('login-agent');
      if (!form) return;

      form.querySelectorAll('label').forEach(function (lab) {
        var t = (lab.textContent || '').replace(/\s+/g, ' ').trim();
        if (/username/i.test(t) || t !== 'Email') forceEmailLabel(lab);
      });

      var input =
        document.getElementById('agent-username') ||
        document.getElementById('agent-user') ||
        form.querySelector('input[type="text"], input[type="email"]');
      if (input) {
        var ph = input.getAttribute('placeholder') || '';
        if (/username/i.test(ph) || !ph || ph === 'Username or email') {
          input.setAttribute('placeholder', 'you@company.com');
        }
        try {
          if (input.type !== 'email') input.type = 'email';
        } catch (e) {}
        input.setAttribute('autocomplete', 'username');
      }

      var pass = document.getElementById('agent-password') || form.querySelector('input[type="password"]');
      if (pass) {
        var pph = pass.getAttribute('placeholder') || '';
        if (!pph || (/password/i.test(pph) && pph.indexOf('\u2022') === -1)) {
          pass.setAttribute('placeholder', '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022');
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

  window.DRLoginLabelLock = { refresh: fix, v: 2 };
})();
