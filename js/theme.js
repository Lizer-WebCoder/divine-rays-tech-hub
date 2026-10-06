/**
 * Divine Rays — theme toggle v9
 * Icon (sun/moon), onclick nuclear bind, injects full light CSS so switch always visible
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_THEME_V9) return;
  window.__DR_THEME_V9 = 1;

  var KEY = 'dr_theme';

  var ICON_SUN =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>' +
    '</svg>';

  var ICON_MOON =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
    '</svg>';

  function current() {
    try {
      var a = document.documentElement.getAttribute('data-theme');
      if (a === 'light' || a === 'dark') return a;
      var s = localStorage.getItem(KEY);
      if (s === 'light' || s === 'dark') return s;
    } catch (e) {}
    return 'dark';
  }

  function injectLightCss() {
    if (document.getElementById('dr-theme-v9-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-theme-v9-css';
    el.textContent = [
      '.mode-bar #btn-theme, #btn-theme.dr-theme-icon{',
      'width:34px!important;min-width:34px!important;height:34px!important;padding:0!important;',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'border-radius:9px!important;cursor:pointer!important;pointer-events:auto!important;',
      'background:rgba(124,106,240,0.14)!important;border:1px solid rgba(124,106,240,0.4)!important;',
      'color:#c4b5fd!important;line-height:1!important;flex-shrink:0!important}',
      '.mode-bar #btn-theme:hover{background:rgba(124,106,240,0.28)!important;color:#fff!important}',
      '.mode-bar #btn-theme svg{display:block;pointer-events:none}',

      'html[data-theme="light"]{',
      '--bg:#f0f0f5;--surface:#ffffff;--surface-2:#e8eaf2;--border:#d0d3e0;',
      '--text:#1a1a2e;--text-muted:#5a5a78;--primary:#6c5ce7}',

      'html[data-theme="light"] body,',
      'html[data-theme="light"] #app-shell,',
      'html[data-theme="light"] .app-shell,',
      'html[data-theme="light"] #portal-agent,',
      'html[data-theme="light"] #portal-customer,',
      'html[data-theme="light"] .main,',
      'html[data-theme="light"] .agent-main{',
      'background:#f0f0f5!important;color:#1a1a2e!important}',

      'html[data-theme="light"] .mode-bar{',
      'background:#ffffff!important;border-bottom:1px solid #d0d3e0!important;color:#1a1a2e!important}',
      'html[data-theme="light"] .mode-brand strong{color:#1a1a2e!important}',

      'html[data-theme="light"] .sidebar,',
      'html[data-theme="light"] #portal-agent .sidebar{',
      'background:#ffffff!important;border-color:#d0d3e0!important;color:#1a1a2e!important}',

      'html[data-theme="light"] .stat-card,',
      'html[data-theme="light"] .ticket-card,',
      'html[data-theme="light"] .ticket-detail,',
      'html[data-theme="light"] .login-card,',
      'html[data-theme="light"] .card,',
      'html[data-theme="light"] .panel{',
      'background:#ffffff!important;border-color:#d0d3e0!important;color:#1a1a2e!important}',

      'html[data-theme="light"] input,',
      'html[data-theme="light"] select,',
      'html[data-theme="light"] textarea{',
      'background:#ffffff!important;border-color:#d0d3e0!important;color:#1a1a2e!important}',

      'html[data-theme="light"] .nav-btn{color:#5a5a78!important}',
      'html[data-theme="light"] .nav-btn.active{background:rgba(108,92,231,0.12)!important;color:#5b4ce0!important}',

      'html[data-theme="light"] #btn-theme{',
      'background:rgba(99,102,241,0.12)!important;border-color:rgba(99,102,241,0.35)!important;color:#4f46e5!important}',

      'html[data-theme="dark"] body,html[data-theme="dark"] #app-shell{background:#0c0c14!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function apply(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    injectLightCss();
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (document.body) {
        document.body.setAttribute('data-theme', theme);
        document.body.classList.toggle('theme-light', theme === 'light');
        document.body.classList.toggle('theme-dark', theme === 'dark');
      }
      localStorage.setItem(KEY, theme);
    } catch (e) {}
    updateButtons(theme);
    try {
      if (window.DRForceLightBg && typeof window.DRForceLightBg.refresh === 'function') {
        window.DRForceLightBg.refresh();
      }
    } catch (e2) {}
    try {
      if (window.DRHeartbeatDraw && typeof window.DRHeartbeatDraw.refresh === 'function') {
        window.DRHeartbeatDraw.refresh();
      }
    } catch (e3) {}
    try {
      document.dispatchEvent(new CustomEvent('dr-theme-change', { detail: { theme: theme } }));
    } catch (e4) {}
    return theme;
  }

  function toggle() {
    var next = current() === 'light' ? 'dark' : 'light';
    return apply(next);
  }

  function updateButtons(theme) {
    theme = theme || current();
    document.querySelectorAll('#btn-theme').forEach(function (btn) {
      btn.innerHTML = theme === 'light' ? ICON_MOON : ICON_SUN;
      btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
      btn.setAttribute('aria-label', btn.title);
      btn.classList.add('dr-theme-icon', 'dr-topbar-btn');
    });
  }

  function bindButton(btn) {
    if (!btn) return;
    btn.type = 'button';
    btn.setAttribute('data-theme-toggle', '1');
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.onclick = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      toggle();
      return false;
    };
    if (!btn.__drThemeMousedown) {
      btn.__drThemeMousedown = 1;
      btn.addEventListener(
        'mousedown',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        },
        true
      );
    }
  }

  function ensureButton() {
    injectLightCss();
    var info = document.querySelector('.mode-bar .user-info') || document.querySelector('.user-info');
    if (!info) return null;

    var btn = document.getElementById('btn-theme');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-theme';
      btn.className = 'btn btn-ghost btn-sm btn-theme dr-topbar-btn dr-theme-icon';
      var chip = document.getElementById('header-avatar-chip');
      if (chip && chip.parentNode === info && chip.nextSibling) {
        info.insertBefore(btn, chip.nextSibling);
      } else {
        info.insertBefore(btn, info.firstChild);
      }
    }
    bindButton(btn);
    updateButtons();
    return btn;
  }

  if (!window.__drThemeClickV9) {
    window.__drThemeClickV9 = 1;
    document.addEventListener(
      'click',
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var btn = t.closest('#btn-theme, [data-theme-toggle]');
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
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setInterval(ensureButton, 25000);

  window.DRTheme = {
    apply: apply,
    current: current,
    toggle: toggle,
    ensure: ensureButton,
    refresh: boot,
    __quiet: 1
  };
})();
