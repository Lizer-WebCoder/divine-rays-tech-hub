/**
 * Divine Rays — attachments on customer + agent ticket detail
 * Requires: ticket_attachments table + ticket-files storage bucket
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ATTACH) return;
  window.__DR_ATTACH = 1;

  var STYLE = [
    '.attach-panel{margin:1rem 0;padding:1rem 1.15rem;border-radius:12px;border:1px solid var(--border,#2e2e42);background:var(--surface,#1a1a24)}',
    '.attach-panel h4{margin:0 0 .65rem;font-size:.95rem;color:var(--text,#eeeef6)}',
    '.attach-list{display:flex;flex-direction:column;gap:.45rem;margin-bottom:.75rem}',
    '.attach-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.45rem .65rem;border-radius:8px;background:rgba(0,0,0,.2);border:1px solid var(--border,#2e2e42);font-size:.88rem}',
    '.attach-row a{color:#a78bfa;text-decoration:none;word-break:break-all}',
    '.attach-row a:hover{text-decoration:underline}',
    '.attach-upload{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}',
    '.attach-upload input[type=file]{font-size:.82rem;max-width:100%;color:var(--text-muted,#9898b0)}',
    '.attach-thumb{max-width:72px;max-height:72px;border-radius:6px;object-fit:cover;margin-right:.5rem}'
  ].join('');

  function css() {
    if (document.getElementById('dr-attach-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-attach-css';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }
  function profile() {
    return (window.DR && window.DR.getProfile && window.DR.getProfile()) || window.__drProfile || null;
  }
  function toast(m, t) {
    if (window.DR && window.DR.toast) return window.DR.toast(m, t);
    console.log('[attach]', m);
  }
  function esc(s) {
    return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }

  var currentId = null;

  function ensurePanel(host, beforeEl) {
    css();
    var panel = document.getElementById('attach-panel');
    if (panel) return panel;
    if (!host) return null;
    panel = document.createElement('div');
    panel.id = 'attach-panel';
    panel.className = 'attach-panel';
    panel.innerHTML =
      '<h4>Attachments</h4>' +
      '<div class="attach-list" id="attach-list"><span class="kb-sub">No files yet</span></div>' +
      '<div class="attach-upload">' +
      '<input type="file" id="attach-file" accept="image/*,.pdf,.txt,.log,.zip,application/pdf" />' +
      '<button type="button" class="btn btn-secondary btn-sm" id="btn-attach-upload">Upload</button>' +
      '</div>';
    if (beforeEl && beforeEl.parentNode) beforeEl.parentNode.insertBefore(panel, beforeEl);
    else host.appendChild(panel);
    var btn = document.getElementById('btn-attach-upload');
    if (btn) btn.onclick = upload;
    return panel;
  }

  async function load(ticketId) {
    var list = document.getElementById('attach-list');
    if (!list || !ticketId) return;
    currentId = ticketId;
    var client = sb();
    if (!client) return;
    try {
      var r = await client.from('ticket_attachments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
      if (r.error) {
        list.innerHTML = '<span class="kb-sub">Run CSAT + Attachments SQL in Supabase</span>';
        return;
      }
      var rows = r.data || [];
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
        var isImg = (a.mime_type || '').indexOf('image/') === 0;
        var row = document.createElement('div');
        row.className = 'attach-row';
        var left = '';
        if (isImg && url) left += '<img class="attach-thumb" src="' + esc(url) + '" alt="" />';
        left += url
          ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(a.file_name) + '</a>'
          : '<span>' + esc(a.file_name) + '</span>';
        row.innerHTML = '<div style="display:flex;align-items:center;gap:.5rem;min-width:0">' + left + '</div>' +
          '<span class="kb-sub">' + (a.file_size ? Math.round(a.file_size / 1024) + ' KB' : '') + '</span>';
        list.appendChild(row);
      }
    } catch (e) {
      list.innerHTML = '<span class="kb-sub">Could not load attachments</span>';
    }
  }

  async function upload() {
    var input = document.getElementById('attach-file');
    var file = input && input.files && input.files[0];
    if (!file) return toast('Choose a file first', 'error');
    if (!currentId) return toast('Open a ticket first', 'error');
    if (file.size > 10 * 1024 * 1024) return toast('Max 10 MB', 'error');
    var client = sb();
    if (!client) return toast('Not connected', 'error');
    var p = profile();
    var path = currentId + '/' + Date.now() + '-' + file.name.replace(/[^\w.\-]+/g, '_');
    toast('Uploading…', 'info');
    var up = await client.storage.from('ticket-files').upload(path, file, { cacheControl: '3600', upsert: false });
    if (up.error) {
      toast(up.error.message || 'Upload failed — create ticket-files bucket + run SQL', 'error');
      return;
    }
    var ins = await client.from('ticket_attachments').insert({
      ticket_id: currentId,
      uploaded_by: p && p.id,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type || null
    });
    if (ins.error) {
      toast(ins.error.message || 'File saved but DB row failed', 'error');
    } else {
      toast('File uploaded', 'success');
      input.value = '';
      load(currentId);
    }
  }

  async function resolveTicketIdFromDom(root) {
    if (!root) return null;
    var idEl = root.querySelector('.ticket-id');
    var num = idEl ? idEl.textContent.trim() : '';
    if (!num) {
      var m = (root.textContent || '').match(/DR-\d+/);
      num = m ? m[0] : '';
    }
    if (!num) return null;
    var client = sb();
    if (!client) return null;
    var r = await client.from('tickets').select('id,ticket_number')
      .or('ticket_number.eq.' + num + ',number.eq.' + num)
      .limit(1);
    if (r.data && r.data[0]) return r.data[0].id;
    var r2 = await client.from('tickets').select('id').ilike('ticket_number', num).limit(1);
    return r2.data && r2.data[0] && r2.data[0].id;
  }

  async function syncAgent() {
    var detail = document.getElementById('ticket-detail');
    if (!detail) return;
    var host = document.getElementById('view-detail') || detail.parentNode;
    var comments = (host && host.querySelector('.comments-section')) || detail.querySelector('.comments-section');
    ensurePanel(host || detail, comments);
    var id = await resolveTicketIdFromDom(detail);
    if (id) load(id);
  }

  async function syncCustomer() {
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail || !(detail.textContent || '').trim()) return;
    var host = document.getElementById('ctab-detail') || detail.parentNode;
    var comments = host && host.querySelector('.comments-section');
    ensurePanel(host || detail, comments);
    var id = await resolveTicketIdFromDom(detail);
    if (id) load(id);
  }

  function tick() {
    syncAgent().catch(function () {});
    syncCustomer().catch(function () {});
  }

  setInterval(tick, 2000);
  setTimeout(tick, 800);
  window.DRAttach = { refresh: tick, load: load };
})();
