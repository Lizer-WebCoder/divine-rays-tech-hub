/**
 * Divine Rays — Theme toggle (instant + proper sun/moon icons)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.DRTheme && window.DRTheme.__icons) return;

  var SUN = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  var MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>';

  function injectSnapCss() {
    if (document.getElementById('dr-theme-snap-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-theme-snap-css';
    el.textContent = [
      'html,body,.mode-bar,#mode-bar{transition:none!important}',
      'html[data-theme="dark"] .mode-bar,html[data-theme="dark"] #mode-bar{background:var(--bar-bg,#12101c)!important}',
      'html[data-theme="light"] .mode-bar,html[data-theme="light"] #mode-bar{background:var(--bar-bg,#f4f2ff)!important}',
      '#btn-theme,button#btn-theme,[data-theme-toggle]{',
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      'width:2.15rem!important;height:2.15rem!important;min-width:2.15rem!important;',
      'padding:0!important;border-radius:9px!important;cursor:pointer!important;',
      'border:1px solid rgba(139,124,247,.35)!important;',
      'background:rgba(124,106,240,.12)!important;color:#c4b5fd!important;',
      'line-height:0!important;overflow:hidden!important}',
      '#btn-theme svg,button#btn-theme svg{width:18px!important;height:18px!important;display:block!important;flex-shrink:0}',
      'html[data-theme="light"] #btn-theme,html[data-theme="light"] [data-theme-toggle]{',
      'background:rgba(99,102,241,.1)!important;color:#4f46e5!important;border-color:rgba(99,102,241,.3)!important}',
      '#btn-theme:hover{background:rgba(124,106,240,.22)!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function current() {
    try {
      return localStorage.getItem('dr_theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function paintIcon(t) {
    var btn = document.getElementById('btn-theme') || document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    var isLight = t === 'light';
    btn.innerHTML = isLight ? MOON : SUN;
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    btn.title = isLight ? 'Dark mode' : 'Light mode';
  }

  function apply(t) {
    t = t === 'light' ? 'light' : 'dark';
    injectSnapCss();
    try {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('dr_theme', t);
    } catch (e) {}
    paintIcon(t);
  }

  function wireBtn() {
    var btn = document.getElementById('theme-toggle') || document.querySelector('[data-theme-toggle]') || document.getElementById('btn-theme');
    if (!btn) return null;
    if (!btn.__drThemeWired) {
      btn.__drThemeWired = 1;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        apply(current() === 'light' ? 'dark' : 'light');
      }, true);
    }
    paintIcon(current());
    return btn;
  }

  function boot() {
    injectSnapCss();
    apply(current());
    wireBtn();
  }

  boot();
  setTimeout(boot, 150);
  setTimeout(boot, 500);
  setTimeout(boot, 1200);
  setInterval(function () {
    paintIcon(current());
    wireBtn();
  }, 5000);

  window.DRTheme = {
    __quiet: 1,
    __fast: 1,
    __icons: 1,
    apply: apply,
    current: current,
    refresh: boot,
    ensure: boot
  };
})();
