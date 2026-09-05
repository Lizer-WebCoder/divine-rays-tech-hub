/**
 * Divine Rays — agent delete ticket + notify requester
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }

  function toast(m, t) {
    if (dr().toast) return dr().toast(m, t);
    console.log(m);
  }

  function sb() {
    return (dr().sb && dr().sb()) || null;
  }

  async function resolveCurrentTicket() {
    var client = sb();
    var tickets = (dr().getAllTickets && dr().getAllTickets()) || [];

    try {
      var cached = sessionStorage.getItem('dr_last_ticket');
      if (cached) {
        var t = JSON.parse(cached);
        if (t && t.id) return t;
      }
    } catch (e) {}

    var pt = document.getElementById('page-title');
    var num = pt && pt.textContent ? pt.textContent.trim() : '';
    if (num && num.indexOf('DR-') === 0) {
      var fromCache = tickets.find(function (x) { return x.ticket_number === num; });
      if (fromCache) return fromCache;
      if (client) {
        var r = await client.from('tickets').select('*').eq('ticket_number', num).maybeSingle();
        if (r.data) return r.data;
      }
    }

    var detail = document.getElementById('ticket-detail');
    if (detail) {
      var idEl = detail.querySelector('.ticket-id');
      if (idEl) {
        var n = (idEl.textContent || '').trim();
        var hit = tickets.find(function (x) { return x.ticket_number === n || x.id === n; });
        if (hit) return hit;
        if (client && n) {
          var r2 = await client.from('tickets').select('*').eq('ticket_number', n).maybeSingle();
          if (r2.data) return r2.data;
        }
      }
    }
    return null;
  }

  function isAgentRole() {
    var p = dr().getProfile && dr().getProfile();
    return p && (p.role === 'agent' || p.role === 'admin');
  }

  function confirmDelete(ticketNumber) {
    return window.confirm(
      'Delete ticket ' + (ticketNumber || '') + '?\n\n' +
      'This cannot be undone. The customer will be notified in their portal.'
    );
  }

  async function notifyRequester(ticket) {
    var client = sb();
    if (!client || !ticket || !ticket.requester_id) return { ok: false, reason: 'no requester' };

    var num = ticket.ticket_number || ticket.id;
    var title = ticket.title || 'Support request';
    var msg =
      'Your ticket ' + num + ' ("' + title + '") was deleted by Tech Support. ' +
      'If you still need help, please submit a new ticket.';

    try {
      var ins = await client.from('notifications').insert({
        user_id: ticket.requester_id,
        type: 'ticket_deleted',
        title: 'Ticket deleted',
        body: msg,
        ticket_number: num,
        meta: { ticket_id: ticket.id, ticket_number: num, title: title },
        read: false
      });
      if (!ins.error) return { ok: true, channel: 'notifications' };
    } catch (e) {}

    try {
      var ins2 = await client.from('notifications').insert({
        user_id: ticket.requester_id,
        body: msg,
        read: false
      });
      if (!ins2.error) return { ok: true, channel: 'notifications-min' };
    } catch (e2) {}

    return { ok: false, reason: 'notifications table missing or blocked by RLS' };
  }

  async function deleteTicket(ticket) {
    var client = sb();
    if (!client || !ticket || !ticket.id) return { error: 'Missing ticket' };

    var note = await notifyRequester(ticket);

    try {
      await client.from('comments').delete().eq('ticket_id', ticket.id);
    } catch (e) {}

    var r = await client.from('tickets').delete().eq('id', ticket.id);
    if (r.error) return { error: r.error.message, notified: note.ok };

    return { ok: true, notified: note.ok, noteReason: note.reason };
  }

  function injectDeleteButton() {
    if (!isAgentRole()) return;
    var actions = document.querySelector('#portal-agent .agent-actions');
    if (!actions || document.getElementById('btn-delete-ticket')) return;

    var wrap = document.createElement('div');
    wrap.className = 'form-group action-btns delete-ticket-wrap';
    wrap.style.marginTop = '0.75rem';
    wrap.innerHTML =
      '<button type="button" class="btn btn-danger" id="btn-delete-ticket" title="Permanently delete this ticket">' +
      'Delete ticket</button>' +
      '<span class="delete-hint">Customer is notified in their portal</span>';

    actions.appendChild(wrap);

    document.getElementById('btn-delete-ticket').addEventListener('click', async function () {
      var ticket = await resolveCurrentTicket();
      if (!ticket || !ticket.id) {
        toast('Open a ticket first, then delete', 'error');
        return;
      }

      if (!confirmDelete(ticket.ticket_number || ticket.id)) return;

      var btn = document.getElementById('btn-delete-ticket');
      if (btn) { btn.disabled = true; btn.textContent = 'Deleting…'; }

      var result = await deleteTicket(ticket);
      if (result.error) {
        toast(result.error, 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Delete ticket'; }
        return;
      }

      if (result.notified) {
        toast('Ticket deleted · customer notified', 'success');
      } else {
        toast('Ticket deleted (run notifications SQL to enable customer alerts)', 'success');
      }

      if (dr().setAllTickets) {
        var left = (dr().getAllTickets() || []).filter(function (t) { return t.id !== ticket.id; });
        dr().setAllTickets(left);
      }
      if (window.applyTicketFilters) window.applyTicketFilters(true);
      if (dr().renderStats) dr().renderStats();

      var back = document.getElementById('btn-back');
      if (back) back.click();
      else {
        var dash = document.querySelector('#portal-agent .nav-btn[data-view="dashboard"]');
        if (dash) dash.click();
      }

      if (btn) { btn.disabled = false; btn.textContent = 'Delete ticket'; }
    });
  }

  function patchOpenTicketCache() {
    if (!dr().openTicket || dr().openTicket.__delPatched) return;
    var prev = dr().openTicket;
    var wrapped = function (id) {
      var p = prev.apply(this, arguments);
      Promise.resolve(p).then(function () {
        var tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
        var t = tickets.find(function (x) { return x.id === id; });
        if (t) {
          try { sessionStorage.setItem('dr_last_ticket', JSON.stringify(t)); } catch (e) {}
        }
        injectDeleteButton();
      });
      return p;
    };
    wrapped.__delPatched = true;
    window.DR.openTicket = wrapped;
  }

  async function loadCustomerNotifications() {
    var client = sb();
    var p = dr().getProfile && dr().getProfile();
    if (!client || !p || p.role !== 'customer') return;

    var host = document.querySelector('#portal-customer .customer-main');
    if (!host || document.getElementById('cust-notifications')) return;

    var box = document.createElement('div');
    box.id = 'cust-notifications';
    box.className = 'cust-notifications';
    box.style.display = 'none';
    host.insertBefore(box, host.firstChild);

    try {
      var r = await client
        .from('notifications')
        .select('*')
        .eq('user_id', p.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (r.error || !r.data || !r.data.length) return;

      box.style.display = 'block';
      box.innerHTML =
        '<div class="notif-banner">' +
        '<strong>Notifications</strong>' +
        r.data.map(function (n) {
          return '<div class="notif-item" data-id="' + n.id + '">' +
            '<p>' + escapeHtml(n.body || n.title || 'Update') + '</p>' +
            '<button type="button" class="btn btn-ghost btn-sm notif-dismiss">Dismiss</button>' +
            '</div>';
        }).join('') +
        '</div>';

      box.querySelectorAll('.notif-dismiss').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var item = btn.closest('.notif-item');
          var id = item && item.getAttribute('data-id');
          if (id) {
            try { await client.from('notifications').update({ read: true }).eq('id', id); } catch (e) {}
          }
          if (item) item.remove();
          if (!box.querySelector('.notif-item')) box.style.display = 'none';
        });
      });
    } catch (e) {}
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function boot() {
    patchOpenTicketCache();
    var obs = new MutationObserver(function () {
      if (document.getElementById('view-detail') && document.getElementById('view-detail').classList.contains('active')) {
        injectDeleteButton();
      }
      loadCustomerNotifications();
    });
    var shell = document.getElementById('app-shell') || document.body;
    obs.observe(shell, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    setTimeout(function () {
      injectDeleteButton();
      loadCustomerNotifications();
      patchOpenTicketCache();
    }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 400);
})();
