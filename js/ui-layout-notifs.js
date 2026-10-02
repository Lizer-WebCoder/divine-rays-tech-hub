/**
 * Divine Rays — UI layout + notifications helpers v2
 * - Add Update button above Internal note
 * - Mark all as read (staff + end-user) same compact size
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_UI_LAYOUT_NOTIFS >= 2) return;
  window.__DR_UI_LAYOUT_NOTIFS = 2;

  function sb() {
    try {
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
      if (window.DR && DR.supabase) return DR.supabase;
      if (window.__drSb) return window.__drSb;
    } catch (e) {}
    return null;
  }
  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
    } catch (e) {}
    return window.__drProfile || window.currentProfile || null;
  }
  function isStaff() {
    var p = profile();
    var r = p && String(p.role || '').toLowerCase();
    return r === 'agent' || r === 'admin' || r === 'developer';
  }

  /* Shared compact button style (matches admin/staff) */
  var MARK_CSS =
    '#dr-staff-notif-markread,#dr-notif-mark-all{' +
    'border:1px solid rgba(124,106,240,.4)!important;' +
    'border-radius:8px!important;' +
    'padding:.25rem .5rem!important;' +
    'font-size:.72rem!important;' +
    'font-weight:600!important;' +
    'line-height:1.2!important;' +
    'color:#c4b5fd!important;' +
    'cursor:pointer!important;' +
    'background:rgba(124,106,240,.12)!important;' +
    'white-space:nowrap!important;' +
    'height:auto!important;' +
    'min-height:0!important;' +
    'box-shadow:none!important;' +
    'width:auto!important;' +
    'flex:0 0 auto!important' +
    '}' +
    'html[data-theme="light"] #dr-staff-notif-markread,' +
    'html[data-theme="light"] #dr-notif-mark-all{' +
    'color:#5b21b6!important;background:#ede9fe!important;border-color:rgba(124,106,240,.35)!important' +
    '}' +
    '#dr-notif-panel .hd{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:.5rem!important}' +
    '#dr-notif-panel .hd .hd-actions{display:flex!important;align-items:center!important;gap:.4rem!important;margin-left:auto!important}' +
    '#dr-notif-panel .hd #dr-notif-close{font-size:1.1rem!important;padding:.15rem .35rem!important;background:0!important;border:0!important}';

  function ensureCss() {
    var el = document.getElementById('dr-markread-shared-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-markread-shared-css';
      document.head.appendChild(el);
    }
    el.textContent = MARK_CSS;
  }

  /* ========== Comment form: button ABOVE internal note ========== */
  function layoutCommentForm() {
    var form = document.getElementById('comment-form');
    if (!form) return;
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

    var input = document.getElementById('comment-internal');
    var lab = input ? input.closest('label') || input.parentElement : null;
    if (!input) {
      lab = document.createElement('label');
      lab.className = 'checkbox-label';
      lab.id = 'comment-internal-label';
      lab.innerHTML =
        '<input type="checkbox" id="comment-internal" /> Internal note (hidden from customer)';
      actions.appendChild(lab);
      input = document.getElementById('comment-internal');
    }
    if (lab) {
      lab.style.order = '2';
      lab.style.display = isStaff() ? 'flex' : 'none';
      lab.style.alignItems = 'center';
      lab.style.gap = '0.4rem';
      try {
        actions.appendChild(lab);
      } catch (e) {}
    }
  }

  /* ========== Staff notifications: Mark all as read ========== */
  function injectStaffMarkRead() {
    var panel = document.getElementById('dr-staff-notif-panel');
    if (!panel) return;
    if (document.getElementById('dr-staff-notif-markread')) return;
    var actions = panel.querySelector('.hd-actions');
    var clearBtn = document.getElementById('dr-staff-notif-clear');
    if (!actions) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'dr-staff-notif-markread';
    btn.title = 'Mark all as read';
    btn.textContent = 'Mark all as read';
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();
      var client = sb();
      var p = profile();
      if (!client || !p || !p.id) return;
      try {
        await client.from('notifications').update({ read: true }).eq('user_id', p.id).eq('read', false);
      } catch (err) {
        try {
          await client.from('notifications').update({ read: true }).eq('user_id', p.id);
        } catch (e2) {}
      }
      var body = document.getElementById('dr-staff-notif-body');
      if (body) {
        body.querySelectorAll('.row.unread').forEach(function (row) {
          row.classList.remove('unread');
        });
      }
      var badge = document.getElementById('dr-staff-notif-count');
      if (badge) {
        badge.textContent = '0';
        badge.classList.remove('on');
      }
      try {
        if (window.DRStaffNotifs && DRStaffNotifs.refresh) DRStaffNotifs.refresh();
      } catch (e3) {}
    });
    if (clearBtn) actions.insertBefore(btn, clearBtn);
    else actions.insertBefore(btn, actions.firstChild);
  }

  /* ========== End-user notifications: Mark all as read (compact) ========== */
  function injectCustomerMarkRead() {
    var panel = document.getElementById('dr-notif-panel');
    if (!panel) return;

    var existing = document.getElementById('dr-notif-mark-all');
    if (existing) return;

    var hd = panel.querySelector('.hd');
    if (!hd) return;
    var actions = hd.querySelector('.hd-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'hd-actions';
      var closeBtn = document.getElementById('dr-notif-close');
      if (closeBtn) hd.insertBefore(actions, closeBtn);
      else hd.appendChild(actions);
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'dr-notif-mark-all';
    btn.title = 'Mark all as read';
    btn.textContent = 'Mark all as read';
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();
      var client = sb();
      var p = profile();
      if (!client || !p || !p.id) return;
      try {
        await client.from('notifications').update({ read: true }).eq('user_id', p.id).eq('read', false);
      } catch (err) {
        try {
          await client.from('notifications').update({ read: true }).eq('user_id', p.id);
        } catch (e2) {}
      }
      var body = document.getElementById('dr-notif-body');
      if (body) {
        body.querySelectorAll('.row.unread').forEach(function (row) {
          row.classList.remove('unread');
        });
      }
      var badge = document.getElementById('dr-notif-count');
      if (badge) {
        badge.textContent = '0';
        badge.classList.remove('on');
      }
    });

    var clearBtn = document.getElementById('dr-notif-clear-all');
    if (clearBtn) actions.insertBefore(btn, clearBtn);
    else actions.appendChild(btn);
  }

  function tick() {
    try {
      ensureCss();
      layoutCommentForm();
      injectStaffMarkRead();
      injectCustomerMarkRead();
    } catch (e) {}
  }

  setInterval(tick, 1200);
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setTimeout(tick, 2500);
  setTimeout(tick, 5000);
})();
