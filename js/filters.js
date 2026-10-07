/**
 * Divine Rays — filters v8 — strict single-page hide + dedupe tickets
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_FILTERS_V8 = 1;
  window.__DR_FILTERS_V7 = 1;
  window.__DR_FILTERS_V6 = 1;
  window.__DR_FILTERS_V5 = 1;

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
      t.id, t.title, t.description, t.ticket_number, t.category, t.status, t.priority,
      t.requester_email, t.assigned_email,
      names[t.requester_id], names[t.assigned_to]
    ].join(' ').toLowerCase();
    var tokens = q.split(/\s+/).filter(Boolean);
    for (var i = 0; i < tokens.length; i++) {
      if (blob.indexOf(tokens[i]) === -1) return false;
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

  function syncModeFromNav() {
    var lf = getLF();
    var active = document.querySelector('#portal-agent .nav-btn.active:not([data-dr-users-root]):not(#dr-users-sub .nav-btn)');
    if (!active) active = document.querySelector('#portal-agent .nav-btn.active');
    var view = active ? String(active.getAttribute('data-view') || '').toLowerCase().trim() : '';
    var title = (document.getElementById('page-title') || {}).textContent || '';
    title = String(title).toLowerCase();
    var mode = lf.mode || 'all';
    if (view === 'my-tickets' || /my tickets/i.test(title)) mode = 'my';
    else if (view === 'unassigned' || /unassigned/i.test(title)) mode = 'unassigned';
    else if (view === 'all-tickets' || /^all tickets/i.test(title)) mode = 'all';
    else if (view === 'dashboard' || /^dashboard/i.test(title)) mode = 'dashboard';
    else if (view === 'kb' || /knowledge/i.test(title)) mode = 'kb';
    else if (view === 'users' || view === 'admin' || /users/i.test(title)) mode = 'users';
    lf.mode = mode;
    return mode;
  }

  function matchesMode(t, mode) {
    mode = String(mode || 'all').toLowerCase();
    if (mode === 'all' || mode === 'dashboard' || mode === 'kb' || mode === 'users') return true;
    if (mode === 'my') {
      var pid = currentProfileId();
      if (!pid) return true;
      return String(t.assigned_to || '') === String(pid);
    }
    if (mode === 'unassigned') {
      return !t.assigned_to || t.assigned_to === '' || t.assigned_to === null;
    }
    return true;
  }

  function syncToolbarVisibility() {
    var mode = syncModeFromNav();
    var actions = document.querySelector('#portal-agent .topbar-actions');
    var show = (mode === 'my' || mode === 'unassigned' || mode === 'all');
    if (actions) {
      try {
        if (show) {
          actions.style.removeProperty('display');
          actions.style.setProperty('display', 'flex', 'important');
          actions.style.setProperty('flex-wrap', 'wrap', 'important');
          actions.style.setProperty('align-items', 'center', 'important');
          actions.style.setProperty('gap', '0.5rem', 'important');
          actions.style.setProperty('max-width', '100%', 'important');
        } else {
          actions.style.setProperty('display', 'none', 'important');
        }
      } catch (e) {}
    }
    var si = document.getElementById('search-input');
    if (si && show) {
      try {
        si.style.setProperty('min-width', '12rem', 'important');
        si.style.setProperty('max-width', '18rem', 'important');
        si.style.setProperty('flex', '1 1 12rem', 'important');
      } catch (e2) {}
    }
    var wrap = document.querySelector('.dr-limit-wrap');
    if (wrap) {
      try { wrap.style.display = show ? 'inline-flex' : 'none'; } catch (e3) {}
    }
    var pager = document.getElementById('dr-ticket-pager');
    if (pager && !show) {
      try { pager.style.display = 'none'; } catch (e4) {}
    }
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

  function updatePager(page, pages, matched, limit) {
    var pager = ensurePager();
    if (!pager) return;
    var prev = document.getElementById('dr-page-prev');
    var next = document.getElementById('dr-page-next');
    var info = document.getElementById('dr-page-info');
    matched = parseInt(matched, 10) || 0;
    limit = parseInt(limit, 10) || 20;
    if (limit < 1) limit = 20;
    var totalPages = matched > limit ? Math.ceil(matched / limit) : 1;
    if (totalPages < 1) totalPages = 1;
    var cur = Math.max(0, parseInt(page, 10) || 0);
    if (cur > totalPages - 1) cur = totalPages - 1;
    var show = matched > limit && totalPages > 1;
    try {
      pager.style.setProperty('display', show ? 'flex' : 'none', 'important');
    } catch (e) {
      pager.style.display = show ? 'flex' : 'none';
    }
    if (!show) {
      if (info) info.textContent = '';
      return;
    }
    if (info) info.textContent = 'Page ' + (cur + 1) + ' of ' + totalPages;
    if (prev) {
      prev.disabled = cur <= 0;
      prev.classList.toggle('is-disabled', cur <= 0);
    }
    if (next) {
      next.disabled = cur >= totalPages - 1;
      next.classList.toggle('is-disabled', cur >= totalPages - 1);
    }
  }

  function renameUnassignedNav() {
    try {
      document.querySelectorAll('#portal-agent .nav-btn[data-view="unassigned"]').forEach(function (btn) {
        var kids = Array.prototype.slice.call(btn.childNodes);
        var set = false;
        kids.forEach(function (n) {
          if (n.nodeType === 3 && (n.textContent || '').trim()) {
            if (!set) {
              n.textContent = ' Unassigned Tickets';
              set = true;
            }
          }
        });
        if (!set) {
          var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
          if (/^unassigned$/i.test(label) || /^unassigned tickets$/i.test(label)) {
            btn.childNodes.forEach(function (n) {
              if (n.nodeType === 3) n.textContent = '';
            });
            var span = btn.querySelector('[data-dr-unassigned-label]');
            if (!span) {
              span = document.createElement('span');
              span.setAttribute('data-dr-unassigned-label', '1');
              btn.appendChild(span);
            }
            span.textContent = 'Unassigned Tickets';
          }
        }
      });
    } catch (e) {}
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

    var all = getTickets();
    if ((!all || !all.length) && window.DR && typeof DR.fetchTickets === 'function') {
      if (!window.__drFiltersFetching) {
        window.__drFiltersFetching = true;
        var lf0 = getLF();
        var f = {};
        if (lf0.mode === 'my' && window.DR.getProfile) {
          try {
            var p = DR.getProfile();
            if (p && p.id) f.assignedTo = p.id;
          } catch (e) {}
        } else if (lf0.mode === 'unassigned') {
          f.unassigned = true;
        }
        Promise.resolve(DR.fetchTickets(f)).then(function (tickets) {
          window.__drFiltersFetching = false;
          if (window.DR && typeof DR.setAllTickets === 'function') {
            DR.setAllTickets(tickets || []);
          }
          window.allTicketsCache = tickets || [];
          applyTicketFilters(false);
        }).catch(function () {
          window.__drFiltersFetching = false;
          container.innerHTML = '<div class="empty-state"><p>Could not load tickets. Try refresh.</p></div>';
        });
      }
      return;
    }

    if (refetch && window.DR && typeof DR.renderTicketList === 'function') {
      try { DR.renderTicketList(); return; } catch (e) {}
    }

    syncModeFromNav();
    syncToolbarVisibility();
    if (lf.mode === 'dashboard' || lf.mode === 'kb' || lf.mode === 'users') {
      return;
    }

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
    updatePager(page, pages, matched, limit);

    var sig =
      limit + '|' + page + '|' + (lf.sort || '') + '|' + (lf.status || '') + '|' +
      (lf.priority || '') + '|' + (lf.q || '') + '|' + (lf.mode || '') + '|' +
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
        window.__drFilterRetry = (window.__drFilterRetry || 0) + 1;
        if (window.__drFilterRetry < 12) {
          setTimeout(function () { applyTicketFilters(false); }, 500);
          return;
        }
        window.__drFilterRetry = 0;
      } else {
        window.__drFilterRetry = 0;
      }
      container.innerHTML =
        '<div class="empty-state"><p>' +
        (all.length ? 'No tickets match these filters.' : 'No tickets.') +
        '</p></div>';
      return;
    }

    window.__drFilterRetry = 0;
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

  function injectFiltersCss() {
    if (document.getElementById('dr-filters-v6-css')) return;
    var el = document.createElement('style');
    el.id = 'dr-filters-v6-css';
    el.textContent = [
      '#portal-agent .topbar{align-items:flex-start!important;flex-wrap:wrap!important;gap:0.65rem!important}',
      '#portal-agent .topbar #page-title{flex:0 0 auto;margin:0}',
      '#portal-agent .topbar-actions{display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;justify-content:flex-end;flex:1 1 auto;min-width:0;max-width:100%}',
      '#portal-agent #search-input{min-width:12rem;max-width:18rem;flex:1 1 12rem;box-sizing:border-box}',
      '#portal-agent #filter-status,#portal-agent #filter-priority,#portal-agent #filter-sort{max-width:9.5rem}',
      'body.dr-view-endusers #portal-agent .topbar-actions,body.dr-view-admin-staff #portal-agent .topbar-actions{display:none!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(el);
  }

  function forcePagerAccuracy() {
    try {
      var lf = getLF();
      var limit = parseInt(lf.limit, 10) || 20;
      var all = dedupeTickets(getTickets());
      var filtered = all.filter(function (t) {
        return matchesMode(t, lf.mode) &&
          matchesStatus(t.status, lf.status) &&
          matchesPriority(t.priority, lf.priority) &&
          matchesQuery(t, lf.q);
      });
      var matched = filtered.length;
      updatePager(lf.page || 0, matched > limit ? Math.ceil(matched / limit) : 1, matched, limit);
    } catch (e) {}
  }

  function boot() {
    injectFiltersCss();
    renameUnassignedNav();
    bindClear();
    bindSearchFilters();
    syncToolbarVisibility();
    forcePagerAccuracy();
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
  setInterval(forcePagerAccuracy, 1200);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && (t.classList && t.classList.contains('nav-btn') || (t.closest && t.closest('.nav-btn')))) {
      setTimeout(function () {
        resetPage();
        boot();
        syncModeFromNav();
        syncToolbarVisibility();
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
