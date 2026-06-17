"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Category = {
  id: string;
  name: string;
  type: string;
  color: string | null;
};

export default function CategoriasPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [color, setColor] = useState("#ef4444");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#ef4444");

  async function load() {
    try {
      setCategories(await apiFetch("/categories"));
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
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ name, type, color }),
      });
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar categoria");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir esta categoria?")) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditColor(c.color ?? "#ef4444");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    try {
      await apiFetch(`/categories/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName, color: editColor }),
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
        <h1 className="mb-4 text-2xl font-bold text-zinc-800">Categorias</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-xl bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 font-semibold text-zinc-700">Nova categoria</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              type="text"
              placeholder="Nome (ex.: Alimentação)"
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
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="Cor da categoria"
              className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar categoria"}
          </button>
        </form>

        {categories.length === 0 ? (
          <p className="text-zinc-500">
            Nenhuma categoria ainda. Crie a primeira aí em cima! ☝️
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="rounded-lg bg-white p-4 shadow-sm">
                {editingId === c.id ? (
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
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      title="Cor"
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300"
                    />
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
                    <span className="flex items-center gap-3 text-zinc-800">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: c.color ?? "#d4d4d8" }}
                      />
                      {c.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium ${
                          c.type === "INCOME"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {c.type === "INCOME" ? "Receita" : "Despesa"}
                      </span>
                      <button
                        onClick={() => startEdit(c)}
                        title="Editar"
                        className="text-zinc-400 transition hover:text-emerald-600"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
