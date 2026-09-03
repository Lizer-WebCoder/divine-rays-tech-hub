/**
 * Divine Rays Tech Hub — Ticketing System v3
 * Login for Customers + Tech Support Agents
 * All data in localStorage
 */

const TICKETS_KEY = 'divineRaysTickets_v3';
const USERS_KEY = 'divineRaysUsers_v3';
const SESSION_KEY = 'divineRaysSession_v3';

// ---------- Demo / Seed Data ----------
const DEMO_AGENTS = [
  { username: 'alex', password: 'support1', name: 'Alex Chen', role: 'agent' },
  { username: 'jordan', password: 'support1', name: 'Jordan Smith', role: 'agent' },
  { username: 'sam', password: 'support1', name: 'Sam Rivera', role: 'agent' },
  { username: 'taylor', password: 'support1', name: 'Taylor Kim', role: 'agent' }
];

const DEMO_CUSTOMERS = [
  { email: 'alex.r@example.com', password: 'demo123', name: 'Alex Rivera', role: 'customer' },
  { email: 'jordan.l@example.com', password: 'demo123', name: 'Jordan Lee', role: 'customer' },
  { email: 'sam.p@example.com', password: 'demo123', name: 'Sam Patel', role: 'customer' }
];

function ensureSeedData() {
  // Users
  let users = loadUsers();
  if (users.length === 0) {
    users = [...DEMO_AGENTS, ...DEMO_CUSTOMERS];
    saveUsers(users);
  }

  // Tickets
  if (loadTickets().length > 0) return;
  const now = Date.now();
  const samples = [
    {
      id: 'DR-1001', num: 1001,
      title: 'Laptop will not connect to office Wi-Fi',
      description: 'Windows laptop shows "Connected, no internet" on the main SSID. Works on mobile hotspot.',
      priority: 'High', category: 'Network', status: 'Open',
      requester: 'Alex Rivera', email: 'alex.r@example.com',
      assignedTo: '', createdAt: new Date(now - 5*3600000).toISOString(),
      updatedAt: new Date(now - 5*3600000).toISOString(), comments: []
    },
    {
      id: 'DR-1002', num: 1002,
      title: 'Need access to shared Finance folder',
      description: 'New hire needs read/write access to \\\\fileserver\\Finance. Manager already approved.',
      priority: 'Medium', category: 'Account', status: 'In Progress',
      requester: 'Jordan Lee', email: 'jordan.l@example.com',
      assignedTo: 'Alex Chen',
      createdAt: new Date(now - 26*3600000).toISOString(),
      updatedAt: new Date(now - 30*60000).toISOString(),
      comments: [{
        text: 'Verified manager approval. Creating AD group membership.',
        author: 'Alex Chen', createdAt: new Date(now - 30*60000).toISOString(),
        internal: false, statusChange: 'In Progress'
      }]
    },
    {
      id: 'DR-1003', num: 1003,
      title: 'Outlook keeps asking for password',
      description: 'Every morning Outlook prompts for credentials even though password was not changed.',
      priority: 'Low', category: 'Software', status: 'Resolved',
      requester: 'Sam Patel', email: 'sam.p@example.com',
      assignedTo: 'Jordan Smith',
      createdAt: new Date(now - 72*3600000).toISOString(),
      updatedAt: new Date(now - 8*3600000).toISOString(),
      comments: [{
        text: 'Cleared credential manager and recreated Outlook profile. Resolved.',
        author: 'Jordan Smith', createdAt: new Date(now - 8*3600000).toISOString(),
        internal: false, statusChange: 'Resolved'
      }]
    },
    {
      id: 'DR-1004', num: 1004,
      title: 'Printer on 3rd floor offline',
      description: 'HP LaserJet on 3rd floor shows offline. Users cannot print.',
      priority: 'Critical', category: 'Hardware', status: 'Open',
      requester: 'Alex Rivera', email: 'alex.r@example.com',
      assignedTo: '', createdAt: new Date(now - 90*60000).toISOString(),
      updatedAt: new Date(now - 90*60000).toISOString(), comments: []
    }
  ];
  saveTickets(samples);
}

