/**
 * Divine Rays — unified credit text at page bottom
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_CREDIT_FIX_V2 = 1;

  var TEXT = 'Boyz at the Back · All Rights Reserved';

  function isCreditNode(el) {
    if (!el || (el.children && el.children.length)) return false;
    var t = (el.textContent || '').trim();
    return /rights reserved/i.test(t) && /(lizzz|boyz at the back)/i.test(t);
  }

  function styleFooter(el) {
    el.textContent = TEXT;
    el.classList.add('dr-credit-footer');
    el.style.cssText = [
      'display:block',
      'width:100%',
      'text-align:center',
      'margin:1.5rem 0 0',
      'padding:1rem 0.75rem 1.25rem',
      'border-top:1px solid rgba(139,124,247,0.18)',
      'font-size:0.65rem',
      'color:#5a5a70',
      'text-transform:uppercase',
      'letter-spacing:0.06em',
      'order:9999',
      'flex-shrink:0'
    ].join(';');
  }

  function ensureCustomerFooter() {
    var portal = document.getElementById('portal-customer');
    if (!portal) return;

    var main = portal.querySelector('.customer-main') || portal;
    var stray = [];
    portal.querySelectorAll('.credit, .credit-footer, .credit-side, p, span, small, div').forEach(function (el) {
      if (!isCreditNode(el)) return;
      if (el.closest && el.closest('.sidebar')) return;
      if (el.id === 'dr-cust-credit-footer') return;
      stray.push(el);
    });

    var footer = document.getElementById('dr-cust-credit-footer');
    if (!footer) {
      footer = document.createElement('p');
      footer.id = 'dr-cust-credit-footer';
      footer.className = 'credit dr-credit-footer';
      if (main) main.appendChild(footer);
      else portal.appendChild(footer);
    } else if (main && footer.parentNode !== main) {
      main.appendChild(footer);
    } else if (main) {
      // keep at end of main
      main.appendChild(footer);
    }

    styleFooter(footer);

    stray.forEach(function (el) {
      if (el === footer) return;
      el.style.display = 'none';
      el.setAttribute('data-dr-credit-hidden', '1');
    });

    if (main && main.classList.contains('customer-main')) {
      main.style.display = 'flex';
      main.style.flexDirection = 'column';
      main.style.minHeight = 'calc(100vh - 4rem)';
    }
  }

  function applyLoginCredits() {
    document.querySelectorAll('.login-footer, .credit, [class*="credit"]').forEach(function (el) {
      if (el.id === 'dr-cust-credit-footer') return;
      if (el.closest && el.closest('#portal-customer')) return;
      if (isCreditNode(el) || /rights reserved/i.test(el.textContent || '')) {
        if (/lizzz|boyz at the back|rights reserved/i.test(el.textContent || '')) {
          el.textContent = TEXT;
          el.style.textAlign = 'center';
        }
      }
    });
  }

  function apply() {
    try {
      ensureCustomerFooter();
      applyLoginCredits();
    } catch (e) {}
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  setTimeout(apply, 400);
  setTimeout(apply, 1500);
  setTimeout(apply, 4000);
  setInterval(apply, 8000);

  document.addEventListener(
    'click',
    function () {
      setTimeout(apply, 200);
      setTimeout(apply, 600);
    },
    true
  );

  window.DRCreditFix = { refresh: apply, text: TEXT };
})();
