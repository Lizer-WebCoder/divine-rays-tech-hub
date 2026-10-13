/**
 * Divine Rays — light mode login depth v2
 * Darker gradient only behind the login card; outer area stays even color.
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_LOGIN_DEPTH >= 2) return;
  window.__DR_LIGHT_LOGIN_DEPTH = 2;

  var STYLE_ID = 'dr-light-login-depth';
  var LIGHT_LOGIN_BG =
    'radial-gradient(ellipse 48% 42% at 50% 48%, rgba(95,70,150,0.38) 0%, rgba(120,95,175,0.22) 42%, transparent 72%),' +
    'linear-gradient(180deg, #dcd0f5 0%, #d4c6f0 40%, #cec0ec 70%, #c8bae8 100%)';

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
