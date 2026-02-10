# Kira Dashboard

AI assistant dashboard and content management system. A personal dashboard for managing an AI assistant's content review pipeline, todos, and blog -- built with a dark theme and responsive design.

## Features

- Content review with category filtering and status tracking (pending/approved/rejected)
- Todo list management
- Blog with approval gating and markdown rendering
- Responsive design with dark mode
- Google OAuth authentication

## Tech Stack

- **Framework:** Next.js 16 (Turbopack)
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (Google OAuth)
- **Monorepo:** Turborepo

> NestJS is present in `apps/api/` for when this outgrows the Next.js API routes.

## Screenshots

_Coming soon._

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL
- Google OAuth credentials

### Setup

```bash
# Clone the repo
git clone https://github.com/kiravaughn/kira-dashboard.git
cd kira-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
# Edit both .env files with your values

# Start PostgreSQL
docker compose up -d

# Set up the database
cd apps/web
npx prisma migrate deploy
cd ../..

# Run in development
npm run dev
```

The web app runs on `http://localhost:4000` by default.

### Environment Variables

See `apps/web/.env.example` for required configuration.

## Project Structure

```
apps/
  web/    - Next.js frontend (dashboard, blog, review UI)
  api/    - NestJS API backend
```

## License

MIT
