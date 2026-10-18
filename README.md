# Murali Dharan — Portfolio

A personal portfolio for Murali Dharan, built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion. It includes a project gallery with detail pages, an optional Supabase-powered project admin area, and a chat interface.

## Getting started

### Requirements

- Node.js 18 or newer
- npm

### Install and run

```bash
npm ci
npm run dev
```

Vite prints the local development URL in the terminal.

### Build for production

```bash
npm run build
npm run preview
```

The production build is written to `dist/`.

## Environment configuration

Copy `.env.example` to `.env.local` and add the values for the integrations you use. Do not commit `.env.local` or put server-side secrets in `VITE_` variables.

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` enable Supabase-backed project data and the admin area. Without them, the public project pages use the built-in project list.
- `VITE_WEB3FORMS_KEY` enables the contact form integration.

The other variables in `.env.example` are intended for server-side integrations and are not required to run this frontend.

### Supabase admin setup

1. Create a Supabase project and set the two `VITE_SUPABASE_*` values in `.env.local`.
2. Run [`admin/01_supabase.sql`](./admin/01_supabase.sql) in the Supabase SQL Editor.
3. Create an authenticated user, add that user's ID to `public.admins` as described at the bottom of the SQL file, and disable public sign-ups.
4. Sign in at `/admin/login`.

The client-side admin guard is for navigation only; database access is protected by Supabase Row Level Security policies.

## Project structure

- `src/` — React application, pages, components, and static project data
- `admin/` — Supabase schema setup and supporting admin scripts
- `public/` — Static images and project cover artwork
- `vercel.json` — SPA route rewrites for Vercel deployments

The chat booking and messaging flows currently use mock responses and do not send or book anything.
