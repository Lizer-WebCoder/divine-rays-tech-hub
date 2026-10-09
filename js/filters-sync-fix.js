/**
 * Divine Rays — filters sync v3
 * Mutates the APP's listFilter (DR.getListFilter) in place so search/status/priority work.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FILTERS_SYNC_FIX >= 3) return;
  window.__DR_FILTERS_SYNC_FIX = 3;

  function getLF() {
    try {
      if (window.DR && typeof DR.getListFilter === 'function') {
        var dr = DR.getListFilter();
        if (dr && typeof dr === 'object') {
          window.__drListFilter = dr;
          if (dr.limit == null) dr.limit = 20;
          if (dr.sort == null) dr.sort = 'newest';
          if (dr.page == null) dr.page = 0;
          if (dr.q == null) dr.q = '';
          if (dr.status == null) dr.status = '';
          if (dr.priority == null) dr.priority = '';
          if (dr.mode == null) dr.mode = 'all';
          return dr;
        }
      }
    } catch (e) {}
    if (!window.__drListFilter) {
      window.__drListFilter = {
        mode: 'all', q: '', status: '', priority: '', sort: 'newest', limit: 20, page: 0
      };
    }
    return window.__drListFilter;
  }

  function modeFromNav() {
    var active = document.querySelector('#portal-agent .nav-btn.active');
    var view = active ? String(active.getAttribute('data-view') || '').toLowerCase() : '';
    var title = String((document.getElementById('page-title') || {}).textContent || '').toLowerCase();
    if (view === 'my-tickets' || /my tickets/.test(title)) return 'my';
    if (view === 'unassigned' || /unassigned/.test(title)) return 'unassigned';
    if (view === 'all-tickets' || /^all tickets/.test(title)) return 'all';
    if (view === 'dashboard' || /^dashboard/.test(title)) return 'dashboard';
    if (view === 'kb' || /knowledge/.test(title)) return 'kb';
    if (view === 'users' || view === 'admin' || /users/.test(title)) return 'users';
    return getLF().mode || 'all';
  }

  function getTickets() {
    try {
      if (window.DR && typeof DR.getAllTickets === 'function') {
        var t = DR.getAllTickets();
        if (Array.isArray(t) && t.length) return t;
      }
    } catch (e) {}
    if (Array.isArray(window.allTicketsCache) && window.allTicketsCache.length) return window.allTicketsCache;
    return [];
  }

  function norm(s) {
    return String(s || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  }

  function matchesQuery(t, q) {
    q = String(q || '').trim().toLowerCase();
    if (!q) return true;
    var names = {};
    try {
      if (window.DR && typeof DR.getNameCache === 'function') names = DR.getNameCache() || {};
    } catch (e) {}
    var blob = [
      t.id, t.title, t.subject, t.description, t.ticket_number, t.code, t.ticket_code,
      t.category, t.status, t.priority, t.requester_email, t.assigned_email,
      names[t.requester_id], names[t.assigned_to]
    ].join(' ').toLowerCase();
    var compact = blob.replace(/[^a-z0-9]+/g, '');
    var tokens = q.split(/\s+/).filter(Boolean);
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var tokC = tok.replace(/[^a-z0-9]+/g, '');
      if (blob.indexOf(tok) === -1 && (!tokC || compact.indexOf(tokC) === -1)) return false;
    }
    return true;
  }

  function matchesStatus(ticketStatus, filterStatus) {
    if (!filterStatus) return true;
    var a = norm(ticketStatus);
    var b = norm(filterStatus);
    if (a === b) return true;
    if (b.indexOf('progress') !== -1 && a.indexOf('progress') !== -1) return true;
    if (b === 'open' && (a === 'open' || a === 'new')) return true;
    return false;
  }

  function matchesPriority(ticketPriority, filterPriority) {
    if (!filterPriority) return true;
    return norm(ticketPriority) === norm(filterPriority);
  }

  function matchesMode(t, mode) {
    mode = String(mode || 'all').toLowerCase();
    if (mode === 'all') return true;
    if (mode === 'my') {
      var pid = null;
      try {
        if (window.DR && typeof DR.getProfile === 'function') {
          var p = DR.getProfile();
          if (p && p.id) pid = String(p.id);
        }
      } catch (e) {}
      if (!pid) return true;
      return String(t.assigned_to || '') === pid;
    }
    if (mode === 'unassigned') {
      return !t.assigned_to || t.assigned_to === '' || t.assigned_to === null;
    }
    return true;
  }

  function sortTickets(list, sort) {
    var arr = list.slice();
    var rank = { critical: 0, high: 1, medium: 2, low: 3 };
    arr.sort(function (a, b) {
      if (sort === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sort === 'priority') {
        var pa = rank[norm(a.priority)]; var pb = rank[norm(b.priority)];
        if (pa == null) pa = 9; if (pb == null) pb = 9;
        if (pa !== pb) return pa - pb;
      }
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    });
    return arr;
  }

  function esc(s) {
    if (window.DR && DR.esc) return DR.esc(s);
    return String(s == null ? '' : s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }
  function sc(s) {
    if (window.DR && DR.sc) return DR.sc(s);
    return 'badge-' + String(s || '').toLowerCase().replace(/\s+/g, '-');
  }
  function fmt(iso) {
    if (window.DR && DR.fmt) return DR.fmt(iso);
    try {
      return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function cardHtml(t, names) {
    names = names || {};
    var req = names[t.requester_id] || t.requester_email || 'End-User';
    var initials = (function (n) {
      n = String(n || '').trim();
      var p = n.split(/\s+/).filter(Boolean);
      if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
      return (n.slice(0, 2) || '?').toUpperCase();
    })(req);
    return (
      '<div class="ticket-card" data-id="' + esc(t.id) + '">' +
      '<div class="ticket-av">' + esc(initials) + '</div>' +
      '<div class="ticket-body"><h4>' + esc(t.title || '') + '</h4>' +
      '<div class="ticket-meta" data-dr-spaced="1">' +
      '<span class="ticket-id">' + esc(t.ticket_number || '') + '</span>' +
      '<span class="meta-sep"> · </span><span>' + esc(req) + '</span>' +
      '<span class="meta-sep"> · </span><span>' + esc(t.category || '—') + '</span>' +
      '<span class="meta-sep"> · </span><span>' + esc(fmt(t.updated_at || t.created_at)) + '</span>' +
      '</div></div>' +
      '<div class="badges">' +
      '<span class="badge ' + sc(t.priority) + '">' + esc(t.priority || '') + '</span>' +
      '<span class="badge ' + sc(t.status) + '">' + esc(t.status || '') + '</span>' +
      '</div></div>'
    );
  }

  function readControls() {
    var lf = getLF();
    var si = document.getElementById('search-input');
    var st = document.getElementById('filter-status');
    var pr = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    var lim = document.getElementById('filter-limit');
    if (si) lf.q = si.value || '';
    if (st) lf.status = st.value || '';
    if (pr) lf.priority = pr.value || '';
    if (so) lf.sort = so.value || 'newest';
    if (lim) {
      var v = parseInt(lim.value, 10);
      lf.limit = [10, 20, 50].indexOf(v) !== -1 ? v : 20;
    }
    lf.mode = modeFromNav();
    return lf;
  }

  function applyFiltersNow() {
    var lf = readControls();
    if (lf.mode === 'dashboard' || lf.mode === 'kb' || lf.mode === 'users') return;
    var container = document.getElementById('ticket-list');
    if (!container) return;
    var all = getTickets();
    if (!all.length) return;

    var names = {};
    try {
      if (window.DR && typeof DR.getNameCache === 'function') names = DR.getNameCache() || {};
    } catch (e2) {}

    var filtered = all.filter(function (t) {
      return matchesMode(t, lf.mode) && matchesStatus(t.status, lf.status) &&
        matchesPriority(t.priority, lf.priority) && matchesQuery(t, lf.q);
    });
    filtered = sortTickets(filtered, lf.sort || 'newest');

    var limit = parseInt(lf.limit, 10) || 20;
    if ([10, 20, 50].indexOf(limit) === -1) limit = 20;
    if (lf.page == null || isNaN(lf.page)) lf.page = 0;
    var pages = filtered.length > limit ? Math.ceil(filtered.length / limit) : 1;
    if (lf.page > pages - 1) lf.page = Math.max(0, pages - 1);
    var start = lf.page * limit;
    var pageItems = filtered.slice(start, start + limit);

    if (!pageItems.length) {
      container.innerHTML = '<div class="empty-state"><p>' +
        (all.length ? 'No tickets match these filters.' : 'No tickets.') + '</p></div>';
    } else {
      container.innerHTML = pageItems.map(function (t) { return cardHtml(t, names); }).join('');
      container.querySelectorAll('.ticket-card').forEach(function (card) {
        card.addEventListener('click', function () {
          var id = card.getAttribute('data-id');
          if (window.DR && typeof DR.openTicket === 'function') DR.openTicket(id);
          else if (typeof window.openTicket === 'function') window.openTicket(id);
        });
      });
    }
    try {
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('visibility', 'visible', 'important');
    } catch (e3) {}
    var hint = document.getElementById('filter-hint');
    if (hint) {
      var from = filtered.length ? start + 1 : 0;
      var to = start + pageItems.length;
      hint.textContent = filtered.length
        ? 'Showing ' + from + '\u2013' + to + ' of ' + filtered.length +
          (filtered.length !== all.length ? ' (' + all.length + ' total)' : '')
        : all.length ? 'No matches' : 'No tickets';
    }
  }

  var timer = null;
  function schedule(resetPage) {
    if (resetPage) getLF().page = 0;
    clearTimeout(timer);
    timer = setTimeout(applyFiltersNow, 80);
  }

  function bind() {
    var si = document.getElementById('search-input');
    if (si && !si.__drSyncV3) {
      si.__drSyncV3 = true;
      si.addEventListener('input', function () { getLF().q = si.value || ''; schedule(true); }, true);
      si.addEventListener('keyup', function () { getLF().q = si.value || ''; schedule(true); }, true);
    }
    [['filter-status', 'status'], ['filter-priority', 'priority'], ['filter-sort', 'sort'], ['filter-limit', 'limit']].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el && !el.__drSyncV3) {
        el.__drSyncV3 = true;
        el.addEventListener('change', function () {
          var lf = getLF();
          if (pair[1] === 'limit') {
            var v = parseInt(el.value, 10);
            lf.limit = [10, 20, 50].indexOf(v) !== -1 ? v : 20;
          } else {
            lf[pair[1]] = el.value || (pair[1] === 'sort' ? 'newest' : '');
          }
          schedule(true);
        }, true);
      }
    });
  }

  window.applyTicketFilters = function (refetch) {
    readControls();
    applyFiltersNow();
  };

  bind();
  setTimeout(bind, 200);
  setTimeout(bind, 800);
  setTimeout(bind, 2000);
  setInterval(bind, 5000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(function () { bind(); getLF().mode = modeFromNav(); schedule(true); }, 100);
      setTimeout(applyFiltersNow, 500);
    }
  }, true);

  window.DRFiltersSyncFix = { refresh: applyFiltersNow, v: 3 };
})();
