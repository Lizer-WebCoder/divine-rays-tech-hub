/**
 * Customer reply fix — real insert + refresh, no false "Reply sent"
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_REPLY_FIX) return;
  window.__DR_CUST_REPLY_FIX = 1;

  function sb() {
    try {
      if (window.DR && DR.supabase) return DR.supabase;
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
      if (window.sb && window.sb.from) return window.sb;
    } catch (e) {}
    return null;
  }

  function toast(msg, type) {
    try {
      if (window.DR && DR.toast) return DR.toast(msg, type);
    } catch (e) {}
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText = 'position:fixed;bottom:1.25rem;right:1.25rem;z-index:100000;display:flex;flex-direction:column;gap:.5rem';
      document.body.appendChild(c);
    }
    var e = document.createElement('div');
    e.className = 'toast ' + (type || 'info');
    e.textContent = msg;
    e.style.cssText =
      'background:#1a1830;border:1px solid rgba(167,139,250,.4);color:#eeeef6;padding:.65rem 1rem;border-radius:10px;font-size:.85rem;box-shadow:0 8px 24px rgba(0,0,0,.35)';
    if (type === 'error') e.style.borderColor = 'rgba(239,68,68,.5)';
    if (type === 'success') e.style.borderColor = 'rgba(52,211,153,.45)';
    c.appendChild(e);
    setTimeout(function () { try { e.remove(); } catch (err) {} }, 3500);
  }

  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
      if (window.__drProfile) return window.__drProfile;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function ticketId() {
    if (window.currentCustTicketId) return window.currentCustTicketId;
    if (window.__drOpenTicketId) return window.__drOpenTicketId;
    var detail = document.getElementById('cust-ticket-detail');
    if (detail) {
      var chip = detail.querySelector('.ticket-id, [data-ticket-id]');
      if (chip && chip.getAttribute('data-ticket-id')) return chip.getAttribute('data-ticket-id');
    }
    return null;
  }

  async function resolveTicketUuid() {
    var id = ticketId();
    if (!id) return null;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))) {
      return id;
    }
    var client = sb();
    if (!client) return null;
    try {
      var r = await client.from('tickets').select('id').eq('ticket_number', id).maybeSingle();
      if (r.data && r.data.id) return r.data.id;
      r = await client.from('tickets').select('id').eq('id', id).maybeSingle();
      if (r.data && r.data.id) return r.data.id;
    } catch (e) {}
    return id;
  }

  async function insertComment(tid, body) {
    var client = sb();
    if (!client) return { error: 'Not connected' };
    var p = profile();
    var uid = null;
    try {
      var sess = await client.auth.getSession();
      uid = sess.data && sess.data.session && sess.data.session.user && sess.data.session.user.id;
    } catch (e) {}
    if (!uid && p && p.id) uid = p.id;
    if (!uid) return { error: 'Not signed in' };

    var row = {
      ticket_id: tid,
      author_id: uid,
      body: body,
      is_internal: false
    };
    var r = await client.from('comments').insert(row).select().single();
    if (r.error) {
      var row2 = {
        ticket_id: tid,
        user_id: uid,
        author_id: uid,
        body: body,
        is_internal: false
      };
      var r2 = await client.from('comments').insert(row2).select().single();
      if (r2.error) return { error: r2.error.message || r.error.message || 'Insert failed' };
      return { comment: r2.data };
    }
    return { comment: r.data };
  }

  function appendOptimistic(body, authorName) {
    var list =
      document.getElementById('cust-comments-list') ||
      document.querySelector('#cust-ticket-detail .comments-list');
    if (!list) return;
    var empty = list.querySelector('.empty-state, .kb-sub');
    if (empty) empty.remove();
    var div = document.createElement('div');
    div.className = 'comment';
    div.setAttribute('data-optimistic', '1');
    var now = new Date();
    var ts =
      now.toLocaleString(undefined, { month: 'short', day: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    div.innerHTML =
      '<div class="comment-header"><span>' +
      (authorName || 'You') +
      '</span><span>' +
      ts +
      '</span></div><div class="comment-body"></div>';
    div.querySelector('.comment-body').textContent = body;
    list.appendChild(div);
    try {
      div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
  }

  async function refreshConversation(tid) {
    try {
      if (window.DRCommentsLive && DRCommentsLive.refresh) {
        await DRCommentsLive.refresh();
      }
    } catch (e) {}
    try {
      if (typeof window.openCustomerTicket === 'function') {
        await window.openCustomerTicket(tid);
      }
    } catch (e) {}
    try {
      var client = sb();
      var list = document.getElementById('cust-comments-list');
      if (client && list && tid) {
        var r = await client
          .from('comments')
          .select('*, author:profiles(full_name,username)')
          .eq('ticket_id', tid)
          .order('created_at', { ascending: true });
        if (r.error) {
          r = await client
            .from('comments')
            .select('*')
            .eq('ticket_id', tid)
            .order('created_at', { ascending: true });
        }
        var rows = (r.data || []).filter(function (c) { return !c.is_internal; });
        if (rows.length) {
          list.innerHTML = rows
            .map(function (c) {
              var author =
                (c.author && (c.author.full_name || c.author.username)) ||
                c.author_name ||
                'User';
              var dt = c.created_at
                ? new Date(c.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                : '';
              return (
                '<div class="comment" data-cid="' +
                (c.id || '') +
                '"><div class="comment-header"><span>' +
                String(author).replace(/</g, '<') +
                '</span><span>' +
                String(dt).replace(/</g, '<') +
                '</span></div><div class="comment-body">' +
                String(c.body || '').replace(/</g, '<') +
                '</div></div>'
              );
            })
            .join('');
        }
      }
    } catch (e) {
      console.warn('[cust-reply-fix] refresh', e);
    }
  }

  var submitting = false;

  async function handleSubmit(e) {
    var form = e.target;
    if (!form || form.id !== 'cust-reply-form') return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (submitting) return;

    var ta = document.getElementById('cust-reply-text');
    var text = ta ? String(ta.value || '').trim() : '';
    if (!text) {
      toast('Type a reply first', 'error');
      return;
    }

    submitting = true;
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.dataset._old = btn.textContent;
      btn.textContent = 'Sending…';
    }

    try {
      var tid = await resolveTicketUuid();
      if (!tid) {
        toast('Open a ticket first', 'error');
        return;
      }
      var p = profile();
      var name = (p && (p.full_name || p.username || p.name)) || 'You';
      appendOptimistic(text, name);

      var res = await insertComment(tid, text);
      if (res.error) {
        toast(res.error, 'error');
        console.warn('[cust-reply-fix] insert failed', res.error);
        document.querySelectorAll('#cust-comments-list [data-optimistic]').forEach(function (el) {
          try { el.remove(); } catch (err) {}
        });
        return;
      }

      if (ta) ta.value = '';
      toast('Reply sent', 'success');
      window.currentCustTicketId = tid;
      window.__drOpenTicketId = tid;
      await refreshConversation(tid);
      setTimeout(function () { refreshConversation(tid); }, 800);
    } catch (err) {
      console.error('[cust-reply-fix]', err);
      toast((err && err.message) || 'Could not send reply', 'error');
    } finally {
      submitting = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset._old || 'Send Reply';
      }
    }
  }

  document.addEventListener('submit', handleSubmit, true);

  function bindForm() {
    var form = document.getElementById('cust-reply-form');
    if (!form || form.__drReplyBound) return;
    form.__drReplyBound = 1;
    form.addEventListener('submit', handleSubmit, true);
  }
  setInterval(bindForm, 2000);
  setTimeout(bindForm, 600);
  setTimeout(bindForm, 2000);

  window.DRCustReplyFix = { refresh: refreshConversation };
})();
