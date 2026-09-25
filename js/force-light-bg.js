/**
 * Divine Rays — force gray-purple gradient on light mode (inline)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FORCE_LIGHT_BG) return;
  window.__DR_FORCE_LIGHT_BG = 1;

  var GRAD =
    'linear-gradient(165deg, #d8d4e8 0%, #c4bfd8 35%, #b0a8cc 65%, #9e96be 100%)';

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
    var light = isLight();
    var body = document.body;
    if (!body) return;

    if (light) {
      body.style.setProperty('background-color', '#c8c4d8', 'important');
      body.style.setProperty('background-image', GRAD, 'important');
      body.style.setProperty('background-attachment', 'fixed', 'important');
      body.style.setProperty('background-size', 'cover', 'important');
      document.documentElement.style.setProperty('background-color', '#c8c4d8', 'important');
      document.documentElement.style.setProperty('background-image', GRAD, 'important');

      [
        '#portal-agent',
        '#portal-agent.active',
        '#portal-customer',
        '#portal-customer.active',
        '#portal-agent .main',
        '#portal-agent main.main',
        '.app-shell'
      ].forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          el.style.setProperty('background-color', 'transparent', 'important');
          el.style.setProperty('background-image', 'none', 'important');
        });
      });
    } else {
      body.style.removeProperty('background-color');
      body.style.removeProperty('background-image');
      body.style.removeProperty('background-attachment');
      body.style.removeProperty('background-size');
      document.documentElement.style.removeProperty('background-color');
      document.documentElement.style.removeProperty('background-image');
    }
  }

  apply();
  setTimeout(apply, 200);
  setTimeout(apply, 800);
  setTimeout(apply, 2000);
  setInterval(apply, 4000);

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
