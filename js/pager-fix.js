/**
 * Divine Rays — pager-fix v3
 * - No capsule/card around ticket, KB, or Users pagers
 * - Snap empty Page 2+ back to Page 1 of 1
 */
(function () {
  'use strict';
  if (window.__DR_PAGER_FIX_V3) return;
  window.__DR_PAGER_FIX_V3 = 1;
  window.__DR_PAGER_FIX_V2 = 1;
  window.__DR_PAGER_FIX_V1 = 1;

  function injectCss() {
    if (document.getElementById('dr-pager-fix-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-pager-fix-css';
    el.textContent = [
      '.dr-ticket-pager, #dr-ticket-pager{',
      '  display:flex!important;align-items:center;justify-content:center;gap:0.55rem;',
      '  margin:1rem 0 0.4rem!important;padding:0.25rem 0!important;',
      '  background:transparent!important;border:none!important;box-shadow:none!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  border-radius:0!important}',
      '.dr-users-pager, #dr-users-pager{',
      '  display:flex!important;align-items:center;justify-content:center;gap:0.55rem;',
      '  margin:1.1rem 0 0.35rem!important;padding:0.25rem 0!important;',
      '  background:transparent!important;border:none!important;box-shadow:none!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  border-radius:0!important;width:100%!important}',
      '#view-kb .pager, #view-kb .pagination, #view-kb .dr-ticket-pager,',
      '#view-kb .page-controls, .kb-pager, .dr-kb-pager,',
      '#portal-agent .pagination, #portal-agent .pager{',
      '  display:flex!important;align-items:center;justify-content:center;gap:0.55rem;',
      '  margin:1rem 0 0.4rem!important;padding:0.25rem 0!important;',
      '  background:transparent!important;border:none!important;box-shadow:none!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  border-radius:0!important}',
      '.dr-page-btn{',
      '  background:rgba(26,24,42,0.55)!important;',
      '  border:1px solid rgba(139,124,247,0.28)!important}',
      'html[data-theme="light"] .dr-page-btn{',
      '  background:rgba(255,255,255,0.55)!important;',
      '  border:1px solid rgba(109,94,245,0.28)!important;',
      '  color:#4c1d95!important}',
      'html[data-theme="light"] .dr-page-info{color:#5b5675!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function stableTicketPager() {
    try {
      var pager = document.getElementById('dr-ticket-pager');
      var info = document.getElementById('dr-page-info');
      if (!pager || !info) return;

      var title = ((document.getElementById('page-title') || {}).textContent || '').toLowerCase();
      var onList = /my tickets|unassigned|all tickets/.test(title);
      if (!onList) {
        pager.style.setProperty('display', 'none', 'important');
        return;
      }

      pager.style.setProperty('display', 'flex', 'important');
      pager.style.setProperty('justify-content', 'center', 'important');
      pager.style.setProperty('background', 'transparent', 'important');
      pager.style.setProperty('box-shadow', 'none', 'important');
      pager.style.setProperty('border', 'none', 'important');

      var lf = window.__drListFilter || {};
      var limit = parseInt(lf.limit, 10);
      if ([10, 20, 50].indexOf(limit) === -1) limit = 20;
      var page = parseInt(lf.page, 10) || 0;

      var cards = document.querySelectorAll('#ticket-list .ticket-card').length;
      var matched = null;
      try {
        if (typeof window.__drPagerMatched === 'number') matched = window.__drPagerMatched;
      } catch (e0) {}

      var totalPages = 1;
      if (matched != null) {
        totalPages = (matched > limit) ? Math.ceil(matched / limit) : 1;
      } else {
        if (page === 0 && cards > 0 && cards < limit) totalPages = 1;
        else if (page === 0 && cards === 0) totalPages = 1;
        else {
          var m = (info.textContent || '').match(/Page\s+(\d+)\s+of\s+(\d+)/i);
          var claimed = m ? parseInt(m[2], 10) : 1;
          if (page === 0 && cards < limit) totalPages = 1;
          else if (claimed > 1 && cards >= limit) totalPages = claimed;
          else totalPages = 1;
        }
      }
      if (totalPages < 1) totalPages = 1;

      if (cards === 0 && page > 0) {
        totalPages = 1;
        page = 0;
        try {
          if (window.__drListFilter) window.__drListFilter.page = 0;
          if (window.DRFilters && window.DRFilters.refresh) window.DRFilters.refresh();
          else if (typeof window.applyTicketFilters === 'function') window.applyTicketFilters(false);
        } catch (eR) {}
      }
      if (cards === 0 && page === 0) totalPages = 1;
      if (cards > 0 && page === 0 && cards < limit) totalPages = 1;

      var want = 'Page ' + (page + 1) + ' of ' + totalPages;
      if (info.textContent !== want) info.textContent = want;

      var prev = document.getElementById('dr-page-prev');
      var next = document.getElementById('dr-page-next');
      if (prev) {
        var pd = page <= 0 || totalPages <= 1;
        prev.disabled = pd;
        prev.classList.toggle('is-disabled', pd);
      }
      if (next) {
        var nd = page >= totalPages - 1 || totalPages <= 1;
        next.disabled = nd;
        next.classList.toggle('is-disabled', nd);
      }
    } catch (e) {}
  }

  function styleUsersPager() {
    try {
      var p = document.getElementById('dr-users-pager');
      if (!p) return;
      p.style.setProperty('display', 'flex', 'important');
      p.style.setProperty('justify-content', 'center', 'important');
      p.style.setProperty('background', 'transparent', 'important');
      p.style.setProperty('box-shadow', 'none', 'important');
      p.style.setProperty('border', 'none', 'important');
      Array.prototype.slice.call(p.querySelectorAll('span')).forEach(function (n) {
        if (n.classList.contains('dr-page-info')) return;
        var t = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (/^\d+\s*[\u2013-]\s*\d+\s+of\s+\d+$/i.test(t)) n.remove();
      });
    } catch (e) {}
  }

  function styleKbPager() {
    try {
      var nodes = document.querySelectorAll(
        '#view-kb .pager, #view-kb .pagination, #view-kb .page-controls, .kb-pager, .dr-kb-pager'
      );
      nodes.forEach(function (p) {
        p.style.setProperty('background', 'transparent', 'important');
        p.style.setProperty('box-shadow', 'none', 'important');
        p.style.setProperty('border', 'none', 'important');
        p.style.setProperty('justify-content', 'center', 'important');
      });
    } catch (e) {}
  }

  function tick() {
    injectCss();
    stableTicketPager();
    styleUsersPager();
    styleKbPager();
  }

  setTimeout(tick, 200);
  setTimeout(tick, 900);
  setTimeout(tick, 2200);
  setInterval(tick, 2000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('.nav-btn, .dr-page-btn, #dr-users-pager, #dr-ticket-pager')) {
      setTimeout(tick, 150);
      setTimeout(tick, 500);
    }
  }, true);

  window.DRPagerFix = { refresh: tick };
})();
