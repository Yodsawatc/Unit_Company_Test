# Employee Register Web App

Single-page web experience for employee login and registration with a two-step review workflow. The project uses Node.js and Express for the API, PostgreSQL for persistence, and a lightweight HTML/CSS/JS/jQuery frontend served by the backend.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ with a database ready for the app

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a PostgreSQL database (example commands):
   ```sql
   CREATE DATABASE employee_db;
   \c employee_db
   \i sql/init.sql
   -- if the table already existed before pulling the latest changes:
   \i sql/add_company_info_columns.sql
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your PostgreSQL credentials. Set `PGSSL=true` only if you require SSL.

## Development

```bash
npm run dev
```

The server listens on `http://localhost:3000` by default and serves the static frontend from the `public` directory. The API is available under `/api`.

## API Endpoints

- `POST /api/auth/register`: Accepts JSON payload with user details, hashes the password, and stores the record.
- `POST /api/auth/login`: Validates credentials and returns a welcome response on success.
- `GET /api/users/:id`: Returns the company profile details for a specific user.
- `PUT /api/users/:id`: Updates the company profile fields (used by `public/user-info.html`).

See `public/app.js` for the exact payload structure used by the frontend.

## Frontend Overview

- Tab-style selector lets users switch between login and registration.
- Registration is split into a form and a review screen. Users confirm details before the request is sent to the backend.
- Dedicated experiences live in `public/login.html`, `public/register.html`, and `public/user-info.html`.

Customize the styling in `public/styles.css` or extend the UI as needed.
