/**
 * Divine Rays — login light mode + theme toggle (crash-safe)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_LOGIN_THEME) return;
  window.__DR_LOGIN_THEME = 1;

  var CSS = [
    'html[data-theme="light"] .login-screen,html[data-theme="light"] #login-screen{',
    'background:radial-gradient(ellipse at top,#ebe6ff 0%,#f0f1f8 55%,#e8eaf5 100%)!important}',
    'html[data-theme="light"] .login-card{background:#fff!important;border:1px solid #d0d3e4!important;',
    'box-shadow:0 12px 40px rgba(30,30,60,.1)!important;color:#1a1a2e!important}',
    'html[data-theme="light"] .login-brand h1{color:#1a1a2e!important}',
    'html[data-theme="light"] .login-brand p{color:#4a4a66!important}',
    'html[data-theme="light"] .login-tabs{background:#eef0f7!important;border:1px solid #d0d3e4!important}',
    'html[data-theme="light"] .ltab{color:#4a4a66!important;background:transparent!important}',
    'html[data-theme="light"] .ltab.active{background:#6d5ef5!important;color:#fff!important}',
    'html[data-theme="light"] .login-form label,html[data-theme="light"] #login-screen .form-group label{color:#3d3d55!important;font-weight:600!important}',
    'html[data-theme="light"] .login-form input,html[data-theme="light"] #login-screen input[type="text"],',
    'html[data-theme="light"] #login-screen input[type="email"],html[data-theme="light"] #login-screen input[type="password"]{',
    'background:#eef0f7!important;color:#1a1a2e!important;border:1px solid #c8cad8!important}',
    'html[data-theme="light"] .login-form input::placeholder,html[data-theme="light"] #login-screen input::placeholder{color:#6b6b86!important}',
    'html[data-theme="light"] .login-form input:focus,html[data-theme="light"] #login-screen input:focus{',
    'background:#fff!important;border-color:#6d5ef5!important;box-shadow:0 0 0 3px rgba(109,94,245,.2)!important}',
    'html[data-theme="light"] .login-switch{color:#4a4a66!important}',
    'html[data-theme="light"] .login-switch a{color:#5b4ce0!important}',
    'html[data-theme="light"] .login-error{background:#fef2f2!important;border-color:#fecaca!important;color:#b91c1c!important}',
    '#dr-login-theme{position:fixed;top:1rem;right:1rem;z-index:10050;border:1px solid rgba(124,106,240,.4);',
    'background:rgba(26,26,36,.9);color:#c4b5fd;border-radius:999px;padding:.5rem 1rem;font-size:.85rem;',
    'font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.25)}',
    'html[data-theme="light"] #dr-login-theme{background:#fff;color:#4c3fd4;border-color:#c4b5fd;',
    'box-shadow:0 4px 16px rgba(91,76,224,.12)}',
    '#dr-login-theme:hover{filter:brightness(1.08)}'
  ].join('');

  var busy = false;
  var timer = null;

  function injectCss() {
    if (document.getElementById('dr-login-theme-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-login-theme-css';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function getTheme() {
    try {
      return localStorage.getItem('dr_theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function setTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('dr_theme', next); } catch (e) {}
    var btn = document.getElementById('dr-login-theme');
    if (btn) btn.textContent = next === 'light' ? 'Dark mode' : 'Light mode';
    var hb = document.getElementById('btn-theme');
    if (hb) hb.textContent = next === 'light' ? 'Dark' : 'Light';
  }

  function ensureToggle() {
    if (busy) return;
    busy = true;
    try {
      var login = document.getElementById('login-screen') || document.querySelector('.login-screen');
      var visible = false;
      if (login) {
        try {
          visible = !login.hidden && !login.classList.contains('is-hidden') &&
            window.getComputedStyle(login).display !== 'none';
        } catch (e) {}
      }
      var btn = document.getElementById('dr-login-theme');
      if (!visible) {
        if (btn) btn.style.display = 'none';
        return;
      }
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'dr-login-theme';
        btn.addEventListener('click', function () {
          setTheme(getTheme() === 'dark' ? 'light' : 'dark');
        });
        document.body.appendChild(btn);
      }
      btn.style.display = '';
      btn.textContent = getTheme() === 'light' ? 'Dark mode' : 'Light mode';
    } finally {
      busy = false;
    }
  }

  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      injectCss();
      ensureToggle();
    }, 300);
  }

  injectCss();
  try {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('dr_theme') || 'dark');
  } catch (e) {}

  setTimeout(schedule, 200);
  setTimeout(schedule, 1000);
  setInterval(schedule, 5000);

  window.DRLoginTheme = { refresh: schedule, setTheme: setTheme };
})();
