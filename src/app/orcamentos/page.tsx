"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Category = { id: string; name: string };
type Budget = {
  id: string;
  category: { name: string; color: string | null } | null;
  planned: number;
  spent: number;
  remaining: number;
  percentage: number;
  exceeded: boolean;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const agora = new Date();

function brl(v: number) {
  return "R$ " + Number(v).toFixed(2);
}

export default function OrcamentosPage() {
  const router = useRouter();
  const [month, setMonth] = useState(agora.getMonth() + 1);
  const [year, setYear] = useState(agora.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const [b, cats] = await Promise.all([
        apiFetch(`/budgets?month=${month}&year=${year}`),
        apiFetch(`/categories?type=EXPENSE`),
      ]);
      setBudgets(b);
      setCategories(cats);
      setCategoryId((prev) => prev || (cats[0]?.id ?? ""));
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
  }, [router, month, year]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/budgets", {
        method: "POST",
        body: JSON.stringify({
          categoryId,
          month,
          year,
          amount: Number(amount),
        }),
      });
      setAmount("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar orçamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este orçamento?")) return;
    try {
      await apiFetch(`/budgets/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold text-zinc-800">Orçamentos</h1>

        {/* Período */}
        <div className="mb-6 flex gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          >
            {MESES.map((nome, i) => (
              <option key={i} value={i + 1}>
                {nome}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Criar orçamento */}
        {categories.length === 0 ? (
          <p className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            Você precisa criar uma{" "}
            <Link href="/categorias" className="font-semibold underline">
              categoria de despesa
            </Link>{" "}
            antes de definir orçamentos.
          </p>
        ) : (
          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-xl bg-white p-5 shadow-sm"
          >
            <h2 className="mb-3 font-semibold text-zinc-700">
              Novo orçamento ({MESES[month - 1]}/{year})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Valor planejado"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Definir orçamento"}
            </button>
          </form>
        )}

        {/* Lista de orçamentos com planejado vs gasto */}
        {budgets.length === 0 ? (
          <p className="text-zinc-500">Nenhum orçamento neste período.</p>
        ) : (
          <ul className="space-y-4">
            {budgets.map((b) => {
              const pct = Math.min(Number(b.percentage), 100);
              return (
                <li key={b.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-zinc-800">
                      {b.category?.name ?? "—"}
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Excluir"
                      className="text-zinc-400 transition hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="mb-1 flex justify-between text-sm text-zinc-600">
                    <span>
                      {brl(b.spent)} de {brl(b.planned)}
                    </span>
                    <span
                      className={
                        b.exceeded ? "font-semibold text-red-600" : "text-zinc-500"
                      }
                    >
                      {b.exceeded
                        ? `estourou ${brl(Number(b.spent) - Number(b.planned))}`
                        : `${brl(b.remaining)} restante`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                    <div
                      className={`h-full rounded-full ${
                        b.exceeded ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
