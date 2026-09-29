/**
 * Divine Rays — customer tab exclusive active + single dropdown arrow
 * Credit: Boyz at the Back
 */
(function () {
  'use strict';
  if (window.__DR_CUST_TABS_FIX) return;
  window.__DR_CUST_TABS_FIX = 1;

  var STYLE_ID = 'dr-cust-tabs-fix-css';
  var CSS = [
    /* Exclusive tab look */
    '#portal-customer .customer-tabs .ctab{',
    'background:#1a1a24!important;color:#9898b0!important;',
    'border:1px solid transparent!important;box-shadow:none!important}',
    '#portal-customer .customer-tabs .ctab:hover{',
    'background:rgba(109,94,245,0.14)!important;color:#ddd6fe!important}',
    '#portal-customer .customer-tabs .ctab.active{',
    'background:linear-gradient(145deg,#7c6af8,#5b4ce0)!important;color:#fff!important;',
    'border-color:transparent!important;',
    'box-shadow:0 4px 14px rgba(91,76,224,0.35)!important}',

    /* Single custom caret — kill native white arrow */
    '#portal-customer select,',
    '#kb-filter-cat,',
    '#portal-customer #kb-filter-cat{',
    'appearance:none!important;-webkit-appearance:none!important;-moz-appearance:none!important;',
    'background-color:rgba(12,12,20,0.55)!important;',
    'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23a78bfa\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E")!important;',
    'background-repeat:no-repeat!important;',
    'background-position:right 0.75rem center!important;',
    'background-size:12px 8px!important;',
    'padding-right:2.1rem!important}',
    '#portal-customer select::-ms-expand,',
    '#kb-filter-cat::-ms-expand{display:none!important}',

    'html[data-theme="light"] #portal-customer .customer-tabs .ctab{',
    'background:#f3f1fa!important;color:#5a5a78!important}',
    'html[data-theme="light"] #portal-customer .customer-tabs .ctab.active{',
    'background:linear-gradient(145deg,#7c6af8,#5b4ce0)!important;color:#fff!important}',
    'html[data-theme="light"] #portal-customer select,',
    'html[data-theme="light"] #kb-filter-cat{',
    'background-color:#fff!important;',
    'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%235b21b6\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E")!important;',
    'background-repeat:no-repeat!important;',
    'background-position:right 0.75rem center!important;',
    'background-size:12px 8px!important}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function setActiveTab(nameOrBtn) {
    var tabs = document.querySelectorAll('#portal-customer .customer-tabs .ctab');
    if (!tabs.length) return;
    var activeBtn = null;
    if (typeof nameOrBtn === 'string') {
      activeBtn = document.querySelector('#portal-customer .ctab[data-ctab="' + nameOrBtn + '"]');
    } else if (nameOrBtn && nameOrBtn.classList) {
      activeBtn = nameOrBtn;
    }
    tabs.forEach(function (t) {
      t.classList.toggle('active', t === activeBtn);
    });
    var panels = document.querySelectorAll('#portal-customer .ctab-panel');
    var id = activeBtn && activeBtn.getAttribute('data-ctab');
    panels.forEach(function (p) {
      var want = id ? 'ctab-' + id : null;
      p.classList.toggle('active', want && p.id === want);
    });
  }

  function wireTabs() {
    document.querySelectorAll('#portal-customer .customer-tabs .ctab').forEach(function (btn) {
      if (btn.__drTabFix) return;
      btn.__drTabFix = true;
      btn.addEventListener(
        'click',
        function () {
          // Run after app.js / kb.js handlers
          setTimeout(function () {
            setActiveTab(btn);
          }, 0);
          setTimeout(function () {
            setActiveTab(btn);
          }, 50);
        },
        true
      );
    });
  }

  function boot() {
    injectCss();
    wireTabs();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600);
  setTimeout(boot, 1500);
  setTimeout(boot, 3000);

  window.DRCustomerTabsFix = { setActiveTab: setActiveTab, refresh: boot };
})();
