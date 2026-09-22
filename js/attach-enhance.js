/**
 * Divine Rays — stable attachments (no flicker) + uploader name + caption
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ATTACH_V2) return;
  window.__DR_ATTACH_V2 = 1;
  window.__DR_ATTACH = 1;

  var STYLE = [
    '.attach-panel{margin:1rem 0;padding:1rem 1.15rem;border-radius:12px;border:1px solid var(--border,#2e2e42);background:var(--surface,#1a1a24)}',
    '.attach-panel h4{margin:0 0 .35rem;font-size:.95rem;color:var(--text,#eeeef6)}',
    '.attach-list{display:flex;flex-direction:column;gap:.45rem;margin-bottom:.75rem}',
    '.attach-row{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;padding:.55rem .65rem;border-radius:8px;background:rgba(0,0,0,.2);border:1px solid var(--border,#2e2e42);font-size:.88rem;transition:none!important}',
    '.attach-row a{color:#a78bfa;text-decoration:none;word-break:break-all}',
    '.attach-row a:hover{text-decoration:underline}',
    '.attach-meta{font-size:.75rem;color:#9898b0;margin-top:.2rem}',
    '.attach-caption{font-size:.82rem;color:var(--text,#eeeef6);margin-top:.25rem;line-height:1.35}',
    '.attach-upload{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}',
    '.attach-upload input[type=file]{font-size:.82rem;max-width:100%;color:var(--text-muted,#9898b0)}',
    '.attach-upload input[type=text],#attach-caption{flex:1 1 180px;min-width:140px;padding:.4rem .55rem;border-radius:8px;border:1px solid var(--border,#2e2e42);background:var(--bg,#0c0c12);color:var(--text,#eeeef6);font:inherit;font-size:.85rem}',
    '.attach-thumb{max-width:72px;max-height:72px;border-radius:6px;object-fit:cover;margin-right:.5rem;flex-shrink:0}'
  ].join('');

  var currentId = null;
  var lastSig = '';
  var nameCache = {};

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
    try { if (window.DR && window.DR.getProfile) return window.DR.getProfile(); } catch (e) {}
    return window.__drProfile || null;
  }
  function toast(m, t) {
    if (window.DR && window.DR.toast) return window.DR.toast(m, t);
    console.log('[attach]', m);
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function fmtSize(n) {
    if (n == null || isNaN(n)) return '';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

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
      '<p class="kb-sub" style="margin:0 0 .5rem">Upload screenshots, PDFs, or logs (max 10 MB). Optional comment is shown with the file.</p>' +
      '<div class="attach-list" id="attach-list"><span class="kb-sub">No files yet</span></div>' +
      '<div class="attach-upload">' +
      '<input type="file" id="attach-file" accept="image/*,.pdf,.txt,.log,.zip,application/pdf" />' +
      '<input type="text" id="attach-caption" placeholder="Comment (optional)…" maxlength="500" />' +
      '<button type="button" class="btn btn-secondary btn-sm" id="btn-attach-upload">Upload</button>' +
      '</div>';
    if (beforeEl && beforeEl.parentNode === host) {
      host.insertBefore(panel, beforeEl);
    } else {
      host.appendChild(panel);
    }
    var btn = document.getElementById('btn-attach-upload');
    if (btn) btn.onclick = upload;
    return panel;
  }

  async function resolveNames(ids) {
    var missing = ids.filter(function (id) { return id && !nameCache[id]; });
    if (!missing.length) return;
    var client = sb();
    if (!client) return;
    try {
      var r = await client.from('profiles').select('id,full_name,username').in('id', missing);
      (r.data || []).forEach(function (p) {
        nameCache[p.id] = p.full_name || p.username || 'User';
      });
    } catch (e) {}
  }

  function uploaderLabel(a) {
    if (a.uploader && (a.uploader.full_name || a.uploader.username)) {
      return a.uploader.full_name || a.uploader.username;
    }
    if (a.uploaded_by && nameCache[a.uploaded_by]) return nameCache[a.uploaded_by];
    var me = profile();
    if (me && a.uploaded_by && me.id === a.uploaded_by) {
      return me.full_name || me.username || 'You';
    }
    return a.uploaded_by ? 'User' : 'Unknown';
  }

  async function load(ticketId, force) {
    var list = document.getElementById('attach-list');
    if (!list || !ticketId) return;
    currentId = ticketId;
    var client = sb();
    if (!client) return;

    try {
      var r = await client
        .from('ticket_attachments')
        .select('*, uploader:profiles!uploaded_by(full_name,username)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      var rows = r.data;
      if (r.error) {
        var r2 = await client
          .from('ticket_attachments')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: false });
        if (r2.error) {
          if (!list.querySelector('.attach-row')) {
            list.innerHTML = '<span class="kb-sub">Run ticket SQL in Supabase (ticket_attachments)</span>';
          }
          return;
        }
        rows = r2.data || [];
        await resolveNames(rows.map(function (a) { return a.uploaded_by; }));
      }

      rows = rows || [];
      var sig = rows.map(function (a) {
        return a.id + ':' + (a.caption || '') + ':' + (a.file_name || '');
      }).join('|');
      if (!force && sig === lastSig && list.querySelector('.attach-row')) return;
      lastSig = sig;

      if (!rows.length) {
        list.innerHTML = '<span class="kb-sub">No files yet</span>';
        return;
      }

      var html = '';
      for (var i = 0; i < rows.length; i++) {
        var a = rows[i];
        var url = '';
        try {
          var signed = await client.storage.from('ticket-files').createSignedUrl(a.file_path, 3600);
          if (signed && signed.data && signed.data.signedUrl) url = signed.data.signedUrl;
        } catch (e) {}
        var name = uploaderLabel(a);
        var when = '';
        try {
          when = new Date(a.created_at).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });
        } catch (e2) {}
        var isImg = (a.mime_type || '').indexOf('image/') === 0 ||
          /\.(png|jpe?g|gif|webp)$/i.test(a.file_name || '');
        var thumb = (isImg && url)
          ? '<img class="attach-thumb" src="' + esc(url) + '" alt="" />'
          : '';
        var link = url
          ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(a.file_name) + '</a>'
          : '<span>' + esc(a.file_name) + '</span>';
        var cap = a.caption
          ? '<div class="attach-caption">' + esc(a.caption) + '</div>'
          : '';
        html +=
          '<div class="attach-row" data-aid="' + esc(a.id) + '">' +
          '<div style="display:flex;align-items:flex-start;gap:.5rem;min-width:0;flex:1">' +
          thumb +
          '<div style="min-width:0">' +
          link +
          '<div class="attach-meta">Uploaded by <strong>' + esc(name) + '</strong>' +
          (when ? ' · ' + esc(when) : '') +
          (a.file_size ? ' · ' + esc(fmtSize(a.file_size)) : '') +
          '</div>' +
          cap +
          '</div></div></div>';
      }
      list.innerHTML = html;
    } catch (e) {
      if (!list.querySelector('.attach-row')) {
        list.innerHTML = '<span class="kb-sub">Could not load attachments</span>';
      }
    }
  }

  async function upload() {
    var input = document.getElementById('attach-file');
    var capEl = document.getElementById('attach-caption');
    var file = input && input.files && input.files[0];
    var caption = (capEl && capEl.value || '').trim();
    if (!file) {
      toast('Choose a file first', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Max 10 MB', 'error');
      return;
    }
    if (!currentId) {
      toast('Open a ticket first', 'error');
      return;
    }
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) {
      toast('Not signed in', 'error');
      return;
    }
    var btn = document.getElementById('btn-attach-upload');
    if (btn) { btn.disabled = true; btn.textContent = 'Uploading…'; }
    var safe = (file.name || 'file').replace(/[^\w.\-]+/g, '_');
    var path = currentId + '/' + Date.now() + '_' + safe;
    try {
      var up = await client.storage.from('ticket-files').upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (up.error) throw up.error;

      var row = {
        ticket_id: currentId,
        uploaded_by: p.id,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type || null
      };
      if (caption) row.caption = caption;

      var ins = await client.from('ticket_attachments').insert(row);
      if (ins.error && caption) {
        delete row.caption;
        ins = await client.from('ticket_attachments').insert(row);
      }
      if (ins.error) throw ins.error;

      if (caption) {
        try {
          await client.from('comments').insert({
            ticket_id: currentId,
            author_id: p.id,
            body: '📎 Uploaded “' + file.name + '”: ' + caption,
            is_internal: false
          });
        } catch (e) {
          try {
            await client.from('comments').insert({
              ticket_id: currentId,
              author_id: p.id,
              body: '📎 Uploaded “' + file.name + '”: ' + caption
            });
          } catch (e2) {}
        }
        try {
          if (window.DRCommentsLive && window.DRCommentsLive.refresh) {
            window.DRCommentsLive.refresh();
          }
        } catch (e3) {}
      }

      toast('File uploaded', 'success');
      if (input) input.value = '';
      if (capEl) capEl.value = '';
      lastSig = '';
      await load(currentId, true);
    } catch (e) {
      toast((e && e.message) || 'Upload failed', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Upload'; }
    }
  }

  async function resolveTicketIdFromDom(root) {
    if (!root) return null;
    var idEl = root.querySelector('.ticket-id');
    var num = idEl ? idEl.textContent.trim() : '';
    if (!num) {
      var m = (root.textContent || '').match(new RegExp('DR-\\d+'));
      num = m ? m[0] : '';
    }
    if (!num) return null;
    var client = sb();
    if (!client) return null;
    try {
      var r = await client.from('tickets').select('id,ticket_number')
        .or('ticket_number.eq.' + num + ',number.eq.' + num)
        .limit(1);
      if (r.data && r.data[0]) return r.data[0].id;
      var r2 = await client.from('tickets').select('id').ilike('ticket_number', num).limit(1);
      return r2.data && r2.data[0] && r2.data[0].id;
    } catch (e) {
      return null;
    }
  }

  async function syncAgent() {
    var detail = document.getElementById('ticket-detail');
    var view = document.getElementById('view-detail');
    if (!detail || !(detail.textContent || '').trim()) return;
    var host = view || detail.parentNode;
    var comments = (host && host.querySelector('.comments-section')) || detail.querySelector('.comments-section');
    ensurePanel(host || detail, comments);
    var id = await resolveTicketIdFromDom(detail);
    if (id) await load(id, false);
    var btn = document.getElementById('btn-attach-upload');
    if (btn) btn.onclick = upload;
  }

  async function syncCustomer() {
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail || !(detail.textContent || '').trim()) return;
    var host = document.getElementById('ctab-detail') || detail.parentNode;
    var comments = host && host.querySelector('.comments-section');
    ensurePanel(host || detail, comments);
    var id = await resolveTicketIdFromDom(detail);
    if (id) await load(id, false);
    var btn = document.getElementById('btn-attach-upload');
    if (btn) btn.onclick = upload;
  }

  function tick() {
    syncAgent().catch(function () {});
    syncCustomer().catch(function () {});
  }

  setInterval(tick, 4000);
  setTimeout(tick, 800);
  setTimeout(tick, 2500);
  window.DRAttach = { refresh: function () { lastSig = ''; tick(); }, load: load };
})();
