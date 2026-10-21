# Yupinata

A personal website with its own content management system. Visitors see an animated one page site with a gallery and a music player. The admin edits every section, image, song, and setting from a private dashboard, without touching code.

## Features

**Public site**
- Animated sections with page transitions, parallax dividers, and a preloader
- Photo gallery and dedicated profile pages
- Music player with lyrics

**Admin CMS** (`/admin`)
- Login with JWT, password change, and forgot password flow
- Edit text content for each section
- Upload, replace, and reorder images
- Manage songs
- Site settings such as title, favicon, and section order

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, React Router |
| Backend | Node.js, Express, JWT, bcrypt, Multer |
| Database | PostgreSQL (migrated from Supabase) |

## Getting started

Requirements: Node.js 20 or newer and PostgreSQL.

```bash
# API
cd server
npm install
cp .env.example .env    # set DATABASE_URL, JWT_SECRET, admin login
npm run migrate         # create tables
npm run seed            # optional sample content
npm start               # http://localhost:4100

# frontend (new terminal, from the repo root)
npm install
npm run dev             # http://localhost:5173
```

## Project structure

```
src/
  components/         # public site sections
  components/admin/   # CMS screens and UI kit
  pages/              # gallery and profile pages
  AdminApp.tsx
server/
  index.js            # Express API
  auth.js, crud.js, upload.js, settings.js
  schema.sql, migrate.js, seed.js
  uploads/            # uploaded media
```

In production, nginx can serve the `/uploads` folder directly.
