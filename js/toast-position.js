/**
 * Divine Rays — Toast position: never overlap topbar / logout / theme toggle
 * Portal: below top bar, top-center | Login: bottom-center
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOAST_POS_V1) return;
  window.__DR_TOAST_POS_V1 = 1;

  var CSS =
    '#toast-container{' +
    'position:fixed!important;' +
    'left:50%!important;' +
    'right:auto!important;' +
    'transform:translateX(-50%)!important;' +
    'display:flex!important;' +
    'flex-direction:column!important;' +
    'align-items:center!important;' +
    'gap:0.5rem!important;' +
    'max-width:min(340px,92vw)!important;' +
    'width:max-content!important;' +
    'z-index:10050!important;' +
    'pointer-events:none!important;' +
    'top:4.75rem!important;' +
    'bottom:auto!important;' +
    '}' +
    '#toast-container .toast{' +
    'pointer-events:auto!important;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.28)!important;' +
    '}' +
    'body:has(#login-screen:not(.is-hidden):not([hidden])) #toast-container,' +
    'html:has(#login-screen:not(.is-hidden):not([hidden])) #toast-container,' +
    'body.dr-on-login #toast-container{' +
    'top:auto!important;' +
    'bottom:1.75rem!important;' +
    '}' +
    'body:has(#portal-agent.active) #toast-container,' +
    'body:has(#portal-customer.active) #toast-container{' +
    'top:5rem!important;' +
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

  function markLogin() {
    try {
      var ls = document.getElementById('login-screen');
      var onLogin = !!(ls && !ls.classList.contains('is-hidden') && !ls.hasAttribute('hidden') &&
        getComputedStyle(ls).display !== 'none');
      document.body.classList.toggle('dr-on-login', onLogin);
    } catch (e) {}
  }

  inject();
  markLogin();
  setInterval(markLogin, 800);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { inject(); markLogin(); });
  }
})();
