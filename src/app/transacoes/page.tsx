"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Account = { id: string; name: string };
type Category = { id: string; name: string; type: string };
type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  account?: { name: string } | null;
  category?: { name: string } | null;
};

export default function TransacoesPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const [acc, cat, tx] = await Promise.all([
        apiFetch("/accounts"),
        apiFetch("/categories"),
        apiFetch("/transactions"),
      ]);
      setAccounts(acc);
      setCategories(cat);
      setTransactions(tx);
      if (acc.length > 0 && !accountId) setAccountId(acc[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Só mostra categorias do mesmo tipo da transação (a API exige isso).
  const categoriasDoTipo = categories.filter((c) => c.type === type);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        description,
        amount: Number(amount),
        type,
        accountId,
      };
      if (categoryId) body.categoryId = categoryId;
      if (date) body.date = date;

      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setDescription("");
      setAmount("");
      setCategoryId("");
      setDate("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar lançamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este lançamento?")) return;
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold text-zinc-800">Transações</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {accounts.length === 0 ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            Você precisa criar uma{" "}
            <Link href="/contas" className="font-semibold underline">
              conta
            </Link>{" "}
            antes de lançar transações.
          </p>
        ) : (
          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-xl bg-white p-5 shadow-sm"
          >
            <h2 className="mb-3 font-semibold text-zinc-700">Novo lançamento</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Descrição (ex.: Mercado)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              />
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCategoryId("");
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              />
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              >
                <option value="">Sem categoria</option>
                {categoriasDoTipo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Adicionar lançamento"}
            </button>
          </form>
        )}

        {transactions.length === 0 ? (
          <p className="text-zinc-500">Nenhum lançamento ainda.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="text-zinc-800">{t.description}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(t.date).toLocaleDateString("pt-BR")}
                    {t.account ? ` · ${t.account.name}` : ""}
                    {t.category ? ` · ${t.category.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold ${
                      t.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "-"} R${" "}
                    {Number(t.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    title="Excluir"
                    className="text-zinc-400 transition hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
