/**
 * Divine Rays — unified purple field for light + dark
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG) {
    try { delete window.__DR_FORCE_LIGHT_BG; } catch (e) {}
  }
  window.__DR_FORCE_LIGHT_BG = 1;

  var BG =
    'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,106,240,0.45), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(88,60,180,0.3), transparent 50%),' +
    'radial-gradient(ellipse 50% 40% at 0% 80%, rgba(167,139,250,0.15), transparent 45%),' +
    'linear-gradient(165deg, #1a1030 0%, #15102a 35%, #0f0c1a 70%, #0c0a14 100%)';

  var BG_LIGHT =
    'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,106,240,0.22), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(167,139,250,0.15), transparent 50%),' +
    'linear-gradient(165deg, #f0ebff 0%, #ebe6f8 40%, #e4dff2 100%)';

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

  function apply() {
    var body = document.body;
    if (!body) return;
    var light = isLight();
    var grad = light ? BG_LIGHT : BG;
    var solid = light ? '#ebe6f8' : '#0f0c1a';

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
      '.app-shell',
      '#login-screen'
    ].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('background-image', 'none', 'important');
      });
    });
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 800);
  setTimeout(apply, 2000);
  setInterval(apply, 5000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(apply, 30);
        setTimeout(apply, 200);
      }
    },
    true
  );

  window.DRForceLightBg = { refresh: apply };
})();
