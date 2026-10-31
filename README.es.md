# Rollstead

[Português](README.md) · [English](README.en.md) · **Español**

> La sesión se acaba. La historia se queda.

Mesa virtual de rol con estética JRPG, creada para campañas centradas en la historia.

Rollstead reúne la mesa, el compendio, el diario de viaje y la mesa de sonido en un solo lugar. Está pensado para grupos que ya juegan por Discord o Google Meet: la voz queda en esas herramientas, y Rollstead se encarga de lo que aparece en pantalla. Funciona en el navegador, sin instalación, y es lo bastante ligero para portátiles básicos y conexiones inestables.

## Estado

En desarrollo inicial. Todavía no hay una versión jugable.

## Tecnologías

| Capa                           | Herramienta                                                                 |
| ------------------------------ | --------------------------------------------------------------------------- |
| Interfaz                       | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build y servidor de desarrollo | [Vite](https://vite.dev/)                                                   |
| Calidad de código              | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)            |

## Requisitos previos

- [Node.js](https://nodejs.org/) 24 o superior (la versión usada en el proyecto está en `.nvmrc`)
- npm 11 o superior (viene incluido con Node.js)
- [Git](https://git-scm.com/)

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

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre la dirección que aparece en la terminal (por defecto, `http://localhost:5173`).

## Comandos disponibles

| Comando                | Qué hace                                                                    |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Inicia el servidor de desarrollo con recarga automática.                    |
| `npm run build`        | Verifica los tipos y genera la versión de producción en la carpeta `dist/`. |
| `npm run preview`      | Sirve localmente la versión generada por `build`.                           |
| `npm run lint`         | Analiza el código con ESLint. Falla ante cualquier error o advertencia.     |
| `npm run typecheck`    | Verifica los tipos de TypeScript sin generar archivos.                      |
| `npm run format`       | Formatea todos los archivos con Prettier.                                   |
| `npm run format:check` | Comprueba el formato sin modificar los archivos.                            |

## Estructura del proyecto

```
rollstead-rpg/
├── src/                 # Código fuente de la aplicación
│   ├── App.tsx          # Componente raíz
│   └── main.tsx         # Punto de entrada
├── index.html           # Página base cargada por Vite
├── eslint.config.js     # Reglas de lint
├── tsconfig*.json       # Configuración de TypeScript
└── vite.config.ts       # Configuración de Vite
```

## Convenciones de código

- Identificadores de código en inglés; mensajes de commit y documentación en portugués.
- TypeScript en modo estricto.
- Lint con reglas de TypeScript (con verificación de tipos), React Hooks y accesibilidad (`jsx-a11y`).
- Formato automático con Prettier: sin punto y coma, comillas simples y líneas de hasta 100 caracteres.
- Saltos de línea LF en todos los sistemas operativos, garantizados por `.gitattributes`.
