/**
 * Divine Rays — Knowledge Base table v3
 * Column lines + readable side-by-side Edit/Delete
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_KB_TABLE_FIX >= 3) return;
  window.__DR_KB_TABLE_FIX = 3;

  var CSS = [
    '#view-kb table.kb-table, #view-kb table.perf-table, #kb-manage-list table, table.kb-table, table.perf-table.kb-table {',
    '  width:100%!important; table-layout:fixed!important; border-collapse:collapse!important;',
    '  border:1px solid rgba(139,124,247,.28)!important; border-radius:12px!important; overflow:hidden!important;',
    '  background:rgba(0,0,0,.18)!important }',

    '#view-kb table.kb-table th, #view-kb table.kb-table td,',
    '#kb-manage-list table th, #kb-manage-list table td, table.kb-table th, table.kb-table td {',
    '  border-right:1px solid rgba(139,124,247,.22)!important; border-bottom:1px solid rgba(139,124,247,.12)!important;',
    '  padding:.7rem .85rem!important; vertical-align:middle!important; text-align:left!important }',

    /* Data columns can ellipsis; NOT the actions column */
    '#view-kb table.kb-table th:not(:last-child), #view-kb table.kb-table td:not(:last-child),',
    'table.kb-table th:not(:last-child), table.kb-table td:not(:last-child) {',
    '  overflow:hidden!important; text-overflow:ellipsis!important; white-space:nowrap!important }',

    '#view-kb table.kb-table th:last-child, #view-kb table.kb-table td:last-child,',
    'table.kb-table th:last-child, table.kb-table td:last-child { border-right:none!important }',

    '#view-kb table.kb-table thead th, table.kb-table thead th {',
    '  background:rgba(0,0,0,.35)!important; color:#a8a8c0!important; font-size:.68rem!important;',
    '  font-weight:700!important; letter-spacing:.06em!important; text-transform:uppercase!important }',

    /* Wider last column for buttons */
    '#view-kb table.kb-table th:nth-child(1), #view-kb table.kb-table td:nth-child(1),',
    'table.kb-table th:nth-child(1), table.kb-table td:nth-child(1) { width:26%!important }',
    '#view-kb table.kb-table th:nth-child(2), #view-kb table.kb-table td:nth-child(2),',
    'table.kb-table th:nth-child(2), table.kb-table td:nth-child(2) { width:12%!important }',
    '#view-kb table.kb-table th:nth-child(3), #view-kb table.kb-table td:nth-child(3),',
    'table.kb-table th:nth-child(3), table.kb-table td:nth-child(3) { width:12%!important; text-align:center!important }',
    '#view-kb table.kb-table th:nth-child(4), #view-kb table.kb-table td:nth-child(4),',
    'table.kb-table th:nth-child(4), table.kb-table td:nth-child(4) { width:13%!important }',
    '#view-kb table.kb-table th:nth-child(5), #view-kb table.kb-table td:nth-child(5),',
    'table.kb-table th:nth-child(5), table.kb-table td:nth-child(5) { width:13%!important }',
    '#view-kb table.kb-table th:nth-child(6), #view-kb table.kb-table td:nth-child(6),',
    'table.kb-table th:nth-child(6), table.kb-table td:nth-child(6) {',
    '  width:24%!important; min-width:160px!important; overflow:visible!important;',
    '  white-space:nowrap!important; text-overflow:clip!important; text-align:right!important }',

    '.kb-row-actions, #view-kb table.kb-table td.kb-row-actions, table.kb-table td.kb-row-actions {',
    '  display:inline-flex!important; flex-direction:row!important; flex-wrap:nowrap!important;',
    '  align-items:center!important; justify-content:flex-end!important; gap:8px!important;',
    '  overflow:visible!important; white-space:nowrap!important; width:100%!important }',

    '.kb-row-actions .btn, .kb-row-actions .kb-edit, .kb-row-actions .kb-del,',
    '#view-kb table.kb-table .kb-edit, #view-kb table.kb-table .kb-del,',
    'table.kb-table .kb-edit, table.kb-table .kb-del {',
    '  display:inline-flex!important; align-items:center!important; justify-content:center!important;',
    '  height:28px!important; min-height:28px!important; padding:0 12px!important; margin:0!important;',
    '  font-size:12px!important; font-weight:600!important; line-height:1!important;',
    '  border-radius:7px!important; width:auto!important; min-width:58px!important;',
    '  max-width:none!important; flex:0 0 auto!important; box-shadow:none!important;',
    '  overflow:visible!important; white-space:nowrap!important; text-overflow:clip!important;',
    '  letter-spacing:0!important }',

    '#view-kb table.kb-table .kb-edit, table.kb-table .kb-edit, .kb-row-actions .kb-edit {',
    '  background:#7c6af0!important; color:#fff!important; border:none!important }',
    '#view-kb table.kb-table .kb-del, table.kb-table .kb-del, .kb-row-actions .kb-del {',
    '  background:#ef4444!important; color:#fff!important; border:none!important }',

    'html[data-theme="light"] #view-kb table.kb-table, html[data-theme="light"] table.kb-table {',
    '  border-color:rgba(0,0,0,.12)!important; background:#fff!important }',
    'html[data-theme="light"] #view-kb table.kb-table th, html[data-theme="light"] #view-kb table.kb-table td,',
    'html[data-theme="light"] table.kb-table th, html[data-theme="light"] table.kb-table td {',
    '  border-right-color:rgba(0,0,0,.1)!important; border-bottom-color:rgba(0,0,0,.07)!important; color:#1a1a2e!important }',
    'html[data-theme="light"] #view-kb table.kb-table thead th, html[data-theme="light"] table.kb-table thead th {',
    '  background:rgba(109,94,245,.08)!important; color:#4a4a68!important }',

    '#view-kb table.kb-table tbody tr:hover td, table.kb-table tbody tr:hover td {',
    '  background:rgba(139,124,247,.08)!important }'
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
  setTimeout(inject, 400);
  setTimeout(inject, 1200);
  setTimeout(inject, 3000);
})();
