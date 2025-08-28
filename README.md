AccessAble – Inclusive Places Platform

## Overview
AccessAble is a full‑stack platform that helps people with disabilities discover, add, and review accessibility‑friendly places in Sri Lanka. It includes:
- Backend API (Ballerina + MongoDB)
- Frontend web app (React + Vite + Mantine + Tailwind)
- Admin tools to approve users, places, and reviews

Monorepo layout:
```
accessable-api/   # Ballerina backend service (port 9090)
accessable-web/   # React frontend (Vite, port 5173)
```

## Prerequisites
- Ballerina 2201.12.7
- Node.js 18+ and npm 9+
- MongoDB (Atlas or local)
- Cloudinary account (for image uploads)

## Quick Start (Local)
1) Clone the repo
2) Backend setup (port 9090)
   - cd `accessable-api`
   - Create `.env` (see Environment Variables below)
   - Run: `bal run`

3) Frontend setup (port 5173)
   - cd `accessable-web`
   - `npm install`
   - Create `.env` (see Environment Variables below)
   - Run: `npm run dev`

4) Open the app: http://localhost:5173

## Environment Variables

### Backend (`accessable-api/.env`)
```
# Database (required)
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/accessable

# Token signing (use strong secret in production)
JWT_SECRET=replace-with-strong-secret

# Cloudinary (required for image upload features)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS – set to your frontend origin
FRONTEND_URL=http://localhost:5173
```

Notes:
- The backend auto‑loads `.env` and also respects OS environment variables.
- MongoDB collections used: `users`, `places`, `reviews`.

### Frontend (`accessable-web/.env`)
```
VITE_API_BASE_URL=http://localhost:9090
```

## Running Locally

### Backend (Ballerina)
```
cd accessable-api
bal run
```
The API listens on http://localhost:9090.

Common endpoints (non‑exhaustive):
- POST `/auth` – login/register using payload `{action: "login"|"register", data: {...}}`
- GET `/locations/getAllPlaces` – list approved places
- POST `/locations/addPlace` – create a place (pending until admin approves)
- GET `/locations/getReviewsByPlace/{placeId}` – list approved reviews
- POST `/locations/addReview` – submit review (pending)
- Profile: `GET/PUT /profile`, `PUT /profile/password`, `POST /profile/upload`, `GET /profile/activity`, `DELETE /profile`
- Admin: users/places/reviews moderation under `/admin/...` (requires admin role)

### Frontend (Vite)
```
cd accessable-web
npm install
npm run dev
```
Open http://localhost:5173.

## First‑time Flow
1) Register a user via UI (`/register`).
2) Log in; token and user are stored in localStorage.
3) For admin features, promote a user to `admin` in the database (or register then update role in DB).
4) Add a place (created as pending), then approve from Admin → Places.
5) Add reviews (pending), then approve from Admin → Reviews.

## Roles and Approvals
- Roles: `pwd`, `caregiver`, `admin`.
- Non‑approved users are redirected to `/pending` for protected routes.
- Admin routes are protected and show an Access Denied screen to non‑admins.

## Build/Production

Backend:
```
cd accessable-api
bal build
```
This produces an executable JAR under `accessable-api/target/bin`.

Frontend:
```
cd accessable-web
npm run build
npm run preview  # optional local preview
```
The production build is generated in `accessable-web/dist`.

Deploy notes:
- Set all environment variables securely on your platform.
- Ensure `FRONTEND_URL` matches your deployed frontend origin for CORS.
- Place a reverse proxy or serve the frontend separately; point it to the backend base URL.

## Troubleshooting
- 401 Unauthorized
  - Ensure token is present in localStorage and sent in `Authorization: Bearer <token>` header where required.
  - Confirm `JWT_SECRET` matches between environments.

- CORS errors
  - Check `FRONTEND_URL` in backend `.env` matches the actual origin (including port).

- MongoDB connection
  - Verify `MONGODB_URI`; confirm network access and IP allowlist (Atlas).

- Image upload failures
  - Validate Cloudinary credentials and that files are sent as base64 data URLs.

## Project Structure (Key Files)
Backend (`accessable-api/`):
- `main.bal` – core service: auth, profile, admin, helpers
- `LocationService.bal` – places and reviews endpoints
- `types.bal` – shared types and Mongo client
- `utils.bal` – config loader, token helpers
- `cloudinary.bal` – upload/delete helpers

Frontend (`accessable-web/`):
- `src/context/AuthContext.jsx` – auth state (token, user)
- `src/components/ProtectedRoute.jsx` – route guards
- Pages: `AdminDashboard.jsx`, `PendingPlaces.jsx`, `PendingReviews.jsx`, `AllUser.jsx`, `UserProfile.jsx`, `ShowPlaces.jsx`, `AddPlace.jsx`
- `src/config/api.js` – builds API URLs from `VITE_API_BASE_URL`

## Security Notes
- Use strong secrets and never commit `.env` files.
- Enforce HTTPS in production.
- Regularly rotate keys and back up the database.

## License
This project is part of the AccessAble platform for improving accessibility in Sri Lanka.


