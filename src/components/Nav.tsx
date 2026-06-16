"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api";

export default function Nav() {
  const router = useRouter();

  function logout() {
    clearTokens();
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-emerald-600">
          💰 Finanças
        </Link>
        <Link href="/contas" className="text-sm text-zinc-600 hover:text-emerald-600">
          Contas
        </Link>
        <Link href="/categorias" className="text-sm text-zinc-600 hover:text-emerald-600">
          Categorias
        </Link>
        <Link href="/transacoes" className="text-sm text-zinc-600 hover:text-emerald-600">
          Transações
        </Link>
      </div>
      <button
        onClick={logout}
        className="text-sm text-zinc-500 hover:text-zinc-800"
      >
        Sair
      </button>
    </nav>
  );
}
