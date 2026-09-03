/**
 * Divine Rays Tech Hub v5.3
 * Credit: Lizzz · All Rights Reserved
 */
const TICKETS_KEY = 'divineRaysTickets_v5';
const USERS_KEY = 'divineRaysUsers_v5';
const SESSION_KEY = 'divineRaysSession_v5';

function loadTickets() { try { return JSON.parse(localStorage.getItem(TICKETS_KEY)) || []; } catch (e) { return []; } }
function saveTickets(t) { localStorage.setItem(TICKETS_KEY, JSON.stringify(t)); }
function loadUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; } }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
function setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

function generateId() {
  var tickets = loadTickets();
  var next = tickets.length ? Math.max.apply(null, tickets.map(function (t) { return t.num || 1000; })) + 1 : 1001;
  return { id: 'DR-' + next, num: next };
}
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return iso; }
}
function statusClass(s) { return 'badge-' + String(s || '').toLowerCase().replace(/\s+/g, '-'); }
function priorityClass(p) { return 'badge-' + String(p || '').toLowerCase(); }
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
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
  }, 3000);
}
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

function loginCustomer(email, password) {
  var users = loadUsers();
  var user = users.find(function (u) {
    return u.role === 'customer' && u.email && u.email.toLowerCase() === String(email).toLowerCase().trim() && u.password === password;
  });
  return user ? { role: 'customer', email: user.email, name: user.name } : null;
}
function loginAgent(username, password) {
  var users = loadUsers();
  var user = users.find(function (u) {
    return u.role === 'agent' && u.username && u.username.toLowerCase() === String(username).toLowerCase().trim() && u.password === password;
  });
  return user ? { role: 'agent', username: user.username, name: user.name } : null;
}
function registerCustomer(name, email, password) {
  var users = loadUsers();
  var cleanEmail = String(email).toLowerCase().trim();
  if (users.some(function (u) { return u.email && u.email.toLowerCase() === cleanEmail; })) {
    return { error: 'An account with this email already exists.' };
  }
  users.push({ email: cleanEmail, password: password, name: String(name).trim(), role: 'customer' });
  saveUsers(users);
  return { user: { role: 'customer', email: cleanEmail, name: String(name).trim() } };
}
function registerAgent(name, username, password) {
  var users = loadUsers();
  var cleanUser = String(username).toLowerCase().trim();
  if (users.some(function (u) { return u.username && u.username.toLowerCase() === cleanUser; })) {
    return { error: 'This username is already taken.' };
  }
  users.push({ username: cleanUser, password: password, name: String(name).trim(), role: 'agent' });
  saveUsers(users);
  return { user: { role: 'agent', username: cleanUser, name: String(name).trim() } };
}
function getAgentNames() {
  return loadUsers().filter(function (u) { return u.role === 'agent'; }).map(function (u) { return u.name; });
}

function showApp(session) {
  var loginScreen = document.getElementById('login-screen');
  var appShell = document.getElementById('app-shell');
  if (loginScreen) loginScreen.hidden = true;
  if (appShell) appShell.hidden = false;
  var portalCustomer = document.getElementById('portal-customer');
  var portalAgent = document.getElementById('portal-agent');
  if (portalCustomer) portalCustomer.classList.remove('active');
  if (portalAgent) portalAgent.classList.remove('active');
  if (session.role === 'customer') {
    if (portalCustomer) portalCustomer.classList.add('active');
    var label = document.getElementById('logged-user-label');
    if (label) label.textContent = session.name + ' (Customer)';
    var welcome = document.getElementById('cust-welcome-name');
    if (welcome) welcome.textContent = session.name.split(' ')[0];
    showCustomerTab('submit');
  } else {
    if (portalAgent) portalAgent.classList.add('active');
    var label2 = document.getElementById('logged-user-label');
    if (label2) label2.textContent = session.name + ' (Agent)';
    var agentName = document.getElementById('agent-name-display');
    if (agentName) agentName.textContent = session.name;
    refreshAssignDropdown();
    showAgentView('dashboard');
  }
}

