/**
 * Divine Rays — password show/hide eye toggles v3
 * Works on Employee + Admin login and registration
 */
(function () {
  'use strict';
  if (window.__DR_PW_TOGGLE >= 3) return;
  window.__DR_PW_TOGGLE = 3;

  var CSS_ID = 'dr-pw-toggle-css';
  var EYE =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>' +
    '<circle cx="12" cy="12" r="3"/>' +
    '</svg>';
  var EYE_OFF =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94"/>' +
    '<path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19"/>' +
    '<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>' +
    '<line x1="1" y1="1" x2="23" y2="23"/>' +
    '</svg>';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      '.dr-pw-wrap{position:relative;display:block;width:100%}',
      '.dr-pw-wrap input{padding-right:2.6rem!important;width:100%;box-sizing:border-box}',
      '.dr-pw-toggle{position:absolute;right:0.55rem;top:50%;transform:translateY(-50%);',
      'display:inline-flex;align-items:center;justify-content:center;',
      'width:1.75rem;height:1.75rem;padding:0;margin:0;border:0;background:transparent;',
      'color:#9898b0;cursor:pointer;border-radius:6px;line-height:0;z-index:5}',
      '.dr-pw-toggle:hover{color:#c4b5fd;background:rgba(167,139,250,0.12)}',
      '.dr-pw-toggle svg{display:block;pointer-events:none}'
    ].join('');
  }

  function clearEmailErrors(form) {
    if (!form) return;
    try {
      form.querySelectorAll('.error, .form-error, .login-error, [data-error], .dr-error, .alert-error, p[role="alert"]').forEach(function (el) {
        var t = (el.textContent || '');
        if (/enter your email|email is required|please enter/i.test(t)) {
          el.style.display = 'none';
          el.textContent = '';
          el.classList.remove('is-on', 'show', 'active');
        }
      });
    } catch (e) {}
  }

  function doToggle(input, btn) {
    if (!input || !btn) return;
    var form = input.form || (input.closest && input.closest('form'));
    var prevNv = form ? form.noValidate : false;
    if (form) form.noValidate = true;

    if (input.type === 'password') {
      try { input.type = 'text'; } catch (e) {}
      input.setAttribute('data-dr-was-password', '1');
      btn.innerHTML = EYE_OFF;
      btn.setAttribute('aria-label', 'Hide password');
      btn.setAttribute('title', 'Hide password');
    } else {
      try { input.type = 'password'; } catch (e2) {}
      input.removeAttribute('data-dr-was-password');
      btn.innerHTML = EYE;
      btn.setAttribute('aria-label', 'Show password');
      btn.setAttribute('title', 'Show password');
    }

    clearEmailErrors(form);
    setTimeout(function () {
      try { if (form) form.noValidate = prevNv; } catch (e3) {}
    }, 50);

    try {
      input.focus({ preventScroll: true });
      var len = (input.value || '').length;
      if (input.setSelectionRange) input.setSelectionRange(len, len);
    } catch (e4) {}
  }

  function wrap(input) {
    if (!input || input.__drPwWrapped) return;
    var type = (input.getAttribute('type') || input.type || '').toLowerCase();
    var id = (input.id || '').toLowerCase();
    var isPw =
      type === 'password' ||
      input.getAttribute('data-dr-was-password') === '1' ||
      /password|passwd|pwd/.test(id);
    if (!isPw) return;

    var ok = false;
    try {
      ok = !!(
        input.closest('#login-screen, .login-card, .dr-reg-card, #dr-reg-card-employee, #dr-reg-card-admin') ||
        input.closest('#login-customer, #login-agent, #register-customer, #register-agent, #dr-form-reg-employee, #dr-form-reg-admin')
      );
    } catch (e) {}
    if (!ok) return;

    input.__drPwWrapped = 1;
    var parent = input.parentNode;
    if (!parent) return;
    if (parent.classList && parent.classList.contains('dr-pw-wrap')) return;

    var wrapEl = document.createElement('div');
    wrapEl.className = 'dr-pw-wrap';
    parent.insertBefore(wrapEl, input);
    wrapEl.appendChild(input);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dr-pw-toggle';
    btn.setAttribute('aria-label', 'Show password');
    btn.setAttribute('title', 'Show password');
    btn.innerHTML = EYE;
    wrapEl.appendChild(btn);
  }

  function scan() {
    injectCss();
    var list = document.querySelectorAll(
      '#login-customer input, #login-agent input, #register-customer input, #register-agent input, ' +
      '#dr-form-reg-employee input, #dr-form-reg-admin input, .dr-reg-card input, .login-card input, ' +
      '#cust-password, #agent-password, #dr-emp-password, #dr-emp-password2, #dr-adm-password, #dr-adm-password2'
    );
    list.forEach(function (inp) {
      try { wrap(inp); } catch (e) {}
    });
  }

  document.addEventListener(
    'click',
    function (e) {
      var btn = e.target && (e.target.closest ? e.target.closest('.dr-pw-toggle') : null);
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var wrapEl = btn.closest('.dr-pw-wrap');
      var input = wrapEl && wrapEl.querySelector('input');
      if (!input) return;
      doToggle(input, btn);
    },
    true
  );

  scan();
  setTimeout(scan, 400);
  setTimeout(scan, 1200);
  setTimeout(scan, 2500);

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && (e.target.closest ? e.target.closest('a') : null);
      if (a && /create|account|register/i.test(a.textContent || '')) {
        setTimeout(scan, 100);
        setTimeout(scan, 400);
      }
    },
    false
  );

  try {
    var mo = new MutationObserver(function () { setTimeout(scan, 100); });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  window.DRPasswordToggle = { v: 3, refresh: scan };
})();
