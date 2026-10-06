/**
 * Divine Rays — End-User Pro UX (v1)
 * High + medium value polish. Gated to #portal-customer only.
 * Does not modify agent/admin UI.
 * Credit: Boyz at the Back LRK · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_ENDUSER_PRO_V1) return;
  window.__DR_ENDUSER_PRO_V1 = 1;

  var SEEN_KEY = 'dr_eu_seen_v1';
  var STYLE_ID = 'dr-enduser-pro-css';

  function isCustomer() {
    var pc = document.getElementById('portal-customer');
    return !!(pc && pc.classList.contains('active'));
  }

  function sb() {
    try {
      if (window.DR && DR.supabase) return DR.supabase;
      if (window.DR && typeof DR.sb === 'function') return DR.sb();
      if (window.sb && window.sb.from) return window.sb;
    } catch (e) {}
    return null;
  }

  function profile() {
    try {
      if (window.DR && DR.getProfile) return DR.getProfile();
      if (window.__drProfile) return window.__drProfile;
      if (window.currentProfile) return window.currentProfile;
    } catch (e) {}
    return null;
  }

  function myId() {
    var p = profile();
    return p && p.id ? p.id : null;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function loadSeen() {
    try {
      return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function saveSeen(map) {
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function markSeen(ticketId) {
    if (!ticketId) return;
    var map = loadSeen();
    map[ticketId] = Date.now();
    saveSeen(map);
  }

  function relativeTime(iso) {
    if (!iso) return '';
    var t = new Date(iso).getTime();
    if (!t || isNaN(t)) return String(iso);
    var s = Math.floor((Date.now() - t) / 1000);
    if (s < 45) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return String(iso);
    }
  }

  function statusKey(st) {
    return String(st || '').toLowerCase().trim();
  }

  function isWaiting(st) {
    return /wait|pending|customer|info|hold/.test(statusKey(st));
  }

  function isResolved(st) {
    return /resolved|closed|solved|done|complete/.test(statusKey(st));
  }

  function isInProgress(st) {
    return /progress|open|assigned|working|active|claimed/.test(statusKey(st)) && !isWaiting(st) && !isResolved(st);
  }

  var CSS = [
    '#portal-customer .dr-eu-unread{display:inline-flex;align-items:center;justify-content:center;min-width:1.15rem;height:1.15rem;padding:0 0.35rem;margin-left:0.4rem;border-radius:999px;background:#a78bfa;color:#0c0c14;font-size:0.65rem;font-weight:700;line-height:1}',
    '#portal-customer .ticket-card.dr-eu-has-unread{border-color:rgba(167,139,250,0.55)!important;box-shadow:0 0 0 1px rgba(167,139,250,0.25)}',
    '#portal-customer .ticket-card .dr-eu-rel{opacity:0.85;font-size:0.78rem}',
    '#portal-customer #cust-comments-list.dr-eu-chat{display:flex;flex-direction:column;gap:0.65rem;padding:0.25rem 0 0.5rem}',
    '#portal-customer #cust-comments-list.dr-eu-chat .comment{max-width:min(92%,28rem);padding:0.7rem 0.9rem;border-radius:14px;border:1px solid rgba(139,124,247,0.22);background:rgba(26,24,42,0.75);box-shadow:0 4px 14px rgba(0,0,0,0.18)}',
    '#portal-customer #cust-comments-list.dr-eu-chat .comment.dr-eu-mine{align-self:flex-end;background:rgba(109,94,245,0.22);border-color:rgba(167,139,250,0.4)}',
    '#portal-customer #cust-comments-list.dr-eu-chat .comment.dr-eu-theirs{align-self:flex-start}',
    '#portal-customer #cust-comments-list.dr-eu-chat .comment-header{display:flex;justify-content:space-between;gap:0.75rem;font-size:0.75rem;opacity:0.85;margin-bottom:0.25rem}',
    '#portal-customer #cust-comments-list.dr-eu-chat .comment-body{font-size:0.92rem;line-height:1.45;white-space:pre-wrap;word-break:break-word}',
    'html[data-theme="light"] #portal-customer #cust-comments-list.dr-eu-chat .comment{background:#fff;border-color:rgba(109,94,245,0.2)}',
    'html[data-theme="light"] #portal-customer #cust-comments-list.dr-eu-chat .comment.dr-eu-mine{background:rgba(109,94,245,0.12)}',
    '#portal-customer .dr-eu-timeline{display:flex;flex-wrap:wrap;gap:0.35rem;margin:0.75rem 0 1rem;padding:0.65rem 0.75rem;border-radius:12px;background:rgba(0,0,0,0.22);border:1px solid rgba(139,124,247,0.2)}',
    '#portal-customer .dr-eu-timeline .dr-eu-step{flex:1;min-width:5.5rem;text-align:center;padding:0.35rem 0.4rem;border-radius:8px;font-size:0.72rem;font-weight:600;color:#9494ae;border:1px solid transparent}',
    '#portal-customer .dr-eu-timeline .dr-eu-step.done{color:#c4b5fd;border-color:rgba(167,139,250,0.35);background:rgba(109,94,245,0.12)}',
    '#portal-customer .dr-eu-timeline .dr-eu-step.current{color:#0c0c14;background:#a78bfa;border-color:#a78bfa}',
    'html[data-theme="light"] #portal-customer .dr-eu-timeline{background:rgba(109,94,245,0.06)}',
    'html[data-theme="light"] #portal-customer .dr-eu-timeline .dr-eu-step.current{color:#fff}',
    '#portal-customer .dr-eu-waiting{margin:0 0 0.85rem;padding:0.75rem 0.95rem;border-radius:12px;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.35);color:#fde68a;font-size:0.88rem;line-height:1.4}',
    'html[data-theme="light"] #portal-customer .dr-eu-waiting{background:#fffbeb;border-color:#f59e0b;color:#92400e}',
    '#portal-customer .dr-eu-empty{text-align:center;padding:2rem 1.25rem;border-radius:16px;border:1px dashed rgba(139,124,247,0.35);background:rgba(26,24,42,0.4)}',
    '#portal-customer .dr-eu-empty h4{margin:0 0 0.4rem;color:#e9e5ff;font-size:1.05rem}',
    '#portal-customer .dr-eu-empty p{margin:0 0 1rem;color:#9494ae;font-size:0.9rem}',
    '#portal-customer .dr-eu-faq{margin:0 0 1rem;border-radius:14px;border:1px solid rgba(139,124,247,0.25);background:rgba(26,24,42,0.55);overflow:hidden}',
    '#portal-customer .dr-eu-faq summary{cursor:pointer;padding:0.85rem 1rem;font-weight:600;color:#c4b5fd;list-style:none}',
    '#portal-customer .dr-eu-faq summary::-webkit-details-marker{display:none}',
    '#portal-customer .dr-eu-faq .dr-eu-faq-body{padding:0 1rem 0.9rem}',
    '#portal-customer .dr-eu-faq .dr-eu-faq-item{margin:0.35rem 0;padding:0.55rem 0.7rem;border-radius:10px;background:rgba(0,0,0,0.2);font-size:0.85rem;color:#c8c6d9}',
    '#portal-customer .dr-eu-faq .dr-eu-faq-item strong{color:#e9e5ff;display:block;margin-bottom:0.2rem}',
    '#portal-customer .dr-eu-reopen{margin:0.75rem 0;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center}',
    '#portal-customer .dr-eu-csat{margin:0.85rem 0;padding:1rem;border-radius:14px;border:1px solid rgba(167,139,250,0.35);background:rgba(109,94,245,0.12)}',
    '#portal-customer .dr-eu-csat h4{margin:0 0 0.35rem;color:#e9e5ff}',
    '#portal-customer .dr-eu-csat p{margin:0 0 0.65rem;color:#9494ae;font-size:0.85rem}',
    '#portal-customer .dr-eu-csat .dr-eu-stars{display:flex;gap:0.25rem;margin-bottom:0.55rem}',
    '#portal-customer .dr-eu-csat .dr-eu-star{appearance:none;border:none;background:transparent;cursor:pointer;font-size:1.45rem;line-height:1;color:#4c4a63;padding:0.1rem}',
    '#portal-customer .dr-eu-csat .dr-eu-star.on{color:#fbbf24}',
    '#portal-customer .dr-eu-csat textarea{width:100%;min-height:2.5rem;margin-bottom:0.5rem;border-radius:10px;border:1px solid rgba(139,124,247,0.3);background:rgba(0,0,0,0.25);color:#eeeef6;padding:0.5rem 0.65rem;font:inherit}',
    '#portal-customer .dr-eu-attach-thumb{width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid rgba(139,124,247,0.3);cursor:pointer;background:#12121c;margin:0.25rem}'
  ].join('');

  function injectCss() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }

  function enhanceTicketList() {
    if (!isCustomer()) return;
    var list = document.getElementById('my-tickets-list');
    if (!list) return;

    var cards = list.querySelectorAll('.ticket-card[data-id]');
    if (!cards.length) {
      var empty = list.querySelector('.empty-state');
      if (empty && !empty.classList.contains('dr-eu-empty')) {
        empty.classList.add('dr-eu-empty');
        empty.innerHTML =
          '<h4>No tickets yet</h4>' +
          '<p>Submit a request and our team will help you shortly.</p>' +
          '<button type="button" class="btn btn-primary" id="dr-eu-go-submit">Submit a ticket</button>';
        var btn = document.getElementById('dr-eu-go-submit');
        if (btn) {
          btn.onclick = function () {
            var tab = document.querySelector('.customer-tabs .ctab[data-ctab="submit"], .ctab[data-ctab="submit"]');
            if (tab) tab.click();
          };
        }
      }
      return;
    }

    var seen = loadSeen();
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      if (!id) return;

      var meta = card.querySelector('.ticket-meta');
      if (meta) {
        var spans = meta.querySelectorAll('span');
        if (spans.length) {
          var last = spans[spans.length - 1];
          if (last && !last.classList.contains('ticket-id') && !last.classList.contains('dr-eu-rel')) {
            var raw = (last.textContent || '').trim();
            var parsed = Date.parse(raw);
            if (!isNaN(parsed)) {
              last.setAttribute('title', raw);
              last.textContent = relativeTime(new Date(parsed).toISOString());
              last.classList.add('dr-eu-rel');
            }
          }
        }
      }

      var statusBadge = card.querySelector('.badges .badge:last-child');
      var st = statusBadge ? statusBadge.textContent || '' : '';
      var lastSeen = seen[id] || 0;
      var showUnread = !isResolved(st) && !lastSeen;

      if (showUnread) {
        card.classList.add('dr-eu-has-unread');
        if (!card.querySelector('.dr-eu-unread')) {
          var h4 = card.querySelector('h4');
          if (h4) {
            var badgeEl = document.createElement('span');
            badgeEl.className = 'dr-eu-unread';
            badgeEl.textContent = 'New';
            h4.appendChild(badgeEl);
          }
        }
      } else {
        card.classList.remove('dr-eu-has-unread');
        var b = card.querySelector('.dr-eu-unread');
        if (b) b.remove();
      }

      if (!card.__drEuClick) {
        card.__drEuClick = 1;
        card.addEventListener(
          'click',
          function () {
            markSeen(id);
            card.classList.remove('dr-eu-has-unread');
            var x = card.querySelector('.dr-eu-unread');
            if (x) x.remove();
          },
          true
        );
      }
    });
  }

  function currentDetailStatus() {
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail) return '';
    var chips = detail.querySelectorAll('.meta-chip, .badge');
    for (var i = 0; i < chips.length; i++) {
      var t = (chips[i].textContent || '').trim();
      if (/^(open|in progress|resolved|closed|waiting|pending|solved)/i.test(t)) return t;
      if (/status/i.test(t)) {
        var inner = chips[i].querySelector('span:last-child');
        if (inner) return (inner.textContent || '').trim();
      }
    }
    var m = (detail.textContent || '').match(/\b(Open|In Progress|Resolved|Closed|Waiting|Pending|Solved)\b/i);
    return m ? m[1] : '';
  }

  function ensureTimeline(status) {
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail) return;
    var old = detail.querySelector('.dr-eu-timeline');
    if (old) old.remove();

    var steps = [
      { key: 'submitted', label: 'Submitted' },
      { key: 'progress', label: 'In progress' },
      { key: 'waiting', label: 'Waiting' },
      { key: 'resolved', label: 'Resolved' }
    ];
    var current = 'submitted';
    if (isResolved(status)) current = 'resolved';
    else if (isWaiting(status)) current = 'waiting';
    else if (isInProgress(status) || statusKey(status) === 'open') current = 'progress';

    var order = ['submitted', 'progress', 'waiting', 'resolved'];
    var curIdx = order.indexOf(current);

    var bar = document.createElement('div');
    bar.className = 'dr-eu-timeline';
    steps.forEach(function (s, idx) {
      var el = document.createElement('div');
      el.className = 'dr-eu-step';
      if (idx < curIdx) el.classList.add('done');
      if (idx === curIdx) el.classList.add('current');
      if (s.key === 'waiting' && current === 'resolved') el.classList.add('done');
      if (s.key === 'waiting' && current === 'progress') el.classList.remove('current');
      el.textContent = s.label;
      bar.appendChild(el);
    });

    var desc = detail.querySelector('.detail-description');
    if (desc && desc.parentNode) desc.parentNode.insertBefore(bar, desc.nextSibling);
    else detail.appendChild(bar);
  }

  function ensureWaitingBanner(status) {
    var old = document.querySelector('#portal-customer .dr-eu-waiting');
    if (old) old.remove();
    if (!isWaiting(status)) return;
    var banner = document.createElement('div');
    banner.className = 'dr-eu-waiting';
    banner.innerHTML =
      '<strong>Waiting on you</strong> — Our team needs a bit more info. Reply below so we can continue.';
    var comments = document.querySelector('#portal-customer .comments-section');
    if (comments && comments.parentNode) comments.parentNode.insertBefore(banner, comments);
  }

  function enhanceChatBubbles() {
    var list = document.getElementById('cust-comments-list');
    if (!list) return;
    list.classList.add('dr-eu-chat');
    var uid = myId();
    list.querySelectorAll('.comment').forEach(function (c) {
      var author = c.getAttribute('data-author') || '';
      c.classList.remove('dr-eu-mine', 'dr-eu-theirs');
      if (uid && author && author === uid) c.classList.add('dr-eu-mine');
      else c.classList.add('dr-eu-theirs');
      var timeSpan = c.querySelector('.comment-header span:last-child');
      if (timeSpan && !timeSpan.dataset.rel) {
        var raw = (timeSpan.textContent || '').trim();
        var parsed = Date.parse(raw);
        if (!isNaN(parsed)) {
          timeSpan.title = raw;
          timeSpan.textContent = relativeTime(new Date(parsed).toISOString());
          timeSpan.dataset.rel = '1';
        }
      }
    });
  }

  async function ensureReopen(status) {
    var old = document.querySelector('#portal-customer .dr-eu-reopen');
    if (old) old.remove();
    if (!isResolved(status)) return;

    var wrap = document.createElement('div');
    wrap.className = 'dr-eu-reopen';
    wrap.innerHTML =
      '<button type="button" class="btn btn-secondary" id="dr-eu-reopen-btn">Reopen ticket</button>' +
      '<span style="font-size:0.8rem;color:#9494ae">Use if the issue came back</span>';
    var comments = document.querySelector('#portal-customer .comments-section');
    if (comments && comments.parentNode) comments.parentNode.insertBefore(wrap, comments);

    var btn = document.getElementById('dr-eu-reopen-btn');
    if (!btn) return;
    btn.onclick = async function () {
      var client = sb();
      var tid = window.__drCustTicketUuid || window.__drOpenTicketId || window.__drEuLastTicketId;
      if (!client || !tid) {
        alert('Could not find ticket. Open it again and retry.');
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Reopening…';
      try {
        var r = await client.from('tickets').update({ status: 'Open' }).eq('id', tid);
        if (r.error) {
          alert(r.error.message || 'Could not reopen');
          btn.disabled = false;
          btn.textContent = 'Reopen ticket';
          return;
        }
        if (typeof window.openCustomerTicket === 'function') {
          try { await window.openCustomerTicket(tid); } catch (e) {}
        }
        schedule();
      } catch (e) {
        alert((e && e.message) || 'Could not reopen');
        btn.disabled = false;
        btn.textContent = 'Reopen ticket';
      }
    };
  }

  async function ensureCsat(status) {
    var host = document.querySelector('#portal-customer .comments-section');
    if (!host) return;
    var old = document.getElementById('dr-eu-csat');
    if (!isResolved(status)) {
      if (old) old.remove();
      return;
    }
    if (old) return;

    var tid = window.__drCustTicketUuid || window.__drOpenTicketId || window.__drEuLastTicketId;
    var client = sb();
    var existing = null;
    if (client && tid) {
      try {
        var r = await client.from('tickets').select('id,csat_score,csat_comment,status').eq('id', tid).maybeSingle();
        existing = r.data;
      } catch (e) {}
    }

    var panel = document.createElement('div');
    panel.className = 'dr-eu-csat';
    panel.id = 'dr-eu-csat';

    if (existing && existing.csat_score) {
      panel.innerHTML =
        '<h4>Thanks for your feedback</h4><p>You rated this ticket ' +
        esc(String(existing.csat_score)) +
        ' / 5</p>';
      host.parentNode.insertBefore(panel, host);
      return;
    }

    panel.innerHTML =
      '<h4>How did we do?</h4>' +
      '<p>Rate your support experience for this ticket.</p>' +
      '<div class="dr-eu-stars" id="dr-eu-stars"></div>' +
      '<textarea id="dr-eu-csat-note" placeholder="Optional comment…"></textarea>' +
      '<button type="button" class="btn btn-primary" id="dr-eu-csat-send">Submit rating</button>';
    host.parentNode.insertBefore(panel, host);

    var score = 0;
    var stars = document.getElementById('dr-eu-stars');
    function paint() {
      stars.innerHTML = '';
      for (var i = 1; i <= 5; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dr-eu-star' + (i <= score ? ' on' : '');
        b.textContent = '★';
        b.setAttribute('data-s', String(i));
        b.onclick = function () {
          score = parseInt(this.getAttribute('data-s'), 10) || 0;
          paint();
        };
        stars.appendChild(b);
      }
    }
    paint();

    var send = document.getElementById('dr-eu-csat-send');
    if (send) {
      send.onclick = async function () {
        if (!score) {
          alert('Pick a star rating first');
          return;
        }
        if (!client || !tid) {
          alert('Ticket not found');
          return;
        }
        send.disabled = true;
        var note = (document.getElementById('dr-eu-csat-note') || {}).value || '';
        var r = await client
          .from('tickets')
          .update({ csat_score: score, csat_comment: note || null, csat_at: new Date().toISOString() })
          .eq('id', tid);
        if (r.error) {
          alert(r.error.message || 'Could not save rating');
          send.disabled = false;
          return;
        }
        panel.innerHTML =
          '<h4>Thanks for your feedback</h4><p>You rated this ticket ' + score + ' / 5</p>';
      };
    }
  }

  function enhanceAttachments() {
    if (!isCustomer()) return;
    var root = document.getElementById('cust-ticket-detail') || document.getElementById('portal-customer');
    if (!root) return;
    root.querySelectorAll('a[href]').forEach(function (a) {
      if (a.dataset.euThumb) return;
      var href = a.getAttribute('href') || '';
      if (!/\.(png|jpe?g|gif|webp)(\?|$)/i.test(href)) return;
      a.dataset.euThumb = '1';
      var img = document.createElement('img');
      img.className = 'dr-eu-attach-thumb';
      img.src = href;
      img.alt = a.textContent || 'Attachment';
      img.onclick = function (e) {
        e.preventDefault();
        window.open(href, '_blank', 'noopener');
      };
      if (a.parentNode) a.parentNode.insertBefore(img, a);
    });
  }

  function ensureFaq() {
    if (!isCustomer()) return;
    var form = document.getElementById('customer-form');
    if (!form || document.getElementById('dr-eu-faq')) return;
    var box = document.createElement('details');
    box.className = 'dr-eu-faq';
    box.id = 'dr-eu-faq';
    box.innerHTML =
      '<summary>Before you submit — quick checks</summary>' +
      '<div class="dr-eu-faq-body">' +
      '<div class="dr-eu-faq-item"><strong>Password / login issues</strong>Try resetting your password from the login page, or note the exact error message.</div>' +
      '<div class="dr-eu-faq-item"><strong>Network / offline</strong>Check cables or Wi‑Fi, then restart the device. Include when it started.</div>' +
      '<div class="dr-eu-faq-item"><strong>Software error</strong>Include the app name, version, and a screenshot if possible.</div>' +
      '<div class="dr-eu-faq-item"><strong>Hardware</strong>Note the asset tag or model if available (e.g. DR-LT-001).</div>' +
      '</div>';
    form.parentNode.insertBefore(box, form);
  }

  function enhanceDetail() {
    if (!isCustomer()) return;
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail) return;
    var st = currentDetailStatus();
    ensureTimeline(st);
    ensureWaitingBanner(st);
    enhanceChatBubbles();
    ensureReopen(st);
    ensureCsat(st);
    enhanceAttachments();
    var tid = window.__drCustTicketUuid || window.__drOpenTicketId || window.__drEuLastTicketId;
    if (tid) markSeen(tid);
  }

  function schedule() {
    if (!isCustomer()) return;
    injectCss();
    ensureFaq();
    enhanceTicketList();
    enhanceDetail();
  }

  document.addEventListener(
    'click',
    function (e) {
      if (!isCustomer()) return;
      var t = e.target;
      if (!t || !t.closest) return;
      var card = t.closest('.ticket-card[data-id]');
      if (card) {
        var id = card.getAttribute('data-id');
        window.__drEuLastTicketId = id;
        window.__drOpenTicketId = id;
        window.__drCustTicketUuid = id;
        markSeen(id);
      }
    },
    true
  );

  injectCss();
  setTimeout(schedule, 800);
  setTimeout(schedule, 2000);
  setTimeout(schedule, 4500);
  setInterval(function () {
    if (isCustomer()) schedule();
  }, 3500);

  var pc = document.getElementById('portal-customer');
  if (pc) {
    try {
      new MutationObserver(function () {
        if (isCustomer()) {
          clearTimeout(window.__drEuMoT);
          window.__drEuMoT = setTimeout(schedule, 200);
        }
      }).observe(pc, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }

  window.DREndUserPro = { refresh: schedule, markSeen: markSeen };
})();
