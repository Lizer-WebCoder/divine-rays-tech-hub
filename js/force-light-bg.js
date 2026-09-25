/**
 * Divine Rays — unified teal field for light + dark
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG) {
    try { delete window.__DR_FORCE_LIGHT_BG; } catch (e) {}
  }
  window.__DR_FORCE_LIGHT_BG = 1;

  var BG =
    'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(40,90,70,0.35), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(30,70,55,0.25), transparent 50%),' +
    'linear-gradient(165deg, #0f1a16 0%, #12201b 40%, #0c1412 100%)';

  var BG_LIGHT =
    'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(40,90,70,0.2), transparent 55%),' +
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(30,70,55,0.12), transparent 50%),' +
    'linear-gradient(165deg, #e8f0ec 0%, #dce8e2 40%, #d0ddd6 100%)';

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
    var solid = light ? '#dce8e2' : '#0f1a16';

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
