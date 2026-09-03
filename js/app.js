/**
 * Divine Rays Tech Hub — Ticketing System v5
 * No demo accounts. Clean register + login for Customers and Agents.
 * Credit: Lizzz · All Rights Reserved
 */

const TICKETS_KEY = 'divineRaysTickets_v5';
const USERS_KEY = 'divineRaysUsers_v5';
const SESSION_KEY = 'divineRaysSession_v5';

function loadTickets() {
  try { return JSON.parse(localStorage.getItem(TICKETS_KEY)) || []; }
  catch { return []; }
}
function saveTickets(t) { localStorage.setItem(TICKETS_KEY, JSON.stringify(t)); }

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
function setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

function generateId() {
  const tickets = loadTickets();
  const next = tickets.length ? Math.max(...tickets.map(t => t.num || 1000)) + 1 : 1001;
  return { id: `DR-${next}`, num: next };
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function statusClass(s) { return 'badge-' + (s || '').toLowerCase().replace(/\s+/g, '-'); }
function priorityClass(p) { return 'badge-' + (p || '').toLowerCase(); }

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.25s';
    setTimeout(() => el.remove(), 250);
  }, 3000);
}

function showError(formId, msg) {
  const form = document.getElementById(formId);
  if (!form) return;
  let err = form.querySelector('.login-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'login-error';
    form.prepend(err);
  }
  err.textContent = msg;
}
function clearErrors() {
  document.querySelectorAll('.login-error').forEach(e => e.remove());
}

// ---------- Auth ----------
function loginCustomer(email, password) {
  const users = loadUsers();
  const user = users.find(u =>
    u.role === 'customer' &&
    u.email && u.email.toLowerCase() === email.toLowerCase().trim() &&
    u.password === password
  );
  if (!user) return null;
  return { role: 'customer', email: user.email, name: user.name };
}

function loginAgent(username, password) {
  const users = loadUsers();
  const user = users.find(u =>
    u.role === 'agent' &&
    u.username && u.username.toLowerCase() === username.toLowerCase().trim() &&
    u.password === password
  );
  if (!user) return null;
  return { role: 'agent', username: user.username, name: user.name };
}

function registerCustomer(name, email, password) {
  const users = loadUsers();
  const cleanEmail = email.toLowerCase().trim();
  if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
    return { error: 'An account with this email already exists.' };
  }
  users.push({ email: cleanEmail, password, name: name.trim(), role: 'customer' });
  saveUsers(users);
  return { user: { role: 'customer', email: cleanEmail, name: name.trim() } };
}

function registerAgent(name, username, password) {
  const users = loadUsers();
  const cleanUser = username.toLowerCase().trim();
  if (users.some(u => u.username && u.username.toLowerCase() === cleanUser)) {
    return { error: 'This username is already taken.' };
  }
  users.push({ username: cleanUser, password, name: name.trim(), role: 'agent' });
  saveUsers(users);
  return { user: { role: 'agent', username: cleanUser, name: name.trim() } };
}

function getAgentNames() {
  return loadUsers().filter(u => u.role === 'agent').map(u => u.name);
}

// ---------- UI helpers ----------
function showApp(session) {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('app-shell').hidden = false;
  document.getElementById('portal-customer').classList.remove('active');
  document.getElementById('portal-agent').classList.remove('active');

  if (session.role === 'customer') {
    document.getElementById('portal-customer').classList.add('active');
    document.getElementById('logged-user-label').textContent = session.name + ' (Customer)';
    document.getElementById('cust-welcome-name').textContent = session.name.split(' ')[0];
    showCustomerTab('submit');
  } else {
    document.getElementById('portal-agent').classList.add('active');
    document.getElementById('logged-user-label').textContent = session.name + ' (Agent)';
    document.getElementById('agent-name-display').textContent = session.name;
    refreshAssignDropdown();
    showAgentView('dashboard');
  }
}

