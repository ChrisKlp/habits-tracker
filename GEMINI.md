# Gemini Analysis: habits-tracker

This is a full-stack monorepo application for tracking habits, built with a NestJS backend and a Next.js frontend.

## Technology Stack

- **Monorepo:** pnpm workspaces, Turborepo
- **Backend:** NestJS, Drizzle (ORM), OpenAPI
- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, Radix UI, shadcn/ui
- **API:** Type-safe client via `openapi-typescript` and `openapi-fetch`

## Key Features

- **Type-Safe API:** OpenAPI generates TypeScript types for the frontend, ensuring frontend-backend data consistency.
- **Modern Stack:** Utilizes Next.js 15, React 19, and Tailwind CSS v4.
- **Well-Structured Monorepo:** pnpm workspaces and Turborepo for scalability and maintainability.
- **Automated Workflow:** Turborepo automates API client generation and optimizes tasks.

## Development

### Getting Started

1.  **Start the database:** `docker-compose up`
2.  **Run dev servers:** `pnpm dev`

### All Commands

#### Root

- `pnpm dev`: Run all apps in development mode.
- `pnpm build`: Build all apps for production.
- `pnpm lint`: Lint all apps.

#### Backend (`apps/backend`)

- `pnpm --filter backend dev`: Start the backend development server.
- `pnpm --filter backend test:e2e`: Run end-to-end tests.
- `pnpm --filter backend db:migrate`: Apply database migrations.
- `pnpm --filter backend db:studio`: Open Drizzle Studio.

#### Frontend (`apps/web`)

- `pnpm --filter web dev`: Start the frontend development server.
- `pnpm --filter web generate:api`: Regenerate the API client.

#### Database

- `docker-compose up`: Start the PostgreSQL database.
- `docker-compose down`: Stop the PostgreSQL database.

### Guidelines

- Prefer function declarations over arrow functions.
