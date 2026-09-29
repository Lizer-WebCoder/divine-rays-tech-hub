/**
 * Divine Rays — login glass 20% + glow; shake on failed login (no crack)
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
    'box-shadow:0 0 22px rgba(239,68,68,0.8),0 0 52px rgba(220,38,38,0.55),0 12px 40px rgba(0,0,0,0.3)!important}',

    '.login-card.login-fail-shake,#login-screen .login-card.login-fail-shake{',
    'animation:drCardShake .5s ease-out}',

    '.login-card.login-fail-healing,#login-screen .login-card.login-fail-healing{',
    'border-color:rgba(167,139,250,0.45)!important;',
    'box-shadow:0 0 24px rgba(139,92,246,0.55),0 0 48px rgba(124,58,237,0.35),0 12px 40px rgba(0,0,0,0.25)!important}',

    '@keyframes drCardShake{',
    '0%{transform:translate(0,0) rotate(0deg)}',
    '12%{transform:translate(-5px,1px) rotate(-0.6deg)}',
    '24%{transform:translate(5px,-1px) rotate(0.6deg)}',
    '36%{transform:translate(-4px,0) rotate(-0.4deg)}',
    '48%{transform:translate(3px,1px) rotate(0.3deg)}',
    '60%{transform:translate(-2px,0) rotate(-0.2deg)}',
    '72%{transform:translate(1px,0) rotate(0.1deg)}',
    '100%{transform:translate(0,0) rotate(0deg)}}',

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

    'html[data-theme="light"] .login-switch{color:#4a4a66!important}',
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

    '.login-switch{color:#9898b0!important}',
    '.login-switch a{color:#c4b5fd!important}',
    '#login-screen,.login-screen{position:relative;z-index:2}',
    '#login-screen .login-card,.login-card{position:relative;z-index:3}'
  ].join('');

  var healTimer = null;
  var pendingSubmit = false;

  function injectCss() {
    var el = document.getElementById('dr-login-theme-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-theme-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function getCard() {
    return document.querySelector('#login-screen .login-card, .login-card');
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

  function removeCrackOverlays() {
    document.querySelectorAll('.dr-crack-overlay').forEach(function (el) {
      try { el.remove(); } catch (e) {}
    });
  }

  function healCard(card) {
    if (!card) return;
    card.classList.remove('login-fail-glow', 'login-fail-shake');
    card.classList.add('login-fail-healing');
    clearErrorMessages();
    setTimeout(function () {
      card.classList.remove('login-fail-healing');
    }, 500);
  }

  function playShake(card) {
    if (!card) return;
    card.classList.remove('login-fail-shake');
    void card.offsetWidth;
    card.classList.add('login-fail-shake');
    setTimeout(function () {
      card.classList.remove('login-fail-shake');
    }, 550);
  }

  function triggerFail(card, withShake) {
    if (!card) return;
    removeCrackOverlays();
    card.classList.remove('login-fail-healing');
    card.classList.add('login-fail-glow');
    if (withShake) playShake(card);
    if (healTimer) clearTimeout(healTimer);
    healTimer = setTimeout(function () {
      healCard(card);
      healTimer = null;
    }, 3000);
  }

  function hasLoginError() {
    return !!document.querySelector(
      '#login-screen .login-error, .login-form .login-error, .login-card .login-error'
    );
  }

  function onPossibleFail(fromSubmit) {
    var card = getCard();
    if (!card) return;
    if (!hasLoginError()) return;
    triggerFail(card, !!fromSubmit);
  }

  function watchLoginErrors() {
    var root = document.getElementById('login-screen') || document.body;
    if (!root || root.__drFailGlowObs) return;

    document.addEventListener('submit', function (ev) {
      var form = ev.target;
      if (!form) return;
      if (!(form.classList && form.classList.contains('login-form')) &&
          !(form.closest && form.closest('.login-card'))) return;
      pendingSubmit = true;
      setTimeout(function () {
        if (pendingSubmit && hasLoginError()) {
          onPossibleFail(true);
          pendingSubmit = false;
        }
      }, 80);
      setTimeout(function () {
        if (pendingSubmit && hasLoginError()) {
          onPossibleFail(true);
          pendingSubmit = false;
        }
      }, 350);
      setTimeout(function () {
        if (pendingSubmit && hasLoginError()) {
          onPossibleFail(true);
          pendingSubmit = false;
        } else {
          pendingSubmit = false;
        }
      }, 900);
    }, true);

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t) return;
      var btn = t.closest ? t.closest('button[type="submit"], .btn-primary, button.btn') : null;
      if (!btn || !btn.closest || !btn.closest('.login-card, #login-screen')) return;
      pendingSubmit = true;
      setTimeout(function () {
        if (pendingSubmit && hasLoginError()) {
          onPossibleFail(true);
          pendingSubmit = false;
        }
      }, 100);
      setTimeout(function () {
        if (pendingSubmit && hasLoginError()) {
          onPossibleFail(true);
          pendingSubmit = false;
        }
      }, 400);
      setTimeout(function () {
        if (pendingSubmit && hasLoginError()) {
          onPossibleFail(true);
          pendingSubmit = false;
        } else {
          pendingSubmit = false;
        }
      }, 1000);
    }, true);

    try {
      var obs = new MutationObserver(function () {
        if (hasLoginError()) {
          var card = getCard();
          if (card && !card.classList.contains('login-fail-glow')) {
            if (pendingSubmit) {
              onPossibleFail(true);
              pendingSubmit = false;
            } else {
              triggerFail(card, false);
            }
          }
        }
      });
      obs.observe(root, { childList: true, subtree: true, characterData: true });
      root.__drFailGlowObs = obs;
    } catch (e) {}

    removeCrackOverlays();
  }

  function refresh() {
    injectCss();
    ensureLoginToggle();
    removeCrackOverlays();
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
    removeCrackOverlays();
  }, 3000);

  window.DRLoginTheme = {
    refresh: refresh,
    removeLoginToggle: removeLoginToggle
  };
})();
