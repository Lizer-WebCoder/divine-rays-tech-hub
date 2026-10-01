/**
 * Canned replies — agent/admin only (v4)
 * Force-migrates corrupted --- blobs; multi-item editor.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CANNED_V4) return;
  window.__DR_CANNED_V4 = 1;

  var KEY = 'dr_canned_replies_v2';
  var OLD_KEY = 'dr_canned_replies_v1';
  var DEFAULTS = [
    'Please try restarting the device and confirm if the issue persists.',
    'We will schedule a remote session. Please install AnyDesk and share your ID.',
    'Ticket received. An agent will follow up shortly.',
    'Please provide a screenshot of the error message.',
    'Issue resolved on our side. Kindly confirm and we will close the ticket.'
  ];

  function splitBlob(s) {
    return String(s || '')
      .split(/\s*---+\s*/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean);
  }

  function normalizeList(arr) {
    if (!Array.isArray(arr) || !arr.length) return DEFAULTS.slice();
    var out = [];
    arr.forEach(function (item) {
      var s = String(item || '').trim();
      if (!s) return;
      if (s.indexOf('---') !== -1) {
        splitBlob(s).forEach(function (p) { out.push(p); });
      } else {
        out.push(s);
      }
    });
    if (!out.length) return DEFAULTS.slice();
    var seen = {};
    var unique = [];
    out.forEach(function (t) {
      if (seen[t]) return;
      seen[t] = 1;
      unique.push(t);
    });
    return unique.slice(0, 12);
  }

  function load() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (Array.isArray(a) && a.length) return normalizeList(a);
    } catch (e) {}
    try {
      var old = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
      if (Array.isArray(old) && old.length) {
        var fixed = normalizeList(old);
        save(fixed);
        try { localStorage.removeItem(OLD_KEY); } catch (e2) {}
        return fixed;
      }
    } catch (e3) {}
    return DEFAULTS.slice();
  }

  function save(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(normalizeList(arr).slice(0, 12)));
    } catch (e) {}
  }

  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
    } catch (e) {}
    return null;
  }

  function isStaff() {
    var p = profile();
    if (!p || !p.role) return false;
    var r = String(p.role).toLowerCase().trim();
    return r === 'admin' || r === 'agent';
  }

  function findAgentCommentBox() {
    var portal = document.getElementById('portal-agent');
    if (!portal) return null;
    var box =
      portal.querySelector('#comment-text') ||
      portal.querySelector('#comment-form textarea') ||
      portal.querySelector('#view-detail .comment-form textarea') ||
      null;
    if (!box) return null;
    if (box.closest('#portal-customer')) return null;
    if (box.id === 'cust-reply-text' || box.id === 'c-description') return null;
    return box;
  }

  function stripCustomerBars() {
    document.querySelectorAll('#portal-customer .dr-canned-bar, #cust-reply-form .dr-canned-bar').forEach(function (el) {
      try { el.parentNode.removeChild(el); } catch (e) {}
    });
  }

  function insertText(text) {
    var t = findAgentCommentBox();
    if (!t) return;
    t.value = (t.value ? t.value.replace(/\s+$/, '') + '\n\n' : '') + text;
    t.dispatchEvent(new Event('input', { bubbles: true }));
    t.focus();
  }

  function openEditor() {
    var existing = document.getElementById('dr-canned-editor');
    if (existing) existing.remove();
    var items = load().slice();

    var root = document.createElement('div');
    root.id = 'dr-canned-editor';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.style.cssText =
      'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;padding:1.25rem;box-sizing:border-box';

    var backdrop = document.createElement('div');
    backdrop.style.cssText =
      'position:absolute;inset:0;background:rgba(6,4,16,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)';
    root.appendChild(backdrop);

    var card = document.createElement('div');
    card.style.cssText =
      'position:relative;z-index:1;width:100%;max-width:440px;max-height:min(88vh,640px);' +
      'display:flex;flex-direction:column;border-radius:20px;overflow:hidden;' +
      'background:linear-gradient(165deg,rgba(36,30,58,.98),rgba(20,16,36,.99));' +
      'border:1px solid rgba(167,139,250,.36);' +
      'box-shadow:0 28px 72px rgba(0,0,0,.6);color:#eeeef6;font-family:Inter,system-ui,sans-serif';
    root.appendChild(card);

    var head = document.createElement('div');
    head.style.cssText = 'padding:1.25rem 1.35rem .75rem;text-align:center;flex-shrink:0';
    head.innerHTML =
      '<div style="width:44px;height:44px;border-radius:12px;margin:0 auto .7rem;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(109,94,245,.2);border:1px solid rgba(167,139,250,.4);font-size:1.25rem">💬</div>' +
      '<div style="font-size:1.05rem;font-weight:700">Quick replies</div>' +
      '<div style="font-size:.78rem;color:#9494ae;margin-top:.3rem">One reply per row · max 12</div>';
    card.appendChild(head);

    var listWrap = document.createElement('div');
    listWrap.style.cssText =
      'flex:1;overflow-y:auto;padding:.35rem 1.15rem 0.5rem;display:flex;flex-direction:column;gap:.55rem';
    card.appendChild(listWrap);

    function renderRows() {
      listWrap.innerHTML = '';
      if (!items.length) {
        var empty = document.createElement('div');
        empty.style.cssText = 'text-align:center;color:#9494ae;font-size:.82rem;padding:1rem 0';
        empty.textContent = 'No replies yet. Add one below.';
        listWrap.appendChild(empty);
        return;
      }
      items.forEach(function (text, idx) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:.45rem;align-items:flex-start';
        var num = document.createElement('span');
        num.textContent = String(idx + 1);
        num.style.cssText =
          'flex-shrink:0;width:1.5rem;height:1.5rem;margin-top:.45rem;border-radius:999px;' +
          'display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;' +
          'background:rgba(109,94,245,.2);color:#c4b5fd;border:1px solid rgba(139,124,247,.35)';
        row.appendChild(num);
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.rows = 2;
        ta.style.cssText =
          'flex:1;min-height:2.6rem;resize:vertical;border-radius:10px;padding:.5rem .65rem;' +
          'font-size:.82rem;line-height:1.4;font-family:inherit;color:#eeeef6;' +
          'background:rgba(0,0,0,.25);border:1px solid rgba(167,139,250,.3);outline:none';
        ta.oninput = function () { items[idx] = ta.value; };
        row.appendChild(ta);
        var del = document.createElement('button');
        del.type = 'button';
        del.title = 'Remove';
        del.textContent = '×';
        del.style.cssText =
          'flex-shrink:0;width:1.7rem;height:1.7rem;margin-top:.35rem;border-radius:8px;cursor:pointer;' +
          'border:1px solid rgba(239,68,68,.35);background:rgba(239,68,68,.12);color:#fca5a5;font-size:1rem;font-weight:700';
        del.onclick = function () { items.splice(idx, 1); renderRows(); };
        row.appendChild(del);
        listWrap.appendChild(row);
      });
    }
    renderRows();

    var foot = document.createElement('div');
    foot.style.cssText =
      'flex-shrink:0;padding:.85rem 1.15rem 1.15rem;display:flex;flex-direction:column;gap:.65rem;' +
      'border-top:1px solid rgba(167,139,250,.15)';

    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Add reply';
    addBtn.style.cssText =
      'width:100%;border-radius:10px;padding:.5rem;cursor:pointer;font-size:.82rem;font-weight:600;' +
      'border:1px dashed rgba(167,139,250,.4);background:rgba(109,94,245,.08);color:#c4b5fd';
    addBtn.onclick = function () {
      if (items.length >= 12) return;
      items.push('');
      renderRows();
      var tas = listWrap.querySelectorAll('textarea');
      if (tas.length) tas[tas.length - 1].focus();
    };
    foot.appendChild(addBtn);

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:.55rem;justify-content:center';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Cancel';
    cancel.style.cssText =
      'flex:1;max-width:140px;border-radius:12px;padding:.62rem 1rem;font-size:.875rem;font-weight:600;cursor:pointer;' +
      'background:rgba(255,255,255,.04);border:1px solid rgba(167,139,250,.35);color:#c4b5fd';
    cancel.onclick = function () { root.remove(); };
    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';
    saveBtn.style.cssText =
      'flex:1;max-width:140px;border-radius:12px;padding:.62rem 1rem;font-size:.875rem;font-weight:600;cursor:pointer;' +
      'border:none;background:linear-gradient(135deg,#7c6af0,#5b4ce0);color:#fff;box-shadow:0 4px 16px rgba(91,76,224,.4)';
    saveBtn.onclick = function () {
      var cleaned = items.map(function (s) { return String(s || '').trim(); }).filter(Boolean);
      if (!cleaned.length) cleaned = DEFAULTS.slice();
      save(cleaned);
      root.remove();
      rebuildBar(true);
    };
    actions.appendChild(cancel);
    actions.appendChild(saveBtn);
    foot.appendChild(actions);
    card.appendChild(foot);
    backdrop.onclick = function () { root.remove(); };
    document.body.appendChild(root);
  }

  function rebuildBar(force) {
    document.querySelectorAll('.dr-canned-bar').forEach(function (el) {
      try { el.parentNode.removeChild(el); } catch (e) {}
    });
    ensureBar(force);
  }

  function ensureBar(force) {
    stripCustomerBars();
    if (!isStaff()) {
      document.querySelectorAll('.dr-canned-bar').forEach(function (el) {
        try { el.parentNode.removeChild(el); } catch (e) {}
      });
      return;
    }
    var box = findAgentCommentBox();
    if (!box) return;
    var parent = box.parentNode;
    if (!parent) return;

    var list = load();
    var existing = parent.querySelector('.dr-canned-bar');
    if (existing && !force) {
      var btns = existing.querySelectorAll('.dr-canned-btn');
      if (btns.length === list.length) return;
      try { existing.parentNode.removeChild(existing); } catch (e) {}
    } else if (existing && force) {
      try { existing.parentNode.removeChild(existing); } catch (e2) {}
    }

    var bar = document.createElement('div');
    bar.className = 'dr-canned-bar';
    bar.style.cssText =
      'display:flex;flex-wrap:wrap;align-items:center;gap:.35rem;margin:0 0 .55rem;width:100%';

    var label = document.createElement('span');
    label.textContent = 'Quick reply:';
    label.style.cssText = 'font-size:.72rem;color:#9494ae;font-weight:600;margin-right:.25rem';
    bar.appendChild(label);

    list.forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dr-canned-btn';
      btn.title = text;
      btn.textContent = String(i + 1);
      btn.style.cssText =
        'border-radius:999px;border:1px solid rgba(139,124,247,.35);background:rgba(109,94,245,.15);' +
        'color:#c4b5fd;font-size:.72rem;font-weight:700;padding:.2rem .55rem;cursor:pointer';
      btn.onclick = function (e) {
        e.preventDefault();
        if (!isStaff()) return;
        insertText(text);
      };
      bar.appendChild(btn);
    });

    var edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.style.cssText =
      'border-radius:999px;border:1px solid rgba(148,148,174,.35);background:transparent;' +
      'color:#9494ae;font-size:.72rem;padding:.2rem .55rem;cursor:pointer;margin-left:.25rem';
    edit.onclick = function (e) {
      e.preventDefault();
      if (!isStaff()) return;
      openEditor();
    };
    bar.appendChild(edit);
    parent.insertBefore(bar, box);
  }

  try { save(load()); } catch (e) {}

  setInterval(function () { ensureBar(false); }, 2500);
  setTimeout(function () { ensureBar(true); }, 900);
  setTimeout(function () { ensureBar(true); }, 2800);
  window.DRCannedReplies = { refresh: function () { rebuildBar(true); }, load: load, save: save, openEditor: openEditor };
})();
