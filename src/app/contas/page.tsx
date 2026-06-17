"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};

const TIPOS = [
  { value: "CHECKING", label: "Conta corrente" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "CASH", label: "Dinheiro" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "INVESTMENT", label: "Investimento" },
];

function tipoLabel(value: string) {
  return TIPOS.find((t) => t.value === value)?.label ?? value;
}

export default function ContasPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [initialBalance, setInitialBalance] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("CHECKING");

  async function load() {
    try {
      const data = await apiFetch("/accounts");
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar contas");
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    load();
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/accounts", {
        method: "POST",
        body: JSON.stringify({
          name,
          type,
          initialBalance: Number(initialBalance),
        }),
      });
      setName("");
      setType("CHECKING");
      setInitialBalance("0");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Excluir esta conta? As transações dela também serão apagadas.",
      )
    )
      return;
    try {
      await apiFetch(`/accounts/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  function startEdit(a: Account) {
    setEditingId(a.id);
    setEditName(a.name);
    setEditType(a.type);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    try {
      await apiFetch(`/accounts/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName, type: editType }),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold text-zinc-800">Minhas contas</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Formulário de criar conta */}
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-xl bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 font-semibold text-zinc-700">Nova conta</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Nome (ex.: Nubank)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Saldo inicial"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        {/* Lista de contas */}
        {accounts.length === 0 ? (
          <p className="text-zinc-500">
            Nenhuma conta ainda. Crie a primeira aí em cima! ☝️
          </p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="rounded-lg bg-white p-4 shadow-sm">
                {editingId === a.id ? (
                  <form
                    onSubmit={handleUpdate}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900 outline-none focus:border-emerald-500"
                    />
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900 outline-none focus:border-emerald-500"
                    >
                      {TIPOS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-zinc-300 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-800">
                      {a.name}{" "}
                      <span className="text-xs text-zinc-400">
                        ({tipoLabel(a.type)})
                      </span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          Number(a.balance) < 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        R$ {Number(a.balance).toFixed(2)}
                      </span>
                      <button
                        onClick={() => startEdit(a)}
                        title="Editar"
                        className="text-zinc-400 transition hover:text-emerald-600"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        title="Excluir"
                        className="text-zinc-400 transition hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
