/**
 * Divine Rays — status save fix (loads after ticket-plus)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }
  function sb() { return (dr().sb && dr().sb()) || null; }
  function toast(m, t) { if (dr().toast) dr().toast(m, t); else console.log(m); }

  async function forceSaveStatus() {
    var client = sb();
    if (!client) return toast('Not connected', 'error');

    var statusEl = document.getElementById('quick-status');
    var assignEl = document.getElementById('assign-agent');
    var newStatus = statusEl ? String(statusEl.value || '').trim() : '';
    var newAssignee = assignEl ? (assignEl.value || null) : null;

    var idEl = document.querySelector('#ticket-detail .ticket-id');
    var num = idEl ? idEl.textContent.trim() : '';
    if (!num) return toast('Open a ticket first', 'error');

    var tr = await client.from('tickets').select('*').eq('ticket_number', num).maybeSingle();
    if (!tr.data) return toast('Ticket not found', 'error');
    var ticket = tr.data;

    if (newStatus) {
      var rs = await client.from('tickets').update({ status: newStatus }).eq('id', ticket.id).select('id, status').maybeSingle();
      if (rs.error) {
        toast(rs.error.message || 'Status save failed', 'error');
        console.warn(rs.error);
        return;
      }
    }

    if (newAssignee !== null && newAssignee !== undefined) {
      var ra = await client.from('tickets').update({ assigned_to: newAssignee }).eq('id', ticket.id);
      if (ra.error) {
        await client.from('tickets').update({ assignee_id: newAssignee }).eq('id', ticket.id);
      }
    }

    var fresh = await client.from('tickets').select('status, assigned_to, assignee_id').eq('id', ticket.id).maybeSingle();
    var st = (fresh.data && fresh.data.status) || newStatus;
    if (statusEl) statusEl.value = st;

    document.querySelectorAll('#ticket-detail .badge, #ticket-detail span').forEach(function (el) {
      var t = (el.textContent || '').trim();
      if (/^(OPEN|IN PROGRESS|WAITING|RESOLVED|CLOSED|In Progress|Open|Waiting|Resolved|Closed)$/i.test(t)) {
        el.textContent = st;
      }
    });

    toast('Saved: ' + st, 'success');
  }

  function bind() {
    var save = document.getElementById('btn-save-meta');
    if (!save || save._fixBound) return;
    save._fixBound = true;
    save.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        forceSaveStatus();
      },
      true
    );
  }

  function boot() {
    bind();
    setInterval(bind, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 400);
})();
