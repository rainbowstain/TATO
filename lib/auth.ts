import { deleteCookie, getCookies, setCookie } from "@std/http/cookie";
import { db, plain } from "./db.ts";
import type { SessionUser } from "./types.ts";

const COOKIE = "tato_session";
const SESSION_DAYS = 30;

export function createSession(headers: Headers, username: string) {
  const id = crypto.randomUUID() + crypto.randomUUID();
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.prepare("INSERT INTO sessions (id, username, expires_at) VALUES (?, ?, ?)")
    .run(id, username, expires);
  setCookie(headers, {
    name: COOKIE,
    value: id,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    expires: new Date(expires),
  });
}

export function destroySession(req: Request, headers: Headers) {
  const id = getCookies(req.headers)[COOKIE];
  if (id) db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  deleteCookie(headers, COOKIE, { path: "/" });
}

export function getSessionUser(req: Request): SessionUser | null {
  const id = getCookies(req.headers)[COOKIE];
  if (!id) return null;
  const row = db.prepare(
    `SELECT u.username, u.role, u.profile_picture AS profilePicture
       FROM sessions s JOIN users u ON u.username = s.username
      WHERE s.id = ? AND s.expires_at > ?`,
  ).get(id, Date.now());
  return row ? plain<SessionUser>(row) : null;
}

/** Respuesta JSON de error estándar. */
export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
