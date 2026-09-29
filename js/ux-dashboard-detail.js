/**
 * Divine Rays — UX cohesion: Agent Dashboard + Ticket Detail
 * Spacing, hierarchy, empty states, primary actions
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UX_DASH_DETAIL) return;
  window.__DR_UX_DASH_DETAIL = 1;

  var CSS = [
    '#portal-agent .main, #portal-agent .content, #view-dashboard { gap: 0; }',
    '#view-dashboard .stats-section, #portal-agent .stats-section { margin-bottom: 1.35rem !important; }',
    '#view-dashboard .stats, #portal-agent .stats { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 0.85rem !important; }',
    '#view-dashboard .stats-heading, #portal-agent .stats-heading { margin: 0 0 0.75rem !important; font-size: 0.72rem !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; color: #a78bfa !important; }',
    'html[data-theme="light"] #view-dashboard .stats-heading, html[data-theme="light"] #portal-agent .stats-heading { color: #5b21b6 !important; }',
    '#agent-perf-list.team-board, .team-board { margin-top: 0.5rem !important; gap: 1.1rem !important; }',
    '.chart-row { gap: 1rem !important; }',
    '#ticket-list, .ticket-list, #unassigned-list, #my-tickets-list, #all-tickets-list { display: flex !important; flex-direction: column !important; gap: 0.65rem !important; }',
    '.ticket-card { padding: 0.95rem 1.15rem !important; gap: 0.65rem !important; }',
    '.ticket-card h4 { margin: 0 0 0.3rem !important; font-size: 0.98rem !important; line-height: 1.3 !important; }',
    '#ticket-detail, .ticket-detail, #view-detail { padding: 1.35rem 1.4rem !important; margin-bottom: 1rem !important; }',
    '#ticket-detail h2, #ticket-detail h3, .ticket-detail h2, .ticket-detail h3 { margin: 0 0 0.5rem !important; font-size: 1.35rem !important; font-weight: 700 !important; letter-spacing: -0.02em !important; line-height: 1.25 !important; color: #eeeef6 !important; }',
    'html[data-theme="light"] #ticket-detail h2, html[data-theme="light"] #ticket-detail h3, html[data-theme="light"] .ticket-detail h2, html[data-theme="light"] .ticket-detail h3 { color: #1e1b4b !important; }',
    '.detail-meta, #ticket-detail .detail-meta, .meta-row { display: flex !important; flex-wrap: wrap !important; gap: 0.4rem !important; margin: 0.65rem 0 1rem !important; align-items: center !important; }',
    '.detail-meta .badge, .detail-meta span.badge, .detail-meta > span, .meta-chip { display: inline-flex !important; align-items: center !important; gap: 0.25rem !important; padding: 0.28rem 0.6rem !important; border-radius: 999px !important; font-size: 0.72rem !important; font-weight: 600 !important; line-height: 1.2 !important; background: rgba(139, 124, 247, 0.12) !important; border: 1px solid rgba(139, 124, 247, 0.22) !important; color: #c4c4d4 !important; }',
    'html[data-theme="light"] .detail-meta > span, html[data-theme="light"] .meta-chip { background: #f5f3ff !important; border-color: rgba(109, 94, 245, 0.2) !important; color: #374151 !important; }',
    '#btn-back, .btn-back, button[data-action="back"] { margin-bottom: 0.85rem !important; border-radius: 10px !important; font-weight: 600 !important; }',
    '#ticket-detail .ticket-body, #ticket-detail .description, .ticket-detail .ticket-body, .ticket-detail .description { margin: 0.75rem 0 1.1rem !important; line-height: 1.55 !important; font-size: 0.95rem !important; color: #d4d4e8 !important; }',
    'html[data-theme="light"] #ticket-detail .ticket-body, html[data-theme="light"] .ticket-detail .description { color: #374151 !important; }',
    '.agent-actions, #agent-actions { padding: 1.15rem 1.25rem !important; margin-bottom: 1rem !important; }',
    '.agent-actions .form-row, .agent-actions .action-btns { display: flex !important; flex-wrap: wrap !important; gap: 0.65rem !important; align-items: flex-end !important; }',
    '.agent-actions .form-group { margin-bottom: 0.75rem !important; flex: 1 1 160px !important; min-width: 140px !important; }',
    '.agent-actions label { font-size: 0.72rem !important; font-weight: 600 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; color: #9898b0 !important; margin-bottom: 0.35rem !important; }',
    'html[data-theme="light"] .agent-actions label { color: #6b7280 !important; }',
    '#btn-save-meta, .agent-actions .btn-primary, .action-btns .btn-primary { min-width: 120px !important; box-shadow: 0 4px 16px rgba(109, 94, 245, 0.35) !important; }',
    '#btn-claim, #btn-remote-session { white-space: nowrap !important; }',
    '.comments-section, #comments-section { padding: 1.15rem 1.25rem !important; }',
    '.comments-section h4, .comments-section h3 { margin: 0 0 0.75rem !important; font-size: 0.95rem !important; font-weight: 700 !important; color: #c4b5fd !important; }',
    'html[data-theme="light"] .comments-section h4 { color: #5b21b6 !important; }',
    '.comments-list { gap: 0.7rem !important; margin-bottom: 1rem !important; }',
    '.comment { border-radius: 12px !important; padding: 0.8rem 0.95rem !important; }',
    '#dr-audit-panel, #dr-idle-bar { margin: 0.85rem 0 !important; }',
    '.empty-state { padding: 2.75rem 1.5rem !important; text-align: center !important; border-radius: 16px !important; border: 1px dashed rgba(139, 124, 247, 0.3) !important; background: rgba(26, 24, 42, 0.4) !important; color: #9898b0 !important; font-size: 0.95rem !important; line-height: 1.5 !important; }',
    '.empty-state::before { content: "\\25C7"; display: block; font-size: 1.75rem; margin-bottom: 0.65rem; color: #7c6af0; opacity: 0.7; }',
    'html[data-theme="light"] .empty-state { background: rgba(245, 243, 255, 0.8) !important; border-color: rgba(109, 94, 245, 0.25) !important; color: #4b5563 !important; }',
    'html[data-theme="light"] .empty-state::before { color: #6d5ef5; }',
    '#portal-agent .toolbar, #portal-agent .filters-bar, .agent-toolbar, .list-toolbar { display: flex !important; flex-wrap: wrap !important; gap: 0.55rem !important; align-items: center !important; margin-bottom: 1rem !important; }',
    '#search-input, #filter-status, #filter-priority, #filter-sort { border-radius: 10px !important; min-height: 38px !important; }',
    '#btn-clear-filters { border-radius: 10px !important; font-weight: 600 !important; }',
    '@media (max-width: 720px) { #view-dashboard .stats { grid-template-columns: repeat(2, 1fr) !important; } #ticket-detail, .ticket-detail { padding: 1.1rem !important; } .agent-actions .form-group { flex: 1 1 100% !important; } }'
  ].join(String.fromCharCode(10));

  function inject() {
    var el = document.getElementById('dr-ux-dash-detail-css');
    if (el) {
      el.textContent = CSS;
      return;
    }
    el = document.createElement('style');
    el.id = 'dr-ux-dash-detail-css';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function polishEmptyStates() {
    document.querySelectorAll('.empty-state').forEach(function (n) {
      if (n.getAttribute('data-dr-ux') === '1') return;
      n.setAttribute('data-dr-ux', '1');
      var t = (n.textContent || '').trim();
      if (!t || t.length < 3) n.textContent = 'Nothing here yet';
    });
  }

  function run() {
    inject();
    polishEmptyStates();
  }

  run();
  setTimeout(run, 600);
  setTimeout(run, 2000);
  setInterval(polishEmptyStates, 5000);

  window.DRUxDashDetail = { refresh: run };
})();
