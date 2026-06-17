"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Summary = {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
};

type CategoryTotal = {
  categoryId: string | null;
  name: string;
  color: string | null;
  total: number;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const agora = new Date();

function brl(v: number) {
  return "R$ " + Number(v).toFixed(2);
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [month, setMonth] = useState(agora.getMonth() + 1);
  const [year, setYear] = useState(agora.getFullYear());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byCategory, setByCategory] = useState<CategoryTotal[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    let active = true;
    (async () => {
      setError("");
      try {
        const [s, cat] = await Promise.all([
          apiFetch(`/reports/summary?month=${month}&year=${year}`),
          apiFetch(
            `/reports/by-category?month=${month}&year=${year}&type=EXPENSE`,
          ),
        ]);
        if (active) {
          setSummary(s);
          setByCategory(cat);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar relatório",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [router, month, year]);

  const totalDespesa = byCategory.reduce((acc, c) => acc + Number(c.total), 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold text-zinc-800">Relatórios</h1>

        {/* Seletor de período */}
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

        {/* Cards de resumo */}
        {summary && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-xs text-zinc-500">Receitas</div>
              <div className="mt-1 text-xl font-bold text-emerald-600">
                {brl(summary.income)}
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-xs text-zinc-500">Despesas</div>
              <div className="mt-1 text-xl font-bold text-red-600">
                {brl(summary.expense)}
              </div>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-xs text-zinc-500">Saldo</div>
              <div
                className={`mt-1 text-xl font-bold ${
                  summary.balance < 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {brl(summary.balance)}
              </div>
            </div>
          </div>
        )}

        {/* Despesas por categoria (barras) */}
        <h2 className="mb-3 font-semibold text-zinc-700">
          Despesas por categoria
        </h2>
        {byCategory.length === 0 ? (
          <p className="text-zinc-500">Sem despesas neste período.</p>
        ) : (
          <ul className="space-y-3">
            {byCategory.map((c) => {
              const pct =
                totalDespesa > 0 ? (Number(c.total) / totalDespesa) * 100 : 0;
              return (
                <li key={c.categoryId ?? "sem"} className="text-sm">
                  <div className="mb-1 flex justify-between text-zinc-700">
                    <span>{c.name}</span>
                    <span className="font-medium">
                      {brl(c.total)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: c.color ?? "#ef4444",
                      }}
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
