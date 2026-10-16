/**
 * Divine Rays — keep ambient motion always on
 * Particles, dash lines, ECG never pause on login focus
 * Hide portal switcher while on login screen
 */
(function () {
  'use strict';
  if (window.__DR_AMBIENT_NO_PAUSE >= 1) return;
  window.__DR_AMBIENT_NO_PAUSE = 1;

  var CSS_ID = 'dr-ambient-no-pause-css';

  function injectCss() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = [
      'body.dr-typing #dr-login-ambient,',
      'body.dr-typing #dr-login-ambient *,',
      'body.dr-typing #dr-login-ambient .dr-star,',
      'body.dr-typing #dr-login-ambient .dr-honeycomb,',
      'body.dr-typing #dr-login-ambient .dr-network,',
      'body.dr-typing #dr-login-ambient svg,',
      'body.dr-typing #dr-login-ambient path,',
      'body.dr-typing #dr-login-ambient circle,',
      '#dr-login-ambient, #dr-login-ambient * {',
      'animation-play-state:running!important;',
      '-webkit-animation-play-state:running!important',
      '}',
      'body.dr-typing #dr-lifeline,',
      'body.dr-typing #dr-lifeline *,',
      '#dr-lifeline, #dr-lifeline * {',
      'animation-play-state:running!important;',
      '-webkit-animation-play-state:running!important',
      '}',
      'body:not(.dr-portal-ok):not(.is-portal) #dr-dev-portal-switch,',
      'body.is-login #dr-dev-portal-switch {',
      'display:none!important',
      '}'
    ].join('');
  }

  function stripTypingPause() {
    try { document.body.classList.remove('dr-typing'); } catch (e) {}
    window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
    window.__DR_TYPING = 0;
  }

  function hideSwitcherOnLogin() {
    try {
      var ls = document.getElementById('login-screen');
      var onLogin =
        document.body.classList.contains('is-login') ||
        (!document.body.classList.contains('dr-portal-ok') &&
          !document.body.classList.contains('is-portal')) ||
        (ls && !ls.hidden && ls.style.display !== 'none');
      var sw = document.getElementById('dr-dev-portal-switch');
      if (!sw) return;
      if (onLogin && !document.body.classList.contains('dr-portal-ok')) {
        sw.classList.remove('is-on');
        sw.style.display = 'none';
      } else if (document.body.classList.contains('dr-portal-ok') || document.body.classList.contains('is-portal')) {
        if (sw.style.display === 'none') sw.style.removeProperty('display');
      }
    } catch (e) {}
  }

  function neutralizePerfPause() {
    try {
      if (!document.body.__drTypingGuard) {
        document.body.__drTypingGuard = 1;
        var origAdd = document.body.classList.add.bind(document.body.classList);
        document.body.classList.add = function () {
          var args = Array.prototype.slice.call(arguments).filter(function (c) {
            return c !== 'dr-typing';
          });
          if (!args.length) return;
          return origAdd.apply(document.body.classList, args);
        };
      }
    } catch (e) {}
  }

  function guardEcg() {
    try {
      if (window.__DR_PAUSE_LOGIN_SCRIPTS) window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
      if (window.DRHeartbeat && typeof window.DRHeartbeat.ensure === 'function') {
        window.DRHeartbeat.ensure();
      }
    } catch (e) {}
  }

  document.addEventListener(
    'focusin',
    function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (!t.closest('#login-screen, .login-card, #login-agent, #login-customer')) return;
      setTimeout(function () {
        stripTypingPause();
        injectCss();
        guardEcg();
      }, 0);
      setTimeout(stripTypingPause, 50);
    },
    true
  );

  document.addEventListener('focusout', function () { stripTypingPause(); }, true);

  function tick() {
    injectCss();
    neutralizePerfPause();
    stripTypingPause();
    hideSwitcherOnLogin();
    guardEcg();
  }

  tick();
  setTimeout(tick, 300);
  setTimeout(tick, 1000);
  setTimeout(tick, 2000);
  setInterval(function () {
    hideSwitcherOnLogin();
    try {
      var ls = document.getElementById('login-screen');
      if (ls && !ls.hidden) stripTypingPause();
    } catch (e) {}
  }, 1000);

  window.DRAmbientNoPause = { v: 1, refresh: tick };
})();
