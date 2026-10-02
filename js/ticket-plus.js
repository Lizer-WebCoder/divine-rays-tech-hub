/**
 * Divine Rays — Ticket Plus
 * Internal notes · File attachments · Assign/transfer · SLA countdown
 * Credit: Boyz at the Back · All Rights Reserved
 * Note: status save is handled by ticket-plus-fix.js to avoid handler conflicts.
 */
(function () {
  'use strict';
  if (window.__DR_TICKET_PLUS) return;
  window.__DR_TICKET_PLUS = 1;

  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return window.__drSb || null;
  }
  function profile() {
    try {
      if (window.DR && window.DR.getProfile) return window.DR.getProfile();
    } catch (e) {}
    return window.__drProfile || null;
  }
  function isStaff() {
    var p = profile();
    var r = p && String(p.role || '').toLowerCase();
    return r === 'agent' || r === 'admin';
  }
  function toast(msg, type) {
    if (window.DR && window.DR.toast) return window.DR.toast(msg, type);
  }
  function currentTicketId() {
    return window.__drOpenTicketId || window.currentTicketId || null;
  }

  function bindCommentForm() {
    var form = document.getElementById('comment-form');
    if (!form) return;

    // Layout: Add Update button ABOVE Internal note
    var actions = form.querySelector('.form-actions') || form;
    actions.style.display = 'flex';
    actions.style.flexDirection = 'column';
    actions.style.alignItems = 'flex-start';
    actions.style.gap = '0.65rem';

    var btn =
      form.querySelector('button[type="submit"]') ||
      form.querySelector('.btn-primary') ||
      actions.querySelector('button');
    if (btn) {
      btn.style.order = '1';
      btn.style.alignSelf = 'flex-start';
    }

    var lab = null;
    var internalInput = document.getElementById('comment-internal');
    if (internalInput) {
      lab = internalInput.closest('label') || internalInput.parentElement;
    } else {
      lab = document.createElement('label');
      lab.className = 'checkbox-label';
      lab.id = 'comment-internal-label';
      lab.innerHTML = '<input type="checkbox" id="comment-internal" /> Internal note (hidden from customer)';
      actions.appendChild(lab);
    }

    if (lab) {
      lab.style.order = '2';
      lab.style.display = isStaff() ? 'flex' : 'none';
      lab.style.alignItems = 'center';
      lab.style.gap = '0.4rem';
      try { actions.appendChild(lab); } catch (e) {}
    }

    if (form._tpBound) return;
    form._tpBound = true;
    form.addEventListener('submit', function () {
      var internal = !!(document.getElementById('comment-internal') || {}).checked;
      if (internal && isStaff()) window.__drNextCommentInternal = true;
    }, true);
  }

  // Call layout on an interval so core re-renders do not undo order
  setInterval(bindCommentForm, 1200);
  setTimeout(bindCommentForm, 500);
  setTimeout(bindCommentForm, 1500);
  setTimeout(bindCommentForm, 3000);

  window.DRTicketPlus = { bindCommentForm: bindCommentForm };
})();