function showLoginScreen() {
  document.getElementById('login-screen').hidden = false;
  document.getElementById('app-shell').hidden = true;
  clearSession();
  clearErrors();
  ['login-customer','login-agent','register-customer','register-agent'].forEach(id => {
    const f = document.getElementById(id);
    if (f) f.reset();
  });
  switchLoginTab('customer');
}

function switchLoginTab(tab) {
  document.querySelectorAll('.ltab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
  document.querySelector(`[data-ltab="${tab}"]`)?.classList.add('active');
  document.getElementById(tab === 'customer' ? 'login-customer' : 'login-agent')?.classList.add('active');
  clearErrors();
}

function showForm(formId) {
  document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
  document.getElementById(formId)?.classList.add('active');
  clearErrors();
}

function refreshAssignDropdown() {
  const sel = document.getElementById('assign-agent');
  if (!sel) return;
  const current = sel.value;
  const names = getAgentNames();
  sel.innerHTML = '<option value="">— Unassigned —</option>' +
    names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
  if (current) sel.value = current;
}

// ---------- Customer ----------
let currentCustTicketId = null;

function showCustomerTab(name) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.ctab-panel').forEach(p => p.classList.remove('active'));
  if (name !== 'detail') {
    document.querySelector(`[data-ctab="${name}"]`)?.classList.add('active');
  }
  document.getElementById('ctab-' + name)?.classList.add('active');
  if (name === 'mytickets') renderMyTickets();
}

function renderMyTickets() {
  const session = getSession();
  if (!session || session.role !== 'customer') return;
  const container = document.getElementById('my-tickets-list');
  let tickets = loadTickets().filter(t => t.email && t.email.toLowerCase() === session.email.toLowerCase());
  tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (tickets.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>You have no tickets yet.</p><p style="font-size:0.9rem">Submit one from the first tab.</p></div>`;
    return;
  }

  container.innerHTML = tickets.map(t => `
    <div class="ticket-card" data-id="${t.id}">
      <div>
        <h4>${escapeHtml(t.title)}</h4>
        <div class="ticket-meta">
          <span class="ticket-id">${t.id}</span>
          <span>${formatDate(t.updatedAt)}</span>
          <span>${escapeHtml(t.category)}</span>
          ${t.assignedTo ? `<span>Agent: ${escapeHtml(t.assignedTo)}</span>` : ''}
        </div>
      </div>
      <div class="badges">
        <span class="badge ${statusClass(t.status)}">${t.status}</span>
        <span class="badge ${priorityClass(t.priority)}">${t.priority}</span>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.ticket-card').forEach(card => {
    card.addEventListener('click', () => openCustomerTicket(card.dataset.id));
  });
}

function openCustomerTicket(id) {
  const ticket = loadTickets().find(t => t.id === id);
  if (!ticket) return;
  currentCustTicketId = id;
  showCustomerTab('detail');

  document.getElementById('cust-ticket-detail').innerHTML = `
    <h3>${escapeHtml(ticket.title)}</h3>
    <div class="detail-meta">
      <span class="ticket-id">${ticket.id}</span>
      <span class="badge ${statusClass(ticket.status)}">${ticket.status}</span>
      <span class="badge ${priorityClass(ticket.priority)}">${ticket.priority}</span>
      <span>${escapeHtml(ticket.category)}</span>
      <span>Created ${formatDate(ticket.createdAt)}</span>
      ${ticket.assignedTo ? `<span>Assigned to ${escapeHtml(ticket.assignedTo)}</span>` : ''}
    </div>
    <div class="detail-description">${escapeHtml(ticket.description)}</div>
  `;

  const publicComments = (ticket.comments || []).filter(c => !c.internal);
  const list = document.getElementById('cust-comments-list');
  list.innerHTML = publicComments.length === 0
    ? `<p style="color:var(--text-muted);font-size:0.88rem">No replies yet.</p>`
    : publicComments.slice().reverse().map(c => `
        <div class="comment">
          <div class="comment-header">
            <span>${escapeHtml(c.author)}</span>
            <span>${formatDate(c.createdAt)}${c.statusChange ? ` · → ${c.statusChange}` : ''}</span>
          </div>
          <div class="comment-body">${escapeHtml(c.text)}</div>
        </div>`).join('');
}

