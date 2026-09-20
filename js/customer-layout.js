/**
 * Divine Rays — customer layout (only when .active)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_LAYOUT_V3) return;
  window.__DR_CUST_LAYOUT_V3 = 1;
  window.__DR_CUST_LAYOUT = 1;

  var CSS = [
    'body:has(#portal-agent.active) #dr-tour-help,',
    'body:has(#portal-agent.active) #dr-tour-bd,',
    'body:has(#portal-agent.active) #dr-tour-card,',
    'body:has(#portal-agent.active) #dr-notif-fab,',
    'body:has(#portal-agent.active) #dr-notif-panel,',
    'body:has(#portal-agent.active) #dr-notif-panel-bd{display:none!important;pointer-events:none!important;opacity:0!important}',
    '#portal-customer.active{',
    'display:block!important;width:100%!important;max-width:100%!important;',
    'margin:0!important;margin-left:0!important;',
    'padding-top:64px!important;padding-left:1rem!important;padding-right:1rem!important;padding-bottom:3rem!important;',
    'left:0!important;right:0!important;box-sizing:border-box!important;transform:none!important}',
    '#portal-customer.active .customer-main, #portal-customer.active main.customer-main{',
    'display:block!important;width:100%!important;max-width:720px!important;',
    'margin-left:auto!important;margin-right:auto!important;',
    'padding-left:0.75rem!important;padding-right:0.75rem!important;padding-bottom:2rem!important;',
    'box-sizing:border-box!important;left:0!important;transform:none!important;position:relative!important}',
    '#portal-customer.active .customer-tabs{display:flex!important;width:100%!important;box-sizing:border-box!important;flex-wrap:wrap!important}',
    '#portal-customer.active .ticket-form,#portal-customer.active #customer-form{width:100%!important;max-width:100%!important;box-sizing:border-box!important}',
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
    return !!(pc && pc.classList.contains('active'));
  }

  function syncTourVisibility() {
    var show = isCustomerVisible();
    ['dr-tour-help', 'dr-tour-bd', 'dr-tour-card', 'dr-notif-fab'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (show) {
        if (id === 'dr-tour-help' || id === 'dr-notif-fab') el.style.removeProperty('display');
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
