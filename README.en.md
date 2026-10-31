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

## Prerequisites

- [Node.js](https://nodejs.org/) 24 or later (the version used in the project is in `.nvmrc`)
- npm 11 or later (ships with Node.js)
- [Git](https://git-scm.com/)

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

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the address shown in the terminal (by default, `http://localhost:5173`).

## Available scripts

| Command                | What it does                                                |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Starts the development server with hot reload.              |
| `npm run build`        | Type-checks and builds the production version into `dist/`. |
| `npm run preview`      | Serves the output of `build` locally.                       |
| `npm run lint`         | Runs ESLint. Fails on any error or warning.                 |
| `npm run typecheck`    | Type-checks with TypeScript without emitting files.         |
| `npm run format`       | Formats every file with Prettier.                           |
| `npm run format:check` | Checks formatting without changing files.                   |

## Project structure

```
rollstead-rpg/
├── src/                 # Application source code
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── index.html           # Base page loaded by Vite
├── eslint.config.js     # Lint rules
├── tsconfig*.json       # TypeScript settings
└── vite.config.ts       # Vite settings
```

## Code conventions

- Code identifiers in English; commit messages and documentation in Portuguese.
- TypeScript in strict mode.
- Linting with TypeScript (type-aware), React Hooks and accessibility (`jsx-a11y`) rules.
- Automatic formatting with Prettier: no semicolons, single quotes and lines up to 100 characters.
- LF line endings on every operating system, enforced by `.gitattributes`.
