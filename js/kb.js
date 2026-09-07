/**
 * Divine Rays — Knowledge Base / FAQ
 * Credit: Lizzz · All Rights Reserved
 */
(function () {
  'use strict';

  function DR() { return window.DR || {}; }
  function sb() { return DR().sb && DR().sb(); }
  function toast(m, t) { if (DR().toast) DR().toast(m, t); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function fmt(d) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return ''; }
  }

  var CATEGORIES = ['Getting Started', 'Account', 'Hardware', 'Software', 'Network', 'Other'];

  async function fetchArticles(opts) {
    opts = opts || {};
    var client = sb();
    if (!client) return [];
    var q = client.from('kb_articles').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (opts.publishedOnly) q = q.eq('published', true);
    var r = await q;
    if (r.error) { console.warn('kb', r.error); return []; }
    return r.data || [];
  }

  async function saveArticle(row) {
    var client = sb();
    if (!client) return { error: 'Not connected' };
    if (row.id) {
      var r = await client.from('kb_articles').update({
        title: row.title, body: row.body, category: row.category,
        published: row.published, sort_order: row.sort_order || 0,
        updated_at: new Date().toISOString()
      }).eq('id', row.id).select().maybeSingle();
      return r.error ? { error: r.error.message } : { article: r.data };
    }
    var me = DR().getProfile && DR().getProfile();
    var r2 = await client.from('kb_articles').insert({
      title: row.title, body: row.body, category: row.category || 'Other',
      published: row.published !== false, sort_order: row.sort_order || 0,
      created_by: me && me.id
    }).select().maybeSingle();
    return r2.error ? { error: r2.error.message } : { article: r2.data };
  }

  async function deleteArticle(id) {
    var r = await sb().from('kb_articles').delete().eq('id', id);
    return r.error ? { error: r.error.message } : { ok: true };
  }

  function filterArticles(list, q, cat) {
    q = (q || '').toLowerCase().trim();
    cat = cat || '';
    return list.filter(function (a) {
      if (cat && a.category !== cat) return false;
      if (!q) return true;
      return ((a.title || '') + ' ' + (a.body || '') + ' ' + (a.category || '')).toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderFaqList(containerId, articles, emptyMsg) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!articles.length) {
      el.innerHTML = '<p class="empty-state kb-empty">' + esc(emptyMsg || 'No articles yet.') + '</p>';
      return;
    }
    var byCat = {};
    articles.forEach(function (a) {
      var c = a.category || 'Other';
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(a);
    });
    var html = '';
    Object.keys(byCat).forEach(function (cat) {
      html += '<div class="kb-cat-block"><h3 class="kb-cat-title">' + esc(cat) + '</h3>';
      byCat[cat].forEach(function (a) {
        html += '<details class="kb-item"><summary>' + esc(a.title) + '</summary><div class="kb-item-body">' +
          esc(a.body).replace(/\n/g, '<br>') + '</div></details>';
      });
      html += '</div>';
    });
    el.innerHTML = html;
  }

  async function loadCustomerFaq() {
    window.__kbPublished = await fetchArticles({ publishedOnly: true });
    applyCustomerFaqFilter();
  }

  function applyCustomerFaqFilter() {
    var q = (document.getElementById('kb-search') || {}).value || '';
    var cat = (document.getElementById('kb-filter-cat') || {}).value || '';
    renderFaqList('kb-faq-list', filterArticles(window.__kbPublished || [], q, cat),
      'No matching help articles. Try another search or submit a ticket.');
  }

  async function loadAgentKb() {
    window.__kbAll = await fetchArticles({});
    renderAgentKbTable(window.__kbAll || []);
  }

  function renderAgentKbTable(list) {
    var el = document.getElementById('kb-manage-list');
    if (!el) return;
    var q = (document.getElementById('kb-manage-search') || {}).value || '';
    var filtered = filterArticles(list || [], q, '');
    if (!filtered.length) {
      el.innerHTML = '<div class="kb-empty-box"><p class="empty-state">No articles yet.</p>' +
        '<p class="kb-sub">Click <strong>New article</strong> to create your first FAQ.</p>' +
        '<p class="kb-sub">If save fails, run the kb_articles SQL in Supabase first.</p></div>';
      return;
    }
    el.innerHTML = '<table class="perf-table kb-table"><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>' +
      filtered.map(function (a) {
        return '<tr><td>' + esc(a.title) + '</td><td>' + esc(a.category || '—') + '</td><td>' +
          (a.published ? '<span class="badge badge-status-open">Published</span>' : '<span class="badge">Draft</span>') +
          '</td><td>' + fmt(a.updated_at || a.created_at) + '</td><td class="kb-row-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm kb-edit" data-id="' + a.id + '">Edit</button>' +
          '<button type="button" class="btn btn-danger btn-sm kb-del" data-id="' + a.id + '">Delete</button></td></tr>';
      }).join('') + '</tbody></table>';

    el.querySelectorAll('.kb-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var art = (window.__kbAll || []).find(function (x) { return String(x.id) === String(btn.getAttribute('data-id')); });
        if (art) openEditor(art);
      });
    });
    el.querySelectorAll('.kb-del').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (!confirm('Delete this article?')) return;
        var r = await deleteArticle(btn.getAttribute('data-id'));
        if (r.error) toast(r.error, 'error');
        else { toast('Article deleted', 'success'); loadAgentKb(); loadCustomerFaq(); }
      });
    });
  }

  function ensureEditor() {
    if (document.getElementById('kb-editor-overlay')) return;
    var o = document.createElement('div');
    o.id = 'kb-editor-overlay';
    o.className = 'kb-overlay is-hidden';
    o.innerHTML = '<div class="kb-editor" role="dialog"><h3 id="kb-editor-title">New article</h3><input type="hidden" id="kb-edit-id" />' +
      '<div class="form-group"><label>Title</label><input type="text" id="kb-edit-title" placeholder="e.g. How do I reset my password?" /></div>' +
      '<div class="form-row"><div class="form-group"><label>Category</label><select id="kb-edit-category">' +
      CATEGORIES.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') +
      '</select></div><div class="form-group"><label>Published</label><select id="kb-edit-published">' +
      '<option value="true">Published (customers see it)</option><option value="false">Draft (staff only)</option></select></div></div>' +
      '<div class="form-group"><label>Article body</label><textarea id="kb-edit-body" rows="8" placeholder="Write clear steps for the customer…"></textarea></div>' +
      '<div class="kb-editor-actions"><button type="button" class="btn btn-ghost" id="kb-edit-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-primary" id="kb-edit-save">Save article</button></div></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o) closeEditor(); });
    document.getElementById('kb-edit-cancel').onclick = closeEditor;
    document.getElementById('kb-edit-save').onclick = saveEditor;
  }

  function openEditor(article) {
    ensureEditor();
    document.getElementById('kb-editor-overlay').classList.remove('is-hidden');
    document.getElementById('kb-editor-title').textContent = article && article.id ? 'Edit article' : 'New article';
    document.getElementById('kb-edit-id').value = (article && article.id) || '';
    document.getElementById('kb-edit-title').value = (article && article.title) || '';
    document.getElementById('kb-edit-body').value = (article && article.body) || '';
    document.getElementById('kb-edit-category').value = (article && article.category) || 'Other';
    document.getElementById('kb-edit-published').value = article && article.published === false ? 'false' : 'true';
  }

  function closeEditor() {
    var o = document.getElementById('kb-editor-overlay');
    if (o) o.classList.add('is-hidden');
  }

  async function saveEditor() {
    var title = document.getElementById('kb-edit-title').value.trim();
    var body = document.getElementById('kb-edit-body').value.trim();
    if (!title || !body) { toast('Title and body are required', 'error'); return; }
    var row = {
      id: document.getElementById('kb-edit-id').value || null,
      title: title, body: body,
      category: document.getElementById('kb-edit-category').value,
      published: document.getElementById('kb-edit-published').value === 'true'
    };
    var r = await saveArticle(row);
    if (r.error) {
      toast(r.error + ' — make sure you ran the kb_articles SQL in Supabase', 'error');
      return;
    }
    toast('Article saved', 'success');
    closeEditor();
    loadAgentKb();
    loadCustomerFaq();
  }

  function showKbView() {
    ensureAgentUi();
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.id === 'nav-kb' || b.getAttribute('data-view') === 'kb');
    });
    document.querySelectorAll('#portal-agent .view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-kb');
    });
    var title = document.getElementById('page-title');
    if (title) title.textContent = 'Knowledge Base';
    var actions = document.querySelector('#portal-agent .topbar-actions');
    if (actions) actions.style.display = 'none';
    loadAgentKb();
  }

  function restoreTopbarFilters() {
    var actions = document.querySelector('#portal-agent .topbar-actions');
    if (actions) actions.style.display = '';
  }

  function ensureAgentUi() {
    var nav = document.querySelector('#portal-agent .nav');
    var main = document.querySelector('#portal-agent .main');

    if (nav && !document.getElementById('nav-kb')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-btn';
      btn.id = 'nav-kb';
      btn.setAttribute('data-view', 'kb');
      btn.textContent = 'Knowledge Base';
      var adminBtn = document.getElementById('nav-admin');
      if (adminBtn) nav.insertBefore(btn, adminBtn);
      else nav.appendChild(btn);
    }

    if (main && !document.getElementById('view-kb')) {
      var sec = document.createElement('section');
      sec.id = 'view-kb';
      sec.className = 'view';
      sec.innerHTML = '<div class="kb-manage"><div class="kb-manage-head"><div>' +
        '<h3 class="stats-heading" style="margin:0">Knowledge Base</h3>' +
        '<p class="kb-sub">Articles customers see under Help / FAQ. Create, edit, publish, or delete below.</p></div>' +
        '<button type="button" class="btn btn-primary" id="kb-btn-new">+ New article</button></div>' +
        '<div class="kb-toolbar"><input type="search" id="kb-manage-search" placeholder="Search articles…" /></div>' +
        '<div id="kb-manage-list"><p class="empty-state">Loading…</p></div></div>';
      main.appendChild(sec);
    }

    var neu = document.getElementById('kb-btn-new');
    if (neu && !neu.__kbBound) {
      neu.__kbBound = true;
      neu.addEventListener('click', function () { openEditor(null); });
    }
    var search = document.getElementById('kb-manage-search');
    if (search && !search.__kbBound) {
      search.__kbBound = true;
      search.addEventListener('input', function () { renderAgentKbTable(window.__kbAll || []); });
    }
  }

  function ensureCustomerTab() {
    var tabs = document.querySelector('#portal-customer .customer-tabs');
    if (!tabs || document.getElementById('ctab-btn-kb')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ctab';
    btn.id = 'ctab-btn-kb';
    btn.setAttribute('data-ctab', 'kb');
    btn.textContent = 'Help / FAQ';
    tabs.appendChild(btn);

    var main = document.querySelector('#portal-customer .customer-main');
    if (!main || document.getElementById('ctab-kb')) return;
    var sec = document.createElement('section');
    sec.id = 'ctab-kb';
    sec.className = 'ctab-panel';
    sec.innerHTML = '<div class="kb-panel"><h2 class="kb-heading">Help & FAQ</h2>' +
      '<p class="kb-sub">Search common fixes before opening a ticket.</p>' +
      '<div class="kb-toolbar"><input type="search" id="kb-search" placeholder="Search help articles…" />' +
      '<select id="kb-filter-cat"><option value="">All categories</option>' +
      CATEGORIES.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') +
      '</select></div><div id="kb-faq-list" class="kb-faq-list"></div>' +
      '<p class="kb-still">Still stuck? <button type="button" class="btn btn-primary btn-sm" id="kb-go-ticket">Submit a ticket</button></p></div>';
    var credit = main.querySelector('.credit-footer');
    if (credit) main.insertBefore(sec, credit);
    else main.appendChild(sec);

    btn.addEventListener('click', function () {
      document.querySelectorAll('#portal-customer .ctab').forEach(function (t) { t.classList.toggle('active', t === btn); });
      document.querySelectorAll('#portal-customer .ctab-panel').forEach(function (p) { p.classList.toggle('active', p.id === 'ctab-kb'); });
      loadCustomerFaq();
    });
    document.getElementById('kb-search').addEventListener('input', applyCustomerFaqFilter);
    document.getElementById('kb-filter-cat').addEventListener('change', applyCustomerFaqFilter);
    document.getElementById('kb-go-ticket').addEventListener('click', function () {
      var sub = document.querySelector('#portal-customer .ctab[data-ctab="submit"]');
      if (sub) sub.click();
    });
  }

  function bindGlobalClicks() {
    if (document.__kbClickBound) return;
    document.__kbClickBound = true;
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var kbNav = t.closest('#nav-kb, .nav-btn[data-view="kb"]');
      if (kbNav) {
        e.preventDefault();
        e.stopPropagation();
        showKbView();
        return;
      }
      var otherNav = t.closest('#portal-agent .nav-btn');
      if (otherNav && otherNav.getAttribute('data-view') !== 'kb' && otherNav.id !== 'nav-kb') {
        restoreTopbarFilters();
      }
    }, true);
  }

  function boot() {
    ensureEditor();
    ensureCustomerTab();
    ensureAgentUi();
    bindGlobalClicks();
    var shell = document.getElementById('app-shell') || document.body;
    new MutationObserver(function () {
      ensureCustomerTab();
      ensureAgentUi();
    }).observe(shell, { attributes: true, childList: true, subtree: true });
    setTimeout(function () { ensureAgentUi(); ensureCustomerTab(); }, 1200);
    setTimeout(function () { ensureAgentUi(); }, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 300);

  window.DR_KB = { show: showKbView, loadCustomerFaq: loadCustomerFaq, loadAgentKb: loadAgentKb, openEditor: openEditor };
})();
