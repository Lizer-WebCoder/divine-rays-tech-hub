/**
 * Divine Rays — team board CSS only (no DOM rewrites)
 * Layout is owned by team-board.js to prevent flicker.
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TEAM_SEP_V4) return;
  window.__DR_TEAM_SEP_V4 = 1;

  var CSS = [
    '.agent-perf,#agent-perf-list,#agent-perf-list.team-board,.team-board{',
    'background:transparent!important;border:none!important;box-shadow:none!important;overflow:visible!important}',
    '#agent-perf-list.team-board,.team-board{display:flex!important;flex-direction:column!important;gap:1.15rem!important}',
    '.chart-panel{',
    'background:rgba(26,24,42,.72)!important;border:1px solid rgba(139,124,247,.28)!important;',
    'border-radius:16px!important;padding:1.15rem 1.25rem!important;',
    'box-shadow:0 8px 28px rgba(0,0,0,.22)!important;box-sizing:border-box}',
    '.chart-panel.full{width:100%;margin:0}',
    '.team-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.9rem}',
    '.team-card{',
    'background:rgba(26,24,42,.72)!important;border:1px solid rgba(139,124,247,.25)!important;',
    'border-radius:14px!important;padding:1rem 1.1rem!important;',
    'transition:none!important;animation:none!important}',
    '.team-card-top{display:flex;align-items:center;gap:.65rem;margin-bottom:.65rem}',
    '.team-card-name{font-weight:600;font-size:.95rem;display:flex;flex-wrap:wrap;align-items:center;gap:.35rem}',
    '.team-badge{font-size:.6rem;font-weight:700;letter-spacing:.04em;padding:.15rem .4rem;border-radius:999px;text-transform:uppercase}',
    '.team-badge.you{background:rgba(124,106,240,.25);color:#c4b5fd}',
    '.team-badge.admin{background:rgba(245,158,11,.2);color:#fbbf24}',
    '.team-badge.agent{background:rgba(56,189,248,.15);color:#7dd3fc}',
    '.team-card-stats{display:flex;gap:1.25rem}',
    '.team-stat-num{display:block;font-size:1.35rem;font-weight:700;line-height:1.1}',
    '.team-stat-label{font-size:.7rem;color:#9494ae}',
    'html[data-theme="light"] .agent-perf,',
    'html[data-theme="light"] #agent-perf-list,',
    'html[data-theme="light"] #agent-perf-list.team-board,',
    'html[data-theme="light"] .team-board{',
    'background:transparent!important;border:none!important;box-shadow:none!important}',
    'html[data-theme="light"] .chart-panel{',
    'background:#fff!important;border:1px solid rgba(109,94,245,.22)!important;',
    'box-shadow:0 4px 18px rgba(30,30,60,.07)!important}',
    'html[data-theme="light"] .team-card{',
    'background:#fff!important;border:1px solid rgba(109,94,245,.2)!important;',
    'box-shadow:0 3px 14px rgba(30,30,60,.06)!important}',
    'html[data-theme="light"] .chart-title{color:#5b21b6!important}',
    'html[data-theme="light"] .chart-desc,html[data-theme="light"] .team-stat-label,',
    'html[data-theme="light"] .tower-n,html[data-theme="light"] .tower-legend{color:#4b5563!important}',
    'html[data-theme="light"] .team-card-name,html[data-theme="light"] .team-stat-num,',
    'html[data-theme="light"] .tower-name{color:#1e1b4b!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-team-sep-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-team-sep-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  inject();
  setTimeout(inject, 500);
})();
