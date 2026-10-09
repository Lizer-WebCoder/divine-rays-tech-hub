/**
 * Divine Rays — Theme toggle (instant topbar, no lag)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.DRTheme && window.DRTheme.__fast) return;

  function injectSnapCss() {
    if (document.getElementById('dr-theme-snap-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-theme-snap-css';
    el.textContent = [
      'html,body,.mode-bar,.topbar,#mode-bar,[class*="topbar"],',
      '.mode-bar *,.topbar *,#portal-agent .topbar,#portal-agent .mode-bar{',
      'transition:none!important}',
      'html[data-theme="dark"] .mode-bar,html[data-theme="dark"] .topbar,',
      'html[data-theme="dark"] #mode-bar{',
      'background:var(--bar-bg,#12101c)!important}',
      'html[data-theme="light"] .mode-bar,html[data-theme="light"] .topbar,',
      'html[data-theme="light"] #mode-bar{',
      'background:var(--bar-bg,#f4f2ff)!important}'
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

  function apply(t) {
    t = t === 'light' ? 'light' : 'dark';
    injectSnapCss();
    try {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('dr_theme', t);
    } catch (e) {}
    try {
      var bars = document.querySelectorAll('.mode-bar, .topbar, #mode-bar, header.topbar');
      bars.forEach(function (b) {
        b.style.transition = 'none';
        void b.offsetHeight;
      });
    } catch (e2) {}
  }

  function wireBtn() {
    var btn = document.getElementById('theme-toggle') || document.querySelector('[data-theme-toggle]') || document.getElementById('btn-theme');
    if (!btn || btn.__drThemeWired) return btn;
    btn.__drThemeWired = 1;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var next = current() === 'light' ? 'dark' : 'light';
      apply(next);
    }, true);
    return btn;
  }

  function boot() {
    injectSnapCss();
    apply(current());
    wireBtn();
  }

  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setInterval(boot, 30000);

  window.DRTheme = {
    __quiet: 1,
    __fast: 1,
    apply: apply,
    current: current,
    refresh: boot
  };
})();
