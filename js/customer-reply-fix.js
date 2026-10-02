/**
 * Customer reply fix v4 — instant UI update after post (no full reload)
 * Credit: Boyz at the Back · All Rights Reserved
 */
(function () {
  'use strict';
  window.__DR_CUST_REPLY_FIX_V4 = 1;

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
      console.warn('[cust-reply-fix] schema noise:', m);
      m = 'Could not save reply. Try again.';
    }
    try {
      if (window.DR && DR.toast) return DR.toast(m, type);
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
    e.textContent = m;
    e.style.cssText =
      'background:#1a1830;border:1px solid rgba(167,139,250,.4);color:#eeeef6;padding:.65rem 1rem;border-radius:10px;font-size:.85rem;box-shadow:0 8px 24px rgba(0,0,0,.35)';
    if (type === 'error') e.style.borderColor = 'rgba(239,68,68,.5)';
    if (type === 'success') e.style.borderColor = 'rgba(52,211,153,.45)';
    c.appendChild(e);
    setTimeout(function () {
      try {
        e.remove();
      } catch (err) {}
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

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
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

  function renderRows(rows, nameMap) {
    var list = listEl();
    if (!list) return;
    nameMap = nameMap || {};
    if (!rows.length) {
      list.innerHTML = '<p class="kb-sub" style="margin:0">No updates yet.</p>';
      return;
    }
    list.innerHTML = rows
      .map(function (c) {
        var author =
          nameMap[c.author_id] ||
          c.author_name ||
          (c.author && (c.author.full_name || c.author.username)) ||
          'User';
        return (
          '<div class="comment" data-cid="' +
          esc(c.id) +
          '"><div class="comment-header"><span>' +
          esc(author) +
          '</span><span>' +
          esc(formatDate(c.created_at)) +
          '</span></div><div class="comment-body">' +
          esc(c.body) +
          '</div></div>'
        );
      })
      .join('');
    try {
      var last = list.lastElementChild;
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
  }

  function appendOptimistic(body, authorName, tempId) {
    var list = listEl();
    if (!list) return null;
    var empty = list.querySelector('.empty-state, .kb-sub');
    if (empty) empty.remove();
    // avoid duplicate optimistic bubbles
    list.querySelectorAll('[data-optimistic]').forEach(function (el) {
      try {
        el.remove();
      } catch (e) {}
    });
    var div = document.createElement('div');
    div.className = 'comment';
    div.setAttribute('data-optimistic', '1');
    if (tempId) div.setAttribute('data-cid', tempId);
    div.innerHTML =
      '<div class="comment-header"><span></span><span></span></div><div class="comment-body"></div>';
    div.querySelector('.comment-header span:first-child').textContent = authorName || 'You';
    div.querySelector('.comment-header span:last-child').textContent = formatDate(new Date());
    div.querySelector('.comment-body').textContent = body;
    list.appendChild(div);
    try {
      div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
    return div;
  }

  async function fetchAndRender(tid) {
    var client = sb();
    var list = listEl();
    if (!client || !list || !tid) return false;
    try {
      var r = await client
        .from('comments')
        .select('*')
        .eq('ticket_id', tid)
        .order('created_at', { ascending: true });
      if (r.error) {
        console.warn('[cust-reply-fix] fetch', r.error.message);
        return false;
      }
      var rows = (r.data || []).filter(function (c) {
        return !c.is_internal;
      });
      var ids = rows.map(function (c) {
        return c.author_id;
      }).filter(Boolean);
      var names = {};
      if (ids.length) {
        try {
          var pr = await client.from('profiles').select('id,full_name,username,name').in('id', ids);
          if (pr.data) {
            pr.data.forEach(function (p) {
              names[p.id] = p.full_name || p.username || p.name || 'User';
            });
          }
        } catch (e2) {}
      }
      var me = profile();
      if (me && me.id) {
        names[me.id] = me.full_name || me.username || me.name || names[me.id] || 'You';
      }
      renderRows(rows, names);
      return true;
    } catch (e) {
      console.warn('[cust-reply-fix] fetchAndRender', e);
      return false;
    }
  }

  async function refreshConversation(tid) {
    // Tell comments-live to clear signature cache
    try {
      if (window.DRCommentsLive && DRCommentsLive.refresh) await DRCommentsLive.refresh();
    } catch (e) {}

    var ok = await fetchAndRender(tid);
    if (!ok) {
      // retry once after short delay (replication / RLS settle)
      await new Promise(function (r) {
        setTimeout(r, 400);
      });
      await fetchAndRender(tid);
    }

    try {
      window.dispatchEvent(
        new CustomEvent('dr-comments-updated', { detail: { ticketId: tid } })
      );
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
      btn.dataset._old = btn.textContent;
      btn.textContent = 'Sending…';
    }

    try {
      var tid = await resolveTicketUuid();
      if (!tid) {
        var num = ticketNumberFromDom();
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

      // Show immediately
      appendOptimistic(text, name);

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
      try {
        window.currentCustTicketId = tid;
      } catch (e) {}

      // Promote optimistic bubble with real id if we have it
      if (res.comment && res.comment.id) {
        var opt = document.querySelector('[data-optimistic]');
        if (opt) {
          opt.removeAttribute('data-optimistic');
          opt.setAttribute('data-cid', res.comment.id);
        }
      }

      await refreshConversation(tid);
      setTimeout(function () {
        refreshConversation(tid);
      }, 600);
      setTimeout(function () {
        refreshConversation(tid);
      }, 1500);
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

  // Also catch button click in case form submit is blocked elsewhere
  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      var btn = t.closest && t.closest('#cust-reply-form button[type="submit"], #cust-reply-form .btn-primary');
      if (!btn) return;
      var form = document.getElementById('cust-reply-form');
      if (!form) return;
      // Let submit event fire; if it doesn't, force handle after tick
      setTimeout(function () {
        if (submitting) return;
        var ta = document.getElementById('cust-reply-text');
        if (ta && ta.value && ta.value.trim()) {
          // only force if value still there (submit didn't clear it)
        }
      }, 50);
    },
    true
  );

  function bindForm() {
    var form = document.getElementById('cust-reply-form');
    if (!form || form.__drReplyBoundV4) return;
    form.__drReplyBoundV4 = 1;
    form.addEventListener('submit', handleSubmit, true);
  }
  setInterval(bindForm, 1200);
  setTimeout(bindForm, 400);
  setTimeout(bindForm, 1600);
  setTimeout(bindForm, 3500);

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

  window.addEventListener('dr-comments-updated', function (ev) {
    var tid = ev && ev.detail && ev.detail.ticketId;
    if (tid) fetchAndRender(tid);
  });

  window.DRCustReplyFix = {
    refresh: refreshConversation,
    resolve: resolveTicketUuid,
    ticketNumberFromDom: ticketNumberFromDom,
    fetchAndRender: fetchAndRender
  };
})();
