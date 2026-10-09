/**
 * Divine Rays — ticket search/filter SYNC fix
 * Ensures My / Unassigned / All tabs filter against the real ticket set
 * (title, ticket code, status, priority) and stay applied.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_FILTERS_SYNC_FIX >= 2) return;
  window.__DR_FILTERS_SYNC_FIX = 2;

  function getLF() {
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

  function scrapeDomTickets() {
    var cards = document.querySelectorAll('#ticket-list .ticket-card');
    var out = [];
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id') || card.getAttribute('data-ticket-id') || '';
      var titleEl = card.querySelector('h4, .ticket-title, .title');
      var idEl = card.querySelector('.ticket-id, .ticket-number, [data-ticket-number]');
      var meta = card.querySelector('.ticket-meta');
      var badges = card.querySelectorAll('.badge, .badges span');
      var priority = '';
      var status = '';
      badges.forEach(function (b) {
        var t = (b.textContent || '').trim();
        var cls = (b.className || '').toLowerCase();
        if (/critical|high|medium|low/i.test(t) || /priority|critical|high|medium|low/.test(cls)) {
          if (/critical|high|medium|low/i.test(t)) priority = t;
        }
        if (/open|progress|waiting|resolved|closed|pending/i.test(t) || /status|open|progress|waiting|resolved|closed/.test(cls)) {
          if (/open|progress|waiting|resolved|closed|pending/i.test(t)) status = t;
        }
      });
      var requester = '';
      if (meta) {
        var spans = meta.querySelectorAll('span');
        spans.forEach(function (sp) {
          var tx = (sp.textContent || '').trim();
          if (tx && !/^DR-/i.test(tx) && tx !== '\u00b7' && !/ago|AM|PM|\d{1,2}:\d{2}/.test(tx)) {
            if (!requester && !/^(Open|Closed|Resolved|Waiting|In Progress|Critical|High|Medium|Low)$/i.test(tx)) {
              if (!sp.classList.contains('ticket-id')) requester = tx;
            }
          }
        });
      }
      var number = idEl
        ? (idEl.getAttribute('data-ticket-number') || idEl.textContent || '').trim()
        : '';
      out.push({
        id: id,
        title: titleEl ? (titleEl.textContent || '').trim() : '',
        ticket_number: number,
        code: number,
        description: (card.getAttribute('data-description') || ''),
        category: card.getAttribute('data-category') || '',
        status: status || card.getAttribute('data-status') || '',
        priority: priority || card.getAttribute('data-priority') || '',
        assigned_to: card.getAttribute('data-assigned-to') || '',
        requester_id: card.getAttribute('data-requester-id') || '',
        requester_email: requester,
        created_at: card.getAttribute('data-created') || '',
        updated_at: card.getAttribute('data-updated') || '',
        __fromDom: true
      });
    });
    return out;
  }

  function collectTickets() {
    var list = [];
    try {
      if (window.DR && typeof DR.getAllTickets === 'function') {
        var t = DR.getAllTickets();
        if (Array.isArray(t) && t.length) list = t.slice();
      }
    } catch (e0) {}
    if (!list.length && window.DR && Array.isArray(window.DR.tickets) && window.DR.tickets.length) {
      list = window.DR.tickets.slice();
    }
    if (!list.length && Array.isArray(window.allTicketsCache) && window.allTicketsCache.length) {
      list = window.allTicketsCache.slice();
    }
    if (!list.length && Array.isArray(window.__drTickets) && window.__drTickets.length) {
      list = window.__drTickets.slice();
    }
    var dom = scrapeDomTickets();
    if (dom.length) {
      var byId = Object.create(null);
      list.forEach(function (t) {
        if (t && t.id != null) byId[String(t.id)] = t;
      });
      dom.forEach(function (d) {
        var id = String(d.id || '');
        if (id && byId[id]) {
          var o = byId[id];
          if (!o.title && d.title) o.title = d.title;
          if (!o.ticket_number && d.ticket_number) o.ticket_number = d.ticket_number;
          if (!o.status && d.status) o.status = d.status;
          if (!o.priority && d.priority) o.priority = d.priority;
        } else if (id && !byId[id]) {
          list.push(d);
          byId[id] = d;
        } else if (!id) {
          list.push(d);
        }
      });
    }
    if (list.length) {
      window.allTicketsCache = list;
      try {
        if (window.DR && typeof DR.setAllTickets === 'function') DR.setAllTickets(list);
      } catch (e1) {}
    }
    return list;
  }

  function norm(s) {
    return String(s || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  }

  function matchesQuery(t, q) {
    q = String(q || '').trim().toLowerCase();
    if (!q) return true;
    var blob = [
      t.id, t.title, t.subject, t.description,
      t.ticket_number, t.code, t.ticket_code, t.number,
      t.category, t.status, t.priority,
      t.requester_email, t.assigned_email, t.requester_name, t.assigned_name
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
    if (mode === 'all' || mode === 'dashboard') return true;
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
    arr.sort(function (a, b) {
      if (sort === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sort === 'priority') {
        var rank = { critical: 0, high: 1, medium: 2, low: 3 };
        var pa = rank[norm(a.priority)] != null ? rank[norm(a.priority)] : 9;
        var pb = rank[norm(b.priority)] != null ? rank[norm(b.priority)] : 9;
        if (pa !== pb) return pa - pb;
      }
      return new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0);
    });
    return arr;
  }

  function esc(s) {
    if (window.DR && DR.esc) return DR.esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function cardHtml(t) {
    var title = t.title || t.subject || 'Untitled';
    var num = t.ticket_number || t.code || t.ticket_code || '';
    var st = t.status || '';
    var pr = t.priority || '';
    return (
      '<div class="ticket-card" data-id="' +
      esc(t.id) +
      '" data-status="' +
      esc(st) +
      '" data-priority="' +
      esc(pr) +
      '">' +
      '<div class="ticket-body"><h4>' +
      esc(title) +
      '</h4>' +
      '<div class="ticket-meta"><span class="ticket-id">' +
      esc(num) +
      '</span></div></div>' +
      '<div class="badges">' +
      (pr ? '<span class="badge">' + esc(pr) + '</span>' : '') +
      (st ? '<span class="badge">' + esc(st) + '</span>' : '') +
      '</div></div>'
    );
  }

  function apply() {
    var lf = getLF();
    lf.mode = modeFromNav();
    if (lf.mode === 'dashboard' || lf.mode === 'kb' || lf.mode === 'users') return;

    var container = document.getElementById('ticket-list');
    if (!container) return;

    var all = collectTickets();
    if (!all.length) {
      if (typeof window.applyTicketFilters === 'function') {
        try { window.applyTicketFilters(true); } catch (e) {}
      }
      return;
    }

    var filtered = all.filter(function (t) {
      return (
        matchesMode(t, lf.mode) &&
        matchesStatus(t.status, lf.status) &&
        matchesPriority(t.priority, lf.priority) &&
        matchesQuery(t, lf.q)
      );
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
      container.innerHTML =
        '<div class="empty-state"><p>' +
        (all.length ? 'No tickets match these filters.' : 'No tickets.') +
        '</p></div>';
    } else {
      if (typeof window.applyTicketFilters === 'function' && !pageItems[0].__fromDom) {
        try {
          window.__drListFilter = lf;
          window.allTicketsCache = all;
          window.applyTicketFilters(false);
          return;
        } catch (e2) {}
      }
      container.innerHTML = pageItems.map(function (t) { return cardHtml(t); }).join('');
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
        : all.length
          ? 'No matches'
          : 'No tickets';
    }
  }

  function readControlsIntoLF() {
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

  var timer = null;
  function scheduleApply(resetPage) {
    if (resetPage) getLF().page = 0;
    readControlsIntoLF();
    clearTimeout(timer);
    timer = setTimeout(function () { apply(); }, 120);
  }

  function bind() {
    var si = document.getElementById('search-input');
    if (si && !si.__drSyncBound) {
      si.__drSyncBound = true;
      si.addEventListener('input', function () { scheduleApply(true); }, true);
      si.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); scheduleApply(true); }
      }, true);
    }
    ['filter-status', 'filter-priority', 'filter-sort', 'filter-limit'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.__drSyncBound) {
        el.__drSyncBound = true;
        el.addEventListener('change', function () { scheduleApply(true); }, true);
      }
    });
  }

  function tick() {
    bind();
    var mode = modeFromNav();
    if (mode === 'my' || mode === 'unassigned' || mode === 'all') {
      collectTickets();
      var lf = getLF();
      if (lf.q || lf.status || lf.priority) apply();
    }
  }

  bind();
  setTimeout(bind, 300);
  setTimeout(bind, 1000);
  setTimeout(tick, 1500);
  setInterval(bind, 4000);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
      setTimeout(function () { bind(); readControlsIntoLF(); scheduleApply(true); }, 80);
      setTimeout(function () { collectTickets(); scheduleApply(false); }, 400);
    }
  }, true);

  var _orig = window.applyTicketFilters;
  window.applyTicketFilters = function (refetch) {
    readControlsIntoLF();
    collectTickets();
    if (typeof _orig === 'function') {
      try { return _orig(refetch); } catch (e) { apply(); }
    } else {
      apply();
    }
  };

  window.DRFiltersSyncFix = { refresh: apply, collect: collectTickets, v: 2 };
})();
