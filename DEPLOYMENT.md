# Movathon Deployment

This repo has two deployable apps:

- `client`: Vite React frontend
- `server`: Express + Prisma backend

## What stays out of Git

Do not commit real environment files or dependencies. The repo ignores:

- `client/.env`
- `server/.env`
- `node_modules/`
- `client/dist/`
- `client/dev-dist/`

Use the committed `.env.example` files as deployment checklists.

## Suggested free deployment setup

Use platform-provided free subdomains:

- Frontend: Vercel, `your-app.vercel.app`
- Backend: Render, `your-api.onrender.com`
- Database: Neon Postgres free tier

## Backend env vars

Add these in the backend host dashboard, not in Git:

```env
PORT=10000
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-url.vercel.app
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

Render can provide `PORT` automatically, but setting it is fine.

## Frontend env vars

Add these in Vercel Project Settings > Environment Variables:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

Vite exposes `VITE_*` values to the browser bundle. Do not put private secrets in frontend env vars.

## Deploy settings

Vercel frontend:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Render backend:

- Root directory: `server`
- Build command: `npm install && npx prisma generate`
- Start command: `npm start`
- Health check path: `/health`

After the backend URL is live, update `VITE_API_URL` in Vercel and redeploy the frontend. After the frontend URL is live, update `CLIENT_URL` in Render and redeploy the backend.
