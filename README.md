<div align="center">

# ☕ Cafe Experience Tracker — Full-Stack Web Application

<p align="center">
  <strong>A warm, minimal, full-stack journal for every cafe you've visited, rated and loved.</strong><br />
  Featuring a curated home page, vibe-based explore, JWT auth, a full CRUD dashboard, file attachments, and an Express + MongoDB backend.
</p>

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br />

[Explore Features](#-features) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Getting Started](#-getting-started) • [Author](#-author)

</div>

---

## 📖 Overview

**Cafe Experience Tracker** is a full-stack web app for building your personal cafe journal. Browse a curated home page, find spots by vibe (Work Mode / Chill / Date Night), log in, and manage every visit — ratings, WiFi quality, pricing, ambience, notes, photos and documents — from a clean CRUD dashboard backed by an **Express.js + Mongoose API** and a **Next.js 14** frontend.

> 💡 **Note:** This project was built for portfolio and learning purposes — full-stack architecture, JWT authentication, file uploads, and monorepo deployment on Vercel.

---

## ✨ Features

### 🏠 1. Curated Home Page
- **Hero Section:** "Find your perfect cafe escape" with eyebrow badge, social proof, and CTA buttons (`/`).
- **Marquee Strip:** Infinite scrolling strip — Work-friendly, Date Night, Slow Evenings, Great Espresso, Power Plugs, Cozy Corners.
- **Live Stats:** Cafes tracked, average rating, cities covered, work-friendly picks.
- **Cafe of the Moment:** Auto-spotlight of the top-rated cafe with details modal.
- **Barista's Picks:** Top-rated-right-now card grid + best-for-deep-work section.
- **How It Works:** Three steps — Explore, Visit & rate, Relive.

### 🧭 2. Explore & Find My Vibe
- **Vibe Finder:** Pick a mood — 💻 Work Mode, 🌿 Chill, ❤️ Date Night — and get matched cafes with reasons (`/explore`).
- **Full Catalog:** All cafes sorted top-rated-first with detail modals, file previews, and edit links.

### 🔐 3. Authentication (JWT)
- **Register & Login:** Validated forms with show/hide password, server error mapping (`/register`, `/login`).
- **Protected Routes:** `/dashboard`, `/add`, `/edit/:id` redirect logged-out visitors to login and return them after (`?from=`).
- **Persistent Sessions:** JWT in localStorage, restored via `/api/auth/me` on reload.

### 📊 4. Dashboard CRUD
- **Stats + Table:** Cafes tracked / average rating, 9-column table — Name, City/Area, Specialties, Environment, Price, WiFi, Rating, Tags, Actions (`/dashboard`).
- **Modal Add/Edit Form:** Full cafe form with environment fieldset, WiFi quality, 0–5 rating steps, ambience tags, notes.
- **Standalone Pages:** Dedicated `/add` and `/edit/[id]` pages (incl. pending-file upload that never duplicates a cafe).

### 📎 5. Photos & Documents
- **Attachments:** Upload photos (10MB) and PDF/Word/Excel docs (5MB) per cafe, stored in MongoDB.
- **Detail View:** File list with view/download links inside every cafe modal.

### 🎨 6. Minimal Artisan UI/UX
- **Warm Theme:** Paper `#fbf8f1`, espresso ink, deep-green accent — Fraunces serif + Inter.
- **Responsive:** Phone / tablet / laptop / wide-TV breakpoints, fluid full-bleed layouts.

---

## 🧱 Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router) + [React 18](https://react.dev/)
- **Routing:** Next.js App Router with `(site)` route group + `RequireAuth` guards
- **Styling:** Custom CSS (artisan theme, no UI framework)
- **Typography:** Google Fonts (Fraunces + Inter)
- **API Layer:** Central `apiClient.js` (fetch wrappers, JWT headers, `{ success, data }` unwrapping)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Server Framework:** [Express.js 4](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/)
- **Auth:** [bcryptjs](https://github.com/dcodeIO/bcrypt.js/) + [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- **Uploads:** [multer](https://github.com/expressjs/multer) (memory storage → MongoDB)
- **Middleware:** CORS, JSON parsing, async-handler, central error handler, soft-delete pattern

---

## 📁 Project Structure

```bash
cafe-experience-next/
├── vercel.json                # Vercel Services: frontend + backend on one domain
├── README.md
│
├── backend/                   # 🚀 Express API (Port 5002)
│   ├── server.js              # Entry point: middleware chain, route mounts, Vercel export
│   ├── config/db.js           # MongoDB connection helper (MONGODB_URI from .env)
│   ├── models/                # Mongoose schemas
│   │   ├── Cafe.js            # Cafe + environment, rating, soft-delete flag
│   │   ├── User.js            # Auth user (email + password hash)
│   │   └── Attachment.js      # Uploaded file metadata + binary
│   ├── controllers/           # Request handlers
│   │   ├── cafeController.js  # CRUD + city/tag/minRating filters
│   │   ├── authController.js  # Register / login / me (JWT)
│   │   └── uploadController.js# Multer upload, list, view/download, delete
│   ├── middleware/            # asyncHandler, auth (protect), errorHandler
│   └── routes/                # /api/cafes, /api/auth, /api/uploads
│
└── frontend/                  # ⚛️ Next.js App (Port 3000)
    ├── next.config.mjs
    ├── package.json
    └── app/
        ├── layout.jsx         # Root layout: fonts, AuthProvider, container
        ├── globals.css        # Dashboard theme + site theme
        ├── apiClient.js       # All backend calls (cafes, auth, uploads)
        ├── auth.jsx           # AuthProvider + useAuth (JWT session)
        ├── site-helpers.js    # Shared helpers (toArray, stars, VIBES, covers)
        ├── (site)/            # Public site layout (navbar + footer)
        │   ├── page.jsx       # Home
        │   ├── explore/       # Explore + vibe finder
        │   ├── login/         # Login (?from= redirect)
        │   └── register/      # Register
        ├── dashboard/         # Protected CRUD dashboard (modal form)
        ├── add/               # Protected add-cafe page
        ├── edit/[id]/         # Protected edit-cafe page
        └── components/        # CafeCard, CafeDetailModal, CafeForm, CafeList,
                               # Attachments, BackButton, RequireAuth, SiteLayout
```

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version `18.x` or higher)
- [npm](https://www.npmjs.com/) (version `9.x` or higher)
- [Git](https://git-scm.com/)
- A [MongoDB](https://www.mongodb.com/) connection string (e.g. MongoDB Atlas `MONGODB_URI`)

### 2. Clone the Repository
```bash
git clone https://github.com/dhruvmangukiyaq/cafe-experience-next.git
cd cafe-experience-next
```

### 3. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 4. Configure Environment
Create `backend/.env` (never commit this file):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
PORT=5002
```

### 5. Run Development Servers

**Option A — One terminal (recommended):**
```bash
# From the project root (installs the one-terminal runner once)
npm install

# Starts backend (:5002) + frontend (:3001) together
npm run dev
```

**Option B — Two terminals:**
Open two terminals:

**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
# Express API will run at http://localhost:5002
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Next.js app will run at http://localhost:3000
```

Visit **`http://localhost:3000`** in your browser. (Locally the frontend calls the backend at `http://localhost:5002`; in production it uses same-domain `/api` rewrites.)

---

## 🛠️ Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev Backend** | `npm run dev` (`backend/`) | Starts Express with nodemon on port `5002` |
| **Start Backend** | `npm start` (`backend/`) | Starts Express with node on port `5002` |
| **Dev Frontend** | `npm run dev` (`frontend/`) | Starts Next.js dev server on port `3000` |
| **Build Frontend** | `npm run build` (`frontend/`) | Compiles optimized production build |
| **Start Frontend** | `npm start` (`frontend/`) | Runs the compiled production build |
| **Lint Frontend** | `npm run lint` (`frontend/`) | Runs Next.js ESLint checks |

---

## 🚢 Production Deployment

The repo ships with `vercel.json` **Services** config — frontend + backend deploy as one project on a single domain (`/api/*` → backend service, everything else → frontend):

```bash
git push origin main
# Vercel auto-redeploys both services
```

Set these environment variables on the **backend service** in the Vercel dashboard:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — long random secret for signing tokens

Also ensure the Vercel project's Framework setting is **Services**.

---

## 🧑‍💻 Author

**Dhruv Mangukiya**
- GitHub: [@dhruvmangukiyaq](https://github.com/dhruvmangukiyaq)
- Email: [dhruvmangukiya111@gmail.com](mailto:dhruvmangukiya111@gmail.com)

---

<div align="center">
  <sub>Made with ☕ for cafe lovers by Dhruv Mangukiya</sub>
</div>
