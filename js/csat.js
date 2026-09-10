/**
 * Divine Rays — CSAT (customer satisfaction after Resolved)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }
  function sb() {
    try { return dr().sb && dr().sb(); } catch (e) { return null; }
  }
  function toast(m, t) {
    if (dr().toast) dr().toast(m, t);
    else console.log('[csat]', m);
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function isResolved(st) {
    st = String(st || '').toLowerCase();
    return st === 'resolved' || st === 'closed' || st === 'solved' || st === 'done' || st === 'complete' || st === 'completed';
  }

  function ensureCss() {
    if (document.getElementById('csat-css')) return;
    var s = document.createElement('style');
    s.id = 'csat-css';
    s.textContent =
      '.csat-box{margin:1rem 0;padding:1rem 1.1rem;border-radius:12px;border:1px solid rgba(124,106,240,.35);background:linear-gradient(135deg,rgba(124,106,240,.12),rgba(26,26,36,.9))}' +
      '.csat-box h4{margin:0 0 .35rem;font-size:1rem;color:#e8e8f0}' +
      '.csat-box p{margin:0 0 .75rem;color:#9898b0;font-size:.9rem}' +
      '.csat-stars{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem}' +
      '.csat-star{width:42px;height:42px;border-radius:10px;border:1px solid #2e2e42;background:#0f0f14;color:#c4b5fd;font-size:1.15rem;cursor:pointer;font-family:inherit}' +
      '.csat-star:hover,.csat-star.on{background:#7c6af0;color:#fff;border-color:#7c6af0}' +
      '.csat-box textarea{width:100%;min-height:64px;margin-bottom:.65rem;background:#0f0f14;border:1px solid #2e2e42;color:#e8e8f0;border-radius:9px;padding:.55rem .7rem;font-family:inherit;resize:vertical}' +
      '.csat-thanks{color:#86efac;font-weight:600}' +
      '.team-csat{font-size:.8rem;color:#9898b0;margin-top:.2rem}' +
      '.team-csat strong{color:#c4b5fd}';
    document.head.appendChild(s);
  }

  async function loadTicketFromCustomerDetail() {
    var d = document.getElementById('cust-ticket-detail');
    if (!d) return null;
    var idEl = d.querySelector('.ticket-id');
    var num = idEl ? idEl.textContent.trim() : '';
    var client = sb();
    if (!client) return null;
    var title = (d.querySelector('h3') || {}).textContent || '';
    var tickets = (dr().getAllTickets && dr().getAllTickets()) || [];
    var hit = tickets.find(function (t) {
      return (num && t.ticket_number === num) || (title && t.title === title);
    });
    if (hit) return hit;
    if (num) {
      var r = await client.from('tickets').select('*').eq('ticket_number', num).maybeSingle();
      if (r.data) return r.data;
    }
    try {
      var cached = sessionStorage.getItem('dr_last_cust_ticket');
      if (cached) {
        var c = JSON.parse(cached);
        if (c && c.id) {
          var r2 = await client.from('tickets').select('*').eq('id', c.id).maybeSingle();
          if (r2.data) return r2.data;
        }
      }
    } catch (e) {}
    return null;
  }

  function starsHtml(selected) {
    selected = selected || 0;
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" class="csat-star' + (i <= selected ? ' on' : '') + '" data-score="' + i + '" aria-label="' + i + ' stars">' +
        (i <= selected ? '★' : '☆') + '</button>';
    }
    return html;
  }

  async function mountCsat() {
    ensureCss();
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail) return;
    if (document.getElementById('csat-panel')) return;

    var t = await loadTicketFromCustomerDetail();
    if (!t || !isResolved(t.status)) return;

    var panel = document.createElement('div');
    panel.id = 'csat-panel';
    panel.className = 'csat-box';

    if (t.csat_score) {
      panel.innerHTML =
        '<h4>Thanks for your feedback</h4>' +
        '<p class="csat-thanks">You rated this ticket ' + esc(String(t.csat_score)) + ' / 5 ★</p>' +
        (t.csat_comment ? '<p>' + esc(t.csat_comment) + '</p>' : '');
      detail.appendChild(panel);
      return;
    }

    panel.innerHTML =
      '<h4>How was our support?</h4>' +
      '<p>Your ticket is resolved. Please rate your experience (1–5).</p>' +
      '<div class="csat-stars" id="csat-stars">' + starsHtml(0) + '</div>' +
      '<textarea id="csat-comment" placeholder="Optional comment…"></textarea>' +
      '<button type="button" class="btn btn-primary" id="csat-submit">Submit rating</button>';
    detail.appendChild(panel);

    var score = 0;
    function bindStars() {
      panel.querySelectorAll('.csat-star').forEach(function (btn) {
        btn.onclick = function () {
          score = parseInt(btn.getAttribute('data-score'), 10) || 0;
          panel.querySelector('#csat-stars').innerHTML = starsHtml(score);
          bindStars();
        };
      });
    }
    bindStars();

    document.getElementById('csat-submit').onclick = async function () {
      if (!score) {
        toast('Pick a star rating first', 'error');
        return;
      }
      var client = sb();
      if (!client) {
        toast('Not connected', 'error');
        return;
      }
      var comment = (document.getElementById('csat-comment') || {}).value || '';
      var rpc = await client.rpc('submit_csat', {
        p_ticket_id: t.id,
        p_score: score,
        p_comment: comment || null
      });
      if (rpc.error) {
        var up = await client
          .from('tickets')
          .update({ csat_score: score, csat_comment: comment || null, csat_at: new Date().toISOString() })
          .eq('id', t.id);
        if (up.error) {
          toast(rpc.error.message || up.error.message || 'Could not save rating — run CSAT SQL', 'error');
          return;
        }
      }
      toast('Thanks for rating us!', 'success');
      panel.innerHTML =
        '<h4>Thanks for your feedback</h4>' +
        '<p class="csat-thanks">You rated this ticket ' + score + ' / 5 ★</p>';
      try {
        window.dispatchEvent(new CustomEvent('dr-csat-saved', { detail: { ticketId: t.id, score: score } }));
      } catch (e) {}
      if (window.DR_TEAM && window.DR_TEAM.refresh) window.DR_TEAM.refresh();
    };
  }

  function watchCustomer() {
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail || detail._csatWatch) return;
    detail._csatWatch = true;
    new MutationObserver(function () {
      var old = document.getElementById('csat-panel');
      if (old) old.remove();
      setTimeout(mountCsat, 200);
    }).observe(detail, { childList: true });
  }

  function boot() {
    ensureCss();
    watchCustomer();
    setTimeout(mountCsat, 600);
    setInterval(function () {
      watchCustomer();
      if (document.getElementById('cust-ticket-detail') && !document.getElementById('csat-panel')) {
        mountCsat();
      }
    }, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 400);

  window.DR_CSAT = { mount: mountCsat };
})();
