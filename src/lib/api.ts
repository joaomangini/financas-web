// Helper central para falar com a API NestJS.
// Guarda o token no navegador (localStorage) e o anexa nas requisições.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// Faz uma chamada à API já com o cabeçalho de autenticação (se houver token).
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // A API (class-validator) pode mandar vários erros num array.
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message;
    throw new Error(msg || `Erro ${res.status}`);
  }

  if (res.status === 204) return null; // sem conteúdo (ex.: DELETE)
  return res.json();
}
