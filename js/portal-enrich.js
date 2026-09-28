/**
 * Divine Rays — enrich end-user / agent portal presentation
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_ENRICH) return;
  window.__DR_PORTAL_ENRICH = 1;

  function ensureCustomerHints() {
    var header = document.querySelector('#portal-customer .customer-header');
    if (!header || header.querySelector('.dr-portal-hints')) return;
    var row = document.createElement('div');
    row.className = 'dr-portal-hints';
    row.setAttribute(
      'style',
      'display:flex;flex-wrap:wrap;justify-content:center;gap:0.5rem;margin-top:1.1rem'
    );
    var tips = [
      { t: 'Submit a ticket' },
      { t: 'Track progress' },
      { t: 'Browse Help / FAQ' }
    ];
    tips.forEach(function (x) {
      var chip = document.createElement('span');
      chip.textContent = x.t;
      chip.setAttribute(
        'style',
        'font-size:0.78rem;font-weight:600;color:#b8b0e0;background:rgba(139,124,247,0.12);border:1px solid rgba(139,124,247,0.25);padding:0.35rem 0.75rem;border-radius:999px'
      );
      row.appendChild(chip);
    });
    header.appendChild(row);
  }

  function apply() {
    try {
      ensureCustomerHints();
    } catch (e) {}
  }

  apply();
  setTimeout(apply, 600);
  setTimeout(apply, 2000);
  setInterval(apply, 8000);
  window.DRPortalEnrich = { refresh: apply };
})();
