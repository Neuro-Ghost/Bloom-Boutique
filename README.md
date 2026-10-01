# Bloom Boutique

A full-stack e-commerce website for Bloom Boutique, a Lebanon-based modest women's clothing store. Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and Auth.js.

## Features

- **Public storefront**: home, shop, product details, cart, checkout, order success
- **Admin dashboard**: protected `/admin` area to manage products, categories, orders, and store settings
- **Cash on delivery**: checkout collects customer details and creates orders — no payment gateway required
- **Order notifications**: new orders email the store owner via Resend
- **Image uploads**: product/category images upload to Vercel Blob in production (local `public/uploads` in development)
- **Responsive design**: modest, girly, and cute aesthetic using the Bloom logo.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (`base-nova` style)
- Prisma ORM (SQLite locally, PostgreSQL in production)
- Auth.js (NextAuth v5) credentials provider
- Zod validation
- Vercel Blob (uploads) + Resend (order emails)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up the database and seed sample data:

   ```bash
   npx prisma migrate dev
   npm run seed
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Admin Credentials

- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email**: `admin@bloombyreem.com`
- **Password**: `bloom123`

You can change the default credentials by setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables before running `npm run seed`. **Change these before going live.**

## Available Scripts

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run start` — start production server
- `npm run seed` — seed the database with sample categories, products, and admin user
- `npm run lint` — run ESLint

## Project Structure

```
app/
  (shop)/          # Public storefront pages
  admin/           # Admin login and dashboard pages
  api/             # API routes for products, categories, orders, auth, uploads, settings
components/
  ui/              # shadcn/ui components
  shop/            # Storefront components
  admin/           # Admin dashboard components
lib/
  prisma.ts        # Prisma client singleton
  auth.ts          # Auth.js configuration
  settings.ts      # Site settings helper
prisma/
  schema.prisma    # Database schema
public/
  uploads/         # Uploaded product/category images
  logo.png         # Bloom logo
```

## Deployment

1. **Database (Supabase)** — create a project, copy the connection string into `DATABASE_URL`, switch the Prisma provider to `postgresql` in `prisma/schema.prisma`, then run `npx prisma db push && npm run seed`.
2. **Image uploads (Vercel Blob)** — create a Blob store in the Vercel dashboard and set `BLOB_READ_WRITE_TOKEN`. Without it, uploads fall back to the local `public/uploads` directory (development only).
3. **Order emails (Resend)** — create a Resend account, set `RESEND_API_KEY`, and set a contact email in Admin → Settings. Each new order sends an email to that address; without the key, orders still save normally.
4. **Vercel** — import the repo and set environment variables: `DATABASE_URL`, `NEXTAUTH_URL` (your production domain), `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`.
5. **Domain** — add your custom domain under Project → Settings → Domains.
6. Place a dress-rehearsal test order on a real phone before announcing the launch.