function setupCustomer() {
  document.querySelectorAll('.ctab').forEach(btn => {
    btn.addEventListener('click', () => showCustomerTab(btn.dataset.ctab));
  });

  document.getElementById('btn-cust-back').addEventListener('click', () => showCustomerTab('mytickets'));

  document.getElementById('customer-form').addEventListener('submit', e => {
    e.preventDefault();
    const session = getSession();
    if (!session) return;
    const { id, num } = generateId();
    const now = new Date().toISOString();
    const ticket = {
      id, num,
      title: document.getElementById('c-title').value.trim(),
      description: document.getElementById('c-description').value.trim(),
      priority: document.getElementById('c-priority').value,
      category: document.getElementById('c-category').value,
      status: 'Open',
      requester: session.name,
      email: session.email,
      assignedTo: '',
      createdAt: now, updatedAt: now, comments: []
    };
    const tickets = loadTickets();
    tickets.push(ticket);
    saveTickets(tickets);
    document.getElementById('customer-form').hidden = true;
    document.getElementById('submit-success').hidden = false;
    document.getElementById('new-ticket-id').textContent = id;
    toast('Ticket ' + id + ' created', 'success');
  });

  document.getElementById('btn-go-mytickets').addEventListener('click', () => {
    document.getElementById('customer-form').hidden = false;
    document.getElementById('submit-success').hidden = true;
    document.getElementById('customer-form').reset();
    showCustomerTab('mytickets');
  });

  document.getElementById('btn-track').addEventListener('click', () => {
    const id = document.getElementById('track-id').value.trim().toUpperCase();
    const ticket = loadTickets().find(t => t.id.toUpperCase() === id);
    const box = document.getElementById('track-result');
    if (!ticket) {
      box.hidden = false;
      box.innerHTML = `<p style="color:var(--danger)">No ticket found with that ID.</p>`;
      return;
    }
    const publicComments = (ticket.comments || []).filter(c => !c.internal);
    box.hidden = false;
    box.innerHTML = `
      <h3 style="margin-bottom:0.55rem">${escapeHtml(ticket.title)}</h3>
      <div class="detail-meta" style="margin-bottom:0.9rem">
        <span class="ticket-id">${ticket.id}</span>
        <span class="badge ${statusClass(ticket.status)}">${ticket.status}</span>
        <span class="badge ${priorityClass(ticket.priority)}">${ticket.priority}</span>
        <span>Submitted ${formatDate(ticket.createdAt)}</span>
        ${ticket.assignedTo ? `<span>Assigned to ${escapeHtml(ticket.assignedTo)}</span>` : ''}
      </div>
      <p style="margin-bottom:0.9rem;color:var(--text-muted)">${escapeHtml(ticket.description)}</p>
      <h4 style="font-size:0.88rem;margin-bottom:0.45rem">Updates</h4>
      ${publicComments.length === 0
        ? `<p style="color:var(--text-muted);font-size:0.88rem">No public updates yet.</p>`
        : publicComments.slice().reverse().map(c => `
            <div class="comment" style="margin-bottom:0.45rem">
              <div class="comment-header"><span>${escapeHtml(c.author)}</span><span>${formatDate(c.createdAt)}${c.statusChange ? ` · → ${c.statusChange}` : ''}</span></div>
              <div class="comment-body">${escapeHtml(c.text)}</div>
            </div>`).join('')}
    `;
  });

  document.getElementById('cust-reply-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!currentCustTicketId) return;
    const text = document.getElementById('cust-reply-text').value.trim();
    if (!text) return;
    const session = getSession();
    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id === currentCustTicketId);
    if (!ticket) return;

    ticket.comments = ticket.comments || [];
    ticket.comments.push({ text, author: session.name, createdAt: new Date().toISOString(), internal: false });
    ticket.updatedAt = new Date().toISOString();
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      ticket.status = 'Waiting';
      ticket.comments.push({
        text: 'Customer replied — status set to Waiting',
        author: 'System', createdAt: new Date().toISOString(),
        internal: true, statusChange: 'Waiting'
      });
    }
    saveTickets(tickets);
    document.getElementById('cust-reply-text').value = '';
    toast('Reply sent', 'success');
    openCustomerTicket(currentCustTicketId);
  });
}

