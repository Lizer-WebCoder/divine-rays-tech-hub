/**
 * Canned replies — agent/admin only, agent ticket comment box
 * Never mounts on End-User / customer portal.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CANNED_V2) return;
  window.__DR_CANNED_V2 = 1;

  var KEY = 'dr_canned_replies_v1';
  var DEFAULTS = [
    'Please try restarting the device and confirm if the issue persists.',
    'We will schedule a remote session. Please install AnyDesk and share your ID.',
    'Ticket received. An agent will follow up shortly.',
    'Please provide a screenshot of the error message.',
    'Issue resolved on our side. Kindly confirm and we will close the ticket.'
  ];

  function load() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (Array.isArray(a) && a.length) return a.slice(0, 12);
    } catch (e) {}
    return DEFAULTS.slice();
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 12))); } catch (e) {}
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

  /** Only agent portal ticket comment box — never customer forms */
  function findAgentCommentBox() {
    var portal = document.getElementById('portal-agent');
    if (!portal) return null;
    var box =
      portal.querySelector('#comment-text') ||
      portal.querySelector('#comment-form textarea') ||
      portal.querySelector('#view-detail .comment-form textarea') ||
      portal.querySelector('.agent-actions + .comments-section textarea') ||
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

  function ensureBar() {
    stripCustomerBars();
    if (!isStaff()) {
      document.querySelectorAll('.dr-canned-bar').forEach(function (el) {
        try { el.parentNode.removeChild(el); } catch (e) {}
      });
      return;
    }
    var box = findAgentCommentBox();
    if (!box) return;
    var parent = box.parentElement;
    if (!parent) return;
    if (parent.querySelector('.dr-canned-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'dr-canned-bar';
    bar.setAttribute('data-dr-staff-only', '1');
    bar.style.cssText =
      'display:flex;flex-wrap:wrap;gap:.35rem;margin:.4rem 0 .55rem;align-items:center';

    var label = document.createElement('span');
    label.textContent = 'Quick reply:';
    label.style.cssText = 'font-size:.72rem;color:#9494ae;font-weight:600;margin-right:.25rem';
    bar.appendChild(label);

    load().forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dr-canned-btn';
      btn.title = text;
      btn.textContent = String(i + 1);
      btn.style.cssText =
        'border-radius:999px;border:1px solid rgba(139,124,247,.35);background:rgba(109,94,245,.15);color:#c4b5fd;font-size:.72rem;font-weight:700;padding:.2rem .55rem;cursor:pointer';
      btn.onclick = function (e) {
        e.preventDefault();
        if (!isStaff()) return;
        var t = findAgentCommentBox();
        if (!t) return;
        t.value = (t.value ? t.value.replace(/\s+$/, '') + '\n\n' : '') + text;
        t.dispatchEvent(new Event('input', { bubbles: true }));
        t.focus();
      };
      bar.appendChild(btn);
    });

    var edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.style.cssText =
      'border-radius:999px;border:1px solid rgba(148,148,174,.35);background:transparent;color:#9494ae;font-size:.72rem;padding:.2rem .55rem;cursor:pointer;margin-left:.25rem';
    edit.onclick = async function (e) {
      e.preventDefault();
      if (!isStaff()) return;
      var cur = load().join('\n---\n');
      var next;
      try {
        if (window.DRDialog && DRDialog.prompt) {
          next = await DRDialog.prompt(
            'Edit canned replies (separate with --- on its own line):',
            cur,
            { title: 'Quick replies' }
          );
        } else {
          next = window.prompt('Edit canned replies (separate with --- on its own line):', cur);
          if (next && typeof next.then === 'function') next = await next;
        }
      } catch (err) {
        return;
      }
      if (next == null) return;
      var parts = String(next)
        .split(/\n---\n/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
      if (parts.length) {
        save(parts);
        var old = parent.querySelector('.dr-canned-bar');
        if (old) old.parentNode.removeChild(old);
        ensureBar();
      }
    };
    bar.appendChild(edit);
    parent.insertBefore(bar, box);
  }

  setInterval(ensureBar, 2000);
  setTimeout(ensureBar, 800);
  setTimeout(ensureBar, 2500);
  window.DRCannedReplies = { refresh: ensureBar, load: load, save: save };
})();
