/**
 * Divine Rays — theme toggle v8 (delegated capture click — always works)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_THEME_V8) return;
  window.__DR_THEME_V8 = 1;

  var KEY = 'dr_theme';

  function current() {
    try {
      var a = document.documentElement.getAttribute('data-theme');
      if (a === 'light' || a === 'dark') return a;
      var s = localStorage.getItem(KEY);
      if (s === 'light' || s === 'dark') return s;
    } catch (e) {}
    return 'dark';
  }

  function apply(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (document.body) document.body.setAttribute('data-theme', theme);
      localStorage.setItem(KEY, theme);
    } catch (e) {}
    updateButtons(theme);
    try {
      if (window.DRForceLightBg && typeof window.DRForceLightBg.refresh === 'function') {
        window.DRForceLightBg.refresh();
      }
    } catch (e2) {}
    try {
      if (window.DRHeartbeatDraw && window.DRHeartbeatDraw.refresh) window.DRHeartbeatDraw.refresh();
    } catch (e3) {}
    try {
      document.dispatchEvent(new CustomEvent('dr-theme-change', { detail: { theme: theme } }));
    } catch (e4) {}
    return theme;
  }

  function toggle() {
    return apply(current() === 'light' ? 'dark' : 'light');
  }

  function updateButtons(theme) {
    theme = theme || current();
    document.querySelectorAll('#btn-theme, .btn-theme, [data-theme-toggle]').forEach(function (btn) {
      btn.textContent = theme === 'light' ? 'Dark' : 'Light';
      btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
      btn.setAttribute('aria-label', btn.title);
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
      var chip = document.getElementById('header-avatar-chip');
      if (chip && chip.parentNode === info && chip.nextSibling) {
        info.insertBefore(btn, chip.nextSibling);
      } else {
        info.insertBefore(btn, info.firstChild);
      }
    }
    btn.type = 'button';
    btn.setAttribute('data-theme-toggle', '1');
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    updateButtons();
    return btn;
  }

  if (!window.__drThemeClickV8) {
    window.__drThemeClickV8 = 1;
    document.addEventListener(
      'click',
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var btn = t.closest('#btn-theme, .btn-theme, [data-theme-toggle], #theme-toggle');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        toggle();
      },
      true
    );
  }

  function boot() {
    apply(current());
    ensureButton();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
  setInterval(ensureButton, 20000);

  window.DRTheme = {
    apply: apply,
    current: current,
    toggle: toggle,
    ensure: ensureButton,
    refresh: boot,
    __quiet: 1
  };
})();