function showLoginScreen() {
  var loginScreen = document.getElementById('login-screen');
  var appShell = document.getElementById('app-shell');
  if (loginScreen) loginScreen.hidden = false;
  if (appShell) appShell.hidden = true;
  clearSession();
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
  var formId = tab === 'customer' ? 'login-customer' : 'login-agent';
  var form = document.getElementById(formId);
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

function refreshAssignDropdown() {
  var sel = document.getElementById('assign-agent');
  if (!sel) return;
  var current = sel.value;
  var names = getAgentNames();
  sel.innerHTML = '<option value="">— Unassigned —</option>' +
    names.map(function (n) { return '<option value="' + escapeHtml(n) + '">' + escapeHtml(n) + '</option>'; }).join('');
  if (current) sel.value = current;
}

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

function renderMyTickets() {
  var session = getSession();
  if (!session || session.role !== 'customer') return;
  var container = document.getElementById('my-tickets-list');
  if (!container) return;
  var tickets = loadTickets().filter(function (t) {
    return t.email && t.email.toLowerCase() === session.email.toLowerCase();
  });
  tickets.sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
  if (tickets.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>You have no tickets yet.</p><p style="font-size:0.9rem">Submit one from the first tab.</p></div>';
    return;
  }
  container.innerHTML = tickets.map(function (t) {
    return '<div class="ticket-card" data-id="' + t.id + '"><div><h4>' + escapeHtml(t.title) + '</h4><div class="ticket-meta"><span class="ticket-id">' + t.id + '</span><span>' + formatDate(t.updatedAt) + '</span><span>' + escapeHtml(t.category) + '</span>' + (t.assignedTo ? '<span>Agent: ' + escapeHtml(t.assignedTo) + '</span>' : '') + '</div></div><div class="badges"><span class="badge ' + statusClass(t.status) + '">' + t.status + '</span><span class="badge ' + priorityClass(t.priority) + '">' + t.priority + '</span></div></div>';
  }).join('');
  container.querySelectorAll('.ticket-card').forEach(function (card) {
    card.addEventListener('click', function () { openCustomerTicket(card.getAttribute('data-id')); });
  });
}

function openCustomerTicket(id) {
  var ticket = loadTickets().find(function (t) { return t.id === id; });
  if (!ticket) return;
  currentCustTicketId = id;
  showCustomerTab('detail');
  var detail = document.getElementById('cust-ticket-detail');
  if (detail) {
    detail.innerHTML = '<h3>' + escapeHtml(ticket.title) + '</h3><div class="detail-meta"><span class="ticket-id">' + ticket.id + '</span><span class="badge ' + statusClass(ticket.status) + '">' + ticket.status + '</span><span class="badge ' + priorityClass(ticket.priority) + '">' + ticket.priority + '</span><span>' + escapeHtml(ticket.category) + '</span><span>Created ' + formatDate(ticket.createdAt) + '</span>' + (ticket.assignedTo ? '<span>Assigned to ' + escapeHtml(ticket.assignedTo) + '</span>' : '') + '</div><div class="detail-description">' + escapeHtml(ticket.description) + '</div>';
  }
  var publicComments = (ticket.comments || []).filter(function (c) { return !c.internal; });
  var list = document.getElementById('cust-comments-list');
  if (list) {
    list.innerHTML = publicComments.length === 0
      ? '<p style="color:var(--text-muted);font-size:0.88rem">No replies yet.</p>'
      : publicComments.slice().reverse().map(function (c) {
          return '<div class="comment"><div class="comment-header"><span>' + escapeHtml(c.author) + '</span><span>' + formatDate(c.createdAt) + (c.statusChange ? ' · → ' + c.statusChange : '') + '</span></div><div class="comment-body">' + escapeHtml(c.text) + '</div></div>';
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
    custForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var session = getSession();
      if (!session) return;
      var ids = generateId();
      var now = new Date().toISOString();
      var ticket = {
        id: ids.id, num: ids.num,
        title: document.getElementById('c-title').value.trim(),
        description: document.getElementById('c-description').value.trim(),
        priority: document.getElementById('c-priority').value,
        category: document.getElementById('c-category').value,
        status: 'Open', requester: session.name, email: session.email, assignedTo: '',
        createdAt: now, updatedAt: now, comments: []
      };
      var tickets = loadTickets();
      tickets.push(ticket);
      saveTickets(tickets);
      custForm.hidden = true;
      var success = document.getElementById('submit-success');
      if (success) success.hidden = false;
      var newId = document.getElementById('new-ticket-id');
      if (newId) newId.textContent = ids.id;
      toast('Ticket ' + ids.id + ' created', 'success');
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
    btnTrack.addEventListener('click', function () {
      var id = document.getElementById('track-id').value.trim().toUpperCase();
      var ticket = loadTickets().find(function (t) { return t.id.toUpperCase() === id; });
      var box = document.getElementById('track-result');
      if (!box) return;
      if (!ticket) {
        box.hidden = false;
        box.innerHTML = '<p style="color:var(--danger)">No ticket found with that ID.</p>';
        return;
      }
      var publicComments = (ticket.comments || []).filter(function (c) { return !c.internal; });
      box.hidden = false;
      box.innerHTML = '<h3 style="margin-bottom:0.55rem">' + escapeHtml(ticket.title) + '</h3><div class="detail-meta" style="margin-bottom:0.9rem"><span class="ticket-id">' + ticket.id + '</span><span class="badge ' + statusClass(ticket.status) + '">' + ticket.status + '</span><span class="badge ' + priorityClass(ticket.priority) + '">' + ticket.priority + '</span><span>Submitted ' + formatDate(ticket.createdAt) + '</span>' + (ticket.assignedTo ? '<span>Assigned to ' + escapeHtml(ticket.assignedTo) + '</span>' : '') + '</div><p style="margin-bottom:0.9rem;color:var(--text-muted)">' + escapeHtml(ticket.description) + '</p><h4 style="font-size:0.88rem;margin-bottom:0.45rem">Updates</h4>' + (publicComments.length === 0 ? '<p style="color:var(--text-muted);font-size:0.88rem">No public updates yet.</p>' : publicComments.slice().reverse().map(function (c) {
        return '<div class="comment" style="margin-bottom:0.45rem"><div class="comment-header"><span>' + escapeHtml(c.author) + '</span><span>' + formatDate(c.createdAt) + (c.statusChange ? ' · → ' + c.statusChange : '') + '</span></div><div class="comment-body">' + escapeHtml(c.text) + '</div></div>';
      }).join(''));
    });
  }
  var replyForm = document.getElementById('cust-reply-form');
  if (replyForm) {
    replyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!currentCustTicketId) return;
      var text = document.getElementById('cust-reply-text').value.trim();
      if (!text) return;
      var session = getSession();
      var tickets = loadTickets();
      var ticket = tickets.find(function (t) { return t.id === currentCustTicketId; });
      if (!ticket) return;
      ticket.comments = ticket.comments || [];
      ticket.comments.push({ text: text, author: session.name, createdAt: new Date().toISOString(), internal: false });
      ticket.updatedAt = new Date().toISOString();
      if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
        ticket.status = 'Waiting';
        ticket.comments.push({ text: 'Customer replied — status set to Waiting', author: 'System', createdAt: new Date().toISOString(), internal: true, statusChange: 'Waiting' });
      }
      saveTickets(tickets);
      document.getElementById('cust-reply-text').value = '';
      toast('Reply sent', 'success');
      openCustomerTicket(currentCustTicketId);
    });
  }
}

