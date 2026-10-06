/**
 * Divine Rays — Theme toggle (quiet, no toast spam)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.DRTheme && window.DRTheme.__quiet) return;

  function current() {
    try {
      return localStorage.getItem('dr_theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function apply(t) {
    t = t === 'light' ? 'light' : 'dark';
    try {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('dr_theme', t);
    } catch (e) {}
  }

  function wireBtn() {
    var btn = document.getElementById('theme-toggle') || document.querySelector('[data-theme-toggle]');
    if (!btn || btn.__drThemeWired) return btn;
    btn.__drThemeWired = 1;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var next = current() === 'light' ? 'dark' : 'light';
      apply(next);
    });
    return btn;
  }

  function boot() {
    apply(current());
    wireBtn();
  }

  boot();
  setTimeout(boot, 800);
  setInterval(boot, 30000);

  window.DRTheme = {
    __quiet: 1,
    apply: apply,
    current: current,
    refresh: boot
  };
})();
