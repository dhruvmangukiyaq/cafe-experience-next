# ☕ Cafe Experience Tracker

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)

A full-stack app to **track, rate & manage cafe visits** — work-friendly spots, WiFi quality, pricing, ambience & food specialties in one place.

Built with **Next.js 14 + Express + MongoDB**.

## ✨ Features

- Full **CRUD** for cafes with modal Add / Edit form
- Dashboard stats — total cafes + average rating
- Filter API — by `city`, `tag`, `minRating`
- Rich data model — environment, WiFi, price, tags, notes, rating
- Soft delete (`isDeleted`) — data never lost
- Form validation + error handling on both client & server

## 🛠️ Tech Stack

**Frontend:** Next.js 14, React 18, CSS
**Backend:** Node.js, Express 4, Mongoose 8, CORS, dotenv
**Database:** MongoDB

## 🚀 Run Locally

**1. Backend**

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5002
```

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open → `http://localhost:3000` (Backend → `http://localhost:5002`)

## 🔌 API Endpoints

Base: `http://localhost:5002/api/cafes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create cafe |
| GET | `/` | Get all cafes (`?city=&tag=&minRating=`) |
| GET | `/:id` | Get single cafe |
| PUT | `/:id` | Update cafe |
| DELETE | `/:id` | Soft delete cafe |

## 📁 Structure

```
backend/ → config, models, controllers, routes, server.js
frontend/app/ → page.jsx, apiClient.js, components/, layout.jsx
```

## 💡 What I Built / Learned

- REST API design with Express + Mongoose validation
- Next.js App Router, client components, state & modal UX
- Filtering with query params + regex search
- Full-stack connection (fetch, CORS, env config)
- Clean folder structure & GitHub-ready documentation

## 👤 Author

**Dhruv Mangukiya**
- GitHub: [@dhruvmangukiya](https://github.com/dhruvmangukiya)
- LinkedIn: [Add your link here]

⭐ If you like this project, give it a star!
