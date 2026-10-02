/**
 * Divine Rays — Knowledge Base table column lines + spacing
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_KB_TABLE_FIX) return;
  window.__DR_KB_TABLE_FIX = 1;

  var CSS = [
    /* Full-width fixed layout so columns don't collapse */
    '#view-kb table.kb-table,',
    '#view-kb table.perf-table,',
    '#kb-manage-list table,',
    'table.kb-table,',
    'table.perf-table.kb-table {',
    '  width: 100% !important;',
    '  table-layout: fixed !important;',
    '  border-collapse: collapse !important;',
    '  border: 1px solid rgba(139,124,247,0.28) !important;',
    '  border-radius: 12px !important;',
    '  overflow: hidden !important;',
    '  background: rgba(0,0,0,0.18) !important;',
    '}',

    /* Header + cells: padding + vertical | lines */
    '#view-kb table.kb-table th,',
    '#view-kb table.kb-table td,',
    '#kb-manage-list table th,',
    '#kb-manage-list table td,',
    'table.kb-table th,',
    'table.kb-table td {',
    '  border-right: 1px solid rgba(139,124,247,0.22) !important;',
    '  border-bottom: 1px solid rgba(139,124,247,0.12) !important;',
    '  padding: 0.85rem 1rem !important;',
    '  vertical-align: middle !important;',
    '  text-align: left !important;',
    '  overflow: hidden !important;',
    '  text-overflow: ellipsis !important;',
    '  white-space: nowrap !important;',
    '}',

    /* No right border on last column */
    '#view-kb table.kb-table th:last-child,',
    '#view-kb table.kb-table td:last-child,',
    '#kb-manage-list table th:last-child,',
    '#kb-manage-list table td:last-child,',
    'table.kb-table th:last-child,',
    'table.kb-table td:last-child {',
    '  border-right: none !important;',
    '}',

    /* Header style */
    '#view-kb table.kb-table thead th,',
    '#kb-manage-list table thead th,',
    'table.kb-table thead th {',
    '  background: rgba(0,0,0,0.35) !important;',
    '  color: #a8a8c0 !important;',
    '  font-size: 0.68rem !important;',
    '  font-weight: 700 !important;',
    '  letter-spacing: 0.06em !important;',
    '  text-transform: uppercase !important;',
    '}',

    /* Column widths: Title | Category | Status | Published by | Updated | Actions */
    '#view-kb table.kb-table th:nth-child(1), #view-kb table.kb-table td:nth-child(1),',
    'table.kb-table th:nth-child(1), table.kb-table td:nth-child(1) { width: 30% !important; }',
    '#view-kb table.kb-table th:nth-child(2), #view-kb table.kb-table td:nth-child(2),',
    'table.kb-table th:nth-child(2), table.kb-table td:nth-child(2) { width: 14% !important; }',
    '#view-kb table.kb-table th:nth-child(3), #view-kb table.kb-table td:nth-child(3),',
    'table.kb-table th:nth-child(3), table.kb-table td:nth-child(3) { width: 12% !important; text-align: center !important; }',
    '#view-kb table.kb-table th:nth-child(4), #view-kb table.kb-table td:nth-child(4),',
    'table.kb-table th:nth-child(4), table.kb-table td:nth-child(4) { width: 16% !important; }',
    '#view-kb table.kb-table th:nth-child(5), #view-kb table.kb-table td:nth-child(5),',
    'table.kb-table th:nth-child(5), table.kb-table td:nth-child(5) { width: 14% !important; }',
    '#view-kb table.kb-table th:nth-child(6), #view-kb table.kb-table td:nth-child(6),',
    'table.kb-table th:nth-child(6), table.kb-table td:nth-child(6) { width: 14% !important; white-space: normal !important; }',

    /* Light mode */
    'html[data-theme="light"] #view-kb table.kb-table,',
    'html[data-theme="light"] table.kb-table {',
    '  border-color: rgba(0,0,0,0.12) !important;',
    '  background: #fff !important;',
    '}',
    'html[data-theme="light"] #view-kb table.kb-table th,',
    'html[data-theme="light"] #view-kb table.kb-table td,',
    'html[data-theme="light"] table.kb-table th,',
    'html[data-theme="light"] table.kb-table td {',
    '  border-right-color: rgba(0,0,0,0.1) !important;',
    '  border-bottom-color: rgba(0,0,0,0.07) !important;',
    '  color: #1a1a2e !important;',
    '}',
    'html[data-theme="light"] #view-kb table.kb-table thead th,',
    'html[data-theme="light"] table.kb-table thead th {',
    '  background: rgba(109,94,245,0.08) !important;',
    '  color: #4a4a68 !important;',
    '}',

    /* Row hover */
    '#view-kb table.kb-table tbody tr:hover td,',
    'table.kb-table tbody tr:hover td {',
    '  background: rgba(139,124,247,0.08) !important;',
    '}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-kb-table-fix');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-kb-table-fix';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  inject();
  setTimeout(inject, 500);
  setTimeout(inject, 1500);
  setTimeout(inject, 3500);
})();
