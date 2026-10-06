/**
 * Divine Rays — end-user: click notification → open that ticket
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUSTOMER_NOTIF_OPEN_V1) return;
  window.__DR_CUSTOMER_NOTIF_OPEN_V1 = 1;

  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return window.supabaseClient || null;
  }

  function profile() {
    try {
      if (window.DR && window.DR.getProfile) return window.DR.getProfile();
    } catch (e) {}
    return window.currentProfile || null;
  }

  function extractTicketNumber(n, row) {
    if (!n && !row) return '';
    var candidates = [];
    if (n) {
      if (n.ticket_number) candidates.push(n.ticket_number);
      if (n.meta) {
        if (n.meta.ticket_number) candidates.push(n.meta.ticket_number);
        if (n.meta.ticket_id && /^DR-\d+/i.test(String(n.meta.ticket_id))) candidates.push(n.meta.ticket_id);
      }
      if (n.title) candidates.push(n.title);
      if (n.body) candidates.push(n.body);
      if (n.message) candidates.push(n.message);
    }
    if (row) {
      var dt = row.getAttribute('data-ticket');
      if (dt) candidates.push(dt);
      candidates.push(row.textContent || '');
    }
    for (var i = 0; i < candidates.length; i++) {
      var m = String(candidates[i]).match(/\b(DR-\d+)\b/i);
      if (m) return m[1].toUpperCase();
    }
    return '';
  }

  function switchCustomerTab(name) {
    var tab = document.querySelector(
      '#portal-customer .ctab[data-ctab="' + name + '"], .customer-tabs .ctab[data-ctab="' + name + '"]'
    );
    if (tab) {
      try { tab.click(); } catch (e) {}
    }
    document.querySelectorAll('#portal-customer .ctab-panel, #portal-customer [id^="ctab-"]').forEach(function (p) {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    document.querySelectorAll('#portal-customer .ctab').forEach(function (t) {
      t.classList.remove('active');
    });
    if (tab) tab.classList.add('active');
    var panel = document.getElementById('ctab-' + name);
    if (panel) {
      panel.classList.add('active');
      panel.style.display = 'block';
    }
  }

  function closeNotifPanel() {
    var panel = document.getElementById('dr-notif-panel');
    var bd = document.getElementById('dr-notif-panel-bd');
    if (panel) panel.classList.remove('open');
    if (bd) bd.classList.remove('open');
  }

  async function markRead(id) {
    if (!id) return;
    var client = sb();
    if (!client) return;
    try {
      await client.from('notifications').update({ read: true }).eq('id', id);
    } catch (e) {}
  }

  async function resolveTicketId(ticketNumber) {
    var client = sb();
    if (!client || !ticketNumber) return null;
    try {
      var r = await client.from('tickets').select('id,ticket_number,status,title').eq('ticket_number', ticketNumber).maybeSingle();
      if (r.data && r.data.id) return r.data;
      r = await client.from('tickets').select('id,ticket_number,status,title').ilike('ticket_number', ticketNumber).maybeSingle();
      if (r.data && r.data.id) return r.data;
    } catch (e) {}
    return null;
  }

  async function openTicketByNumber(ticketNumber) {
    if (!ticketNumber) return false;

    if (typeof window.openCustomerTicketByNumber === 'function') {
      try {
        await window.openCustomerTicketByNumber(ticketNumber);
        return true;
      } catch (e) {}
    }

    var ticket = await resolveTicketId(ticketNumber);
    if (ticket && typeof window.openCustomerTicket === 'function') {
      try {
        await window.openCustomerTicket(ticket.id);
        return true;
      } catch (e) {}
    }

    try {
      if (window.DR && window.DR.openCustomerTicket && ticket) {
        await window.DR.openCustomerTicket(ticket.id);
        return true;
      }
    } catch (e) {}

    switchCustomerTab('track');
    var input = document.getElementById('track-id');
    var btn = document.getElementById('btn-track');
    if (input) {
      input.value = ticketNumber;
      try { input.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    }
    if (btn) {
      setTimeout(function () {
        try { btn.click(); } catch (e) {}
      }, 80);
      return true;
    }

    switchCustomerTab('mytickets');
    setTimeout(function () {
      var cards = document.querySelectorAll('#my-tickets-list .ticket-card, #portal-customer .ticket-card');
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var txt = (c.textContent || '') + ' ' + (c.getAttribute('data-id') || '');
        if (txt.toUpperCase().indexOf(ticketNumber) !== -1) {
          try { c.click(); } catch (e) {}
          return;
        }
      }
    }, 300);

    return !!ticket;
  }

  async function handleRowClick(row) {
    if (!row || !row.classList.contains('row')) return;
    var id = row.getAttribute('data-id');
    var num = extractTicketNumber(null, row);
    var cached = window.__drNotifById && id ? window.__drNotifById[id] : null;
    if (cached) num = extractTicketNumber(cached, row) || num;

    if (!num) {
      await markRead(id);
      row.classList.remove('unread');
      return;
    }

    row.setAttribute('data-ticket', num);
    await markRead(id);
    row.classList.remove('unread');
    closeNotifPanel();
    await openTicketByNumber(num);
  }

  async function enhanceRows() {
    var body = document.getElementById('dr-notif-body');
    if (!body) return;
    var client = sb();
    var p = profile();
    if (client && p && p.id && !window.__drNotifById) {
      try {
        var r = await client.from('notifications').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(50);
        window.__drNotifById = {};
        (r.data || []).forEach(function (n) {
          window.__drNotifById[n.id] = n;
        });
      } catch (e) {
        window.__drNotifById = window.__drNotifById || {};
      }
    }

    body.querySelectorAll('.row').forEach(function (row) {
      var id = row.getAttribute('data-id');
      var n = id && window.__drNotifById ? window.__drNotifById[id] : null;
      var num = extractTicketNumber(n, row);
      if (num) row.setAttribute('data-ticket', num);
      row.style.cursor = 'pointer';
      if (!row.getAttribute('title') && num) row.setAttribute('title', 'Open ' + num);
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.del-btn') || t.closest('#dr-notif-clear-all') || t.closest('#dr-notif-mark-all') || t.closest('#dr-notif-close')) return;
    var row = t.closest('#dr-notif-panel .row, #dr-notif-body .row');
    if (!row) return;
    e.preventDefault();
    e.stopPropagation();
    handleRowClick(row);
  }, true);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#dr-notif-fab')) {
      setTimeout(enhanceRows, 200);
      setTimeout(enhanceRows, 600);
      setTimeout(enhanceRows, 1200);
    }
  }, true);

  try {
    new MutationObserver(function () {
      clearTimeout(window.__drCnoT);
      window.__drCnoT = setTimeout(enhanceRows, 100);
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  setTimeout(enhanceRows, 1500);
  window.DRCustomerNotifOpen = { open: openTicketByNumber, refresh: enhanceRows, v: 1 };
})();
