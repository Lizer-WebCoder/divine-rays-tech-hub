/**
 * Divine Rays Tech Hub — Ticketing System
 * Client-side only (localStorage). Easy to later connect to a backend.
 */

const STORAGE_KEY = 'divineRaysTickets';

// ---------- Data helpers ----------
function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function generateId() {
  const tickets = loadTickets();
  const next = tickets.length ? Math.max(...tickets.map(t => t.num)) + 1 : 1001;
  return {
    id: `DR-${next}`,
    num: next
  };
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function statusClass(status) {
  return 'badge-' + status.toLowerCase().replace(/\s+/g, '-');
}

function priorityClass(priority) {
  return 'badge-' + priority.toLowerCase();
}

// ---------- Seed sample data (first visit) ----------
function ensureSampleData() {
  const tickets = loadTickets();
  if (tickets.length > 0) return;

  const now = Date.now();
  const samples = [
    {
      id: 'DR-1001',
      num: 1001,
      title: 'Laptop will not connect to office Wi-Fi',
      description: 'User reports that their Windows laptop shows "Connected, no internet" on the main SSID. Works fine on mobile hotspot.',
      priority: 'High',
      category: 'Network',
      status: 'Open',
      requester: 'Alex Rivera',
      email: 'alex.r@example.com',
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      comments: []
    },
    {
      id: 'DR-1002',
      num: 1002,
      title: 'Need access to shared Finance folder',
      description: 'New hire needs read/write access to \\\\fileserver\\Finance. Manager already approved.',
      priority: 'Medium',
      category: 'Account',
      status: 'In Progress',
      requester: 'Jordan Lee',
      email: 'jordan.l@example.com',
      createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
      comments: [
        {
          text: 'Verified manager approval. Creating AD group membership request.',
          author: 'Support Agent',
          createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
          statusChange: 'In Progress'
        }
      ]
    },
    {
      id: 'DR-1003',
      num: 1003,
      title: 'Outlook keeps asking for password',
      description: 'Every morning Outlook prompts for credentials even though password was not changed.',
      priority: 'Low',
      category: 'Software',
      status: 'Resolved',
      requester: 'Sam Patel',
      email: 'sam.p@example.com',
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      comments: [
        {
          text: 'Cleared credential manager and recreated the Outlook profile. Issue resolved.',
          author: 'Support Agent',
          createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
          statusChange: 'Resolved'
        }
      ]
    }
  ];

  saveTickets(samples);
}

// ---------- UI Rendering ----------
let currentTicketId = null;

function renderStats() {
  const tickets = loadTickets();
  const counts = {
    Open: 0,
    'In Progress': 0,
    Waiting: 0,
    Resolved: 0
  };

  tickets.forEach(t => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });

  document.getElementById('stat-open').textContent = counts.Open;
  document.getElementById('stat-progress').textContent = counts['In Progress'];
  document.getElementById('stat-waiting').textContent = counts.Waiting;
  document.getElementById('stat-resolved').textContent = counts.Resolved;
}

function renderTicketList(filterStatus = '', search = '') {
  const container = document.getElementById('ticket-list');
  let tickets = loadTickets();

  // Sort newest first
  tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (filterStatus) {
    tickets = tickets.filter(t => t.status === filterStatus);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    tickets = tickets.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.requester.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }

  if (tickets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No tickets found.</p>
        <p style="font-size:0.9rem">Create your first ticket to get started.</p>
      </div>`;
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
        </div>
      </div>
      <div class="badges">
        <span class="badge ${statusClass(t.status)}">${t.status}</span>
        <span class="badge ${priorityClass(t.priority)}">${t.priority}</span>
      </div>
    </div>
  `).join('');

  // Click handlers
  container.querySelectorAll('.ticket-card').forEach(card => {
    card.addEventListener('click', () => openTicket(card.dataset.id));
  });
}

function openTicket(id) {
  const tickets = loadTickets();
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return;

  currentTicketId = id;
  showView('detail');
  document.getElementById('page-title').textContent = ticket.id;

  const detail = document.getElementById('ticket-detail');
  detail.innerHTML = `
    <h3>${escapeHtml(ticket.title)}</h3>
    <div class="detail-meta">
      <span class="ticket-id">${ticket.id}</span>
      <span class="badge ${statusClass(ticket.status)}">${ticket.status}</span>
      <span class="badge ${priorityClass(ticket.priority)}">${ticket.priority}</span>
      <span>${escapeHtml(ticket.category)}</span>
      <span>Requester: ${escapeHtml(ticket.requester)}</span>
      ${ticket.email ? `<span>${escapeHtml(ticket.email)}</span>` : ''}
      <span>Created ${formatDate(ticket.createdAt)}</span>
    </div>
    <div class="detail-description">${escapeHtml(ticket.description)}</div>
  `;

  renderComments(ticket);
}

