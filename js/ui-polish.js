/**
 * Divine Rays — inject design accents (feature cards on customer home)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UI_POLISH) return;
  window.__DR_UI_POLISH = 1;

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
    ensureFeatures();
  }
  setTimeout(tick, 600);
  setInterval(tick, 3000);
  window.DRUiPolish = { refresh: tick };
})();
