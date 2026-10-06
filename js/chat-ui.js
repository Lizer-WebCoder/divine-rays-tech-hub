/**
 * Divine Rays — Chat / comments UI polish
 * Fits purple system design on end-user AND agent/admin ticket views.
 * Does not change ticket logic — CSS + light class helpers only.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CHAT_UI_V1) return;
  window.__DR_CHAT_UI_V1 = 1;

  var STYLE_ID = 'dr-chat-ui-css';
  var cssReady = false;

  var CSS = [
    '.comments-section,#portal-agent .comments-section,#portal-customer .comments-section{',
    '  background:rgba(20,18,34,0.72)!important;',
    '  border:1px solid rgba(139,124,247,0.22)!important;',
    '  border-radius:14px!important;padding:1rem 1.1rem!important;',
    '  box-shadow:0 8px 28px rgba(0,0,0,0.18)',
    '}',
    'html[data-theme="light"] .comments-section,html[data-theme="light"] #portal-agent .comments-section,html[data-theme="light"] #portal-customer .comments-section{',
    '  background:#fff!important;border-color:rgba(109,94,245,0.2)!important',
    '}',
    '.comments-list,#comments-list,#cust-comments-list{',
    '  display:flex!important;flex-direction:column!important;gap:0.7rem!important;',
    '  margin-bottom:0.9rem!important;max-height:min(48vh,440px)!important;overflow-y:auto!important;',
    '  padding:0.25rem 0.15rem 0.4rem!important;',
    '  scrollbar-width:thin;scrollbar-color:rgba(139,124,247,0.35) transparent',
    '}',
    '.comments-list::-webkit-scrollbar{width:6px}',
    '.comments-list::-webkit-scrollbar-thumb{background:rgba(139,124,247,0.35);border-radius:999px}',
    '.comment{',
    '  background:rgba(26,24,42,0.92)!important;',
    '  border:1px solid rgba(139,124,247,0.22)!important;',
    '  border-radius:12px!important;padding:0.7rem 0.9rem!important;',
    '  box-shadow:0 4px 14px rgba(0,0,0,0.16)!important;max-width:100%',
    '}',
    'html[data-theme="light"] .comment{background:#f7f5ff!important;border-color:rgba(109,94,245,0.18)!important}',
    '.comment:hover{border-color:rgba(167,139,250,0.4)!important}',
    '.comment.internal{border-left:3px solid #f59e0b!important;background:rgba(251,191,36,0.08)!important}',
    'html[data-theme="light"] .comment.internal{background:rgba(251,191,36,0.1)!important}',
    '.comment-header{display:flex!important;justify-content:space-between!important;align-items:center!important;',
    '  gap:0.65rem!important;margin-bottom:0.35rem!important;flex-wrap:wrap!important}',
    '.comment-header strong,.comment-header .dr-author{font-size:0.82rem!important;font-weight:650!important;color:#c4b5fd!important}',
    'html[data-theme="light"] .comment-header strong,html[data-theme="light"] .comment-header .dr-author{color:#5b21b6!important}',
    '.comment-header > span:last-child,.comment-time{font-size:0.72rem!important;color:#8b8ba3!important;margin-left:auto!important}',
    '.comment-body{font-size:0.9rem!important;line-height:1.5!important;color:#eeeef6!important;',
    '  white-space:pre-wrap!important;word-break:break-word!important}',
    'html[data-theme="light"] .comment-body{color:#1e1b4b!important}',
    '.internal-tag{font-size:0.62rem!important;font-weight:700!important;text-transform:uppercase!important;',
    '  color:#fbbf24!important;background:rgba(251,191,36,0.15)!important;',
    '  padding:0.12rem 0.4rem!important;border-radius:999px!important;margin-left:0.35rem!important}',
    '#portal-customer #cust-comments-list{display:flex!important;flex-direction:column!important;gap:0.7rem!important}',
    '#portal-customer #cust-comments-list .comment{max-width:min(88%,26rem)!important}',
    '#portal-customer #cust-comments-list .comment.dr-eu-mine,#portal-customer #cust-comments-list .comment.dr-chat-mine{',
    '  align-self:flex-end!important;margin-left:auto!important;margin-right:0!important;',
    '  background:rgba(109,94,245,0.28)!important;border-color:rgba(167,139,250,0.45)!important',
    '}',
    '#portal-customer #cust-comments-list .comment.dr-eu-theirs,#portal-customer #cust-comments-list .comment.dr-chat-theirs{',
    '  align-self:flex-start!important;margin-left:0!important;margin-right:auto!important',
    '}',
    '#portal-agent .comments-list .comment.dr-chat-staff{',
    '  border-color:rgba(139,124,247,0.35)!important;background:rgba(32,28,52,0.95)!important',
    '}',
    'html[data-theme="light"] #portal-agent .comments-list .comment.dr-chat-staff{background:#f3f0ff!important}',
    '.comment-form,#comment-form,#cust-reply-form{',
    '  margin-top:0.35rem!important;padding-top:0.85rem!important;',
    '  border-top:1px solid rgba(139,124,247,0.18)!important',
    '}',
    '.comment-form textarea,#comment-text,#cust-reply-text,',
    '#portal-customer #cust-reply-form textarea,#portal-agent .comment-form textarea{',
    '  width:100%!important;min-height:4.5rem!important;padding:0.7rem 0.9rem!important;',
    '  border-radius:12px!important;border:1px solid rgba(139,124,247,0.3)!important;',
    '  background:rgba(0,0,0,0.28)!important;color:#f0eef8!important;',
    '  font:inherit!important;font-size:0.9rem!important;line-height:1.45!important;',
    '  resize:vertical!important;outline:none!important',
    '}',
    'html[data-theme="light"] .comment-form textarea,html[data-theme="light"] #comment-text,html[data-theme="light"] #cust-reply-text{',
    '  background:#f5f3ff!important;color:#1e1b4b!important;border-color:rgba(109,94,245,0.28)!important',
    '}',
    '.comment-form textarea:focus,#comment-text:focus,#cust-reply-text:focus{',
    '  border-color:rgba(167,139,250,0.7)!important;box-shadow:0 0 0 3px rgba(124,106,240,0.22)!important',
    '}',
    '.comment-form .form-actions,#cust-reply-form .form-actions,.form-actions{',
    '  display:flex!important;align-items:center!important;justify-content:space-between!important;',
    '  gap:0.65rem!important;margin-top:0.65rem!important;flex-wrap:wrap!important',
    '}',
    '#comment-form button[type="submit"],#cust-reply-form button[type="submit"],',
    '.comment-form button.btn-primary,#cust-reply-form button.btn-primary{',
    '  background:linear-gradient(135deg,#7c6af0,#9b8afb)!important;color:#fff!important;border:none!important;',
    '  border-radius:10px!important;padding:0.55rem 1.1rem!important;font-weight:650!important;',
    '  font-size:0.88rem!important;box-shadow:0 4px 14px rgba(124,106,240,0.32)!important;cursor:pointer',
    '}',
    '.checkbox-label{display:inline-flex!important;align-items:center!important;gap:0.4rem!important;',
    '  font-size:0.82rem!important;color:#9898b0!important;cursor:pointer}',
    'html[data-theme="light"] .checkbox-label{color:#5b5675!important}',
    '.dr-cdel{float:right;font-size:0.72rem!important;padding:0.15rem 0.45rem!important;',
    '  border-radius:6px!important;border:1px solid rgba(239,68,68,0.35)!important;',
    '  background:rgba(239,68,68,0.12)!important;color:#fca5a5!important;cursor:pointer;font-weight:600}',
    '.comments-list .empty-state,#comments-list .empty-state,#cust-comments-list .empty-state{',
    '  text-align:center;padding:1.25rem!important;color:#8b8ba3!important;font-size:0.88rem!important;',
    '  border:1px dashed rgba(139,124,247,0.25)!important;border-radius:12px!important;background:rgba(0,0,0,0.15)!important',
    '}',
  ].join('');

  function inject() {
    if (cssReady && document.getElementById(STYLE_ID)) return;
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
    cssReady = true;
  }

  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function myIds() {
    var out = [], p = profile();
    if (!p) return out;
    if (p.id) out.push(String(p.id).toLowerCase());
    if (p.full_name) out.push(String(p.full_name).toLowerCase().trim());
    if (p.username) out.push(String(p.username).toLowerCase().trim());
    return out;
  }

  function markMineCustomer() {
    var list = document.getElementById('cust-comments-list');
    if (!list) return;
    var names = myIds();
    list.querySelectorAll('.comment').forEach(function (c) {
      var author = (c.getAttribute('data-author') || '').toLowerCase();
      var labelEl = c.querySelector('.comment-header .dr-author, .comment-header strong, .comment-header span:first-child');
      var label = labelEl ? (labelEl.textContent || '').replace(/\s*·.*$/, '').replace(/\s*internal.*/i, '').trim().toLowerCase() : '';
      var isMine = false;
      if (author && names.indexOf(author) !== -1) isMine = true;
      if (label && names.indexOf(label) !== -1) isMine = true;
      c.classList.remove('dr-chat-mine', 'dr-chat-theirs');
      c.classList.add(isMine ? 'dr-chat-mine' : 'dr-chat-theirs');
    });
  }

  function markStaffAgent() {
    var list = document.querySelector('#portal-agent .comments-list') || document.getElementById('comments-list');
    if (!list) return;
    var p = profile();
    var role = p && p.role ? String(p.role).toLowerCase() : '';
    var isStaff = role === 'admin' || role === 'agent';
    list.querySelectorAll('.comment').forEach(function (c) {
      if (c.classList.contains('internal')) return;
      var author = (c.getAttribute('data-author') || '').toLowerCase();
      var labelEl = c.querySelector('.comment-header .dr-author, .comment-header strong');
      var label = labelEl ? (labelEl.textContent || '').toLowerCase() : '';
      var mine = false;
      if (p && p.id && author === String(p.id).toLowerCase()) mine = true;
      if (p && p.full_name && label.indexOf(String(p.full_name).toLowerCase()) !== -1) mine = true;
      if (mine && isStaff) c.classList.add('dr-chat-staff');
    });
  }

  function run() {
    inject();
    markMineCustomer();
    markStaffAgent();
  }

  run();
  setTimeout(run, 600);
  setTimeout(run, 1800);
  setInterval(run, 5000);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.ticket-card') || t.closest('[data-id]')) setTimeout(run, 400);
  }, true);

  window.addEventListener('dr-comments-updated', function () { setTimeout(run, 80); });

  [document.getElementById('portal-customer'), document.getElementById('portal-agent')].forEach(function (root) {
    if (!root) return;
    try {
      new MutationObserver(function () {
        clearTimeout(window.__drChatUiT);
        window.__drChatUiT = setTimeout(run, 120);
      }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
  });

  window.DRChatUI = { refresh: run, v: 1 };
})();
