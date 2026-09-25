/**
 * Divine Rays — login light mode + theme toggle (removed after login)
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
    'background:rgba(26,22,40,0.45)!important;',
    'backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;',
    'border:1px solid rgba(124,106,240,0.2)!important}',
    'html[data-theme="light"] .login-tabs{background:rgba(240,235,255,0.5)!important;border:1px solid rgba(124,106,240,0.15)!important}',
    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:radial-gradient(ellipse at top,#e8e0ff 0%,#ebe6f8 50%,#e0daf5 100%)!important}',
    'html[data-theme="light"] .login-brand h1{color:#1a1a2e!important}',
    'html[data-theme="light"] .login-brand p{color:#4a4a66!important}',
    'html[data-theme="light"] .ltab{color:#4a4a66!important;background:transparent!important}',
    'html[data-theme="light"] .ltab.active{background:#6d5ef5!important;color:#fff!important}',
    'html[data-theme="light"] .login-form label,html[data-theme="light"] #login-screen .form-group label{color:#3d3d55!important;font-weight:600!important}',
    'html[data-theme="light"] .login-form input::placeholder,html[data-theme="light"] #login-screen input::placeholder{color:#6b6b86!important}',
    'html[data-theme="light"] .login-form input:focus,html[data-theme="light"] #login-screen input:focus{',
    'background:rgba(255,255,255,0.9)!important;border-color:#6d5ef5!important;box-shadow:0 0 0 3px rgba(109,94,245,.2)!important}',
    'html[data-theme="light"] .login-switch{color:#4a4a66!important}',
    'html[data-theme="light"] .login-switch a{color:#5b4ce0!important}',
    'html[data-theme="light"] .login-error{background:#fef2f2!important;border-color:#fecaca!important;color:#b91c1c!important}',
    '#dr-login-theme{position:fixed;top:1rem;right:1rem;z-index:10050;border:1px solid rgba(124,106,240,.4);',
    'background:rgba(26,26,36,.9);color:#c4b5fd;border-radius:999px;padding:.5rem 1rem;font-size:.85rem;',
    'font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.25)}',
    'html[data-theme="light"] #dr-login-theme{background:#fff;color:#4c3fd4;border-color:#c4b5fd;',
    'box-shadow:0 4px 16px rgba(30,30,60,.12)}',
    '.mode-bar .user-info{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:0.5rem!important;position:relative!important;z-index:5!important}',
    '.mode-bar #btn-logout{position:relative!important;z-index:6!important;margin-left:0.25rem!important}',
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
    var st = window.getComputedStyle(login);
    if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
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

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      injectCss();
      ensureToggle();
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
  }, 2000);

  window.DRLoginTheme = { refresh: schedule, setTheme: setTheme, removeLoginToggle: removeLoginToggle };
})();
