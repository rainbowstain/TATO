// Helper de cliente para llamar a la API. La cookie de sesión viaja sola.

export async function api<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    globalThis.location.href = "/login";
    throw new Error("No has iniciado sesión");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Error ${res.status}`);
  }
  return data as T;
}
