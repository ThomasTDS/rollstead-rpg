# Rollstead

[![CI](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml/badge.svg)](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml)

[Português](README.md) · [English](README.en.md) · **Español**

> La sesión se acaba. La historia se queda.

**Sitio:** [rollstead.com.br](https://rollstead.com.br)

Mesa virtual de rol con estética JRPG, creada para campañas centradas en la historia.

Rollstead reúne la mesa, el compendio, el diario de viaje y la mesa de sonido en un solo lugar. Está pensado para grupos que ya juegan por Discord o Google Meet: la voz queda en esas herramientas, y Rollstead se encarga de lo que aparece en pantalla. Funciona en el navegador, sin instalación, y es lo bastante ligero para portátiles básicos y conexiones inestables.

## Estado

En desarrollo inicial. Todavía no hay una versión jugable.

## Tecnologías

| Capa                           | Herramienta                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| Interfaz                       | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                    |
| Build y servidor de desarrollo | [Vite](https://vite.dev/)                                                                      |
| Estilo                         | [Tailwind CSS](https://tailwindcss.com/) con tokens de tema en variables CSS                   |
| Calidad de código              | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)                               |
| Base de datos y API            | [Supabase](https://supabase.com/) (PostgreSQL), ejecutándose localmente con Docker             |
| Alojamiento                    | [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) (Static Assets) |
| Pruebas de base de datos       | [pgTAP](https://pgtap.org/)                                                                    |

## Requisitos previos

- [Node.js](https://nodejs.org/) 24 o superior (la versión usada en el proyecto está en `.nvmrc`)
- npm 11 o superior (viene incluido con Node.js)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y **en ejecución** (lo usa el Supabase local)

## Cómo ejecutar el proyecto

1. Clona el repositorio:

   ```bash
   git clone https://github.com/ThomasTDS/rollstead-rpg.git
   cd rollstead-rpg
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Levanta la base de datos local (la primera vez, la descarga de las imágenes de Docker puede tardar algunos minutos):

   ```bash
   npm run db:start
   ```

   Al terminar, la terminal muestra las direcciones locales, como la API (`http://127.0.0.1:54321`) y Supabase Studio (`http://127.0.0.1:54323`), un panel para inspeccionar la base de datos.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre la dirección que aparece en la terminal (por defecto, `http://localhost:5173`).

## Comandos disponibles

| Comando                | Qué hace                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Inicia el servidor de desarrollo con recarga automática.                                                    |
| `npm run build`        | Verifica los tipos y genera la versión de producción en la carpeta `dist/`.                                 |
| `npm run preview`      | Sirve localmente la versión generada por `build`.                                                           |
| `npm run lint`         | Analiza el código con ESLint. Falla ante cualquier error o advertencia.                                     |
| `npm run typecheck`    | Verifica los tipos de TypeScript sin generar archivos.                                                      |
| `npm run format`       | Formatea todos los archivos con Prettier.                                                                   |
| `npm run format:check` | Comprueba el formato sin modificar los archivos.                                                            |
| `npm run db:start`     | Levanta el Supabase local en Docker y aplica las migraciones.                                               |
| `npm run db:stop`      | Detiene los contenedores del Supabase local, conservando los datos.                                         |
| `npm run db:reset`     | Recrea la base de datos local desde cero, aplicando todas las migraciones y el `seed.sql`.                  |
| `npm run db:status`    | Muestra las direcciones y claves del entorno local.                                                         |
| `npm run test:db`      | Ejecuta las pruebas pgTAP de la base de datos (requiere la base local en ejecución).                        |
| `npm test`             | Ejecuta las pruebas unitarias y de componentes (Vitest).                                                    |
| `npm run test:watch`   | Ejecuta Vitest en modo observación, repitiendo las pruebas en cada cambio.                                  |
| `npm run test:api`     | Ejecuta las pruebas de API (Playwright) contra el Supabase local (requiere el Supabase local en ejecución). |
| `npm run test:e2e`     | Ejecuta las pruebas E2E (Playwright) en Chromium contra el build local (ejecuta `npm run build` antes).     |
| `npm run test:smoke`   | Ejecuta solo las pruebas marcadas con `@smoke`; con `PLAYWRIGHT_BASE_URL`, apunta a un sitio publicado.     |

## Estructura del proyecto

```
rollstead-rpg/
├── src/                 # Código fuente de la aplicación
│   ├── App.tsx          # Componente raíz
│   ├── App.test.tsx     # Ejemplo de prueba de componente
│   ├── components/      # Componentes reutilizables
│   ├── i18n/            # Idiomas: configuración y archivos de traducción (locales/)
│   ├── lib/             # Lógica pura, con la prueba junto a cada archivo (*.test.ts)
│   ├── styles/          # Tema: tokens de color (theme.css), únicos con valores de color
│   ├── test/setup.ts    # Preparación de las pruebas de componentes
│   └── main.tsx         # Punto de entrada
├── supabase/
│   ├── config.toml      # Configuración del Supabase local
│   ├── migrations/      # Migraciones de la base de datos, aplicadas en orden
│   ├── tests/database/  # Pruebas pgTAP
│   └── seed.sql         # Datos de desarrollo aplicados en db:reset
├── tests/               # Pruebas de Playwright
│   ├── api/             # Pruebas de API (contrato con Zod)
│   └── e2e/             # Pruebas E2E
│       ├── pages/       # Page Objects (POM)
│       └── fixtures.ts  # Fixtures que entregan los Page Objects a las pruebas
├── index.html           # Página base cargada por Vite
├── eslint.config.js     # Reglas de lint
├── playwright*.ts       # Configuración de Playwright (E2E y API)
├── tsconfig*.json       # Configuración de TypeScript
├── vite.config.ts       # Configuración de Vite
└── wrangler.jsonc       # Configuración del despliegue en Cloudflare
```

## Base de datos local

La base de datos nunca se modifica a mano: cada cambio de estructura es una migración versionada en `supabase/migrations/`, y la base local puede recrearse desde cero en cualquier momento con `npm run db:reset`.

- Para crear una migración: `npx supabase migration new <nombre_del_cambio>`.
- Una migración ya publicada no se edita; las correcciones van en una migración nueva.
- Toda tabla del schema `public` debe tener RLS (Row Level Security) activada. Una prueba en `supabase/tests/database/rls_enabled.test.sql` falla si alguna tabla se crea sin ella.
- Las claves que muestra `npm run db:status` son las claves de demostración del Supabase local, iguales en todas las instalaciones. Las claves del entorno real nunca van al repositorio.

## Idiomas

Rollstead nace en portugués (predeterminado), inglés y español, con [react-i18next](https://react.i18next.com/).

- Todo texto de la interfaz está en `src/i18n/locales/<idioma>/<namespace>.json`. El portugués (`pt-BR`) es el idioma de referencia, y TypeScript verifica las claves a partir de él.
- El idioma se detecta por el navegador; los idiomas sin soporte pasan al portugués. La elección manual se guarda en el navegador.
- Solo se descargan los textos del idioma en uso.
- Una prueba falla si una clave existe en un idioma y falta en otro, o si algún texto está vacío.
- El lint señala texto fijo en componentes (regla `i18next/no-literal-string`).

Para añadir un texto: crea la clave en los tres archivos de traducción y usa `t('clave')` en el componente.

## Tema y colores

Los colores están solo en `src/styles/theme.css`, como tokens con un valor para el tema claro y otro para el oscuro (`light-dark()`). Los componentes usan las clases de Tailwind generadas a partir de ellos, como `bg-background`, `text-foreground` y `bg-window`, nunca un valor de color.

- La paleta predeterminada de Tailwind está desactivada: clases como `bg-red-500` no existen.
- El tema sigue la preferencia del sistema. `data-theme="light"` o `data-theme="dark"` en el `<html>` fuerza uno de ellos.
- Una prueba revisa el código y falla si encuentra un color fijo fuera de `theme.css` (hexadecimal, `rgb()`, `hsl()` y similares, o la paleta de Tailwind).
- Otra prueba verifica el contraste de los pares de colores en los dos temas según WCAG: 4,5:1 para texto y 3:1 para elementos de interfaz.

La paleta actual es provisional e inspirada en JRPG (pergamino de día, noche estrellada de noche, ventanas azules y detalles dorados). Cambiar la paleta es solo cambiar los valores en `theme.css`.

## Pruebas

La pirámide de pruebas del proyecto, de la más rápida y numerosa a la más lenta y selectiva:

| Nivel                    | Herramienta                                                               | Ubicación                                | Ejemplo actual                                                                      |
| ------------------------ | ------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Unitaria                 | [Vitest](https://vitest.dev/)                                             | Junto al código, `src/**/*.test.ts`      | `src/lib/dice.test.ts` (notación de dados, como `2d6+3`)                            |
| Componente               | Vitest + [Testing Library](https://testing-library.com/)                  | Junto al componente, `src/**/*.test.tsx` | `src/App.test.tsx`                                                                  |
| Base de datos y permisos | pgTAP                                                                     | `supabase/tests/database/`               | Políticas RLS de `health_check`                                                     |
| API                      | [Playwright](https://playwright.dev/) (request) + [Zod](https://zod.dev/) | `tests/api/`                             | Contrato y permisos de `/rest/v1/health_check`                                      |
| E2E                      | Playwright con Page Objects                                               | `tests/e2e/`                             | Página inicial; la misma prueba, marcada con `@smoke`, comprueba el sitio publicado |

Convenciones:

- Las pruebas unitarias usan el entorno Node; las de componentes (`.test.tsx`) usan jsdom.
- Las pruebas E2E nunca usan selectores sueltos: cada pantalla tiene un Page Object en `tests/e2e/pages/`, entregado a las pruebas por las fixtures de `tests/e2e/fixtures.ts`.
- Las pruebas de API usan solo la clave pública (anon) de Supabase, leída automáticamente del Supabase local.
- Por ahora el E2E se ejecuta solo en Chromium; Firefox y WebKit se suman antes de la beta.

La primera vez, instala el navegador que usa Playwright:

```bash
npx playwright install chromium
```

## Integración continua

Cada pull request y cada push a la rama `main` pasan por GitHub Actions (`.github/workflows/ci.yml`). Un pull request solo puede fusionarse con todos estos jobs aprobados:

| Job                                                   | Qué verifica                                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `quality`                                             | Formato, lint, tipos y build de producción.                                                                                    |
| `database`                                            | Levanta la base de datos local de Supabase a partir de las migraciones y ejecuta las pruebas pgTAP.                            |
| `unit`                                                | Pruebas unitarias y de componentes (Vitest).                                                                                   |
| `api`                                                 | Levanta la API del Supabase local y ejecuta las pruebas de API (Playwright).                                                   |
| `e2e`                                                 | Ejecuta las pruebas E2E (Playwright, Chromium) contra el mismo build generado por el job `quality`.                            |
| `secrets`                                             | Busca contraseñas y tokens en todo el historial de Git con [Gitleaks](https://github.com/gitleaks/gitleaks).                   |
| `codeql (javascript-typescript)` y `codeql (actions)` | Análisis de seguridad del código y de los workflows con [CodeQL](https://codeql.github.com/) (`.github/workflows/codeql.yml`). |

Para comprobar localmente antes de abrir un pull request, con el Supabase local en ejecución:

```bash
npm run format:check && npm run lint && npm run typecheck && npm run build && npm test && npm run test:db && npm run test:api && npm run test:e2e
```

## Despliegue

El despliegue es automático: en cada merge a `main`, después de que pasen todos los jobs de verificación, GitHub Actions publica el build en [rollstead.com.br](https://rollstead.com.br) mediante Cloudflare Workers.

| Job      | Qué hace                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------- |
| `deploy` | Publica en Cloudflare el mismo build verificado por el job `quality`. Solo se ejecuta en push a `main`. |
| `smoke`  | Abre el sitio publicado en Chromium y ejecuta las pruebas E2E marcadas con `@smoke`.                    |

Las credenciales de Cloudflare (`CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`) están solo en los secrets del entorno `production` de GitHub, que únicamente acepta despliegues desde `main`. Ninguna clave queda en el código.

Para comprobar el paquete localmente, sin publicar nada:

```bash
npm run build
npx wrangler deploy --dry-run
```

## Seguridad

| Protección                   | Qué hace                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gitleaks (job `secrets`)     | Bloquea el merge si encuentra una contraseña o un token en cualquier commit.                                                                     |
| Protección de push de GitHub | Rechaza el envío de commits con tokens de servicios conocidos antes de que lleguen al repositorio.                                               |
| CodeQL                       | Analiza el código y los workflows en cada pull request, en cada push a `main` y todos los lunes. Las alertas de gravedad alta bloquean el merge. |
| Dependabot                   | Alerta sobre dependencias con fallos conocidos y abre pull requests de actualización (npm y GitHub Actions) todos los lunes.                     |

Si se envía un secreto real por error, borrarlo del código no basta: sigue en el historial. Revoca la clave en el servicio de origen y genera una nueva.

## Convenciones de código

- Identificadores de código en inglés; mensajes de commit y documentación en portugués.
- TypeScript en modo estricto.
- Ningún texto fijo en componentes: todo texto de la interfaz viene de los archivos de traducción.
- Ningún color fijo en componentes: todo color viene de los tokens de `src/styles/theme.css`.
- Lint con reglas de TypeScript (con verificación de tipos), React Hooks y accesibilidad (`jsx-a11y`).
- Formato automático con Prettier: sin punto y coma, comillas simples y líneas de hasta 100 caracteres.
- Saltos de línea LF en todos los sistemas operativos, garantizados por `.gitattributes`.
