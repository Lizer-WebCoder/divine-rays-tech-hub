/**
 * Divine Rays — larger nearer honeycomb (pointy-top regular mesh)
 * Quiet: 30s interval, mode-bar padding set once (was 5s flicker)
 * Login + agent/admin + end-user portal · Credit: Boyz at the Back LRK
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG >= 2) return;
  window.__DR_FORCE_LIGHT_BG = 2;

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
        var st = window.getComputedStyle(ls);
        if (st.display === 'none' || ls.hidden) return false;
        return true;
      }
      return document.body && document.body.classList.contains('is-login');
    } catch (e) {
      return false;
    }
  }

  function injectThemeCss() {
    if (document.getElementById('dr-force-light-theme-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-force-light-theme-css';
    el.textContent = [
      'html[data-theme="light"] body,html[data-theme="light"] #app-shell{background:#f4f6fb!important}',
      'body.is-portal #portal-agent .mode-bar, body.is-portal .mode-bar{',
      'position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:1000!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function injectAmbientCss(light) {
    var id = 'dr-force-light-ambient-css';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = light
      ? 'body.is-portal{background:#f4f6fb!important}'
      : 'body.is-portal{background:#0c0c14!important}';
  }

  function ensureAmbient() {}

  function apply() {
    var light = isLight();
    var onLogin = isLogin();
    var solid = light ? '#f4f6fb' : '#0c0c14';
    var grad = light
      ? 'linear-gradient(160deg,#f8f9fc 0%,#eef1f8 50%,#f4f6fb 100%)'
      : 'linear-gradient(160deg,#0c0c14 0%,#12121c 50%,#0c0c14 100%)';

    document.querySelectorAll('#login-screen, .login-screen').forEach(function (el) {
      if (onLogin) {
        el.style.setProperty('background-color', solid, 'important');
        el.style.setProperty('background-image', grad, 'important');
        el.style.setProperty('background-attachment', 'fixed', 'important');
        el.style.setProperty('background-size', 'cover', 'important');
      } else {
        el.style.setProperty('background', 'transparent', 'important');
      }
    });

    injectThemeCss();
    injectAmbientCss(light);
    ensureAmbient();

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
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 800);
  setTimeout(apply, 2000);
  setInterval(apply, 30000);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drFlbT);
      window.__drFlbT = setTimeout(apply, 600);
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
      if (t.closest('#theme-toggle') || t.closest('[data-theme-toggle]')) {
        setTimeout(apply, 50);
        setTimeout(apply, 300);
      }
    },
    true
  );

  window.DRForceLightBg = { refresh: apply };
})();
