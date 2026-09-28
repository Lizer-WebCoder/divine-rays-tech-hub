/**
 * Divine Rays — login glass 20% + glow; crack + red on failed login
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_THEME) {
    try { delete window.__DR_LOGIN_THEME; } catch (e) {}
  }
  window.__DR_LOGIN_THEME = 1;

  var CSS = [
    '.login-card,#login-screen .login-card{',
    'position:relative!important;overflow:hidden!important;',
    'background:rgba(26,22,40,0.20)!important;',
    'backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;',
    'border:1px solid rgba(167,139,250,0.45)!important;',
    'box-shadow:0 0 24px rgba(139,92,246,0.55),0 0 48px rgba(124,58,237,0.35),0 12px 40px rgba(0,0,0,0.25)!important;',
    'transition:box-shadow .35s ease,border-color .35s ease!important}',

    '.login-card.login-fail-glow,#login-screen .login-card.login-fail-glow{',
    'border-color:rgba(248,113,113,0.85)!important;',
    'box-shadow:0 0 22px rgba(239,68,68,0.75),0 0 52px rgba(220,38,38,0.5),0 12px 40px rgba(0,0,0,0.3)!important;',
    'animation:drCardShake .45s ease-out}',

    '@keyframes drCardShake{',
    '0%,100%{transform:translateX(0)}',
    '20%{transform:translateX(-4px)}',
    '40%{transform:translateX(4px)}',
    '60%{transform:translateX(-3px)}',
    '80%{transform:translateX(2px)}}',

    '.login-card .dr-crack-overlay{',
    'position:absolute;inset:0;z-index:20;pointer-events:none;',
    'opacity:0;transition:opacity .2s ease;border-radius:inherit;overflow:hidden}',
    '.login-card.login-fail-glow .dr-crack-overlay{opacity:1}',
    '.login-card .dr-crack-overlay svg{width:100%;height:100%;display:block}',
    '.login-card .dr-crack-overlay path{',
    'stroke:rgba(255,200,200,0.9);stroke-width:1.4;fill:none;',
    'stroke-linecap:round;stroke-linejoin:round;',
    'filter:drop-shadow(0 0 3px rgba(239,68,68,0.8))}',

    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:radial-gradient(ellipse 90% 60% at 50% -10%,rgba(109,94,245,0.16),transparent 55%),',
    'radial-gradient(ellipse 50% 40% at 100% 100%,rgba(167,139,250,0.12),transparent 50%),',
    'linear-gradient(165deg,#f6f4fc 0%,#efeaf8 45%,#e8e2f5 100%)!important}',

    'html[data-theme="light"] .login-card,html[data-theme="light"] #login-screen .login-card{',
    'background:rgba(255,255,255,0.22)!important;',
    'backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;',
    'border:1px solid rgba(109,94,245,0.55)!important;',
    'box-shadow:0 0 28px rgba(109,94,245,0.7),0 0 56px rgba(139,92,246,0.45),0 0 80px rgba(124,58,237,0.25),0 10px 32px rgba(91,76,224,0.15)!important;',
    'color:#1a1a2e!important}',

    'html[data-theme="light"] .login-card.login-fail-glow,html[data-theme="light"] #login-screen .login-card.login-fail-glow{',
    'border-color:rgba(239,68,68,0.85)!important;',
    'box-shadow:0 0 26px rgba(239,68,68,0.75),0 0 56px rgba(220,38,38,0.5),0 10px 32px rgba(185,28,28,0.15)!important}',

    'html[data-theme="light"] .login-card .dr-crack-overlay path{',
    'stroke:rgba(185,28,28,0.85);filter:drop-shadow(0 0 2px rgba(239,68,68,0.7))}',

    'html[data-theme="light"] .login-brand h1{color:#1a1a2e!important}',
    'html[data-theme="light"] .login-brand p,',
    'html[data-theme="light"] .login-footer,',
    'html[data-theme="light"] .login-card .muted{color:#5a5a78!important}',

    'html[data-theme="light"] .login-tabs{',
    'background:rgba(240,236,255,0.9)!important;',
    'border:1px solid rgba(124,106,240,0.18)!important;',
    'border-radius:999px!important;padding:3px!important}',
    'html[data-theme="light"] .ltab{',
    'color:#4a4a66!important;background:transparent!important;border:none!important;',
    'border-radius:999px!important;font-weight:600!important}',
    'html[data-theme="light"] .ltab.active{',
    'background:#6d5ef5!important;color:#fff!important;',
    'box-shadow:0 4px 14px rgba(109,94,245,0.35)!important}',

    'html[data-theme="light"] .login-form label,',
    'html[data-theme="light"] #login-screen .form-group label{',
    'color:#3d3d55!important;font-weight:600!important}',
    'html[data-theme="light"] .login-form input,',
    'html[data-theme="light"] .login-form select,',
    'html[data-theme="light"] #login-screen input,',
    'html[data-theme="light"] #login-screen select{',
    'background:#fff!important;color:#1a1a2e!important;',
    'border:1px solid rgba(124,106,240,0.28)!important;',
    'box-shadow:0 1px 2px rgba(30,30,60,0.04)!important}',
    'html[data-theme="light"] .login-form input:focus,',
    'html[data-theme="light"] #login-screen input:focus{',
    'border-color:#6d5ef5!important;',
    'box-shadow:0 0 0 3px rgba(109,94,245,0.22)!important;outline:none!important}',

    'html[data-theme="light"] .btn-primary,',
    'html[data-theme="light"] #login-screen .btn-primary,',
    'html[data-theme="light"] button[type="submit"]{',
    'background:linear-gradient(135deg,#6d5ef5,#8b7cf8)!important;',
    'color:#fff!important;border:none!important;',
    'box-shadow:0 6px 18px rgba(91,76,224,0.35)!important;',
    'font-weight:600!important}',

    'html[data-theme="light"] .login-switch,',
    'html[data-theme="light"] .login-switch a{color:#5b4fd4!important}',
    'html[data-theme="light"] .login-error{',
    'background:rgba(248,113,113,0.12)!important;border-color:rgba(248,113,113,0.35)!important}',
    'html[data-theme="light"] hr,html[data-theme="light"] .login-card hr{',
    'border-color:rgba(124,106,240,0.18)!important}',

    '#dr-login-theme{',
    'position:fixed;top:1rem;right:1rem;z-index:9999;',
    'background:#1a1628;color:#c4b5fd;border:1px solid #5b4fd4;border-radius:999px;',
    'padding:.5rem 1rem;font-size:.85rem;font-weight:600;cursor:pointer;',
    'font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.25)}',
    'html[data-theme="light"] #dr-login-theme{',
    'background:#fff;color:#4c3fd4;border-color:#c4b5fd;',
    'box-shadow:0 4px 16px rgba(30,30,60,.1)}',

    '#login-screen,.login-screen{position:relative;z-index:2}',
    '#login-screen .login-card,.login-card{position:relative;z-index:3}'
  ].join('');

  var CRACK_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M200 0 L185 90 L210 140 L175 220 L230 280 L160 360 L205 430 L190 560"/>' +
    '<path d="M185 90 L90 70 L40 120"/>' +
    '<path d="M185 90 L280 50 L340 100"/>' +
    '<path d="M210 140 L300 160 L360 130"/>' +
    '<path d="M175 220 L80 200 L30 260"/>' +
    '<path d="M175 220 L250 240 L320 210"/>' +
    '<path d="M230 280 L310 300 L370 270"/>' +
    '<path d="M230 280 L140 310 L70 290"/>' +
    '<path d="M160 360 L90 380 L50 440"/>' +
    '<path d="M160 360 L240 380 L300 360"/>' +
    '<path d="M205 430 L280 450 L350 420"/>' +
    '<path d="M205 430 L120 470 L60 500"/>' +
    '</svg>';

  function injectCss() {
    var el = document.getElementById('dr-login-theme-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-theme-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function ensureCrackOverlay(card) {
    if (!card) return;
    var ov = card.querySelector('.dr-crack-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'dr-crack-overlay';
      ov.setAttribute('aria-hidden', 'true');
      ov.innerHTML = CRACK_SVG;
      card.appendChild(ov);
    }
  }

  function isLoginVisible() {
    var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
    if (!login) return false;
    if (login.hidden || login.classList.contains('is-hidden')) return false;
    try {
      var st = window.getComputedStyle(login);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    var pa = document.getElementById('portal-agent');
    var pc = document.getElementById('portal-customer');
    if (pa && pa.classList.contains('active')) return false;
    if (pc && pc.classList.contains('active')) return false;
    return true;
  }

  function removeLoginToggle() {
    var lt = document.getElementById('dr-login-theme');
    if (lt && lt.parentNode) lt.parentNode.removeChild(lt);
  }

  function ensureLoginToggle() {
    if (!isLoginVisible()) {
      removeLoginToggle();
      return;
    }
    var btn = document.getElementById('dr-login-theme');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'dr-login-theme';
      btn.type = 'button';
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = cur === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('dr_theme', next); } catch (e) {}
        btn.textContent = next === 'light' ? 'Dark' : 'Light';
        if (window.DRForceLightBg && window.DRForceLightBg.refresh) try { window.DRForceLightBg.refresh(); } catch (e) {}
        if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) try { window.DRHeartbeatDraw.refresh(); } catch (e) {}
      });
      document.body.appendChild(btn);
    }
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.textContent = theme === 'light' ? 'Dark' : 'Light';
  }

  function syncFailGlow() {
    var card = document.querySelector('#login-screen .login-card, .login-card');
    if (!card) return;
    ensureCrackOverlay(card);
    var hasErr = !!document.querySelector(
      '#login-screen .login-error, .login-form .login-error, .login-card .login-error'
    );
    var was = card.classList.contains('login-fail-glow');
    card.classList.toggle('login-fail-glow', hasErr);
    if (hasErr && !was) {
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = '';
    }
  }

  function watchLoginErrors() {
    var root = document.getElementById('login-screen') || document.body;
    if (!root || root.__drFailGlowObs) return;
    try {
      var obs = new MutationObserver(function () { syncFailGlow(); });
      obs.observe(root, { childList: true, subtree: true, characterData: true });
      root.__drFailGlowObs = obs;
    } catch (e) {}
    document.addEventListener('submit', function () {
      setTimeout(syncFailGlow, 50);
      setTimeout(syncFailGlow, 300);
      setTimeout(syncFailGlow, 800);
      setTimeout(syncFailGlow, 1500);
    }, true);
    document.addEventListener('input', function (ev) {
      var t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT') && t.closest && t.closest('.login-card')) {
        var err = document.querySelector('.login-card .login-error');
        if (!err) syncFailGlow();
      }
    }, true);
    setInterval(syncFailGlow, 1500);
    syncFailGlow();
  }

  function refresh() {
    injectCss();
    ensureLoginToggle();
    syncFailGlow();
  }

  injectCss();
  ensureLoginToggle();
  watchLoginErrors();
  setTimeout(refresh, 200);
  setTimeout(refresh, 800);
  setTimeout(refresh, 2000);
  setInterval(function () {
    if (isLoginVisible()) ensureLoginToggle();
    else removeLoginToggle();
    syncFailGlow();
  }, 3000);

  window.DRLoginTheme = {
    refresh: refresh,
    removeLoginToggle: removeLoginToggle
  };
})();
