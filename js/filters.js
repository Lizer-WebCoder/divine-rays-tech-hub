/**
 * Divine Rays — filters + limit + Prev/Next pagination + stable list
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_FILTERS_V4 = 1;

  function toast(msg, type) {
    if (window.DR && DR.toast) return DR.toast(msg, type);
  }

  function esc(s) {
    if (window.DR && DR.esc) return DR.esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function fmt(iso) {
    if (window.DR && DR.fmt) return DR.fmt(iso);
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  function sc(s) {
    if (window.DR && DR.sc) return DR.sc(s);
    return 'badge-' + String(s || '').toLowerCase().replace(/\s+/g, '-');
  }

  function getLF() {
    if (window.DR && typeof DR.getListFilter === 'function') {
      try {
        var lf = DR.getListFilter();
        if (lf) {
          if (lf.limit == null) lf.limit = 20;
          if (lf.sort == null) lf.sort = 'newest';
          if (lf.page == null) lf.page = 0;
          return lf;
        }
      } catch (e) {}
    }
    if (!window.__drListFilter) {
      window.__drListFilter = {
        mode: 'all', q: '', status: '', priority: '', sort: 'newest', limit: 20, page: 0
      };
    }
    if (window.__drListFilter.limit == null) window.__drListFilter.limit = 20;
    if (window.__drListFilter.page == null) window.__drListFilter.page = 0;
    return window.__drListFilter;
  }

  function getTickets() {
    if (window.DR && typeof DR.getAllTickets === 'function') {
      try {
        var t = DR.getAllTickets();
        if (Array.isArray(t) && t.length) return t;
      } catch (e) {}
    }
    if (window.DR && Array.isArray(window.DR.tickets) && window.DR.tickets.length) {
      return window.DR.tickets;
    }
    if (Array.isArray(window.allTicketsCache) && window.allTicketsCache.length) {
      return window.allTicketsCache;
    }
    if (Array.isArray(window.__drTickets) && window.__drTickets.length) {
      return window.__drTickets;
    }
    if (window.DR && typeof DR.getAllTickets === 'function') {
      try {
        var t2 = DR.getAllTickets();
        if (Array.isArray(t2)) return t2;
      } catch (e2) {}
    }
    return window.allTicketsCache || [];
  }

  function getNames() {
    if (window.DR && typeof DR.getNameCache === 'function') {
      try { return DR.getNameCache() || {}; } catch (e) {}
    }
    return window.nameCache || {};
  }

  var PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  function normalizeStatus(s) {
    return String(s || '').trim().toLowerCase();
  }

  function matchesStatus(ticketStatus, filterStatus) {
    if (!filterStatus) return true;
    var a = normalizeStatus(ticketStatus);
    var b = normalizeStatus(filterStatus);
    if (a === b) return true;
    if (b === 'in progress' && (a === 'in-progress' || a === 'inprogress' || a === 'progress')) return true;
    if (b === 'in-progress' && (a === 'in progress' || a === 'inprogress')) return true;
    return false;
  }

  function matchesPriority(ticketPriority, filterPriority) {
    if (!filterPriority) return true;
    return normalizeStatus(ticketPriority) === normalizeStatus(filterPriority);
  }

  function matchesQuery(t, q) {
    q = String(q || '').trim().toLowerCase();
    if (!q) return true;
    var names = getNames();
    var blob = [
      t.title, t.description, t.ticket_number, t.category, t.status, t.priority,
      names[t.requester_id], names[t.assigned_to]
    ].join(' ').toLowerCase();
    return blob.indexOf(q) !== -1;
  }

  function sortTickets(list, sort) {
    sort = sort || 'newest';
    var arr = list.slice();
    arr.sort(function (a, b) {
      if (sort === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sort === 'priority') {
        var pa = PRIORITY_RANK[a.priority] != null ? PRIORITY_RANK[a.priority] : 9;
        var pb = PRIORITY_RANK[b.priority] != null ? PRIORITY_RANK[b.priority] : 9;
        if (pa !== pb) return pa - pb;
      }
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    });
    return arr;
  }

  function cardHtml(t, names) {
    names = names || {};
    var req = names[t.requester_id] || 'End-User';
    var initials = (function (n) {
      n = String(n || '').trim();
      var p = n.split(/\s+/).filter(Boolean);
      if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
      return (n.slice(0, 2) || '?').toUpperCase();
    })(req);

    return (
      '<div class="ticket-card" data-id="' + esc(t.id) + '">' +
      '<div class="ticket-av">' + esc(initials) + '</div>' +
      '<div class="ticket-body"><h4>' + esc(t.title) + '</h4>' +
      '<div class="ticket-meta" data-dr-spaced="1">' +
      '<span class="ticket-id">' + esc(t.ticket_number) + '</span>' +
      '<span class="meta-sep">·</span>' +
      '<span>' + esc(req) + '</span>' +
      '<span class="meta-sep">·</span>' +
      '<span>' + esc(t.category || '—') + '</span>' +
      '<span class="meta-sep">·</span>' +
      '<span>' + esc(fmt(t.updated_at || t.created_at)) + '</span>' +
      '</div></div>' +
      '<div class="badges">' +
      '<span class="badge ' + sc(t.priority) + '">' + esc(t.priority || '') + '</span>' +
      '<span class="badge ' + sc(t.status) + '">' + esc(t.status) + '</span>' +
      '</div></div>'
    );
  }

  function updateHint(from, to, matched, total, page, pages) {
    var hint = document.getElementById('filter-hint');
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

    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    var lim = document.getElementById('filter-limit');
    if (si && document.activeElement !== si) si.value = lf.q || '';
    if (fs) fs.value = lf.status || '';
    if (fp) fp.value = lf.priority || '';
    if (so) so.value = lf.sort || 'newest';
    if (lim) lim.value = String(limit);

    var container = document.getElementById('ticket-list');
    if (!container) return;

    if (refetch && window.DR && typeof DR.renderTicketList === 'function') {
      var existing = getTickets();
      if (!existing.length) {
        try { DR.renderTicketList(); return; } catch (e) {}
      }
    }

    var all = getTickets();
    var names = getNames();
    var filtered = all.filter(function (t) {
      return matchesStatus(t.status, lf.status) &&
        matchesPriority(t.priority, lf.priority) &&
        matchesQuery(t, lf.q);
    });
    filtered = sortTickets(filtered, lf.sort);
    var matched = filtered.length;
    var pages = Math.max(1, Math.ceil(matched / limit) || 1);
    if (lf.page < 0) lf.page = 0;
    if (lf.page > pages - 1) lf.page = pages - 1;
    var page = lf.page;
    var start = page * limit;
    var pageItems = filtered.slice(start, start + limit);
    var from = matched ? start + 1 : 0;
    var to = start + pageItems.length;

    updateHint(from, to, matched, all.length, page, pages);
    updatePager(page, pages, matched);

    var sig =
      limit + '|' + page + '|' + (lf.sort || '') + '|' + (lf.status || '') + '|' +
      (lf.priority || '') + '|' + (lf.q || '') + '|' +
      pageItems.map(function (t) {
        return t.id + ':' + (t.status || '') + ':' + (t.priority || '') + ':' + (t.updated_at || t.created_at || '');
      }).join(',');
    if (sig === _lastSig && container.querySelector('.ticket-card')) {
      return;
    }
    _lastSig = sig;

    if (!pageItems.length) {
      var stillLoading = !all.length && /loading/i.test(container.textContent || '');
      if (stillLoading) {
        setTimeout(function () { applyTicketFilters(false); }, 600);
        return;
      }
      container.innerHTML =
        '<div class="empty-state"><p>' +
        (all.length ? 'No tickets match these filters.' : 'No tickets.') +
        '</p></div>';
      return;
    }

    container.innerHTML = pageItems.map(function (t) {
      return cardHtml(t, names);
    }).join('');

    container.querySelectorAll('.ticket-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        if (window.DR && typeof DR.openTicket === 'function') DR.openTicket(id);
        else if (typeof window.openTicket === 'function') window.openTicket(id);
      });
    });

    if (typeof window.enhanceListWithSla === 'function') {
      try { window.enhanceListWithSla(); } catch (e) {}
    }
  }

  window.applyTicketFilters = applyTicketFilters;

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
  setTimeout(function () { applyTicketFilters(false); }, 4000);
  setTimeout(function () { applyTicketFilters(false); }, 7000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.classList && t.classList.contains('nav-btn') || (t.closest && t.closest('.nav-btn')))) {
      setTimeout(function () {
        resetPage();
        boot();
        applyTicketFilters(false);
      }, 100);
      setTimeout(function () { boot(); applyTicketFilters(false); }, 400);
      setTimeout(function () { applyTicketFilters(false); }, 1200);
    }
  }, true);

  window.DRClearFilters = clearFilters;
  window.DRFilters = {
    ensureControls: function () { ensureLimitControl(); bindPager(); bindSearchFilters(); },
    refresh: function () { applyTicketFilters(false); }
  };
})();
