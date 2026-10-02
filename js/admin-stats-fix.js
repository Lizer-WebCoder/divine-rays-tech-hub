/**
 * Divine Rays — force admin stats cards visible
 * Overrides admin.js rules that hid Staff/Agents
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ADMIN_STATS_FIX) return;
  window.__DR_ADMIN_STATS_FIX = 1;

  var CSS = [
    'body.dr-view-admin-staff .admin-stats{',
    '  display:flex!important;flex-wrap:wrap!important;gap:0.85rem!important;',
    '  max-width:none!important;width:auto!important;align-items:stretch!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card{',
    '  display:flex!important;flex-direction:column!important;',
    '  min-width:9.5rem!important;max-width:none!important;',
    '  padding:0.9rem 1.15rem!important;opacity:1!important;visibility:visible!important;',
    '  position:relative!important;flex:0 0 auto!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card:nth-child(2){display:none!important}',
    'body.dr-view-admin-staff #admin-stat-users,',
    'body.dr-view-admin-staff #admin-stat-agents,',
    'body.dr-view-admin-staff #admin-stat-admins{',
    '  display:block!important;visibility:visible!important;font-size:1.45rem!important;',
    '  font-weight:700!important;color:#c4b5fd!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card .stat-label{',
    '  display:block!important;font-size:0.72rem!important;font-weight:600!important;',
    '  text-transform:uppercase!important;color:#9494ae!important;margin-bottom:0.25rem!important}',
    'body.dr-view-endusers .admin-stats .stat-card{display:none!important}',
    'body.dr-view-endusers .admin-stats .stat-card:nth-child(2){',
    '  display:flex!important;flex-direction:column!important;min-width:10rem!important;',
    '  padding:0.9rem 1.15rem!important}',
    'body.dr-view-endusers #admin-stat-customers{',
    '  display:block!important;font-size:1.45rem!important;font-weight:700!important;color:#c4b5fd!important}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-admin-stats-fix-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-admin-stats-fix-css';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function setLabels() {
    var map = {
      'admin-stat-users': 'Staff',
      'admin-stat-customers': 'End-Users',
      'admin-stat-agents': 'Agents',
      'admin-stat-admins': 'Admins'
    };
    Object.keys(map).forEach(function (id) {
      var val = document.getElementById(id);
      if (!val) return;
      var card = val.closest('.stat-card');
      if (!card) return;
      var lab = card.querySelector('.stat-label');
      if (lab) lab.textContent = map[id];
    });
  }

  function tick() {
    inject();
    setLabels();
  }

  tick();
  setInterval(tick, 1500);
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 3000);
})();
