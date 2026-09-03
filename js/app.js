/**
 * Divine Rays Tech Hub v6.0 — Supabase backend
 * Credit: Lizzz · All Rights Reserved
 * Shared across devices when SUPABASE_URL + SUPABASE_ANON_KEY are set in js/config.js
 */
(function () {
  'use strict';
  var cfg = window.DR_CONFIG || {};
  var sb = null;
  var usingCloud = false;
  if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) {
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    usingCloud = true;
  }
  function toast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all 0.25s';
      setTimeout(function () { el.remove(); }, 250);
    }, 3200);
  }
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }
  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso || ''; }
  }
  function statusClass(s) { return 'badge-' + String(s || '').toLowerCase().replace(/\s+/g, '-'); }
  function priorityClass(p) { return 'badge-' + String(p || '').toLowerCase(); }
  function showError(formId, msg) {
    var form = document.getElementById(formId);
    if (!form) return;
    var err = form.querySelector('.login-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'login-error';
      form.insertBefore(err, form.firstChild);
    }
    err.textContent = msg;
  }
  function clearErrors() {
    document.querySelectorAll('.login-error').forEach(function (e) { e.remove(); });
  }
  function requireCloud() {
    if (!usingCloud) {
      toast('Supabase is not configured. Add URL + key in js/config.js', 'error');
      return false;
    }
    return true;
  }
  var currentProfile = null;
  async function loadProfile() {
    if (!usingCloud) return null;
    var res = await sb.auth.getSession();
    var session = res.data && res.data.session;
    if (!session) { currentProfile = null; return null; }
    var uid = session.user.id;
    var email = session.user.email || '';
    var result = await sb.from('profiles').select('id, full_name, role, username').eq('id', uid).single();
    if (result.error || !result.data) { currentProfile = null; return null; }
    var data = result.data;
    currentProfile = { id: data.id, name: data.full_name, role: data.role, username: data.username, email: email };
    return currentProfile;
  }
  async function signUpCustomer(name, email, password) {
    var result = await sb.auth.signUp({
      email: email.trim(), password: password,
      options: { data: { full_name: name.trim(), role: 'customer' } }
    });
    if (result.error) return { error: result.error.message };
    if (!result.data.user) return { error: 'Signup failed.' };
    await new Promise(function (r) { setTimeout(r, 500); });
    var profile = await loadProfile();
    if (!profile) {
      await sb.from('profiles').upsert({ id: result.data.user.id, full_name: name.trim(), role: 'customer' });
      profile = await loadProfile();
    }
    return { user: profile };
  }
  async function signUpAgent(name, username, password, email) {
    var agentEmail = email || (username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') + '@agent.divinerays.app');
    var result = await sb.auth.signUp({
      email: agentEmail.trim(), password: password,
      options: { data: { full_name: name.trim(), role: 'agent', username: username.trim().toLowerCase() } }
    });
    if (result.error) return { error: result.error.message };
    if (!result.data.user) return { error: 'Signup failed.' };
    await new Promise(function (r) { setTimeout(r, 500); });
    var profile = await loadProfile();
    if (!profile) {
      await sb.from('profiles').upsert({ id: result.data.user.id, full_name: name.trim(), role: 'agent', username: username.trim().toLowerCase() });
      profile = await loadProfile();
    }
    return { user: profile };
  }
  async function signInWithEmail(email, password) {
    var result = await sb.auth.signInWithPassword({ email: email.trim(), password: password });
    if (result.error) return { error: result.error.message };
    var profile = await loadProfile();
    if (!profile) return { error: 'Profile not found. Try again in a moment.' };
    return { user: profile };
  }
  async function signInAgent(usernameOrEmail, password) {
    var login = usernameOrEmail.trim();
    var email = login.indexOf('@') === -1
      ? login.toLowerCase().replace(/[^a-z0-9._-]/g, '') + '@agent.divinerays.app'
      : login;
    return signInWithEmail(email, password);
  }
  async function signOut() {
    if (usingCloud) await sb.auth.signOut();
    currentProfile = null;
  }
  async function fetchTickets(filters) {
    filters = filters || {};
    var q = sb.from('tickets').select('*').order('updated_at', { ascending: false });
    if (filters.requesterId) q = q.eq('requester_id', filters.requesterId);
    if (filters.assignedTo) q = q.eq('assigned_to', filters.assignedTo);
    if (filters.unassigned) q = q.is('assigned_to', null).not('status', 'in', '("Resolved","Closed")');
    if (filters.status) q = q.eq('status', filters.status);
    if (filters.priority) q = q.eq('priority', filters.priority);
    var result = await q;
    if (result.error) {
      console.error(result.error);
      toast('Could not load tickets: ' + result.error.message, 'error');
      return [];
    }
    return result.data || [];
  }
  async function fetchTicketByNumber(num) {
    var result = await sb.from('tickets').select('*').eq('ticket_number', num.toUpperCase()).maybeSingle();
    return result.error ? null : result.data;
  }
  async function fetchTicketById(id) {
    var result = await sb.from('tickets').select('*').eq('id', id).single();
    return result.error ? null : result.data;
  }
  async function createTicket(payload) {
    var result = await sb.from('tickets').insert({
      title: payload.title, description: payload.description,
      priority: payload.priority, category: payload.category,
      status: 'Open', requester_id: currentProfile.id
    }).select().single();
    if (result.error) return { error: result.error.message };
    return { ticket: result.data };
  }
  async function updateTicket(id, patch) {
    var result = await sb.from('tickets').update(patch).eq('id', id).select().single();
    if (result.error) return { error: result.error.message };
    return { ticket: result.data };
  }
  async function fetchComments(ticketId) {
    var result = await sb.from('comments').select('*, author:profiles(full_name)').eq('ticket_id', ticketId).order('created_at', { ascending: true });
    if (result.error) {
      var res2 = await sb.from('comments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
      return res2.data || [];
    }
    return result.data || [];
  }
  async function addComment(ticketId, body, isInternal, statusChange) {
    var row = { ticket_id: ticketId, author_id: currentProfile.id, body: body, is_internal: !!isInternal };
    if (statusChange) row.status_change = statusChange;
    var result = await sb.from('comments').insert(row).select().single();
    if (result.error) return { error: result.error.message };
    return { comment: result.data };
  }
  async function fetchAgents() {
    var result = await sb.from('profiles').select('id, full_name, username').eq('role', 'agent').order('full_name');
    return result.error ? [] : (result.data || []);
  }
  async function fetchProfileNames(ids) {
    if (!ids || !ids.length) return {};
    var unique = [];
    ids.forEach(function (id) { if (id && unique.indexOf(id) === -1) unique.push(id); });
    if (!unique.length) return {};
    var result = await sb.from('profiles').select('id, full_name').in('id', unique);
    var map = {};
    (result.data || []).forEach(function (p) { map[p.id] = p.full_name; });
    return map;
  }
  function hideLoginShowApp() {
    var login = document.getElementById('login-screen');
    var app = document.getElementById('app-shell');
    if (login) {
      login.hidden = true; login.classList.add('is-hidden');
      login.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;';
    }
    if (app) {
      app.hidden = false; app.classList.remove('is-hidden'); app.style.cssText = '';
    }
    window.scrollTo(0, 0);
  }
  function showLoginHideApp() {
    var login = document.getElementById('login-screen');
    var app = document.getElementById('app-shell');
    if (login) {
      login.hidden = false; login.classList.remove('is-hidden'); login.style.cssText = '';
    }
    if (app) {
      app.hidden = true; app.classList.add('is-hidden');
      app.style.cssText = 'display:none!important';
    }
    window.scrollTo(0, 0);
  }
  function showApp(profile) {
    hideLoginShowApp();
    var portalCustomer = document.getElementById('portal-customer');
    var portalAgent = document.getElementById('portal-agent');
    if (portalCustomer) portalCustomer.classList.remove('active');
    if (portalAgent) portalAgent.classList.remove('active');
    if (profile.role === 'customer') {
      if (portalCustomer) portalCustomer.classList.add('active');
      var label = document.getElementById('logged-user-label');
      if (label) label.textContent = profile.name + ' (Customer)';
      var welcome = document.getElementById('cust-welcome-name');
      if (welcome) welcome.textContent = profile.name.split(' ')[0];
      showCustomerTab('submit');
    } else {
      if (portalAgent) portalAgent.classList.add('active');
      var label2 = document.getElementById('logged-user-label');
      if (label2) label2.textContent = profile.name + ' (Agent)';
      var agentName = document.getElementById('agent-name-display');
      if (agentName) agentName.textContent = profile.name;
      refreshAssignDropdown();
      showAgentView('dashboard');
    }
  }
  function showLoginScreen() {
    showLoginHideApp();
    clearErrors();
    ['login-customer', 'login-agent', 'register-customer', 'register-agent'].forEach(function (id) {
      var f = document.getElementById(id);
      if (f) f.reset();
    });
    switchLoginTab('customer');
  }
  function switchLoginTab(tab) {
    document.querySelectorAll('.ltab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.login-form').forEach(function (f) { f.classList.remove('active'); });
    var tabBtn = document.querySelector('[data-ltab="' + tab + '"]');
    if (tabBtn) tabBtn.classList.add('active');
    var form = document.getElementById(tab === 'customer' ? 'login-customer' : 'login-agent');
    if (form) form.classList.add('active');
    clearErrors();
  }
  function showForm(formId) {
    document.querySelectorAll('.login-form').forEach(function (f) { f.classList.remove('active'); });
    var form = document.getElementById(formId);
    if (form) form.classList.add('active');
    clearErrors();
  }
  window.showForm = showForm;
  window.switchLoginTab = switchLoginTab;
  window.showApp = showApp;
  window.showLoginScreen = showLoginScreen;
  var currentCustTicketId = null;
  function showCustomerTab(name) {
    document.querySelectorAll('.ctab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.ctab-panel').forEach(function (p) { p.classList.remove('active'); });
    if (name !== 'detail') {
      var tab = document.querySelector('[data-ctab="' + name + '"]');
      if (tab) tab.classList.add('active');
    }
    var panel = document.getElementById('ctab-' + name);
    if (panel) panel.classList.add('active');
    if (name === 'mytickets') renderMyTickets();
  }
  async function renderMyTickets() {
    if (!currentProfile) return;
    var container = document.getElementById('my-tickets-list');
    if (!container) return;
    container.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';
    var tickets = await fetchTickets({ requesterId: currentProfile.id });
    if (!tickets.length) {
      container.innerHTML = '<div class="empty-state"><p>You have no tickets yet.</p><p style="font-size:0.9rem">Submit one from the first tab.</p></div>';
      return;
    }
    container.innerHTML = tickets.map(function (t) {
      return '<div class="ticket-card" data-id="' + t.id + '"><div><h4>' + escapeHtml(t.title) + '</h4><div class="ticket-meta"><span class="ticket-id">' + escapeHtml(t.ticket_number) + '</span><span>' + formatDate(t.updated_at) + '</span><span>' + escapeHtml(t.category) + '</span></div></div><div class="badges"><span class="badge ' + statusClass(t.status) + '">' + t.status + '</span><span class="badge ' + priorityClass(t.priority) + '">' + t.priority + '</span></div></div>';
    }).join('');
    container.querySelectorAll('.ticket-card').forEach(function (card) {
      card.addEventListener('click', function () { openCustomerTicket(card.getAttribute('data-id')); });
    });
  }
  async function openCustomerTicket(id) {
    var ticket = await fetchTicketById(id);
    if (!ticket) return;
    currentCustTicketId = id;
    showCustomerTab('detail');
    var detail = document.getElementById('cust-ticket-detail');
    if (detail) {
      detail.innerHTML = '<h3>' + escapeHtml(ticket.title) + '</h3><div class="detail-meta"><span class="ticket-id">' + escapeHtml(ticket.ticket_number) + '</span><span class="badge ' + statusClass(ticket.status) + '">' + ticket.status + '</span><span class="badge ' + priorityClass(ticket.priority) + '">' + ticket.priority + '</span><span>' + escapeHtml(ticket.category) + '</span><span>Created ' + formatDate(ticket.created_at) + '</span></div><div class="detail-description">' + escapeHtml(ticket.description) + '</div>';
    }
    var comments = await fetchComments(id);
    var publicComments = comments.filter(function (c) { return !c.is_internal; });
    var list = document.getElementById('cust-comments-list');
    if (list) {
      list.innerHTML = publicComments.length === 0
        ? '<p style="color:var(--text-muted);font-size:0.88rem">No replies yet.</p>'
        : publicComments.slice().reverse().map(function (c) {
            var author = (c.author && c.author.full_name) || 'Support';
            return '<div class="comment"><div class="comment-header"><span>' + escapeHtml(author) + '</span><span>' + formatDate(c.created_at) + (c.status_change ? ' · → ' + escapeHtml(c.status_change) : '') + '</span></div><div class="comment-body">' + escapeHtml(c.body) + '</div></div>';
          }).join('');
    }
  }
  function setupCustomer() {
    document.querySelectorAll('.ctab').forEach(function (btn) {
      btn.addEventListener('click', function () { showCustomerTab(btn.getAttribute('data-ctab')); });
    });
    var btnBack = document.getElementById('btn-cust-back');
    if (btnBack) btnBack.addEventListener('click', function () { showCustomerTab('mytickets'); });
    var custForm = document.getElementById('customer-form');
    if (custForm) {
      custForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!requireCloud() || !currentProfile) return;
        var result = await createTicket({
          title: document.getElementById('c-title').value.trim(),
          description: document.getElementById('c-description').value.trim(),
          priority: document.getElementById('c-priority').value,
          category: document.getElementById('c-category').value
        });
        if (result.error) { toast(result.error, 'error'); return; }
        custForm.hidden = true;
        var success = document.getElementById('submit-success');
        if (success) success.hidden = false;
        var newId = document.getElementById('new-ticket-id');
        if (newId) newId.textContent = result.ticket.ticket_number;
        toast('Ticket ' + result.ticket.ticket_number + ' created', 'success');
      });
    }
    var btnGo = document.getElementById('btn-go-mytickets');
    if (btnGo) {
      btnGo.addEventListener('click', function () {
        if (custForm) { custForm.hidden = false; custForm.reset(); }
        var success = document.getElementById('submit-success');
        if (success) success.hidden = true;
        showCustomerTab('mytickets');
      });
    }
    var btnTrack = document.getElementById('btn-track');
    if (btnTrack) {
      btnTrack.addEventListener('click', async function () {
        if (!requireCloud()) return;
        var id = document.getElementById('track-id').value.trim().toUpperCase();
        var ticket = await fetchTicketByNumber(id);
        var box = document.getElementById('track-result');
        if (!box) return;
        if (!ticket) {
          box.hidden = false;
          box.innerHTML = '<p style="color:var(--danger)">No ticket found with that ID.</p>';
          return;
        }
        var comments = await fetchComments(ticket.id);
        var publicComments = comments.filter(function (c) { return !c.is_internal; });
        box.hidden = false;
        box.innerHTML = '<h3 style="margin-bottom:0.55rem">' + escapeHtml(ticket.title) + '</h3><div class="detail-meta" style="margin-bottom:0.9rem"><span class="ticket-id">' + escapeHtml(ticket.ticket_number) + '</span><span class="badge ' + statusClass(ticket.status) + '">' + ticket.status + '</span><span class="badge ' + priorityClass(ticket.priority) + '">' + ticket.priority + '</span><span>Submitted ' + formatDate(ticket.created_at) + '</span></div><p style="margin-bottom:0.9rem;color:var(--text-muted)">' + escapeHtml(ticket.description) + '</p><h4 style="font-size:0.88rem;margin-bottom:0.45rem">Updates</h4>' +
          (publicComments.length === 0
            ? '<p style="color:var(--text-muted);font-size:0.88rem">No public updates yet.</p>'
            : publicComments.slice().reverse().map(function (c) {
                var author = (c.author && c.author.full_name) || 'Support';
                return '<div class="comment" style="margin-bottom:0.45rem"><div class="comment-header"><span>' + escapeHtml(author) + '</span><span>' + formatDate(c.created_at) + (c.status_change ? ' · → ' + escapeHtml(c.status_change) : '') + '</span></div><div class="comment-body">' + escapeHtml(c.body) + '</div></div>';
              }).join(''));
      });
    }
    var replyForm = document.getElementById('cust-reply-form');
    if (replyForm) {
      replyForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentCustTicketId || !requireCloud()) return;
        var text = document.getElementById('cust-reply-text').value.trim();
        if (!text) return;
        var result = await addComment(currentCustTicketId, text, false);
        if (result.error) { toast(result.error, 'error'); return; }
        var ticket = await fetchTicketById(currentCustTicketId);
        if (ticket && (ticket.status === 'Resolved' || ticket.status === 'Closed')) {
          await updateTicket(currentCustTicketId, { status: 'Waiting' });
          await addComment(currentCustTicketId, 'Customer replied — status set to Waiting', true, 'Waiting');
        }
        document.getElementById('cust-reply-text').value = '';
        toast('Reply sent', 'success');
        openCustomerTicket(currentCustTicketId);
      });
    }
  }
  var currentTicketId = null;
  var currentView = 'dashboard';
  var listFilter = { mode: 'all' };
  var nameCache = {};
  async function refreshAssignDropdown() {
    var sel = document.getElementById('assign-agent');
    if (!sel) return;
    var current = sel.value;
    var agents = await fetchAgents();
    sel.innerHTML = '<option value="">— Unassigned —</option>' +
      agents.map(function (a) { return '<option value="' + a.id + '">' + escapeHtml(a.full_name) + '</option>'; }).join('');
    if (current) sel.value = current;
  }
  async function renderStats() {
    var tickets = await fetchTickets({});
    var counts = { Open: 0, 'In Progress': 0, Waiting: 0, Resolved: 0, unassigned: 0 };
    tickets.forEach(function (t) {
      if (counts[t.status] !== undefined) counts[t.status]++;
      if (!t.assigned_to && t.status !== 'Resolved' && t.status !== 'Closed') counts.unassigned++;
    });
    var el;
    if ((el = document.getElementById('stat-open'))) el.textContent = counts.Open;
    if ((el = document.getElementById('stat-progress'))) el.textContent = counts['In Progress'];
    if ((el = document.getElementById('stat-waiting'))) el.textContent = counts.Waiting;
    if ((el = document.getElementById('stat-unassigned'))) el.textContent = counts.unassigned;
    if ((el = document.getElementById('stat-resolved'))) el.textContent = counts.Resolved;
  }
  async function renderTicketList() {
    var container = document.getElementById('ticket-list');
    if (!container) return;
    container.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';
    var filters = {};
    if (listFilter.mode === 'my' && currentProfile) filters.assignedTo = currentProfile.id;
    if (listFilter.mode === 'unassigned') filters.unassigned = true;
    var statusF = (document.getElementById('filter-status') || {}).value || '';
    var priorityF = (document.getElementById('filter-priority') || {}).value || '';
    if (statusF) filters.status = statusF;
    if (priorityF) filters.priority = priorityF;
    var tickets = await fetchTickets(filters);
    var searchEl = document.getElementById('search-input');
    var search = searchEl ? searchEl.value.trim().toLowerCase() : '';
    if (search) {
      tickets = tickets.filter(function (t) {
        return (t.title || '').toLowerCase().indexOf(search) !== -1
          || (t.ticket_number || '').toLowerCase().indexOf(search) !== -1
          || (t.description || '').toLowerCase().indexOf(search) !== -1;
      });
    }
    var ids = [];
    tickets.forEach(function (t) {
      if (t.requester_id) ids.push(t.requester_id);
      if (t.assigned_to) ids.push(t.assigned_to);
    });
    nameCache = Object.assign(nameCache, await fetchProfileNames(ids));
    var prioOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    tickets.sort(function (a, b) {
      function sw(s) { return (s === 'Open' || s === 'In Progress') ? 0 : (s === 'Waiting' ? 1 : 2); }
      var s = sw(a.status) - sw(b.status);
      if (s) return s;
      var p = (prioOrder[a.priority] != null ? prioOrder[a.priority] : 9) - (prioOrder[b.priority] != null ? prioOrder[b.priority] : 9);
      if (p) return p;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
    if (!tickets.length) {
      container.innerHTML = '<div class="empty-state"><p>No tickets match the current filters.</p></div>';
      return;
    }
    container.innerHTML = tickets.map(function (t) {
      var requester = nameCache[t.requester_id] || 'Customer';
      var assignee = t.assigned_to ? (nameCache[t.assigned_to] || 'Agent') : null;
      return '<div class="ticket-card" data-id="' + t.id + '"><div><h4>' + escapeHtml(t.title) + '</h4><div class="ticket-meta"><span class="ticket-id">' + escapeHtml(t.ticket_number) + '</span><span>' + escapeHtml(requester) + '</span><span>' + formatDate(t.updated_at) + '</span><span>' + escapeHtml(t.category) + '</span>' + (assignee ? '<span>→ ' + escapeHtml(assignee) + '</span>' : '<span style="color:var(--warning)">Unassigned</span>') + '</div></div><div class="badges"><span class="badge ' + statusClass(t.status) + '">' + t.status + '</span><span class="badge ' + priorityClass(t.priority) + '">' + t.priority + '</span></div></div>';
    }).join('');
    container.querySelectorAll('.ticket-card').forEach(function (card) {
      card.addEventListener('click', function () { openTicket(card.getAttribute('data-id')); });
    });
  }
  async function openTicket(id) {
    var ticket = await fetchTicketById(id);
    if (!ticket) return;
    currentTicketId = id;
    showAgentView('detail');
    var pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = ticket.ticket_number;
    nameCache = Object.assign(nameCache, await fetchProfileNames([ticket.requester_id, ticket.assigned_to]));
    var requester = nameCache[ticket.requester_id] || 'Customer';
    var detail = document.getElementById('ticket-detail');
    if (detail) {
      detail.innerHTML = '<h3>' + escapeHtml(ticket.title) + '</h3><div class="detail-meta"><span class="ticket-id">' + escapeHtml(ticket.ticket_number) + '</span><span class="badge ' + statusClass(ticket.status) + '">' + ticket.status + '</span><span class="badge ' + priorityClass(ticket.priority) + '">' + ticket.priority + '</span><span>' + escapeHtml(ticket.category) + '</span><span>Requester: ' + escapeHtml(requester) + '</span><span>Created ' + formatDate(ticket.created_at) + '</span><span>Assigned: ' + (ticket.assigned_to ? escapeHtml(nameCache[ticket.assigned_to] || 'Agent') : '—') + '</span></div><div class="detail-description">' + escapeHtml(ticket.description) + '</div>';
    }
    await refreshAssignDropdown();
    var assignEl = document.getElementById('assign-agent');
    if (assignEl) assignEl.value = ticket.assigned_to || '';
    var statusEl = document.getElementById('quick-status');
    if (statusEl) statusEl.value = ticket.status;
    await renderComments(ticket.id);
  }
  async function renderComments(ticketId) {
    var list = document.getElementById('comments-list');
    if (!list) return;
    var comments = await fetchComments(ticketId);
    list.innerHTML = comments.length === 0
      ? '<p style="color:var(--text-muted);font-size:0.88rem">No activity yet.</p>'
      : comments.slice().reverse().map(function (c) {
          var author = (c.author && c.author.full_name) || nameCache[c.author_id] || 'User';
          return '<div class="comment' + (c.is_internal ? ' internal' : '') + '"><div class="comment-header"><span>' + escapeHtml(author) + (c.is_internal ? ' · Internal' : '') + '</span><span>' + formatDate(c.created_at) + (c.status_change ? ' · → ' + escapeHtml(c.status_change) : '') + '</span></div><div class="comment-body">' + escapeHtml(c.body) + '</div></div>';
        }).join('');
  }
  function showAgentView(name) {
    document.querySelectorAll('#portal-agent .view').forEach(function (v) { v.classList.remove('active'); });
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (b) { b.classList.remove('active'); });
    if (name === 'detail') {
      var detailView = document.getElementById('view-detail');
      if (detailView) detailView.classList.add('active');
      return;
    }
    currentView = name;
    var dash = document.getElementById('view-dashboard');
    if (dash) dash.classList.add('active');
    var titles = { dashboard: 'Dashboard', 'my-tickets': 'My Tickets', unassigned: 'Unassigned', 'all-tickets': 'All Tickets' };
    var pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titles[name] || 'Dashboard';
    var navBtn = document.querySelector('#portal-agent [data-view="' + name + '"]');
    if (navBtn) navBtn.classList.add('active');
    listFilter.mode = name === 'my-tickets' ? 'my' : (name === 'unassigned' ? 'unassigned' : 'all');
    renderStats();
    renderTicketList();
  }
  function setupAgent() {
    document.querySelectorAll('#portal-agent .nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { showAgentView(btn.getAttribute('data-view')); });
    });
    var btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.addEventListener('click', function () { showAgentView(currentView || 'dashboard'); });
    ['filter-status', 'filter-priority', 'search-input'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      function refresh() {
        var dash = document.getElementById('view-dashboard');
        if (dash && dash.classList.contains('active')) { renderStats(); renderTicketList(); }
      }
      el.addEventListener('input', refresh);
      el.addEventListener('change', refresh);
    });
    var btnClaim = document.getElementById('btn-claim');
    if (btnClaim) {
      btnClaim.addEventListener('click', async function () {
        if (!currentTicketId || !currentProfile) return;
        var ticket = await fetchTicketById(currentTicketId);
        if (!ticket) return;
        if (ticket.assigned_to === currentProfile.id) { toast('You already own this ticket', 'info'); return; }
        var patch = { assigned_to: currentProfile.id };
        if (ticket.status === 'Open') patch.status = 'In Progress';
        var result = await updateTicket(currentTicketId, patch);
        if (result.error) { toast(result.error, 'error'); return; }
        await addComment(currentTicketId, 'Claimed by ' + currentProfile.name, true, patch.status || ticket.status);
        toast('Ticket claimed', 'success');
        openTicket(currentTicketId);
        renderStats();
      });
    }
    var btnSave = document.getElementById('btn-save-meta');
    if (btnSave) {
      btnSave.addEventListener('click', async function () {
        if (!currentTicketId) return;
        var ticket = await fetchTicketById(currentTicketId);
        if (!ticket) return;
        var newAgent = document.getElementById('assign-agent').value || null;
        var newStatus = document.getElementById('quick-status').value;
        var patch = {};
        var notes = [];
        if ((ticket.assigned_to || null) !== newAgent) {
          patch.assigned_to = newAgent;
          notes.push(newAgent ? 'Assigned to agent' : 'Unassigned');
        }
        if (ticket.status !== newStatus) {
          patch.status = newStatus;
          notes.push('Status changed to ' + newStatus);
        }
        if (!Object.keys(patch).length) { toast('No changes to save', 'info'); return; }
        var result = await updateTicket(currentTicketId, patch);
        if (result.error) { toast(result.error, 'error'); return; }
        for (var i = 0; i < notes.length; i++) {
          var internal = notes[i].indexOf('Assigned') === 0 || notes[i].indexOf('Unassigned') === 0;
          await addComment(currentTicketId, notes[i], internal, patch.status || null);
        }
        toast('Ticket updated', 'success');
        openTicket(currentTicketId);
        renderStats();
      });
    }
    var commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentTicketId) return;
        var text = document.getElementById('comment-text').value.trim();
        if (!text) return;
        var isInternal = document.getElementById('comment-internal').checked;
        var result = await addComment(currentTicketId, text, isInternal);
        if (result.error) { toast(result.error, 'error'); return; }
        document.getElementById('comment-text').value = '';
        document.getElementById('comment-internal').checked = false;
        toast(isInternal ? 'Internal note added' : 'Reply added', 'success');
        openTicket(currentTicketId);
      });
    }
    var btnExport = document.getElementById('btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', async function () {
        var tickets = await fetchTickets({});
        var blob = new Blob([JSON.stringify(tickets, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'divine-rays-tickets-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        toast('Tickets exported', 'success');
      });
    }
  }
  function setupAuthForms() {
    document.querySelectorAll('.ltab').forEach(function (btn) {
      btn.addEventListener('click', function () { switchLoginTab(btn.getAttribute('data-ltab')); });
    });
    var loginCust = document.getElementById('login-customer');
    if (loginCust) {
      loginCust.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();
        if (!requireCloud()) return;
        var result = await signInWithEmail(
          document.getElementById('cust-email').value.trim(),
          document.getElementById('cust-password').value
        );
        if (result.error) { showError('login-customer', result.error); return; }
        if (result.user.role !== 'customer') {
          await signOut();
          showError('login-customer', 'This account is not a customer account.');
          return;
        }
        showApp(result.user);
        toast('Welcome back, ' + result.user.name.split(' ')[0], 'success');
      });
    }
    var loginAgentForm = document.getElementById('login-agent');
    if (loginAgentForm) {
      loginAgentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();
        if (!requireCloud()) return;
        var result = await signInAgent(
          document.getElementById('agent-username').value.trim(),
          document.getElementById('agent-password').value
        );
        if (result.error) { showError('login-agent', result.error); return; }
        if (result.user.role !== 'agent') {
          await signOut();
          showError('login-agent', 'This account is not an agent account.');
          return;
        }
        showApp(result.user);
        toast('Welcome, ' + result.user.name, 'success');
      });
    }
    var regCust = document.getElementById('register-customer');
    if (regCust) {
      regCust.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();
        if (!requireCloud()) return;
        var result = await signUpCustomer(
          document.getElementById('reg-cust-name').value.trim(),
          document.getElementById('reg-cust-email').value.trim(),
          document.getElementById('reg-cust-password').value
        );
        if (result.error) { showError('register-customer', result.error); return; }
        showApp(result.user);
        toast('Account created — welcome!', 'success');
      });
    }
    var regAgent = document.getElementById('register-agent');
    if (regAgent) {
      regAgent.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();
        if (!requireCloud()) return;
        var name = document.getElementById('reg-agent-name').value.trim();
        var emailEl = document.getElementById('reg-agent-email');
        var email = emailEl ? emailEl.value.trim() : '';
        var username = document.getElementById('reg-agent-username').value.trim();
        var password = document.getElementById('reg-agent-password').value;
        var result = await signUpAgent(name, username, password, email || null);
        if (result.error) { showError('register-agent', result.error); return; }
        showApp(result.user);
        toast('Agent account created — welcome!', 'success');
      });
    }
    var btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async function () {
        await signOut();
        showLoginScreen();
        toast('Logged out', 'info');
      });
    }
  }
  function showConfigBanner() {
    if (usingCloud) return;
    var card = document.querySelector('.login-card');
    if (!card) return;
    var banner = document.createElement('div');
    banner.className = 'login-error';
    banner.style.marginBottom = '1rem';
    banner.innerHTML = '<strong>Cloud storage not connected yet.</strong><br>Add your Supabase URL + anon key in <code>js/config.js</code>, run <code>supabase/schema.sql</code>, then refresh.';
    var brand = card.querySelector('.login-brand');
    if (brand && brand.nextSibling) card.insertBefore(banner, brand.nextSibling);
    else card.insertBefore(banner, card.firstChild);
  }
  document.addEventListener('DOMContentLoaded', async function () {
    setupAuthForms();
    try { setupCustomer(); } catch (err) { console.error(err); }
    try { setupAgent(); } catch (err) { console.error(err); }
    showConfigBanner();
    if (usingCloud) {
      var profile = await loadProfile();
      if (profile) showApp(profile);
      else showLoginScreen();
      sb.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_OUT') {
          currentProfile = null;
          showLoginScreen();
        }
      });
    } else {
      showLoginScreen();
    }
  });
})();
