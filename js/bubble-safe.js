/**
 * Divine Rays — transparent card background, solid text/content
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_BUBBLE_SAFE) {
    try { delete window.__DR_BUBBLE_SAFE; } catch (e) {}
  }
  window.__DR_BUBBLE_SAFE = 1;

  var id = 'dr-bubble-safe';

  var css = [
    '#portal-agent #view-dashboard .stat-card,',
    '#portal-agent .stats .stat-card,',
    '#portal-agent #view-dashboard .ticket-card,',
    '#portal-agent .tickets-list .ticket-card{',
    'background-color:rgba(32,32,48,0.45)!important;',
    'background-image:none!important;',
    'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    'border:1px solid rgba(167,139,250,0.2)!important;',
    'opacity:1!important}',
    'html[data-theme="light"] #portal-agent #view-dashboard .stat-card,',
    'html[data-theme="light"] #portal-agent .stats .stat-card,',
    'html[data-theme="light"] #portal-agent #view-dashboard .ticket-card,',
    'html[data-theme="light"] #portal-agent .tickets-list .ticket-card{',
    'background-color:rgba(255,255,255,0.5)!important;',
    'background-image:none!important;',
    'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    'border:1px solid rgba(109,94,245,0.16)!important;',
    'opacity:1!important}',
    '#portal-agent .stat-card .stat-value,',
    '#portal-agent .stat-card .stat-label,',
    '#portal-agent .ticket-card h4,',
    '#portal-agent .ticket-card .ticket-meta,',
    '#portal-agent .ticket-card .badge,',
    '#portal-agent .stat-card *,',
    '#portal-agent .ticket-card *{',
    'opacity:1!important}',
    'html[data-theme="light"] #portal-agent .stat-card .stat-label,',
    'html[data-theme="light"] #portal-agent .ticket-card h4,',
    'html[data-theme="light"] #portal-agent .ticket-card .ticket-meta{',
    'color:#1a1a2e!important;',
    '-webkit-text-fill-color:#1a1a2e!important;',
    'opacity:1!important}',
    'html[data-theme="light"] #portal-agent .stat-card .stat-value{',
    'color:#4c3fd4!important;',
    '-webkit-text-fill-color:#4c3fd4!important;',
    'opacity:1!important}'
  ].join('');

  function go() {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = css;
    document.head.appendChild(el);
  }

  go();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  setTimeout(go, 400);
  setTimeout(go, 1500);
  setTimeout(go, 3000);
})();
