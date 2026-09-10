/**
 * Divine Rays — FORCE CSAT + polish helpers
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  var STYLE = '#csat-panel{margin:1rem 0;padding:1.15rem 1.25rem;border-radius:14px;border:1px solid rgba(124,106,240,.45);background:linear-gradient(145deg,rgba(124,106,240,.18),#1a1a24);}#csat-panel h4{margin:0 0 .35rem;color:#eeeef6;font-size:1.05rem}#csat-panel p{margin:0 0 .7rem;color:#9898b0;font-size:.9rem}.csat-stars{display:flex;gap:8px;margin:0 0 .75rem}.csat-star{width:48px;height:48px;border-radius:12px;border:1px solid #2e2e42;background:#0f0f14;color:#c4b5fd;font-size:1.35rem;cursor:pointer}.csat-star.on,.csat-star:hover{background:#7c6af0;color:#fff;border-color:#7c6af0}#csat-panel textarea{width:100%;min-height:68px;box-sizing:border-box;margin:0 0 .65rem;padding:.55rem .7rem;border-radius:10px;border:1px solid #2e2e42;background:#0f0f14;color:#e8e8f0;font-family:inherit}.csat-thanks{color:#86efac!important;font-weight:600}';

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
    var chips = d.querySelectorAll('.badge, .meta-chip');
    for (var i = 0; i < chips.length; i++) {
      var ct = (chips[i].textContent || '').replace(/Status/i, '').trim();
      if (isResolvedText(ct)) return true;
    }
    return /Status\s*RESOLVED/i.test(d.textContent || '');
  }

  function ticketNumber() {
    var d = document.getElementById('cust-ticket-detail');
    if (!d) return '';
    var el = d.querySelector('.ticket-id');
    if (el) return el.textContent.trim();
    var m = (d.textContent || '').match(/DR-\d+/);
    return m ? m[0] : '';
  }

  function sb() {
    try {
      if (window.DR && window.DR.sb) return window.DR.sb();
    } catch (e) {}
    return null;
  }

  function stars(n) {
    n = n || 0;
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += '<button type="button" class="csat-star' + (i <= n ? ' on' : '') + '" data-s="' + i + '">' + (i <= n ? '★' : '☆') + '</button>';
    }
    return h;
  }

  async function getTicket(num) {
    var client = sb();
    if (!client || !num) return null;
    try {
      var r = await client.from('tickets').select('id,status,csat_score,csat_comment,ticket_number').eq('ticket_number', num).maybeSingle();
      return r.data || null;
    } catch (e) {
      return null;
    }
  }

  var score = 0;

  async function showCsat() {
    ensureStyle();
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail || !detail.innerHTML.trim()) {
      var p0 = document.getElementById('csat-panel');
      if (p0) p0.remove();
      return;
    }
    if (!detailShowsResolved()) {
      var p1 = document.getElementById('csat-panel');
      if (p1) p1.remove();
      return;
    }
    var num = ticketNumber();
    if (!num) return;
    var ticket = await getTicket(num);
    var panel = document.getElementById('csat-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'csat-panel';
      var parent = detail.parentElement;
      var comments = parent && parent.querySelector('.comments-section');
      if (comments) parent.insertBefore(panel, comments);
      else if (parent) parent.insertBefore(panel, detail.nextSibling);
      else detail.appendChild(panel);
    }
    if (ticket && ticket.csat_score) {
      panel.innerHTML = '<h4>Thanks for your feedback</h4><p class="csat-thanks">You rated this ticket ' + ticket.csat_score + ' / 5 ★</p>';
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
        if (!score) return alert('Pick a star rating first');
        var client = sb();
        if (!client) return alert('Not connected');
        var t = ticket || (await getTicket(num));
        if (!t || !t.id) return alert('Could not find ticket');
        var comment = (document.getElementById('csat-comment') || {}).value || '';
        var rpc = await client.rpc('submit_csat', { p_ticket_id: t.id, p_score: score, p_comment: comment || null });
        if (rpc.error) {
          var up = await client.from('tickets').update({ csat_score: score, csat_comment: comment || null, csat_at: new Date().toISOString() }).eq('id', t.id);
          if (up.error) return alert((rpc.error && rpc.error.message) || up.error.message || 'Run CSAT SQL');
        }
        panel.innerHTML = '<h4>Thanks for your feedback</h4><p class="csat-thanks">You rated this ticket ' + score + ' / 5 ★</p>';
        if (window.DR && window.DR.toast) window.DR.toast('Thanks for rating us!', 'success');
      };
    }
  }

  setInterval(function () { showCsat().catch(function () {}); }, 1000);
  setTimeout(function () { showCsat(); }, 800);
})();

(function () {
  function ensureDeleteNearSave() {
    var p = window.DR && window.DR.getProfile && window.DR.getProfile();
    if (!p || (p.role !== 'agent' && p.role !== 'admin')) return;
    if (document.getElementById('btn-delete-ticket')) return;
    var save = document.getElementById('btn-save-meta');
    if (!save || !save.parentElement) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'btn-delete-ticket';
    b.className = 'btn btn-danger';
    b.textContent = 'Delete ticket';
    b.style.marginLeft = '0.5rem';
    b.onclick = async function () {
      var pt = document.getElementById('page-title');
      var num = pt && pt.textContent ? pt.textContent.trim() : '';
      if (!num || !confirm('Delete ticket ' + num + '?')) return;
      try {
        var client = window.DR && window.DR.sb && window.DR.sb();
        if (!client) return alert('Not connected');
        var tr = await client.from('tickets').select('*').eq('ticket_number', num).maybeSingle();
        if (!tr.data) return alert('Ticket not found');
        await client.from('tickets').delete().eq('id', tr.data.id);
        if (window.DR.toast) window.DR.toast('Ticket deleted', 'success');
        var dash = document.querySelector('#portal-agent .nav-btn[data-view="dashboard"]');
        if (dash) dash.click();
      } catch (e) { alert(e.message || e); }
    };
    save.parentElement.appendChild(b);
  }
  function ensureKbEmptyButton() {
    var el = document.getElementById('kb-manage-list');
    if (!el || el.querySelector('#kb-btn-new-empty')) return;
    if ((el.textContent || '').indexOf('No articles yet') === -1) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.id = 'kb-btn-new-empty';
    btn.textContent = '+ New article';
    btn.style.marginTop = '0.75rem';
    btn.onclick = function () {
      if (window.DR_KB && window.DR_KB.openEditor) window.DR_KB.openEditor(null);
      else { var n = document.getElementById('kb-btn-new'); if (n) n.click(); }
    };
    el.appendChild(btn);
  }
  setInterval(function () { ensureDeleteNearSave(); ensureKbEmptyButton(); }, 2000);
})();
