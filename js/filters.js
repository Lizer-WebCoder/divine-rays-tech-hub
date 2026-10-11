/**
 * Divine Rays — filters v17 — P1–P4 priority match + shared listFilter
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_FILTERS_V17 = 1;
  window.__DR_FILTERS_V16 = 1;
  window.__DR_FILTERS_V13 = 1;
  window.__DR_FILTERS_V12 = 1;
  window.__DR_FILTERS_V11 = 1;
  window.__DR_FILTERS_V10 = 1;
  window.__DR_FILTERS_V9 = 1;
  window.__DR_FILTERS_V8 = 1;
  window.__DR_FILTERS_V7 = 1;
  window.__DR_FILTERS_V6 = 1;
  window.__DR_FILTERS_V5 = 1;

  function esc(s) {
    if (window.DR && DR.esc) return DR.esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }

  function fmt(iso) {
    if (window.DR && DR.fmt) return DR.fmt(iso);
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return ''; }
  }

  function sc(s) {
    if (window.DR && DR.sc) return DR.sc(s);
    return 'badge-' + String(s || '').toLowerCase().replace(/\s+/g, '-');
  }

  function getLF() {
    try {
      if (window.DR && typeof DR.getListFilter === 'function') {
        var drLf = DR.getListFilter();
        if (drLf && typeof drLf === 'object') {
          window.__drListFilter = drLf;
          if (drLf.limit == null) drLf.limit = 20;
          if (drLf.sort == null) drLf.sort = 'newest';
          if (drLf.page == null || isNaN(drLf.page)) drLf.page = 0;
          if (drLf.q == null) drLf.q = '';
          if (drLf.status == null) drLf.status = '';
          if (drLf.priority == null) drLf.priority = '';
          if (drLf.mode == null) drLf.mode = 'all';
          return drLf;
        }
      }
    } catch (e) {}
    if (!window.__drListFilter) {
      window.__drListFilter = {
        mode: 'all', q: '', status: '', priority: '', sort: 'newest', limit: 20, page: 0
      };
    }
    var lf = window.__drListFilter;
    if (lf.limit == null) lf.limit = 20;
    if (lf.sort == null) lf.sort = 'newest';
    if (lf.page == null || isNaN(lf.page)) lf.page = 0;
    return lf;
  }

  function getTickets() {
    if (window.DR && typeof DR.getAllTickets === 'function') {
      try {
        var t = DR.getAllTickets();
        if (Array.isArray(t) && t.length) return t;
      } catch (e) {}
    }
    if (window.DR && Array.isArray(window.DR.tickets) && window.DR.tickets.length) return window.DR.tickets;
    if (Array.isArray(window.allTicketsCache) && window.allTicketsCache.length) return window.allTicketsCache;
    if (Array.isArray(window.__drTickets) && window.__drTickets.length) return window.__drTickets;
    return window.allTicketsCache || [];
  }

  function dedupeTickets(list) {
    if (!Array.isArray(list) || !list.length) return [];
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (!t) continue;
      var id = t.id != null ? String(t.id) : '';
      var key = id || ('row:' + i + ':' + (t.ticket_number || '') + ':' + (t.title || ''));
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(t);
    }
    return out;
  }

  function getNames() {
    if (window.DR && typeof DR.getNameCache === 'function') {
      try { return DR.getNameCache() || {}; } catch (e) {}
    }
    return window.nameCache || {};
  }

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
    if (typeof window.__drPriorityEquals === 'function') {
      try { return window.__drPriorityEquals(ticketPriority, filterPriority); } catch (e) {}
    }
    var map = {
      critical: 'p1', p1: 'p1',
      high: 'p2', p2: 'p2',
      medium: 'p3', p3: 'p3',
      low: 'p4', p4: 'p4'
    };
    var a = map[normalizeStatus(ticketPriority)] || normalizeStatus(ticketPriority);
    var b = map[normalizeStatus(filterPriority)] || normalizeStatus(filterPriority);
    return a === b;
  }

  function matchesQuery(t, q) {
    q = String(q || '').trim().toLowerCase();
    if (!q) return true;
    var names = getNames();
    var blob = [
      t.id, t.title, t.description, t.ticket_number, t.category, t.status, t.priority,
      t.requester_email, t.assigned_email,
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

  function currentProfileId() {
    try {
      if (window.DR && typeof DR.getProfile === 'function') {
        var p = DR.getProfile();
        if (p && p.id) return p.id;
      }
      if (window.__drProfile && window.__drProfile.id) return window.__drProfile.id;
    } catch (e) {}
    return null;
  }

  function matchesMode(t, mode) {
    mode = String(mode || 'all').toLowerCase();
    if (mode === 'all') return true;
    if (mode === 'my') {
      var pid = currentProfileId();
      if (!pid) return true;
      return String(t.assigned_to || '') === String(pid);
    }
    if (mode === 'unassigned') {
      return !t.assigned_to || t.assigned_to === null || t.assigned_to === '';
    }
    return true;
  }

  function sortTickets(list, sort) {
    sort = sort || 'newest';
    var arr = list.slice();
    var rank = { critical: 0, p1: 0, high: 1, p2: 1, medium: 2, p3: 2, low: 3, p4: 3 };
    arr.sort(function (a, b) {
      if (sort === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sort === 'priority') {
        var pa = rank[normalizeStatus(a.priority)];
        var pb = rank[normalizeStatus(b.priority)];
        if (pa == null) pa = 9;
        if (pb == null) pb = 9;
        if (pa !== pb) return pa - pb;
      }
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    });
    return arr;
  }

  function syncModeFromNav() {
    var lf = getLF();
    var active = document.querySelector('#portal-agent .nav-btn.active');
    var view = active ? String(active.getAttribute('data-view') || '').toLowerCase() : '';
    var title = String((document.getElementById('page-title') || {}).textContent || '').toLowerCase();
    if (view === 'my-tickets' || /my tickets/.test(title)) lf.mode = 'my';
    else if (view === 'unassigned' || /unassigned/.test(title)) lf.mode = 'unassigned';
    else if (view === 'all-tickets' || /^all tickets/.test(title)) lf.mode = 'all';
    else if (view === 'dashboard' || /^dashboard/.test(title)) lf.mode = 'dashboard';
    else if (view === 'kb' || /knowledge/.test(title)) lf.mode = 'kb';
    else if (view === 'users' || view === 'admin' || /users/.test(title)) lf.mode = 'users';
    return lf.mode;
  }

  function syncToolbarVisibility() {
    var mode = syncModeFromNav();
    var actions = document.querySelector('#portal-agent .topbar-actions');
    var showToolbar = (mode === 'my' || mode === 'unassigned' || mode === 'all' || mode === 'dashboard');
    var showSearch = (mode === 'my' || mode === 'unassigned' || mode === 'all');
    if (actions) {
      try {
        if (showToolbar) {
          actions.style.setProperty('display', 'flex', 'important');
          actions.style.setProperty('visibility', 'visible', 'important');
          actions.style.setProperty('opacity', '1', 'important');
        } else {
          actions.style.setProperty('display', 'none', 'important');
        }
      } catch (e) {}
    }
    var si = document.getElementById('search-input');
    if (si) {
      try {
        if (showSearch) {
          si.style.setProperty('display', 'inline-block', 'important');
          si.style.setProperty('visibility', 'visible', 'important');
          si.style.setProperty('opacity', '1', 'important');
          si.style.setProperty('pointer-events', 'auto', 'important');
          si.removeAttribute('hidden');
        } else {
          si.style.setProperty('display', 'none', 'important');
        }
      } catch (e2) {}
    }
  }

  function priLabel(p) {
    if (typeof window.__drPriorityLabel === 'function') {
      try { return window.__drPriorityLabel(p) || p || ''; } catch (e) {}
    }
    var map = { critical: 'P1', high: 'P2', medium: 'P3', low: 'P4' };
    var n = String(p || '').trim().toLowerCase();
    return map[n] || p || '';
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
    var pl = priLabel(t.priority);
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
      '<span class="badge ' + sc(pl || t.priority) + '">' + esc(pl) + '</span>' +
      '<span class="badge ' + sc(t.status) + '">' + esc(t.status) + '</span>' +
      '</div></div>'
    );
  }

  function updateHint(from, to, matched, total, page, pages) {
    var hint = document.getElementById('filter-hint');
    if (!hint) return;
    if (!matched) { hint.textContent = total ? 'No matches' : 'No tickets'; return; }
    hint.textContent = 'Showing ' + from + '–' + to + ' of ' + matched +
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
        '<span id="dr-page-info" class="dr-page-info"></span>' +
        '<button type="button" class="dr-page-btn" id="dr-page-next" aria-label="Next page">Next →</button>';
      if (list.parentNode) list.parentNode.insertBefore(pager, list.nextSibling);
    }
    return pager;
  }

  function updatePager(page, pages, matched, limit) {
    ensurePager();
    var info = document.getElementById('dr-page-info');
    var prev = document.getElementById('dr-page-prev');
    var next = document.getElementById('dr-page-next');
    if (info) info.textContent = 'Page ' + (page + 1) + ' / ' + pages + ' · ' + matched + ' tickets';
    if (prev) prev.disabled = page <= 0;
    if (next) next.disabled = page >= pages - 1;
  }

  var _lastSig = '';

  function applyTicketFilters(refetch) {
    var lf = getLF();
    try {
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
        var lv = parseInt(lim.value, 10);
        if ([10, 20, 50].indexOf(lv) !== -1) lf.limit = lv;
      }
    } catch (eCtrl) {}
    if (lf.sort == null) lf.sort = 'newest';
    if (lf.limit == null) lf.limit = 20;
    if (lf.page == null) lf.page = 0;
    var limit = parseInt(lf.limit, 10);
    if ([10, 20, 50].indexOf(limit) === -1) limit = 20;
    lf.limit = limit;

    var container = document.getElementById('ticket-list');
    if (!container) return;
    try {
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('visibility', 'visible', 'important');
    } catch (eShow) {}

    var all = getTickets();
    if ((!all || !all.length) && window.DR && typeof DR.fetchTickets === 'function') {
      if (!window.__drFiltersFetching) {
        window.__drFiltersFetching = true;
        Promise.resolve(DR.fetchTickets({})).then(function (tickets) {
          window.__drFiltersFetching = false;
          if (window.DR && typeof DR.setAllTickets === 'function') DR.setAllTickets(tickets || []);
          window.allTicketsCache = tickets || [];
          applyTicketFilters(false);
        }).catch(function () {
          window.__drFiltersFetching = false;
          container.innerHTML = '<div class="empty-state"><p>Could not load tickets. Try refresh.</p></div>';
        });
      }
      return;
    }

    syncModeFromNav();
    syncToolbarVisibility();
    if (lf.mode === 'dashboard' || lf.mode === 'kb' || lf.mode === 'users') return;

    var names = getNames();
    all = dedupeTickets(all);
    var filtered = all.filter(function (t) {
      return matchesMode(t, lf.mode) &&
        matchesStatus(t.status, lf.status) &&
        matchesPriority(t.priority, lf.priority) &&
        matchesQuery(t, lf.q);
    });
    filtered = sortTickets(filtered, lf.sort);
    var matched = filtered.length;
    var pages = matched > limit ? Math.ceil(matched / limit) : 1;
    if (pages < 1) pages = 1;
    if (lf.page < 0) lf.page = 0;
    if (lf.page > pages - 1) lf.page = pages - 1;
    var page = lf.page;
    var start = page * limit;
    var pageItems = filtered.slice(start, start + limit);
    var from = matched ? start + 1 : 0;
    var to = start + pageItems.length;

    updateHint(from, to, matched, all.length, page, pages);
    try { window.__drPagerMatched = matched; } catch (eM) {}
    updatePager(page, pages, matched, limit);

    var sig = limit + '|' + page + '|' + (lf.q || '') + '|' + (lf.status || '') + '|' + (lf.priority || '') + '|' + (lf.mode || '') + '|' +
      pageItems.map(function (t) { return t.id; }).join(',');
    window.__drLastPageRender = page;
    if (sig === _lastSig && container.querySelector('.ticket-card') && pageItems.length) {
      if (!lf.q && !lf.status && !lf.priority) return;
    }
    _lastSig = sig;

    if (!pageItems.length) {
      container.innerHTML = '<div class="empty-state"><p>' +
        (all.length ? 'No tickets match these filters.' : 'No tickets.') + '</p></div>';
      updatePager(0, 1, matched || 0, limit);
      return;
    }

    container.innerHTML = pageItems.map(function (t) { return cardHtml(t, names); }).join('');
    container.querySelectorAll('.ticket-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        if (window.DR && typeof DR.openTicket === 'function') DR.openTicket(id);
        else if (typeof window.openTicket === 'function') window.openTicket(id);
      });
    });
  }

  window.applyTicketFilters = applyTicketFilters;

  function refreshList() { applyTicketFilters(false); }
  function resetPage() { getLF().page = 0; _lastSig = ''; }

  function clearFilters() {
    var lf = getLF();
    lf.q = ''; lf.status = ''; lf.priority = ''; lf.sort = 'newest'; lf.page = 0;
    var si = document.getElementById('search-input');
    if (si) si.value = '';
    ['filter-status', 'filter-priority'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var so = document.getElementById('filter-sort');
    if (so) so.value = 'newest';
    _lastSig = '';
    applyTicketFilters(false);
  }

  function ensureLimitControl() {
    var actions = document.querySelector('#portal-agent .topbar-actions');
    if (!actions || document.getElementById('filter-limit')) return;
    var wrap = document.createElement('span');
    wrap.className = 'dr-limit-wrap';
    wrap.innerHTML = '<label for="filter-limit">Show</label><select id="filter-limit"><option value="10">10</option><option value="20" selected>20</option><option value="50">50</option></select>';
    actions.appendChild(wrap);
  }

  function bindPager() {
    ensurePager();
    var prev = document.getElementById('dr-page-prev');
    var next = document.getElementById('dr-page-next');
    function goPage(delta) {
      var lf = getLF();
      var nextPage = (parseInt(lf.page, 10) || 0) + delta;
      if (nextPage < 0) nextPage = 0;
      lf.page = nextPage;
      _lastSig = '';
      applyTicketFilters(false);
    }
    if (prev && !prev.__drBound) {
      prev.__drBound = true;
      prev.addEventListener('click', function (e) {
        e.preventDefault(); goPage(-1);
      });
    }
    if (next && !next.__drBound) {
      next.__drBound = true;
      next.addEventListener('click', function (e) {
        e.preventDefault(); goPage(1);
      });
    }
  }

  function bindSearchFilters() {
    ensureLimitControl();
    bindPager();
    var si = document.getElementById('search-input');
    var lim = document.getElementById('filter-limit');
    var timer;
    if (si && !si.__drFilterBound) {
      si.__drFilterBound = true;
      function onSearch() {
        getLF().q = si.value || '';
        resetPage();
        clearTimeout(timer);
        timer = setTimeout(function () { refreshList(); }, 120);
      }
      si.addEventListener('input', onSearch, true);
      si.addEventListener('keyup', onSearch, true);
      si.addEventListener('search', onSearch, true);
    }
    if (lim && !lim.__drFilterBound) {
      lim.__drFilterBound = true;
      lim.addEventListener('change', function () {
        var lf = getLF();
        var v = parseInt(lim.value, 10);
        lf.limit = [10, 20, 50].indexOf(v) !== -1 ? v : 20;
        resetPage();
        _lastSig = '';
        refreshList();
      }, true);
    }
    ['filter-status', 'filter-priority', 'filter-sort'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.__drFilterBound) {
        el.__drFilterBound = true;
        el.addEventListener('change', function () {
          var lf = getLF();
          if (id === 'filter-status') lf.status = el.value || '';
          if (id === 'filter-priority') lf.priority = el.value || '';
          if (id === 'filter-sort') lf.sort = el.value || 'newest';
          resetPage();
          refreshList();
        }, true);
      }
    });
    var clearBtn = document.getElementById('btn-clear-filters');
    if (clearBtn && !clearBtn.__drFilterBound) {
      clearBtn.__drFilterBound = true;
      clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        clearFilters();
      });
    }
  }

  function boot() {
    bindSearchFilters();
    syncToolbarVisibility();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(function () { boot(); applyTicketFilters(false); }, 1500);
  setTimeout(function () { applyTicketFilters(false); }, 3500);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(function () { resetPage(); boot(); applyTicketFilters(false); }, 100);
      setTimeout(function () { applyTicketFilters(false); }, 500);
    }
  }, true);

  window.DRFilters = { refresh: function () { applyTicketFilters(false); } };
})();
