/**
 * Divine Rays — session polish: dashboard glass, light contrast, detail hierarchy, SLA chips
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UX_SESSION_POLISH) return;
  window.__DR_UX_SESSION_POLISH = 1;

  var CSS = [
    '#portal-agent #view-dashboard .stats,',
    '#portal-agent #view-dashboard .stat-grid,',
    '#portal-agent .stats{',
    'display:flex!important;flex-wrap:wrap!important;gap:0.75rem!important;',
    'align-items:stretch!important}',
    '#portal-agent #view-dashboard .stat-card,',
    '#portal-agent .stat-card{',
    'flex:1 1 140px!important;min-width:120px!important;max-width:100%!important;',
    'padding:1rem 1.15rem!important;border-radius:14px!important}',
    '#portal-agent #view-dashboard .stats-section,',
    '#portal-agent #agent-perf-list,',
    '#portal-agent .team-board{margin-top:1rem!important}',
    '#portal-agent .ticket-card{',
    'border-radius:14px!important;transition:transform .15s,box-shadow .15s,border-color .15s}',
    '#portal-agent .ticket-card:hover{',
    'transform:translateY(-1px);border-color:rgba(167,139,250,.45)!important;',
    'box-shadow:0 8px 24px rgba(109,94,245,.12)}',
    '#portal-agent .stat-card,#portal-agent .glass-card,#portal-agent .panel,',
    '#portal-agent .dr-list-toolbar,#portal-agent .dr-ticket-pager{',
    'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}',
    'html[data-theme="light"] #portal-agent .nav-btn{color:#374151!important}',
    'html[data-theme="light"] #portal-agent .nav-btn.active{color:#5b21b6!important;background:rgba(109,94,245,.12)!important}',
    'html[data-theme="light"] #portal-agent .stat-card,',
    'html[data-theme="light"] #portal-agent .ticket-card,',
    'html[data-theme="light"] #portal-agent .dr-list-toolbar{',
    'background:#fff!important;border-color:rgba(109,94,245,.18)!important;color:#1f2937!important}',
    'html[data-theme="light"] #portal-agent .stat-card .label,',
    'html[data-theme="light"] #portal-agent .ticket-meta,',
    'html[data-theme="light"] #portal-agent .kb-sub,',
    'html[data-theme="light"] #portal-agent .text-muted{color:#4b5563!important}',
    'html[data-theme="light"] #portal-agent h2,html[data-theme="light"] #portal-agent h3,',
    'html[data-theme="light"] #portal-agent h4,html[data-theme="light"] #portal-agent .page-title{',
    'color:#1e1b4b!important}',
    'html[data-theme="light"] #portal-customer .feature-card h3{color:#1f2937!important}',
    'html[data-theme="light"] #portal-customer .feature-card p{color:#4b5563!important}',
    '#view-detail #ticket-detail h3{font-size:1.25rem!important;margin:0 0 .75rem!important;font-weight:700!important}',
    '#view-detail .detail-meta,#view-detail .ticket-meta-chips{',
    'display:flex!important;flex-wrap:wrap!important;gap:.4rem .5rem!important;margin-bottom:.85rem!important}',
    '#view-detail .detail-description{',
    'padding:1rem 1.15rem!important;border-radius:12px!important;margin-bottom:1rem!important;',
    'border:1px solid rgba(139,124,247,.2);background:rgba(26,24,42,.35);line-height:1.55}',
    'html[data-theme="light"] #view-detail .detail-description{',
    'background:#f8f7ff!important;border-color:rgba(109,94,245,.15)!important;color:#1f2937!important}',
    '#view-detail .agent-actions,#view-detail .detail-actions{',
    'display:flex!important;flex-wrap:wrap!important;gap:.5rem .65rem!important;margin:1rem 0!important;align-items:center}',
    '#view-detail .agent-actions .btn-primary,#view-detail .btn-claim{',
    'background:linear-gradient(135deg,#7c6af0,#6d5ef5)!important;border:none!important;color:#fff!important;',
    'font-weight:600!important;padding:.55rem 1.1rem!important;border-radius:10px!important}',
    '.empty-state{',
    'padding:1.5rem 1.25rem!important;text-align:center!important;border-radius:14px!important;',
    'border:2px dashed rgba(139,124,247,.28)!important;background:rgba(26,24,42,.25)!important;',
    'color:#a1a1b5!important}',
    'html[data-theme="light"] .empty-state{',
    'background:#faf9ff!important;border-color:rgba(109,94,245,.22)!important;color:#6b7280!important}',
    '.ticket-card .dr-sla-chip{',
    'display:inline-flex;align-items:center;gap:.25rem;font-size:.7rem;font-weight:700;',
    'padding:.2rem .5rem;border-radius:999px;margin-top:.35rem;letter-spacing:.02em}',
    '.ticket-card .dr-sla-chip.ok{background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.3)}',
    '.ticket-card .dr-sla-chip.soon{background:rgba(234,179,8,.15);color:#facc15;border:1px solid rgba(234,179,8,.35)}',
    '.ticket-card .dr-sla-chip.overdue{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.35)}',
    'html[data-theme="light"] .ticket-card .dr-sla-chip.ok{color:#15803d;background:rgba(34,197,94,.12)}',
    'html[data-theme="light"] .ticket-card .dr-sla-chip.soon{color:#a16207;background:rgba(234,179,8,.12)}',
    'html[data-theme="light"] .ticket-card .dr-sla-chip.overdue{color:#b91c1c;background:rgba(239,68,68,.1)}'
  ].join('');

  function inject() {
    var el = document.getElementById('dr-ux-session-polish');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-ux-session-polish';
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  var SLA_H = { Critical: 4, High: 8, Medium: 24, Low: 48 };

  function slaState(t) {
    if (!t || !t.created_at) return null;
    var st = String(t.status || '').toLowerCase();
    if (st === 'resolved' || st === 'closed') return null;
    var limit = SLA_H[t.priority] || 24;
    var age = (Date.now() - new Date(t.created_at).getTime()) / 36e5;
    var rem = limit - age;
    if (rem <= 0) return { cls: 'overdue', label: 'Overdue' };
    if (rem <= limit * 0.25) return { cls: 'soon', label: Math.ceil(rem) + 'h left' };
    return { cls: 'ok', label: Math.ceil(rem) + 'h left' };
  }

  function enhanceSlaChips() {
    var list = document.getElementById('ticket-list');
    if (!list) return;
    var tickets = [];
    try {
      if (window.DR && DR.getAllTickets) tickets = DR.getAllTickets() || [];
    } catch (e) {}
    var byId = {};
    tickets.forEach(function (t) { byId[t.id] = t; });
    list.querySelectorAll('.ticket-card[data-id]').forEach(function (card) {
      if (card.querySelector('.dr-sla-chip')) return;
      var t = byId[card.getAttribute('data-id')];
      var s = slaState(t);
      if (!s) return;
      var body = card.querySelector('.ticket-body') || card;
      var chip = document.createElement('span');
      chip.className = 'dr-sla-chip ' + s.cls;
      chip.textContent = s.label;
      body.appendChild(chip);
    });
  }

  function maybeTutorial() {
    var portal = document.getElementById('portal-customer');
    if (!portal || !portal.classList.contains('active')) return;
    if (document.getElementById('dr-eu-tutorial')) return;
    var key = 'dr_eu_tutorial_done';
    try {
      if (localStorage.getItem(key) === '1') return;
    } catch (e) {}
    var tip = document.createElement('div');
    tip.id = 'dr-eu-tutorial';
    tip.setAttribute('role', 'dialog');
    tip.style.cssText =
      'position:fixed;bottom:1.25rem;left:50%;transform:translateX(-50%);z-index:9999;' +
      'max-width:min(420px,92vw);padding:1rem 1.15rem;border-radius:14px;' +
      'background:rgba(26,24,42,.95);border:1px solid rgba(139,124,247,.4);' +
      'box-shadow:0 12px 40px rgba(0,0,0,.35);color:#eeeef6;font-size:.9rem;line-height:1.45';
    tip.innerHTML =
      '<strong style="display:block;margin-bottom:.35rem;color:#c4b5fd">Quick tip</strong>' +
      'Use <b>Submit a ticket</b> to open a request, <b>Track progress</b> to follow updates, ' +
      'and <b>Browse Help / FAQ</b> for common fixes.' +
      '<div style="margin-top:.75rem;text-align:right">' +
      '<button type="button" id="dr-eu-tutorial-ok" style="appearance:none;border:none;border-radius:10px;' +
      'padding:.45rem 1rem;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#7c6af0,#6d5ef5);color:#fff">' +
      'Got it</button></div>';
    document.body.appendChild(tip);
    var btn = document.getElementById('dr-eu-tutorial-ok');
    if (btn) {
      btn.addEventListener('click', function () {
        try { localStorage.setItem(key, '1'); } catch (e) {}
        tip.remove();
      });
    }
  }

  function boot() {
    inject();
    enhanceSlaChips();
    maybeTutorial();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 800);
  setTimeout(boot, 2500);
  setTimeout(enhanceSlaChips, 3500);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.classList && t.classList.contains('nav-btn') || (t.closest && t.closest('.nav-btn')))) {
      setTimeout(enhanceSlaChips, 400);
      setTimeout(enhanceSlaChips, 1200);
    }
  }, true);

  var _orig = window.applyTicketFilters;
  if (typeof _orig === 'function' && !_orig.__drSlaWrap) {
    window.applyTicketFilters = function (refetch) {
      var r = _orig.apply(this, arguments);
      setTimeout(enhanceSlaChips, 50);
      setTimeout(enhanceSlaChips, 300);
      return r;
    };
    window.applyTicketFilters.__drSlaWrap = true;
  }
})();
