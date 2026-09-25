/**
 * Divine Rays — dashboard bubble bg only (safe, never hides content)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_BUBBLE_SAFE) return;
  window.__DR_BUBBLE_SAFE = 1;

  var id = 'dr-bubble-safe';
  var css = [
    '#portal-agent #view-dashboard .stat-card,',
    '#portal-agent .stats .stat-card{',
    'background-color:rgba(30,30,48,0.5)!important;',
    'background-image:none!important}',
    'html[data-theme="light"] #portal-agent #view-dashboard .stat-card,',
    'html[data-theme="light"] #portal-agent .stats .stat-card{',
    'background-color:rgba(255,255,255,0.55)!important;',
    'background-image:none!important}',
    '#portal-agent #view-dashboard .stat-card .stat-value,',
    '#portal-agent #view-dashboard .stat-card .stat-label,',
    '#portal-agent .stats .stat-card .stat-value,',
    '#portal-agent .stats .stat-card .stat-label{',
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
  }
  go();
  setTimeout(go, 500);
  setTimeout(go, 2000);
})();
