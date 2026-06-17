# 💰 Finanças Web

Interface (frontend) do app de finanças pessoais. Consome a **Finanças API** (NestJS) e oferece login, cadastro de contas, categorias e lançamento de transações.

> Frontend do projeto **Finanças** — a API fica no repositório `financas-api`. Este repositório é só a "cara bonita" que conversa com ela.

## 🧱 Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS**
- Autenticação via **JWT** (access token guardado no navegador)

## ✨ Funcionalidades

- 🔐 **Login** — consome `POST /auth/login`, guarda o token e protege as rotas internas
- 💳 **Contas** — criar, listar e excluir (mostra o saldo calculado pela API)
- 🏷️ **Categorias** — criar, listar e excluir (receita/despesa, com cor)
- 💸 **Transações** — lançar, listar e excluir (o seletor de categoria filtra pelo tipo escolhido)
- 🔄 Saldos e listas sempre recarregados da API após cada ação

## 🚀 Como rodar (local)

1. Tenha a **API** rodando primeiro (`financas-api`, em `http://localhost:3000/api`).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env.local` com o endereço da API:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
4. Suba o frontend (porta **3001**, pra não conflitar com a API):
   ```bash
   npm run dev
   ```
5. Abra **http://localhost:3001**.

> No Windows, há o atalho **"Iniciar Site"** na Área de Trabalho que já faz isso.

## 🔗 Arquitetura

```
Navegador  →  Frontend (Next.js, :3001)  →  API (NestJS, :3000)  →  PostgreSQL (Neon, nuvem)
```

O frontend nunca fala direto com o banco — sempre passa pela API, que valida a autenticação.

## 🗺️ Roadmap

- [x] Login + área logada (dashboard)
- [x] Contas, Categorias e Transações (criar / listar / excluir)
- [ ] Relatórios (resumo do mês, com gráfico)
- [ ] Orçamentos (planejado vs gasto)
- [ ] Editar registros (não só criar/excluir)
- [ ] Cadastro de novo usuário
- [ ] Deploy na Vercel
