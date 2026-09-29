/**
 * Divine Rays — Design System v10 injector
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_DESIGN_V10) return;
  window.__DR_DESIGN_V10 = 1;

  var LINK_ID = 'dr-design-system-v10';
  function ensureCss(href) {
    var el = document.getElementById(LINK_ID);
    if (!el) {
      el = document.createElement('link');
      el.id = LINK_ID;
      el.rel = 'stylesheet';
      document.head.appendChild(el);
    }
    if (el.getAttribute('href') !== href) el.setAttribute('href', href);
  }

  function polishButtons() {
    document.querySelectorAll('button:not([data-dr-btn])').forEach(function (b) {
      b.setAttribute('data-dr-btn', '1');
      if (!b.className || !/\bbtn/.test(b.className)) {
        var t = (b.textContent || '').toLowerCase();
        var id = b.id || '';
        if (/delete|remove|danger/.test(t + id)) b.classList.add('btn-danger');
        else if (/claim|save|submit|create|send|login|sign/.test(t + id)) b.classList.add('btn-primary');
        else if (/back|clear|cancel|close/.test(t + id)) b.classList.add('btn-secondary');
      }
    });
  }

  var _t;
  function schedule() {
    if (_t) clearTimeout(_t);
    _t = setTimeout(polishButtons, 120);
  }

  var href =
    (document.currentScript && document.currentScript.getAttribute('data-css')) ||
    window.__DR_DESIGN_CSS ||
    '';
  if (href) ensureCss(href);

  polishButtons();
  setTimeout(polishButtons, 800);
  setTimeout(polishButtons, 2000);
  document.addEventListener('click', schedule, true);
  if (document.body) {
    try {
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
})();