// ---------- Agent ----------
let currentTicketId = null;
let currentView = 'dashboard';
let listFilter = { mode: 'all' };

function renderStats() {
  const tickets = loadTickets();
  const counts = { Open: 0, 'In Progress': 0, Waiting: 0, Resolved: 0, unassigned: 0 };
  tickets.forEach(t => {
    if (counts[t.status] !== undefined) counts[t.status]++;
    if (!t.assignedTo && t.status !== 'Resolved' && t.status !== 'Closed') counts.unassigned++;
  });
  document.getElementById('stat-open').textContent = counts.Open;
  document.getElementById('stat-progress').textContent = counts['In Progress'];
  document.getElementById('stat-waiting').textContent = counts.Waiting;
  document.getElementById('stat-unassigned').textContent = counts.unassigned;
  document.getElementById('stat-resolved').textContent = counts.Resolved;
}

function renderTicketList() {
  const container = document.getElementById('ticket-list');
  let tickets = loadTickets();
  const session = getSession();
  const agentName = session?.name || '';
  const statusF = document.getElementById('filter-status').value;
  const priorityF = document.getElementById('filter-priority').value;
  const search = document.getElementById('search-input').value.trim().toLowerCase();

  if (listFilter.mode === 'my') tickets = tickets.filter(t => t.assignedTo === agentName);
  else if (listFilter.mode === 'unassigned') tickets = tickets.filter(t => !t.assignedTo && t.status !== 'Resolved' && t.status !== 'Closed');

  if (statusF) tickets = tickets.filter(t => t.status === statusF);
  if (priorityF) tickets = tickets.filter(t => t.priority === priorityF);
  if (search) {
    tickets = tickets.filter(t =>
      (t.title || '').toLowerCase().includes(search) ||
      (t.id || '').toLowerCase().includes(search) ||
      (t.requester || '').toLowerCase().includes(search) ||
      (t.email || '').toLowerCase().includes(search) ||
      (t.description || '').toLowerCase().includes(search)
    );
  }

  const prioOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  tickets.sort((a, b) => {
    const statusWeight = s => (s === 'Open' || s === 'In Progress' ? 0 : s === 'Waiting' ? 1 : 2);
    const sw = statusWeight(a.status) - statusWeight(b.status);
    if (sw !== 0) return sw;
    const pw = (prioOrder[a.priority] ?? 9) - (prioOrder[b.priority] ?? 9);
    if (pw !== 0) return pw;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (tickets.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>No tickets match the current filters.</p></div>`;
    return;
  }

  container.innerHTML = tickets.map(t => `
    <div class="ticket-card" data-id="${t.id}">
      <div>
        <h4>${escapeHtml(t.title)}</h4>
        <div class="ticket-meta">
          <span class="ticket-id">${t.id}</span>
          <span>${escapeHtml(t.requester)}</span>
          <span>${formatDate(t.updatedAt)}</span>
          <span>${escapeHtml(t.category)}</span>
          ${t.assignedTo ? `<span>→ ${escapeHtml(t.assignedTo)}</span>` : '<span style="color:var(--warning)">Unassigned</span>'}
        </div>
      </div>
      <div class="badges">
        <span class="badge ${statusClass(t.status)}">${t.status}</span>
        <span class="badge ${priorityClass(t.priority)}">${t.priority}</span>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.ticket-card').forEach(card => {
    card.addEventListener('click', () => openTicket(card.dataset.id));
  });
}

function openTicket(id) {
  const ticket = loadTickets().find(t => t.id === id);
  if (!ticket) return;
  currentTicketId = id;
  showAgentView('detail');
  document.getElementById('page-title').textContent = ticket.id;

  document.getElementById('ticket-detail').innerHTML = `
    <h3>${escapeHtml(ticket.title)}</h3>
    <div class="detail-meta">
      <span class="ticket-id">${ticket.id}</span>
      <span class="badge ${statusClass(ticket.status)}">${ticket.status}</span>
      <span class="badge ${priorityClass(ticket.priority)}">${ticket.priority}</span>
      <span>${escapeHtml(ticket.category)}</span>
      <span>Requester: ${escapeHtml(ticket.requester)}</span>
      ${ticket.email ? `<span>${escapeHtml(ticket.email)}</span>` : ''}
      <span>Created ${formatDate(ticket.createdAt)}</span>
      <span>Assigned: ${ticket.assignedTo ? escapeHtml(ticket.assignedTo) : '—'}</span>
    </div>
    <div class="detail-description">${escapeHtml(ticket.description)}</div>
  `;

  refreshAssignDropdown();
  document.getElementById('assign-agent').value = ticket.assignedTo || '';
  document.getElementById('quick-status').value = ticket.status;
  renderComments(ticket);
}

function renderComments(ticket) {
  const list = document.getElementById('comments-list');
  const comments = ticket.comments || [];
  list.innerHTML = comments.length === 0
    ? `<p style="color:var(--text-muted);font-size:0.88rem">No activity yet.</p>`
    : comments.slice().reverse().map(c => `
        <div class="comment ${c.internal ? 'internal' : ''}">
          <div class="comment-header">
            <span>${escapeHtml(c.author)}${c.internal ? ' · Internal' : ''}</span>
            <span>${formatDate(c.createdAt)}${c.statusChange ? ` · → ${c.statusChange}` : ''}</span>
          </div>
          <div class="comment-body">${escapeHtml(c.text)}</div>
        </div>`).join('');
}

function showAgentView(name) {
  document.querySelectorAll('#portal-agent .view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('#portal-agent .nav-btn').forEach(b => b.classList.remove('active'));
  if (name === 'detail') {
    document.getElementById('view-detail').classList.add('active');
    return;
  }
  currentView = name;
  document.getElementById('view-dashboard').classList.add('active');
  const titles = { dashboard: 'Dashboard', 'my-tickets': 'My Tickets', unassigned: 'Unassigned', 'all-tickets': 'All Tickets' };
  document.getElementById('page-title').textContent = titles[name] || 'Dashboard';
  document.querySelector(`#portal-agent [data-view="${name}"]`)?.classList.add('active');
  listFilter.mode = name === 'my-tickets' ? 'my' : name === 'unassigned' ? 'unassigned' : 'all';
  renderStats();
  renderTicketList();
}

function setupAgent() {
  document.querySelectorAll('#portal-agent .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showAgentView(btn.dataset.view));
  });
  document.getElementById('btn-back').addEventListener('click', () => showAgentView(currentView || 'dashboard'));

  ['filter-status', 'filter-priority', 'search-input'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => { if (document.getElementById('view-dashboard').classList.contains('active')) { renderStats(); renderTicketList(); } });
    el.addEventListener('change', () => { if (document.getElementById('view-dashboard').classList.contains('active')) { renderStats(); renderTicketList(); } });
  });

  document.getElementById('btn-claim').addEventListener('click', () => {
    if (!currentTicketId) return;
    const session = getSession();
    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;
    if (ticket.assignedTo === session.name) {
      toast('You already own this ticket', 'info');
      return;
    }
    ticket.assignedTo = session.name;
    if (ticket.status === 'Open') ticket.status = 'In Progress';
    ticket.comments = ticket.comments || [];
    ticket.comments.push({
      text: `Claimed by ${session.name}`,
      author: session.name, createdAt: new Date().toISOString(),
      internal: true, statusChange: ticket.status
    });
    ticket.updatedAt = new Date().toISOString();
    saveTickets(tickets);
    document.getElementById('assign-agent').value = session.name;
    document.getElementById('quick-status').value = ticket.status;
    toast('Ticket claimed', 'success');
    openTicket(currentTicketId);
    renderStats();
  });

  document.getElementById('btn-save-meta').addEventListener('click', () => {
    if (!currentTicketId) return;
    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;
    const session = getSession();
    const newAgent = document.getElementById('assign-agent').value;
    const newStatus = document.getElementById('quick-status').value;
    let changed = false;

    if (ticket.assignedTo !== newAgent) {
      ticket.comments = ticket.comments || [];
      ticket.comments.push({ text: newAgent ? `Assigned to ${newAgent}` : 'Unassigned', author: session.name, createdAt: new Date().toISOString(), internal: true });
      ticket.assignedTo = newAgent;
      changed = true;
    }
    if (ticket.status !== newStatus) {
      ticket.comments = ticket.comments || [];
      ticket.comments.push({ text: `Status changed to ${newStatus}`, author: session.name, createdAt: new Date().toISOString(), internal: false, statusChange: newStatus });
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

  document.getElementById('comment-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!currentTicketId) return;
    const text = document.getElementById('comment-text').value.trim();
    if (!text) return;
    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;
    const session = getSession();
    const isInternal = document.getElementById('comment-internal').checked;
    ticket.comments = ticket.comments || [];
    ticket.comments.push({ text, author: session.name, createdAt: new Date().toISOString(), internal: isInternal });
    ticket.updatedAt = new Date().toISOString();
    saveTickets(tickets);
    document.getElementById('comment-text').value = '';
    document.getElementById('comment-internal').checked = false;
    toast(isInternal ? 'Internal note added' : 'Reply added', 'success');
    openTicket(currentTicketId);
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const data = JSON.stringify(loadTickets(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divine-rays-tickets-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Tickets exported', 'success');
  });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  // Login tabs
  document.querySelectorAll('.ltab').forEach(btn => {
    btn.addEventListener('click', () => switchLoginTab(btn.dataset.ltab));
  });

  document.getElementById('show-register-customer').addEventListener('click', e => { e.preventDefault(); showForm('register-customer'); });
  document.getElementById('show-login-customer').addEventListener('click', e => { e.preventDefault(); showForm('login-customer'); });
  document.getElementById('show-register-agent').addEventListener('click', e => { e.preventDefault(); showForm('register-agent'); });
  document.getElementById('show-login-agent').addEventListener('click', e => { e.preventDefault(); showForm('login-agent'); });

  // Customer login
  document.getElementById('login-customer').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const email = document.getElementById('cust-email').value.trim();
    const password = document.getElementById('cust-password').value;
    const user = loginCustomer(email, password);
    if (!user) {
      showError('login-customer', 'Invalid email or password.');
      return;
    }
    setSession(user);
    showApp(user);
    toast('Welcome back, ' + user.name.split(' ')[0], 'success');
  });

  // Agent login
  document.getElementById('login-agent').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const username = document.getElementById('agent-username').value.trim();
    const password = document.getElementById('agent-password').value;
    const user = loginAgent(username, password);
    if (!user) {
      showError('login-agent', 'Invalid username or password.');
      return;
    }
    setSession(user);
    showApp(user);
    toast('Welcome, ' + user.name, 'success');
  });

  // Customer register
  document.getElementById('register-customer').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const name = document.getElementById('reg-cust-name').value.trim();
    const email = document.getElementById('reg-cust-email').value.trim();
    const password = document.getElementById('reg-cust-password').value;
    const result = registerCustomer(name, email, password);
    if (result.error) {
      showError('register-customer', result.error);
      return;
    }
    setSession(result.user);
    showApp(result.user);
    toast('Account created — welcome!', 'success');
  });

  // Agent register
  document.getElementById('register-agent').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const name = document.getElementById('reg-agent-name').value.trim();
    const username = document.getElementById('reg-agent-username').value.trim();
    const password = document.getElementById('reg-agent-password').value;
    const result = registerAgent(name, username, password);
    if (result.error) {
      showError('register-agent', result.error);
      return;
    }
    setSession(result.user);
    showApp(result.user);
    toast('Agent account created — welcome!', 'success');
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    showLoginScreen();
    toast('Logged out', 'info');
  });

  setupCustomer();
  setupAgent();

  const session = getSession();
  if (session) showApp(session);
  else showLoginScreen();
});
