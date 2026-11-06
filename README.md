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

4. Crie o arquivo `.env.local` a partir do exemplo e cole nele a `ANON_KEY` que `npm run db:status` mostra:

   ```bash
   cp .env.example .env.local
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Abra o endereço exibido no terminal (por padrão, `http://localhost:5173`).

## Comandos disponíveis

| Comando                   | O que faz                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Inicia o servidor de desenvolvimento com recarga automática.                                                        |
| `npm run build`           | Verifica os tipos e gera a versão de produção na pasta `dist/`.                                                     |
| `npm run preview`         | Serve localmente a versão gerada pelo `build`.                                                                      |
| `npm run lint`            | Analisa o código com o ESLint. Falha se houver qualquer erro ou aviso.                                              |
| `npm run typecheck`       | Verifica os tipos do TypeScript sem gerar arquivos.                                                                 |
| `npm run format`          | Formata todos os arquivos com o Prettier.                                                                           |
| `npm run format:check`    | Confere se os arquivos estão formatados, sem alterá-los.                                                            |
| `npm run db:start`        | Sobe o Supabase local no Docker e aplica as migrations.                                                             |
| `npm run db:stop`         | Para os containers do Supabase local, preservando os dados.                                                         |
| `npm run db:reset`        | Recria o banco local do zero, aplicando todas as migrations e o `seed.sql`.                                         |
| `npm run db:status`       | Mostra os endereços e as chaves do ambiente local.                                                                  |
| `npm run test:db`         | Roda os testes pgTAP do banco (requer o banco local em execução).                                                   |
| `npm test`                | Roda os testes de unidade e de componente (Vitest).                                                                 |
| `npm run test:watch`      | Roda o Vitest em modo observação, repetindo os testes a cada alteração.                                             |
| `npm run test:api`        | Roda os testes de API (Playwright) contra o Supabase local (requer o Supabase local em execução).                   |
| `npm run test:e2e`        | Roda os testes E2E (Playwright) no Chromium contra o build local (requer o Supabase local e `npm run build` antes). |
| `npm run test:smoke`      | Roda só os testes marcados com `@smoke`; com `PLAYWRIGHT_BASE_URL`, aponta para um site publicado.                  |
| `npm run perf:bundle`     | Mede o pacote inicial compactado e falha se passar do orçamento (rode `npm run build` antes).                       |
| `npm run perf:lighthouse` | Roda o Lighthouse três vezes contra o build local e falha se a mediana ficar abaixo do mínimo.                      |

## Estrutura do projeto

