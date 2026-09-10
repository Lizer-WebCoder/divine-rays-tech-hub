/**
 * Divine Rays — Ticket Plus
 * Internal notes · File attachments · Assign/transfer · SLA countdown
 * Credit: Lizzz · All Rights Reserved
 * Status save is handled by ticket-plus-fix.js
 */
(function () {
  'use strict';

  var SLA_HOURS = { Critical: 1, High: 4, Medium: 24, Low: 72 };
  var agentsCache = null;
  var currentTicket = null;
  var statusDirty = false;
  var lastSlaText = '';
  var lastTicketNum = '';
  var detailBusy = false;
  var detailTimer = null;

  function dr() { return window.DR || {}; }
  function sb() {
    try {
      if (dr().sb) return dr().sb();
    } catch (e) {}
    return window.__drSb || null;
  }
  function toast(m, t) {
    if (dr().toast) return dr().toast(m, t);
    console.log('[toast]', m);
  }
  function esc(s) {
    if (dr().esc) return dr().esc(s);
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function profile() {
    return (dr().getProfile && dr().getProfile()) || window.__drProfile || null;
  }
  function isStaff() {
    var p = profile();
    return p && (p.role === 'agent' || p.role === 'admin');
  }

  function hoursSince(iso) {
    try { return (Date.now() - new Date(iso).getTime()) / 36e5; } catch (e) { return 0; }
  }
  function slaInfo(t) {
    if (!t) return null;
    var st = String(t.status || '').toLowerCase();
    if (st === 'resolved' || st === 'closed') return null;
    var limit = SLA_HOURS[t.priority] || 24;
    var age = hoursSince(t.created_at);
    var remaining = limit - age;
    if (remaining <= 0) return { state: 'overdue', label: 'Overdue', hours: Math.abs(remaining), limit: limit };
    if (remaining <= limit * 0.25) return { state: 'soon', label: 'Due soon', hours: remaining, limit: limit };
    return { state: 'ok', label: 'Within SLA', hours: remaining, limit: limit };
  }
  function formatCountdown(hours) {
    var h = Math.floor(hours);
    var m = Math.floor((hours - h) * 60);
    if (h >= 24) {
      var d = Math.floor(h / 24);
      return d + 'd ' + (h % 24) + 'h';
    }
    if (h > 0) return h + 'h ' + m + 'm';
    return Math.max(0, m) + 'm';
  }

  function enhanceDetailSla(ticket) {
    if (!ticket) return;
    currentTicket = ticket;
    var d = document.getElementById('ticket-detail');
    if (!d) return;
    var meta = d.querySelector('.detail-meta') || d;
    var s = slaInfo(ticket);
    var txt = '';
    var cls = 'sla-ok';
    if (s) {
      cls = s.state === 'overdue' ? 'sla-overdue' : (s.state === 'soon' ? 'sla-soon' : 'sla-ok');
      txt = s.state === 'overdue'
        ? ('Overdue ' + formatCountdown(s.hours))
        : ('Due in ' + formatCountdown(s.hours));
    }
    if (txt === lastSlaText) {
      var chip = meta.querySelector('.sla-chip .sla-countdown');
      if (chip) chip.textContent = txt;
      return;
    }
    lastSlaText = txt;
    var existing = meta.querySelector('.sla-chip');
    if (!txt) {
      if (existing) existing.remove();
      return;
    }
    if (existing) {
      existing.className = 'meta-chip sla-chip ' + cls;
      var cd = existing.querySelector('.sla-countdown');
      if (cd) cd.textContent = txt;
      else existing.innerHTML = '<span class="meta-k">SLA</span> <span class="sla-countdown">' + esc(txt) + '</span>';
      return;
    }
    var span = document.createElement('span');
    span.className = 'meta-chip sla-chip ' + cls;
    span.innerHTML = '<span class="meta-k">SLA</span> <span class="sla-countdown">' + esc(txt) + '</span>';
    meta.appendChild(span);
  }

  async function loadTicketByNumber(num) {
    var client = sb();
    if (!client || !num) return null;
    var r = await client.from('tickets').select('*').eq('ticket_number', num).maybeSingle();
    return r.data || null;
  }

  async function loadAgents() {
    if (agentsCache) return agentsCache;
    var client = sb();
    if (!client) return [];
    var r = await client.from('profiles').select('id, full_name, email, role, username')
      .in('role', ['agent', 'admin']).order('full_name');
    agentsCache = r.data || [];
    return agentsCache;
  }

  async function populateAssignSelect(ticket) {
    var sel = document.getElementById('assign-agent');
    if (!sel || !isStaff()) return;
    if (document.activeElement === sel) return;
    var agents = await loadAgents();
    var cur = (ticket && (ticket.assigned_to || ticket.assignee_id)) || '';
    var html = '<option value="">— Unassigned —</option>' +
      agents.map(function (a) {
        var label = a.full_name || a.username || a.email || a.id.slice(0, 8);
        return '<option value="' + esc(a.id) + '"' +
          (a.id === cur ? ' selected' : '') + '>' + esc(label) +
          (a.role === 'admin' ? ' (Admin)' : '') + '</option>';
      }).join('');
    if (sel.innerHTML !== html) sel.innerHTML = html;
  }

  function bindStatusDirty() {
    var st = document.getElementById('quick-status');
    if (!st || st._dirtyBound) return;
    st._dirtyBound = true;
    st.addEventListener('change', function () { statusDirty = true; });
    st.addEventListener('focus', function () { statusDirty = true; });
  }

  function bindCommentForm() {
    var form = document.getElementById('comment-form');
    if (!form || form._tpBound) return;
    form._tpBound = true;
    if (!document.getElementById('comment-internal')) {
      var actions = form.querySelector('.form-actions') || form;
      var lab = document.createElement('label');
      lab.className = 'checkbox-label';
      lab.innerHTML = '<input type="checkbox" id="comment-internal" /> Internal note (hidden from customer)';
      actions.insertBefore(lab, actions.firstChild);
    }
    var wrap = document.getElementById('comment-internal');
    if (wrap) {
      var labEl = wrap.closest('label') || wrap;
      if (!isStaff()) labEl.style.display = 'none';
    }
    form.addEventListener('submit', function () {
      var internal = !!(document.getElementById('comment-internal') || {}).checked;
      if (internal && isStaff()) window.__drNextCommentInternal = true;
    }, true);
  }

  function ensureAttachPanel() {
    if (document.getElementById('attach-panel')) return;
    var detail = document.getElementById('view-detail');
    if (!detail) return;
    var comments = detail.querySelector('.comments-section');
    var panel = document.createElement('div');
    panel.id = 'attach-panel';
    panel.className = 'attach-panel';
    panel.innerHTML =
      '<h4>Attachments</h4>' +
      '<div class="attach-list" id="attach-list"><span class="kb-sub">No files yet</span></div>' +
      '<div class="attach-upload">' +
      '<input type="file" id="attach-file" accept="image/*,.pdf,.txt,.log,.zip,application/pdf" />' +
      '<button type="button" class="btn btn-secondary btn-sm" id="btn-attach-upload">Upload</button>' +
      '</div>';
    if (comments) detail.insertBefore(panel, comments);
    else detail.appendChild(panel);
    document.getElementById('btn-attach-upload').addEventListener('click', uploadAttachment);
  }

  async function loadAttachments(ticketId) {
    var list = document.getElementById('attach-list');
    if (!list || !ticketId) return;
    var client = sb();
    if (!client) return;
    try {
      var r = await client.from('ticket_attachments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false });
      var rows = r.data || [];
      if (r.error) {
        list.innerHTML = '<span class="kb-sub">Run ticket-features SQL for attachments</span>';
        return;
      }
      if (!rows.length) {
        list.innerHTML = '<span class="kb-sub">No files yet</span>';
        return;
      }
      list.innerHTML = '';
      for (var i = 0; i < rows.length; i++) {
        var a = rows[i];
        var url = null;
        try {
          var signed = await client.storage.from('ticket-files').createSignedUrl(a.file_path, 3600);
          url = signed.data && signed.data.signedUrl;
        } catch (e) {}
        var row = document.createElement('div');
        row.className = 'attach-row';
        row.innerHTML = (url
          ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(a.file_name) + '</a>'
          : '<span>' + esc(a.file_name) + '</span>') +
          '<span class="kb-sub">' + (a.file_size ? Math.round(a.file_size / 1024) + ' KB' : '') + '</span>';
        list.appendChild(row);
      }
    } catch (e) {
      list.innerHTML = '<span class="kb-sub">Could not load attachments</span>';
    }
  }

  async function uploadAttachment() {
    var input = document.getElementById('attach-file');
    var file = input && input.files && input.files[0];
    if (!file) return toast('Choose a file first', 'error');
    if (!currentTicket || !currentTicket.id) return toast('Open a ticket first', 'error');
    var client = sb();
    if (!client) return toast('Not connected', 'error');
    var p = profile();
    var path = currentTicket.id + '/' + Date.now() + '-' + file.name.replace(/[^\w.\-]+/g, '_');
    toast('Uploading…', 'info');
    var up = await client.storage.from('ticket-files').upload(path, file, { cacheControl: '3600', upsert: false });
    if (up.error) {
      toast(up.error.message || 'Upload failed — run ticket-features SQL', 'error');
      return;
    }
    var ins = await client.from('ticket_attachments').insert({
      ticket_id: currentTicket.id,
      uploaded_by: p && p.id,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type
    });
    if (ins.error) toast(ins.error.message || 'DB row failed', 'error');
    else {
      toast('File uploaded', 'success');
      input.value = '';
      loadAttachments(currentTicket.id);
    }
  }

  function onDetailChange() {
    if (detailBusy) return;
    var detail = document.getElementById('ticket-detail');
    if (!detail) return;
    var idEl = detail.querySelector('.ticket-id');
    if (!idEl) return;
    var num = idEl.textContent.trim();
    if (!num) return;

    bindStatusDirty();

    if (num === lastTicketNum && currentTicket) {
      enhanceDetailSla(currentTicket);
      return;
    }

    detailBusy = true;
    loadTicketByNumber(num).then(function (t) {
      detailBusy = false;
      if (!t) return;
      var switched = num !== lastTicketNum;
      lastTicketNum = num;
      currentTicket = t;
      enhanceDetailSla(t);
      populateAssignSelect(t);
      ensureAttachPanel();
      loadAttachments(t.id);

      var st = document.getElementById('quick-status');
      if (st && t.status && switched && !statusDirty) {
        st.value = t.status;
      }
      if (switched) statusDirty = false;
    }).catch(function () {
      detailBusy = false;
    });
  }

  function watchDetail() {
    var detail = document.getElementById('ticket-detail');
    if (!detail || detail._tpWatch) return;
    detail._tpWatch = true;
    new MutationObserver(function () {
      if (detailTimer) clearTimeout(detailTimer);
      detailTimer = setTimeout(function () {
        onDetailChange();
        bindCommentForm();
        bindStatusDirty();
      }, 300);
    }).observe(detail, { childList: true, subtree: true });
  }

  window.addEventListener('dr-status-saved', function () {
    statusDirty = false;
  });

  function boot() {
    bindCommentForm();
    bindStatusDirty();
    watchDetail();
    setTimeout(bindCommentForm, 1500);
    setTimeout(bindStatusDirty, 1500);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (document.getElementById('portal-agent') || document.getElementById('ticket-detail')) {
        clearInterval(t);
        boot();
      }
      if (n > 100) clearInterval(t);
    }, 100);
  });
  if (document.readyState !== 'loading') setTimeout(boot, 500);

  window.DR_TICKET_PLUS = {
    slaInfo: slaInfo,
    refresh: onDetailChange,
    loadAgents: loadAgents,
    clearStatusDirty: function () { statusDirty = false; }
  };
})();
