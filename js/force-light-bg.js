/**
 * Divine Rays — split backgrounds: login vs logged-in portal
 * Login: rich purple gradient · Portal: system field for spinning gears
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG) {
    try { delete window.__DR_FORCE_LIGHT_BG; } catch (e) {}
  }
  window.__DR_FORCE_LIGHT_BG = 1;

  var LOGIN_DARK =
    'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,106,240,0.45), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(88,60,180,0.3), transparent 50%),' +
    'radial-gradient(ellipse 50% 40% at 0% 80%, rgba(167,139,250,0.15), transparent 45%),' +
    'linear-gradient(165deg, #1a1030 0%, #15102a 35%, #0f0c1a 70%, #0c0a14 100%)';

  var LOGIN_LIGHT =
    'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,106,240,0.22), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(167,139,250,0.15), transparent 50%),' +
    'linear-gradient(165deg, #f0ebff 0%, #ebe6f8 40%, #e4dff2 100%)';

  var PORTAL_DARK =
    'radial-gradient(ellipse 80% 50% at 70% 20%, rgba(109,94,245,0.18), transparent 55%),' +
    'radial-gradient(ellipse 60% 40% at 10% 80%, rgba(91,76,224,0.12), transparent 50%),' +
    'linear-gradient(165deg, #0c0c14 0%, #12121c 45%, #0e0e18 100%)';

  var PORTAL_LIGHT =
    'radial-gradient(ellipse 80% 50% at 70% 15%, rgba(109,94,245,0.14), transparent 55%),' +
    'radial-gradient(ellipse 50% 40% at 0% 90%, rgba(167,139,250,0.1), transparent 50%),' +
    'linear-gradient(165deg, #f4f2fb 0%, #ebe8f6 50%, #e4e0f2 100%)';

  function isLight() {
    try {
      return (
        document.documentElement.getAttribute('data-theme') === 'light' ||
        localStorage.getItem('dr_theme') === 'light'
      );
    } catch (e) {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }
  }

  function loginVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return false;
    if (login.hidden || login.classList.contains('is-hidden')) return false;
    try {
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    return true;
  }

  function apply() {
    var body = document.body;
    if (!body) return;
    var light = isLight();
    var onLogin = loginVisible();
    var grad = onLogin ? (light ? LOGIN_LIGHT : LOGIN_DARK) : (light ? PORTAL_LIGHT : PORTAL_DARK);
    var solid = onLogin ? (light ? '#ebe6f8' : '#0f0c1a') : (light ? '#ebe8f6' : '#0c0c14');

    body.style.setProperty('background-color', solid, 'important');
    body.style.setProperty('background-image', grad, 'important');
    body.style.setProperty('background-attachment', 'fixed', 'important');
    body.style.setProperty('background-size', 'cover', 'important');
    document.documentElement.style.setProperty('background-color', solid, 'important');
    document.documentElement.style.setProperty('background-image', grad, 'important');

    [
      '#portal-agent',
      '#portal-agent.active',
      '#portal-customer',
      '#portal-customer.active',
      '#portal-agent .main',
      '#portal-agent main.main',
      '#portal-customer .main',
      '.app-shell'
    ].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('background-image', 'none', 'important');
      });
    });

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
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 800);
  setTimeout(apply, 2000);
  setInterval(apply, 3000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (
        t &&
        (t.id === 'btn-theme' ||
          t.id === 'dr-login-theme' ||
          (t.classList && t.classList.contains('btn-theme')) ||
          (t.closest && (t.closest('form.login-form') || t.closest('#login-screen'))))
      ) {
        setTimeout(apply, 30);
        setTimeout(apply, 200);
        setTimeout(apply, 600);
      }
    },
    true
  );

  window.DRForceLightBg = { refresh: apply };
})();
