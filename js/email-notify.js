/**
 * Divine Rays — email notifications (Supabase Edge Function + Resend)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }
  function sb() { return dr().sb && dr().sb(); }

  var enabled = true;
  var lastSent = {};

  function dedupe(key, ms) {
    ms = ms || 8000;
    var now = Date.now();
    if (lastSent[key] && now - lastSent[key] < ms) return true;
    lastSent[key] = now;
    return false;
  }

  async function sendEmail(payload) {
    if (!enabled) return { skipped: true };
    var client = sb();
    if (!client || !client.functions) return { skipped: true, reason: 'no client' };

    var key = [payload.type, payload.ticket_id || '', payload.to_user_id || payload.to_email || ''].join('|');
    if (dedupe(key)) return { skipped: true, reason: 'deduped' };

    try {
      // Try preferred name, then fallbacks if Supabase auto-named the function
      var names = ['send-ticket-email', 'clever-handler', 'clever-responder'];
      var lastErr = null;
      for (var i = 0; i < names.length; i++) {
        try {
          var res = await client.functions.invoke(names[i], { body: payload });
          if (!res.error) {
            if (names[i] !== 'send-ticket-email') {
              console.info('[email] using function:', names[i]);
            }
            return res.data || { ok: true };
          }
          lastErr = res.error;
          var msg = String((res.error && (res.error.message || res.error)) || '');
          if (msg.indexOf('NOT_FOUND') === -1 && msg.indexOf('not found') === -1 && msg.indexOf('404') === -1) {
            console.warn('[email]', names[i], res.error);
            return { error: res.error };
          }
        } catch (e1) {
          lastErr = e1;
        }
      }
      console.warn('[email]', lastErr);
      return { error: lastErr };
    } catch (e) {
      console.warn('[email]', e);
      return { error: String(e) };
    }
  }

  async function emailUser(userId, type, ticket, extraMessage) {
    if (!userId) return;
    var t = ticket || {};
    return sendEmail({
      type: type,
      to_user_id: userId,
      ticket_id: t.id,
      ticket_number: t.ticket_number || t.number,
      title: t.title,
      message: extraMessage || undefined
    });
  }

  async function emailAgentsNewTicket(ticket) {
    var client = sb();
    if (!client || !ticket) return;
    try {
      var r = await client.from('profiles').select('id, email, role').in('role', ['agent', 'admin']);
      var rows = r.data || [];
      for (var i = 0; i < rows.length; i++) {
        var p = rows[i];
        if (!p.email) continue;
        await sendEmail({
          type: 'ticket_created',
          to_email: p.email,
          to_user_id: p.id,
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          title: ticket.title,
          message:
            'New ticket ' + (ticket.ticket_number || '') +
            (ticket.title ? ' — ' + ticket.title : '') +
            ' was submitted. Open Tech Hub to claim or respond.'
        });
      }
    } catch (e) {
      console.warn('[email] agents', e);
    }
  }

  window.DR_EMAIL = {
    send: sendEmail,
    notifyCreated: function (ticket) { return emailAgentsNewTicket(ticket); },
    notifyClaimed: function (ticket) {
      if (ticket && ticket.requester_id) {
        return emailUser(
          ticket.requester_id,
          'ticket_claimed',
          ticket,
          'Your ticket ' + (ticket.ticket_number || '') +
            ' has been claimed by a support agent and is now being worked on.'
        );
      }
    },
    notifyStatus: function (ticket, newStatus) {
      if (ticket && ticket.requester_id) {
        return emailUser(
          ticket.requester_id,
          'status_changed',
          ticket,
          'Ticket ' + (ticket.ticket_number || '') + ' is now "' +
            (newStatus || ticket.status || 'updated') +
            '". Sign in to Tech Hub for details.'
        );
      }
    },
    notifyComment: function (ticket, comment, authorRole) {
      if (!ticket) return;
      if (authorRole === 'agent' || authorRole === 'admin') {
        if (ticket.requester_id) {
          return emailUser(
            ticket.requester_id,
            'new_comment',
            ticket,
            'Support replied on ticket ' + (ticket.ticket_number || '') +
              '. Open Tech Hub to read the message.'
          );
        }
      } else {
        var aid = ticket.assignee_id || ticket.assigned_to;
        if (aid) {
          return emailUser(
            aid,
            'new_comment',
            ticket,
            'The customer replied on ticket ' + (ticket.ticket_number || '') +
              '. Open Tech Hub to respond.'
          );
        }
      }
    },
    notifyDeleted: function (ticket) {
      if (ticket && ticket.requester_id) {
        return emailUser(
          ticket.requester_id,
          'ticket_deleted',
          ticket,
          'Ticket ' + (ticket.ticket_number || '') +
            ' was deleted by support. If you still need help, please submit a new ticket.'
        );
      }
    },
    setEnabled: function (v) { enabled = !!v; }
  };

  document.addEventListener('dr:ticket-created', function (e) {
    if (e.detail) window.DR_EMAIL.notifyCreated(e.detail);
  });
  document.addEventListener('dr:ticket-claimed', function (e) {
    if (e.detail) window.DR_EMAIL.notifyClaimed(e.detail);
  });
  document.addEventListener('dr:ticket-status', function (e) {
    if (e.detail) window.DR_EMAIL.notifyStatus(e.detail.ticket, e.detail.status);
  });
  document.addEventListener('dr:ticket-comment', function (e) {
    if (e.detail) window.DR_EMAIL.notifyComment(e.detail.ticket, e.detail.comment, e.detail.role);
  });
  document.addEventListener('dr:ticket-deleted', function (e) {
    if (e.detail) window.DR_EMAIL.notifyDeleted(e.detail);
  });

  function tryPatch() {
    var D = window.DR;
    if (!D) return;

    if (typeof D.claimTicket === 'function' && !D.claimTicket.__emailPatched) {
      var claim = D.claimTicket;
      D.claimTicket = async function () {
        var result = await claim.apply(this, arguments);
        try {
          var t = arguments[0] && arguments[0].id ? arguments[0] : (D.getCurrentTicket && D.getCurrentTicket());
          if (t) window.DR_EMAIL.notifyClaimed(t);
        } catch (e) {}
        return result;
      };
      D.claimTicket.__emailPatched = true;
    }

    if (typeof D.updateTicketStatus === 'function' && !D.updateTicketStatus.__emailPatched) {
      var upd = D.updateTicketStatus;
      D.updateTicketStatus = async function (id, status) {
        var result = await upd.apply(this, arguments);
        try {
          var t = { id: id, status: status };
          if (D.getCurrentTicket) {
            var cur = D.getCurrentTicket();
            if (cur) t = Object.assign({}, cur, { status: status });
          }
          window.DR_EMAIL.notifyStatus(t, status);
        } catch (e) {}
        return result;
      };
      D.updateTicketStatus.__emailPatched = true;
    }
  }

  var n = 0;
  var timer = setInterval(function () {
    n++;
    tryPatch();
    if (n > 40) clearInterval(timer);
  }, 500);

  setTimeout(function () {
    if (window.DR_DELETE && window.DR_DELETE.deleteTicket && !window.DR_DELETE.deleteTicket.__email) {
      var del = window.DR_DELETE.deleteTicket;
      window.DR_DELETE.deleteTicket = async function (ticket) {
        var r = await del.apply(this, arguments);
        if (r && !r.error) {
          try { await window.DR_EMAIL.notifyDeleted(ticket); } catch (e) {}
        }
        return r;
      };
      window.DR_DELETE.deleteTicket.__email = true;
    }
  }, 2000);

  function startRealtimeEmail() {
    var client = sb();
    if (!client || window.__drEmailRealtime) return;
    try {
      window.__drEmailRealtime = client
        .channel('email-tickets')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'tickets' },
          function (payload) {
            if (payload.new) window.DR_EMAIL.notifyCreated(payload.new);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'tickets' },
          function (payload) {
            var o = payload.old || {};
            var n = payload.new || {};
            if (n.assigned_to && n.assigned_to !== o.assigned_to) {
              window.DR_EMAIL.notifyClaimed(n);
            }
            if (n.status && n.status !== o.status) {
              window.DR_EMAIL.notifyStatus(n, n.status);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'comments' },
          async function (payload) {
            var c = payload.new;
            if (!c) return;
            try {
              var tr = await client.from('tickets').select('*').eq('id', c.ticket_id).maybeSingle();
              var ticket = tr.data;
              if (!ticket) return;
              var pr = await client.from('profiles').select('role').eq('id', c.author_id || c.user_id).maybeSingle();
              var role = (pr.data && pr.data.role) || 'customer';
              window.DR_EMAIL.notifyComment(ticket, c, role);
            } catch (e) {}
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('[email] realtime', e);
    }
  }

  setTimeout(startRealtimeEmail, 2500);
  setTimeout(startRealtimeEmail, 6000);
})();
