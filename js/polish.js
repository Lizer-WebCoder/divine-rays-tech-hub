/**
 * Divine Rays Tech Hub v7.2 — UI polish (confirm, sticky, density, reopen, views, etc.)
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function dr() { return window.DR || {}; }
  function toast(m, t) { if (dr().toast) dr().toast(m, t); }
  function sb() { return dr().sb ? dr().sb() : null; }

  function applyDensity() {
    var d = localStorage.getItem('dr_density') || 'comfortable';
    document.documentElement.setAttribute('data-density', d);
    var btn = document.getElementById('btn-density');
    if (btn) btn.textContent = d === 'compact' ? 'Comfortable' : 'Compact';
  }
  function bindDensity() {
    var info = document.querySelector('.user-info');
    if (!info || document.getElementById('btn-density')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost btn-sm';
    b.id = 'btn-density';
    b.title = 'Toggle list density';
    info.insertBefore(b, info.firstChild);
    applyDensity();
    b.addEventListener('click', function () {
      var cur = localStorage.getItem('dr_density') || 'comfortable';
      var next = cur === 'compact' ? 'comfortable' : 'compact';
      localStorage.setItem('dr_density', next);
      applyDensity();
      toast(next === 'compact' ? 'Compact density' : 'Comfortable density', 'info');
    });
  }

  function bindStatusConfirm() {
    var save = document.getElementById('btn-save-meta');
    if (!save || save._drConfirm) return;
    save._drConfirm = true;
    save.addEventListener('click', function (e) {
      var se = document.getElementById('quick-status');
      if (!se) return;
      var v = se.value;
      if (v === 'Resolved' || v === 'Closed') {
        if (!confirm('Mark this ticket as ' + v + '?')) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }
    }, true);
  }

  function enhanceDetail() {
    var detail = document.getElementById('ticket-detail');
    if (!detail) return;
    var mo = new MutationObserver(function () {
      var idEl = detail.querySelector('.ticket-id');
      var h3 = detail.querySelector('h3');
      if (!idEl) return;
      var num = idEl.textContent.trim();
      document.title = num + ' · Divine Rays Tech Hub';
      var host = document.getElementById('view-detail');
      if (host && !document.getElementById('sticky-ticket-bar')) {
        var bar = document.createElement('div');
        bar.id = 'sticky-ticket-bar';
        bar.className = 'sticky-ticket-bar';
        bar.innerHTML = '<span class="sticky-id" id="sticky-id">' + num + '</span>' +
          '<span class="sticky-title" id="sticky-title"></span>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="btn-copy-id">Copy ID</button>';
        host.insertBefore(bar, host.firstChild.nextSibling);
        document.getElementById('btn-copy-id').addEventListener('click', function () {
          if (navigator.clipboard) navigator.clipboard.writeText(num).then(function () { toast('Copied ' + num, 'success'); });
        });
      }
      var sid = document.getElementById('sticky-id');
      var st = document.getElementById('sticky-title');
      if (sid) sid.textContent = num;
      if (st && h3) st.textContent = h3.textContent;
      detail.querySelectorAll('.ticket-id').forEach(function (el) {
        el.style.cursor = 'pointer';
        el.title = 'Click to copy';
        el.onclick = function (e) {
          e.stopPropagation();
          var v = el.textContent.trim();
          if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { toast('Copied ' + v, 'success'); });
        };
      });
    });
    mo.observe(detail, { childList: true, subtree: true });
  }

  function injectReopen() {
    var detail = document.getElementById('cust-ticket-detail');
    if (!detail) return;
    var mo = new MutationObserver(function () {
      var statusBadge = detail.querySelector('.badge-resolved, .badge-closed');
      if (!statusBadge) {
        var old = document.getElementById('btn-cust-reopen');
        if (old) old.remove();
        return;
      }
      if (document.getElementById('btn-cust-reopen')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-cust-reopen';
      btn.className = 'btn btn-secondary';
      btn.textContent = 'Reopen ticket';
      btn.style.marginTop = '0.75rem';
      detail.appendChild(btn);
      btn.addEventListener('click', async function () {
        if (!confirm('Reopen this ticket?')) return;
        var idEl = detail.querySelector('.ticket-id');
        if (!idEl) return;
        var num = idEl.textContent.trim();
        var client = sb();
        if (!client) return;
        var r = await client.from('tickets').select('id').eq('ticket_number', num).maybeSingle();
        if (!r.data) { toast('Ticket not found', 'error'); return; }
        var u = await client.from('tickets').update({ status: 'Open' }).eq('id', r.data.id);
        if (u.error) { toast(u.error.message || 'Could not reopen', 'error'); return; }
        toast('Ticket reopened', 'success');
        statusBadge.className = 'badge badge-open';
        statusBadge.textContent = 'Open';
        btn.remove();
      });
    });
    mo.observe(detail, { childList: true, subtree: true });
  }

  function enhanceSubmitSuccess() {
    var box = document.getElementById('submit-success');
    if (!box) return;
    var mo = new MutationObserver(function () {
      if (box.hidden) return;
      if (document.getElementById('btn-copy-new-id')) return;
      var idEl = document.getElementById('new-ticket-id');
      if (!idEl) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'btn-copy-new-id';
      b.className = 'btn btn-secondary';
      b.textContent = 'Copy ticket ID';
      b.style.marginLeft = '0.5rem';
      box.appendChild(b);
      b.addEventListener('click', function () {
        var v = idEl.textContent.trim();
        if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { toast('Copied ' + v, 'success'); });
      });
    });
    mo.observe(box, { attributes: true, childList: true, subtree: true });
  }

  var VIEWS_KEY = 'dr_saved_views';
  function loadViews() {
    try { return JSON.parse(localStorage.getItem(VIEWS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveViews(v) {
    try { localStorage.setItem(VIEWS_KEY, JSON.stringify(v)); } catch (e) {}
  }
  function injectSavedViews() {
    var nav = document.querySelector('#portal-agent .nav');
    if (!nav || document.getElementById('saved-views-block')) return;
    var block = document.createElement('div');
    block.id = 'saved-views-block';
    block.className = 'saved-views-block';
    block.innerHTML = '<p class="saved-views-label">Saved views</p><div id="saved-views-list"></div>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btn-save-view">Save current filters</button>';
    var admin = document.getElementById('nav-admin');
    if (admin) nav.insertBefore(block, admin);
    else nav.appendChild(block);
    function render() {
      var list = document.getElementById('saved-views-list');
      var views = loadViews();
      if (!views.length) {
        list.innerHTML = '<p class="saved-empty">None yet</p>';
        return;
      }
      list.innerHTML = views.map(function (v, i) {
        return '<div class="saved-view-row">' +
          '<button type="button" class="nav-btn saved-view-btn" data-i="' + i + '">' + (v.name || 'View') + '</button>' +
          '<button type="button" class="btn-x" data-del="' + i + '" title="Delete">×</button></div>';
      }).join('');
      list.querySelectorAll('.saved-view-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = loadViews()[Number(b.getAttribute('data-i'))];
          if (!v || !dr().getListFilter) return;
          var lf = dr().getListFilter();
          lf.q = v.q || '';
          lf.status = v.status || '';
          lf.priority = v.priority || '';
          lf.sort = v.sort || 'newest';
          var si = document.getElementById('search-input');
          var fs = document.getElementById('filter-status');
          var fp = document.getElementById('filter-priority');
          var so = document.getElementById('filter-sort');
          if (si) si.value = lf.q;
          if (fs) fs.value = lf.status;
          if (fp) fp.value = lf.priority;
          if (so) so.value = lf.sort;
          if (window.applyTicketFilters) window.applyTicketFilters(false);
          toast('Applied “' + v.name + '”', 'info');
        });
      });
      list.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          var views = loadViews();
          views.splice(Number(b.getAttribute('data-del')), 1);
          saveViews(views);
          render();
        });
      });
    }
    document.getElementById('btn-save-view').addEventListener('click', function () {
      if (!dr().getListFilter) return;
      var lf = dr().getListFilter();
      var name = prompt('Name this view', (lf.priority || lf.status || lf.q || 'My view').toString().slice(0, 24));
      if (!name) return;
      var views = loadViews();
      views.push({ name: name, q: lf.q || '', status: lf.status || '', priority: lf.priority || '', sort: lf.sort || 'newest' });
      saveViews(views);
      render();
      toast('View saved', 'success');
    });
    render();
  }

  function applyInviteOnly() {
    var cfg = window.DR_CONFIG || {};
    if (!cfg.INVITE_ONLY_AGENTS) return;
    document.querySelectorAll('#login-agent .login-switch').forEach(function (p) { p.style.display = 'none'; });
    var ra = document.getElementById('register-agent');
    if (ra) ra.innerHTML = '<p class="login-error">Agent accounts are invite-only. Contact an admin.</p><p class="login-switch"><a href="javascript:void(0)" onclick="window.showForm && showForm(\'login-agent\'); return false;">Back to sign in</a></p>';
  }

  function ensureFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    var link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c6af0"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="white">✦</text></svg>');
    document.head.appendChild(link);
  }

  function bindNavTitleReset() {
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        document.title = 'Divine Rays Tech Hub — Support';
        var bar = document.getElementById('sticky-ticket-bar');
        if (bar) bar.remove();
      });
    });
    var back = document.getElementById('btn-back');
    if (back) back.addEventListener('click', function () {
      document.title = 'Divine Rays Tech Hub — Support';
      var bar = document.getElementById('sticky-ticket-bar');
      if (bar) bar.remove();
    });
  }

  function injectCsvBtn() {
    var foot = document.querySelector('.sidebar-footer');
    if (!foot || document.getElementById('btn-export-csv')) return;
    var ex = document.getElementById('btn-export');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost btn-sm';
    b.id = 'btn-export-csv';
    b.textContent = 'Export CSV';
    if (ex) foot.insertBefore(b, ex.nextSibling);
    else foot.insertBefore(b, foot.firstChild);
    b.addEventListener('click', function () {
      if (window.DRExportCSV) window.DRExportCSV();
    });
  }

  function watchKey(id) { return 'dr_watch_' + id; }
  function isWatched(id) {
    try { return localStorage.getItem(watchKey(id)) === '1'; } catch (e) { return false; }
  }
  function toggleWatch(id) {
    try {
      if (isWatched(id)) localStorage.removeItem(watchKey(id));
      else localStorage.setItem(watchKey(id), '1');
    } catch (e) {}
  }
  function injectWatchBtn() {
    var claim = document.getElementById('btn-claim');
    if (!claim || document.getElementById('btn-watch')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-ghost';
    b.id = 'btn-watch';
    b.textContent = '☆ Watch';
    claim.parentNode.appendChild(b);
    function sync() {
      var detail = document.getElementById('ticket-detail');
      var idEl = detail && detail.querySelector('.ticket-id');
      var cardId = null;
      if (window.DR && DR.getAllTickets) {
        var num = idEl && idEl.textContent.trim();
        var t = (DR.getAllTickets() || []).filter(function (x) { return x.ticket_number === num; })[0];
        if (t) cardId = t.id;
      }
      b._tid = cardId;
      b.textContent = cardId && isWatched(cardId) ? '★ Watching' : '☆ Watch';
    }
    b.addEventListener('click', function () {
      if (!b._tid) sync();
      if (!b._tid) { toast('Open a ticket first', 'error'); return; }
      toggleWatch(b._tid);
      sync();
      toast(isWatched(b._tid) ? 'Watching ticket' : 'Removed watch', 'info');
    });
    var detail = document.getElementById('ticket-detail');
    if (detail) new MutationObserver(sync).observe(detail, { childList: true, subtree: true });
  }

  function ensureSortField() {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (dr().getListFilter) {
        clearInterval(t);
        var lf = dr().getListFilter();
        if (lf.sort == null) lf.sort = 'newest';
      }
      if (n > 80) clearInterval(t);
    }, 50);
  }

  function boot() {
    ensureFavicon();
    ensureSortField();
    bindDensity();
    bindStatusConfirm();
    enhanceDetail();
    injectReopen();
    enhanceSubmitSuccess();
    injectSavedViews();
    applyInviteOnly();
    bindNavTitleReset();
    injectCsvBtn();
    injectWatchBtn();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (document.getElementById('portal-agent')) {
        clearInterval(t);
        boot();
      }
      if (n > 80) clearInterval(t);
    }, 100);
  });
})();
