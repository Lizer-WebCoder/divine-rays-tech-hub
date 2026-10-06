/**
 * Divine Rays — theme toggle (creates #btn-theme in top bar)
 * No Light/Dark toast spam. Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_THEME_V6) return;
  window.__DR_THEME_V6 = 1;

  var KEY = 'dr_theme';

  function current() {
    try {
      return document.documentElement.getAttribute('data-theme') || localStorage.getItem(KEY) || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function apply(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    updateButtons(theme);
    try { if (window.DRForceLightBg && window.DRForceLightBg.refresh) window.DRForceLightBg.refresh(); } catch (e) {}
  }

  function updateButtons(theme) {
    theme = theme || current();
    document.querySelectorAll('#btn-theme').forEach(function (btn) {
      btn.textContent = theme === 'light' ? 'Dark' : 'Light';
      btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
      btn.setAttribute('aria-label', btn.title);
    });
  }

  function ensureButton() {
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return null;

    var loginBtn = document.getElementById('dr-login-theme');
    if (loginBtn && loginBtn.parentNode) loginBtn.parentNode.removeChild(loginBtn);

    var btn = document.getElementById('btn-theme');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-theme';
      btn.className = 'btn btn-ghost btn-sm btn-theme dr-topbar-btn';
      var logout = document.getElementById('btn-logout');
      if (logout && logout.parentNode === info) info.insertBefore(btn, logout);
      else info.appendChild(btn);
    }

    if (!btn.__drThemeBound) {
      btn.__drThemeBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    }
    updateButtons();
    return btn;
  }

  function boot() {
    try { apply(localStorage.getItem(KEY) || current()); } catch (e) { apply('dark'); }
    ensureButton();
  }

  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
  setInterval(ensureButton, 20000);

  window.DRTheme = { apply: apply, current: current, ensure: ensureButton, refresh: boot, __quiet: 1 };
})();
