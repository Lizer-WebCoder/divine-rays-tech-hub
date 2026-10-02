/**
 * Divine Rays — admin stats: Admin tab = Admins only; End-Users tab = End-Users only
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_ADMIN_STATS_FIX = 2;

  var CSS = [
    'body.dr-view-admin-staff .admin-stats{display:flex!important;gap:0.75rem!important;max-width:14rem!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card{display:none!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card.me,',
    'body.dr-view-admin-staff .admin-stats .stat-card:last-child{',
    '  display:flex!important;flex-direction:column!important;min-width:10rem!important;',
    '  padding:0.9rem 1.15rem!important;opacity:1!important;visibility:visible!important}',
    'body.dr-view-endusers .admin-stats .stat-card{display:none!important}',
    'body.dr-view-endusers .admin-stats .stat-card:nth-child(2){',
    '  display:flex!important;flex-direction:column!important;min-width:10rem!important;',
    '  padding:0.9rem 1.15rem!important}'
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
  function tick() { inject(); setLabels(); }
  tick();
  setInterval(tick, 1500);
})();
