/**
 * Divine Rays — Dashboard UI v2 (design only)
 * Keeps every existing card / stat ID. Polish only.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_DASH_UI_V2) return;
  window.__DR_DASH_UI_V2 = 1;

  var CSS = [
    /* —— Dashboard shell —— */
    '#view-dashboard.view.active, #view-dashboard.active{',
    '  display:block!important;padding:0.25rem 0 1.5rem!important}',
    '#view-dashboard .stats-section{',
    '  margin:0 0 1.35rem!important;padding:1.15rem 1.25rem 1.25rem!important;',
    '  border-radius:1.15rem!important;',
    '  background:linear-gradient(145deg,rgba(28,26,48,0.72),rgba(18,16,32,0.55))!important;',
    '  border:1px solid rgba(139,124,247,0.22)!important;',
    '  box-shadow:0 10px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)!important;',
    '  backdrop-filter:blur(14px) saturate(1.15)!important;',
    '  -webkit-backdrop-filter:blur(14px) saturate(1.15)!important}',
    'html[data-theme="light"] #view-dashboard .stats-section{',
    '  background:linear-gradient(145deg,rgba(255,255,255,0.78),rgba(245,243,255,0.62))!important;',
    '  border-color:rgba(109,94,245,0.18)!important;',
    '  box-shadow:0 10px 28px rgba(80,60,140,0.08), inset 0 1px 0 rgba(255,255,255,0.8)!important}',

    /* Section titles */
    '#view-dashboard .stats-heading{',
    '  margin:0 0 0.9rem!important;padding:0 0 0.55rem!important;',
    '  font-size:0.78rem!important;font-weight:700!important;letter-spacing:0.08em!important;',
    '  text-transform:uppercase!important;color:#a5a3c7!important;',
    '  border-bottom:1px solid rgba(139,124,247,0.16)!important;',
    '  display:flex!important;align-items:center!important;gap:0.5rem!important}',
    '#view-dashboard .stats-heading::before{',
    '  content:"";width:6px;height:6px;border-radius:50%;',
    '  background:linear-gradient(135deg,#a78bfa,#7c6af0);',
    '  box-shadow:0 0 10px rgba(167,139,250,0.7);flex-shrink:0}',
    'html[data-theme="light"] #view-dashboard .stats-heading{color:#5b5675!important;',
    '  border-bottom-color:rgba(109,94,245,0.14)!important}',

    /* Stats grid */
    '#view-dashboard .stats{',
    '  display:grid!important;',
    '  grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr))!important;',
    '  gap:0.75rem!important;margin:0!important}',

    /* Base stat card */
    '#view-dashboard .stat-card{',
    '  position:relative!important;overflow:hidden!important;',
    '  display:flex!important;flex-direction:column!important;justify-content:center!important;',
    '  gap:0.35rem!important;min-height:5.25rem!important;',
    '  padding:1rem 1.05rem 0.95rem 1.15rem!important;',
    '  border-radius:0.95rem!important;',
    '  background:rgba(22,20,38,0.85)!important;',
    '  border:1px solid rgba(139,124,247,0.2)!important;',
    '  box-shadow:0 4px 16px rgba(0,0,0,0.18)!important;',
    '  transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease!important}',
    '#view-dashboard .stat-card::before{',
    '  content:"";position:absolute;left:0;top:0;bottom:0;width:3px;',
    '  background:linear-gradient(180deg,#a78bfa,#6366f1);border-radius:3px 0 0 3px}',
    '#view-dashboard .stat-card:hover{',
    '  transform:translateY(-2px);',
    '  border-color:rgba(167,139,250,0.45)!important;',
    '  box-shadow:0 8px 24px rgba(99,102,241,0.18)!important}',
    'html[data-theme="light"] #view-dashboard .stat-card{',
    '  background:rgba(255,255,255,0.88)!important;',
    '  border-color:rgba(109,94,245,0.16)!important;',
    '  box-shadow:0 4px 14px rgba(80,60,140,0.06)!important}',

    '#view-dashboard .stat-label{',
    '  font-size:0.72rem!important;font-weight:600!important;letter-spacing:0.04em!important;',
    '  text-transform:uppercase!important;color:#8b89a8!important;line-height:1.2!important}',
    '#view-dashboard .stat-value{',
    '  font-size:1.65rem!important;font-weight:750!important;line-height:1.1!important;',
    '  color:#eeeef6!important;font-variant-numeric:tabular-nums!important}',
    'html[data-theme="light"] #view-dashboard .stat-label{color:#6b6785!important}',
    'html[data-theme="light"] #view-dashboard .stat-value{color:#1e1b4b!important}',

    /* Priority accents */
    '#view-dashboard .stat-card.critical::before{background:linear-gradient(180deg,#fb7185,#e11d48)}',
    '#view-dashboard .stat-card.critical{',
    '  border-color:rgba(244,63,94,0.35)!important;',
    '  background:linear-gradient(145deg,rgba(76,20,34,0.55),rgba(22,20,38,0.9))!important}',
    '#view-dashboard .stat-card.critical .stat-value{color:#fb7185!important}',
    '#view-dashboard .stat-card.high::before{background:linear-gradient(180deg,#fb923c,#ea580c)}',
    '#view-dashboard .stat-card.high{',
    '  border-color:rgba(249,115,22,0.35)!important;',
    '  background:linear-gradient(145deg,rgba(68,38,12,0.5),rgba(22,20,38,0.9))!important}',
    '#view-dashboard .stat-card.high .stat-value{color:#fb923c!important}',
    'html[data-theme="light"] #view-dashboard .stat-card.critical{',
    '  background:linear-gradient(145deg,#fff1f2,#ffffff)!important}',
    'html[data-theme="light"] #view-dashboard .stat-card.high{',
    '  background:linear-gradient(145deg,#fff7ed,#ffffff)!important}',

    /* Me / performance cards */
    '#view-dashboard .stat-card.me::before{background:linear-gradient(180deg,#34d399,#059669)}',
    '#view-dashboard .stat-card.me{',
    '  border-color:rgba(52,211,153,0.28)!important;',
    '  background:linear-gradient(145deg,rgba(6,48,36,0.45),rgba(22,20,38,0.9))!important}',
    '#view-dashboard .stat-card.me .stat-value{color:#34d399!important}',
    'html[data-theme="light"] #view-dashboard .stat-card.me{',
    '  background:linear-gradient(145deg,#ecfdf5,#ffffff)!important}',

    /* Team performance list */
    '#view-dashboard #agent-perf-list, #view-dashboard .agent-perf{',
    '  display:flex!important;flex-direction:column!important;gap:0.55rem!important}',
    '#view-dashboard .agent-perf-row, #view-dashboard .agent-row, #view-dashboard .perf-row{',
    '  display:flex!important;align-items:center!important;justify-content:space-between!important;',
    '  gap:0.75rem!important;padding:0.75rem 0.95rem!important;',
    '  border-radius:0.85rem!important;',
    '  background:rgba(22,20,38,0.75)!important;',
    '  border:1px solid rgba(139,124,247,0.16)!important;',
    '  transition:border-color .15s ease, background .15s ease!important}',
    '#view-dashboard .agent-perf-row:hover, #view-dashboard .agent-row:hover{',
    '  border-color:rgba(167,139,250,0.4)!important;',
    '  background:rgba(36,32,58,0.9)!important}',
    'html[data-theme="light"] #view-dashboard .agent-perf-row,',
    'html[data-theme="light"] #view-dashboard .agent-row,',
    'html[data-theme="light"] #view-dashboard .perf-row{',
    '  background:rgba(255,255,255,0.85)!important;',
    '  border-color:rgba(109,94,245,0.14)!important}',

    /* Recent tickets heading (kept, list still hidden by dashboard-no-tickets) */
    '#view-dashboard > h3.stats-heading{',
    '  margin:0.5rem 0 0.75rem!important;padding:0 0 0.5rem!important;',
    '  font-size:0.78rem!important;font-weight:700!important;letter-spacing:0.08em!important;',
    '  text-transform:uppercase!important;color:#a5a3c7!important}',

    /* CSAT / chart panels if present inside dashboard */
    '#view-dashboard .chart-panel, #view-dashboard .csat-panel, #view-dashboard .donut-wrap{',
    '  border-radius:1rem!important;',
    '  border:1px solid rgba(139,124,247,0.2)!important;',
    '  background:rgba(22,20,38,0.7)!important;',
    '  box-shadow:0 6px 20px rgba(0,0,0,0.16)!important}',
    'html[data-theme="light"] #view-dashboard .chart-panel,',
    'html[data-theme="light"] #view-dashboard .csat-panel{',
    '  background:rgba(255,255,255,0.9)!important;',
    '  border-color:rgba(109,94,245,0.16)!important}',

    /* Responsive */
    '@media (max-width:720px){',
    '  #view-dashboard .stats{grid-template-columns:repeat(2,minmax(0,1fr))!important}',
    '  #view-dashboard .stats-section{padding:0.95rem!important}',
    '}',
    '@media (max-width:420px){',
    '  #view-dashboard .stats{grid-template-columns:1fr 1fr!important;gap:0.55rem!important}',
    '  #view-dashboard .stat-value{font-size:1.35rem!important}',
    '}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-dash-ui-v2-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-dash-ui-v2-css';
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = CSS;
  }

  function decorateLabels() {
    try {
      var map = {
        'stat-total': 'Total tickets',
        'stat-open': 'Open',
        'stat-progress': 'In progress',
        'stat-waiting': 'Waiting',
        'stat-unassigned': 'Unassigned',
        'stat-resolved': 'Resolved',
        'stat-closed': 'Closed',
        'stat-critical': 'Critical open',
        'stat-high': 'High open',
        'stat-claimed-me': 'Claimed by me',
        'stat-resolved-me': 'Resolved by me'
      };
      Object.keys(map).forEach(function (id) {
        var val = document.getElementById(id);
        if (!val) return;
        var card = val.closest('.stat-card');
        if (!card) return;
        var lab = card.querySelector('.stat-label');
        if (lab && !lab.getAttribute('data-dr-dash-v2')) {
          lab.setAttribute('data-dr-dash-v2', '1');
        }
      });
    } catch (e) {}
  }

  function tick() {
    inject();
    decorateLabels();
  }

  tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1500);
  setTimeout(tick, 3000);
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn');
    if (btn) setTimeout(tick, 120);
  }, true);

  window.DRDashUIV2 = { refresh: tick };
})();
