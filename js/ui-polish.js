/**
 * Divine Rays — design accents + ensure form selects clickable
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UI_POLISH_V2) return;
  window.__DR_UI_POLISH_V2 = 1;
  window.__DR_UI_POLISH = 1;

  function clearBlockers() {
    ['dr-tour-bd', 'dr-notif-panel-bd'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!el.classList.contains('open')) {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0';
      }
    });
    ['c-category', 'c-priority'].forEach(function (id) {
      var s = document.getElementById(id);
      if (!s) return;
      s.style.pointerEvents = 'auto';
      s.style.zIndex = '20';
      s.style.position = 'relative';
      s.disabled = false;
      Array.prototype.forEach.call(s.options, function (opt) {
        if (!opt.value && opt.text) opt.value = opt.text;
      });
    });
  }

  function ensureFeatures() {
    var pc = document.getElementById('portal-customer');
    if (!pc || !pc.classList.contains('active')) return;
    var main = pc.querySelector('.customer-main') || pc;
    if (!main || document.getElementById('dr-feature-strip')) return;
    var form = document.getElementById('customer-form') || main.querySelector('.ticket-form');
    if (!form || form.offsetParent === null) return;

    var strip = document.createElement('div');
    strip.id = 'dr-feature-strip';
    strip.className = 'dr-feature-strip';
    strip.innerHTML =
      '<div class="dr-feature-card"><div class="ico">🎫</div><h4>Fast tickets</h4><p>Describe the issue once — our team picks it up with priority routing.</p></div>' +
      '<div class="dr-feature-card"><div class="ico">💬</div><h4>Live updates</h4><p>Replies and status changes appear in Activity without refreshing.</p></div>' +
      '<div class="dr-feature-card"><div class="ico">🖥️</div><h4>Remote help</h4><p>Agents can request a guided remote session when you need hands-on support.</p></div>';
    form.parentNode.insertBefore(strip, form.nextSibling);
  }

  function tick() {
    clearBlockers();
    ensureFeatures();
  }

  document.addEventListener('mousedown', function () { clearBlockers(); }, true);

  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setInterval(tick, 2500);
  window.DRUiPolish = { refresh: tick };
})();
