/**
 * Divine Rays — theme toggle (lightweight)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var KEY = 'dr_theme';

  function current() {
    return document.documentElement.getAttribute('data-theme') || localStorage.getItem(KEY) || 'dark';
  }

  function apply(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    updateButtons(theme);
  }

  function updateButtons(theme) {
    theme = theme || current();
    document.querySelectorAll('#btn-theme, .btn-theme').forEach(function (btn) {
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
      btn.className = 'btn btn-ghost btn-sm btn-theme';
      info.insertBefore(btn, info.firstChild);
    }

    if (!btn.__drThemeBound) {
      btn.__drThemeBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        apply(current() === 'dark' ? 'light' : 'dark');
        if (window.DR && DR.toast) {
          DR.toast(current() === 'light' ? 'Light mode' : 'Dark mode', 'info');
        }
      });
    }

    updateButtons();
    return btn;
  }

  try {
    apply(localStorage.getItem(KEY) || 'dark');
  } catch (e) {
    apply('dark');
  }

  function boot() {
    ensureButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);

  window.DRTheme = { apply: apply, current: current, ensure: ensureButton };
})();
