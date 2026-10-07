/**
 * Divine Rays — pager-fix v1
 * Force accurate ticket pager: Page 1 of 1 when single page
 * Center Users pager and hide range text
 */
(function () {
  'use strict';
  if (window.__DR_PAGER_FIX_V1) return;
  window.__DR_PAGER_FIX_V1 = 1;

  function fixTicketPager() {
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

      var lf = (window.__drListFilter) || {};
      var limit = parseInt(lf.limit, 10);
      if ([10, 20, 50].indexOf(limit) === -1) limit = 20;

      var cards = document.querySelectorAll('#ticket-list .ticket-card').length;
      var page = parseInt(lf.page, 10) || 0;
      var totalPages = 1;

      var curText = (info.textContent || '');
      var m = curText.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
      var claimedPages = m ? parseInt(m[2], 10) : 1;

      if (page === 0 && cards <= limit) {
        totalPages = 1;
      } else if (claimedPages > 1 && page === 0 && cards > 0 && cards <= limit) {
        totalPages = 1;
      } else if (claimedPages > 1 && cards >= limit) {
        totalPages = claimedPages;
      } else {
        totalPages = 1;
      }

      // If Next leads to empty, force single page
      if (totalPages > 1 && page === 0 && cards > 0 && cards < limit) {
        totalPages = 1;
      }

      info.textContent = 'Page ' + (page + 1) + ' of ' + totalPages;
      pager.style.setProperty('display', 'flex', 'important');
      pager.style.setProperty('justify-content', 'center', 'important');

      var prev = document.getElementById('dr-page-prev');
      var next = document.getElementById('dr-page-next');
      if (prev) {
        prev.disabled = page <= 0 || totalPages <= 1;
        prev.classList.toggle('is-disabled', page <= 0 || totalPages <= 1);
      }
      if (next) {
        next.disabled = page >= totalPages - 1 || totalPages <= 1;
        next.classList.toggle('is-disabled', page >= totalPages - 1 || totalPages <= 1);
      }
    } catch (e) {}
  }

  function fixUsersPager() {
    try {
      var p = document.getElementById('dr-users-pager');
      if (!p) return;
      p.style.setProperty('display', 'flex', 'important');
      p.style.setProperty('justify-content', 'center', 'important');
      p.style.setProperty('width', '100%', 'important');
      Array.prototype.slice.call(p.querySelectorAll('span')).forEach(function (n) {
        if (n.classList.contains('dr-page-info')) return;
        var t = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (/^\d+\s*[–-]\s*\d+\s+of\s+\d+$/i.test(t)) n.remove();
      });
    } catch (e) {}
  }

  function tick() {
    fixTicketPager();
    fixUsersPager();
  }

  setTimeout(tick, 300);
  setTimeout(tick, 1000);
  setTimeout(tick, 2500);
  setInterval(tick, 800);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('.nav-btn, .dr-page-btn, #dr-users-pager, #dr-ticket-pager')) {
      setTimeout(tick, 120);
      setTimeout(tick, 400);
    }
  }, true);

  window.DRPagerFix = { refresh: tick };
})();
