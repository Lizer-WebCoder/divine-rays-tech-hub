/**
 * Divine Rays — filters + Clear + applyTicketFilters (status/priority/search/sort)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FILTERS_V2) return;
  window.__DR_FILTERS_V2 = 1;

  function toast(msg, type) {
    if (window.DR && DR.toast) return DR.toast(msg, type);
    var c = document.getElementById('toast-container');
    if (!c) return;
    var e = document.createElement('div');
    e.className = 'toast ' + (type || 'info');
    e.textContent = msg;
    c.appendChild(e);
    setTimeout(function () { e.remove(); }, 2500);
  }

  function esc(s) {
    if (window.DR && DR.esc) return DR.esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
        if (lf) return lf;
      } catch (e) {}
    }
    if (!window.__drListFilter) {
      window.__drListFilter = { mode: 'all', q: '', status: '', priority: '', sort: 'newest' };
    }
    return window.__drListFilter;
  }

  function getTickets() {
    if (window.DR && typeof DR.getAllTickets === 'function') {
      try {
        var t = DR.getAllTickets();
        if (Array.isArray(t)) return t;
      } catch (e) {}
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
    // tolerate slight naming differences
    if (b === 'in progress' && (a === 'in-progress' || a === 'inprogress' || a === 'progress')) return true;
    if (b === 'waiting' && (a === 'waiting on customer' || a === 'pending')) return true;
    return false;
  }

  function matchesPriority(ticketPriority, filterPriority) {
    if (!filterPriority) return true;
    return normalizeStatus(ticketPriority) === normalizeStatus(filterPriority);
  }

  function matchesQuery(t, q) {
    if (!q) return true;
    var needle = String(q).trim().toLowerCase();
    if (!needle) return true;
    var names = getNames();
    var hay = [
      t.title,
      t.ticket_number,
      t.description,
      t.category,
      t.status,
      t.priority,
      names[t.requester_id],
      names[t.assigned_to]
    ].join(' ').toLowerCase();
    return hay.indexOf(needle) !== -1;
  }

  function sortTickets(list, sortKey) {
    var key = sortKey || 'newest';
    var arr = list.slice();
    arr.sort(function (a, b) {
      if (key === 'priority') {
        var pa = PRIORITY_RANK[a.priority] != null ? PRIORITY_RANK[a.priority] : 9;
        var pb = PRIORITY_RANK[b.priority] != null ? PRIORITY_RANK[b.priority] : 9;
        if (pa !== pb) return pa - pb;
        return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
      }
      if (key === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      // newest (default) — by updated then created
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    });
    return arr;
  }

  function cardHtml(t, names) {
    names = names || {};
    return (
      '<div class="ticket-card" data-id="' + esc(t.id) + '">' +
      '<div><h4>' + esc(t.title) + '</h4>' +
      '<div class="ticket-meta">' +
      '<span class="ticket-id">' + esc(t.ticket_number) + '</span>' +
      '<span>' + esc(names[t.requester_id] || 'Customer') + '</span>' +
      '<span>' + esc(t.category || '') + '</span>' +
      '<span>' + esc(fmt(t.updated_at || t.created_at)) + '</span>' +
      '</div></div>' +
      '<div class="badges">' +
      '<span class="badge ' + sc(t.priority) + '">' + esc(t.priority || '') + '</span>' +
      '<span class="badge ' + sc(t.status) + '">' + esc(t.status) + '</span>' +
      '</div></div>'
    );
  }

  function updateHint(count, total, lf) {
    var hint = document.getElementById('filter-hint');
    if (!hint) return;
    var parts = [];
    if (lf.status) parts.push(lf.status);
    if (lf.priority) parts.push(lf.priority);
    if (lf.q) parts.push('"' + lf.q + '"');
    if (!parts.length) {
      hint.textContent = '';
      return;
    }
    hint.textContent = 'Showing ' + count + ' of ' + total + ' · ' + parts.join(' · ');
  }

  /**
   * Client-side filter/sort of the agent ticket list.
   * @param {boolean} refetch - if true, ask core app to re-fetch first (best effort)
   */
  function applyTicketFilters(refetch) {
    var lf = getLF();
    if (lf.sort == null) lf.sort = 'newest';

    // Keep DOM controls in sync with state
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    if (si && document.activeElement !== si) si.value = lf.q || '';
    if (fs) fs.value = lf.status || '';
    if (fp) fp.value = lf.priority || '';
    if (so) so.value = lf.sort || 'newest';

    var container = document.getElementById('ticket-list');
    if (!container) return;

    if (refetch && window.DR && typeof DR.renderTicketList === 'function') {
      // renderTicketList fetches then calls applyTicketFilters(false) when present
      try {
        DR.renderTicketList();
        return;
      } catch (e) {}
    }

    var all = getTickets();
    var names = getNames();
    var filtered = all.filter(function (t) {
      return matchesStatus(t.status, lf.status) &&
        matchesPriority(t.priority, lf.priority) &&
        matchesQuery(t, lf.q);
    });
    filtered = sortTickets(filtered, lf.sort);

    updateHint(filtered.length, all.length, lf);

    if (!filtered.length) {
      container.innerHTML =
        '<div class="empty-state"><p>' +
        (all.length ? 'No tickets match these filters.' : 'No tickets.') +
        '</p></div>';
      return;
    }

    container.innerHTML = filtered.map(function (t) {
      return cardHtml(t, names);
    }).join('');

    container.querySelectorAll('.ticket-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        if (window.DR && typeof DR.openTicket === 'function') {
          DR.openTicket(id);
        } else if (typeof window.openTicket === 'function') {
          window.openTicket(id);
        }
      });
    });

    // Optional SLA badges from extras
    if (window.DR && typeof window.enhanceListWithSla === 'function') {
      try { window.enhanceListWithSla(); } catch (e) {}
    }
  }

  window.applyTicketFilters = applyTicketFilters;

  function refreshList() {
    applyTicketFilters(false);
  }

  function clearFilters() {
    var lf = getLF();
    lf.q = '';
    lf.status = '';
    lf.priority = '';
    lf.sort = 'newest';
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    if (si) si.value = '';
    if (fs) fs.value = '';
    if (fp) fp.value = '';
    if (so) so.value = 'newest';
    var hint = document.getElementById('filter-hint');
    if (hint) hint.textContent = '';
    applyTicketFilters(false);
    toast('Filters cleared', 'info');
  }

  function bindClear() {
    var clr = document.getElementById('btn-clear-filters');
    if (!clr || clr.__drClearBound) return;
    clr.__drClearBound = true;
    clr.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearFilters();
    });
  }

  function bindSearchFilters() {
    var lf = getLF();
    if (lf.sort == null) lf.sort = 'newest';
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    var timer;

    if (si && !si.__drFilterBound) {
      si.__drFilterBound = true;
      si.addEventListener('input', function () {
        lf.q = si.value || '';
        clearTimeout(timer);
        timer = setTimeout(function () { refreshList(); }, 180);
      });
    }
    if (fs && !fs.__drFilterBound) {
      fs.__drFilterBound = true;
      fs.addEventListener('change', function () {
        lf.status = fs.value || '';
        refreshList();
      });
    }
    if (fp && !fp.__drFilterBound) {
      fp.__drFilterBound = true;
      fp.addEventListener('change', function () {
        lf.priority = fp.value || '';
        refreshList();
      });
    }
    if (so && !so.__drFilterBound) {
      so.__drFilterBound = true;
      so.addEventListener('change', function () {
        lf.sort = so.value || 'newest';
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
  setTimeout(boot, 4000);
  // Re-bind after agent nav switches views (controls reappear)
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.classList && t.classList.contains('nav-btn') || (t.closest && t.closest('.nav-btn')))) {
      setTimeout(boot, 100);
      setTimeout(boot, 500);
    }
  }, true);

  window.DRClearFilters = clearFilters;
})();
