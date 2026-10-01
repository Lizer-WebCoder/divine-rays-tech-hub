/**
 * Divine Rays — fast real-time email duplicate detection
 * Works on both End-User (#reg-cust-email) and Agent (#reg-agent-email)
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_EMAIL_DUP_FAST) return;
  window.__DR_EMAIL_DUP_FAST = 1;

  var DEBOUNCE_MS = 120;

  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return null;
  }

  function getRegisteredEmails() {
    try {
      return JSON.parse(localStorage.getItem('dr_registered_emails') || '[]') || [];
    } catch (e) {
      return [];
    }
  }

  function rememberRegisteredEmail(email) {
    var e = String(email || '').trim().toLowerCase();
    if (!e) return;
    var list = getRegisteredEmails();
    if (list.indexOf(e) === -1) {
      list.push(e);
      try {
        localStorage.setItem('dr_registered_emails', JSON.stringify(list));
      } catch (err) {}
    }
  }

  function isEmailTakenLocal(email) {
    var e = String(email || '').trim().toLowerCase();
    if (!e) return false;
    return getRegisteredEmails().indexOf(e) !== -1;
  }

  async function isEmailTakenRemote(email) {
    var e = String(email || '').trim().toLowerCase();
    if (!e || e.indexOf('@') === -1) return false;
    var client = sb();
    if (!client) return false;
    try {
      var r = await client.from('profiles').select('id').ilike('email', e).limit(1);
      if (r && !r.error && r.data && r.data.length) return true;
    } catch (err) {}
    try {
      var r2 = await client.from('profiles').select('id').eq('email', e).limit(1);
      if (r2 && !r2.error && r2.data && r2.data.length) return true;
    } catch (err2) {}
    return false;
  }

  function ensureHint(input) {
    if (!input || !input.id) return null;
    var group = input.closest ? input.closest('.form-group') : input.parentNode;
    if (!group) return null;
    var hint = group.querySelector('[data-dr-email-hint="' + input.id + '"]');
    if (!hint) {
      hint = document.createElement('p');
      hint.className = 'dr-email-hint';
      hint.setAttribute('data-dr-email-hint', input.id);
      hint.setAttribute('aria-live', 'polite');
      group.appendChild(hint);
    }
    return hint;
  }

  function setEmailTakenUI(input, taken) {
    if (!input) return;
    var form = input.closest ? input.closest('form') : null;
    var hint = ensureHint(input);
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    var card = input.closest ? input.closest('.login-card-register, .login-card') : null;

    if (taken) {
      input.classList.add('dr-email-taken');
      input.setAttribute('data-email-taken', '1');
      if (hint) {
        hint.textContent = 'Email already exists. Please use another email.';
        hint.className = 'dr-email-hint is-bad';
        hint.style.display = '';
        hint.style.color = '#f87171';
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.55';
        submitBtn.style.cursor = 'not-allowed';
      }
      if (card) {
        card.classList.remove('login-pass-ok', 'login-fail-healing');
        card.classList.add('login-fail-glow');
      }
    } else {
      input.classList.remove('dr-email-taken');
      input.removeAttribute('data-email-taken');
      if (hint) {
        hint.textContent = '';
        hint.className = 'dr-email-hint';
      }
      if (card && !card.querySelector('.dr-pass-mismatch') && !card.querySelector('.dr-email-taken')) {
        card.classList.remove('login-fail-glow');
      }
      /* re-enable submit only if form looks complete and no mismatch */
      if (submitBtn && form && !form.querySelector('.dr-pass-mismatch')) {
        var ok = true;
        form.querySelectorAll('input[required], select[required]').forEach(function (el) {
          if (!(el.value || '').trim()) ok = false;
        });
        var pass = form.querySelector('input[type="password"]');
        var confirm = form.querySelector('input[data-dr-match-for]');
        if (pass && confirm && pass.value !== confirm.value) ok = false;
        if (ok) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          submitBtn.style.cursor = '';
        }
      }
    }
  }

  function wireInput(input) {
    if (!input || input.__drEmailDupFast) return;
    input.__drEmailDupFast = 1;
    ensureHint(input);

    var timer = null;
    var lastChecked = '';

    function run() {
      var val = (input.value || '').trim();
      var low = val.toLowerCase();

      /* incomplete email → clear error */
      if (!val || val.indexOf('@') === -1 || val.indexOf('.') === -1) {
        setEmailTakenUI(input, false);
        lastChecked = '';
        return;
      }

      /* instant local check */
      if (isEmailTakenLocal(val)) {
        setEmailTakenUI(input, true);
        lastChecked = low;
        return;
      }

      if (lastChecked === low) return;

      isEmailTakenRemote(val).then(function (taken) {
        if ((input.value || '').trim().toLowerCase() !== low) return;
        lastChecked = low;
        if (taken) {
          rememberRegisteredEmail(val);
          setEmailTakenUI(input, true);
        } else {
          setEmailTakenUI(input, false);
        }
      }).catch(function () {
        setEmailTakenUI(input, isEmailTakenLocal(val));
      });
    }

    function schedule() {
      /* local hit: immediate */
      var val = (input.value || '').trim();
      if (val && val.indexOf('@') !== -1 && isEmailTakenLocal(val)) {
        setEmailTakenUI(input, true);
      } else if (!val || val.indexOf('@') === -1) {
        setEmailTakenUI(input, false);
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, DEBOUNCE_MS);
    }

    input.addEventListener('input', schedule);
    input.addEventListener('keyup', schedule);
    input.addEventListener('blur', run);
    input.addEventListener('change', run);

    /* if already filled */
    if ((input.value || '').trim()) schedule();
  }

  function scan() {
    wireInput(document.getElementById('reg-cust-email'));
    wireInput(document.getElementById('reg-agent-email'));
    document.querySelectorAll(
      '#dr-register-form-customer input[type="email"], #dr-register-form-agent input[type="email"]'
    ).forEach(wireInput);
  }

  scan();
  setInterval(scan, 1000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  }

  /* watch for register cards being opened/created */
  try {
    new MutationObserver(function () {
      scan();
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
