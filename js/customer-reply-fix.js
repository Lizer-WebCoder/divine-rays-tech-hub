/**
 * Customer reply fix v6 — post only; list paint owned by DRCommentsLive
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_CUST_REPLY_FIX_V6 = 1;

  function sb() {
    try {
      if (window.DR && DR.supabase) return DR.supabase;
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
      if (window.sb && window.sb.from) return window.sb;
    } catch (e) {}
    return null;
  }

  function toast(msg, type) {
    var m = String(msg || '');
    if (/user_id.*comments|comments.*user_id|schema cache|assignee_id/i.test(m)) {
      m = 'Could not save reply. Try again.';
    }
    try {
      if (window.DR && DR.toast) return DR.toast(m, type);
    } catch (e) {}
  }

  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
      if (window.__drProfile) return window.__drProfile;
    } catch (e) {}
    return null;
  }

  function listEl() {
    return (
      document.getElementById('cust-comments-list') ||
      document.querySelector('#cust-ticket-detail .comments-list') ||
      document.querySelector('#portal-customer .comments-list') ||
      document.querySelector('.comments-section .comments-list')
    );
  }

  function ticketNumberFromDom() {
    var roots = [
      document.getElementById('cust-ticket-detail'),
      document.getElementById('ticket-detail'),
      document.getElementById('portal-customer'),
      document.body
    ];
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      if (!root) continue;
      var el = root.querySelector('.ticket-id, .meta-chip .ticket-id, [data-ticket-number]');
      if (el) {
        var t = (el.getAttribute('data-ticket-number') || el.textContent || '').trim();
        if (t && /[A-Za-z0-9-]{3,}/.test(t)) return t;
      }
    }
    return null;
  }

  function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));
  }

  function formatDate(d) {
    try {
      var dt = d ? new Date(d) : new Date();
      return dt.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  function unlockBtn(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = btn.dataset._old || 'Send Reply';
  }

  function selfLabel() {
    var p = profile();
    if (!p) return 'You';
    var parts = [];
    var name = p.full_name || p.username || p.name || 'You';
    parts.push(name);
    if (p.branch) parts.push(p.branch);
    if (p.position) parts.push(p.position);
    return parts.join(' · ');
  }

  async function resolveTicketUuid() {
    var candidates = [window.currentCustTicketId, window.__drOpenTicketId, window.__drCustTicketUuid];
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i] && isUuid(candidates[i])) return candidates[i];
    }
    var num = ticketNumberFromDom();
    if (!num) return null;
    if (isUuid(num)) return num;
    var client = sb();
    if (!client) return null;
    try {
      var r = await client.from('tickets').select('id').eq('ticket_number', String(num).toUpperCase()).maybeSingle();
      if (r.data && r.data.id) {
        window.__drCustTicketUuid = r.data.id;
        window.__drOpenTicketId = r.data.id;
        return r.data.id;
      }
      r = await client.from('tickets').select('id').eq('ticket_number', String(num)).maybeSingle();
      if (r.data && r.data.id) return r.data.id;
    } catch (e) {}
    return null;
  }

  async function insertComment(tid, body) {
    var client = sb();
    if (!client) return { error: 'Not connected' };
    var uid = null;
    try {
      var sess = await client.auth.getSession();
      uid = sess.data && sess.data.session && sess.data.session.user && sess.data.session.user.id;
    } catch (e) {}
    var p = profile();
    if (!uid && p && p.id) uid = p.id;
    if (!uid) return { error: 'Not signed in' };

    var attempts = [
      { ticket_id: tid, author_id: uid, body: body, is_internal: false },
      { ticket_id: tid, author_id: uid, body: body },
      { ticket_id: tid, body: body }
    ];
    var lastErr = null;
    for (var i = 0; i < attempts.length; i++) {
      var r = await client.from('comments').insert(attempts[i]).select('*').maybeSingle();
      if (!r.error) return { comment: r.data };
      lastErr = r.error;
      var msg = (r.error && r.error.message) || '';
      if (!/column|schema cache|user_id|assignee_id/i.test(msg) && i === 0) break;
    }
    return { error: (lastErr && lastErr.message) || 'Insert failed' };
  }

  function appendOptimistic(body, authorName) {
    var list = listEl();
    if (!list) return null;
    var empty = list.querySelector('.empty-state, .kb-sub');
    if (empty) empty.remove();
    list.querySelectorAll('[data-optimistic]').forEach(function (el) {
      try {
        el.remove();
      } catch (e) {}
    });
    var div = document.createElement('div');
    div.className = 'comment';
    div.setAttribute('data-optimistic', '1');
    div.innerHTML =
      '<div class="comment-header"><span class="dr-author"></span><span></span></div><div class="comment-body"></div>';
    div.querySelector('.comment-header span:first-child').textContent = authorName || 'You';
    div.querySelector('.comment-header span:last-child').textContent = formatDate(new Date());
    div.querySelector('.comment-body').textContent = body;
    list.appendChild(div);
    return div;
  }

  async function refreshConversation(tid) {
    try {
      if (window.DRCommentsLive && DRCommentsLive.refresh) {
        await DRCommentsLive.refresh();
        return;
      }
    } catch (e) {}
  }

  var submitting = false;

  async function handleSubmit(e) {
    var form = e.target;
    if (!form || form.id !== 'cust-reply-form') return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    if (submitting) return;

    var ta = document.getElementById('cust-reply-text') || form.querySelector('textarea');
    var text = ta ? String(ta.value || '').trim() : '';
    if (!text) {
      toast('Type a reply first', 'error');
      return;
    }

    submitting = true;
    var btn = form.querySelector('button[type="submit"], .btn-primary');
    if (btn) {
      btn.disabled = true;
      btn.dataset._old = btn.textContent || 'Send Reply';
      btn.textContent = 'Sending…';
    }

    try {
      var tid = await resolveTicketUuid();
      if (!tid) {
        toast('Open a ticket first', 'error');
        return;
      }

      appendOptimistic(text, selfLabel());

      var res = await insertComment(tid, text);
      if (res.error) {
        toast(res.error, 'error');
        document.querySelectorAll('[data-optimistic]').forEach(function (el) {
          try {
            el.remove();
          } catch (err) {}
        });
        return;
      }

      if (ta) ta.value = '';
      toast('Reply sent', 'success');
      window.__drCustTicketUuid = tid;
      window.__drOpenTicketId = tid;

      submitting = false;
      unlockBtn(btn);

      refreshConversation(tid).catch(function () {});
    } catch (err) {
      toast((err && err.message) || 'Could not send reply', 'error');
    } finally {
      if (submitting) {
        submitting = false;
        unlockBtn(btn);
      }
    }
  }

  document.addEventListener('submit', handleSubmit, true);

  function bindForm() {
    var form = document.getElementById('cust-reply-form');
    if (!form || form.__drReplyBoundV6) return;
    form.__drReplyBoundV6 = 1;
    form.addEventListener('submit', handleSubmit, true);
  }
  setInterval(bindForm, 1500);
  setTimeout(bindForm, 500);
  setTimeout(bindForm, 2000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var card = t.closest('[data-id]');
      if (card) {
        var id = card.getAttribute('data-id');
        if (id && isUuid(id)) {
          window.__drCustTicketUuid = id;
          window.__drOpenTicketId = id;
        }
      }
    },
    true
  );

  window.DRCustReplyFix = {
    refresh: refreshConversation,
    resolve: resolveTicketUuid,
    ticketNumberFromDom: ticketNumberFromDom
  };
})();
