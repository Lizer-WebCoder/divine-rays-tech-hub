# Divine Rays Tech Hub — Support Ticketing System

A modern dual-sided tech support ticketing system.

**Live:** https://lizer-webcoder.github.io/divine-rays-tech-hub/

## Two Sides

### 1. Customer Portal
- Submit support tickets easily
- Track ticket status by ID or email
- See only public updates (internal notes are hidden)

### 2. Tech Support (Agent Console)
- Full dashboard with live stats
- My Tickets / Unassigned / All Tickets views
- Assign tickets to agents
- Change status
- Public replies + Internal notes
- Search + filter by status & priority
- Export all tickets as JSON

## How it works

Everything runs in the browser using `localStorage`.  
No server or database required — perfect for demos and small teams.

Open the live link or just open `index.html` locally.

## Features added in v2
- Clear separation: Customer Portal ↔ Tech Support
- Agent assignment
- Internal notes (not visible to customers)
- Unassigned queue
- "My Tickets" filter
- Better sorting (priority + status)
- Export to JSON
- Sample critical ticket

## Project structure

```
├── index.html
├── css/styles.css
├── js/app.js
└── README.md
```

---

**Divine Rays Tech Hub** · v2.0
