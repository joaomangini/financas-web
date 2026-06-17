# 💰 Finanças Web

Interface (frontend) de um app de finanças pessoais. Consome a **Finanças API** (NestJS) e oferece login/cadastro, contas, categorias, transações, orçamentos e relatórios.

> Frontend do projeto **Finanças**. A API fica no repositório [`financas-api`](https://github.com/joaomangini/financas-api).

## 🔗 Demo ao vivo

- 🌐 **App:** https://financas-web-lac.vercel.app
- 🔌 **API:** https://financas-api-wssv.onrender.com/api

> ⏳ A API roda no plano gratuito da Render e "dorme" após ~15 min de inatividade — o primeiro acesso pode levar ~50s pra "acordar". Depois fica rápido.

## 🧱 Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS**
- Autenticação via **JWT** (access token guardado no navegador)
- Deploy: **Vercel** (frontend) + **Render** (API) + **Neon** (PostgreSQL)

## ✨ Funcionalidades

- 🔐 **Login e cadastro** de usuários (JWT)
- 💳 **Contas** — criar, listar, **editar** e excluir (com saldo calculado)
- 🏷️ **Categorias** — criar, listar, **editar** e excluir (receita/despesa, com cor)
- 💸 **Transações** — lançar, listar, **editar** e excluir (categoria filtrada por tipo)
- 🎯 **Orçamentos** — definir limite por categoria e acompanhar planejado vs gasto
- 📊 **Relatórios** — resumo do mês (receitas/despesas/saldo) e despesas por categoria
- ⏳ Aviso amigável quando a API gratuita está "acordando" (cold start)

## 🚀 Como rodar (local)

1. Tenha a **API** rodando primeiro (`financas-api`, em `http://localhost:3000/api`).
2. Instale as dependências: `npm install`
3. Crie o `.env.local` com o endereço da API:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
4. Suba o frontend (porta **3001**, pra não conflitar com a API): `npm run dev`
5. Abra **http://localhost:3001**.

## 🔗 Arquitetura

```
Navegador  →  Frontend (Next.js)  →  API (NestJS)  →  PostgreSQL (Neon)
                                          ↑
                              n8n → Telegram (alerta de gasto + relatório mensal)
```

O frontend nunca fala direto com o banco — sempre passa pela API, que valida a autenticação.

## 🗺️ Roadmap

- [x] Login + cadastro + área logada (dashboard)
- [x] Contas, Categorias e Transações (criar / editar / listar / excluir)
- [x] Orçamentos (planejado vs gasto)
- [x] Relatórios (resumo do mês + despesas por categoria)
- [x] Deploy na Vercel (frontend) e Render (API)
- [ ] Importar CSV pela interface
- [ ] Multiusuário: cada usuário recebe o próprio relatório no Telegram
