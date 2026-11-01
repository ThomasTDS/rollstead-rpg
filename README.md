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
| Estilo                              | [Tailwind CSS](https://tailwindcss.com/) com tokens de tema em variáveis CSS                   |
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

| Comando                   | O que faz                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Inicia o servidor de desenvolvimento com recarga automática.                                       |
| `npm run build`           | Verifica os tipos e gera a versão de produção na pasta `dist/`.                                    |
| `npm run preview`         | Serve localmente a versão gerada pelo `build`.                                                     |
| `npm run lint`            | Analisa o código com o ESLint. Falha se houver qualquer erro ou aviso.                             |
| `npm run typecheck`       | Verifica os tipos do TypeScript sem gerar arquivos.                                                |
| `npm run format`          | Formata todos os arquivos com o Prettier.                                                          |
| `npm run format:check`    | Confere se os arquivos estão formatados, sem alterá-los.                                           |
| `npm run db:start`        | Sobe o Supabase local no Docker e aplica as migrations.                                            |
| `npm run db:stop`         | Para os containers do Supabase local, preservando os dados.                                        |
| `npm run db:reset`        | Recria o banco local do zero, aplicando todas as migrations e o `seed.sql`.                        |
| `npm run db:status`       | Mostra os endereços e as chaves do ambiente local.                                                 |
| `npm run test:db`         | Roda os testes pgTAP do banco (requer o banco local em execução).                                  |
| `npm test`                | Roda os testes de unidade e de componente (Vitest).                                                |
| `npm run test:watch`      | Roda o Vitest em modo observação, repetindo os testes a cada alteração.                            |
| `npm run test:api`        | Roda os testes de API (Playwright) contra o Supabase local (requer o Supabase local em execução).  |
| `npm run test:e2e`        | Roda os testes E2E (Playwright) no Chromium contra o build local (rode `npm run build` antes).     |
| `npm run test:smoke`      | Roda só os testes marcados com `@smoke`; com `PLAYWRIGHT_BASE_URL`, aponta para um site publicado. |
| `npm run perf:bundle`     | Mede o pacote inicial compactado e falha se passar do orçamento (rode `npm run build` antes).      |
| `npm run perf:lighthouse` | Roda o Lighthouse três vezes contra o build local e falha se a mediana ficar abaixo do mínimo.     |

## Estrutura do projeto

```
rollstead-rpg/
├── src/                 # Código-fonte da aplicação
│   ├── App.tsx          # Componente raiz
│   ├── App.test.tsx     # Exemplo de teste de componente
│   ├── components/      # Componentes reutilizáveis
│   ├── i18n/            # Idiomas: configuração e arquivos de tradução (locales/)
│   ├── lib/             # Lógica pura, com o teste ao lado de cada arquivo (*.test.ts)
│   ├── styles/          # Tema: tokens de cor (theme.css), únicos com valores de cor
│   ├── test/setup.ts    # Preparação dos testes de componente
│   └── main.tsx         # Ponto de entrada
├── scripts/             # Verificações do orçamento de performance
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
├── performance-budget.json # Limites de performance travados no CI
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

## Idiomas

O Rollstead nasce em português (padrão), inglês e espanhol, com [react-i18next](https://react.i18next.com/).

- Todo texto da interface fica em `src/i18n/locales/<idioma>/<namespace>.json`. O português (`pt-BR`) é o idioma de referência, e as chaves são verificadas pelo TypeScript a partir dele.
- O idioma é detectado pelo navegador; idiomas sem suporte caem no português. A troca manual fica salva no navegador.
- Só os textos do idioma em uso são baixados.
- Um teste falha se uma chave existir em um idioma e faltar em outro, ou se algum texto estiver vazio.
- O lint acusa texto fixo em componentes (regra `i18next/no-literal-string`).

Para adicionar um texto: crie a chave nos três arquivos de tradução e use `t('chave')` no componente.

## Tema e cores

As cores ficam só em `src/styles/theme.css`, como tokens com valor para o tema claro e para o escuro (`light-dark()`). Os componentes usam as classes do Tailwind geradas a partir deles, como `bg-background`, `text-foreground` e `bg-window`, e nunca um valor de cor.

- A paleta padrão do Tailwind está desligada: classes como `bg-red-500` não existem.
- O tema segue a preferência do sistema. `data-theme="light"` ou `data-theme="dark"` no `<html>` força um deles.
- Um teste varre o código e falha se encontrar cor fixa fora do `theme.css` (hexadecimal, `rgb()`, `hsl()` e afins, ou a paleta do Tailwind).
- Outro teste confere o contraste dos pares de cor nos dois temas, pela regra WCAG: 4,5:1 para texto e 3:1 para elementos de interface.

A paleta atual é provisória e inspirada em JRPG (pergaminho de dia, noite estrelada à noite, janelas azuis e destaques dourados). Trocar a paleta é só mudar os valores no `theme.css`.

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
| `performance`                                         | Confere o tamanho do pacote inicial e as notas do Lighthouse contra o orçamento de performance.                             |
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

## Orçamento de performance

O Rollstead precisa abrir rápido em PCs modestos e internet instável. Os limites ficam em `performance-budget.json` e são travados no CI:

| Trava                                                                   | Limite atual                      | Onde roda                                     |
| ----------------------------------------------------------------------- | --------------------------------- | --------------------------------------------- |
| Pacote inicial (JS + CSS que o `index.html` carrega, compactados)       | até 250 KB                        | job `performance` (`npm run perf:bundle`)     |
| Lighthouse (celular, rede e CPU simuladas lentas), mediana de 3 rodadas | performance e acessibilidade ≥ 90 | job `performance` (`npm run perf:lighthouse`) |
| PC e rede lentos (CPU 4x mais lenta, 400 kbps, 400 ms de latência)      | página utilizável em até 10 s     | job `e2e` (`tests/e2e/slow-device.spec.ts`)   |

Os arquivos de tradução não contam no pacote inicial, porque são baixados à parte, só o do idioma em uso. Os valores serão revistos no beta.

O Lighthouse usa o Google Chrome instalado ou, se não houver, o Chromium do Playwright. Antivírus que injetam scripts nas páginas (como o Kaspersky) distorcem a nota medida localmente; a nota que vale é a do CI.

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
- Nenhum texto fixo em componentes: todo texto da interface vem dos arquivos de tradução.
- Nenhuma cor fixa em componentes: toda cor vem dos tokens de `src/styles/theme.css`.
- Lint com regras de TypeScript (com checagem de tipos), React Hooks e acessibilidade (`jsx-a11y`).
- Formatação automática com Prettier: sem ponto e vírgula, aspas simples e linhas de até 100 caracteres.
- Quebras de linha no padrão LF em todos os sistemas operacionais, garantidas pelo `.gitattributes`.
