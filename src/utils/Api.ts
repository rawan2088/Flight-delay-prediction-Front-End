// One place for the base URL + authenticated requests.
// todo: should be changed to production level
// Local dev: create .env with VITE_API_BASE=http://127.0.0.1:8000
export const API_BASE: string =
  import.meta.env.VITE_API_BASE ?? "https://flightprediction-backend.fly.dev";
export const USERS_URL = `${API_BASE}/api/users`;
export const PREDICTIONS_URL = `${API_BASE}/api/predictions`;

const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  const res = await fetch(`${USERS_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
  return data.access;
}

/** fetch() + Bearer token. On a 401 it refreshes the access token once and retries. */
export async function authFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const send = (token: string | null) =>
    fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await send(localStorage.getItem("access_token"));
  if (res.status === 401) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const token = await refreshPromise;
    if (token) res = await send(token);
  }
  return res;
}

/** Turns DRF error bodies ({error}, {detail}, or {field: [msgs]}) into one readable string. */
export function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.error === "string") return b.error;
    if (typeof b.detail === "string") return b.detail;
    const parts = Object.entries(b).map(
      ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : String(v)}`,
    );
    if (parts.length) return parts.join(" • ");
  }
  return fallback;
}
