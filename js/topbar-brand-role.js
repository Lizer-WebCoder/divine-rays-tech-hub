/**
 * Divine Rays — Top bar brand + role (quiet)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TOPBAR_BRAND_ROLE >= 2) return;
  window.__DR_TOPBAR_BRAND_ROLE = 2;

  var DEVS = { kirzhian: 1, kirzhianquijano: 1, kirzhianthegreat: 1, jamesjerlow123: 1, liya: 1, iiya: 1 };
  function isDev(s) {
    s = String(s || '').toLowerCase().trim();
    return !!DEVS[s] || s.indexOf('kirzhian') === 0;
  }

  function setText(el, next) {
    if (!el) return;
    if ((el.textContent || '').trim() !== next) el.textContent = next;
  }

  function tick() {
    var brand = 'Divine Rays Tech Hub \u2022 Admin Portal';
    var strong = document.querySelector('.mode-brand strong');
    if (strong) setText(strong, brand);
    else {
      var mb = document.querySelector('.mode-brand');
      if (mb) {
        Array.prototype.forEach.call(mb.childNodes, function (n) {
          if (n.nodeType === 3 && n.textContent.trim() && n.textContent.trim() !== brand) {
            n.textContent = brand;
          }
        });
      }
    }
    var lb = document.getElementById('logged-user-label');
    if (lb) {
      var raw = (lb.textContent || '').trim();
      var name = raw.replace(/\s*\(.*$/, '').trim().split(/\s+/)[0] || 'User';
      var role = isDev(name) || isDev(raw) ? 'Developer' : 'Admin';
      setText(lb, name + ' (' + role + ')');
    }
  }

  tick();
  setTimeout(tick, 1200);
  setInterval(tick, 15000);
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(tick, 80);
    }
  }, true);
})();
