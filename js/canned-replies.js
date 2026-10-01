/**
 * Canned replies — agent/admin quick inserts into ticket comments
 * Additive only. Does not change ticket core.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CANNED_V1) return;
  window.__DR_CANNED_V1 = 1;

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
  function isStaff() {
    try {
      var p = window.DR && DR.getProfile && DR.getProfile();
      return p && (p.role === 'admin' || p.role === 'agent');
    } catch (e) { return false; }
  }

  function findCommentBox() {
    return (
      document.querySelector('#comment-input') ||
      document.querySelector('textarea[name="comment"]') ||
      document.querySelector('#ticket-comment') ||
      document.querySelector('.comment-form textarea') ||
      document.querySelector('#view-ticket textarea') ||
      document.querySelector('textarea.comment-body')
    );
  }

  function ensureBar() {
    if (!isStaff()) return;
    var box = findCommentBox();
    if (!box) return;
    var parent = box.parentElement;
    if (!parent) return;
    if (parent.querySelector('.dr-canned-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'dr-canned-bar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:.35rem;margin:.4rem 0 .55rem;align-items:center';
    var label = document.createElement('span');
    label.textContent = 'Quick reply:';
    label.style.cssText = 'font-size:.72rem;color:#9494ae;font-weight:600;margin-right:.25rem';
    bar.appendChild(label);

    load().forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dr-canned-btn';
      btn.title = text;
      btn.textContent = (i + 1) + '';
      btn.style.cssText =
        'border-radius:999px;border:1px solid rgba(139,124,247,.35);background:rgba(109,94,245,.15);color:#c4b5fd;font-size:.72rem;font-weight:700;padding:.2rem .55rem;cursor:pointer';
      btn.onclick = function (e) {
        e.preventDefault();
        var t = findCommentBox();
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
    edit.onclick = function (e) {
      e.preventDefault();
      var cur = load().join('\n---\n');
      var next = window.prompt('Edit canned replies (separate with --- on its own line):', cur);
      if (next == null) return;
      var parts = next.split(/\n---\n/).map(function (s) { return s.trim(); }).filter(Boolean);
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
  window.DRCannedReplies = { refresh: ensureBar, load: load, save: save };
})();
