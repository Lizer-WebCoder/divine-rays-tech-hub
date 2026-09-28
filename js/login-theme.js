/**
 * Divine Rays — login glass 20% + glow; realistic crack on fail (heals after 3s)
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
    'transition:box-shadow .5s ease,border-color .5s ease!important}',

    '.login-card.login-fail-glow,#login-screen .login-card.login-fail-glow{',
    'border-color:rgba(248,113,113,0.9)!important;',
    'box-shadow:0 0 22px rgba(239,68,68,0.8),0 0 52px rgba(220,38,38,0.55),0 12px 40px rgba(0,0,0,0.3)!important;',
    'animation:drCardShake .5s ease-out}',

    '.login-card.login-fail-healing,#login-screen .login-card.login-fail-healing{',
    'border-color:rgba(167,139,250,0.45)!important;',
    'box-shadow:0 0 24px rgba(139,92,246,0.55),0 0 48px rgba(124,58,237,0.35),0 12px 40px rgba(0,0,0,0.25)!important;',
    'animation:none!important}',

    '@keyframes drCardShake{',
    '0%{transform:translate(0,0) rotate(0deg)}',
    '12%{transform:translate(-5px,1px) rotate(-0.6deg)}',
    '24%{transform:translate(5px,-1px) rotate(0.6deg)}',
    '36%{transform:translate(-4px,0) rotate(-0.4deg)}',
    '48%{transform:translate(3px,1px) rotate(0.3deg)}',
    '60%{transform:translate(-2px,0) rotate(-0.2deg)}',
    '72%{transform:translate(1px,0) rotate(0.1deg)}',
    '100%{transform:translate(0,0) rotate(0deg)}}',

    '.login-card .dr-crack-overlay{',
    'position:absolute;inset:0;z-index:20;pointer-events:none;',
    'opacity:0;border-radius:inherit;overflow:hidden;',
    'transition:opacity .7s ease}',
    '.login-card.login-fail-glow .dr-crack-overlay{opacity:1;transition:opacity .15s ease}',
    '.login-card.login-fail-healing .dr-crack-overlay{opacity:0;transition:opacity .9s ease}',
    '.login-card .dr-crack-overlay svg{width:100%;height:100%;display:block}',

    '.login-card .dr-crack-overlay .dr-crack-main{',
    'stroke:rgba(255,220,220,0.95);stroke-width:1.8;fill:none;',
    'stroke-linecap:round;stroke-linejoin:round;',
    'filter:drop-shadow(0 0 2px rgba(239,68,68,0.9)) drop-shadow(0 0 6px rgba(185,28,28,0.5));',
    'stroke-dasharray:1200;stroke-dashoffset:1200}',
    '.login-card.login-fail-glow .dr-crack-overlay .dr-crack-main{',
    'animation:drCrackDraw .55s cubic-bezier(.2,.7,.2,1) forwards}',
    '.login-card.login-fail-healing .dr-crack-overlay .dr-crack-main{animation:none;stroke-dashoffset:0;opacity:0.15}',

    '.login-card .dr-crack-overlay .dr-crack-branch{',
    'stroke:rgba(255,200,200,0.75);stroke-width:1.15;fill:none;',
    'stroke-linecap:round;stroke-linejoin:round;',
    'filter:drop-shadow(0 0 1.5px rgba(239,68,68,0.7));',
    'stroke-dasharray:400;stroke-dashoffset:400}',
    '.login-card.login-fail-glow .dr-crack-overlay .dr-crack-branch{',
    'animation:drCrackDraw .5s cubic-bezier(.2,.7,.2,1) .12s forwards}',
    '.login-card.login-fail-healing .dr-crack-overlay .dr-crack-branch{animation:none;stroke-dashoffset:0;opacity:0.1}',

    '.login-card .dr-crack-overlay .dr-crack-hair{',
    'stroke:rgba(255,230,230,0.55);stroke-width:0.7;fill:none;',
    'stroke-linecap:round;',
    'filter:drop-shadow(0 0 1px rgba(248,113,113,0.5));',
    'stroke-dasharray:200;stroke-dashoffset:200}',
    '.login-card.login-fail-glow .dr-crack-overlay .dr-crack-hair{',
    'animation:drCrackDraw .45s ease-out .22s forwards}',
    '.login-card.login-fail-healing .dr-crack-overlay .dr-crack-hair{animation:none;opacity:0}',

    '.login-card .dr-crack-overlay .dr-crack-flash{',
    'fill:url(#drCrackFlash);opacity:0}',
    '.login-card.login-fail-glow .dr-crack-overlay .dr-crack-flash{',
    'animation:drCrackFlash .4s ease-out forwards}',

    '@keyframes drCrackDraw{to{stroke-dashoffset:0}}',
    '@keyframes drCrackFlash{0%{opacity:0.45}40%{opacity:0.2}100%{opacity:0}}',

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
    'border-color:rgba(239,68,68,0.9)!important;',
    'box-shadow:0 0 26px rgba(239,68,68,0.8),0 0 56px rgba(220,38,38,0.55),0 10px 32px rgba(185,28,28,0.15)!important}',

    'html[data-theme="light"] .login-card.login-fail-healing,html[data-theme="light"] #login-screen .login-card.login-fail-healing{',
    'border-color:rgba(109,94,245,0.55)!important;',
    'box-shadow:0 0 28px rgba(109,94,245,0.7),0 0 56px rgba(139,92,246,0.45),0 0 80px rgba(124,58,237,0.25),0 10px 32px rgba(91,76,224,0.15)!important}',

    'html[data-theme="light"] .login-card .dr-crack-overlay .dr-crack-main{',
    'stroke:rgba(127,29,29,0.9);filter:drop-shadow(0 0 2px rgba(185,28,28,0.8))}',
    'html[data-theme="light"] .login-card .dr-crack-overlay .dr-crack-branch{',
    'stroke:rgba(153,27,27,0.75)}',
    'html[data-theme="light"] .login-card .dr-crack-overlay .dr-crack-hair{',
    'stroke:rgba(185,28,28,0.5)}',

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
    '<defs>' +
    '<radialGradient id="drCrackFlash" cx="48%" cy="42%" r="55%">' +
    '<stop offset="0%" stop-color="rgba(255,180,180,0.55)"/>' +
    '<stop offset="45%" stop-color="rgba(239,68,68,0.2)"/>' +
    '<stop offset="100%" stop-color="rgba(239,68,68,0)"/>' +
    '</radialGradient>' +
    '</defs>' +
    '<rect class="dr-crack-flash" x="0" y="0" width="400" height="560"/>' +
    '<path class="dr-crack-main" d="M198 8 L188 72 L205 118 L172 168 L218 228 L155 295 L210 355 L178 420 L202 480 L190 552"/>' +
    '<path class="dr-crack-main" d="M188 72 L112 48 L58 95 L28 140"/>' +
    '<path class="dr-crack-main" d="M188 72 L268 38 L328 78 L372 55"/>' +
    '<path class="dr-crack-branch" d="M205 118 L278 105 L335 140 L378 120"/>' +
    '<path class="dr-crack-branch" d="M205 118 L130 145 L72 125 L35 175"/>' +
    '<path class="dr-crack-branch" d="M172 168 L95 155 L48 210 L18 195"/>' +
    '<path class="dr-crack-branch" d="M172 168 L245 185 L310 160 L355 195"/>' +
    '<path class="dr-crack-branch" d="M218 228 L295 245 L350 220 L388 255"/>' +
    '<path class="dr-crack-branch" d="M218 228 L145 255 L85 235 L42 280"/>' +
    '<path class="dr-crack-branch" d="M155 295 L88 320 L45 300 L12 345"/>' +
    '<path class="dr-crack-branch" d="M155 295 L230 318 L290 295 L340 330"/>' +
    '<path class="dr-crack-branch" d="M210 355 L280 375 L330 350 L375 390"/>' +
    '<path class="dr-crack-branch" d="M210 355 L135 385 L75 360 L30 410"/>' +
    '<path class="dr-crack-branch" d="M178 420 L250 445 L310 420 L360 460"/>' +
    '<path class="dr-crack-branch" d="M178 420 L110 450 L55 430 L20 480"/>' +
    '<path class="dr-crack-hair" d="M112 48 L90 25 L70 40"/>' +
    '<path class="dr-crack-hair" d="M268 38 L290 18 L310 32"/>' +
    '<path class="dr-crack-hair" d="M278 105 L300 88 L318 102"/>' +
    '<path class="dr-crack-hair" d="M95 155 L70 140 L55 155"/>' +
    '<path class="dr-crack-hair" d="M245 185 L265 170 L280 185"/>' +
    '<path class="dr-crack-hair" d="M295 245 L315 230 L330 245"/>' +
    '<path class="dr-crack-hair" d="M145 255 L125 270 L110 255"/>' +
    '<path class="dr-crack-hair" d="M88 320 L65 335 L50 320"/>' +
    '<path class="dr-crack-hair" d="M230 318 L250 305 L265 320"/>' +
    '<path class="dr-crack-hair" d="M280 375 L300 360 L315 375"/>' +
    '<path class="dr-crack-hair" d="M135 385 L115 400 L100 385"/>' +
    '<path class="dr-crack-hair" d="M250 445 L270 430 L285 445"/>' +
    '<path class="dr-crack-hair" d="M110 450 L90 465 L75 450"/>' +
    '<path class="dr-crack-hair" d="M202 480 L225 495 L240 480"/>' +
    '<path class="dr-crack-hair" d="M202 480 L175 500 L160 485"/>' +
    '</svg>';

  var healTimer = null;
  var lastFailAt = 0;

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
    if (!card) return null;
    var ov = card.querySelector('.dr-crack-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'dr-crack-overlay';
      ov.setAttribute('aria-hidden', 'true');
      ov.innerHTML = CRACK_SVG;
      card.appendChild(ov);
    }
    return ov;
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

  function clearErrorMessages() {
    document.querySelectorAll('#login-screen .login-error, .login-form .login-error, .login-card .login-error')
      .forEach(function (e) {
        try { e.remove(); } catch (err) {}
      });
  }

  function healCard(card) {
    if (!card) return;
    card.classList.remove('login-fail-glow');
    card.classList.add('login-fail-healing');
    clearErrorMessages();
    setTimeout(function () {
      card.classList.remove('login-fail-healing');
      var ov = card.querySelector('.dr-crack-overlay');
      if (ov) {
        var html = ov.innerHTML;
        ov.innerHTML = '';
        ov.innerHTML = html;
      }
    }, 950);
  }

  function triggerFail(card) {
    if (!card) return;
    ensureCrackOverlay(card);
    card.classList.remove('login-fail-healing');
    card.classList.remove('login-fail-glow');
    void card.offsetWidth;
    card.classList.add('login-fail-glow');
    lastFailAt = Date.now();
    if (healTimer) clearTimeout(healTimer);
    healTimer = setTimeout(function () {
      healCard(card);
      healTimer = null;
    }, 3000);
  }

  function syncFailGlow() {
    var card = document.querySelector('#login-screen .login-card, .login-card');
    if (!card) return;
    ensureCrackOverlay(card);
    var hasErr = !!document.querySelector(
      '#login-screen .login-error, .login-form .login-error, .login-card .login-error'
    );
    if (hasErr) {
      if (!card.classList.contains('login-fail-glow') || Date.now() - lastFailAt > 500) {
        triggerFail(card);
      }
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
  }, 3000);

  window.DRLoginTheme = {
    refresh: refresh,
    removeLoginToggle: removeLoginToggle
  };
})();
