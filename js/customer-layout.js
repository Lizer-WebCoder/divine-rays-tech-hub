/**
 * Divine Rays — customer layout lower + no left clip
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_LAYOUT) return;
  window.__DR_CUST_LAYOUT = 1;

  var CSS = [
    '#portal-customer,#portal-customer.active{display:block!important;width:100%!important;max-width:100%!important;',
    'margin:0!important;margin-left:0!important;padding:72px 1rem 3rem!important;left:0!important;right:0!important;',
    'box-sizing:border-box!important;transform:none!important;overflow-x:visible!important}',
    '#portal-customer .customer-main,main.customer-main,.customer-main{display:block!important;width:100%!important;',
    'max-width:720px!important;margin:0 auto!important;padding:0 .75rem 2rem!important;box-sizing:border-box!important;',
    'left:0!important;transform:none!important;position:relative!important}',
    '#portal-customer .customer-tabs,.customer-tabs{display:flex!important;width:100%!important;box-sizing:border-box!important;flex-wrap:wrap!important}',
    '#portal-customer .ctab,.ctab{min-width:0!important;flex:1 1 auto!important}',
    '#portal-customer .ticket-form,#customer-form,.ticket-form{width:100%!important;max-width:100%!important;box-sizing:border-box!important}',
    '#portal-customer input,#portal-customer select,#portal-customer textarea{max-width:100%!important;box-sizing:border-box!important}',
    '.mode-bar{position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:300!important}',
    'html,body{overflow-x:auto!important}'
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

  function force() {
    inject();
    var pc = document.getElementById('portal-customer');
    if (!pc) return;
    var st = window.getComputedStyle(pc);
    var on = !pc.hidden && st.display !== 'none' && (pc.classList.contains('active') || pc.offsetHeight > 40);
    if (!on) return;

    pc.style.setProperty('padding-top', '72px', 'important');
    pc.style.setProperty('padding-left', '1rem', 'important');
    pc.style.setProperty('padding-right', '1rem', 'important');
    pc.style.setProperty('margin-left', '0', 'important');
    pc.style.setProperty('width', '100%', 'important');
    pc.style.setProperty('max-width', '100%', 'important');
    pc.style.setProperty('left', '0', 'important');
    pc.style.setProperty('transform', 'none', 'important');

    var cm = pc.querySelector('.customer-main') || document.querySelector('main.customer-main');
    if (cm) {
      cm.style.setProperty('margin-left', 'auto', 'important');
      cm.style.setProperty('margin-right', 'auto', 'important');
      cm.style.setProperty('max-width', '720px', 'important');
      cm.style.setProperty('width', '100%', 'important');
      cm.style.setProperty('transform', 'none', 'important');
      cm.style.setProperty('left', '0', 'important');
    }
    pc.querySelectorAll('main, .main').forEach(function (el) {
      el.style.setProperty('margin-left', el.classList.contains('customer-main') ? 'auto' : '0', 'important');
    });
  }

  inject();
  force();
  setInterval(force, 1200);
  window.addEventListener('resize', force);
  window.DRCustLayout = { force: force };
})();
