# Rollstead

[![CI](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml/badge.svg)](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml)

**Português** · [English](README.en.md) · [Español](README.es.md)

> A sessão acaba. A história fica.

**Site:** [rollstead.com.br](https://rollstead.com.br)

Mesa virtual de RPG com estética JRPG, feita para campanhas guiadas pela história.

O Rollstead reúne mesa, compêndio, diário de jornada e mesa de som num só lugar. Foi pensado para grupos que já jogam por Discord ou Google Meet: a voz fica com essas ferramentas, e o Rollstead cuida do que aparece na tela. Roda no navegador, sem instalação, e é leve o bastante para notebooks de entrada e internet instável.

## Status

Em desenvolvimento inicial. O projeto ainda não tem uma versão jogável.

## Tecnologias

| Camada                              | Ferramenta                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Interface                           | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                    |
| Build e servidor de desenvolvimento | [Vite](https://vite.dev/)                                                                      |
| Qualidade de código                 | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)                               |
| Banco de dados e API                | [Supabase](https://supabase.com/) (PostgreSQL), rodando localmente via Docker                  |
| Hospedagem                          | [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) (Static Assets) |
| Testes de banco                     | [pgTAP](https://pgtap.org/)                                                                    |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 24 ou superior (a versão usada no projeto está em `.nvmrc`)
- npm 11 ou superior (já vem com o Node.js)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **em execução** (usado pelo Supabase local)

## Como rodar o projeto

1. Clone o repositório:

   ```bash
   git clone https://github.com/ThomasTDS/rollstead-rpg.git
   cd rollstead-rpg
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Suba o banco de dados local (na primeira vez, o download das imagens do Docker pode levar alguns minutos):

   ```bash
   npm run db:start
   ```

   Ao terminar, o terminal mostra os endereços locais, como a API (`http://127.0.0.1:54321`) e o Supabase Studio (`http://127.0.0.1:54323`), um painel para inspecionar o banco.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra o endereço exibido no terminal (por padrão, `http://localhost:5173`).

## Comandos disponíveis

| Comando                | O que faz                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor de desenvolvimento com recarga automática.                                       |
| `npm run build`        | Verifica os tipos e gera a versão de produção na pasta `dist/`.                                    |
| `npm run preview`      | Serve localmente a versão gerada pelo `build`.                                                     |
| `npm run lint`         | Analisa o código com o ESLint. Falha se houver qualquer erro ou aviso.                             |
| `npm run typecheck`    | Verifica os tipos do TypeScript sem gerar arquivos.                                                |
| `npm run format`       | Formata todos os arquivos com o Prettier.                                                          |
| `npm run format:check` | Confere se os arquivos estão formatados, sem alterá-los.                                           |
| `npm run db:start`     | Sobe o Supabase local no Docker e aplica as migrations.                                            |
| `npm run db:stop`      | Para os containers do Supabase local, preservando os dados.                                        |
| `npm run db:reset`     | Recria o banco local do zero, aplicando todas as migrations e o `seed.sql`.                        |
| `npm run db:status`    | Mostra os endereços e as chaves do ambiente local.                                                 |
| `npm run test:db`      | Roda os testes pgTAP do banco (requer o banco local em execução).                                  |
| `npm test`             | Roda os testes de unidade e de componente (Vitest).                                                |
| `npm run test:watch`   | Roda o Vitest em modo observação, repetindo os testes a cada alteração.                            |
| `npm run test:api`     | Roda os testes de API (Playwright) contra o Supabase local (requer o Supabase local em execução).  |
| `npm run test:e2e`     | Roda os testes E2E (Playwright) no Chromium contra o build local (rode `npm run build` antes).     |
| `npm run test:smoke`   | Roda só os testes marcados com `@smoke`; com `PLAYWRIGHT_BASE_URL`, aponta para um site publicado. |

## Estrutura do projeto

```
rollstead-rpg/
├── src/                 # Código-fonte da aplicação
│   ├── App.tsx          # Componente raiz
│   ├── App.test.tsx     # Exemplo de teste de componente
│   ├── lib/             # Lógica pura, com o teste ao lado de cada arquivo (*.test.ts)
│   ├── test/setup.ts    # Preparação dos testes de componente
│   └── main.tsx         # Ponto de entrada
├── supabase/
│   ├── config.toml      # Configuração do Supabase local
│   ├── migrations/      # Migrations do banco, aplicadas em ordem
│   ├── tests/database/  # Testes pgTAP
│   └── seed.sql         # Dados de desenvolvimento aplicados no db:reset
├── tests/               # Testes do Playwright
│   ├── api/             # Testes de API (contrato com Zod)
│   └── e2e/             # Testes E2E
│       ├── pages/       # Page Objects (POM)
│       └── fixtures.ts  # Fixtures que entregam os Page Objects aos testes
├── index.html           # Página base carregada pelo Vite
├── eslint.config.js     # Regras de lint
├── playwright*.ts       # Configurações do Playwright (E2E e API)
├── tsconfig*.json       # Configurações do TypeScript
├── vite.config.ts       # Configuração do Vite
└── wrangler.jsonc       # Configuração do deploy no Cloudflare
```

## Banco de dados local

O banco nunca é alterado à mão: toda mudança de estrutura vira uma migration versionada em `supabase/migrations/`, e o banco local pode ser recriado do zero a qualquer momento com `npm run db:reset`.

- Para criar uma migration: `npx supabase migration new <nome_da_mudanca>`.
- Uma migration já publicada não é editada; correções viram uma migration nova.
- Toda tabela do schema `public` precisa de RLS (Row Level Security) ativada. Um teste em `supabase/tests/database/rls_enabled.test.sql` falha se alguma tabela for criada sem ela.
- As chaves exibidas por `npm run db:status` são as chaves de demonstração do Supabase local, iguais em todas as instalações. As chaves do ambiente real nunca vão para o repositório.

## Testes

A pirâmide de testes do projeto, do mais rápido e numeroso ao mais lento e seletivo:

| Nível              | Ferramenta                                                                | Onde fica                                  | Exemplo atual                                                                 |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| Unidade            | [Vitest](https://vitest.dev/)                                             | Ao lado do código, `src/**/*.test.ts`      | `src/lib/dice.test.ts` (notação de dados, como `2d6+3`)                       |
| Componente         | Vitest + [Testing Library](https://testing-library.com/)                  | Ao lado do componente, `src/**/*.test.tsx` | `src/App.test.tsx`                                                            |
| Banco e permissões | pgTAP                                                                     | `supabase/tests/database/`                 | Políticas RLS da `health_check`                                               |
| API                | [Playwright](https://playwright.dev/) (request) + [Zod](https://zod.dev/) | `tests/api/`                               | Contrato e permissões de `/rest/v1/health_check`                              |
| E2E                | Playwright com Page Objects                                               | `tests/e2e/`                               | Página inicial; o mesmo teste, marcado com `@smoke`, confere o site publicado |

Convenções:

- Testes de unidade usam o ambiente Node; testes de componente (`.test.tsx`) usam jsdom.
- Testes E2E nunca usam seletores soltos: cada tela tem um Page Object em `tests/e2e/pages/`, entregue aos testes pelas fixtures de `tests/e2e/fixtures.ts`.
- Testes de API usam só a chave pública (anon) do Supabase, lida automaticamente do Supabase local.
- Por enquanto o E2E roda só no Chromium; Firefox e WebKit entram antes do beta.

Na primeira vez, instale o navegador usado pelo Playwright:

```bash
npx playwright install chromium
```

## Integração contínua

Todo pull request e todo push na branch `main` passam pelo GitHub Actions (`.github/workflows/ci.yml`). Um pull request só pode ser mesclado com todos estes jobs aprovados:

| Job                                                   | O que verifica                                                                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `quality`                                             | Formatação, lint, tipos e build de produção.                                                                                |
| `database`                                            | Sobe o banco local do Supabase a partir das migrations e roda os testes pgTAP.                                              |
| `unit`                                                | Testes de unidade e de componente (Vitest).                                                                                 |
| `api`                                                 | Sobe a API do Supabase local e roda os testes de API (Playwright).                                                          |
| `e2e`                                                 | Roda os testes E2E (Playwright, Chromium) contra o mesmo build gerado pelo job `quality`.                                   |
| `secrets`                                             | Procura senhas e tokens em todo o histórico do Git com o [Gitleaks](https://github.com/gitleaks/gitleaks).                  |
| `codeql (javascript-typescript)` e `codeql (actions)` | Análise de segurança do código e dos workflows com o [CodeQL](https://codeql.github.com/) (`.github/workflows/codeql.yml`). |

Para conferir localmente antes de abrir um pull request, com o Supabase local em execução:

```bash
npm run format:check && npm run lint && npm run typecheck && npm run build && npm test && npm run test:db && npm run test:api && npm run test:e2e
```

## Deploy

O deploy é automático: a cada merge na `main`, depois que todos os jobs de verificação passam, o GitHub Actions publica o build em [rollstead.com.br](https://rollstead.com.br) pelo Cloudflare Workers.

| Job      | O que faz                                                                                     |
| -------- | --------------------------------------------------------------------------------------------- |
| `deploy` | Publica no Cloudflare o mesmo build verificado pelo job `quality`. Roda só em push na `main`. |
| `smoke`  | Abre o site publicado no Chromium e roda os testes E2E marcados com `@smoke`.                 |

As credenciais do Cloudflare (`CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`) ficam apenas nos secrets do ambiente `production` do GitHub, que só aceita deploys vindos da `main`. Nenhuma chave fica no código.

Para testar o empacotamento localmente, sem publicar nada:

```bash
npm run build
npx wrangler deploy --dry-run
```

## Segurança

| Proteção                   | O que faz                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Gitleaks (job `secrets`)   | Bloqueia o merge se encontrar uma senha ou token em qualquer commit.                                                                          |
| Proteção de push do GitHub | Recusa o envio de commits com tokens de serviços conhecidos antes que cheguem ao repositório.                                                 |
| CodeQL                     | Analisa o código e os workflows a cada pull request, a cada push na `main` e toda segunda-feira. Alertas de gravidade alta bloqueiam o merge. |
| Dependabot                 | Alerta sobre dependências com falhas conhecidas e abre pull requests de atualização (npm e GitHub Actions) toda segunda-feira.                |

Se um segredo real for enviado por engano, apagá-lo do código não basta: ele continua no histórico. Revogue a chave no serviço de origem e gere uma nova.

## Padrões de código

- Identificadores de código em inglês; mensagens de commit e documentação em português.
- TypeScript em modo estrito.
- Lint com regras de TypeScript (com checagem de tipos), React Hooks e acessibilidade (`jsx-a11y`).
- Formatação automática com Prettier: sem ponto e vírgula, aspas simples e linhas de até 100 caracteres.
- Quebras de linha no padrão LF em todos os sistemas operacionais, garantidas pelo `.gitattributes`.
