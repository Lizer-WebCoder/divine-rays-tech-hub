/**
 * Divine Rays — live comments v7 (Messenger order)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_COMMENTS_LIVE >= 7) return;
  window.__DR_COMMENTS_LIVE = 7;
  window.__DR_COMMENTS_LIVE_V2 = 1;

  var channel = null;
  var activeTicketId = null;
  var lastSig = '';
  var lastHtml = '';
  var busy = false;
  var ignoreMutUntil = 0;
  var debounceTimer = null;
  var profileMap = {};
  var DEVELOPERS = { kirzhian: 1, jamesjerlow123: 1, liya: 1 };

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
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
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

  function roleLabel(role, username) {
    var r = String(role || '').toLowerCase().trim();
    var un = String(username || '').toLowerCase().trim();
    if (DEVELOPERS[un] || r === 'developer') return 'DEVELOPER';
    if (r === 'admin' || r === 'administrator') return 'ADMIN';
    if (r === 'agent' || r === 'staff') return 'AGENT';
    return '';
  }

  function buildLabel(info) {
    if (!info) return '';
    var parts = [];
    var name = String(info.name || '').trim();
    if (name && !/^user$/i.test(name)) parts.push(name);
    var staff = roleLabel(info.role, info.username);
    if (staff) {
      parts.push(staff);
      if (info.branch) parts.push(String(info.branch).trim());
    } else {
      if (info.branch) parts.push(String(info.branch).trim());
      if (info.position) parts.push(String(info.position).trim());
    }
    return parts.join(' · ');
  }

  function storeProfile(p) {
    if (!p || !p.id) return null;
    var prev = profileMap[p.id] || {};
    var name = p.full_name || p.username || p.name || '';
    if (prev.name && prev.name !== 'User' && (!name || /^user$/i.test(name))) name = prev.name;
    if (!name) name = prev.name || '';
    var info = {
      name: name,
      username: p.username || prev.username || '',
      branch: p.branch != null && p.branch !== '' ? p.branch : prev.branch || '',
      position: p.position != null && p.position !== '' ? p.position : prev.position || '',
      role: p.role != null && p.role !== '' ? p.role : prev.role || ''
    };
    info.label = buildLabel(info);
    if (!info.label && prev.label) info.label = prev.label;
    profileMap[p.id] = info;
    return info;
  }

  function authorLabel(c) {
    if (!c) return 'User';
    var aid = c.author_id || c.created_by || null;
    if (aid && profileMap[aid] && profileMap[aid].label) return profileMap[aid].label;
    if (c.author) {
      var info = storeProfile({
        id: aid || 'tmp',
        full_name: c.author.full_name,
        username: c.author.username,
        branch: c.author.branch,
        position: c.author.position,
        role: c.author.role
      });
      if (info && info.label) return info.label;
    }
    if (c.author_name && !/^user$/i.test(c.author_name)) return c.author_name;
    var me = profile();
    if (me && aid && me.id === aid) {
      storeProfile(me);
      if (profileMap[aid] && profileMap[aid].label) return profileMap[aid].label;
      return me.full_name || me.username || 'You';
    }
    if (aid && profileMap[aid] && profileMap[aid].name) return profileMap[aid].name;
    return 'User';
  }

  async function loadProfiles(ids) {
    var client = sb();
    if (!client || !ids || !ids.length) return;
    var missing = ids.filter(function (id) {
      if (!id) return false;
      var p = profileMap[id];
      if (!p || !p.name || p.name === 'User') return true;
      if (!p._loaded) return true;
      return false;
    });
    if (!missing.length) return;
    var tries = [
      'id,full_name,username,name,branch,position,role',
      'id,full_name,username,branch,position,role',
      'id,full_name,username,branch,role',
      'id,full_name,username,name,role',
      'id,full_name,username,name'
    ];
    for (var t = 0; t < tries.length; t++) {
      try {
        var r = await client.from('profiles').select(tries[t]).in('id', missing);
        if (!r.error && r.data) {
          r.data.forEach(function (p) {
            var info = storeProfile(p);
            if (info) info._loaded = true;
          });
          break;
        }
      } catch (e) {}
    }
    missing.forEach(function (id) {
      if (profileMap[id]) profileMap[id]._loaded = true;
    });
  }

  function injectCss() {
    var el = document.getElementById('dr-comments-live-css');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dr-comments-live-css';
      document.head.appendChild(el);
    }
    el.textContent = [
      '.dr-cdel{float:right;font-size:.72rem;padding:.15rem .45rem;border-radius:6px;border:1px solid rgba(239,68,68,.35);background:rgba(239,68,68,.12);color:#fca5a5;cursor:pointer;font-weight:600}',
      'html[data-theme="light"] .dr-cdel{color:#b91c1c;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3)}',
      '.comment.internal{border-left:3px solid #f59e0b!important}',
      '.comment-header .dr-author{font-weight:600;color:inherit}'
    ].join('');
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
    if (d && d.getAttribute('data-ticket-id')) return d.getAttribute('data-ticket-id');
    var cust = document.getElementById('cust-ticket-detail');
    if (cust && cust.getAttribute('data-ticket-id')) return cust.getAttribute('data-ticket-id');
    return window.__drOpenTicketId || window.__drCustTicketUuid || null;
  }

  async function resolveTicketIdFromDom() {
    var early = currentTicketId();
    if (early) return early;
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
      var r = await client.from('tickets').select('id, ticket_number').eq('ticket_number', num).limit(1);
      if (!r.error && r.data && r.data[0]) return r.data[0].id;
    } catch (e) {}
    return null;
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
    var label = authorLabel(c) || 'User';
    var internal = c.is_internal ? ' internal' : '';
    var tag = c.is_internal ? ' · Internal' : '';
    var status = c.status_change ? ' · → ' + esc(c.status_change) : '';
    var delBtn = canDelete(c)
      ? '<button type="button" class="dr-cdel" data-del-cid="' + esc(c.id) + '" title="Delete this note">Delete</button>'
      : '';
    return (
      '<div class="comment' + internal + '" data-cid="' + esc(c.id) + '" data-author="' + esc(c.author_id || '') + '">' +
      delBtn +
      '<div class="comment-header"><span class="dr-author">' + esc(label) + tag + '</span><span>' +
      esc(formatDate(c.created_at)) + status + '</span></div>' +
      '<div class="comment-body">' + esc(c.body) + '</div></div>'
    );
  }

  async function fetchComments(ticketId) {
    var client = sb();
    if (!client || !ticketId) return [];
    try {
      var r = await client.from('comments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
      if (r.error) return [];
      var rows = r.data || [];
      var ids = rows.map(function (c) { return c.author_id || c.created_by; }).filter(Boolean);
      await loadProfiles(ids);
      return rows;
    } catch (e) {
      return [];
    }
  }

  async function postComment(ticketId, body, isInternal) {
    var client = sb();
    var me = profile();
    if (!client || !ticketId || !body) return { error: { message: 'Missing ticket or message' } };
    var payload = { ticket_id: ticketId, body: body, is_internal: !!isInternal };
    if (me && me.id) {
      payload.author_id = me.id;
      storeProfile(me);
    }
    var ins = await client.from('comments').insert(payload).select('*').maybeSingle();
    if (ins.error && /column|schema cache/i.test(ins.error.message || '')) {
      var minimal = { ticket_id: ticketId, body: body };
      if (me && me.id) minimal.author_id = me.id;
      ins = await client.from('comments').insert(minimal).select('*').maybeSingle();
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
          lastHtml = '';
          scheduleRefresh(true, 50);
        } catch (e) {
          alert((e && e.message) || 'Could not delete');
        }
      });
    });
  }

  function paint(list, html) {
    if (!list) return;
    if (html === lastHtml) return;
    ignoreMutUntil = Date.now() + 2000;
    lastHtml = html;
    list.innerHTML = html;
    bindDeleteButtons(list);
    // Keep newest message in view (Messenger-style)
    try {
      var last = list.lastElementChild;
      if (last) last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (e) {}
  }

  async function refreshList(force) {
    if (busy) return;
    injectCss();
    var list = listEl();
    if (!list) return;
    var tid = activeTicketId || currentTicketId() || (await resolveTicketIdFromDom());
    if (!tid) return;
    activeTicketId = tid;
    window.__drOpenTicketId = tid;
    busy = true;
    try {
      var comments = await fetchComments(tid);
      var cust = isCustomerView() || list.id === 'cust-comments-list';
      var visible = cust
        ? comments.filter(function (c) {
            return !c.is_internal;
          })
        : comments;
      var sig = visible
        .map(function (c) {
          return c.id + ':' + (c.body || '').length + ':' + authorLabel(c);
        })
        .join('|');
      if (!force && sig === lastSig && lastHtml) return;
      lastSig = sig;
      if (!visible.length) {
        paint(list, '<p class="kb-sub" style="margin:0">No updates yet.</p>');
        return;
      }
      // Messenger order: oldest at top, newest at bottom (no reverse)
      paint(
        list,
        visible
          .map(function (c) {
            return renderComment(c, cust);
          })
          .join('')
      );
    } finally {
      busy = false;
    }
  }

  function scheduleRefresh(force, delay) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      refreshList(!!force);
    }, delay == null ? 250 : delay);
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
          { event: '*', schema: 'public', table: 'comments', filter: 'ticket_id=eq.' + ticketId },
          function () {
            lastSig = '';
            scheduleRefresh(true, 300);
          }
        )
        .subscribe();
    } catch (e) {}
  }

  async function sync() {
    var list = listEl();
    if (!list) {
      activeTicketId = null;
      lastSig = '';
      lastHtml = '';
      unsub();
      return;
    }
    var tid = await resolveTicketIdFromDom();
    if (!tid) return;
    if (tid !== activeTicketId) {
      activeTicketId = tid;
      lastSig = '';
      lastHtml = '';
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
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset._old || 'Send Reply';
      }
      toast('Reply sent', 'success');
      lastSig = '';
      lastHtml = '';
      scheduleRefresh(true, 100);
    } catch (err) {
      var m = (err && err.message) || 'Could not send reply';
      if (/user_id|assignee_id|schema cache/i.test(m)) m = 'Comment save failed. Try again.';
      toast(m, 'error');
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
      if (t.id === 'cust-reply-form' && window.DRCustReplyFix) {
        scheduleRefresh(true, 500);
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
    scheduleRefresh(true, 200);
  });

  injectCss();
  setInterval(function () {
    if (Date.now() < ignoreMutUntil) return;
    sync();
  }, 10000);
  setTimeout(sync, 1200);

  window.DRCommentsLive = {
    refresh: function () {
      lastSig = '';
      lastHtml = '';
      return refreshList(true);
    },
    sync: sync,
    post: postComment,
    profileMap: profileMap
  };
})();
