/**
 * Divine Rays — Ticket Plus
 * Internal notes · File attachments · Assign/transfer · SLA countdown
 * Credit: Lizzz · All Rights Reserved
 * Note: status save is handled by ticket-plus-fix.js to avoid handler conflicts.
 */
(function () {
  'use strict';

  var SLA_HOURS = { Critical: 1, High: 4, Medium: 24, Low: 72 };
  var agentsCache = null;
  var currentTicket = null;
  var slaTimer = null;

  function dr() { return window.DR || {}; }
  function sb() {
    if (dr().sb) return dr().sb();
    return window.__drSb || null;
  }
  function toast(m, t) {
    if (dr().toast) return dr().toast(m, t);
    console.log('[toast]', m);
  }
  function esc(s) {
    if (dr().esc) return dr().esc(s);
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
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
    if (!t || t.status === 'Resolved' || t.status === 'Closed') return null;
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
      var rh = h % 24;
      return d + 'd ' + rh + 'h';
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
    var existing = meta.querySelector('.sla-chip');
    if (existing) existing.remove();
    var s = slaInfo(ticket);
    if (!s) return;
    var cls = s.state === 'overdue' ? 'sla-overdue' : (s.state === 'soon' ? 'sla-soon' : 'sla-ok');
    var txt = s.state === 'overdue'
      ? ('Overdue ' + formatCountdown(s.hours))
      : ('Due in ' + formatCountdown(s.hours));
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
    var agents = await loadAgents();
    var cur = (ticket && (ticket.assigned_to || ticket.assignee_id)) || '';
    sel.innerHTML = '<option value="">— Unassigned —</option>' +
      agents.map(function (a) {
        var label = a.full_name || a.username || a.email || a.id.slice(0, 8);
        return '<option value="' + esc(a.id) + '"' +
          (a.id === cur ? ' selected' : '') + '>' + esc(label) +
          (a.role === 'admin' ? ' (Admin)' : '') + '</option>';
      }).join('');
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
        row.innerHTML = (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(a.file_name) + '</a>' : '<span>' + esc(a.file_name) + '</span>') +
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
    var detail = document.getElementById('ticket-detail');
    if (!detail) return;
    var idEl = detail.querySelector('.ticket-id');
    if (!idEl) return;
    var num = idEl.textContent.trim();
    if (!num) return;
    loadTicketByNumber(num).then(function (t) {
      if (!t) return;
      currentTicket = t;
      enhanceDetailSla(t);
      populateAssignSelect(t);
      ensureAttachPanel();
      loadAttachments(t.id);
      var st = document.getElementById('quick-status');
      if (st && t.status) st.value = t.status;
    });
  }

  function watchDetail() {
    var detail = document.getElementById('ticket-detail');
    if (!detail || detail._tpWatch) return;
    detail._tpWatch = true;
    new MutationObserver(function () {
      onDetailChange();
      bindCommentForm();
    }).observe(detail, { childList: true, subtree: true });
  }

  function boot() {
    bindCommentForm();
    watchDetail();
    setTimeout(bindCommentForm, 1500);
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

  window.DR_TICKET_PLUS = { slaInfo: slaInfo, refresh: onDetailChange, loadAgents: loadAgents };
})();
