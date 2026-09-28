/**
 * Divine Rays — enrich end-user / agent portal presentation
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_PORTAL_ENRICH) return;
  window.__DR_PORTAL_ENRICH = 1;

  function isLight() {
    try {
      return document.documentElement.getAttribute('data-theme') === 'light';
    } catch (e) {
      return false;
    }
  }

  function chipStyle() {
    if (isLight()) {
      return 'font-size:0.78rem;font-weight:700;color:#1e1b4b;background:#ffffff;border:1.5px solid #7c3aed;padding:0.35rem 0.75rem;border-radius:999px;opacity:1;-webkit-text-fill-color:#1e1b4b';
    }
    return 'font-size:0.78rem;font-weight:600;color:#d4cfff;background:rgba(139,124,247,0.18);border:1px solid rgba(139,124,247,0.35);padding:0.35rem 0.75rem;border-radius:999px';
  }

  function ensureCustomerHints() {
    var header = document.querySelector('#portal-customer .customer-header');
    if (!header) return;
    var row = header.querySelector('.dr-portal-hints');
    if (!row) {
      row = document.createElement('div');
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
        chip.className = 'dr-portal-hint-chip';
        chip.textContent = x.t;
        chip.setAttribute('style', chipStyle());
        row.appendChild(chip);
      });
      header.appendChild(row);
    } else {
      row.querySelectorAll('.dr-portal-hint-chip').forEach(function (chip) {
        chip.setAttribute('style', chipStyle());
      });
    }
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

  try {
    var mo = new MutationObserver(function () { apply(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) {}

  window.DRPortalEnrich = { refresh: apply };
})();
