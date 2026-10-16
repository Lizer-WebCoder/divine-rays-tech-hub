/**
 * Divine Rays — password show/hide eye toggles
 * Login + Employee/Admin registration Password & Confirm Password
 */
(function () {
  'use strict';
  if (window.__DR_PW_TOGGLE >= 1) return;
  window.__DR_PW_TOGGLE = 1;

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
      '.dr-pw-wrap input[type="password"],.dr-pw-wrap input[type="text"]{padding-right:2.6rem!important;width:100%;box-sizing:border-box}',
      '.dr-pw-toggle{position:absolute;right:0.55rem;top:50%;transform:translateY(-50%);',
      'display:inline-flex;align-items:center;justify-content:center;',
      'width:1.75rem;height:1.75rem;padding:0;margin:0;border:none;background:transparent;',
      'color:#9898b0;cursor:pointer;border-radius:6px;line-height:0}',
      '.dr-pw-toggle:hover{color:#c4b5fd;background:rgba(167,139,250,0.12)}',
      '.dr-pw-toggle:focus-visible{outline:2px solid rgba(167,139,250,0.5);outline-offset:1px}',
      '.dr-pw-toggle svg{display:block;pointer-events:none}'
    ].join('');
  }

  function isPasswordField(input) {
    if (!input || input.tagName !== 'INPUT') return false;
    if (input.getAttribute('data-dr-pw-skip') === '1') return false;
    var id = (input.id || '').toLowerCase();
    var name = (input.name || '').toLowerCase();
    var type = (input.type || '').toLowerCase();
    if (type === 'password') return true;
    if (type === 'text' && input.getAttribute('data-dr-was-password') === '1') return true;
    if (/password|passwd|pwd/.test(id) || /password|passwd|pwd/.test(name)) return true;
    return false;
  }

  function inLoginOrReg(input) {
    try {
      if (input.closest('#login-screen, .login-card, .dr-reg-card, #dr-reg-card-employee, #dr-reg-card-admin, #dr-form-reg-employee, #dr-form-reg-admin'))
        return true;
      if (input.closest('#login-customer, #login-agent, #register-customer, #register-agent'))
        return true;
    } catch (e) {}
    return false;
  }

  function wrap(input) {
    if (!input || input.__drPwWrapped) return;
    if (!isPasswordField(input)) return;
    if (!inLoginOrReg(input)) return;
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

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var showing = input.type === 'text';
      if (showing) {
        input.type = 'password';
        input.removeAttribute('data-dr-was-password');
        btn.innerHTML = EYE;
        btn.setAttribute('aria-label', 'Show password');
        btn.setAttribute('title', 'Show password');
      } else {
        input.type = 'text';
        input.setAttribute('data-dr-was-password', '1');
        btn.innerHTML = EYE_OFF;
        btn.setAttribute('aria-label', 'Hide password');
        btn.setAttribute('title', 'Hide password');
      }
      try {
        input.focus({ preventScroll: true });
        var len = (input.value || '').length;
        input.setSelectionRange(len, len);
      } catch (err) {}
    });
  }

  function scan() {
    injectCss();
    var selectors = [
      '#login-customer input[type="password"]',
      '#login-agent input[type="password"]',
      '#register-customer input[type="password"]',
      '#register-agent input[type="password"]',
      '#dr-form-reg-employee input[type="password"]',
      '#dr-form-reg-admin input[type="password"]',
      '.dr-reg-card input[type="password"]',
      '.login-card input[type="password"]',
      '#cust-password',
      '#agent-password',
      '#reg-cust-password',
      '#reg-agent-password',
      '#reg-agent-password-confirm',
      '#dr-emp-password',
      '#dr-emp-password2',
      '#dr-adm-password',
      '#dr-adm-password2'
    ];
    selectors.forEach(function (sel) {
      try {
        document.querySelectorAll(sel).forEach(wrap);
      } catch (e) {}
    });
    try {
      document.querySelectorAll('input[type="password"]').forEach(function (inp) {
        if (inLoginOrReg(inp)) wrap(inp);
      });
    } catch (e2) {}
  }

  scan();
  setTimeout(scan, 300);
  setTimeout(scan, 900);
  setTimeout(scan, 1800);
  setTimeout(scan, 3200);

  document.addEventListener(
    'click',
    function () {
      setTimeout(scan, 80);
      setTimeout(scan, 250);
    },
    true
  );

  try {
    var mo = new MutationObserver(function () {
      setTimeout(scan, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e3) {}

  window.DRPasswordToggle = { v: 1, refresh: scan };
})();