function renderComments(ticket) {
  const list = document.getElementById('comments-list');
  if (!ticket.comments || ticket.comments.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem">No activity yet.</p>`;
    return;
  }

  list.innerHTML = ticket.comments
    .slice()
    .reverse()
    .map(c => `
      <div class="comment">
        <div class="comment-header">
          <span>${escapeHtml(c.author || 'Agent')}</span>
          <span>${formatDate(c.createdAt)}${c.statusChange ? ` · → ${c.statusChange}` : ''}</span>
        </div>
        <div class="comment-body">${escapeHtml(c.text)}</div>
      </div>
    `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- View switching ----------
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const viewMap = {
    dashboard: 'view-dashboard',
    'new-ticket': 'view-new-ticket',
    detail: 'view-detail',
    'all-tickets': 'view-dashboard'
  };

  const el = document.getElementById(viewMap[name] || 'view-dashboard');
  if (el) el.classList.add('active');

  // Nav highlight
  if (name === 'new-ticket') {
    document.querySelector('[data-view="new-ticket"]')?.classList.add('active');
    document.getElementById('page-title').textContent = 'New Ticket';
  } else if (name === 'detail') {
    // title set in openTicket
  } else {
    document.querySelector('[data-view="dashboard"]')?.classList.add('active');
    document.getElementById('page-title').textContent = name === 'all-tickets' ? 'All Tickets' : 'Dashboard';
    renderStats();
    renderTicketList(
      document.getElementById('filter-status').value,
      document.getElementById('search-input').value
    );
  }
}

// ---------- Event handlers ----------
function setupEvents() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === 'new-ticket') {
        document.getElementById('ticket-form').reset();
      }
      showView(view);
    });
  });

  document.getElementById('btn-new-ticket').addEventListener('click', () => {
    document.getElementById('ticket-form').reset();
    showView('new-ticket');
  });

  document.getElementById('btn-cancel').addEventListener('click', () => showView('dashboard'));
  document.getElementById('btn-back').addEventListener('click', () => showView('dashboard'));

  // Filters
  document.getElementById('filter-status').addEventListener('change', (e) => {
    renderTicketList(e.target.value, document.getElementById('search-input').value);
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    renderTicketList(document.getElementById('filter-status').value, e.target.value);
  });

  // Create ticket
  document.getElementById('ticket-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const { id, num } = generateId();
    const now = new Date().toISOString();

    const ticket = {
      id,
      num,
      title: document.getElementById('ticket-title').value.trim(),
      description: document.getElementById('ticket-description').value.trim(),
      priority: document.getElementById('ticket-priority').value,
      category: document.getElementById('ticket-category').value,
      status: 'Open',
      requester: document.getElementById('ticket-requester').value.trim(),
      email: document.getElementById('ticket-email').value.trim(),
      createdAt: now,
      updatedAt: now,
      comments: []
    };

    const tickets = loadTickets();
    tickets.push(ticket);
    saveTickets(tickets);

    showView('dashboard');
    openTicket(id); // go straight to the new ticket
  });

  // Add comment / status change
  document.getElementById('comment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentTicketId) return;

    const text = document.getElementById('comment-text').value.trim();
    const newStatus = document.getElementById('comment-status').value;

    if (!text && !newStatus) return;

    const tickets = loadTickets();
    const ticket = tickets.find(t => t.id === currentTicketId);
    if (!ticket) return;

    const comment = {
      text: text || (newStatus ? `Status changed to ${newStatus}` : ''),
      author: 'Support Agent',
      createdAt: new Date().toISOString(),
      statusChange: newStatus || null
    };

    ticket.comments = ticket.comments || [];
    ticket.comments.push(comment);
    ticket.updatedAt = comment.createdAt;

    if (newStatus) {
      ticket.status = newStatus;
    }

    saveTickets(tickets);

    document.getElementById('comment-text').value = '';
    document.getElementById('comment-status').value = '';

    openTicket(currentTicketId);
    renderStats();
  });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  ensureSampleData();
  setupEvents();
  showView('dashboard');
});
