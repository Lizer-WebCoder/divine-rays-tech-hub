/**
 * Divine Rays — polished login light/dark + theme toggle (removed after login)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_THEME) {
    try { delete window.__DR_LOGIN_THEME; } catch (e) {}
  }
  window.__DR_LOGIN_THEME = 1;

  var CSS = [
    '.login-card,#login-screen .login-card{',
    'background:rgba(26,22,40,0.72)!important;',
    'backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;',
    'border:1px solid rgba(124,106,240,0.28)!important;',
    'box-shadow:0 20px 50px rgba(0,0,0,0.35)!important}',

    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:radial-gradient(ellipse 90% 60% at 50% -10%,rgba(109,94,245,0.16),transparent 55%),',
    'radial-gradient(ellipse 50% 40% at 100% 100%,rgba(167,139,250,0.12),transparent 50%),',
    'linear-gradient(165deg,#f6f4fc 0%,#efeaf8 45%,#e8e2f5 100%)!important}',

    'html[data-theme="light"] .login-card,html[data-theme="light"] #login-screen .login-card{',
    'background:rgba(255,255,255,0.88)!important;',
    'backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important;',
    'border:1px solid rgba(124,106,240,0.22)!important;',
    'box-shadow:0 16px 48px rgba(91,76,224,0.12),0 2px 8px rgba(30,30,60,0.06)!important;',
    'color:#1a1a2e!important}',

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
    'html[data-theme="light"] .login-form textarea,',
    'html[data-theme="light"] #login-screen input,',
    'html[data-theme="light"] #login-screen select,',
    'html[data-theme="light"] #login-screen textarea{',
    'background:#fff!important;color:#1a1a2e!important;',
    'border:1px solid #d4d0ea!important;',
    'border-radius:10px!important;',
    'box-shadow:0 1px 2px rgba(30,30,60,0.04)!important}',
    'html[data-theme="light"] .login-form input::placeholder,',
    'html[data-theme="light"] #login-screen input::placeholder{color:#8b8ba3!important}',
    'html[data-theme="light"] .login-form input:focus,',
    'html[data-theme="light"] #login-screen input:focus{',
    'background:#fff!important;border-color:#6d5ef5!important;',
    'box-shadow:0 0 0 3px rgba(109,94,245,0.22)!important;outline:none!important}',

    'html[data-theme="light"] .login-form .btn-primary,',
    'html[data-theme="light"] #login-screen .btn-primary{',
    'background:linear-gradient(135deg,#7c6af0,#5b4ce0)!important;',
    'color:#fff!important;border:none!important;',
    'box-shadow:0 6px 18px rgba(91,76,224,0.35)!important;',
    'font-weight:600!important}',
    'html[data-theme="light"] .login-form .btn-primary:hover,',
    'html[data-theme="light"] #login-screen .btn-primary:hover{',
    'filter:brightness(1.05)!important}',

    'html[data-theme="light"] .login-switch{color:#5a5a78!important}',
    'html[data-theme="light"] .login-switch a{color:#5b4ce0!important;font-weight:600!important}',
    'html[data-theme="light"] .login-error{',
    'background:#fef2f2!important;border:1px solid #fecaca!important;color:#b91c1c!important}',
    'html[data-theme="light"] hr,html[data-theme="light"] .login-card hr{',
    'border-color:rgba(124,106,240,0.15)!important}',

    '#dr-login-theme{position:fixed;top:1rem;right:1rem;z-index:10050;',
    'border:1px solid rgba(124,106,240,.4);',
    'background:rgba(26,26,36,.92);color:#c4b5fd;border-radius:999px;',
    'padding:.5rem 1rem;font-size:.85rem;font-weight:600;cursor:pointer;',
    'font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.25)}',
    'html[data-theme="light"] #dr-login-theme{',
    'background:#fff;color:#4c3fd4;border-color:#c4b5fd;',
    'box-shadow:0 4px 16px rgba(30,30,60,.1)}',

    '#login-screen,.login-screen{position:relative;z-index:2}',
    '#login-screen .login-card,.login-card{position:relative;z-index:3}',

    '.mode-bar .user-info{display:flex!important;align-items:center!important;',
    'flex-wrap:wrap!important;gap:0.5rem!important;position:relative!important;z-index:5!important}',
    '.mode-bar #btn-logout{position:relative!important;z-index:6!important}',
    '.mode-bar #btn-theme{position:relative!important;z-index:5!important;flex-shrink:0!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById('dr-login-theme-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-login-theme-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
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
    var b = document.getElementById('dr-login-theme');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  function setTheme(t) {
    t = t === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('dr_theme', t); } catch (e) {}
    var b = document.getElementById('dr-login-theme');
    if (b) b.textContent = t === 'light' ? 'Dark' : 'Light';
    document.querySelectorAll('#btn-theme').forEach(function (btn) {
      btn.textContent = t === 'light' ? 'Dark' : 'Light';
    });
    if (window.DRForceLightBg && window.DRForceLightBg.refresh) try { window.DRForceLightBg.refresh(); } catch (e) {}
    if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) try { window.DRHeartbeatDraw.refresh(); } catch (e) {}
    if (window.DRTheme && window.DRTheme.apply) try { window.DRTheme.apply(t); } catch (e) {}
  }

  function ensureToggle() {
    if (!isLoginVisible()) {
      removeLoginToggle();
      return;
    }
    if (document.getElementById('dr-login-theme')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'dr-login-theme';
    var cur = 'dark';
    try {
      cur = localStorage.getItem('dr_theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    } catch (e) {}
    b.textContent = cur === 'light' ? 'Dark' : 'Light';
    b.addEventListener('click', function () {
      var cur2 = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(cur2 === 'dark' ? 'light' : 'dark');
    });
    document.body.appendChild(b);
  }

  function ensureGearsOnLogin() {
    if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) {
      try { window.DRHeartbeatDraw.refresh(); } catch (e) {}
    }
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      injectCss();
      ensureToggle();
      ensureGearsOnLogin();
    }, 200);
  }

  injectCss();
  try {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('dr_theme') || 'dark');
  } catch (e) {}

  ensureToggle();
  setTimeout(schedule, 200);
  setTimeout(schedule, 1000);
  setInterval(function () {
    injectCss();
    ensureToggle();
  }, 2500);

  window.DRLoginTheme = { refresh: schedule, setTheme: setTheme, removeLoginToggle: removeLoginToggle };
})();