// ---------- Storage helpers ----------
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
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function generateId() {
  const tickets = loadTickets();
  const next = tickets.length ? Math.max(...tickets.map(t => t.num)) + 1 : 1001;
  return { id: `DR-${next}`, num: next };
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function statusClass(s) { return 'badge-' + s.toLowerCase().replace(/\s+/g, '-'); }
function priorityClass(p) { return 'badge-' + p.toLowerCase(); }

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showError(formId, msg) {
  const form = document.getElementById(formId);
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
  const user = users.find(u => u.role === 'customer' && u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return null;
  return { role: 'customer', email: user.email, name: user.name };
}

function loginAgent(username, password) {
  const users = loadUsers();
  const user = users.find(u => u.role === 'agent' && u.username === username && u.password === password);
  if (!user) return null;
  return { role: 'agent', username: user.username, name: user.name };
}

function registerCustomer(name, email, password) {
  const users = loadUsers();
  if (users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists.' };
  }
  const newUser = { email, password, name, role: 'customer' };
  users.push(newUser);
  saveUsers(users);
  return { user: { role: 'customer', email, name } };
}

// ---------- Session UI ----------
function showApp(session) {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('app-shell').hidden = false;

  document.getElementById('portal-customer').classList.remove('active');
  document.getElementById('portal-agent').classList.remove('active');

  if (session.role === 'customer') {
    document.getElementById('portal-customer').classList.add('active');
    document.getElementById('logged-user-label').textContent = session.name + ' (Customer)';
    document.getElementById('cust-welcome-name').textContent = session.name.split(' ')[0];
    // Pre-fill nothing needed; tickets linked by email
    showCustomerTab('submit');
  } else {
    document.getElementById('portal-agent').classList.add('active');
    document.getElementById('logged-user-label').textContent = session.name + ' (Agent)';
    document.getElementById('agent-name-display').textContent = session.name;
    showAgentView('dashboard');
  }
}

function showLoginScreen() {
  document.getElementById('login-screen').hidden = false;
  document.getElementById('app-shell').hidden = true;
  clearSession();
  clearErrors();
  // Reset forms
  document.getElementById('login-customer').reset();
  document.getElementById('login-agent').reset();
  document.getElementById('register-customer').reset();
  switchLoginTab('customer');
}

// ---------- Login UI helpers ----------
function switchLoginTab(tab) {
  document.querySelectorAll('.ltab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));

  document.querySelector(`[data-ltab="${tab}"]`)?.classList.add('active');

  if (tab === 'customer') {
    document.getElementById('login-customer').classList.add('active');
  } else {
    document.getElementById('login-agent').classList.add('active');
  }
  // Hide register when switching
  document.getElementById('register-customer').classList.remove('active');
  clearErrors();
}

function showRegisterForm() {
  document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
  document.getElementById('register-customer').classList.add('active');
  clearErrors();
}

function showLoginForm() {
  document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
  document.getElementById('login-customer').classList.add('active');
  clearErrors();
}

// ---------- Customer Portal ----------
function showCustomerTab(name) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.ctab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-ctab="${name}"]`)?.classList.add('active');
  document.getElementById('ctab-' + name)?.classList.add('active');

  if (name === 'mytickets') renderMyTickets();
}

function renderMyTickets() {
  const session = getSession();
  if (!session || session.role !== 'customer') return;

  const container = document.getElementById('my-tickets-list');
  let tickets = loadTickets().filter(t => t.email.toLowerCase() === session.email.toLowerCase());
  tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (tickets.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>You have no tickets yet.</p><p style="font-size:0.9rem">Submit one from the first tab.</p></div>`;
    return;
  }

  container.innerHTML = tickets.map(t => `
    <div class="ticket-card" data-id="${t.id}" style="cursor:default">
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
}

function setupCustomer() {
  document.querySelectorAll('.ctab').forEach(btn => {
    btn.addEventListener('click', () => showCustomerTab(btn.dataset.ctab));
  });

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
      createdAt: now,
      updatedAt: now,
      comments: []
    };

    const tickets = loadTickets();
    tickets.push(ticket);
    saveTickets(tickets);

    document.getElementById('customer-form').hidden = true;
    document.getElementById('submit-success').hidden = false;
    document.getElementById('new-ticket-id').textContent = id;
  });

  document.getElementById('btn-go-mytickets').addEventListener('click', () => {
    document.getElementById('customer-form').hidden = false;
    document.getElementById('submit-success').hidden = true;
    document.getElementById('customer-form').reset();
    showCustomerTab('mytickets');
  });

  document.getElementById('btn-track').addEventListener('click', () => {
    const id = document.getElementById('track-id').value.trim().toUpperCase();
    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id.toUpperCase() === id);

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
              <div class="comment-header">
                <span>${escapeHtml(c.author)}</span>
                <span>${formatDate(c.createdAt)}${c.statusChange ? ` · → ${c.statusChange}` : ''}</span>
              </div>
              <div class="comment-body">${escapeHtml(c.text)}</div>
            </div>`).join('')
      }
    `;
  });
}

// ---------- Agent Console ----------
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

  if (listFilter.mode === 'my') {
    tickets = tickets.filter(t => t.assignedTo === agentName);
  } else if (listFilter.mode === 'unassigned') {
    tickets = tickets.filter(t => !t.assignedTo && t.status !== 'Resolved' && t.status !== 'Closed');
  }

  if (statusF) tickets = tickets.filter(t => t.status === statusF);
  if (priorityF) tickets = tickets.filter(t => t.priority === priorityF);

  if (search) {
    tickets = tickets.filter(t =>
      t.title.toLowerCase().includes(search) ||
      t.id.toLowerCase().includes(search) ||
      t.requester.toLowerCase().includes(search) ||
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
  const tickets = loadTickets();
  const ticket = tickets.find(t => t.id === id);
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

  document.getElementById('assign-agent').value = ticket.assignedTo || '';
  document.getElementById('quick-status').value = ticket.status;
  renderComments(ticket);
}

function renderComments(ticket) {
  const list = document.getElementById('comments-list');
  const comments = ticket.comments || [];
  if (comments.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted);font-size:0.88rem">No activity yet.</p>`;
    return;
  }
  list.innerHTML = comments.slice().reverse().map(c => `
    <div class="comment ${c.internal ? 'internal' : ''}">
      <div class="comment-header">
        <span>${escapeHtml(c.author)}${c.internal ? ' · Internal' : ''}</span>
        <span>${formatDate(c.createdAt)}${c.statusChange ? ` · → ${c.statusChange}` : ''}</span>
      </div>
      <div class="comment-body">${escapeHtml(c.text)}</div>
    </div>
  `).join('');
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

  const titles = {
    dashboard: 'Dashboard',
    'my-tickets': 'My Tickets',
    unassigned: 'Unassigned',
    'all-tickets': 'All Tickets'
  };
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
      ticket.comments.push({
        text: newAgent ? `Assigned to ${newAgent}` : 'Unassigned',
        author: session.name,
        createdAt: new Date().toISOString(),
        internal: true
      });
      ticket.assignedTo = newAgent;
      changed = true;
    }

    if (ticket.status !== newStatus) {
      ticket.comments = ticket.comments || [];
      ticket.comments.push({
        text: `Status changed to ${newStatus}`,
        author: session.name,
        createdAt: new Date().toISOString(),
        internal: false,
        statusChange: newStatus
      });
      ticket.status = newStatus;
      changed = true;
    }

    if (changed) {
      ticket.updatedAt = new Date().toISOString();
      saveTickets(tickets);
      openTicket(currentTicketId);
      renderStats();
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
    ticket.comments.push({
      text,
      author: session.name,
      createdAt: new Date().toISOString(),
      internal: isInternal
    });
    ticket.updatedAt = new Date().toISOString();
    saveTickets(tickets);

    document.getElementById('comment-text').value = '';
    document.getElementById('comment-internal').checked = false;
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
  });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  ensureSeedData();

  // Login tabs
  document.querySelectorAll('.ltab').forEach(btn => {
    btn.addEventListener('click', () => switchLoginTab(btn.dataset.ltab));
  });

  document.getElementById('show-register').addEventListener('click', e => {
    e.preventDefault();
    showRegisterForm();
  });
  document.getElementById('show-login').addEventListener('click', e => {
    e.preventDefault();
    showLoginForm();
  });

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
  });

  // Agent login
  document.getElementById('login-agent').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const username = document.getElementById('agent-username').value.trim().toLowerCase();
    const password = document.getElementById('agent-password').value;
    const user = loginAgent(username, password);
    if (!user) {
      showError('login-agent', 'Invalid username or password.');
      return;
    }
    setSession(user);
    showApp(user);
  });

  // Register
  document.getElementById('register-customer').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const result = registerCustomer(name, email, password);
    if (result.error) {
      showError('register-customer', result.error);
      return;
    }
    setSession(result.user);
    showApp(result.user);
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    showLoginScreen();
  });

  setupCustomer();
  setupAgent();

  // Auto-login if session exists
  const session = getSession();
  if (session) {
    showApp(session);
  } else {
    showLoginScreen();
  }
});
