/**
 * Divine Rays — Ticket card render v1 (enhanced layout)
 * Overrides filters cardHtml with header title + labeled specs.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_CARD_RENDER >= 1) return;
  window.__DR_TICKET_CARD_RENDER = 1;

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
    var map = { critical: 'P1', high: 'P2', medium: 'P3', low: 'P4', p1: 'P1', p2: 'P2', p3: 'P3', p4: 'P4' };
    return map[n] || p || '';
  }

  function getNames() {
    try {
      if (window.DR && typeof DR.getNameCache === 'function') return DR.getNameCache() || {};
    } catch (e) {}
    return window.nameCache || {};
  }

  function getRequesterMeta(t, names) {
    names = names || {};
    var id = t.requester_id;
    var name = names[id] || t.requester_name || t.requester_email || 'End-User';
    var role = t.requester_role || t.role || '';
    var branch = t.requester_branch || t.branch || '';
    try {
      if (window.DRBranchUI) {
        var info =
          (typeof window.DRBranchUI.getInfo === 'function' &&
            (window.DRBranchUI.getInfo(id) || window.DRBranchUI.getInfo(name))) ||
          null;
        if (info) {
          if (info.branch) branch = info.branch;
          if (info.position) role = info.position;
          if (info.name) name = info.name;
        }
      }
    } catch (e) {}
    try {
      var map = window.__drProfileMeta || {};
      var m = map[id] || map[String(id)] || null;
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
      '<div class="ticket-card" data-id="' +
      esc(t.id) +
      '">' +
      '<div class="ticket-av" aria-hidden="true">' +
      esc(initials) +
      '</div>' +
      '<div class="ticket-body">' +
      '<h3 class="ticket-title">' +
      esc(t.title || 'Untitled') +
      '</h3>' +
      '<div class="ticket-specs">' +
      '<div class="spec"><span class="spec-k">Code</span><span class="spec-v spec-code">' +
      esc(t.ticket_number || '—') +
      '</span></div>' +
      '<div class="spec"><span class="spec-k">Category</span><span class="spec-v spec-cat">' +
      esc(cat) +
      '</span></div>' +
      '<div class="spec"><span class="spec-k">Requester</span><span class="spec-v spec-name">' +
      esc(req) +
      '</span></div>' +
      '<div class="spec"><span class="spec-k">Role</span><span class="spec-v spec-role">' +
      esc(meta.role) +
      '</span></div>' +
      '<div class="spec"><span class="spec-k">Branch</span><span class="spec-v spec-branch">' +
      esc(meta.branch) +
      '</span></div>' +
      '<div class="spec"><span class="spec-k">Submitted</span><span class="spec-v spec-date">' +
      esc(when) +
      '</span></div>' +
      '</div></div>' +
      '<div class="badges">' +
      '<span class="badge ' +
      sc(pl || t.priority) +
      '">' +
      esc(pl) +
      '</span>' +
      '<span class="badge ' +
      sc(t.status) +
      '">' +
      esc(t.status) +
      '</span>' +
      '</div></div>'
    );
  }

  function patchApply() {
    if (typeof window.applyTicketFilters !== 'function') return false;
    if (window.applyTicketFilters.__drCardV1) return true;
    var prev = window.applyTicketFilters;
    window.applyTicketFilters = function () {
      var result = prev.apply(this, arguments);
      try { enhanceRenderedCards(); } catch (e) {}
      return result;
    };
    window.applyTicketFilters.__drCardV1 = 1;
    return true;
  }

  function enhanceRenderedCards() {
    var list = document.getElementById('ticket-list');
    if (!list) return;
    var cards = list.querySelectorAll('.ticket-card');
    if (!cards.length) return;
    if (list.querySelector('.ticket-specs')) return;

    var names = getNames();
    var tickets = [];
    try {
      if (window.DR && typeof DR.getAllTickets === 'function') tickets = DR.getAllTickets() || [];
      else tickets = window.allTicketsCache || [];
    } catch (e) {
      tickets = window.allTicketsCache || [];
    }
    var byId = {};
    (tickets || []).forEach(function (t) {
      if (t && t.id != null) byId[String(t.id)] = t;
    });

    var html = [];
    var ok = true;
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      var t = byId[String(id)];
      if (!t) {
        ok = false;
        return;
      }
      html.push(cardHtml(t, names));
    });
    if (!ok || !html.length) return;
    list.innerHTML = html.join('');
    list.querySelectorAll('.ticket-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        if (window.DR && typeof DR.openTicket === 'function') DR.openTicket(id);
        else if (typeof window.openTicket === 'function') window.openTicket(id);
      });
    });
  }

  function boot() {
    patchApply();
    enhanceRenderedCards();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);
  setInterval(function () { patchApply(); }, 5000);

  document.addEventListener(
    'click',
    function (e) {
      if (e.target && e.target.closest && e.target.closest('#portal-agent .nav-btn')) {
        setTimeout(boot, 150);
        setTimeout(boot, 500);
      }
    },
    true
  );

  window.DRTicketCardRender = { refresh: boot, cardHtml: cardHtml, v: 1 };
})();
