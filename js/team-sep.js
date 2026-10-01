/**
 * Divine Rays — team board separation (stable, no flicker)
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TEAM_SEP_V2) return;
  window.__DR_TEAM_SEP_V2 = 1;

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
    'border-radius:14px!important;padding:1rem 1.1rem!important}',
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

  var wrapTimer = null;
  var lastWrapAt = 0;

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
    var now = Date.now();
    if (now - lastWrapAt < 800) return;
    var box = document.getElementById('agent-perf-list');
    if (!box || !box.classList.contains('team-board')) return;
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
    if (did) lastWrapAt = now;
  }

  function scheduleWrap() {
    if (wrapTimer) return;
    wrapTimer = setTimeout(function () {
      wrapTimer = null;
      wrapEachPerson();
    }, 400);
  }

  inject();
  setTimeout(wrapEachPerson, 600);
  setTimeout(wrapEachPerson, 1800);
  setInterval(scheduleWrap, 5000);

  var target = document.getElementById('app-shell') || document.body;
  try {
    var mo = new MutationObserver(function () { scheduleWrap(); });
    mo.observe(target, { childList: true, subtree: true });
  } catch (e) {}
})();
