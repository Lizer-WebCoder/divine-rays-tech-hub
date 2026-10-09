/**
 * Divine Rays — Toast position V2: top-right, below top bar / theme toggle
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOAST_POS_V2) return;
  window.__DR_TOAST_POS_V2 = 1;
  window.__DR_TOAST_POS_V1 = 1;

  var CSS =
    '#toast-container{' +
    'position:fixed!important;' +
    'top:4.5rem!important;' +
    'right:1rem!important;' +
    'left:auto!important;' +
    'bottom:auto!important;' +
    'transform:none!important;' +
    'display:flex!important;' +
    'flex-direction:column!important;' +
    'align-items:flex-end!important;' +
    'gap:0.5rem!important;' +
    'max-width:min(340px,92vw)!important;' +
    'width:max-content!important;' +
    'z-index:10050!important;' +
    'pointer-events:none!important;' +
    '}' +
    '#toast-container .toast{' +
    'pointer-events:auto!important;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.28)!important;' +
    '}' +
    /* Login: still top-right, just under theme toggle */
    'body:has(#login-screen:not(.is-hidden):not([hidden])) #toast-container,' +
    'html:has(#login-screen:not(.is-hidden):not([hidden])) #toast-container,' +
    'body.dr-on-login #toast-container{' +
    'top:3.75rem!important;' +
    'right:1rem!important;' +
    'left:auto!important;' +
    'bottom:auto!important;' +
    'transform:none!important;' +
    '}' +
    /* Portals: clear Profile / Logout row */
    'body:has(#portal-agent.active) #toast-container,' +
    'body:has(#portal-customer.active) #toast-container,' +
    'body.dr-in-portal #toast-container{' +
    'top:4.75rem!important;' +
    'right:1rem!important;' +
    'left:auto!important;' +
    'bottom:auto!important;' +
    '}';

  function inject() {
    var el = document.getElementById('dr-toast-pos-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-toast-pos-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function mark() {
    try {
      var ls = document.getElementById('login-screen');
      var onLogin = !!(ls && !ls.classList.contains('is-hidden') && !ls.hasAttribute('hidden') &&
        getComputedStyle(ls).display !== 'none');
      document.body.classList.toggle('dr-on-login', onLogin);
      var inPortal = !!(!onLogin && (
        document.getElementById('portal-agent') ||
        document.getElementById('portal-customer')
      ));
      document.body.classList.toggle('dr-in-portal', inPortal && !onLogin);
    } catch (e) {}
  }

  inject();
  mark();
  setInterval(mark, 800);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { inject(); mark(); });
  }
})();
