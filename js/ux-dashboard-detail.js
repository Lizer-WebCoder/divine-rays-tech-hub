/**
 * Divine Rays — UX cohesion (safe): ticket detail + light spacing only
 * Avoid forcing dashboard grids (that broke layout / hid sections)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UX_DASH_DETAIL_V2) return;
  window.__DR_UX_DASH_DETAIL_V2 = 1;

  var CSS = [
    '#view-dashboard .stats-heading, #portal-agent .stats-heading {',
    '  margin: 0.35rem 0 0.55rem !important;',
    '  font-size: 0.72rem !important;',
    '  font-weight: 700 !important;',
    '  text-transform: uppercase !important;',
    '  letter-spacing: 0.07em !important;',
    '  color: #a78bfa !important;',
    '}',
    'html[data-theme="light"] #view-dashboard .stats-heading, html[data-theme="light"] #portal-agent .stats-heading {',
    '  color: #5b21b6 !important;',
    '}',
    '#view-dashboard .stat-card, #portal-agent .stat-card {',
    '  min-width: 0 !important;',
    '}',
    '#view-dashboard .stats-section {',
    '  margin-bottom: 0.85rem !important;',
    '}',
    '.ticket-card {',
    '  margin-bottom: 0.5rem !important;',
    '}',
    '#ticket-detail, .ticket-detail {',
    '  padding: 1.2rem 1.25rem !important;',
    '}',
    '#ticket-detail h2, #ticket-detail h3, .ticket-detail h2, .ticket-detail h3 {',
    '  margin: 0 0 0.4rem !important;',
    '  font-size: 1.25rem !important;',
    '  font-weight: 700 !important;',
    '  letter-spacing: -0.02em !important;',
    '  line-height: 1.3 !important;',
    '}',
    '.detail-meta, #ticket-detail .detail-meta, .meta-row {',
    '  display: flex !important;',
    '  flex-wrap: wrap !important;',
    '  gap: 0.4rem !important;',
    '  margin: 0.5rem 0 0.85rem !important;',
    '  align-items: center !important;',
    '}',
    '.agent-actions, #agent-actions {',
    '  padding: 1rem 1.15rem !important;',
    '  margin-bottom: 0.85rem !important;',
    '}',
    '.agent-actions label {',
    '  font-size: 0.72rem !important;',
    '  font-weight: 600 !important;',
    '  text-transform: uppercase !important;',
    '  letter-spacing: 0.04em !important;',
    '  color: #9898b0 !important;',
    '}',
    'html[data-theme="light"] .agent-actions label { color: #6b7280 !important; }',
    '.comments-section h4, .comments-section h3 {',
    '  margin: 0 0 0.65rem !important;',
    '  font-size: 0.92rem !important;',
    '  font-weight: 700 !important;',
    '  color: #c4b5fd !important;',
    '}',
    'html[data-theme="light"] .comments-section h4 { color: #5b21b6 !important; }',
    '.empty-state {',
    '  padding: 2rem 1.25rem !important;',
    '  border-radius: 14px !important;',
    '  border: 1px dashed rgba(139, 124, 247, 0.28) !important;',
    '  text-align: center !important;',
    '  color: #9898b0 !important;',
    '}',
    'html[data-theme="light"] .empty-state {',
    '  border-color: rgba(109, 94, 245, 0.22) !important;',
    '  color: #4b5563 !important;',
    '  background: rgba(245, 243, 255, 0.55) !important;',
    '}'
  ].join(String.fromCharCode(10));

  function inject() {
    var old = document.getElementById('dr-ux-dash-detail-css');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var el = document.getElementById('dr-ux-dash-detail-css-v2');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-ux-dash-detail-css-v2';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  inject();
  setTimeout(inject, 400);
  setTimeout(inject, 1500);
  window.DRUxDashDetail = { refresh: inject };
})();
