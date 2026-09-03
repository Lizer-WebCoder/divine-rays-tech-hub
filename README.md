# Divine Rays Tech Hub — Support Ticketing System

A clean, modern **client-side** tech support ticketing system.

**Live demo style**: Open `index.html` in any modern browser. All data is stored in the browser’s `localStorage` (no server required).

## Features

- Create tickets with title, description, priority, category, requester info
- Status workflow: Open → In Progress → Waiting → Resolved → Closed
- Priority levels: Low / Medium / High / Critical
- Search and filter by status
- Ticket detail view with activity / comments and status updates
- Dashboard with live counts
- Sample tickets on first load
- Fully responsive dark theme with Divine Rays branding

## How to use

1. Clone or download this repository
2. Open `index.html` in your browser (double-click or use a local server)
3. Start creating and managing tickets

> Tip: For a better experience, run a simple local server:
> ```bash
> npx serve .
> # or
> python -m http.server 8000
> ```

## Project structure

```
├── index.html          # Main page
├── css/
│   └── styles.css      # Dark theme + layout
├── js/
│   └── app.js          # All logic + localStorage
└── README.md
```

## Next steps (optional)

This version is intentionally simple and fully offline. Easy upgrades:

- Connect to a real backend (Firebase, Supabase, Node/Express, etc.)
- Add user authentication & agent assignment
- Email notifications
- File attachments
- Export to CSV / reports

---

**Divine Rays Tech Hub** · Support Ticketing System v1.0