```
rollstead-rpg/
├── src/                 # Código-fonte da aplicação
│   ├── App.tsx          # Componente raiz e rotas
│   ├── App.test.tsx     # Exemplo de teste de componente
│   ├── auth/            # Sessão, proteção de rotas e mensagens de erro do login
│   ├── components/      # Componentes reutilizáveis
│   ├── i18n/            # Idiomas: configuração e arquivos de tradução (locales/)
│   ├── lib/             # Lógica pura, com o teste ao lado de cada arquivo (*.test.ts)
│   ├── pages/           # Telas
│   ├── styles/          # Tema: tokens de cor (theme.css), únicos com valores de cor
│   ├── test/setup.ts    # Preparação dos testes de componente
│   └── main.tsx         # Ponto de entrada
├── scripts/             # Verificações do orçamento de performance
├── supabase/
│   ├── config.toml      # Configuração do Supabase local
│   ├── migrations/      # Migrations do banco, aplicadas em ordem
│   ├── templates/       # Modelo do e-mail de login
│   ├── tests/database/  # Testes pgTAP
│   └── seed.sql         # Dados de desenvolvimento aplicados no db:reset
├── tests/               # Testes do Playwright
│   ├── api/             # Testes de API (contrato com Zod)
│   ├── support/         # Apoio aos testes: Supabase local e caixa de e-mail
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
- Membros de uma mesa nunca são gravados diretamente pela API: entram por funções no servidor, como `create_table`. A única escrita direta é a saída, limitada por RLS: o mestre remove jogadores e cada jogador remove o próprio lugar. As funções que apoiam as regras de acesso ficam no schema `private`, fora da API.
- Cada mesa guarda o mestre em `game_tables.master_id`, a única fonte dessa informação. O nome da mesa é único por mestre, sem diferenciar maiúsculas de minúsculas, e o próprio banco garante isso com um índice único.
- Participantes se veem só por nome e papel, pela função `list_my_tables`. O identificador de cada usuário fica fora do alcance dos jogadores: só o mestre o recebe, por `list_table_seats`, para remover jogadores. Por isso `game_tables` não aceita `select=*`: peça as colunas pelo nome.
- `supabase/seed.sql` cria um cenário de teste no banco local e no de staging, nunca em produção: sete contas e duas mesas. Com `VITE_TEST_LOGIN=true`, a tela de login ganha botões para entrar nessas contas com um clique, sem e-mail.
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
- Testes de API e E2E usam só a chave pública (anon) do Supabase, lida automaticamente do Supabase local. O login nos testes passa pelo fluxo real: o código e o link são lidos da caixa de e-mail local (Mailpit), nunca de uma chave de serviço.
- Por enquanto o E2E roda só no Chromium; Firefox e WebKit entram antes do beta.

Na primeira vez, instale o navegador usado pelo Playwright:

```bash
npx playwright install chromium
```

## Integração contínua

Todo pull request e todo push na branch `main` passam pelo GitHub Actions (`.github/workflows/ci.yml`). Um pull request só pode ser mesclado com todos estes jobs aprovados:

| Job                                                   | O que verifica                                                                                                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quality`                                             | Formatação, lint, tipos e build de produção.                                                                                                                   |
| `database`                                            | Sobe o banco local do Supabase a partir das migrations e roda os testes pgTAP.                                                                                 |
| `unit`                                                | Testes de unidade e de componente (Vitest).                                                                                                                    |
| `api`                                                 | Sobe a API do Supabase local e roda os testes de API (Playwright).                                                                                             |
| `e2e`                                                 | Sobe o Supabase local, gera um build apontando para ele e roda os testes E2E (Playwright, Chromium), incluindo o login com o e-mail de verdade na caixa local. |
| `performance`                                         | Confere o tamanho do pacote inicial e as notas do Lighthouse contra o orçamento de performance.                                                                |
| `secrets`                                             | Procura senhas e tokens em todo o histórico do Git com o [Gitleaks](https://github.com/gitleaks/gitleaks).                                                     |
| `codeql (javascript-typescript)` e `codeql (actions)` | Análise de segurança do código e dos workflows com o [CodeQL](https://codeql.github.com/) (`.github/workflows/codeql.yml`).                                    |

Para conferir localmente antes de abrir um pull request, com o Supabase local em execução:

```bash
npm run format:check && npm run lint && npm run typecheck && npm run build && npm test && npm run test:db && npm run test:api && npm run test:e2e
```

## Deploy

O deploy é automático: a cada merge na `main`, depois que todos os jobs de verificação passam, o GitHub Actions aplica as migrations novas no banco do Supabase na nuvem e publica o build em [rollstead.com.br](https://rollstead.com.br) pelo Cloudflare Workers.

| Job       | O que faz                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `migrate` | Aplica no banco de produção (Supabase) as migrations que ainda não foram aplicadas. Nunca envia o `seed.sql`. Roda só na `main` (push ou execução manual), antes do `deploy`. |
| `deploy`  | Publica no Cloudflare o mesmo build verificado pelo job `quality`. Roda só na `main` (push ou execução manual).                                                               |
| `smoke`   | Abre o site publicado no Chromium e roda os testes E2E marcados com `@smoke`.                                                                                                 |

As credenciais do Cloudflare (`CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`) e do Supabase (`SUPABASE_ACCESS_TOKEN` e `SUPABASE_DB_PASSWORD`) ficam apenas nos secrets do ambiente `production` do GitHub, que só aceita deploys vindos da `main`. Nenhuma chave fica no código.

Se o GitHub não disparar o pipeline depois de um merge, ele pode ser rodado à mão na aba **Actions** → **CI** → **Run workflow** (branch `main`). Todos os testes rodam de novo antes do deploy.

Para testar o empacotamento localmente, sem publicar nada:

```bash
npm run build
npx wrangler deploy --dry-run
```

## Login

Não há senha: `/entrar` envia um e-mail com um link e um código de 6 dígitos, e qualquer um dos dois abre a sessão. O código serve para entrar no aparelho em que o e-mail foi pedido, mesmo lendo o e-mail em outro. No primeiro acesso, a pessoa escolhe o nome de exibição, que é o que o grupo vê; o e-mail nunca é mostrado.

- O app lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no build. Os dois são públicos por natureza: quem protege os dados é a RLS. O build de produção usa o banco de produção; os previews, o de staging; os testes, o local.
- No Supabase local, os e-mails não saem de verdade: ficam na caixa em `http://127.0.0.1:54324`.
- O modelo do e-mail fica em `supabase/templates/magic-link.html`. Nos projetos na nuvem, ele é configurado no painel do Supabase.

## Lista de mesas

Cada mesa mostra os retratos dos participantes: o mestre primeiro, com contorno dourado, e os jogadores por ordem de chegada, com contorno prateado. Até 6 retratos aparecem na lista; os demais ficam em **+N**, que abre uma lista por clique, toque ou teclado. O nome aparece ao passar o cursor, ao focar ou ao tocar e segurar. Enquanto o envio de avatar não existe, todos usam o retrato genérico. Cada pessoa ordena a própria lista pela alça, com mouse, teclado ou toque longo. A ordem fica salva na conta, e mesas novas entram no topo.

## Gerenciar a mesa

Na área **Gerenciar mesa**, o mestre renomeia e exclui a mesa, além de cuidar do convite. Renomear segue a regra de nome único. Excluir pede a digitação do nome da mesa e é definitivo: a mesa some para todos os participantes, e o nome fica livre para ser usado de novo. O banco recusa as duas ações para quem não é o mestre.

A mesma área lista os participantes, e o mestre pode remover um jogador. Quem é removido perde o acesso na hora, mas pode voltar com um convite válido; para impedir, revogue o link. O jogador sai sozinho em **Sair da mesa**. O mestre não sai nem é removido da própria mesa.

## Convites

O mestre gera o link de convite na área **Gerenciar mesa**, que só ele vê. Cada mesa tem um link, válido por 7 dias e para vários jogadores, com limite de 8 jogadores por mesa.

- O banco guarda só um hash do token. O link aparece uma vez, ao ser gerado; se for perdido, o mestre gera outro, e o antigo para de valer.
- Quem abre o link passa pelo login, se preciso, vê o nome da mesa e confirma a entrada em **Entrar na mesa**.
- Todas as operações são funções no servidor (`create_invite`, `revoke_invite`, `get_invite` e `join_table`), que conferem o papel de quem chama. Esconder a área na tela não é a proteção: a API também recusa.

## Ambiente de testes (previews)

Cada pull request ganha um endereço próprio para ser conferido à mão antes do merge, publicado pelo workflow `.github/workflows/preview.yml`:

1. O job `preview` espera a aprovação do responsável (ambiente `staging` do GitHub, com revisor obrigatório).
2. Recria do zero o banco de staging (um segundo projeto Supabase gratuito, também em São Paulo) com as migrations e o `seed.sql` do pull request.
3. Gera o build e o publica como um [Preview do Cloudflare Workers](https://developers.cloudflare.com/workers/previews/), em `pr-<número>-rollstead.rollstead.workers.dev`.
4. Comenta o endereço no pull request e roda os testes `@smoke` nele.

Os previews compartilham o mesmo banco de staging, então rodam um de cada vez. Pull requests de forks e do Dependabot não geram preview, porque não recebem as chaves do staging. O preview não é uma checagem obrigatória do merge. O login em um preview precisa que o endereço dele esteja autorizado no Supabase.

As credenciais do staging (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_ACCESS_TOKEN` e `SUPABASE_DB_PASSWORD`) ficam nos secrets do ambiente `staging`, separadas das de produção.

## Banco em produção e keep-alive

O banco de produção é um projeto Supabase gratuito na região de São Paulo. Projetos gratuitos são pausados depois de 7 dias sem atividade, então o workflow `.github/workflows/keep-alive.yml` faz uma leitura leve na tabela `health_check` dos dois bancos (produção e staging) a cada 3 dias.

- Usa só as chaves públicas (`SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_STAGING_PUBLISHABLE_KEY`, secrets do repositório), nunca uma chave de serviço.
- Se a leitura falhar, o GitHub envia um e-mail de falha do workflow.
- Pode ser rodado à mão na aba **Actions** → **Keep-alive** → **Run workflow**.
- O GitHub desliga agendamentos de repositórios públicos depois de 60 dias sem atividade. A cada 2 meses, confira se o workflow continua ativo na aba **Actions**.

## Verificação de credenciais

O workflow `.github/workflows/credentials-check.yml` prova que cada chave externa continua funcionando, sem publicar nem alterar nada:

| Verificação         | Como                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| Token do Cloudflare | Lista os deploys do Worker (`wrangler deployments list`).                  |
| Token do Supabase   | Consulta o projeto na API de gerenciamento e confere a região `sa-east-1`. |
| Senha do banco      | Conecta e simula as migrations (`supabase db push --dry-run`).             |
| Chave pública       | Lê a tabela `health_check`.                                                |

Roda toda segunda-feira para a produção. Para o staging, só à mão (aba **Actions** → **Credentials check** → **Run workflow**), porque cada uso do ambiente `staging` espera aprovação. Deve ser rodado antes do merge de qualquer pull request que dependa de configuração externa nova.

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

| Proteção                   | O que faz                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gitleaks (job `secrets`)   | Bloqueia o merge se encontrar uma senha ou token em qualquer commit.                                                                                               |
| Proteção de push do GitHub | Recusa o envio de commits com tokens de serviços conhecidos antes que cheguem ao repositório.                                                                      |
| CodeQL                     | Analisa o código e os workflows a cada pull request, a cada push na `main`, toda segunda-feira e quando rodado à mão. Alertas de gravidade alta bloqueiam o merge. |
| Dependabot                 | Alerta sobre dependências com falhas conhecidas e abre pull requests de atualização (npm e GitHub Actions) toda segunda-feira.                                     |

Se um segredo real for enviado por engano, apagá-lo do código não basta: ele continua no histórico. Revogue a chave no serviço de origem e gere uma nova.

## Padrões de código

- Identificadores de código em inglês; mensagens de commit e documentação em português.
- TypeScript em modo estrito.
- Nenhum texto fixo em componentes: todo texto da interface vem dos arquivos de tradução.
- Nenhuma cor fixa em componentes: toda cor vem dos tokens de `src/styles/theme.css`.
- Lint com regras de TypeScript (com checagem de tipos), React Hooks e acessibilidade (`jsx-a11y`).
- Formatação automática com Prettier: sem ponto e vírgula, aspas simples e linhas de até 100 caracteres.
- Quebras de linha no padrão LF em todos os sistemas operacionais, garantidas pelo `.gitattributes`.
