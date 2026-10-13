/**
 * Divine Rays — light mode login depth
 * Richer radial behind login card (matches dark-mode depth), not flat purple.
 * Does not touch dark mode or portal.
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_LOGIN_DEPTH >= 1) return;
  window.__DR_LIGHT_LOGIN_DEPTH = 1;

  var STYLE_ID = 'dr-light-login-depth';
  var LIGHT_LOGIN_BG =
    'radial-gradient(ellipse 100% 70% at 50% 42%, rgba(255,255,255,0.92) 0%, rgba(237,230,255,0.75) 28%, transparent 58%),' +
    'radial-gradient(ellipse 70% 50% at 18% 22%, rgba(196,181,253,0.55), transparent 52%),' +
    'radial-gradient(ellipse 70% 50% at 85% 78%, rgba(167,139,250,0.4), transparent 52%),' +
    'linear-gradient(165deg, #efe8ff 0%, #e0d4fc 32%, #d4c4f5 58%, #c8b4ee 82%, #bca6e6 100%)';

  function isLight() {
    try {
      return (document.documentElement.getAttribute('data-theme') || localStorage.getItem('dr_theme') || 'dark') === 'light';
    } catch (e) {
      return false;
    }
  }

  function isLogin() {
    try {
      var ls = document.getElementById('login-screen') || document.querySelector('.login-screen');
      if (ls) {
        if (ls.hidden) return false;
        var st = window.getComputedStyle(ls);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        return true;
      }
      return !!(document.body && document.body.classList.contains('is-login'));
    } catch (e) {
      return false;
    }
  }

  function apply() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (isLight() && isLogin()) {
      el.textContent = [
        'html[data-theme="light"] body.is-login,',
        'html[data-theme="light"] body:not(.is-portal){',
        'background:' + LIGHT_LOGIN_BG + '!important;',
        'background-attachment:fixed!important',
        '}',
        'html[data-theme="light"] #login-screen,',
        'html[data-theme="light"] .login-screen{',
        'background:transparent!important;',
        'background-image:none!important',
        '}'
      ].join('');
    } else {
      el.textContent = '';
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 1000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drLldT);
      window.__drLldT = setTimeout(apply, 80);
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });
  } catch (e) {}

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#btn-theme') || t.closest('[data-theme-toggle]') || t.closest('.btn-theme')) {
        setTimeout(apply, 40);
        setTimeout(apply, 250);
      }
    },
    true
  );
})();
