/**
 * Divine Rays — live comments (schema-safe: author_id only, never user_id)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  // Allow re-load over older pin
  window.__DR_COMMENTS_LIVE = 3;

  var channel = null;
  var activeTicketId = null;
  var lastSig = '';
  var nameMap = {};

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
  function myId() {
    var p = profile();
    return (p && p.id) || null;
  }
  function isStaff() {
    var p = profile();
    var r = p && String(p.role || '').toLowerCase();
    return r === 'agent' || r === 'admin';
  }
  function isCustomerView() {
    var pc = document.getElementById('portal-customer');
    return !!(pc && pc.classList.contains('active'));
  }
  function toast(msg, type) {
    if (window.DR && window.DR.toast) return window.DR.toast(msg, type);
    try {
      console.log('[comments]', type || 'info', msg);
    } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function formatDate(d) {
    try {
      return new Date(d).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  function injectCss() {
    if (document.getElementById('dr-comments-live-css')) return;
    var s = document.createElement('style');
    s.id = 'dr-comments-live-css';
    s.textContent = [
      '.dr-cdel{float:right;font-size:.72rem;padding:.15rem .45rem;border-radius:6px;border:1px solid rgba(239,68,68,.35);background:rgba(239,68,68,.12);color:#fca5a5;cursor:pointer;font-weight:600}',
      'html[data-theme="light"] .dr-cdel{color:#b91c1c;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3)}',
      '.comment.internal{border-left:3px solid #f59e0b!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function listEl() {
    return (
      document.querySelector('#ticket-detail .comments-list') ||
      document.querySelector('#cust-ticket-detail .comments-list') ||
      document.getElementById('comments-list') ||
      document.getElementById('cust-comments-list')
    );
  }

  function currentTicketId() {
    var d = document.getElementById('ticket-detail');
    if (d) {
      var idAttr = d.getAttribute('data-ticket-id');
      if (idAttr) return idAttr;
    }
    var cust = document.getElementById('cust-ticket-detail');
    if (cust && cust.getAttribute('data-ticket-id')) return cust.getAttribute('data-ticket-id');
    return window.__drOpenTicketId || window.__drCustTicketUuid || null;
  }

  async function resolveTicketIdFromDom() {
    var root = document.getElementById('ticket-detail') || document.getElementById('cust-ticket-detail');
    if (!root) return null;
    var early = root.getAttribute('data-ticket-id') || window.__drOpenTicketId || window.__drCustTicketUuid;
    if (early) return early;
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
      var r = await client.from('tickets').select('id, ticket_number').eq('ticket_number', num).limit(1);
      if (!r.error && r.data && r.data[0]) return r.data[0].id;
      var r2 = await client
        .from('tickets')
        .select('id, ticket_number')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!r2.error && r2.data) {
        var hit = r2.data.find(function (t) {
          return String(t.ticket_number || '') === num || String(t.id) === num;
        });
        if (hit) return hit.id;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function authorName(c) {
    if (!c) return 'User';
    if (c.author && (c.author.full_name || c.author.username)) {
      return c.author.full_name || c.author.username;
    }
    var aid = c.author_id || c.created_by || null;
    if (aid && nameMap[aid]) return nameMap[aid];
    if (c.author_name) return c.author_name;
    var me = profile();
    if (me && aid && me.id === aid) return me.full_name || me.username || me.name || 'You';
    return 'User';
  }

  async function loadNames(ids) {
    var client = sb();
    if (!client || !ids || !ids.length) return;
    var missing = ids.filter(function (id) {
      return id && !nameMap[id];
    });
    if (!missing.length) return;
    try {
      var r = await client.from('profiles').select('id,full_name,username,name').in('id', missing);
      if (!r.error && r.data) {
        r.data.forEach(function (p) {
          nameMap[p.id] = p.full_name || p.username || p.name || 'User';
        });
      }
    } catch (e) {}
  }

  function canDelete(c) {
    var uid = myId();
    if (!uid) return false;
    if (c.author_id && c.author_id === uid) return true;
    if (c.created_by && c.created_by === uid) return true;
    if (isStaff()) return true;
    return false;
  }

  function renderComment(c, forCustomer) {
    if (forCustomer && c.is_internal) return '';
    var author = authorName(c);
    var internal = c.is_internal ? ' internal' : '';
    var tag = c.is_internal ? ' · Internal' : '';
    var status = c.status_change ? ' · → ' + esc(c.status_change) : '';
    var delBtn = canDelete(c)
      ? '<button type="button" class="dr-cdel" data-del-cid="' +
        esc(c.id) +
        '" title="Delete this note">Delete</button>'
      : '';
    return (
      '<div class="comment' +
      internal +
      '" data-cid="' +
      esc(c.id) +
      '" data-author="' +
      esc(c.author_id || '') +
      '">' +
      delBtn +
      '<div class="comment-header"><span>' +
      esc(author) +
      tag +
      '</span>' +
      '<span>' +
      esc(formatDate(c.created_at)) +
      status +
      '</span></div>' +
      '<div class="comment-body">' +
      esc(c.body) +
      '</div></div>'
    );
  }

  async function fetchComments(ticketId) {
    var client = sb();
    if (!client || !ticketId) return [];
    try {
      var r = await client
        .from('comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (r.error) {
        console.warn('[comments-live] fetch', r.error.message || r.error);
        return [];
      }
      var rows = r.data || [];
      var ids = rows
        .map(function (c) {
          return c.author_id || c.created_by;
        })
        .filter(Boolean);
      await loadNames(ids);
      return rows;
    } catch (e) {
      console.warn('[comments-live] fetch', e);
      return [];
    }
  }

  async function postComment(ticketId, body, isInternal) {
    var client = sb();
    var me = profile();
    if (!client || !ticketId || !body) {
      return { error: { message: 'Missing ticket or message' } };
    }
    var payload = {
      ticket_id: ticketId,
      body: body,
      is_internal: !!isInternal
    };
    if (me && me.id) payload.author_id = me.id;

    var ins = await client.from('comments').insert(payload).select('*').maybeSingle();
    if (ins.error) {
      var msg = (ins.error.message || '') + '';
      if (/column|schema cache/i.test(msg)) {
        var minimal = { ticket_id: ticketId, body: body };
        if (me && me.id) minimal.author_id = me.id;
        ins = await client.from('comments').insert(minimal).select('*').maybeSingle();
      }
    }
    return ins;
  }

  function bindDeleteButtons(list) {
    if (!list) return;
    list.querySelectorAll('.dr-cdel').forEach(function (btn) {
      if (btn._drBound) return;
      btn._drBound = true;
      btn.addEventListener('click', async function () {
        var cid = btn.getAttribute('data-del-cid');
        if (!cid || !confirm('Delete this note?')) return;
        var client = sb();
        if (!client) return;
        try {
          var del = await client.from('comments').delete().eq('id', cid);
          if (del.error) throw del.error;
          lastSig = '';
          refreshList(true);
        } catch (e) {
          alert((e && e.message) || 'Could not delete');
        }
      });
    });
  }

  async function refreshList(force) {
    injectCss();
    var list = listEl();
    if (!list) return;
    var tid = activeTicketId || currentTicketId() || (await resolveTicketIdFromDom());
    if (!tid) return;
    activeTicketId = tid;
    window.__drOpenTicketId = tid;

    var comments = await fetchComments(tid);
    var cust = isCustomerView() || list.id === 'cust-comments-list';
    var visible = cust
      ? comments.filter(function (c) {
          return !c.is_internal;
        })
      : comments;
    var sig = visible
      .map(function (c) {
        return c.id + ':' + (c.body || '').length;
      })
      .join('|');
    if (!force && sig === lastSig) return;
    lastSig = sig;

    if (!visible.length) {
      list.innerHTML = '<p class="kb-sub" style="margin:0">No updates yet.</p>';
      return;
    }

    // Customer: chronological (oldest → newest). Staff: newest first.
    var ordered = cust ? visible : visible.slice().reverse();
    list.innerHTML = ordered
      .map(function (c) {
        return renderComment(c, cust);
      })
      .join('');
    bindDeleteButtons(list);
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
            lastSig = '';
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

  async function handleReplySubmit(form, e) {
    if (!form) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

    var ta =
      form.querySelector('#comment-text') ||
      form.querySelector('#cust-reply-text') ||
      form.querySelector('textarea');
    var body = ta ? String(ta.value || '').trim() : '';
    if (!body) {
      toast('Write a reply first', 'error');
      return;
    }

    var internalEl = form.querySelector('#comment-internal');
    var isInternal = !!(internalEl && internalEl.checked);

    var tid = currentTicketId() || activeTicketId || (await resolveTicketIdFromDom());
    if (!tid) {
      toast('Open a ticket first', 'error');
      return;
    }

    var btn = form.querySelector('button[type="submit"], .btn-primary');
    if (btn) {
      btn.disabled = true;
      btn.dataset._old = btn.textContent;
      btn.textContent = 'Sending…';
    }

    try {
      var res = await postComment(tid, body, isInternal);
      if (res.error) throw res.error;
      if (ta) ta.value = '';
      if (internalEl) internalEl.checked = false;
      lastSig = '';
      await refreshList(true);
      toast('Reply sent', 'success');
      try {
        window.dispatchEvent(new CustomEvent('dr-comments-updated', { detail: { ticketId: tid } }));
      } catch (e2) {}
    } catch (err) {
      var m = (err && err.message) || 'Could not send reply';
      if (/user_id|assignee_id|schema cache/i.test(m)) {
        m = 'Comment save failed. Try again.';
      }
      toast(m, 'error');
      console.warn('[comments-live] post', err);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset._old || 'Send Reply';
      }
    }
  }

  document.addEventListener(
    'submit',
    function (e) {
      var t = e.target;
      if (!t) return;
      // Customer form owned by DRCustReplyFix — just refresh after it posts
      if (t.id === 'cust-reply-form' && window.DRCustReplyFix) {
        setTimeout(function () {
          lastSig = '';
          refreshList(true);
        }, 400);
        setTimeout(function () {
          lastSig = '';
          refreshList(true);
        }, 1200);
        return;
      }
      var isCommentForm =
        t.id === 'comment-form' ||
        t.id === 'cust-reply-form' ||
        (t.classList && t.classList.contains('comment-form'));
      if (!isCommentForm) return;
      handleReplySubmit(t, e);
    },
    true
  );

  window.addEventListener('dr-comments-updated', function () {
    lastSig = '';
    setTimeout(function () {
      refreshList(true);
    }, 100);
    setTimeout(function () {
      refreshList(true);
    }, 700);
  });

  (function patchToast() {
    function wrap(fn) {
      return function (msg, type) {
        var m = String(msg || '');
        if (/user_id.*comments|comments.*user_id|schema cache|assignee_id/i.test(m)) {
          console.warn('[comments-live] suppressed schema toast:', m);
          return;
        }
        return fn.apply(this, arguments);
      };
    }
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (window.DR && window.DR.toast && !window.DR.toast.__drCommentsPatched) {
        window.DR.toast = wrap(window.DR.toast);
        window.DR.toast.__drCommentsPatched = true;
        clearInterval(iv);
      }
      if (tries > 40) clearInterval(iv);
    }, 250);
  })();

  injectCss();
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

  window.DRCommentsLive = {
    refresh: function () {
      lastSig = '';
      return refreshList(true);
    },
    sync: sync,
    post: postComment
  };
})();
