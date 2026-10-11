/**
 * Divine Rays — Ticket card render v2
 * Force enhanced card layout; survives filters re-renders.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_CARD_RENDER >= 2) return;
  window.__DR_TICKET_CARD_RENDER = 2;
  window.__DR_TICKET_CARD_RENDER_V1 = 1;

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

  function priLabel(p) {
    if (typeof window.__drPriorityLabel === 'function') {
      try {
        var x = window.__drPriorityLabel(p);
        if (x) return x;
      } catch (e) {}
    }
    var n = String(p || '').trim().toLowerCase();
    var map = {
      critical: 'P1', high: 'P2', medium: 'P3', low: 'P4',
      p1: 'P1', p2: 'P2', p3: 'P3', p4: 'P4'
    };
    return map[n] || p || '';
  }

  function getNames() {
    try {
      if (window.DR && typeof DR.getNameCache === 'function') return DR.getNameCache() || {};
    } catch (e) {}
    return window.nameCache || {};
  }

  function getTickets() {
    try {
      if (window.DR && typeof DR.getAllTickets === 'function') {
        var t = DR.getAllTickets();
        if (Array.isArray(t) && t.length) return t;
      }
    } catch (e) {}
    if (Array.isArray(window.allTicketsCache) && window.allTicketsCache.length) return window.allTicketsCache;
    if (window.DR && Array.isArray(window.DR.tickets)) return window.DR.tickets;
    return [];
  }

  function getRequesterMeta(t, names) {
    names = names || {};
    var id = t.requester_id;
    var name = names[id] || t.requester_name || t.requester_email || 'End-User';
    var role = t.requester_role || t.role || '';
    var branch = t.requester_branch || t.branch || '';
    try {
      if (window.DRBranchUI && typeof window.DRBranchUI.getInfo === 'function') {
        var info = window.DRBranchUI.getInfo(id) || window.DRBranchUI.getInfo(name);
        if (info) {
          if (info.branch) branch = info.branch;
          if (info.position) role = info.position;
          if (info.name) name = info.name;
        }
      }
    } catch (e) {}
    try {
      var map = window.__drProfileMeta || {};
      var m = map[id] || map[String(id)];
      if (m) {
        if (m.full_name || m.name) name = m.full_name || m.name;
        if (m.position || m.role) role = m.position || m.role;
        if (m.branch) branch = m.branch;
      }
    } catch (e2) {}
    return { name: name, role: role || '—', branch: branch || '—' };
  }

  function cardHtml(t, names) {
    names = names || getNames();
    var meta = getRequesterMeta(t, names);
    var req = meta.name;
    var initials = (function (n) {
      n = String(n || '').trim();
      var p = n.split(/\s+/).filter(Boolean);
      if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
      return (n.slice(0, 2) || '?').toUpperCase();
    })(req);
    var pl = priLabel(t.priority);
    var cat = t.category || '—';
    var when = fmt(t.created_at || t.updated_at);
    return (
      '<div class="ticket-card dr-card-v2" data-id="' + esc(t.id) + '">' +
      '<div class="ticket-av" aria-hidden="true">' + esc(initials) + '</div>' +
      '<div class="ticket-body">' +
      '<h3 class="ticket-title">' + esc(t.title || 'Untitled') + '</h3>' +
      '<div class="ticket-specs">' +
      '<div class="spec"><span class="spec-k">Code</span><span class="spec-v spec-code">' + esc(t.ticket_number || '—') + '</span></div>' +
      '<div class="spec"><span class="spec-k">Category</span><span class="spec-v spec-cat">' + esc(cat) + '</span></div>' +
      '<div class="spec"><span class="spec-k">Requester</span><span class="spec-v spec-name">' + esc(req) + '</span></div>' +
      '<div class="spec"><span class="spec-k">Role</span><span class="spec-v spec-role">' + esc(meta.role) + '</span></div>' +
      '<div class="spec"><span class="spec-k">Branch</span><span class="spec-v spec-branch">' + esc(meta.branch) + '</span></div>' +
      '<div class="spec"><span class="spec-k">Submitted</span><span class="spec-v spec-date">' + esc(when) + '</span></div>' +
      '</div></div>' +
      '<div class="badges">' +
      '<span class="badge ' + sc(pl || t.priority) + '">' + esc(pl) + '</span>' +
      '<span class="badge ' + sc(t.status) + '">' + esc(t.status) + '</span>' +
      '</div></div>'
    );
  }

  var _rewriting = false;

  function bindClicks(list) {
    list.querySelectorAll('.ticket-card').forEach(function (card) {
      if (card.__drClick) return;
      card.__drClick = 1;
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        if (window.DR && typeof DR.openTicket === 'function') DR.openTicket(id);
        else if (typeof window.openTicket === 'function') window.openTicket(id);
      });
    });
  }

  function forceRewrite() {
    var list = document.getElementById('ticket-list');
    if (!list) return;
    if (list.offsetParent === null && list.style.display === 'none') return;

    var cards = list.querySelectorAll('.ticket-card');
    if (!cards.length) return;

    if (list.querySelector('.ticket-specs') && list.querySelectorAll('.dr-card-v2').length === cards.length) {
      bindClicks(list);
      return;
    }

    var tickets = getTickets();
    if (!tickets.length) return;

    var byId = {};
    tickets.forEach(function (t) {
      if (t && t.id != null) byId[String(t.id)] = t;
    });

    var names = getNames();
    var html = [];
    var mapped = 0;
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      var t = byId[String(id)];
      if (t) {
        html.push(cardHtml(t, names));
        mapped++;
      } else {
        html.push(card.outerHTML);
      }
    });
    if (!mapped) return;

    _rewriting = true;
    list.innerHTML = html.join('');
    _rewriting = false;
    bindClicks(list);
  }

  function patchApply() {
    if (typeof window.applyTicketFilters !== 'function') return;
    if (window.applyTicketFilters.__drCardV2) return;
    var prev = window.applyTicketFilters;
    window.applyTicketFilters = function () {
      var r = prev.apply(this, arguments);
      requestAnimationFrame(function () {
        forceRewrite();
        setTimeout(forceRewrite, 30);
        setTimeout(forceRewrite, 120);
      });
      return r;
    };
    window.applyTicketFilters.__drCardV2 = 1;
    window.applyTicketFilters.__drCardV1 = 1;
  }

  function boot() {
    patchApply();
    forceRewrite();
  }

  boot();
  [200, 600, 1200, 2000, 3500, 5000].forEach(function (ms) {
    setTimeout(boot, ms);
  });
  setInterval(function () {
    patchApply();
    forceRewrite();
  }, 2500);

  try {
    new MutationObserver(function () {
      if (_rewriting) return;
      var list = document.getElementById('ticket-list');
      if (!list) return;
      if (!list.querySelector('.ticket-specs') && list.querySelector('.ticket-card')) {
        forceRewrite();
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  document.addEventListener(
    'click',
    function (e) {
      if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
        setTimeout(boot, 100);
        setTimeout(boot, 400);
        setTimeout(boot, 900);
      }
    },
    true
  );

  window.DRTicketCardRender = { refresh: boot, force: forceRewrite, cardHtml: cardHtml, v: 2 };
})();
