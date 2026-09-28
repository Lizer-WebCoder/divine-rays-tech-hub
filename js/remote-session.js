/**
 * Divine Rays — Request remote session (AnyDesk / TeamViewer / Chrome RD)
 * No flicker: single comment node, enhance once per render
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_REMOTE_SESSION) return;
  window.__DR_REMOTE_SESSION = 1;

  var MODAL_HTML =
    '<div id="dr-remote-modal" class="dr-remote-backdrop" style="display:none">' +
    '<div class="dr-remote-card">' +
    '<h3>Remote session</h3>' +
    '<p class="kb-sub">Post a public note with steps so the end-user can share their screen.</p>' +
    '<div class="form-group"><label>Tool</label>' +
    '<select id="dr-remote-tool">' +
    '<option value="AnyDesk">AnyDesk</option>' +
    '<option value="TeamViewer">TeamViewer</option>' +
    '<option value="Chrome Remote Desktop">Chrome Remote Desktop</option>' +
    '</select></div>' +
    '<div class="form-group"><label>Extra notes (optional)</label>' +
    '<textarea id="dr-remote-notes" rows="3" placeholder="e.g. available for the next 30 minutes"></textarea></div>' +
    '<div class="form-row" style="justify-content:flex-end;gap:.5rem">' +
    '<button type="button" class="btn btn-secondary" id="dr-remote-cancel">Cancel</button>' +
    '<button type="button" class="btn btn-primary" id="dr-remote-send">Post instructions</button>' +
    '</div></div></div>';

  var STYLE = [
    '.dr-remote-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem}',
    '.dr-remote-card{background:var(--surface,#1a1a24);border:1px solid rgba(139,124,247,.35);border-radius:14px;padding:1.25rem;max-width:420px;width:100%;box-shadow:0 16px 40px rgba(0,0,0,.4)}',
    '.dr-remote-card h3{margin:0 0 .35rem;color:#c4b5fd}',
    '.dr-remote-btn{margin-left:.35rem}',
    '.dr-remote-tag{font-size:.7rem;font-weight:700;color:#a78bfa;margin-left:.35rem}'
  ].join('');

  function css() {
    if (document.getElementById('dr-remote-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-remote-css';
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
  function isStaff() {
    var p = profile();
    return !!(p && (p.role === 'agent' || p.role === 'admin'));
  }
  function toast(m, t) {
    if (window.DR && window.DR.toast) return window.DR.toast(m, t);
  }

  async function resolveTicketId() {
    var root = document.getElementById('ticket-detail') || document.getElementById('cust-ticket-detail');
    if (!root) return null;
    var idAttr = root.getAttribute('data-ticket-id');
    if (idAttr) return idAttr;
    if (window.__drOpenTicketId) return window.__drOpenTicketId;
    var idEl = root.querySelector('.ticket-id');
    var num = idEl ? idEl.textContent.trim() : '';
    if (!num) {
      var m = (root.textContent || '').match(/DR-\d+/i);
      num = m ? m[0] : '';
    }
    if (!num) return null;
    var client = sb();
    if (!client) return null;
    try {
      // Column "number" does not exist — querying it causes HTTP 400
      var r = await client
        .from('tickets')
        .select('id, ticket_number')
        .eq('ticket_number', num)
        .limit(1);
      if (!r.error && r.data && r.data[0]) return r.data[0].id;
    } catch (e) {}
    return null;
  }

  function ensureModal() {
    if (document.getElementById('dr-remote-modal')) return;
    css();
    var wrap = document.createElement('div');
    wrap.innerHTML = MODAL_HTML;
    document.body.appendChild(wrap.firstChild);
    document.getElementById('dr-remote-cancel').onclick = closeModal;
    document.getElementById('dr-remote-modal').addEventListener('click', function (e) {
      if (e.target && e.target.id === 'dr-remote-modal') closeModal();
    });
    document.getElementById('dr-remote-send').onclick = sendRemote;
  }

  function openModal() {
    ensureModal();
    document.getElementById('dr-remote-modal').style.display = 'flex';
  }
  function closeModal() {
    var m = document.getElementById('dr-remote-modal');
    if (m) m.style.display = 'none';
  }

  function stepsFor(tool) {
    if (tool === 'TeamViewer') {
      return [
        '1. Download / open TeamViewer (https://www.teamviewer.com).',
        '2. Share your ID and temporary password with support.',
        '3. Stay at your PC until the session ends.'
      ].join('\n');
    }
    if (tool === 'Chrome Remote Desktop') {
      return [
        '1. Open Chrome Remote Desktop (https://remotedesktop.google.com/support).',
        '2. Under "Get support", generate a code and send it here.',
        '3. Keep Chrome open until we finish.'
      ].join('\n');
    }
    return [
      '1. Download / open AnyDesk (https://anydesk.com).',
      '2. Share your AnyDesk address with support in this ticket.',
      '3. Accept the connection prompt when it appears.'
    ].join('\n');
  }

  async function sendRemote() {
    var tool = (document.getElementById('dr-remote-tool') || {}).value || 'AnyDesk';
    var notes = ((document.getElementById('dr-remote-notes') || {}).value || '').trim();
    var ticketId = await resolveTicketId();
    if (!ticketId) {
      toast('Open a ticket first', 'error');
      return;
    }
    var client = sb();
    var me = profile();
    if (!client || !me) return;
    var body =
      '🖥️ Remote session requested via **' +
      tool +
      '**\n\n' +
      stepsFor(tool) +
      (notes ? '\n\nNotes: ' + notes : '');
    try {
      var ins = await client.from('comments').insert({
        ticket_id: ticketId,
        author_id: me.id,
        body: body,
        is_internal: false
      });
      if (ins.error) throw ins.error;
      toast('Remote session instructions posted', 'success');
      closeModal();
      if (window.DRCommentsLive && window.DRCommentsLive.refresh) {
        try { window.DRCommentsLive.refresh(); } catch (e) {}
      }
    } catch (e) {
      toast((e && e.message) || 'Could not post', 'error');
    }
  }

  function ensureButton() {
    if (!isStaff()) return;
    var actions =
      document.querySelector('.agent-actions .action-btns') ||
      document.querySelector('.agent-actions .form-group.action-btns') ||
      document.querySelector('.agent-actions');
    if (!actions) return;
    if (document.getElementById('btn-remote-session')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-remote-session';
    btn.className = 'btn btn-secondary btn-sm dr-remote-btn';
    btn.textContent = 'Remote session';
    btn.onclick = openModal;
    actions.appendChild(btn);
  }

  function enhanceCommentCards() {
    var lists = [
      document.querySelector('#ticket-detail .comments-list'),
      document.querySelector('#cust-ticket-detail .comments-list')
    ];
    lists.forEach(function (list) {
      if (!list) return;
      list.querySelectorAll('.comment').forEach(function (node) {
        var body = node.querySelector('.comment-body');
        if (!body) return;
        var t = body.textContent || '';
        if (/Remote session requested/i.test(t) && !node.querySelector('.dr-remote-tag')) {
          var tag = document.createElement('span');
          tag.className = 'dr-remote-tag';
          tag.textContent = 'REMOTE';
          var h = node.querySelector('.comment-header span');
          if (h) h.appendChild(tag);
        }
      });
    });
  }

  function tick() {
    css();
    ensureButton();
    enhanceCommentCards();
  }

  setTimeout(tick, 900);
  setTimeout(tick, 2200);
  setInterval(tick, 3000);

  try {
    function watchLists() {
      ['ticket-detail', 'cust-ticket-detail'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el._drRemoteObs) {
          el._drRemoteObs = true;
          new MutationObserver(function () {
            tick();
          }).observe(el, { childList: true });
        }
      });
      enhanceCommentCards();
    }
    watchLists();
    setInterval(watchLists, 4000);
  } catch (e) {
    setInterval(enhanceCommentCards, 5000);
  }
  window.DRRemoteSession = {
    open: openModal,
    refresh: function () {
      tick();
      enhanceCommentCards();
    }
  };
})();
