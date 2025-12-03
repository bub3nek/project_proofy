# Project Proofy

Cyberpunk-inspired evidence gallery with a protected admin control panel, responsive media handling, and automated metadata workflows.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/gallery` for the public archive. The admin console lives at `/admin` and requires credentials.

### Scripts

- `npm run dev` – start Next.js in development mode
- `npm run build` – production build
- `npm run start` – serve the production build
- `npm run lint` – eslint
- `npm run test` – vitest suite (filters, auth helper, JSON datastore)

## Environment

Copy `.env.example` to `.env.local` and set the following values:

```
AUTH_SECRET=generate_a_long_random_string
ADMIN_EMAIL=admin@proofy.local
ADMIN_PASSWORD=proofy123
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
```

- `AUTH_SECRET` – standard NextAuth secret
- `ADMIN_EMAIL`/`ADMIN_PASSWORD` – credentials for the admin console (can be rotated at any time)
- `BLOB_READ_WRITE_TOKEN` – required for Vercel Blob uploads/deletes during development; on Vercel, the runtime automatically injects this token.

## Feature Overview

- **Responsive image loading** – all gallery and admin previews use the shared `ResponsiveImage` helper with smart `sizes`, blur placeholders, and remote host allowances (`unsplash` + Vercel Blob).
- **Authentication + protected routes** – NextAuth Credentials provider, middleware-gated `/admin` routes, and a dedicated cyberpunk login experience.
- **Admin dashboard** – stats, quick links to `/admin/upload` (bulk uploader) and `/admin/manage` (inventory table) plus a live feed of recent uploads.
- **Upload interface** – drag & drop queue with automated metadata capture (dimensions, placeholder, size), metadata forms, and progress tracking.
- **Image management** – edit/delete existing records, JSON-backed metadata store (`data/images.json`), `data/stores.json` store registry, and cleanup hooks to remove blobs via the API.
- **Image management** – edit/delete existing records, JSON-backed metadata store (`data/images.json`), and cleanup hooks to remove blobs via the API.
- **Storage pipeline** – `/api/upload` pipes files into Vercel Blob, `/api/images` persists metadata, `/api/images/[id]` handles edits/deletions.
- **Filtering + performance** – shared filter helpers drive gallery filtering, `useDeferredValue` keeps search snappy, and grids animate via `framer-motion`.
- **Testing & polish** – vitest coverage for filtering combinations, auth helper validation, and the JSON store lifecycle. Animations cover grid items, admin stats, and dropzone interactions.

## Walkthrough

1. **Login** – visit `/admin/login`, enter the credentials defined in `.env.local`, and you’ll be redirected to the dashboard.
2. **Upload images** – visit `/admin/upload`, drag files into the queue, fill in store/date/tags/notes (comma-separated tags). The interface shows file size, dimensions, and computed ISO week. Click `UPLOAD QUEUE` to push multiple files at once; successful uploads disappear from the queue and show up in the verification feed.
3. **Edit metadata** – head to `/admin/manage`, click `EDIT` to adjust store/date/tags/notes. Saving recalculates week numbers and updates the live dataset.
4. **Delete assets** – the manage table’s `DELETE` action removes the JSON entry and, when configured, clears the matching Vercel Blob object.
5. **Public gallery** – `/gallery` lists all media with responsive image loading, new filters, and a Lightbox view. Apply store/tag/date/week filters and verify results with the vitest coverage (`npm run test`).

## API Endpoints

- `GET /api/images` – list metadata (used by gallery + admin)
- `POST /api/images` – create single image or accept an array for bulk creation
- `GET /api/images/:id` – fetch a single record
- `PUT /api/images/:id` – edit metadata, automatically recalculates week numbers
- `DELETE /api/images/:id` – remove metadata and related blob
- `POST /api/upload` – accepts multipart form data (`file`) and stores the blob via Vercel Blob
- `GET /api/stores` – returns the current store registry from `data/stores.json`
- `POST /api/stores` – add a new store (deduplicated, admin only in production)
- `GET|POST /api/auth/[...nextauth]` – NextAuth handlers

## Notes

- `data/images.json` is the single source of truth for metadata in development. For production, migrate this logic to your preferred database while keeping the same API contracts.
- Remote image hosts are whitelisted in `next.config.ts` (`unsplash` + `*.blob.vercel-storage.com`). Update that list if you add more providers.
- Bulk uploads can include dozens of files; the queue enforces metadata completion before activating the upload button so you never end up with incomplete records.

Happy documenting. 🔐🛰️
