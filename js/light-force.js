/**
 * Divine Rays — light UI helpers (NO lifeline — gears only via heartbeat-draw)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LIGHT_FORCE) {
    try { delete window.__DR_LIGHT_FORCE; } catch (e) {}
  }
  window.__DR_LIGHT_FORCE = 1;

  var CSS_ID = 'dr-light-force';

  var CSS = [
    'html[data-theme="light"] body::before,html[data-theme="light"] body::after,',
    'html body::before,html body::after{',
    'content:none!important;display:none!important;background:none!important;',
    'animation:none!important;opacity:0!important;visibility:hidden!important}',
    '#dr-lifeline .dr-line{display:none!important}',
    '#portal-agent.active{pointer-events:auto!important;position:relative;z-index:2}',
    '#portal-agent.active .sidebar,#portal-agent.active .main{pointer-events:auto!important;position:relative;z-index:3}',
    '#portal-agent button,#portal-agent .nav-btn,#portal-agent select,#portal-agent input,#portal-agent a{pointer-events:auto!important}',
    '.mode-bar{z-index:400!important;pointer-events:auto!important}',
    '#login-screen.is-hidden,#login-screen[hidden]{display:none!important;pointer-events:none!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function stripOldLifeline() {
    var box = document.getElementById('dr-lifeline');
    if (box) {
      var lines = box.querySelectorAll('.dr-line');
      lines.forEach(function (n) {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
      if (box.querySelector('.dr-line') && !box.querySelector('svg')) {
        box.innerHTML = '';
      }
    }
  }

  function tick() {
    injectCss();
    stripOldLifeline();
    if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) {
      try { window.DRHeartbeatDraw.refresh(); } catch (e) {}
    }
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setTimeout(tick, 300);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setInterval(injectCss, 8000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (t && (t.id === 'btn-theme' || (t.classList && t.classList.contains('btn-theme')))) {
        setTimeout(tick, 50);
      }
    },
    true
  );

  window.DRLightForce = { refresh: tick };
})();
