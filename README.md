# Institute of Health Sciences – Visitor & Student Entry Management System

A modern web application for managing visitor check-in/check-out and student entry via QR/barcode scanning at the Institute of Health Sciences.

---

## Overview

The system provides:

- **Visitor Management** – Check-in with CNIC, purpose, person to meet; check-out tracking
- **Student Entry** – QR/barcode scanning (USB scanner or laptop camera)
- **Dashboard** – Live metrics, charts, peak hours, popular purposes, most visited departments
- **Admin** – Visitor logs, student registration, bulk import, reports, export

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express |
| Database | MongoDB |
| Charts | Recharts |

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or remote)

### 1. Backend

```bash
cd backend
npm install
npm start
```

Runs at **http://localhost:5000**

### 2. Frontend

```bash
cd client
npm install
npm start
```

Runs at **http://localhost:3000**

### 3. Admin Access

- Go to **Admin Dashboard** → **Login**
- Default credentials: `admin` / `admin123` (change in production)

---

## Features

| Feature | Description |
|---------|-------------|
| Visitor Check-In | Form with type, purpose, person to meet; badge printing |
| Active Visitors | Check-out table with auto-refresh |
| Student Scanner | USB QR scanner + camera scanning |
| Dashboard Metrics | Active visitors, today's count, student entries |
| Charts | 7-day visit & entry statistics |
| Bulk Student Import | CSV/JSON import |
| Visitor Logs | Filter, search, export CSV |
| Dark Mode | Toggle in top bar |

---

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/       # Toast context
│   │   └── config.js      # API config
│   └── index.html
├── backend/               # Express API
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── index.js
```

---

## Configuration

- **API URL**: Set `VITE_API_URL` in `.env` for production (e.g. `https://api.yourserver.com`)
- **MongoDB**: Set `MONGO_URI` in backend env for remote DB

---

## Documentation

See [FEATURES.md](./FEATURES.md) for detailed feature usage.

---

## Demo Checklist (for Presentation)

Before presenting to HOD, ensure:

1. **MongoDB** is running
2. **Backend**: `cd backend && npm start` (port 5000)
3. **Frontend**: `cd client && npm start` (port 3000)
4. Open **http://localhost:3000** in browser

**Suggested demo flow:**

1. **Reception** – Check in a visitor, show badge print, check out
2. **Student Scanner** – Scan QR (USB or camera)
3. **Dashboard** – Show metrics and charts
4. **Admin** – Login (admin/admin123), show visitor logs, bulk import, export
