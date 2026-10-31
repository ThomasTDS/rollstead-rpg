# Rollstead

**Português** · [English](README.en.md) · [Español](README.es.md)

> A sessão acaba. A história fica.

Mesa virtual de RPG com estética JRPG, feita para campanhas guiadas pela história.

O Rollstead reúne mesa, compêndio, diário de jornada e mesa de som num só lugar. Foi pensado para grupos que já jogam por Discord ou Google Meet: a voz fica com essas ferramentas, e o Rollstead cuida do que aparece na tela. Roda no navegador, sem instalação, e é leve o bastante para notebooks de entrada e internet instável.

## Status

Em desenvolvimento inicial. O projeto ainda não tem uma versão jogável.

## Tecnologias

| Camada                              | Ferramenta                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Interface                           | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build e servidor de desenvolvimento | [Vite](https://vite.dev/)                                                   |
| Qualidade de código                 | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)            |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 24 ou superior (a versão usada no projeto está em `.nvmrc`)
- npm 11 ou superior (já vem com o Node.js)
- [Git](https://git-scm.com/)

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

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra o endereço exibido no terminal (por padrão, `http://localhost:5173`).

## Comandos disponíveis

| Comando                | O que faz                                                              |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor de desenvolvimento com recarga automática.           |
| `npm run build`        | Verifica os tipos e gera a versão de produção na pasta `dist/`.        |
| `npm run preview`      | Serve localmente a versão gerada pelo `build`.                         |
| `npm run lint`         | Analisa o código com o ESLint. Falha se houver qualquer erro ou aviso. |
| `npm run typecheck`    | Verifica os tipos do TypeScript sem gerar arquivos.                    |
| `npm run format`       | Formata todos os arquivos com o Prettier.                              |
| `npm run format:check` | Confere se os arquivos estão formatados, sem alterá-los.               |

## Estrutura do projeto

```
rollstead-rpg/
├── src/                 # Código-fonte da aplicação
│   ├── App.tsx          # Componente raiz
│   └── main.tsx         # Ponto de entrada
├── index.html           # Página base carregada pelo Vite
├── eslint.config.js     # Regras de lint
├── tsconfig*.json       # Configurações do TypeScript
└── vite.config.ts       # Configuração do Vite
```

## Padrões de código

- Identificadores de código em inglês; mensagens de commit e documentação em português.
- TypeScript em modo estrito.
- Lint com regras de TypeScript (com checagem de tipos), React Hooks e acessibilidade (`jsx-a11y`).
- Formatação automática com Prettier: sem ponto e vírgula, aspas simples e linhas de até 100 caracteres.
- Quebras de linha no padrão LF em todos os sistemas operacionais, garantidas pelo `.gitattributes`.