var currentTicketId = null;
var currentView = 'dashboard';
var listFilter = { mode: 'all' };

function renderStats() {
  var tickets = loadTickets();
  var counts = { Open: 0, 'In Progress': 0, Waiting: 0, Resolved: 0, unassigned: 0 };
  tickets.forEach(function (t) {
    if (counts[t.status] !== undefined) counts[t.status]++;
    if (!t.assignedTo && t.status !== 'Resolved' && t.status !== 'Closed') counts.unassigned++;
  });
  var el;
  if ((el = document.getElementById('stat-open'))) el.textContent = counts.Open;
  if ((el = document.getElementById('stat-progress'))) el.textContent = counts['In Progress'];
  if ((el = document.getElementById('stat-waiting'))) el.textContent = counts.Waiting;
  if ((el = document.getElementById('stat-unassigned'))) el.textContent = counts.unassigned;
  if ((el = document.getElementById('stat-resolved'))) el.textContent = counts.Resolved;
}

function renderTicketList() {
  var container = document.getElementById('ticket-list');
  if (!container) return;
  var tickets = loadTickets();
  var session = getSession();
  var agentName = (session && session.name) || '';
  var statusF = (document.getElementById('filter-status') || {}).value || '';
  var priorityF = (document.getElementById('filter-priority') || {}).value || '';
  var searchEl = document.getElementById('search-input');
  var search = searchEl ? searchEl.value.trim().toLowerCase() : '';
  if (listFilter.mode === 'my') tickets = tickets.filter(function (t) { return t.assignedTo === agentName; });
  else if (listFilter.mode === 'unassigned') tickets = tickets.filter(function (t) { return !t.assignedTo && t.status !== 'Resolved' && t.status !== 'Closed'; });
  if (statusF) tickets = tickets.filter(function (t) { return t.status === statusF; });
  if (priorityF) tickets = tickets.filter(function (t) { return t.priority === priorityF; });
  if (search) {
    tickets = tickets.filter(function (t) {
      return (t.title || '').toLowerCase().indexOf(search) !== -1 || (t.id || '').toLowerCase().indexOf(search) !== -1 ||
        (t.requester || '').toLowerCase().indexOf(search) !== -1 || (t.email || '').toLowerCase().indexOf(search) !== -1 ||
        (t.description || '').toLowerCase().indexOf(search) !== -1;
    });
  }
  var prioOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  tickets.sort(function (a, b) {
    function statusWeight(s) { return (s === 'Open' || s === 'In Progress') ? 0 : (s === 'Waiting' ? 1 : 2); }
    var sw = statusWeight(a.status) - statusWeight(b.status);
    if (sw !== 0) return sw;
    var pw = (prioOrder[a.priority] != null ? prioOrder[a.priority] : 9) - (prioOrder[b.priority] != null ? prioOrder[b.priority] : 9);
    if (pw !== 0) return pw;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
  if (tickets.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No tickets match the current filters.</p></div>';
    return;
  }
  container.innerHTML = tickets.map(function (t) {
    return '<div class="ticket-card" data-id="' + t.id + '"><div><h4>' + escapeHtml(t.title) + '</h4><div class="ticket-meta"><span class="ticket-id">' + t.id + '</span><span>' + escapeHtml(t.requester) + '</span><span>' + formatDate(t.updatedAt) + '</span><span>' + escapeHtml(t.category) + '</span>' + (t.assignedTo ? '<span>→ ' + escapeHtml(t.assignedTo) + '</span>' : '<span style="color:var(--warning)">Unassigned</span>') + '</div></div><div class="badges"><span class="badge ' + statusClass(t.status) + '">' + t.status + '</span><span class="badge ' + priorityClass(t.priority) + '">' + t.priority + '</span></div></div>';
  }).join('');
  container.querySelectorAll('.ticket-card').forEach(function (card) {
    card.addEventListener('click', function () { openTicket(card.getAttribute('data-id')); });
  });
}

function openTicket(id) {
  var ticket = loadTickets().find(function (t) { return t.id === id; });
  if (!ticket) return;
  currentTicketId = id;
  showAgentView('detail');
  var pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = ticket.id;
  var detail = document.getElementById('ticket-detail');
  if (detail) {
    detail.innerHTML = '<h3>' + escapeHtml(ticket.title) + '</h3><div class="detail-meta"><span class="ticket-id">' + ticket.id + '</span><span class="badge ' + statusClass(ticket.status) + '">' + ticket.status + '</span><span class="badge ' + priorityClass(ticket.priority) + '">' + ticket.priority + '</span><span>' + escapeHtml(ticket.category) + '</span><span>Requester: ' + escapeHtml(ticket.requester) + '</span>' + (ticket.email ? '<span>' + escapeHtml(ticket.email) + '</span>' : '') + '<span>Created ' + formatDate(ticket.createdAt) + '</span><span>Assigned: ' + (ticket.assignedTo ? escapeHtml(ticket.assignedTo) : '—') + '</span></div><div class="detail-description">' + escapeHtml(ticket.description) + '</div>';
  }
  refreshAssignDropdown();
  var assignEl = document.getElementById('assign-agent');
  if (assignEl) assignEl.value = ticket.assignedTo || '';
  var statusEl = document.getElementById('quick-status');
  if (statusEl) statusEl.value = ticket.status;
  renderComments(ticket);
}

function renderComments(ticket) {
  var list = document.getElementById('comments-list');
  if (!list) return;
  var comments = ticket.comments || [];
  list.innerHTML = comments.length === 0
    ? '<p style="color:var(--text-muted);font-size:0.88rem">No activity yet.</p>'
    : comments.slice().reverse().map(function (c) {
        return '<div class="comment' + (c.internal ? ' internal' : '') + '"><div class="comment-header"><span>' + escapeHtml(c.author) + (c.internal ? ' · Internal' : '') + '</span><span>' + formatDate(c.createdAt) + (c.statusChange ? ' · → ' + c.statusChange : '') + '</span></div><div class="comment-body">' + escapeHtml(c.text) + '</div></div>';
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
    btnClaim.addEventListener('click', function () {
      if (!currentTicketId) return;
      var session = getSession();
      var tickets = loadTickets();
      var ticket = tickets.find(function (t) { return t.id === currentTicketId; });
      if (!ticket) return;
      if (ticket.assignedTo === session.name) { toast('You already own this ticket', 'info'); return; }
      ticket.assignedTo = session.name;
      if (ticket.status === 'Open') ticket.status = 'In Progress';
      ticket.comments = ticket.comments || [];
      ticket.comments.push({ text: 'Claimed by ' + session.name, author: session.name, createdAt: new Date().toISOString(), internal: true, statusChange: ticket.status });
      ticket.updatedAt = new Date().toISOString();
      saveTickets(tickets);
      var assignEl = document.getElementById('assign-agent');
      if (assignEl) assignEl.value = session.name;
      var statusEl = document.getElementById('quick-status');
      if (statusEl) statusEl.value = ticket.status;
      toast('Ticket claimed', 'success');
      openTicket(currentTicketId);
      renderStats();
    });
  }
  var btnSave = document.getElementById('btn-save-meta');
  if (btnSave) {
    btnSave.addEventListener('click', function () {
      if (!currentTicketId) return;
      var tickets = loadTickets();
      var ticket = tickets.find(function (t) { return t.id === currentTicketId; });
      if (!ticket) return;
      var session = getSession();
      var newAgent = document.getElementById('assign-agent').value;
      var newStatus = document.getElementById('quick-status').value;
      var changed = false;
      if (ticket.assignedTo !== newAgent) {
        ticket.comments = ticket.comments || [];
        ticket.comments.push({ text: newAgent ? 'Assigned to ' + newAgent : 'Unassigned', author: session.name, createdAt: new Date().toISOString(), internal: true });
        ticket.assignedTo = newAgent;
        changed = true;
      }
      if (ticket.status !== newStatus) {
        ticket.comments = ticket.comments || [];
        ticket.comments.push({ text: 'Status changed to ' + newStatus, author: session.name, createdAt: new Date().toISOString(), internal: false, statusChange: newStatus });
        ticket.status = newStatus;
        changed = true;
      }
      if (changed) {
        ticket.updatedAt = new Date().toISOString();
        saveTickets(tickets);
        toast('Ticket updated', 'success');
        openTicket(currentTicketId);
        renderStats();
      } else {
        toast('No changes to save', 'info');
      }
    });
  }
  var commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!currentTicketId) return;
      var text = document.getElementById('comment-text').value.trim();
      if (!text) return;
      var tickets = loadTickets();
      var ticket = tickets.find(function (t) { return t.id === currentTicketId; });
      if (!ticket) return;
      var session = getSession();
      var isInternal = document.getElementById('comment-internal').checked;
      ticket.comments = ticket.comments || [];
      ticket.comments.push({ text: text, author: session.name, createdAt: new Date().toISOString(), internal: isInternal });
      ticket.updatedAt = new Date().toISOString();
      saveTickets(tickets);
      document.getElementById('comment-text').value = '';
      document.getElementById('comment-internal').checked = false;
      toast(isInternal ? 'Internal note added' : 'Reply added', 'success');
      openTicket(currentTicketId);
    });
  }
  var btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', function () {
      var data = JSON.stringify(loadTickets(), null, 2);
      var blob = new Blob([data], { type: 'application/json' });
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

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.ltab').forEach(function (btn) {
    btn.addEventListener('click', function () { switchLoginTab(btn.getAttribute('data-ltab')); });
  });

  var loginCust = document.getElementById('login-customer');
  if (loginCust) {
    loginCust.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var email = document.getElementById('cust-email').value.trim();
      var password = document.getElementById('cust-password').value;
      var user = loginCustomer(email, password);
      if (!user) { showError('login-customer', 'Invalid email or password.'); return; }
      setSession(user);
      showApp(user);
      toast('Welcome back, ' + user.name.split(' ')[0], 'success');
    });
  }

  var loginAgentForm = document.getElementById('login-agent');
  if (loginAgentForm) {
    loginAgentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var username = document.getElementById('agent-username').value.trim();
      var password = document.getElementById('agent-password').value;
      var user = loginAgent(username, password);
      if (!user) { showError('login-agent', 'Invalid username or password.'); return; }
      setSession(user);
      showApp(user);
      toast('Welcome, ' + user.name, 'success');
    });
  }

  var regCust = document.getElementById('register-customer');
  if (regCust) {
    regCust.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var name = document.getElementById('reg-cust-name').value.trim();
      var email = document.getElementById('reg-cust-email').value.trim();
      var password = document.getElementById('reg-cust-password').value;
      var result = registerCustomer(name, email, password);
      if (result.error) { showError('register-customer', result.error); return; }
      setSession(result.user);
      showApp(result.user);
      toast('Account created — welcome!', 'success');
    });
  }

  var regAgent = document.getElementById('register-agent');
  if (regAgent) {
    regAgent.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var name = document.getElementById('reg-agent-name').value.trim();
      var username = document.getElementById('reg-agent-username').value.trim();
      var password = document.getElementById('reg-agent-password').value;
      var result = registerAgent(name, username, password);
      if (result.error) { showError('register-agent', result.error); return; }
      setSession(result.user);
      showApp(result.user);
      toast('Agent account created — welcome!', 'success');
    });
  }

  var btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      showLoginScreen();
      toast('Logged out', 'info');
    });
  }

  try { setupCustomer(); } catch (err) { console.error('setupCustomer', err); }
  try { setupAgent(); } catch (err) { console.error('setupAgent', err); }

  var session = getSession();
  if (session) showApp(session);
  else showLoginScreen();
});
