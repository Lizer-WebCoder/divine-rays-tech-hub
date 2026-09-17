/**
 * Divine Rays — live ticket conversation (no refresh needed)
 * Uses Supabase Realtime + short poll fallback
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_COMMENTS_LIVE) return;
  window.__DR_COMMENTS_LIVE = 1;

  function sb() {
    try { if (window.DR && window.DR.sb) return window.DR.sb(); } catch (e) {}
    return window.__drSb || null;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function formatDate(iso) {
    if (window.DR && typeof window.DR.formatDate === 'function') {
      try { return window.DR.formatDate(iso); } catch (e) {}
    }
    try {
      var d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  function currentTicketId() {
    var detail = document.getElementById('ticket-detail');
    if (detail && (detail.textContent || '').trim()) {
      if (window.__drOpenTicketId) return window.__drOpenTicketId;
      var idAttr = detail.getAttribute('data-ticket-id');
      if (idAttr) return idAttr;
    }
    var cust = document.getElementById('cust-ticket-detail');
    if (cust && cust.getAttribute('data-ticket-id')) return cust.getAttribute('data-ticket-id');
    return window.__drOpenTicketId || null;
  }

  async function resolveTicketIdFromDom() {
    var root = document.getElementById('ticket-detail') || document.getElementById('cust-ticket-detail');
    if (!root) return null;
    var idEl = root.querySelector('.ticket-id');
    var num = idEl ? idEl.textContent.trim() : '';
    if (!num) {
      var m = (root.textContent || '').match(/DR-\d+/);
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
      var r2 = await client.from('tickets').select('id').ilike('ticket_number', num).limit(1);
      return r2.data && r2.data[0] && r2.data[0].id;
    } catch (e) {
      return null;
    }
  }

  function nameCache() {
    return (window.DR && window.DR.nameCache) || window.__drNameCache || {};
  }

  function renderComment(c, forCustomer) {
    if (forCustomer && c.is_internal) return '';
    var cache = nameCache();
    var author =
      (c.author && (c.author.full_name || c.author.username)) ||
      cache[c.author_id] ||
      c.author_name ||
      'User';
    var internal = c.is_internal ? ' internal' : '';
    var tag = c.is_internal ? ' · Internal' : '';
    var status = c.status_change ? ' · → ' + esc(c.status_change) : '';
    return (
      '<div class="comment' + internal + '" data-cid="' + esc(c.id) + '">' +
      '<div class="comment-header"><span>' + esc(author) + tag + '</span>' +
      '<span>' + esc(formatDate(c.created_at)) + status + '</span></div>' +
      '<div class="comment-body">' + esc(c.body) + '</div></div>'
    );
  }

  async function fetchComments(ticketId) {
    var client = sb();
    if (!client || !ticketId) return [];
    try {
      var r = await client
        .from('comments')
        .select('*, author:profiles(full_name,username)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (r.error) {
        var r2 = await client
          .from('comments')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });
        return r2.data || [];
      }
      return r.data || [];
    } catch (e) {
      return [];
    }
  }

  function listEl() {
    return (
      document.getElementById('comments-list') ||
      document.getElementById('cust-comments-list')
    );
  }

  function isCustomerView() {
    return !!(document.getElementById('cust-comments-list') && document.getElementById('cust-comments-list').offsetParent !== null);
  }

  var lastSig = '';
  var activeTicketId = null;
  var channel = null;

  async function refreshList(force) {
    var list = listEl();
    if (!list) return;
    var tid = activeTicketId || currentTicketId() || (await resolveTicketIdFromDom());
    if (!tid) return;
    activeTicketId = tid;
    window.__drOpenTicketId = tid;

    var comments = await fetchComments(tid);
    var cust = isCustomerView() || list.id === 'cust-comments-list';
    var visible = cust ? comments.filter(function (c) { return !c.is_internal; }) : comments;
    var sig = visible.map(function (c) { return c.id + ':' + (c.body || '').length; }).join('|');
    if (!force && sig === lastSig) return;
    lastSig = sig;

    if (!visible.length) {
      if (!list.querySelector('.comment')) {
        list.innerHTML = '<p class="kb-sub" style="margin:0">No updates yet.</p>';
      }
      return;
    }

    var ordered = cust ? visible : visible.slice().reverse();
    list.innerHTML = ordered.map(function (c) { return renderComment(c, cust); }).join('');
  }

  function unsub() {
    if (channel) {
      try {
        var client = sb();
        if (client) client.removeChannel(channel);
      } catch (e) {}
      channel = null;
    }
  }

  function subscribe(ticketId) {
    unsub();
    var client = sb();
    if (!client || !ticketId || !client.channel) return;
    try {
      channel = client
        .channel('comments-' + ticketId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: 'ticket_id=eq.' + ticketId
          },
          function () {
            refreshList(true);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('[comments-live] realtime', e);
    }
  }

  async function sync() {
    var list = listEl();
    if (!list) {
      activeTicketId = null;
      lastSig = '';
      unsub();
      return;
    }
    var tid = await resolveTicketIdFromDom();
    if (!tid) return;
    if (tid !== activeTicketId) {
      activeTicketId = tid;
      lastSig = '';
      window.__drOpenTicketId = tid;
      subscribe(tid);
    }
    await refreshList(false);
  }

  document.addEventListener(
    'submit',
    function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'comment-form' || (t.classList && t.classList.contains('comment-form'))) {
        setTimeout(function () { refreshList(true); }, 400);
        setTimeout(function () { refreshList(true); }, 1200);
      }
    },
    true
  );

  setInterval(sync, 2500);
  setTimeout(sync, 800);
  setTimeout(sync, 2000);

  ['ticket-detail', 'cust-ticket-detail', 'comments-list', 'cust-comments-list'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    try {
      new MutationObserver(function () {
        lastSig = '';
        sync();
      }).observe(el, { childList: true, subtree: false });
    } catch (e) {}
  });

  window.DRCommentsLive = { refresh: function () { return refreshList(true); }, sync: sync };
})();
