/**
 * Divine Rays Tech Hub — search, filters, sort, export (v7.2)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  function esc(s) { return (window.DR && DR.esc) ? DR.esc(s) : String(s || ''); }
  function sc(s) { return (window.DR && DR.sc) ? DR.sc(s) : ('badge-' + String(s || '').toLowerCase().replace(/\s+/g, '-')); }
  function toast(m, t) { if (window.DR && DR.toast) DR.toast(m, t); }

  function relTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso).getTime();
      var sec = Math.round((Date.now() - d) / 1000);
      if (sec < 60) return 'just now';
      if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
      if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
      if (sec < 604800) return Math.floor(sec / 86400) + 'd ago';
      return new Date(iso).toLocaleDateString();
    } catch (e) { return ''; }
  }

  function initials(name) {
    var p = String(name || '?').trim().split(/\s+/);
    if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
    return String(name || '?').slice(0, 2).toUpperCase();
  }

  function isUnread(t) {
    try {
      var key = 'dr_seen_' + t.id;
      var seen = localStorage.getItem(key);
      if (!seen) return t.status === 'Open' || t.status === 'Waiting';
      return new Date(t.updated_at || t.created_at).getTime() > new Date(seen).getTime();
    } catch (e) { return false; }
  }

  function markSeen(id) {
    try { localStorage.setItem('dr_seen_' + id, new Date().toISOString()); } catch (e) {}
  }
  window.DRMarkTicketSeen = markSeen;

  function matches(t, lf, names) {
    if (lf.status && t.status !== lf.status) return false;
    if (lf.priority && t.priority !== lf.priority) return false;
    var q = (lf.q || '').trim().toLowerCase();
    if (!q) return true;
    var hay = [t.ticket_number, t.title, t.description, t.category, t.status, t.priority, names[t.requester_id] || '', names[t.assigned_to] || ''].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  var PRI = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  function sortTickets(list, sort) {
    var arr = list.slice();
    if (sort === 'oldest') {
      arr.sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
    } else if (sort === 'priority') {
      arr.sort(function (a, b) {
        var pa = PRI[a.priority] != null ? PRI[a.priority] : 9;
        var pb = PRI[b.priority] != null ? PRI[b.priority] : 9;
        if (pa !== pb) return pa - pb;
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      });
    } else {
      arr.sort(function (a, b) { return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at); });
    }
    return arr;
  }

  function cardHtml(t, names) {
    var who = names[t.requester_id] || 'Customer';
    var unread = isUnread(t) ? ' is-unread' : '';
    var dot = isUnread(t) ? '<span class="unread-dot" title="Updated since last view"></span>' : '';
    return '<div class="ticket-card' + unread + '" data-id="' + t.id + '">' +
      '<div class="ticket-card-main">' +
      '<div class="avatar-init" title="' + esc(who) + '">' + esc(initials(who)) + '</div>' +
      '<div class="ticket-card-body">' +
      '<h4>' + dot + esc(t.title) + '</h4>' +
      '<div class="ticket-meta">' +
      '<span class="ticket-id" data-copy="' + esc(t.ticket_number) + '" title="Click to copy">' + esc(t.ticket_number) + '</span>' +
      '<span>' + esc(who) + '</span>' +
      '<span>' + esc(t.category || '') + '</span>' +
      '<span title="' + esc(t.updated_at || t.created_at) + '">' + relTime(t.updated_at || t.created_at) + '</span>' +
      '</div></div></div>' +
      '<div class="badges"><span class="badge ' + sc(t.priority) + '">' + esc(t.priority || '') + '</span><span class="badge ' + sc(t.status) + '">' + esc(t.status) + '</span></div></div>';
  }

  function emptyHtml(lf, allLen) {
    var filtered = lf.q || lf.status || lf.priority;
    if (filtered) {
      return '<div class="empty-state">' +
        '<p>No tickets match your search/filters.</p>' +
        '<button type="button" class="btn btn-secondary btn-sm" id="empty-clear">Clear filters</button>' +
        '</div>';
    }
    if (!allLen) {
      return '<div class="empty-state"><p>No tickets yet.</p><p class="empty-sub">New customer tickets will show up here.</p></div>';
    }
    return '<div class="empty-state"><p>No tickets in this view.</p></div>';
  }

  function skeletonHtml() {
    return '<div class="skel-list">' +
      [1, 2, 3].map(function () {
        return '<div class="skel-card"><div class="skel-line w60"></div><div class="skel-line w40"></div></div>';
      }).join('') + '</div>';
  }

  function applyTicketFilters() {
    if (!window.DR || !DR.getListFilter) return;
    var lf = DR.getListFilter();
    var c = document.getElementById('ticket-list');
    if (!c) return;
    var all = DR.getAllTickets() || [];
    var names = DR.getNameCache() || {};
    var filtered = sortTickets(all.filter(function (t) { return matches(t, lf, names); }), lf.sort || 'newest');
    var hint = document.getElementById('filter-hint');
    if (hint) {
      var bits = [];
      if (lf.q) bits.push('"' + lf.q + '"');
      if (lf.status) bits.push(lf.status);
      if (lf.priority) bits.push(lf.priority);
      if (lf.sort && lf.sort !== 'newest') bits.push('sort: ' + lf.sort);
      hint.textContent = bits.length ? ('Showing ' + filtered.length + ' of ' + all.length + ' · ' + bits.join(' · ')) : (all.length ? (filtered.length + ' tickets') : '');
    }
    if (!filtered.length) {
      c.innerHTML = emptyHtml(lf, all.length);
      var clr = document.getElementById('empty-clear');
      if (clr) clr.addEventListener('click', function () {
        lf.q = ''; lf.status = ''; lf.priority = '';
        var si = document.getElementById('search-input');
        var fs = document.getElementById('filter-status');
        var fp = document.getElementById('filter-priority');
        if (si) si.value = '';
        if (fs) fs.value = '';
        if (fp) fp.value = '';
        applyTicketFilters();
      });
      return;
    }
    c.innerHTML = filtered.map(function (t) { return cardHtml(t, names); }).join('');
    c.querySelectorAll('.ticket-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('ticket-id')) {
          e.stopPropagation();
          var id = e.target.getAttribute('data-copy') || e.target.textContent;
          if (navigator.clipboard) navigator.clipboard.writeText(id).then(function () { toast('Copied ' + id, 'success'); });
          else toast(id, 'info');
          return;
        }
        var tid = card.getAttribute('data-id');
        markSeen(tid);
        if (DR.openTicket) DR.openTicket(tid);
      });
    });
  }

  window.applyTicketFilters = function (refetch) {
    if (refetch && DR.fetchTickets) {
      var c = document.getElementById('ticket-list');
      if (c && !(DR.getAllTickets() || []).length) c.innerHTML = skeletonHtml();
      var lf = DR.getListFilter();
      var mode = lf.mode || 'all';
      var opts = {};
      if (mode === 'my' && DR.getProfile) {
        var p = DR.getProfile();
        if (p) opts.assigned_to = p.id;
      }
      if (mode === 'unassigned') opts.unassigned = true;
      DR.fetchTickets(opts).then(function () { applyTicketFilters(); });
      return;
    }
    applyTicketFilters();
  };

  function exportJSON() {
    var all = (DR.getAllTickets && DR.getAllTickets()) || [];
    var blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'divine-rays-tickets-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    toast('Exported JSON', 'success');
  }

  function exportCSV() {
    var all = (DR.getAllTickets && DR.getAllTickets()) || [];
    var names = (DR.getNameCache && DR.getNameCache()) || {};
    var cols = ['ticket_number', 'title', 'status', 'priority', 'category', 'requester', 'assignee', 'created_at', 'updated_at'];
    function cell(v) {
      var s = String(v == null ? '' : v).replace(/"/g, '""');
      return '"' + s + '"';
    }
    var lines = [cols.join(',')];
    all.forEach(function (t) {
      lines.push([
        cell(t.ticket_number), cell(t.title), cell(t.status), cell(t.priority), cell(t.category),
        cell(names[t.requester_id] || ''), cell(names[t.assigned_to] || ''),
        cell(t.created_at), cell(t.updated_at)
      ].join(','));
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'divine-rays-tickets-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    toast('Exported CSV', 'success');
  }
  window.DRExportCSV = exportCSV;

  function bindUI() {
    var lf = DR.getListFilter();
    if (lf.sort == null) lf.sort = 'newest';
    var si = document.getElementById('search-input');
    var fs = document.getElementById('filter-status');
    var fp = document.getElementById('filter-priority');
    var so = document.getElementById('filter-sort');
    var clr = document.getElementById('btn-clear-filters');
    var timer;
    if (si) si.addEventListener('input', function () {
      lf.q = si.value || '';
      clearTimeout(timer);
      timer = setTimeout(function () { window.applyTicketFilters(false); }, 180);
    });
    if (fs) fs.addEventListener('change', function () { lf.status = fs.value || ''; window.applyTicketFilters(false); });
    if (fp) fp.addEventListener('change', function () { lf.priority = fp.value || ''; window.applyTicketFilters(false); });
    if (so) so.addEventListener('change', function () { lf.sort = so.value || 'newest'; window.applyTicketFilters(false); });
    if (clr) clr.addEventListener('click', function () {
      lf.q = ''; lf.status = ''; lf.priority = ''; lf.sort = 'newest';
      if (si) si.value = '';
      if (fs) fs.value = '';
      if (fp) fp.value = '';
      if (so) so.value = 'newest';
      window.applyTicketFilters(false);
    });
    var ex = document.getElementById('btn-export');
    if (ex) ex.addEventListener('click', exportJSON);
    var ecx = document.getElementById('btn-export-csv');
    if (ecx) ecx.addEventListener('click', exportCSV);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (window.DR && DR.getListFilter) { clearInterval(t); bindUI(); }
      if (n > 80) clearInterval(t);
    }, 100);
  });
})();
