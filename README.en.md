# Rollstead

[![CI](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml/badge.svg)](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml)

[Português](README.md) · **English** · [Español](README.es.md)

> Play the session. Keep the story.

**Website:** [rollstead.com.br](https://rollstead.com.br)

A JRPG-inspired virtual tabletop for story-driven campaigns.

Rollstead brings the table, compendium, journey diary and soundboard together in one place. It is designed for groups that already play over Discord or Google Meet: voice stays with those tools, and Rollstead takes care of what shows up on screen. It runs in the browser, with no installation, and is light enough for entry-level laptops and unstable connections.

## Status

Early development. There is no playable version yet.

## Tech stack

| Layer                | Tool                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| Interface            | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                    |
| Build and dev server | [Vite](https://vite.dev/)                                                                      |
| Code quality         | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)                               |
| Database and API     | [Supabase](https://supabase.com/) (PostgreSQL), running locally via Docker                     |
| Hosting              | [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) (Static Assets) |
| Database tests       | [pgTAP](https://pgtap.org/)                                                                    |

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

| Command                | What it does                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the development server with hot reload.                                                          |
| `npm run build`        | Type-checks and builds the production version into `dist/`.                                             |
| `npm run preview`      | Serves the output of `build` locally.                                                                   |
| `npm run lint`         | Runs ESLint. Fails on any error or warning.                                                             |
| `npm run typecheck`    | Type-checks with TypeScript without emitting files.                                                     |
| `npm run format`       | Formats every file with Prettier.                                                                       |
| `npm run format:check` | Checks formatting without changing files.                                                               |
| `npm run db:start`     | Starts the local Supabase in Docker and applies the migrations.                                         |
| `npm run db:stop`      | Stops the local Supabase containers, keeping the data.                                                  |
| `npm run db:reset`     | Rebuilds the local database from scratch, applying every migration and `seed.sql`.                      |
| `npm run db:status`    | Shows the local environment addresses and keys.                                                         |
| `npm run test:db`      | Runs the pgTAP database tests (requires the local database to be running).                              |
| `npm test`             | Runs the unit and component tests (Vitest).                                                             |
| `npm run test:watch`   | Runs Vitest in watch mode, rerunning tests on every change.                                             |
| `npm run test:api`     | Runs the API tests (Playwright) against the local Supabase (requires the local Supabase to be running). |
| `npm run test:e2e`     | Runs the E2E tests (Playwright) in Chromium against the local build (run `npm run build` first).        |
| `npm run test:smoke`   | Runs only the tests tagged `@smoke`; with `PLAYWRIGHT_BASE_URL`, targets a published site.              |

## Project structure

```
rollstead-rpg/
├── src/                 # Application source code
│   ├── App.tsx          # Root component
│   ├── App.test.tsx     # Component test example
│   ├── components/      # Reusable components
│   ├── i18n/            # Languages: setup and translation files (locales/)
│   ├── lib/             # Pure logic, with each test next to its file (*.test.ts)
│   ├── test/setup.ts    # Component test setup
│   └── main.tsx         # Entry point
├── supabase/
│   ├── config.toml      # Local Supabase settings
│   ├── migrations/      # Database migrations, applied in order
│   ├── tests/database/  # pgTAP tests
│   └── seed.sql         # Development data applied on db:reset
├── tests/               # Playwright tests
│   ├── api/             # API tests (contract checked with Zod)
│   └── e2e/             # E2E tests
│       ├── pages/       # Page Objects (POM)
│       └── fixtures.ts  # Fixtures that hand the Page Objects to the tests
├── index.html           # Base page loaded by Vite
├── eslint.config.js     # Lint rules
├── playwright*.ts       # Playwright settings (E2E and API)
├── tsconfig*.json       # TypeScript settings
├── vite.config.ts       # Vite settings
└── wrangler.jsonc       # Cloudflare deploy settings
```

## Local database

The database is never changed by hand: every schema change is a versioned migration in `supabase/migrations/`, and the local database can be rebuilt from scratch at any time with `npm run db:reset`.

- To create a migration: `npx supabase migration new <change_name>`.
- A published migration is never edited; fixes go into a new migration.
- Every table in the `public` schema must have RLS (Row Level Security) enabled. A test in `supabase/tests/database/rls_enabled.test.sql` fails if any table is created without it.
- The keys shown by `npm run db:status` are the local Supabase demo keys, identical in every installation. Keys for the real environment never go into the repository.

## Languages

Rollstead ships in Portuguese (default), English and Spanish, with [react-i18next](https://react.i18next.com/).

- Every interface text lives in `src/i18n/locales/<language>/<namespace>.json`. Portuguese (`pt-BR`) is the reference language, and TypeScript checks the keys against it.
- The language is detected from the browser; unsupported languages fall back to Portuguese. A manual choice is saved in the browser.
- Only the texts of the active language are downloaded.
- A test fails if a key exists in one language and is missing in another, or if any text is empty.
- Lint flags hardcoded text in components (rule `i18next/no-literal-string`).

To add a text: create the key in all three translation files and use `t('key')` in the component.

## Tests

The project test pyramid, from the fastest and most numerous to the slowest and most selective:

| Level                    | Tool                                                                      | Location                                   | Current example                                                      |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| Unit                     | [Vitest](https://vitest.dev/)                                             | Next to the code, `src/**/*.test.ts`       | `src/lib/dice.test.ts` (dice notation, such as `2d6+3`)              |
| Component                | Vitest + [Testing Library](https://testing-library.com/)                  | Next to the component, `src/**/*.test.tsx` | `src/App.test.tsx`                                                   |
| Database and permissions | pgTAP                                                                     | `supabase/tests/database/`                 | `health_check` RLS policies                                          |
| API                      | [Playwright](https://playwright.dev/) (request) + [Zod](https://zod.dev/) | `tests/api/`                               | Contract and permissions of `/rest/v1/health_check`                  |
| E2E                      | Playwright with Page Objects                                              | `tests/e2e/`                               | Home page; the same test, tagged `@smoke`, checks the published site |

Conventions:

- Unit tests run in the Node environment; component tests (`.test.tsx`) run in jsdom.
- E2E tests never use loose selectors: each screen has a Page Object in `tests/e2e/pages/`, handed to the tests by the fixtures in `tests/e2e/fixtures.ts`.
- API tests use only the Supabase public (anon) key, read automatically from the local Supabase.
- For now E2E runs in Chromium only; Firefox and WebKit join before the beta.

The first time, install the browser used by Playwright:

```bash
npx playwright install chromium
```

## Continuous integration

Every pull request and every push to `main` runs on GitHub Actions (`.github/workflows/ci.yml`). A pull request can only be merged when all of these jobs pass:

| Job                                                     | What it checks                                                                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `quality`                                               | Formatting, lint, types and production build.                                                                           |
| `database`                                              | Starts the local Supabase database from the migrations and runs the pgTAP tests.                                        |
| `unit`                                                  | Unit and component tests (Vitest).                                                                                      |
| `api`                                                   | Starts the local Supabase API and runs the API tests (Playwright).                                                      |
| `e2e`                                                   | Runs the E2E tests (Playwright, Chromium) against the same build produced by the `quality` job.                         |
| `secrets`                                               | Scans the whole Git history for passwords and tokens with [Gitleaks](https://github.com/gitleaks/gitleaks).             |
| `codeql (javascript-typescript)` and `codeql (actions)` | Security analysis of the code and workflows with [CodeQL](https://codeql.github.com/) (`.github/workflows/codeql.yml`). |

To check locally before opening a pull request, with the local Supabase running:

```bash
npm run format:check && npm run lint && npm run typecheck && npm run build && npm test && npm run test:db && npm run test:api && npm run test:e2e
```

## Deployment

Deployment is automatic: on every merge to `main`, after every check job passes, GitHub Actions publishes the build to [rollstead.com.br](https://rollstead.com.br) through Cloudflare Workers.

| Job      | What it does                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------- |
| `deploy` | Publishes to Cloudflare the same build checked by the `quality` job. Runs only on pushes to `main`. |
| `smoke`  | Opens the published site in Chromium and runs the E2E tests tagged `@smoke`.                        |

The Cloudflare credentials (`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`) live only in the secrets of the GitHub `production` environment, which accepts deployments from `main` only. No key is kept in the code.

To check the bundle locally without publishing anything:

```bash
npm run build
npx wrangler deploy --dry-run
```

## Security

| Protection               | What it does                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Gitleaks (`secrets` job) | Blocks the merge if it finds a password or token in any commit.                                                                     |
| GitHub push protection   | Rejects pushes containing tokens from known services before they reach the repository.                                              |
| CodeQL                   | Analyzes the code and workflows on every pull request, every push to `main` and every Monday. High-severity alerts block the merge. |
| Dependabot               | Alerts on dependencies with known vulnerabilities and opens update pull requests (npm and GitHub Actions) every Monday.             |

If a real secret is pushed by mistake, deleting it from the code is not enough: it stays in the history. Revoke the key at its source service and issue a new one.

## Code conventions

- Code identifiers in English; commit messages and documentation in Portuguese.
- TypeScript in strict mode.
- No hardcoded text in components: every interface text comes from the translation files.
- Linting with TypeScript (type-aware), React Hooks and accessibility (`jsx-a11y`) rules.
- Automatic formatting with Prettier: no semicolons, single quotes and lines up to 100 characters.
- LF line endings on every operating system, enforced by `.gitattributes`.
