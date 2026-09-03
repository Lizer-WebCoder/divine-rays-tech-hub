# Divine Rays Tech Hub — Support Ticketing System

**Live:** https://lizer-webcoder.github.io/divine-rays-tech-hub/

A dual-sided tech support ticketing system with **login** for both Customers and Tech Support agents.

## Login

### Demo Customer Accounts
| Email | Password |
|-------|----------|
| alex.r@example.com | demo123 |
| jordan.l@example.com | demo123 |
| sam.p@example.com | demo123 |

Customers can also **create a new account** on the login screen.

### Demo Agent Accounts
| Username | Password | Name |
|----------|----------|------|
| alex | support1 | Alex Chen |
| jordan | support1 | Jordan Smith |
| sam | support1 | Sam Rivera |
| taylor | support1 | Taylor Kim |

## Features

### Customer Portal (after login)
- Submit new tickets
- View **My Tickets** (only their own)
- Track any ticket by ID
- See only public updates (internal notes hidden)

### Tech Support Console (after agent login)
- Full dashboard + live stats
- My Tickets / Unassigned / All Tickets
- Assign tickets to agents
- Change status
- Public replies + Internal notes
- Search & filter
- Export tickets as JSON

## Notes
- Everything runs in the browser (`localStorage`)
- No real backend — perfect for demos and prototypes
- Session persists until you click **Logout**

---

**Divine Rays Tech Hub** · v3.0
