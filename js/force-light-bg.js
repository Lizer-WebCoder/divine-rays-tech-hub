/**
 * Divine Rays — force-light-bg v3
 * No 30s interval (was causing black/white flash).
 * Login stays transparent so lifeline shows.
 * Credit: Boyz at the Back LRK
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG >= 3) return;
  window.__DR_FORCE_LIGHT_BG = 3;

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
      return document.body && document.body.classList.contains('is-login');
    } catch (e) {
      return false;
    }
  }

  function injectCss() {
    var id = 'dr-force-light-theme-css';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.is-portal{background:#0c0c14!important}',
      'html[data-theme="light"] body.is-portal,',
      'html[data-theme="light"] body.is-portal #app-shell{background:#f4f6fb!important}',
      'body.is-login,',
      '#login-screen,.login-screen{',
      '  background:transparent!important;',
      '  background-color:transparent!important;',
      '  background-image:none!important',
      '}',
      'body.is-portal #portal-agent .mode-bar, body.is-portal .mode-bar{',
      '  position:fixed!important;top:0!important;left:0!important;right:0!important;',
      '  width:100%!important;z-index:1000!important',
      '}'
    ].join('');
  }

  function clearLoginInlineBg() {
    try {
      document.querySelectorAll('#login-screen, .login-screen').forEach(function (el) {
        el.style.removeProperty('background');
        el.style.removeProperty('background-color');
        el.style.removeProperty('background-image');
        el.style.setProperty('background', 'transparent', 'important');
      });
    } catch (e) {}
  }

  function padModeBar() {
    try {
      document.querySelectorAll('.mode-bar').forEach(function (bar) {
        if (bar.style.position !== 'fixed') {
          bar.style.setProperty('position', 'fixed', 'important');
          bar.style.setProperty('top', '0', 'important');
          bar.style.setProperty('left', '0', 'important');
          bar.style.setProperty('right', '0', 'important');
          bar.style.setProperty('width', '100%', 'important');
          bar.style.setProperty('z-index', '1000', 'important');
        }
        var shell = document.getElementById('app-shell');
        if (shell && !shell.getAttribute('data-dr-pad-set')) {
          shell.style.setProperty('padding-top', Math.max(bar.offsetHeight || 52, 44) + 'px', 'important');
          shell.setAttribute('data-dr-pad-set', '1');
        }
      });
    } catch (e) {}
  }

  function apply() {
    injectCss();
    if (isLogin()) clearLoginInlineBg();
    padModeBar();
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 1000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drFlbT);
      window.__drFlbT = setTimeout(apply, 200);
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
      if (t.closest('#theme-toggle') || t.closest('[data-theme-toggle]') || t.closest('#btn-theme') || t.closest('.btn-theme')) {
        setTimeout(apply, 50);
        setTimeout(apply, 300);
      }
    },
    true
  );

  window.DRForceLightBg = { refresh: apply };
})();
