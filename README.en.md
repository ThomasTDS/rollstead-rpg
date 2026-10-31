# Rollstead

[Português](README.md) · **English** · [Español](README.es.md)

> Play the session. Keep the story.

A JRPG-inspired virtual tabletop for story-driven campaigns.

Rollstead brings the table, compendium, journey diary and soundboard together in one place. It is designed for groups that already play over Discord or Google Meet: voice stays with those tools, and Rollstead takes care of what shows up on screen. It runs in the browser, with no installation, and is light enough for entry-level laptops and unstable connections.

## Status

Early development. There is no playable version yet.

## Tech stack

| Layer                | Tool                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| Interface            | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build and dev server | [Vite](https://vite.dev/)                                                   |
| Code quality         | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)            |
| Database and API     | [Supabase](https://supabase.com/) (PostgreSQL), running locally via Docker  |
| Database tests       | [pgTAP](https://pgtap.org/)                                                 |

## Prerequisites

- [Node.js](https://nodejs.org/) 24 or later (the version used in the project is in `.nvmrc`)
- npm 11 or later (ships with Node.js)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running** (used by the local Supabase)

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/ThomasTDS/rollstead-rpg.git
   cd rollstead-rpg
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the local database (the first run downloads the Docker images and may take a few minutes):

   ```bash
   npm run db:start
   ```

   When it finishes, the terminal shows the local addresses, such as the API (`http://127.0.0.1:54321`) and Supabase Studio (`http://127.0.0.1:54323`), a dashboard to inspect the database.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the address shown in the terminal (by default, `http://localhost:5173`).

## Available scripts

| Command                | What it does                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the development server with hot reload.                                     |
| `npm run build`        | Type-checks and builds the production version into `dist/`.                        |
| `npm run preview`      | Serves the output of `build` locally.                                              |
| `npm run lint`         | Runs ESLint. Fails on any error or warning.                                        |
| `npm run typecheck`    | Type-checks with TypeScript without emitting files.                                |
| `npm run format`       | Formats every file with Prettier.                                                  |
| `npm run format:check` | Checks formatting without changing files.                                          |
| `npm run db:start`     | Starts the local Supabase in Docker and applies the migrations.                    |
| `npm run db:stop`      | Stops the local Supabase containers, keeping the data.                             |
| `npm run db:reset`     | Rebuilds the local database from scratch, applying every migration and `seed.sql`. |
| `npm run db:status`    | Shows the local environment addresses and keys.                                    |
| `npm run test:db`      | Runs the pgTAP database tests (requires the local database to be running).         |

## Project structure

```
rollstead-rpg/
├── src/                 # Application source code
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── supabase/
│   ├── config.toml      # Local Supabase settings
│   ├── migrations/      # Database migrations, applied in order
│   ├── tests/database/  # pgTAP tests
│   └── seed.sql         # Development data applied on db:reset
├── index.html           # Base page loaded by Vite
├── eslint.config.js     # Lint rules
├── tsconfig*.json       # TypeScript settings
└── vite.config.ts       # Vite settings
```

## Local database

The database is never changed by hand: every schema change is a versioned migration in `supabase/migrations/`, and the local database can be rebuilt from scratch at any time with `npm run db:reset`.

- To create a migration: `npx supabase migration new <change_name>`.
- A published migration is never edited; fixes go into a new migration.
- Every table in the `public` schema must have RLS (Row Level Security) enabled. A test in `supabase/tests/database/rls_enabled.test.sql` fails if any table is created without it.
- The keys shown by `npm run db:status` are the local Supabase demo keys, identical in every installation. Keys for the real environment never go into the repository.

## Code conventions

- Code identifiers in English; commit messages and documentation in Portuguese.
- TypeScript in strict mode.
- Linting with TypeScript (type-aware), React Hooks and accessibility (`jsx-a11y`) rules.
- Automatic formatting with Prettier: no semicolons, single quotes and lines up to 100 characters.
- LF line endings on every operating system, enforced by `.gitattributes`.
