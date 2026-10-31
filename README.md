# Rollstead

[![CI](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml/badge.svg)](https://github.com/ThomasTDS/rollstead-rpg/actions/workflows/ci.yml)

**Português** · [English](README.en.md) · [Español](README.es.md)

> A sessão acaba. A história fica.

Mesa virtual de RPG com estética JRPG, feita para campanhas guiadas pela história.

O Rollstead reúne mesa, compêndio, diário de jornada e mesa de som num só lugar. Foi pensado para grupos que já jogam por Discord ou Google Meet: a voz fica com essas ferramentas, e o Rollstead cuida do que aparece na tela. Roda no navegador, sem instalação, e é leve o bastante para notebooks de entrada e internet instável.

## Status

Em desenvolvimento inicial. O projeto ainda não tem uma versão jogável.

## Tecnologias

| Camada                              | Ferramenta                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| Interface                           | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)   |
| Build e servidor de desenvolvimento | [Vite](https://vite.dev/)                                                     |
| Qualidade de código                 | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)              |
| Banco de dados e API                | [Supabase](https://supabase.com/) (PostgreSQL), rodando localmente via Docker |
| Testes de banco                     | [pgTAP](https://pgtap.org/)                                                   |

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

| Comando                | O que faz                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor de desenvolvimento com recarga automática.                |
| `npm run build`        | Verifica os tipos e gera a versão de produção na pasta `dist/`.             |
| `npm run preview`      | Serve localmente a versão gerada pelo `build`.                              |
| `npm run lint`         | Analisa o código com o ESLint. Falha se houver qualquer erro ou aviso.      |
| `npm run typecheck`    | Verifica os tipos do TypeScript sem gerar arquivos.                         |
| `npm run format`       | Formata todos os arquivos com o Prettier.                                   |
| `npm run format:check` | Confere se os arquivos estão formatados, sem alterá-los.                    |
| `npm run db:start`     | Sobe o Supabase local no Docker e aplica as migrations.                     |
| `npm run db:stop`      | Para os containers do Supabase local, preservando os dados.                 |
| `npm run db:reset`     | Recria o banco local do zero, aplicando todas as migrations e o `seed.sql`. |
| `npm run db:status`    | Mostra os endereços e as chaves do ambiente local.                          |
| `npm run test:db`      | Roda os testes pgTAP do banco (requer o banco local em execução).           |

## Estrutura do projeto

```
rollstead-rpg/
├── src/                 # Código-fonte da aplicação
│   ├── App.tsx          # Componente raiz
│   └── main.tsx         # Ponto de entrada
├── supabase/
│   ├── config.toml      # Configuração do Supabase local
│   ├── migrations/      # Migrations do banco, aplicadas em ordem
│   ├── tests/database/  # Testes pgTAP
│   └── seed.sql         # Dados de desenvolvimento aplicados no db:reset
├── index.html           # Página base carregada pelo Vite
├── eslint.config.js     # Regras de lint
├── tsconfig*.json       # Configurações do TypeScript
└── vite.config.ts       # Configuração do Vite
```

## Banco de dados local

O banco nunca é alterado à mão: toda mudança de estrutura vira uma migration versionada em `supabase/migrations/`, e o banco local pode ser recriado do zero a qualquer momento com `npm run db:reset`.

- Para criar uma migration: `npx supabase migration new <nome_da_mudanca>`.
- Uma migration já publicada não é editada; correções viram uma migration nova.
- Toda tabela do schema `public` precisa de RLS (Row Level Security) ativada. Um teste em `supabase/tests/database/rls_enabled.test.sql` falha se alguma tabela for criada sem ela.
- As chaves exibidas por `npm run db:status` são as chaves de demonstração do Supabase local, iguais em todas as instalações. As chaves do ambiente real nunca vão para o repositório.

## Integração contínua

Todo pull request e todo push na branch `main` passam pelo GitHub Actions (`.github/workflows/ci.yml`). Um pull request só pode ser mesclado com os dois jobs aprovados:

| Job        | O que verifica                                                                 |
| ---------- | ------------------------------------------------------------------------------ |
| `quality`  | Formatação, lint, tipos e build de produção.                                   |
| `database` | Sobe o banco local do Supabase a partir das migrations e roda os testes pgTAP. |

Para conferir localmente antes de abrir um pull request, com o banco local em execução:

```bash
npm run format:check && npm run lint && npm run typecheck && npm run build && npm run test:db
```

## Padrões de código

- Identificadores de código em inglês; mensagens de commit e documentação em português.
- TypeScript em modo estrito.
- Lint com regras de TypeScript (com checagem de tipos), React Hooks e acessibilidade (`jsx-a11y`).
- Formatação automática com Prettier: sem ponto e vírgula, aspas simples e linhas de até 100 caracteres.
- Quebras de linha no padrão LF em todos os sistemas operacionais, garantidas pelo `.gitattributes`.
