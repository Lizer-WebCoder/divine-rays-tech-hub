/**
 * Customer reply fix v2 — resolve ticket from DOM (.ticket-id), real insert + refresh
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CUST_REPLY_FIX_V2) return;
  window.__DR_CUST_REPLY_FIX_V2 = 1;

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
      c.style.cssText =
        'position:fixed;bottom:1.25rem;right:1.25rem;z-index:100000;display:flex;flex-direction:column;gap:.5rem';
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
    setTimeout(function () {
      try { e.remove(); } catch (err) {}
    }, 3500);
  }

  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
      if (window.__drProfile) return window.__drProfile;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
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
    var pt = document.getElementById('page-title');
    if (pt) {
      var ptt = (pt.textContent || '').trim();
      if (/^DR-/i.test(ptt) || /^[A-Z]{2,}-\d+/i.test(ptt)) return ptt;
    }
    return null;
  }

  function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));
  }

  async function resolveTicketUuid() {
    var candidates = [
      window.currentCustTicketId,
      window.__drOpenTicketId,
      window.__drCustTicketUuid
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i] && isUuid(candidates[i])) return candidates[i];
    }

    var num = ticketNumberFromDom();
    for (var j = 0; j < candidates.length; j++) {
      if (candidates[j] && !isUuid(candidates[j])) num = num || candidates[j];
    }
    if (!num) return null;
    if (isUuid(num)) return num;

    var client = sb();
    if (!client) return null;
    try {
      var r = await client
        .from('tickets')
        .select('id,ticket_number')
        .eq('ticket_number', String(num).toUpperCase())
        .maybeSingle();
      if (r.data && r.data.id) {
        window.__drCustTicketUuid = r.data.id;
        window.__drOpenTicketId = r.data.id;
        return r.data.id;
      }
      r = await client.from('tickets').select('id').eq('ticket_number', String(num)).maybeSingle();
      if (r.data && r.data.id) {
        window.__drCustTicketUuid = r.data.id;
        window.__drOpenTicketId = r.data.id;
        return r.data.id;
      }
      r = await client.from('tickets').select('id').eq('id', num).maybeSingle();
      if (r.data && r.data.id) return r.data.id;
    } catch (e) {
      console.warn('[cust-reply-fix] resolve', e);
    }
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
      document.querySelector('#cust-ticket-detail .comments-list') ||
      document.querySelector('.comments-section .comments-list');
    if (!list) return null;
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
      '<div class="comment-header"><span></span><span></span></div><div class="comment-body"></div>';
    div.querySelector('.comment-header span:first-child').textContent = authorName || 'You';
    div.querySelector('.comment-header span:last-child').textContent = ts;
    div.querySelector('.comment-body').textContent = body;
    list.appendChild(div);
    try { div.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    return div;
  }

  async function refreshConversation(tid) {
    try {
      if (window.DRCommentsLive && DRCommentsLive.refresh) await DRCommentsLive.refresh();
    } catch (e) {}
    try {
      if (typeof window.openCustomerTicket === 'function') await window.openCustomerTicket(tid);
    } catch (e) {}
    try {
      var client = sb();
      var list = document.getElementById('cust-comments-list');
      if (!client || !list || !tid) return;
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
      if (!rows.length) return;
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
        var num = ticketNumberFromDom();
        console.warn('[cust-reply-fix] no ticket id. DOM number=', num);
        toast(
          num
            ? 'Could not load ticket ' + num + '. Hard refresh and try again.'
            : 'Open a ticket first',
          'error'
        );
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
      window.__drCustTicketUuid = tid;
      window.__drOpenTicketId = tid;
      try { window.currentCustTicketId = tid; } catch (e) {}
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
    if (!form || form.__drReplyBoundV2) return;
    form.__drReplyBoundV2 = 1;
    form.addEventListener('submit', handleSubmit, true);
  }
  setInterval(bindForm, 1500);
  setTimeout(bindForm, 500);
  setTimeout(bindForm, 2000);
  setTimeout(bindForm, 4000);

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      var card = t.closest && t.closest('[data-id]');
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
