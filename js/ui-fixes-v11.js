/**
 * Divine Rays UI fixes v11
 * - KB table: aligned columns + vertical separators
 * - Ticket filters / Show limit / Showing count
 * - Help tour restore (end-user)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UI_FIXES_V11) return;
  window.__DR_UI_FIXES_V11 = 1;

  var CSS = [
    '#view-kb table.kb-table, #view-kb table.perf-table, #kb-manage-list table, table.kb-table {',
    '  width:100%!important; table-layout:fixed!important; border-collapse:collapse!important;',
    '  border:1px solid rgba(139,124,247,.22)!important; border-radius:12px!important; overflow:hidden!important }',
    '#view-kb table.kb-table th, #view-kb table.kb-table td,',
    'table.kb-table th, table.kb-table td, #kb-manage-list table th, #kb-manage-list table td {',
    '  border-right:1px solid rgba(139,124,247,.14)!important;',
    '  border-bottom:1px solid rgba(139,124,247,.12)!important;',
    '  padding:.75rem .9rem!important; vertical-align:middle!important;',
    '  text-align:left!important; overflow:hidden; text-overflow:ellipsis }',
    '#view-kb table.kb-table th:last-child, #view-kb table.kb-table td:last-child,',
    'table.kb-table th:last-child, table.kb-table td:last-child { border-right:none!important }',
    '#view-kb table.kb-table thead th, table.kb-table thead th {',
    '  background:rgba(0,0,0,.32)!important; color:#a8a8c0!important; font-size:.68rem!important;',
    '  font-weight:700!important; letter-spacing:.05em!important; text-transform:uppercase!important }',
    'html[data-theme="light"] #view-kb table.kb-table thead th, html[data-theme="light"] table.kb-table thead th {',
    '  background:rgba(109,94,245,.08)!important; color:#4a4a68!important }',
    'html[data-theme="light"] #view-kb table.kb-table th, html[data-theme="light"] #view-kb table.kb-table td,',
    'html[data-theme="light"] table.kb-table th, html[data-theme="light"] table.kb-table td {',
    '  border-right-color:rgba(0,0,0,.08)!important; border-bottom-color:rgba(0,0,0,.06)!important; color:#1a1a2e!important }',
    '#view-kb table.kb-table th:nth-child(1), #view-kb table.kb-table td:nth-child(1),',
    'table.kb-table th:nth-child(1), table.kb-table td:nth-child(1) { width:28%!important }',
    '#view-kb table.kb-table th:nth-child(2), #view-kb table.kb-table td:nth-child(2),',
    'table.kb-table th:nth-child(2), table.kb-table td:nth-child(2) { width:14%!important }',
    '#view-kb table.kb-table th:nth-child(3), #view-kb table.kb-table td:nth-child(3),',
    'table.kb-table th:nth-child(3), table.kb-table td:nth-child(3) { width:12%!important }',
    '#view-kb table.kb-table th:nth-child(4), #view-kb table.kb-table td:nth-child(4),',
    'table.kb-table th:nth-child(4), table.kb-table td:nth-child(4) { width:14%!important }',
    '#view-kb table.kb-table th:nth-child(5), #view-kb table.kb-table td:nth-child(5),',
    'table.kb-table th:nth-child(5), table.kb-table td:nth-child(5) { width:14%!important }',
    '#view-kb table.kb-table th:nth-child(6), #view-kb table.kb-table td:nth-child(6),',
    'table.kb-table th:nth-child(6), table.kb-table td:nth-child(6) { width:18%!important; text-align:right!important }',
    '.list-header, .view-header, #view-tickets .top, .tickets-toolbar {',
    '  display:flex!important; flex-wrap:wrap!important; align-items:center!important; gap:.55rem!important;',
    '  width:100%!important; box-sizing:border-box!important }',
    '#filter-hint, .filter-hint, #list-hint, .list-hint {',
    '  display:block!important; visibility:visible!important; opacity:1!important;',
    '  color:#9494ae!important; font-size:.8rem!important; margin:.35rem 0 .5rem!important;',
    '  white-space:normal!important; max-width:100%!important }',
    'html[data-theme="light"] #filter-hint, html[data-theme="light"] .filter-hint { color:#5a5a78!important }',
    '.dr-limit-wrap { display:inline-flex!important; align-items:center!important; gap:.35rem!important;',
    '  font-size:.78rem!important; color:#9494ae!important }',
    '.dr-limit-wrap select, #filter-limit { min-width:4rem!important }',
    '.dr-ticket-pager { display:flex!important; align-items:center!important; gap:.5rem!important;',
    '  margin:.65rem 0 1rem!important; flex-wrap:wrap!important }',
    '.dr-page-btn { border-radius:999px; padding:.3rem .75rem; font-size:.78rem; cursor:pointer;',
    '  border:1px solid rgba(139,124,247,.35); background:rgba(26,26,36,.85); color:#c4b5fd }',
    '.dr-page-btn.is-disabled, .dr-page-btn:disabled { opacity:.4; cursor:not-allowed }',
    'body:has(#portal-customer.active) #dr-tour-help {',
    '  display:inline-flex!important; visibility:visible!important; opacity:1!important;',
    '  pointer-events:auto!important; position:fixed!important; left:1rem!important; bottom:1.15rem!important;',
    '  z-index:12000!important }',
    'body:has(#portal-agent.active) #dr-tour-help, body.dr-tl-on #dr-tour-help {',
    '  display:none!important }'
  ].join('\n');

  function injectCss() {
    var el = document.getElementById('dr-ui-fixes-v11-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-ui-fixes-v11-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function ensureFilterHint() {
    var host =
      document.getElementById('filter-hint') ||
      document.querySelector('.filter-hint') ||
      document.getElementById('list-hint');
    if (host) return host;
    var list = document.getElementById('ticket-list');
    if (!list || !list.parentNode) return null;
    var h = document.createElement('div');
    h.id = 'filter-hint';
    h.className = 'filter-hint';
    list.parentNode.insertBefore(h, list);
    return h;
  }

  function rebindFilters() {
    if (window.DRFilters && typeof window.DRFilters.ensureControls === 'function') {
      try { window.DRFilters.ensureControls(); } catch (e) {}
    }
    if (window.DRFilters && typeof window.DRFilters.refresh === 'function') {
      try { window.DRFilters.refresh(); } catch (e) {}
    }
    if (typeof window.DRClearFilters === 'function') {
      var btn = document.getElementById('btn-clear-filters');
      if (btn && !btn.__v11) {
        btn.__v11 = 1;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          try { window.DRClearFilters(); } catch (err) {}
        });
      }
    }
    ensureFilterHint();
  }

  function ensureHelpTour() {
    var customer = document.getElementById('portal-customer');
    var isCustomer = customer && customer.classList.contains('active');
    if (!isCustomer) return;

    if (window.DRCustomerUx && typeof window.DRCustomerUx.startTour === 'function') {
      var help = document.getElementById('dr-tour-help');
      if (!help) {
        help = document.createElement('button');
        help.type = 'button';
        help.id = 'dr-tour-help';
        help.textContent = '? Help tour';
        document.body.appendChild(help);
      }
      help.style.setProperty('display', 'inline-flex', 'important');
      help.style.setProperty('visibility', 'visible', 'important');
      help.style.setProperty('pointer-events', 'auto', 'important');
      if (!help.__v11) {
        help.__v11 = 1;
        help.addEventListener('click', function (e) {
          e.preventDefault();
          try { window.DRCustomerUx.startTour(); } catch (err) { console.warn(err); }
        });
      }
    }
  }

  function polishKbTable() {
    document.querySelectorAll('#view-kb table, #kb-manage-list table, table.kb-table').forEach(function (table) {
      table.classList.add('kb-table');
      table.style.setProperty('table-layout', 'fixed', 'important');
      table.style.setProperty('width', '100%', 'important');
      table.style.setProperty('border-collapse', 'collapse', 'important');
    });
  }

  function tick() {
    injectCss();
    rebindFilters();
    ensureHelpTour();
    polishKbTable();
  }

  injectCss();
  setTimeout(tick, 500);
  setTimeout(tick, 1500);
  setTimeout(tick, 3000);
  setInterval(function () {
    ensureHelpTour();
    polishKbTable();
  }, 4000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      if (t.closest && (t.closest('.nav-btn') || t.closest('#btn-clear-filters') || t.id === 'kb-btn-new')) {
        setTimeout(tick, 200);
        setTimeout(tick, 800);
      }
    },
    true
  );

  window.DRUiFixesV11 = { refresh: tick };
})();
