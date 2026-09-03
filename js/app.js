/**
 * Divine Rays Tech Hub — Ticketing System v2
 * Customer Portal + Tech Support Agent Console
 * Data stored in localStorage
 */

const STORAGE_KEY = 'divineRaysTickets_v2';
const AGENTS = ['Alex Chen', 'Jordan Smith', 'Sam Rivera', 'Taylor Kim'];

// ---------- Storage ----------
function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
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

// ---------- Sample data ----------
function ensureSampleData() {
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
      requester: 'Morgan Blake', email: 'morgan.b@example.com',
      assignedTo: '', createdAt: new Date(now - 90*60000).toISOString(),
      updatedAt: new Date(now - 90*60000).toISOString(), comments: []
    }
  ];
  saveTickets(samples);
}

// ---------- State ----------
let currentTicketId = null;
let currentView = 'dashboard';
let listFilter = { mode: 'all' }; // all | my | unassigned

// ---------- Mode switching ----------
function setMode(mode) {
  document.getElementById('mode-customer').classList.toggle('active', mode === 'customer');
  document.getElementById('mode-agent').classList.toggle('active', mode === 'agent');
  document.getElementById('portal-customer').classList.toggle('active', mode === 'customer');
  document.getElementById('portal-agent').classList.toggle('active', mode === 'agent');

  if (mode === 'agent') {
    showAgentView('dashboard');
  }
}

// ---------- Customer Portal ----------
function setupCustomer() {
  // Tabs
  document.querySelectorAll('.ctab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ctab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('ctab-' + btn.dataset.ctab).classList.add('active');
    });
  });

  // Submit
  document.getElementById('customer-form').addEventListener('submit', e => {
    e.preventDefault();
    const { id, num } = generateId();
    const now = new Date().toISOString();

    const ticket = {
      id, num,
      title: document.getElementById('c-title').value.trim(),
      description: document.getElementById('c-description').value.trim(),
      priority: document.getElementById('c-priority').value,
      category: document.getElementById('c-category').value,
      status: 'Open',
      requester: document.getElementById('c-name').value.trim(),
      email: document.getElementById('c-email').value.trim(),
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

    document.getElementById('btn-view-new').onclick = () => {
      document.getElementById('track-id').value = id;
      document.querySelector('[data-ctab="track"]').click();
      document.getElementById('btn-track').click();
      document.getElementById('customer-form').hidden = false;
      document.getElementById('submit-success').hidden = true;
      document.getElementById('customer-form').reset();
    };
  });

  // Track
  document.getElementById('btn-track').addEventListener('click', () => {
    const id = document.getElementById('track-id').value.trim().toUpperCase();
    const email = document.getElementById('track-email').value.trim().toLowerCase();
    const tickets = loadTickets();

    let ticket = null;
    if (id) ticket = tickets.find(t => t.id.toUpperCase() === id);
    else if (email) {
      const matches = tickets.filter(t => t.email.toLowerCase() === email);
      ticket = matches.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    }

    const box = document.getElementById('track-result');
    if (!ticket) {
      box.hidden = false;
      box.innerHTML = `<p style="color:var(--danger)">No ticket found. Please check the ID or email.</p>`;
      return;
    }

    // Only show non-internal comments to customer
    const publicComments = (ticket.comments || []).filter(c => !c.internal);

    box.hidden = false;
    box.innerHTML = `
      <h3 style="margin-bottom:0.6rem">${escapeHtml(ticket.title)}</h3>
      <div class="detail-meta" style="margin-bottom:1rem">
        <span class="ticket-id">${ticket.id}</span>
        <span class="badge ${statusClass(ticket.status)}">${ticket.status}</span>
        <span class="badge ${priorityClass(ticket.priority)}">${ticket.priority}</span>
        <span>Submitted ${formatDate(ticket.createdAt)}</span>
        ${ticket.assignedTo ? `<span>Assigned to ${escapeHtml(ticket.assignedTo)}</span>` : ''}
      </div>
      <p style="margin-bottom:1rem;color:var(--text-muted)">${escapeHtml(ticket.description)}</p>
      <h4 style="font-size:0.9rem;margin-bottom:0.5rem">Updates</h4>
      ${publicComments.length === 0
        ? `<p style="color:var(--text-muted);font-size:0.9rem">No public updates yet. We'll notify you when there's progress.</p>`
        : publicComments.slice().reverse().map(c => `
            <div class="comment" style="margin-bottom:0.5rem">
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
  const agent = document.getElementById('current-agent').value;
  const statusF = document.getElementById('filter-status').value;
  const priorityF = document.getElementById('filter-priority').value;
  const search = document.getElementById('search-input').value.trim().toLowerCase();

  // Mode filter
  if (listFilter.mode === 'my') {
    tickets = tickets.filter(t => t.assignedTo === agent);
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

  // Priority order helper
  const prioOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  tickets.sort((a, b) => {
    // Open/In Progress first, then by priority, then by date
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
    list.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem">No activity yet.</p>`;
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

  // Highlight nav
  const navMap = { dashboard: 'dashboard', 'my-tickets': 'my-tickets', unassigned: 'unassigned', 'all-tickets': 'all-tickets' };
  document.querySelector(`#portal-agent [data-view="${navMap[name]}"]`)?.classList.add('active');

  listFilter.mode = name === 'my-tickets' ? 'my' : name === 'unassigned' ? 'unassigned' : 'all';

  renderStats();
  renderTicketList();
}

function setupAgent() {
  // Nav
  document.querySelectorAll('#portal-agent .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showAgentView(btn.dataset.view));
  });

  document.getElementById('btn-back').addEventListener('click', () => showAgentView(currentView || 'dashboard'));

  // Filters
  ['filter-status', 'filter-priority', 'search-input', 'current-agent'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      if (document.getElementById('view-dashboard').classList.contains('active')) {
        renderStats();
        renderTicketList();
      }
    });
    document.getElementById(id).addEventListener('change', () => {
      if (document.getElementById('view-dashboard').classList.contains('active')) {
        renderStats();
        renderTicketList();
      }
    });
  });

  // Save assignment + status
  document.getElementById('btn-save-meta').addEventListener('click', () => {
    if (!currentTicketId) return;
    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;

    const newAgent = document.getElementById('assign-agent').value;
    const newStatus = document.getElementById('quick-status').value;
    const agentName = document.getElementById('current-agent').value;
    let changed = false;

    if (ticket.assignedTo !== newAgent) {
      ticket.comments = ticket.comments || [];
      ticket.comments.push({
        text: newAgent ? `Assigned to ${newAgent}` : 'Unassigned',
        author: agentName,
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
        author: agentName,
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

  // Add comment
  document.getElementById('comment-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!currentTicketId) return;

    const text = document.getElementById('comment-text').value.trim();
    if (!text) return;

    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;

    const agentName = document.getElementById('current-agent').value;
    const isInternal = document.getElementById('comment-internal').checked;

    ticket.comments = ticket.comments || [];
    ticket.comments.push({
      text,
      author: agentName,
      createdAt: new Date().toISOString(),
      internal: isInternal
    });
    ticket.updatedAt = new Date().toISOString();
    saveTickets(tickets);

    document.getElementById('comment-text').value = '';
    document.getElementById('comment-internal').checked = false;
    openTicket(currentTicketId);
  });

  // Export
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
  ensureSampleData();

  document.getElementById('mode-customer').addEventListener('click', () => setMode('customer'));
  document.getElementById('mode-agent').addEventListener('click', () => setMode('agent'));

  setupCustomer();
  setupAgent();

  setMode('customer'); // Start on customer portal
});
