# Ajo Thrift Collective (Express + EJS)

A simple full-stack experience that highlights the curatorial Ajo thrift drops, plan catalog, and collection scheduling form. The Express backend now serves a single EJS-rendered page (no React or Vite required) while still exposing the API used by the form.

## Tech

- **Express** handles routing, view rendering, and API endpoints for items, plans, and collections.
- **Mongoose** connects to MongoDB for thrift items and scheduled contributions.
- **EJS + vanilla JavaScript** power the UI, stats, decks, and collection form from `views/index.ejs`.
- **Static assets** (CSS and JS) live in `public/` so the app can run without a separate front-end toolchain.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and configure Mongo:
   ```bash
   copy .env.example .env
   ```
   Make sure `MONGO_URI` points to your MongoDB (e.g., `mongodb://127.0.0.1:27017/ajo-thrift`).
3. Seed curated thrift drops, sample collection records, and demo users (admin/member):
   ```bash
   npm run seed
   ```
   The seed prints demo credentials to the console.
4. Start the development server (nodemon watches for changes):
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:<PORT>` (for this repo, the default is `http://localhost:9092`) to explore the hero, plan cards, drops, and join form.
   The form posts to `/api/collections` and shows status feedback once the request is recorded.
6. Open `http://localhost:<PORT>/auth/login` to log in, then visit `http://localhost:<PORT>/admin` (admin-only).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Launches nodemon + Express for development. |
| `npm start` | Runs the server via Node (good for production). |
| `npm run seed` | Clears the database and inserts curated thrift items plus example contributions. |

## API endpoints

| Route | Method | Description |
| --- | --- | --- |
| `/api/items` | `GET` | Returns available thrift drops; accepts `category`, `tag`, and `search` filters. |
| `/api/items/:id` | `GET` | Detail for a specific item. |
| `/api/plan-options` | `GET` | Shared catalog of the Ajo plans displayed on the home page. |
| `/api/collections` | `GET` / `POST` | Submit join requests; `GET` requires login and returns your own requests unless you are an admin. |
| `/api/admin/*` | Various | Admin-only endpoints used by the admin dashboard (requests, users, items). |

## Next steps

- Set a strong `AUTH_SECRET` and remove seeded passwords in production.
- Wire up a real payment gateway or savings ledger if you plan to accept contributions.
- Add audit logs + notifications (WhatsApp/SMS/email) for status updates.

