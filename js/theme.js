/**
 * Divine Rays — theme toggle v7 (always creates #btn-theme)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_THEME_V7) return;
  window.__DR_THEME_V7 = 1;

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
    });
  }

  function ensureButton() {
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return null;
    var btn = document.getElementById('btn-theme');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-theme';
      btn.className = 'btn btn-ghost btn-sm btn-theme dr-topbar-btn';
      info.insertBefore(btn, info.firstChild);
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
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setInterval(ensureButton, 15000);

  window.DRTheme = { apply: apply, current: current, ensure: ensureButton, refresh: boot, __quiet: 1 };
})();
