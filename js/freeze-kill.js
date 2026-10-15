/**
 * Divine Rays — freeze-kill v2
 * Static ambient on type; never re-draw ECG if already present.
 */
(function () {
  'use strict';
  if (window.__DR_FREEZE_KILL >= 2) return;
  window.__DR_FREEZE_KILL = 2;

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

  function killEcgTimersOnly() {
    try {
      if (window.__DR_ECG_INTERVAL) {
        clearInterval(window.__DR_ECG_INTERVAL);
        window.__DR_ECG_INTERVAL = null;
      }
      if (window.__DR_ECG_TIMER) {
        clearTimeout(window.__DR_ECG_TIMER);
        window.__DR_ECG_TIMER = null;
      }
    } catch (e) {}
  }

  function onType() {
    window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
    killEcgTimersOnly();
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
    try {
      if (document.querySelector('#dr-lifeline .dr-ecg-core')) {
        window.__DR_ECG_DRAWN = 1;
        return;
      }
      if (window.__DR_HEARTBEAT_DRAW >= 31) return;
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@ee55f47e2ee25c39f696dff993dd30147d9b6398/js/heartbeat-draw.js?b=' + Date.now();
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }, 1800);
})();
