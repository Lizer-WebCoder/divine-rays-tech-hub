/**
 * Divine Rays — stable customer layout (no jump)
 * CSS-only; tour hidden on agent
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_LAYOUT_V2) return;
  window.__DR_CUST_LAYOUT_V2 = 1;
  window.__DR_CUST_LAYOUT = 1;

  var CSS = [
    'body:has(#portal-agent.active) #dr-tour-help,',
    'body:has(#portal-agent.active) #dr-tour-bd,',
    'body:has(#portal-agent.active) #dr-tour-card{display:none!important;pointer-events:none!important;opacity:0!important}',
    '#portal-customer.active, #portal-customer:not([hidden]){',
    'display:block!important;width:100%!important;max-width:100%!important;',
    'margin:0!important;margin-left:0!important;',
    'padding-top:64px!important;padding-left:1rem!important;padding-right:1rem!important;padding-bottom:3rem!important;',
    'left:0!important;right:0!important;box-sizing:border-box!important;transform:none!important}',
    '#portal-customer .customer-main, main.customer-main{',
    'display:block!important;width:100%!important;max-width:720px!important;',
    'margin-left:auto!important;margin-right:auto!important;',
    'padding-left:0.75rem!important;padding-right:0.75rem!important;padding-bottom:2rem!important;',
    'box-sizing:border-box!important;left:0!important;transform:none!important;position:relative!important}',
    '#portal-customer .customer-tabs{display:flex!important;width:100%!important;box-sizing:border-box!important;flex-wrap:wrap!important}',
    '#portal-customer .ticket-form,#customer-form{width:100%!important;max-width:100%!important;box-sizing:border-box!important}',
    '#dr-tour-help{position:fixed;left:1rem;bottom:1.15rem;z-index:12000}'
  ].join('');

  function inject() {
    var s = document.getElementById('dr-cust-layout-css');
    if (!s) {
      s = document.createElement('style');
      s.id = 'dr-cust-layout-css';
      document.head.appendChild(s);
    }
    s.textContent = CSS;
  }

  function isCustomerVisible() {
    var pc = document.getElementById('portal-customer');
    if (!pc || pc.hidden) return false;
    var pa = document.getElementById('portal-agent');
    if (pa && pa.classList.contains('active')) return false;
    if (pc.classList.contains('active')) return true;
    var st = window.getComputedStyle(pc);
    return st.display !== 'none' && st.visibility !== 'hidden' && pc.offsetHeight > 40;
  }

  function syncTourVisibility() {
    var help = document.getElementById('dr-tour-help');
    var bd = document.getElementById('dr-tour-bd');
    var card = document.getElementById('dr-tour-card');
    var show = isCustomerVisible();
    [help, bd, card].forEach(function (el) {
      if (!el) return;
      if (show) {
        if (el.id === 'dr-tour-help') el.style.removeProperty('display');
      } else {
        el.style.setProperty('display', 'none', 'important');
        if (el.classList) el.classList.remove('open');
      }
    });
  }

  inject();
  syncTourVisibility();
  setInterval(syncTourVisibility, 2000);
  window.DRCustLayout = { force: function () { inject(); syncTourVisibility(); } };
})();
