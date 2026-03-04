# TE Connectivity - OrderCloud Admin Dashboard

Standalone admin dashboard for managing the Sitecore OrderCloud catalog integration. This app connects to the main demo backend to monitor connection status, sync products/categories/pricing, and browse the OrderCloud catalog.

## Setup

### 1. Install dependencies

```bash
cd admin
npm install
```

### 2. Set the API URL

Create a `.env` file in this folder with one variable:

```
VITE_API_BASE_URL=https://your-demo-app-url.replit.app
```

Replace the URL with the actual address where your main demo backend is running.

If you're running both locally on the same machine, you can leave this blank or set it to `http://localhost:5000`.

### 3. Run or build

**For development** (local preview):

```bash
npm run dev
```

**For production** (deploy as static files):

```bash
npm run build
```

This outputs everything to `admin/dist/`. Upload that `dist/` folder to any static hosting service (Vercel, Netlify, Replit, etc).

## Features

- OrderCloud connection status monitoring
- Catalog sync (push local products, categories, and price schedules to OrderCloud)
- Browse OrderCloud products, categories, and price schedules
- Delete individual products from OrderCloud
- TE Connectivity brand styling (light and dark mode)

## How it works

The admin app is a standalone React frontend that makes API calls to the main demo backend's `/api/admin/ordercloud/*` routes. The backend has CORS enabled on those routes, so the admin app can be hosted on any domain.

No backend code is needed in this folder — it's purely a static frontend app that talks to the existing demo server.
