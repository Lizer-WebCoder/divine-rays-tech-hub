/**
 * Divine Rays — team board separation (v3 stable, no flicker)
 * Wrap once; do not fight CSAT or core re-renders.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TEAM_SEP_V3) return;
  window.__DR_TEAM_SEP_V3 = 1;

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
    'html[data-theme="light"] .agent-perf,',
    'html[data-theme="light"] #agent-perf-list,',
    'html[data-theme="light"] #agent-perf-list.team-board,',
    'html[data-theme="light"] .team-board{',
    'background:transparent!important;border:none!important;box-shadow:none!important;overflow:visible!important}',
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

  var wrapped = false;

  function inject() {
    var el = document.getElementById('dr-team-sep-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-team-sep-css';
      document.head.appendChild(el);
      el.textContent = CSS;
    }
  }

  function wrapEachPerson() {
    var box = document.getElementById('agent-perf-list');
    if (!box || !box.classList.contains('team-board')) return false;
    var kids = Array.prototype.slice.call(box.children);
    var did = false;
    kids.forEach(function (h) {
      if (!h.classList || !h.classList.contains('chart-title')) return;
      if ((h.textContent || '').indexOf('Each person') === -1) return;
      if (h.closest('.chart-panel')) return;
      var cards = h.nextElementSibling;
      if (!cards || !cards.classList.contains('team-cards')) return;
      var panel = document.createElement('div');
      panel.className = 'chart-panel full';
      h.parentNode.insertBefore(panel, h);
      panel.appendChild(h);
      var desc = document.createElement('p');
      desc.className = 'chart-desc';
      desc.textContent = 'Individual workload and ratings';
      panel.appendChild(desc);
      panel.appendChild(cards);
      did = true;
    });
    if (did) wrapped = true;
    return did;
  }

  inject();
  setTimeout(wrapEachPerson, 700);
  setTimeout(wrapEachPerson, 2000);
  setTimeout(wrapEachPerson, 5000);

  setInterval(function () {
    if (wrapped) {
      var title = null;
      var box = document.getElementById('agent-perf-list');
      if (!box) return;
      Array.prototype.forEach.call(box.querySelectorAll('.chart-title'), function (h) {
        if ((h.textContent || '').indexOf('Each person') !== -1) title = h;
      });
      if (title && !title.closest('.chart-panel')) {
        wrapped = false;
        wrapEachPerson();
      }
      return;
    }
    wrapEachPerson();
  }, 8000);
})();
