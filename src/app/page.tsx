import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 text-center">
      <h1 className="text-5xl font-bold text-emerald-600">💰 Finanças</h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600">
        Seu gerenciador financeiro pessoal. Controle contas, transações,
        orçamentos e relatórios — tudo conectado à sua própria API.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-lg bg-emerald-600 px-8 py-3 font-medium text-white transition hover:bg-emerald-700"
      >
        Entrar
      </Link>
    </main>
  );
}
