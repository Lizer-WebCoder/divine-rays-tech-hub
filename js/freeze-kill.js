/**
 * Divine Rays — freeze-kill v1
 * Stops main-thread jank on login inputs: kill ECG timers, static ambient.
 */
(function () {
  'use strict';
  if (window.__DR_FREEZE_KILL >= 1) return;
  window.__DR_FREEZE_KILL = 1;

  function isLoginInput(el) {
    if (!el || !el.closest) return false;
    if (!el.closest('#login-screen, #login-agent, form.login-form, .login-card')) return false;
    var tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  function staticAmbient() {
    try {
      var amb = document.getElementById('dr-login-ambient');
      if (!amb || amb.getAttribute('data-dr-static') === '1') return;
      amb.setAttribute('data-dr-static', '1');
      var nodes = amb.querySelectorAll('*');
      for (var i = 0; i < nodes.length; i++) {
        try {
          nodes[i].style.setProperty('animation', 'none', 'important');
          nodes[i].style.setProperty('transition', 'none', 'important');
        } catch (e) {}
      }
    } catch (e2) {}
  }

  function killEcg() {
    try {
      if (window.__DR_ECG_INTERVAL) {
        clearInterval(window.__DR_ECG_INTERVAL);
        window.__DR_ECG_INTERVAL = null;
      }
      if (window.__DR_ECG_TIMER) {
        clearTimeout(window.__DR_ECG_TIMER);
        window.__DR_ECG_TIMER = null;
      }
      if (window.DRHeartbeatDraw) {
        window.DRHeartbeatDraw.refresh = function () {};
        window.DRHeartbeatDraw.force = function () {};
      }
    } catch (e) {}
  }

  function onType() {
    window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
    killEcg();
    staticAmbient();
  }

  document.addEventListener('focusin', function (ev) {
    if (isLoginInput(ev.target)) onType();
  }, true);
  document.addEventListener('pointerdown', function (ev) {
    if (isLoginInput(ev.target)) onType();
  }, true);

  var n = 0;
  var iv = setInterval(function () {
    staticAmbient();
    if (document.getElementById('dr-login-ambient') || ++n > 40) clearInterval(iv);
  }, 250);

  setTimeout(function () {
    if (window.__DR_HEARTBEAT_DRAW >= 31) return;
    try {
      killEcg();
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@ee55f47e2ee25c39f696dff993dd30147d9b6398/js/heartbeat-draw.js?b=' + Date.now();
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }, 1500);
})();
