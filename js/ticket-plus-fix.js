/**
 * Divine Rays — force status save (Resolved must stick)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }
  function sb() {
    try {
      if (dr().sb) return dr().sb();
    } catch (e) {}
    return null;
  }
  function toast(m, t) {
    if (dr().toast) dr().toast(m, t);
    else console.log('[status-fix]', m);
  }

  var saving = false;

  async function forceSave() {
    if (saving) return;
    saving = true;
    try {
      var client = sb();
      if (!client) {
        toast('Not connected — wait a second and try again', 'error');
        return;
      }

      var statusEl = document.getElementById('quick-status');
      var assignEl = document.getElementById('assign-agent');
      var newStatus = statusEl ? String(statusEl.value || '').trim() : '';
      if (!newStatus) {
        toast('Pick a status first', 'error');
        return;
      }

      var idEl = document.querySelector('#ticket-detail .ticket-id');
      var num = idEl ? idEl.textContent.trim() : '';
      if (!num) {
        toast('Open a ticket first', 'error');
        return;
      }

      var tr = await client.from('tickets').select('id, status, ticket_number').eq('ticket_number', num).maybeSingle();
      if (tr.error) {
        toast(tr.error.message || 'Could not load ticket', 'error');
        console.warn(tr.error);
        return;
      }
      if (!tr.data) {
        toast('Ticket not found: ' + num, 'error');
        return;
      }

      var tid = tr.data.id;

      var rs = await client
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', tid)
        .select('id, status')
        .maybeSingle();

      if (rs.error) {
        console.warn('[status-fix]', rs.error);
        toast('Status blocked: ' + (rs.error.message || 'RLS/policy error'), 'error');
        return;
      }

      var savedStatus = (rs.data && rs.data.status) || newStatus;

      if (assignEl && assignEl.value) {
        var ra = await client.from('tickets').update({ assigned_to: assignEl.value }).eq('id', tid);
        if (ra.error) {
          await client.from('tickets').update({ assignee_id: assignEl.value }).eq('id', tid);
        }
      }

      var fresh = await client.from('tickets').select('status').eq('id', tid).maybeSingle();
      var finalStatus = (fresh.data && fresh.data.status) || savedStatus;

      if (statusEl) statusEl.value = finalStatus;

      document.querySelectorAll('#ticket-detail .badge, #ticket-detail span').forEach(function (el) {
        var t = (el.textContent || '').trim();
        if (/^(OPEN|IN PROGRESS|WAITING|RESOLVED|CLOSED)$/i.test(t) ||
            /^(Open|In Progress|Waiting|Resolved|Closed)$/.test(t)) {
          el.textContent = finalStatus;
        }
      });

      if (String(finalStatus).toLowerCase() !== String(newStatus).toLowerCase()) {
        toast('DB kept status as "' + finalStatus + '" (wanted "' + newStatus + '")', 'error');
      } else {
        toast('Status saved: ' + finalStatus, 'success');
      }
    } catch (e) {
      console.error(e);
      toast(String(e.message || e), 'error');
    } finally {
      saving = false;
    }
  }

  function bind() {
    var save = document.getElementById('btn-save-meta');
    if (!save) return;
    if (!save._statusFixV2) {
      save._statusFixV2 = true;
      save.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          forceSave();
        },
        true
      );
    }
  }

  function boot() {
    bind();
    setInterval(bind, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);
})();
