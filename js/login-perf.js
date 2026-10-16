/**
 * Divine Rays — login-perf v1
 * 1) Password freeze: content-visibility hide ambient while typing; freeze animations
 * 2) Stronger ECG neon glow
 * 3) Block old force-light 0962 that rebuilds ambient
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_PERF >= 1) return;
  window.__DR_LOGIN_PERF = 1;

  var BAD_SRC = [
    '0962f5535b86b390f60be2a3435a2e0500a18cb7',
    '94e50c1b33158e9209a9f551eae599753a3ce75f',
    '80f8a73413ed5698b24c61856ddc5a1569714ac0'
  ];

  function isBad(src) {
    if (!src) return false;
    for (var i = 0; i < BAD_SRC.length; i++) {
      if (String(src).indexOf(BAD_SRC[i]) !== -1) return true;
    }
    return false;
  }

  try {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var nodes = muts[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n && n.tagName === 'SCRIPT' && isBad(n.src || '')) {
            try {
              n.type = 'text/plain';
              n.removeAttribute('src');
              if (n.parentNode) n.parentNode.removeChild(n);
            } catch (e) {}
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (eObs) {}

  try {
    var st = document.createElement('style');
    st.id = 'dr-ecg-glow-boost';
    st.textContent = [
      '#dr-lifeline .dr-ecg-glow{',
      'stroke-width:4.8px!important;',
      'opacity:0.9!important;',
      'filter:url(#drEcgBlur) drop-shadow(0 0 4px rgba(196,181,253,0.95)) drop-shadow(0 0 12px rgba(167,139,250,0.75)) drop-shadow(0 0 22px rgba(139,92,246,0.45))!important',
      '}',
      '#dr-lifeline .dr-ecg-core{',
      'stroke-width:2.8px!important;',
      'opacity:1!important;',
      'filter:drop-shadow(0 0 3px rgba(243,232,255,0.9)) drop-shadow(0 0 8px rgba(196,181,253,0.55))!important',
      '}',
      '#dr-lifeline svg{overflow:visible!important}',
      'body.dr-typing #dr-login-ambient{',
      'content-visibility:hidden!important;',
      'pointer-events:none!important',
      '}',
      '#dr-login-ambient{',
      'contain:strict!important;',
      'pointer-events:none!important',
      '}',
      '#dr-login-ambient *{',
      'animation-play-state:paused!important',
      '}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  } catch (eCss) {}

  function simplifyAmbient() {
    try {
      var amb = document.getElementById('dr-login-ambient');
      if (!amb || amb.getAttribute('data-dr-simplified') === '1') return;
      amb.setAttribute('data-dr-simplified', '1');
      amb.setAttribute('data-dr-frozen', '1');
      try {
        if (window.DRForceLightBg) {
          window.DRForceLightBg.refresh = function () {};
          window.DRForceLightBg.apply = function () {};
        }
      } catch (e2) {}
    } catch (e3) {}
  }

  function isLoginInput(el) {
    if (!el || !el.closest) return false;
    if (!el.closest('#login-screen, #login-agent, form.login-form, .login-card')) return false;
    var tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA';
  }

  document.addEventListener(
    'focusin',
    function (ev) {
      if (!isLoginInput(ev.target)) return;
      window.__DR_PAUSE_LOGIN_SCRIPTS = 1;
      try {
        document.body.classList.add('dr-typing');
      } catch (e) {}
      simplifyAmbient();
      try {
        if (window.__DR_ECG_INTERVAL) {
          clearInterval(window.__DR_ECG_INTERVAL);
          window.__DR_ECG_INTERVAL = null;
        }
        if (window.__DR_ECG_TIMER) {
          clearTimeout(window.__DR_ECG_TIMER);
          window.__DR_ECG_TIMER = null;
        }
      } catch (e2) {}
    },
    true
  );

  document.addEventListener(
    'focusout',
    function (ev) {
      if (!isLoginInput(ev.target)) return;
      setTimeout(function () {
        if (!isLoginInput(document.activeElement)) {
          window.__DR_PAUSE_LOGIN_SCRIPTS = 0;
          try {
            document.body.classList.remove('dr-typing');
          } catch (e) {}
        }
      }, 150);
    },
    true
  );

  var n = 0;
  var iv = setInterval(function () {
    simplifyAmbient();
    if (
      document.getElementById('dr-login-ambient') &&
      document.getElementById('dr-login-ambient').getAttribute('data-dr-simplified') === '1'
    ) {
      clearInterval(iv);
    } else if (++n > 50) clearInterval(iv);
  }, 200);

  window.DRLoginPerf = { v: 1, simplifyAmbient: simplifyAmbient };
})();
