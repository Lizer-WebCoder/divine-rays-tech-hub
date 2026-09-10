/**
 * Divine Rays — CSAT (stars on resolved customer tickets)
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
    st = String(st || '').toLowerCase().trim();
    return (
      st === 'resolved' ||
      st === 'closed' ||
      st === 'solved' ||
      st === 'done' ||
      st === 'complete' ||
      st === 'completed'
    );
  }

  function ensureCss() {
    if (document.getElementById('csat-css')) return;
    var s = document.createElement('style');
    s.id = 'csat-css';
    s.textContent =
      '#csat-panel.csat-box{margin:1rem 0;padding:1.1rem 1.2rem;border-radius:14px;border:1px solid rgba(124,106,240,.4);background:linear-gradient(145deg,rgba(124,106,240,.15),rgba(26,26,36,.95));}' +
      '#csat-panel h4{margin:0 0 .4rem;font-size:1.05rem;color:#e8e8f0;}' +
      '#csat-panel p{margin:0 0 .75rem;color:#9898b0;font-size:.9rem;}' +
      '.csat-stars{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:.85rem;}' +
      '.csat-star{width:46px;height:46px;border-radius:11px;border:1px solid #2e2e42;background:#0f0f14;color:#c4b5fd;font-size:1.25rem;cursor:pointer;font-family:inherit;transition:background .15s,color .15s;}' +
      '.csat-star:hover,.csat-star.on{background:#7c6af0;color:#fff;border-color:#7c6af0;}' +
      '#csat-panel textarea{width:100%;min-height:70px;margin-bottom:.7rem;background:#0f0f14;border:1px solid #2e2e42;color:#e8e8f0;border-radius:10px;padding:.6rem .75rem;font-family:inherit;resize:vertical;box-sizing:border-box;}' +
      '.csat-thanks{color:#86efac!important;font-weight:600;}';
    document.head.appendChild(s);
  }

  function readDomTicket() {
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail || !detail.innerHTML.trim()) return null;
    var idEl = detail.querySelector('.ticket-id');
    var num = idEl ? idEl.textContent.trim() : '';
    var status = '';
    detail.querySelectorAll('.meta-chip').forEach(function (chip) {
      var k = (chip.querySelector('.meta-k') || {}).textContent || '';
      if (/status/i.test(k)) {
        var b = chip.querySelector('.badge');
        status = b ? b.textContent.trim() : chip.textContent.replace(/Status/i, '').trim();
      }
    });
    return {
      ticket_number: num,
      status: status,
      title: ((detail.querySelector('h3') || {}).textContent || '').trim()
    };
  }

  async function fetchTicket(num) {
    var client = sb();
    if (!client || !num) return null;
    try {
      var r = await client
        .from('tickets')
        .select('id,ticket_number,status,csat_score,csat_comment,title,requester_id')
        .eq('ticket_number', num)
        .maybeSingle();
      if (r.error) {
        console.warn('[csat] fetch', r.error);
        return null;
      }
      return r.data || null;
    } catch (e) {
      console.warn('[csat]', e);
      return null;
    }
  }

  function starsHtml(selected) {
    selected = selected || 0;
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html +=
        '<button type="button" class="csat-star' +
        (i <= selected ? ' on' : '') +
        '" data-score="' +
        i +
        '" aria-label="' +
        i +
        ' stars">' +
        (i <= selected ? '★' : '☆') +
        '</button>';
    }
    return html;
  }

  var mounting = false;

  async function mountCsat() {
    if (mounting) return;
    ensureCss();

    var detail = document.getElementById('cust-ticket-detail');
    if (!detail) return;

    var dom = readDomTicket();
    if (!dom || !dom.ticket_number) {
      var existing = document.getElementById('csat-panel');
      if (existing) existing.remove();
      return;
    }

    var resolved = isResolved(dom.status);
    var ticket = await fetchTicket(dom.ticket_number);
    if (ticket && isResolved(ticket.status)) resolved = true;

    if (!resolved) {
      var old = document.getElementById('csat-panel');
      if (old) old.remove();
      return;
    }

    var panel = document.getElementById('csat-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'csat-panel';
      panel.className = 'csat-box';
      var comments = detail.parentElement && detail.parentElement.querySelector('.comments-section');
      if (comments && comments.parentElement === detail.parentElement) {
        detail.parentElement.insertBefore(panel, comments);
      } else if (detail.parentElement) {
        if (detail.nextSibling) detail.parentElement.insertBefore(panel, detail.nextSibling);
        else detail.parentElement.appendChild(panel);
      } else {
        detail.appendChild(panel);
      }
    }

    if (ticket && ticket.csat_score) {
      panel.innerHTML =
        '<h4>Thanks for your feedback</h4>' +
        '<p class="csat-thanks">You rated this ticket ' +
        esc(String(ticket.csat_score)) +
        ' / 5 ★</p>' +
        (ticket.csat_comment ? '<p>' + esc(ticket.csat_comment) + '</p>' : '');
      return;
    }

    if (panel.getAttribute('data-ready') === '1') return;

    panel.setAttribute('data-ready', '1');
    panel.innerHTML =
      '<h4>How was our support?</h4>' +
      '<p>Your ticket is resolved. Please rate your experience (1–5 stars).</p>' +
      '<div class="csat-stars" id="csat-stars">' +
      starsHtml(0) +
      '</div>' +
      '<textarea id="csat-comment" placeholder="Optional comment…"></textarea>' +
      '<button type="button" class="btn btn-primary" id="csat-submit">Submit rating</button>';

    var score = 0;
    function bindStars() {
      panel.querySelectorAll('.csat-star').forEach(function (btn) {
        btn.onclick = function () {
          score = parseInt(btn.getAttribute('data-score'), 10) || 0;
          var box = panel.querySelector('#csat-stars');
          if (box) box.innerHTML = starsHtml(score);
          bindStars();
        };
      });
    }
    bindStars();

    var submitBtn = document.getElementById('csat-submit');
    if (submitBtn) {
      submitBtn.onclick = async function () {
        if (!score) {
          toast('Pick a star rating first', 'error');
          return;
        }
        var client = sb();
        if (!client) {
          toast('Not connected', 'error');
          return;
        }
        var t = ticket || (await fetchTicket(dom.ticket_number));
        if (!t || !t.id) {
          toast('Could not load ticket — try again', 'error');
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
            .update({
              csat_score: score,
              csat_comment: comment || null,
              csat_at: new Date().toISOString()
            })
            .eq('id', t.id);
          if (up.error) {
            toast(
              rpc.error.message || up.error.message || 'Could not save — run CSAT SQL in Supabase',
              'error'
            );
            return;
          }
        }
        toast('Thanks for rating us!', 'success');
        panel.removeAttribute('data-ready');
        panel.innerHTML =
          '<h4>Thanks for your feedback</h4>' +
          '<p class="csat-thanks">You rated this ticket ' +
          score +
          ' / 5 ★</p>';
        try {
          window.dispatchEvent(
            new CustomEvent('dr-csat-saved', { detail: { ticketId: t.id, score: score } })
          );
        } catch (e) {}
        if (window.DR_TEAM && window.DR_TEAM.refresh) window.DR_TEAM.refresh();
      };
    }
  }

  function scheduleMount() {
    if (mounting) return;
    mounting = true;
    setTimeout(function () {
      mountCsat()
        .catch(function (e) {
          console.warn('[csat]', e);
        })
        .finally(function () {
          mounting = false;
        });
    }, 100);
  }

  function boot() {
    ensureCss();
    var shell = document.getElementById('app-shell') || document.body;
    new MutationObserver(function () {
      scheduleMount();
    }).observe(shell, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    setInterval(scheduleMount, 1500);
    setTimeout(scheduleMount, 500);
    setTimeout(scheduleMount, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);

  window.DR_CSAT = { mount: mountCsat };
})();
