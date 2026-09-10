/**
 * Divine Rays — force status save (Resolved must stick)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }
  function sb() {
    try {
      if (window.DR && typeof window.DR.sb === 'function') return window.DR.sb();
    } catch (e) {}
    return window.__drSb || null;
  }
  function toast(m, t) {
    if (dr().toast) dr().toast(m, t);
    else {
      console.log('[status-fix]', m);
      try {
        var c = document.getElementById('toast-container');
        if (c) {
          var e = document.createElement('div');
          e.className = 'toast ' + (t || 'info');
          e.textContent = m;
          c.appendChild(e);
          setTimeout(function () { e.remove(); }, 4000);
        }
      } catch (e2) {}
    }
  }

  var saving = false;
  var lockStatus = null;
  var lockUntil = 0;

  function applyStatusToUI(status) {
    if (!status) return;
    var statusEl = document.getElementById('quick-status');
    if (statusEl) {
      var opts = statusEl.options;
      for (var i = 0; i < opts.length; i++) {
        if (String(opts[i].value).toLowerCase() === String(status).toLowerCase() ||
            String(opts[i].text).toLowerCase() === String(status).toLowerCase()) {
          statusEl.selectedIndex = i;
          break;
        }
      }
    }
    document.querySelectorAll('#ticket-detail .badge, #ticket-detail .meta-chip, #ticket-detail span').forEach(function (el) {
      var t = (el.textContent || '').trim();
      if (/^(OPEN|IN PROGRESS|WAITING|RESOLVED|CLOSED|Open|In Progress|Waiting|Resolved|Closed)$/i.test(t)) {
        el.textContent = status;
      }
    });
  }

  async function forceSave() {
    if (saving) return;
    saving = true;
    try {
      var client = sb();
      if (!client) {
        toast('Not connected — wait 2s after login, then try again', 'error');
        return;
      }

      var statusEl = document.getElementById('quick-status');
      var assignEl = document.getElementById('assign-agent');
      var newStatus = statusEl ? String(statusEl.value || '').trim() : '';
      if (!newStatus) {
        toast('Pick a status first', 'error');
        return;
      }

      lockStatus = newStatus;
      lockUntil = Date.now() + 8000;
      applyStatusToUI(newStatus);

      var idEl = document.querySelector('#ticket-detail .ticket-id, #ticket-detail .ticket-number');
      var num = idEl ? idEl.textContent.trim() : '';
      if (!num) {
        var pt = document.getElementById('page-title');
        if (pt && /^DR-/i.test(pt.textContent.trim())) num = pt.textContent.trim();
      }
      if (!num) {
        toast('Open a ticket first', 'error');
        return;
      }

      var tr = await client.from('tickets').select('id, status, ticket_number').eq('ticket_number', num).maybeSingle();
      if (tr.error) {
        toast('Load failed: ' + (tr.error.message || 'error'), 'error');
        return;
      }
      if (!tr.data) {
        toast('Ticket not found: ' + num, 'error');
        return;
      }
      var tid = tr.data.id;
      var before = tr.data.status;

      var rpcOk = false;
      try {
        var rpc = await client.rpc('set_ticket_status', { p_ticket_id: tid, p_status: newStatus });
        if (!rpc.error) rpcOk = true;
        else console.warn('[status-fix] rpc', rpc.error);
      } catch (e) {}

      if (!rpcOk) {
        var rs = await client.from('tickets').update({ status: newStatus }).eq('id', tid);
        if (rs.error) {
          toast('Status blocked: ' + (rs.error.message || 'permission/RLS'), 'error');
          toast('Run tickets-status-fix SQL in Supabase', 'error');
          return;
        }
      }

      if (assignEl && assignEl.value) {
        var ra = await client.from('tickets').update({ assigned_to: assignEl.value }).eq('id', tid);
        if (ra.error) {
          await client.from('tickets').update({ assignee_id: assignEl.value }).eq('id', tid);
        }
      }

      var fresh = await client.from('tickets').select('status').eq('id', tid).maybeSingle();
      var finalStatus = (fresh.data && fresh.data.status) || newStatus;
      applyStatusToUI(finalStatus);
      lockStatus = finalStatus;
      lockUntil = Date.now() + 10000;

      try { window.dispatchEvent(new Event('dr-status-saved')); } catch (e) {}
      if (window.DR_TICKET_PLUS && window.DR_TICKET_PLUS.clearStatusDirty) {
        window.DR_TICKET_PLUS.clearStatusDirty();
      }

      if (String(finalStatus).toLowerCase() !== String(newStatus).toLowerCase()) {
        toast('Still "' + finalStatus + '" in DB (wanted "' + newStatus + '"). Run SQL.', 'error');
      } else {
        toast('Status saved: ' + before + ' → ' + finalStatus, 'success');
      }
    } catch (e) {
      console.error(e);
      toast(String(e.message || e), 'error');
    } finally {
      saving = false;
    }
  }

  function bindSave() {
    var save = document.getElementById('btn-save-meta');
    if (!save || save._statusFixV3) return;
    save._statusFixV3 = true;
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

  function boot() {
    bindSave();
    setInterval(bindSave, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 400);
})();
