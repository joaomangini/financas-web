"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type User = { name: string; email: string };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    apiFetch("/auth/me")
      .then(setUser)
      .catch(() => router.push("/login"));
  }, [router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando...
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-emerald-600">
          Olá, {user.name}! 👋
        </h1>
        <p className="mt-1 text-zinc-600">Logado como {user.email}.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/contas"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-2xl">💳</div>
            <div className="mt-2 font-semibold text-zinc-800">Contas</div>
            <div className="text-xs text-zinc-500">Criar e ver suas contas</div>
          </Link>

          <Link
            href="/categorias"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-2xl">🏷️</div>
            <div className="mt-2 font-semibold text-zinc-800">Categorias</div>
            <div className="text-xs text-zinc-500">Organize receitas e despesas</div>
          </Link>

          <Link
            href="/transacoes"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-2xl">💸</div>
            <div className="mt-2 font-semibold text-zinc-800">Transações</div>
            <div className="text-xs text-zinc-500">Lançar entradas e saídas</div>
          </Link>

          <Link
            href="/relatorios"
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-2xl">📊</div>
            <div className="mt-2 font-semibold text-zinc-800">Relatórios</div>
            <div className="text-xs text-zinc-500">Resumo do mês por categoria</div>
          </Link>
        </div>
      </main>
    </div>
  );
}
