# Museum E-Ticket and Visitor Management System

Museum e-ticketing, QR entry control, event registration, group management and visitor satisfaction survey system.

> **Status:** planning / early development. Nothing below is implemented yet unless marked otherwise.

## Overview

A web platform for museums and heritage sites to sell tickets online, control entry with QR codes, run events, handle visiting groups, and measure visitor satisfaction. It includes an operator back office for day-to-day management and reporting.

## Features

| Module | Description |
|---|---|
| **Ticket booking** | Site catalogue, ticket types and prices, date and time-slot selection, capacity checks, online payment, cancel / reschedule / refund |
| **QR e-tickets** | Unique ticket codes, signed QR to prevent forgery, PDF tickets, ticket states (unused, used, expired, cancelled) |
| **Entry control** | Gate management, QR scanning from a phone camera, validity checks, duplicate-scan protection, scan log, real-time visitor count |
| **Event registration** | Events and sessions, registration, seat limits and waiting list, QR event tickets, attendance check-in |
| **Group management** | Group registration, member lists (Excel import), group pricing, group or per-member QR, entry tracking per group |
| **Satisfaction survey** | Configurable questionnaires, survey link sent after a visit, CSAT / NPS scoring |
| **Operator back office** | Roles and permissions, catalogue management, live dashboard, revenue / visitor / satisfaction reports, Excel / PDF export |
| **Localisation** | Vietnamese and English interface |

## User roles

- **Visitor** – books tickets, registers for events, answers surveys
- **Group leader** – registers and pays for a group
- **Gate staff** – scans tickets at the entrance
- **Event manager** – creates events and checks attendance
- **Operator / admin** – manages the catalogue, users, refunds and reports

## Tech stack (planned)

| Layer | Technology |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Frontend | TypeScript, React |
| Scanner app | Web app (PWA) using the phone camera |
| Database | MySQL 8 (InnoDB, `utf8mb4`) |
| Payments | To be decided (VNPay / MoMo / PayOS) |
| QR and signing | `qrcode`, HMAC / JWT |
| Reports | pandas, openpyxl, Chart.js or Recharts |
| i18n | Django i18n, react-i18next |
| Deployment | Docker, Nginx, HTTPS |

## Data model (overview)

Main tables: `users`, `sites`, `ticket_types`, `closed_days`, `orders`, `order_items`, `tickets`, `payments`, `gates`, `scan_logs`, `events`, `event_registrations`, `delegations`, `delegation_members`, `surveys`, `survey_questions`, `survey_responses`, `survey_answers`.

## Getting started

Prerequisites: Python 3.10+, Node.js 20+, MySQL 8, Git.

```bash
# backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in database, secret key, payment and mail settings
python manage.py migrate
python manage.py runserver

# frontend
cd frontend
npm install
npm start
```

Create the database first:

```sql
CREATE DATABASE museum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> The commands above describe the intended setup; `requirements.txt` and `.env.example` do not exist yet.

## Configuration

Secrets must never be committed. Keep them in `.env`:

- `SECRET_KEY`
- `DATABASE_URL` (or separate `DB_*` variables)
- payment provider keys
- SMTP settings for e-mail

## Roadmap

- [ ] Phase 0: project skeleton, `.gitignore`, `.env`, MySQL connection
- [ ] Phase 1: core data model and REST API (sites, ticket types, orders, tickets)
- [ ] Phase 2: booking, payment and QR e-tickets
- [ ] Phase 3: entry control and scan log
- [ ] Phase 4: events, groups and surveys
- [ ] Phase 5: operator dashboard, reports, i18n
- [ ] Phase 6: tests, Docker, deployment

## License

Private academic project. All rights reserved.
