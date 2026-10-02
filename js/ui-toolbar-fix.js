/**
 * Divine Rays — toolbar / Show control polish
 * Styled to match system — ALWAYS visible (not removed)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UI_TOOLBAR_FIX_V2) return;
  window.__DR_UI_TOOLBAR_FIX_V2 = 1;
  window.__DR_UI_TOOLBAR_FIX = 1;

  var CSS = [
    /* —— Show limit control (always visible) —— */
    '.dr-limit-wrap{',
    '  display:inline-flex!important;align-items:center;gap:0.45rem;',
    '  padding:0.28rem 0.55rem 0.28rem 0.7rem;',
    '  border-radius:12px;',
    '  background:rgba(26,24,42,0.85)!important;',
    '  border:1px solid rgba(139,124,247,0.32)!important;',
    '  box-shadow:0 4px 14px rgba(0,0,0,0.18);',
    '  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
    '  visibility:visible!important;opacity:1!important}',
    '.dr-limit-wrap label{',
    '  font-size:0.78rem;font-weight:600;letter-spacing:0.02em;',
    '  color:#a5a5c0!important;margin:0;white-space:nowrap;cursor:default;',
    '  display:inline!important}',
    '.dr-limit-wrap #filter-limit, .dr-limit-wrap select.filter-select, #filter-limit{',
    '  appearance:none;-webkit-appearance:none;',
    '  display:inline-block!important;visibility:visible!important;',
    '  min-width:3.6rem;padding:0.35rem 1.6rem 0.35rem 0.55rem;',
    '  border-radius:9px;border:1px solid rgba(139,124,247,0.35)!important;',
    '  background:#12121c url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27%3E%3Cpath fill=%27%23c4b5fd%27 d=%27M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z%27/%3E%3C/svg%3E") no-repeat right 0.45rem center!important;',
    '  color:#eeeef6!important;font-size:0.85rem;font-weight:600;',
    '  cursor:pointer;outline:none;line-height:1.2}',
    '.dr-limit-wrap #filter-limit:hover, #filter-limit:hover{',
    '  border-color:rgba(167,139,250,0.55)!important}',
    '.dr-limit-wrap #filter-limit:focus, #filter-limit:focus{',
    '  border-color:#7c6af0!important;box-shadow:0 0 0 2px rgba(124,106,240,0.25)}',
    /* light theme */
    'html[data-theme="light"] .dr-limit-wrap{',
    '  background:rgba(255,255,255,0.92)!important;border-color:rgba(109,94,245,0.28)!important}',
    'html[data-theme="light"] .dr-limit-wrap label{color:#5b5675!important}',
    'html[data-theme="light"] .dr-limit-wrap #filter-limit, html[data-theme="light"] #filter-limit{',
    '  background:#f5f3ff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27%3E%3Cpath fill=%27%235b21b6%27 d=%27M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z%27/%3E%3C/svg%3E") no-repeat right 0.45rem center!important;',
    '  color:#1e1b4b!important;border-color:rgba(109,94,245,0.3)!important}',
    /* —— Pager —— */
    '.dr-ticket-pager{',
    '  display:flex!important;align-items:center;justify-content:center;gap:0.65rem;',
    '  margin:0.85rem 0 0.35rem;padding:0.35rem}',
    '.dr-page-btn{',
    '  padding:0.4rem 0.85rem;border-radius:10px;',
    '  border:1px solid rgba(139,124,247,0.35)!important;',
    '  background:rgba(26,24,42,0.9)!important;color:#c4b5fd!important;',
    '  font-size:0.82rem;font-weight:600;cursor:pointer;',
    '  transition:background .15s,border-color .15s}',
    '.dr-page-btn:hover:not(:disabled):not(.is-disabled){',
    '  background:rgba(124,106,240,0.22)!important;border-color:#7c6af0!important}',
    '.dr-page-btn:disabled, .dr-page-btn.is-disabled{',
    '  opacity:0.4;cursor:not-allowed}',
    '.dr-page-info{font-size:0.82rem;color:#9494ae;font-weight:500}',
    /* Admin table polish */
    '#view-admin .admin-table, #admin-users-list table{',
    '  width:100%;border-collapse:separate;border-spacing:0}',
    '#view-admin .admin-table th, #admin-users-list table th{',
    '  text-align:left;padding:0.65rem 0.75rem;font-size:0.72rem;',
    '  letter-spacing:0.04em;text-transform:uppercase;color:#9494ae;',
    '  border-bottom:1px solid rgba(139,124,247,0.2);background:rgba(12,12,20,0.55)}',
    '#view-admin .admin-table td, #admin-users-list table td{',
    '  padding:0.7rem 0.75rem;vertical-align:middle;',
    '  border-bottom:1px solid rgba(139,124,247,0.1);font-size:0.9rem}',
    '#view-admin .admin-actions{',
    '  display:inline-flex!important;align-items:center;gap:0.4rem;flex-wrap:wrap}',
    '#view-admin .admin-actions .btn, #view-admin .admin-actions button{',
    '  padding:0.32rem 0.7rem!important;font-size:0.8rem!important;',
    '  border-radius:9px!important;min-height:auto!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-ui-toolbar-fix-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-ui-toolbar-fix-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function ensureShowVisible() {
    var wrap = document.querySelector('.dr-limit-wrap');
    var lim = document.getElementById('filter-limit');
    if (wrap) {
      wrap.style.display = 'inline-flex';
      wrap.style.visibility = 'visible';
      wrap.style.opacity = '1';
    }
    if (lim) {
      lim.style.display = '';
      lim.style.visibility = 'visible';
      var parent = lim.closest('.dr-limit-wrap') || lim.parentElement;
      if (parent) {
        parent.style.display = parent.classList.contains('dr-limit-wrap') ? 'inline-flex' : '';
        parent.style.visibility = 'visible';
      }
    }
    // Place near filters / topbar actions so it's easy to find
    if (wrap) {
      var sort = document.getElementById('filter-sort');
      var host =
        document.getElementById('dr-list-toolbar-right') ||
        (sort && sort.parentElement) ||
        document.querySelector('.topbar-actions') ||
        document.querySelector('.filters, .filter-bar, .list-toolbar');
      if (host && wrap.parentNode !== host) {
        try {
          host.appendChild(wrap);
        } catch (e) {}
      }
    }
  }

  function tick() {
    inject();
    ensureShowVisible();
  }

  tick();
  setInterval(tick, 1800);
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 2800);
})();
