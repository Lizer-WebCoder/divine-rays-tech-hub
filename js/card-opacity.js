/**
 * Divine Rays — admin dashboard cards: transparent bg, solid text
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CARD_OPACITY) return;
  window.__DR_CARD_OPACITY = 1;

  var CSS_ID = 'dr-card-opacity';

  var CSS = [
    '#portal-agent .stat-card,',
    '#portal-agent .ticket-card,',
    '#portal-agent .agent-perf,',
    '#portal-agent .kb-article,',
    '#portal-agent #view-dashboard .stat-card,',
    '#portal-agent #view-dashboard .ticket-card{',
    'background:rgba(28,28,42,0.55)!important;',
    'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
    'border:1px solid rgba(167,139,250,0.22)!important;',
    'opacity:1!important}',
    '#portal-agent .stat-card *,',
    '#portal-agent .ticket-card *,',
    '#portal-agent .stat-value,',
    '#portal-agent .stat-label,',
    '#portal-agent .ticket-card h4,',
    '#portal-agent .ticket-meta{',
    'opacity:1!important}',
    'html[data-theme="light"] #portal-agent .stat-card,',
    'html[data-theme="light"] #portal-agent .ticket-card,',
    'html[data-theme="light"] #portal-agent .agent-perf,',
    'html[data-theme="light"] #portal-agent .kb-article,',
    'html[data-theme="light"] #portal-agent #view-dashboard .stat-card,',
    'html[data-theme="light"] #portal-agent #view-dashboard .ticket-card{',
    'background:rgba(255,255,255,0.62)!important;',
    'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    'border:1px solid rgba(109,94,245,0.18)!important;',
    'box-shadow:0 2px 12px rgba(91,76,224,0.06)!important;',
    'opacity:1!important;',
    'color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .stat-card,',
    'html[data-theme="light"] #portal-agent .ticket-card,',
    'html[data-theme="light"] #portal-agent .stat-card *,',
    'html[data-theme="light"] #portal-agent .ticket-card *,',
    'html[data-theme="light"] #portal-agent .stat-label,',
    'html[data-theme="light"] #portal-agent .ticket-meta,',
    'html[data-theme="light"] #portal-agent .ticket-card h4{',
    'color:#1a1a2e!important;',
    'opacity:1!important;',
    '-webkit-text-fill-color:#1a1a2e!important}',
    'html[data-theme="light"] #portal-agent .stat-value{',
    'color:#4c3fd4!important;',
    'opacity:1!important;',
    '-webkit-text-fill-color:#4c3fd4!important}'
  ].join('');

  function inject() {
    var el = document.getElementById(CSS_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CSS_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  inject();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  setTimeout(inject, 400);
  setTimeout(inject, 1500);
  setInterval(inject, 5000);

  window.DRCardOpacity = { refresh: inject };
})();
