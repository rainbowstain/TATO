import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./password.ts";

const DB_PATH = Deno.env.get("TATO_DB") ?? "./data/tato.db";

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    username        TEXT PRIMARY KEY,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'user',
    description     TEXT NOT NULL DEFAULT '',
    profile_picture TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    username   TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower   TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    following  TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (follower, following),
    CHECK (follower <> following)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id         TEXT PRIMARY KEY,
    author     TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX IF NOT EXISTS posts_author ON posts(author);
  CREATE INDEX IF NOT EXISTS posts_created ON posts(created_at);

  CREATE TABLE IF NOT EXISTS post_likes (
    post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    username   TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (post_id, username)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id         TEXT PRIMARY KEY,
    post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author     TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX IF NOT EXISTS comments_post ON comments(post_id);

  CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    username   TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    PRIMARY KEY (comment_id, username)
  );
`);

// node:sqlite devuelve objetos sin prototipo (Object.create(null)), que el
// serializador de props de las islands de Fresh no acepta. Los convertimos
// en objetos normales antes de pasarlos a la vista.
export function plain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

export function plainAll<T>(rows: unknown[]): T[] {
  return rows.map((r) => ({ ...(r as object) })) as T[];
}

/** Ejecuta fn dentro de una transacción. */
export function tx<T>(fn: () => T): T {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Migración única desde los antiguos data/users.json y data/posts.json
// ---------------------------------------------------------------------------

interface LegacyUser {
  username: string;
  password: string;
  role?: string;
  description?: string;
  profilePicture?: string;
  following?: string[];
  followers?: string[];
}

interface LegacyComment {
  id: string;
  author: string;
  content: string;
  date: string;
  likes?: Record<string, boolean>;
}

interface LegacyPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author?: string;
  likes?: Record<string, boolean>;
  comments?: LegacyComment[];
}

function readJson<T>(path: string): T[] {
  try {
    return JSON.parse(Deno.readTextFileSync(path));
  } catch {
    return [];
  }
}

function toIso(date: string | undefined): string {
  const d = date ? new Date(date) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Las fotos de source.unsplash.com ya no funcionan (el servicio cerró).
function cleanPicture(url?: string): string | null {
  if (!url || url.includes("source.unsplash.com")) return null;
  return url;
}

async function migrateFromJson() {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as {
    n: number;
  };
  if (n > 0) return;

  const users = readJson<LegacyUser>("./data/users.json");
  const posts = readJson<LegacyPost>("./data/posts.json");
  if (users.length === 0 && posts.length === 0) return;

  // Hashear fuera de la transacción (es asíncrono)
  const hashed = new Map<string, string>();
  for (const u of users) {
    hashed.set(u.username, await hashPassword(u.password));
  }

  tx(() => {
    const insertUser = db.prepare(
      `INSERT OR IGNORE INTO users (username, password_hash, role, description, profile_picture)
       VALUES (?, ?, ?, ?, ?)`,
    );
    // Usuarios que aparecen en posts/seguidores pero no en users.json:
    // se crean sin contraseña válida (no pueden iniciar sesión).
    const ensureUser = (name: string) =>
      insertUser.run(name, "!", "user", "", null);

    for (const u of users) {
      insertUser.run(
        u.username,
        hashed.get(u.username)!,
        u.role === "admin" ? "admin" : "user",
        u.description ?? "",
        cleanPicture(u.profilePicture),
      );
    }

    const insertFollow = db.prepare(
      "INSERT OR IGNORE INTO follows (follower, following) VALUES (?, ?)",
    );
    for (const u of users) {
      for (const f of u.following ?? []) {
        if (f === u.username) continue;
        ensureUser(f);
        insertFollow.run(u.username, f);
      }
      for (const f of u.followers ?? []) {
        if (f === u.username) continue;
        ensureUser(f);
        insertFollow.run(f, u.username);
      }
    }

    const insertPost = db.prepare(
      "INSERT OR IGNORE INTO posts (id, author, title, content, created_at) VALUES (?, ?, ?, ?, ?)",
    );
    const insertLike = db.prepare(
      "INSERT OR IGNORE INTO post_likes (post_id, username) VALUES (?, ?)",
    );
    const insertComment = db.prepare(
      "INSERT OR IGNORE INTO comments (id, post_id, author, content, created_at) VALUES (?, ?, ?, ?, ?)",
    );
    const insertCommentLike = db.prepare(
      "INSERT OR IGNORE INTO comment_likes (comment_id, username) VALUES (?, ?)",
    );

    for (const p of posts) {
      const author = p.author ?? "admin";
      ensureUser(author);
      insertPost.run(p.id, author, p.title, p.content, toIso(p.date));
      for (const [name, liked] of Object.entries(p.likes ?? {})) {
        if (!liked) continue;
        ensureUser(name);
        insertLike.run(p.id, name);
      }
      for (const c of p.comments ?? []) {
        ensureUser(c.author);
        insertComment.run(c.id, p.id, c.author, c.content, toIso(c.date));
        for (const [name, liked] of Object.entries(c.likes ?? {})) {
          if (!liked) continue;
          ensureUser(name);
          insertCommentLike.run(c.id, name);
        }
      }
    }
  });

  console.log(
    `[db] Migrados ${users.length} usuarios y ${posts.length} posts desde JSON`,
  );
}

await migrateFromJson();
