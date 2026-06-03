import { API_URL } from "@/shared/config";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : (data.message ?? "Ошибка запроса");
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

function authHeaders(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function apiGet<T>(path: string, token?: string | null): Promise<T> {
  return request<T>(path, {
    method: "GET",
    headers: { ...authHeaders(token) },
  });
}

export function apiPost<T>(
  path: string,
  body: unknown,
  token?: string | null,
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
}
