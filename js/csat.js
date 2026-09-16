/**
 * Divine Rays — CSAT (customer rates resolved tickets; agents see scores)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';
  if (window.__DR_CSAT) return;
  window.__DR_CSAT = 1;

  var STYLE = [
    '#csat-panel{margin:1rem 0;padding:1.15rem 1.25rem;border-radius:14px;border:1px solid rgba(124,106,240,.45);background:linear-gradient(145deg,rgba(124,106,240,.18),#1a1a24)}',
    '#csat-panel h4{margin:0 0 .35rem;color:#eeeef6;font-size:1.05rem}',
    '#csat-panel p{margin:0 0 .7rem;color:#9898b0;font-size:.9rem}',
    '.csat-stars{display:flex;gap:8px;margin:0 0 .75rem;flex-wrap:wrap}',
    '.csat-star{width:44px;height:44px;border-radius:12px;border:1px solid #2e2e42;background:#0f0f14;color:#c4b5fd;font-size:1.25rem;cursor:pointer}',
    '.csat-star.on,.csat-star:hover{background:#7c6af0;color:#fff;border-color:#7c6af0}',
    '#csat-panel textarea{width:100%;min-height:68px;box-sizing:border-box;margin:0 0 .65rem;padding:.55rem .7rem;border-radius:10px;border:1px solid #2e2e42;background:#0f0f14;color:#e8e8f0;font-family:inherit}',
    '.csat-thanks{color:#86efac!important;font-weight:600}',
    '#csat-agent-box{margin:0.75rem 0;padding:0.85rem 1rem;border-radius:12px;border:1px solid rgba(124,106,240,.3);background:rgba(124,106,240,.08)}',
    '#csat-agent-box .csat-score{font-size:1.25rem;color:#c4b5fd;font-weight:700}',
    '#csat-agent-box .csat-cmt{color:#9898b0;font-size:.88rem;margin-top:.35rem}'
  ].join('');

  function ensureStyle() {
    if (document.getElementById('csat-force-css')) return;
    var s = document.createElement('style');
    s.id = 'csat-force-css';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function isResolvedText(t) {
    t = String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
    return /^(resolved|closed|solved|done|complete|completed)$/.test(t);
  }

  function detailShowsResolved() {
    var d = document.getElementById('cust-ticket-detail');
    if (!d) return false;
    var chips = d.querySelectorAll('.badge, .meta-chip, .status');
    for (var i = 0; i < chips.length; i++) {
      var ct = (chips[i].textContent || '').replace(/Status/i, '').trim();
      if (isResolvedText(ct)) return true;
    }
    return /Status\s*(RESOLVED|CLOSED|SOLVED)/i.test(d.textContent || '');
  }

  function ticketNumberFrom(el) {
    if (!el) return '';
    var idEl = el.querySelector('.ticket-id');
    if (idEl) return idEl.textContent.trim();
    var m = (el.textContent || '').match(/DR-\d+/);
    return m ? m[0] : '';
  }

  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return window.__drSb || null;
  }

  function stars(n) {
    n = n || 0;
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += '<button type="button" class="csat-star' + (i <= n ? ' on' : '') + '" data-s="' + i + '">' + (i <= n ? '★' : '☆') + '</button>';
    }
    return h;
  }

  async function getTicketByNumber(num) {
    var client = sb();
    if (!client || !num) return null;
    var r = await client.from('tickets').select('id,status,csat_score,csat_comment,csat_at,ticket_number,number')
      .or('ticket_number.eq.' + num + ',number.eq.' + num)
      .limit(1);
    if (r.data && r.data[0]) return r.data[0];
    var r2 = await client.from('tickets').select('id,status,csat_score,csat_comment,csat_at,ticket_number')
      .ilike('ticket_number', num).limit(1);
    return (r2.data && r2.data[0]) || null;
  }

  var score = 0;

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  }

  async function showCustomer() {
    ensureStyle();
    var host = document.getElementById('ctab-detail') || document.getElementById('cust-ticket-detail');
    if (!host || !document.getElementById('cust-ticket-detail')) return;
    if (!detailShowsResolved()) {
      var old = document.getElementById('csat-panel');
      if (old) old.remove();
      return;
    }
    var num = ticketNumberFrom(document.getElementById('cust-ticket-detail'));
    if (!num) return;

    var panel = document.getElementById('csat-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'csat-panel';
      var comments = document.querySelector('#ctab-detail .comments-section');
      if (comments) comments.parentNode.insertBefore(panel, comments);
      else {
        var det = document.getElementById('cust-ticket-detail');
        if (det && det.parentNode) det.parentNode.appendChild(panel);
        else return;
      }
    }

    var ticket = await getTicketByNumber(num);
    if (ticket && ticket.csat_score) {
      panel.innerHTML = '<h4>Thanks for your feedback</h4><p class="csat-thanks">You rated this ticket ' + ticket.csat_score + ' / 5 ★</p>' +
        (ticket.csat_comment ? '<p style="color:#9898b0">' + escapeHtml(ticket.csat_comment) + '</p>' : '');
      return;
    }

    if (panel.getAttribute('data-num') === num && panel.querySelector('#csat-submit')) return;

    score = 0;
    panel.setAttribute('data-num', num);
    panel.innerHTML =
      '<h4>How was our support?</h4>' +
      '<p>Your ticket is <strong>Resolved</strong>. Rate your experience (1–5 stars).</p>' +
      '<div class="csat-stars" id="csat-stars">' + stars(0) + '</div>' +
      '<textarea id="csat-comment" placeholder="Optional comment…"></textarea>' +
      '<button type="button" class="btn btn-primary" id="csat-submit">Submit rating</button>';

    function bind() {
      panel.querySelectorAll('.csat-star').forEach(function (btn) {
        btn.onclick = function () {
          score = parseInt(btn.getAttribute('data-s'), 10) || 0;
          var box = document.getElementById('csat-stars');
          if (box) box.innerHTML = stars(score);
          bind();
        };
      });
    }
    bind();

    var sub = document.getElementById('csat-submit');
    if (sub) {
      sub.onclick = async function () {
        if (!score) {
          alert('Pick a star rating first');
          return;
        }
        var client = sb();
        if (!client) {
          alert('Not connected');
          return;
        }
        var t = ticket || (await getTicketByNumber(num));
        if (!t || !t.id) {
          alert('Could not find ticket');
          return;
        }
        var comment = (document.getElementById('csat-comment') || {}).value || '';
        var rpc = await client.rpc('submit_csat', { p_ticket_id: t.id, p_score: score, p_comment: comment || null });
        if (rpc.error) {
          var up = await client.from('tickets').update({
            csat_score: score,
            csat_comment: comment || null,
            csat_at: new Date().toISOString()
          }).eq('id', t.id);
          if (up.error) {
            alert((rpc.error && rpc.error.message) || up.error.message || 'Run CSAT SQL in Supabase');
            return;
          }
        }
        panel.innerHTML = '<h4>Thanks for your feedback</h4><p class="csat-thanks">You rated this ticket ' + score + ' / 5 ★</p>';
        if (window.DR && window.DR.toast) window.DR.toast('Thanks for rating us!', 'success');
      };
    }
  }

  async function showAgent() {
    ensureStyle();
    var detail = document.getElementById('ticket-detail');
    if (!detail || !detail.offsetParent) return;
    var num = ticketNumberFrom(detail);
    if (!num) return;

    var ticket = await getTicketByNumber(num);
    if (!ticket || !ticket.csat_score) {
      var old = document.getElementById('csat-agent-box');
      if (old) old.remove();
      return;
    }

    var box = document.getElementById('csat-agent-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'csat-agent-box';
      var comments = detail.querySelector('.comments-section') || detail;
      if (comments.parentNode && comments !== detail) comments.parentNode.insertBefore(box, comments);
      else detail.appendChild(box);
    }
    var starsTxt = '';
    for (var i = 1; i <= 5; i++) starsTxt += i <= ticket.csat_score ? '★' : '☆';
    box.innerHTML =
      '<div class="csat-score">CSAT ' + starsTxt + ' (' + ticket.csat_score + '/5)</div>' +
      (ticket.csat_comment ? '<div class="csat-cmt">' + escapeHtml(ticket.csat_comment) + '</div>' : '');
  }

  function tick() {
    showCustomer().catch(function (e) { console.warn('[csat cust]', e); });
    showAgent().catch(function (e) { console.warn('[csat agent]', e); });
  }

  setInterval(tick, 1200);
  setTimeout(tick, 600);
  window.DRCsat = { refresh: tick };
})();
