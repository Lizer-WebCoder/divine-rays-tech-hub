/**
 * Divine Rays — Request remote session (AnyDesk / TeamViewer / Chrome RD)
 * Agent/admin posts a clear public request into ticket Activity.
 * Customer sees highlighted card with reply guidance.
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_REMOTE_SESSION) return;
  window.__DR_REMOTE_SESSION = 1;

  var TOOLS = [
    {
      id: 'anydesk',
      name: 'AnyDesk',
      steps:
        '1. Download/open AnyDesk: https://anydesk.com/download\n' +
        '2. Copy your AnyDesk address (the number on the main screen).\n' +
        '3. Reply to this ticket with that number.\n' +
        '4. When we connect, accept the prompt on your screen. You can end the session anytime.'
    },
    {
      id: 'teamviewer',
      name: 'TeamViewer',
      steps:
        '1. Open TeamViewer (or install from https://www.teamviewer.com).\n' +
        '2. Copy your ID and temporary password.\n' +
        '3. Reply here with both (ID + password).\n' +
        '4. Accept the connection when prompted. You stay in control and can disconnect anytime.'
    },
    {
      id: 'chrome',
      name: 'Chrome Remote Desktop',
      steps:
        '1. On your computer open: https://remotedesktop.google.com/support\n' +
        '2. Under "Get support", generate a code.\n' +
        '3. Reply to this ticket with that code.\n' +
        '4. Share only with our support agent. Codes expire; generate a new one if needed.'
    },
    {
      id: 'other',
      name: 'Other / Phone guide',
      steps:
        'Please reply with a preferred remote tool and your availability, or wait for our agent to call/guide you step by step.'
    }
  ];

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }
  function profile() {
    try { if (window.DR && window.DR.getProfile) return window.DR.getProfile(); } catch (e) {}
    return window.__drProfile || null;
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function isStaff() {
    var p = profile();
    if (!p || !p.role) return false;
    return p.role === 'agent' || p.role === 'admin';
  }

  var CSS = [
    '#dr-remote-btn{margin-left:.35rem}',
    '#dr-remote-bd{position:fixed;inset:0;z-index:14000;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .18s}',
    '#dr-remote-bd.open{opacity:1;pointer-events:auto}',
    '#dr-remote-modal{position:fixed;z-index:14010;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);width:min(440px,calc(100vw - 1.5rem));background:var(--surface,#1a1a24);border:1px solid rgba(124,106,240,.35);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.55);padding:1.15rem 1.25rem;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;color:var(--text,#eeeef6)}',
    '#dr-remote-modal.open{opacity:1;transform:translate(-50%,-50%);pointer-events:auto}',
    '#dr-remote-modal h3{margin:0 0 .35rem;font-size:1.1rem;color:#c4b5fd}',
    '#dr-remote-modal p.hint{margin:0 0 .9rem;font-size:.85rem;color:#9898b0;line-height:1.4}',
    '#dr-remote-modal label{display:block;font-size:.8rem;color:#9898b0;margin:.55rem 0 .25rem}',
    '#dr-remote-modal select,#dr-remote-modal textarea{width:100%;box-sizing:border-box;padding:.55rem .7rem;border-radius:8px;border:1px solid var(--border,#2e2e42);background:var(--bg,#0c0c12);color:var(--text,#eeeef6);font:inherit}',
    '#dr-remote-modal textarea{min-height:72px;resize:vertical}',
    '#dr-remote-modal .actions{display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem;flex-wrap:wrap}',
    '#dr-remote-modal .err{color:#f87171;font-size:.82rem;margin-top:.5rem;display:none}',
    '.dr-remote-card{border:1px solid rgba(124,106,240,.4)!important;background:rgba(124,106,240,.1)!important;border-radius:12px;padding:.85rem 1rem;margin:.5rem 0}',
    '.dr-remote-card .dr-remote-title{font-weight:600;color:#c4b5fd;margin-bottom:.35rem;font-size:.92rem}',
    '.dr-remote-card .dr-remote-body{white-space:pre-wrap;font-size:.88rem;line-height:1.45;color:var(--text,#eeeef6)}',
    '.dr-remote-card .dr-remote-tag{display:inline-block;font-size:.7rem;padding:.15rem .45rem;border-radius:6px;background:rgba(124,106,240,.25);color:#c4b5fd;margin-bottom:.4rem}'
  ].join('');

  function injectCss() {
    var s = document.getElementById('dr-remote-css');
    if (!s) {
      s = document.createElement('style');
      s.id = 'dr-remote-css';
      document.head.appendChild(s);
    }
    s.textContent = CSS;
  }

  function currentTicketId() {
    if (window.__drOpenTicketId) return window.__drOpenTicketId;
    var detail = document.getElementById('ticket-detail');
    if (detail) {
      var attr = detail.getAttribute('data-ticket-id');
      if (attr) return attr;
    }
    return null;
  }

  async function resolveTicketId() {
    var id = currentTicketId();
    if (id) return id;
    var root = document.getElementById('ticket-detail');
    if (!root) return null;
    var num = '';
    var idEl = root.querySelector('.ticket-id');
    if (idEl) num = (idEl.textContent || '').trim();
    if (!num) {
      var m = (root.textContent || '').match(/DR-\\d+/);
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
    } catch (e) {}
    return null;
  }

  function ensureModal() {
    if (document.getElementById('dr-remote-modal')) return;
    var bd = document.createElement('div');
    bd.id = 'dr-remote-bd';
    document.body.appendChild(bd);
    var modal = document.createElement('div');
    modal.id = 'dr-remote-modal';
    modal.innerHTML =
      '<h3>Request remote session</h3>' +
      '<p class="hint">Posts a public message on this ticket with clear steps for the customer. They must consent before any remote control.</p>' +
      '<label for="dr-remote-tool">Remote tool</label>' +
      '<select id="dr-remote-tool">' +
      TOOLS.map(function (t) {
        return '<option value="' + t.id + '">' + esc(t.name) + '</option>';
      }).join('') +
      '</select>' +
      '<label for="dr-remote-note">Extra note (optional)</label>' +
      '<textarea id="dr-remote-note" placeholder="e.g. Available now, or after 3 PM…"></textarea>' +
      '<div class="err" id="dr-remote-err"></div>' +
      '<div class="actions">' +
      '<button type="button" class="btn btn-ghost" id="dr-remote-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-primary" id="dr-remote-send">Send request</button>' +
      '</div>';
    document.body.appendChild(modal);
    bd.addEventListener('click', closeModal);
    document.getElementById('dr-remote-cancel').onclick = closeModal;
    document.getElementById('dr-remote-send').onclick = sendRequest;
  }

  function openModal() {
    if (!isStaff()) return;
    ensureModal();
    document.getElementById('dr-remote-err').style.display = 'none';
    document.getElementById('dr-remote-note').value = '';
    document.getElementById('dr-remote-bd').classList.add('open');
    document.getElementById('dr-remote-modal').classList.add('open');
  }

  function closeModal() {
    var bd = document.getElementById('dr-remote-bd');
    var modal = document.getElementById('dr-remote-modal');
    if (bd) bd.classList.remove('open');
    if (modal) modal.classList.remove('open');
  }

  function buildBody(tool, note) {
    var lines = [
      '🖥️ REMOTE SUPPORT REQUEST — ' + tool.name,
      '',
      'We would like to help fix this issue using remote access (' + tool.name + ').',
      'This is optional. Only continue if you are comfortable sharing your screen.',
      '',
      'How to join:',
      tool.steps,
      '',
      'Security tips:',
      '• Only share your ID/code in this ticket with Divine Rays support.',
      '• Never share banking passwords or personal OTPs.',
      '• You can disconnect at any time.',
      ''
    ];
    if (note && note.trim()) {
      lines.push('Agent note: ' + note.trim());
      lines.push('');
    }
    lines.push('Reply to this ticket with your ' + tool.name + ' ID/code when ready.');
    return lines.join('\n');
  }

  async function sendRequest() {
    var errEl = document.getElementById('dr-remote-err');
    var toolId = (document.getElementById('dr-remote-tool') || {}).value || 'anydesk';
    var note = (document.getElementById('dr-remote-note') || {}).value || '';
    var tool = TOOLS.filter(function (t) { return t.id === toolId; })[0] || TOOLS[0];
    var client = sb();
    var p = profile();
    if (!client || !p || !p.id) {
      errEl.textContent = 'Not signed in.';
      errEl.style.display = 'block';
      return;
    }
    var ticketId = await resolveTicketId();
    if (!ticketId) {
      errEl.textContent = 'Open a ticket first.';
      errEl.style.display = 'block';
      return;
    }
    var body = buildBody(tool, note);
    var btn = document.getElementById('dr-remote-send');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    try {
      var payload = {
        ticket_id: ticketId,
        author_id: p.id,
        body: body,
        is_internal: false
      };
      var r = await client.from('comments').insert(payload);
      if (r.error) {
        delete payload.is_internal;
        r = await client.from('comments').insert(payload);
      }
      if (r.error) throw r.error;
      closeModal();
      try {
        if (window.DRCommentsLive && window.DRCommentsLive.refresh) window.DRCommentsLive.refresh();
      } catch (e) {}
      var list = document.getElementById('comments-list');
      if (list) {
        var card = document.createElement('div');
        card.className = 'comment dr-remote-card';
        card.innerHTML =
          '<span class="dr-remote-tag">Remote session</span>' +
          '<div class="dr-remote-title">Request sent</div>' +
          '<div class="dr-remote-body">' + esc(body) + '</div>';
        list.appendChild(card);
        try { card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
      }
    } catch (e) {
      errEl.textContent = (e && e.message) || 'Could not post request.';
      errEl.style.display = 'block';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send request'; }
    }
  }

  function ensureAgentButton() {
    if (!isStaff()) return;
    var actions = document.querySelector('.agent-actions .action-btns') ||
      document.querySelector('.agent-actions .form-group.action-btns') ||
      document.querySelector('.agent-actions');
    if (!actions) return;
    if (document.getElementById('dr-remote-btn')) return;
    var detail = document.getElementById('ticket-detail');
    if (!detail || !(detail.textContent || '').trim()) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'dr-remote-btn';
    btn.className = 'btn btn-secondary';
    btn.textContent = '🖥️ Remote session';
    btn.title = 'Request remote support (AnyDesk / TeamViewer / Chrome RD)';
    btn.addEventListener('click', openModal);
    actions.appendChild(btn);
  }

  function enhanceCommentCards() {
    var roots = [
      document.getElementById('comments-list'),
      document.getElementById('cust-comments-list'),
      document.querySelector('#cust-ticket-detail .comments-list')
    ];
    roots.forEach(function (list) {
      if (!list) return;
      list.querySelectorAll('.comment, .comment-body').forEach(function (el) {
        var text = el.textContent || '';
        if (text.indexOf('REMOTE SUPPORT REQUEST') === -1) return;
        var card = el.closest('.comment') || el;
        if (card.classList.contains('dr-remote-card')) return;
        card.classList.add('dr-remote-card');
        if (!card.querySelector('.dr-remote-tag')) {
          var tag = document.createElement('span');
          tag.className = 'dr-remote-tag';
          tag.textContent = 'Remote session';
          card.insertBefore(tag, card.firstChild);
        }
      });
      Array.prototype.forEach.call(list.children, function (child) {
        var t = child.textContent || '';
        if (t.indexOf('REMOTE SUPPORT REQUEST') !== -1) {
          child.classList.add('dr-remote-card');
        }
      });
    });
  }

  function tick() {
    injectCss();
    ensureAgentButton();
    enhanceCommentCards();
  }

  injectCss();
  tick();
  setInterval(tick, 2000);
  window.DRRemoteSession = { open: openModal, refresh: tick };
})();
