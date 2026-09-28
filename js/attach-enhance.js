/**
 * Divine Rays — stable attachments (no flicker) + uploader name + caption
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ATTACH_V2) return;
  window.__DR_ATTACH_V2 = 1;
  window.__DR_ATTACH = 1;

  var STYLE = [
    '.attach-panel{margin:1rem 0;padding:1.15rem 1.25rem;border-radius:14px;border:1px solid rgba(139,124,247,.28);background:rgba(26,24,42,.72);box-shadow:0 6px 20px rgba(0,0,0,.18);backdrop-filter:blur(8px)}',
    '.attach-panel h4{margin:0 0 .35rem;font-size:.95rem;font-weight:700;color:#c4b5fd}',
    '.attach-panel .kb-sub{color:#9898b0;font-size:.82rem;line-height:1.4}',
    '.attach-list{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.85rem}',
    '.attach-row{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;padding:.6rem .75rem;border-radius:10px;background:rgba(0,0,0,.22);border:1px solid rgba(139,124,247,.18);font-size:.88rem}',
    '.attach-row a{color:#a78bfa;text-decoration:none;word-break:break-all;font-weight:600}',
    '.attach-row a:hover{text-decoration:underline}',
    '.attach-meta{font-size:.75rem;color:#9898b0;margin-top:.2rem}',
    '.attach-caption{font-size:.82rem;color:var(--text,#eeeef6);margin-top:.25rem;line-height:1.35}',
    '.attach-upload{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center}',
    '.attach-file-wrap{position:relative;display:inline-flex;align-items:center;gap:.5rem;flex-wrap:wrap}',
    '.attach-file-wrap input[type=file]{position:absolute;width:.1px;height:.1px;opacity:0;overflow:hidden;z-index:-1}',
    '.attach-choose{display:inline-flex;align-items:center;gap:.4rem;padding:.45rem .9rem;border-radius:10px;border:1px solid rgba(139,124,247,.4);background:linear-gradient(135deg,rgba(124,106,240,.28),rgba(124,106,240,.12));color:#e9e5ff;font-size:.85rem;font-weight:600;cursor:pointer;font-family:inherit;transition:border-color .15s,box-shadow .15s,transform .15s}',
    '.attach-choose:hover{border-color:rgba(167,139,250,.65);box-shadow:0 4px 14px rgba(109,94,245,.2);transform:translateY(-1px)}',
    '.attach-choose:active{transform:translateY(0)}',
    '.attach-fname{font-size:.82rem;color:#c4b5fd;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:.35rem .65rem;border-radius:8px;background:rgba(139,124,247,.12);border:1px solid rgba(139,124,247,.2)}',
    '.attach-fname.is-empty{color:#9898b0;background:transparent;border-style:dashed}',
    '.attach-upload input[type=text],#attach-caption{flex:1 1 160px;min-width:140px;padding:.5rem .7rem;border-radius:10px;border:1px solid rgba(139,124,247,.28);background:rgba(12,12,20,.55);color:#eeeef6;font:inherit;font-size:.85rem}',
    '.attach-upload input[type=text]:focus,#attach-caption:focus{outline:none;border-color:rgba(167,139,250,.6);box-shadow:0 0 0 3px rgba(109,94,245,.15)}',
    '#btn-attach-upload{padding:.45rem 1rem;border-radius:10px;border:none;background:linear-gradient(135deg,#8b7cf7,#6d5ef5);color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit;box-shadow:0 4px 12px rgba(109,94,245,.25)}',
    '#btn-attach-upload:hover{filter:brightness(1.08)}',
    '#btn-attach-upload:disabled{opacity:.55;cursor:not-allowed;filter:none}',
    '.attach-thumb{max-width:72px;max-height:72px;border-radius:6px;object-fit:cover;margin-right:.5rem;flex-shrink:0}',
    'html[data-theme="light"] .attach-panel{background:rgba(255,255,255,.94)!important;border-color:rgba(109,94,245,.22)!important;box-shadow:0 6px 20px rgba(109,94,245,.08)}',
    'html[data-theme="light"] .attach-panel h4{color:#5b21b6!important}',
    'html[data-theme="light"] .attach-panel .kb-sub,html[data-theme="light"] .attach-meta{color:#4b5563!important}',
    'html[data-theme="light"] .attach-row{background:#f5f3ff!important;border-color:rgba(109,94,245,.15)!important}',
    'html[data-theme="light"] .attach-choose{background:linear-gradient(135deg,rgba(109,94,245,.14),rgba(109,94,245,.06));color:#4c1d95;border-color:rgba(109,94,245,.35)}',
    'html[data-theme="light"] .attach-fname{color:#5b21b6;background:rgba(109,94,245,.08);border-color:rgba(109,94,245,.2)}',
    'html[data-theme="light"] .attach-fname.is-empty{color:#6b7280}',
    'html[data-theme="light"] .attach-upload input[type=text],html[data-theme="light"] #attach-caption{background:#f8f7ff!important;border-color:rgba(109,94,245,.25)!important;color:#1e1b4b!important}'
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
      '<p class="kb-sub" style="margin:0 0 .65rem">Upload screenshots, PDFs, or logs (max 10 MB). Optional comment is shown with the file.</p>' +
      '<div class="attach-list" id="attach-list"><span class="kb-sub">No files yet</span></div>' +
      '<div class="attach-upload">' +
      '<div class="attach-file-wrap">' +
      '<input type="file" id="attach-file" accept="image/*,.pdf,.txt,.log,.zip,application/pdf" />' +
      '<label for="attach-file" class="attach-choose" id="attach-choose-btn">📎 Choose file</label>' +
      '<span class="attach-fname is-empty" id="attach-fname">No file chosen</span>' +
      '</div>' +
      '<input type="text" id="attach-caption" placeholder="Comment (optional)…" maxlength="500" />' +
      '<button type="button" id="btn-attach-upload">Upload</button>' +
      '</div>';
    if (beforeEl && beforeEl.parentNode === host) {
      host.insertBefore(panel, beforeEl);
    } else {
      host.appendChild(panel);
    }
    var btn = document.getElementById('btn-attach-upload');
    if (btn) btn.onclick = upload;
    var fin = document.getElementById('attach-file');
    var fname = document.getElementById('attach-fname');
    if (fin && !fin._drBound) {
      fin._drBound = true;
      fin.addEventListener('change', function () {
        var f = fin.files && fin.files[0];
        if (fname) {
          if (f) {
            fname.textContent = f.name;
            fname.classList.remove('is-empty');
            fname.title = f.name;
          } else {
            fname.textContent = 'No file chosen';
            fname.classList.add('is-empty');
            fname.title = '';
          }
        }
      });
    }
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

  function renderList(rows) {
    var list = document.getElementById('attach-list');
    if (!list) return;
    if (!rows || !rows.length) {
      list.innerHTML = '<span class="kb-sub">No files yet</span>';
      return;
    }
    list.innerHTML = rows.map(function (row) {
      var who = nameCache[row.uploaded_by] || 'User';
      var size = fmtSize(row.file_size);
      var cap = row.caption ? '<div class="attach-caption">' + esc(row.caption) + '</div>' : '';
      var meta = esc(who) + (size ? ' · ' + size : '');
      var link = row.public_url || row.file_path || '#';
      var name = esc(row.file_name || 'file');
      var thumb = '';
      if (row.file_name && /\.(png|jpe?g|gif|webp)$/i.test(row.file_name) && row.public_url) {
        thumb = '<img class="attach-thumb" src="' + esc(row.public_url) + '" alt="" />';
      }
      return (
        '<div class="attach-row">' +
        '<div style="display:flex;align-items:flex-start;gap:.5rem;min-width:0;flex:1">' +
        thumb +
        '<div style="min-width:0">' +
        '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + name + '</a>' +
        '<div class="attach-meta">' + meta + '</div>' +
        cap +
        '</div></div></div>'
      );
    }).join('');
  }

  async function loadAttachments(ticketId) {
    if (!ticketId) return;
    var client = sb();
    if (!client) return;
    try {
      var r = await client
        .from('ticket_attachments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
      if (r.error) {
        var list = document.getElementById('attach-list');
        if (list) list.innerHTML = '<span class="kb-sub">Attachments unavailable</span>';
        return;
      }
      var rows = r.data || [];
      var ids = rows.map(function (x) { return x.uploaded_by; }).filter(Boolean);
      await resolveNames(ids);
      var sig = rows.map(function (x) { return x.id; }).join(',');
      if (sig === lastSig) return;
      lastSig = sig;
      renderList(rows);
    } catch (e) {
      console.warn('[attach]', e);
    }
  }

  async function upload() {
    var input = document.getElementById('attach-file');
    var capEl = document.getElementById('attach-caption');
    var file = input && input.files && input.files[0];
    var caption = (capEl && capEl.value) || '';
    if (!file) {
      toast('Choose a file first', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('File too large (max 10 MB)', 'error');
      return;
    }
    var tid = currentId || window.__drOpenTicketId;
    if (!tid) {
      toast('Open a ticket first', 'error');
      return;
    }
    var client = sb();
    if (!client) return;
    var me = profile();
    var btn = document.getElementById('btn-attach-upload');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Uploading…';
    }
    try {
      var safe = (file.name || 'file').replace(/[^\w.\-]+/g, '_');
      var path = tid + '/' + Date.now() + '_' + safe;
      var up = await client.storage.from('ticket-attachments').upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (up.error) throw up.error;
      var pub = client.storage.from('ticket-attachments').getPublicUrl(path);
      var publicUrl = (pub && pub.data && pub.data.publicUrl) || null;
      var ins = await client.from('ticket_attachments').insert({
        ticket_id: tid,
        uploaded_by: me && me.id,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        public_url: publicUrl,
        caption: caption || null
      }).select().single();
      if (ins.error) throw ins.error;
      input.value = '';
      if (capEl) capEl.value = '';
      var fn = document.getElementById('attach-fname');
      if (fn) { fn.textContent = 'No file chosen'; fn.classList.add('is-empty'); fn.title = ''; }
      lastSig = '';
      await loadAttachments(tid);
      toast('File uploaded', 'success');
      try {
        if (caption) {
          await client.from('comments').insert({
            ticket_id: tid,
            author_id: me && me.id,
            body: '📎 Uploaded “' + file.name + '”: ' + caption,
            is_internal: false
          });
        } else {
          await client.from('comments').insert({
            ticket_id: tid,
            author_id: me && me.id,
            body: '📎 Uploaded “' + file.name + '”',
            is_internal: false
          });
        }
      } catch (e2) {}
    } catch (e) {
      console.warn('[attach upload]', e);
      toast((e && e.message) || 'Upload failed', 'error');
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Upload';
    }
  }

  function ticketIdFromDom() {
    if (window.__drOpenTicketId) return window.__drOpenTicketId;
    var d = document.getElementById('ticket-detail');
    if (d && d.getAttribute('data-ticket-id')) return d.getAttribute('data-ticket-id');
    var c = document.getElementById('cust-ticket-detail');
    if (c && c.getAttribute('data-ticket-id')) return c.getAttribute('data-ticket-id');
    return null;
  }

  function sync() {
    css();
    var tid = ticketIdFromDom();
    var detail = document.getElementById('ticket-detail') || document.getElementById('view-detail') || document.getElementById('cust-ticket-detail');
    if (!detail) return;
    var comments = detail.querySelector('.comments-section');
    var host = detail;
    ensurePanel(host || detail, comments);
    var btn = document.getElementById('btn-attach-upload');
    if (btn) btn.onclick = upload;
    if (tid && tid !== currentId) {
      currentId = tid;
      lastSig = '';
      loadAttachments(tid);
    } else if (tid) {
      loadAttachments(tid);
    }
  }

  setTimeout(sync, 900);
  setTimeout(sync, 2500);
  setInterval(function () {
    if (document.getElementById('ticket-detail') || document.getElementById('cust-ticket-detail')) {
      sync();
    }
  }, 8000);

  window.DRAttach = { refresh: sync, load: loadAttachments };
})();
