/**
 * Divine Rays — Admin stats: ONLY Admins card, centered text; hide Showing
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_ADMIN_STATS_FIX = 3;

  var CSS = [
    'body.dr-view-admin-staff #filter-hint,body.dr-view-endusers #filter-hint{display:none!important}',
    'body.dr-view-admin-staff .dr-ticket-pager,body.dr-view-endusers .dr-ticket-pager{display:none!important}',
    'body.dr-view-admin-staff .admin-stats{display:flex!important;gap:0.75rem!important;max-width:14rem!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card{display:none!important;visibility:hidden!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card.dr-stat-admins,',
    'body.dr-view-admin-staff .admin-stats .stat-card.me{',
    '  display:flex!important;visibility:visible!important;flex-direction:column!important;',
    '  align-items:center!important;justify-content:center!important;text-align:center!important;',
    '  min-width:10rem!important;padding:0.9rem 1.15rem!important;opacity:1!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card.dr-stat-admins .stat-label,',
    'body.dr-view-admin-staff .admin-stats .stat-card.dr-stat-admins .stat-value,',
    'body.dr-view-admin-staff .admin-stats .stat-card.me .stat-label,',
    'body.dr-view-admin-staff .admin-stats .stat-card.me .stat-value,',
    'body.dr-view-admin-staff #admin-stat-admins{text-align:center!important;width:100%;display:block!important}',
    'body.dr-view-admin-staff #admin-stat-users,body.dr-view-admin-staff #admin-stat-agents{display:none!important}',
    'body.dr-view-admin-staff .admin-stats .stat-card.dr-stat-staff,',
    'body.dr-view-admin-staff .admin-stats .stat-card.dr-stat-agents{display:none!important;visibility:hidden!important}',
    'body.dr-view-endusers .admin-stats .stat-card{display:none!important}',
    'body.dr-view-endusers .admin-stats .stat-card.dr-stat-endusers,',
    'body.dr-view-endusers .admin-stats .stat-card:nth-child(2){',
    '  display:flex!important;flex-direction:column!important;align-items:center!important;',
    '  justify-content:center!important;text-align:center!important;min-width:10rem!important;',
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

  function hideShowing() {
    try {
      var h = document.getElementById('filter-hint');
      if (h && (document.body.classList.contains('dr-view-admin-staff') || document.body.classList.contains('dr-view-endusers'))) {
        h.style.display = 'none';
        h.textContent = '';
      }
      document.querySelectorAll('.topbar p, .topbar span, .topbar div, header.topbar p, header.topbar span').forEach(function (n) {
        if (n.id === 'page-title' || n.closest('#page-title') || n.closest('.topbar-actions')) return;
        var tx = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (/^Showing\s+\d/i.test(tx) || (/Page\s+\d/i.test(tx) && /of|\//i.test(tx) && tx.length < 60)) {
          n.style.display = 'none';
        }
      });
    } catch (e) {}
  }

  function hideStaffAgentCards() {
    if (!document.body.classList.contains('dr-view-admin-staff')) return;
    try {
      ['admin-stat-users', 'admin-stat-agents'].forEach(function (id) {
        var val = document.getElementById(id);
        if (!val) return;
        var card = val.closest('.stat-card');
        if (card) {
          card.style.display = 'none';
          card.style.visibility = 'hidden';
        }
      });
      var adm = document.getElementById('admin-stat-admins');
      if (adm) {
        var card = adm.closest('.stat-card');
        if (card) {
          card.style.display = 'flex';
          card.style.visibility = 'visible';
          card.style.flexDirection = 'column';
          card.style.alignItems = 'center';
          card.style.justifyContent = 'center';
          card.style.textAlign = 'center';
        }
        adm.style.textAlign = 'center';
        adm.style.display = 'block';
        adm.style.width = '100%';
      }
    } catch (e) {}
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
    hideShowing();
    hideStaffAgentCards();
    setLabels();
  }
  tick();
  setInterval(tick, 800);
})();
