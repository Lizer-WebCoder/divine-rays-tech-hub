/**
 * Divine Rays — filters + limit + Prev/Next pagination + stable list
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_FILTERS_V4 = 1;

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }
  function toast(m, t) {
    if (window.DR && window.DR.toast) return window.DR.toast(m, t);
  }
  function getLF() {
    if (!window.__drListFilter) {
      window.__drListFilter = { q: '', status: '', priority: '', sort: 'newest', limit: 20, page: 0 };
    }
    return window.__drListFilter;
  }
  function getTickets() {
    return (window.DR && window.DR.tickets) || window.__drTickets || [];
  }
  function setTickets(arr) {
    if (window.DR) window.DR.tickets = arr;
    window.__drTickets = arr;
  }

  function matchTicket(t, lf) {
    if (lf.status && String(t.status || '').toLowerCase() !== String(lf.status).toLowerCase()) return false;
    if (lf.priority && String(t.priority || '').toLowerCase() !== String(lf.priority).toLowerCase()) return false;
    if (lf.q) {
      var q = String(lf.q).toLowerCase();
      var hay = [t.ticket_number, t.title, t.description, t.category, t.status, t.priority].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function sortTickets(arr, sort) {
    var a = arr.slice();
    if (sort === 'oldest') {
      a.sort(function (x, y) { return new Date(x.created_at || 0) - new Date(y.created_at || 0); });
    } else if (sort === 'priority') {
      var order = { critical: 0, high: 1, medium: 2, low: 3 };
      a.sort(function (x, y) {
        return (order[String(x.priority || '').toLowerCase()] || 9) - (order[String(y.priority || '').toLowerCase()] || 9);
      });
    } else {
      a.sort(function (x, y) { return new Date(y.created_at || 0) - new Date(x.created_at || 0); });
    }
    return a;
  }

  function updateHint(from, to, matched, total, page, pages) {
    var hint = document.getElementById('filter-hint') || document.getElementById('dr-list-sub');
    if (!hint) return;
    if (!matched) {
      hint.textContent = total ? 'No matches' : 'No tickets';
      return;
    }
    hint.textContent =
      'Showing ' + from + '–' + to + ' of ' + matched +
      (pages > 1 ? ' · Page ' + (page + 1) + '/' + pages : '') +
      (matched !== total ? ' (' + total + ' total)' : '');
  }

  function ensurePager() {
    var list = document.getElementById('ticket-list');
    if (!list) return null;
    var pager = document.getElementById('dr-ticket-pager');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'dr-ticket-pager';
      pager.className = 'dr-ticket-pager';
      pager.innerHTML =
        '<button type="button" class="dr-page-btn" id="dr-page-prev" aria-label="Previous page">← Prev</button>' +
        '<span class="dr-page-info" id="dr-page-info">Page 1</span>' +
        '<button type="button" class="dr-page-btn" id="dr-page-next" aria-label="Next page">Next →</button>';
      list.parentNode.insertBefore(pager, list.nextSibling);
    }
    return pager;
  }

  function updatePager(page, pages, matched) {
    var pager = ensurePager();
    if (!pager) return;
    var prev = document.getElementById('dr-page-prev');
    var next = document.getElementById('dr-page-next');
    var info = document.getElementById('dr-page-info');
    var onList = document.body && document.body.classList.contains('dr-view-list');
    var show = matched > 0 && (pages > 1 || onList);
    pager.style.display = show ? 'flex' : 'none';
    if (!show) return;
    if (info) info.textContent = 'Page ' + (page + 1) + ' of ' + pages;
    if (prev) {
      prev.disabled = page <= 0;
      prev.classList.toggle('is-disabled', page <= 0);
    }
    if (next) {
      next.disabled = page >= pages - 1;
      next.classList.toggle('is-disabled', page >= pages - 1);
    }
  }

  var _lastSig = '';

  function applyTicketFilters(refetch) {
    var lf = getLF();
    if (lf.sort == null) lf.sort = 'newest';
    if (lf.limit == null) lf.limit = 20;
    if (lf.page == null) lf.page = 0;
    var limit = parseInt(lf.limit, 10);
    if ([10, 20, 50].indexOf(limit) === -1) limit = 20;
    lf.limit = limit;

    var all = getTickets();
    var total = all.length;
    var matched = all.filter(function (t) { return matchTicket(t, lf); });
    matched = sortTickets(matched, lf.sort);
    var pages = Math.max(1, Math.ceil(matched.length / limit) || 1);
    if (lf.page >= pages) lf.page = Math.max(0, pages - 1);
    if (lf.page < 0) lf.page = 0;
    var page = lf.page;
    var start = page * limit;
    var slice = matched.slice(start, start + limit);
    var from = matched.length ? start + 1 : 0;
    var to = start + slice.length;

    var sig = [page, limit, matched.length, lf.q, lf.status, lf.priority, lf.sort].join('|');
    updateHint(from, to, matched.length, total, page, pages);
    updatePager(page, pages, matched.length);

    if (window.DR && typeof window.DR.renderTicketList === 'function') {
      try {
        window.DR.renderTicketList(slice);
        _lastSig = sig;
        return;
      } catch (e) {}
    }
    // Fallback: hide/show existing cards by data-id
    var list = document.getElementById('ticket-list');
    if (!list) return;
    var cards = list.querySelectorAll('.ticket-card[data-id]');
    if (!cards.length) return;
    var idSet = {};
    slice.forEach(function (t) { idSet[t.id] = true; });
    cards.forEach(function (c) {
      var id = c.getAttribute('data-id');
      c.style.display = idSet[id] ? '' : 'none';
    });
    _lastSig = sig;
  }

  function refreshList() {
    applyTicketFilters(false);
  }

  function resetPage() {
    var lf = getLF();
    lf.page = 0;
  }

  function clearFilters() {
    var lf = getLF();
    lf.q = '';
    lf.status = '';
    lf.priority = '';
    lf.sort = 'newest';
    lf.page = 0;
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    if (si) si.value = '';
    if (fs) fs.value = '';
    if (fp) fp.value = '';
    if (so) so.value = 'newest';
    applyTicketFilters(false);
    toast('Filters cleared', 'info');
  }

  function ensureLimitControl() {
    var lim = document.getElementById('filter-limit');
    var wrap = lim ? lim.closest('.dr-limit-wrap') : null;
    var host =
      document.getElementById('dr-list-toolbar-right') ||
      (document.getElementById('filter-sort') && document.getElementById('filter-sort').parentElement) ||
      document.querySelector('.topbar-actions');
    if (!host) return;

    if (!wrap) {
      wrap = document.createElement('span');
      wrap.className = 'dr-limit-wrap';
      wrap.innerHTML =
        '<label for="filter-limit">Show</label>' +
        '<select id="filter-limit" class="filter-select" title="Tickets per page">' +
        '<option value="10">10</option>' +
        '<option value="20" selected>20</option>' +
        '<option value="50">50</option>' +
        '</select>';
      host.appendChild(wrap);
    } else if (wrap.parentNode !== host) {
      host.appendChild(wrap);
    }
    lim = document.getElementById('filter-limit');
    if (lim) {
      var lf = getLF();
      var v = parseInt(lf.limit, 10);
      if ([10, 20, 50].indexOf(v) === -1) v = 20;
      lim.value = String(v);
    }
  }

  function bindPager() {
    ensurePager();
    var prev = document.getElementById('dr-page-prev');
    var next = document.getElementById('dr-page-next');
    if (prev && !prev.__drBound) {
      prev.__drBound = true;
      prev.addEventListener('click', function (e) {
        e.preventDefault();
        var lf = getLF();
        if (lf.page > 0) {
          lf.page -= 1;
          _lastSig = '';
          refreshList();
        }
      });
    }
    if (next && !next.__drBound) {
      next.__drBound = true;
      next.addEventListener('click', function (e) {
        e.preventDefault();
        var lf = getLF();
        lf.page = (lf.page || 0) + 1;
        _lastSig = '';
        refreshList();
      });
    }
  }

  function bindClear() {
    var btn = document.getElementById('btn-clear-filters') || document.querySelector('[data-action="clear-filters"]');
    if (btn && !btn.__drClearBound) {
      btn.__drClearBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        clearFilters();
      });
    }
  }

  function bindSearchFilters() {
    ensureLimitControl();
    bindPager();
    var lf = getLF();
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    var lim = document.getElementById('filter-limit');
    var timer;

    if (si && !si.__drFilterBound) {
      si.__drFilterBound = true;
      si.addEventListener('input', function () {
        lf.q = si.value || '';
        resetPage();
        clearTimeout(timer);
        timer = setTimeout(function () { refreshList(); }, 180);
      });
    }
    if (fs && !fs.__drFilterBound) {
      fs.__drFilterBound = true;
      fs.addEventListener('change', function () {
        lf.status = fs.value || '';
        resetPage();
        refreshList();
      });
    }
    if (fp && !fp.__drFilterBound) {
      fp.__drFilterBound = true;
      fp.addEventListener('change', function () {
        lf.priority = fp.value || '';
        resetPage();
        refreshList();
      });
    }
    if (so && !so.__drFilterBound) {
      so.__drFilterBound = true;
      so.addEventListener('change', function () {
        lf.sort = so.value || 'newest';
        resetPage();
        refreshList();
      });
    }
    if (lim && !lim.__drFilterBound) {
      lim.__drFilterBound = true;
      lim.addEventListener('change', function () {
        var v = parseInt(lim.value, 10);
        lf.limit = [10, 20, 50].indexOf(v) !== -1 ? v : 20;
        resetPage();
        _lastSig = '';
        refreshList();
      });
    }
  }

  function boot() {
    bindClear();
    bindSearchFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(function () { boot(); applyTicketFilters(false); }, 2500);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.classList && t.classList.contains('nav-btn') || (t.closest && t.closest('.nav-btn')))) {
      setTimeout(function () {
        resetPage();
        boot();
        applyTicketFilters(false);
      }, 100);
      setTimeout(function () { boot(); applyTicketFilters(false); }, 400);
    }
  }, true);

  window.DRClearFilters = clearFilters;
  window.applyTicketFilters = applyTicketFilters;
  window.DRFilters = {
    ensureControls: function () {
      ensureLimitControl();
      bindPager();
      bindSearchFilters();
    },
    refresh: function () { applyTicketFilters(false); }
  };
})();
