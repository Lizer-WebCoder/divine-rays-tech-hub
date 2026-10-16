/**
 * Divine Rays — login-perf v2
 * Neon ECG glow + pause animations while typing.
 * Does NOT hide ambient — that changed the background on Email/Password focus.
 * Wires switchLoginTab for Admin/Employee.
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_PERF >= 2) return;
  window.__DR_LOGIN_PERF = 2;

  try {
    var st = document.createElement('style');
    st.id = 'dr-ecg-glow-boost';
    st.textContent = [
      '#dr-lifeline .dr-ecg-glow{',
      'stroke-width:4.8px!important;opacity:0.9!important;',
      'filter:url(#drEcgBlur) drop-shadow(0 0 4px rgba(196,181,253,0.95)) drop-shadow(0 0 12px rgba(167,139,250,0.75)) drop-shadow(0 0 22px rgba(139,92,246,0.45))!important',
      '}',
      '#dr-lifeline .dr-ecg-core{',
      'stroke-width:2.8px!important;opacity:1!important;',
      'filter:drop-shadow(0 0 3px rgba(243,232,255,0.9)) drop-shadow(0 0 8px rgba(196,181,253,0.55))!important',
      '}',
      '#dr-lifeline svg{overflow:visible!important}',
      '#dr-login-ambient{pointer-events:none!important;z-index:0!important}',
      'body.dr-typing #dr-login-ambient,body.dr-typing #dr-login-ambient *{',
      'animation-play-state:paused!important',
      '}',
      'body.dr-typing #dr-login-ambient{content-visibility:visible!important;visibility:visible!important;opacity:1!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  } catch (eCss) {}

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
      try {
        if (window.__DR_ECG_INTERVAL) {
          clearInterval(window.__DR_ECG_INTERVAL);
          window.__DR_ECG_INTERVAL = null;
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

  function wireTabs() {
    if (typeof window.switchLoginTab !== 'function') {
      window.switchLoginTab = function (tab) {
        try {
          if (typeof window.showForm === 'function') {
            window.showForm(tab === 'agent' ? 'login-agent' : 'login-customer');
          } else {
            document.querySelectorAll('.login-form').forEach(function (f) {
              f.classList.remove('active');
            });
            var id = tab === 'agent' ? 'login-agent' : 'login-customer';
            var f = document.getElementById(id);
            if (f) f.classList.add('active');
            document.querySelectorAll('.ltab').forEach(function (b) {
              b.classList.toggle('active', b.getAttribute('data-ltab') === tab);
            });
          }
        } catch (e) {}
      };
    }
    document.querySelectorAll('.ltab').forEach(function (btn) {
      if (btn.__drTabWired) return;
      btn.__drTabWired = 1;
      btn.addEventListener(
        'click',
        function (ev) {
          var tab =
            btn.getAttribute('data-ltab') ||
            (/(admin|agent)/i.test(btn.textContent || '') ? 'agent' : 'customer');
          ev.preventDefault();
          window.switchLoginTab(tab);
        },
        true
      );
    });
  }
  wireTabs();
  setTimeout(wireTabs, 200);
  setTimeout(wireTabs, 800);

  window.DRLoginPerf = { v: 2 };
})();
