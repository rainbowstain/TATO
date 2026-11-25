import { db, plain, plainAll } from "./db.ts";
import type { CommentView, PostView, PublicUser, UserStats } from "./types.ts";

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const dateFmt = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "hace 5 min", "hace 3 h", o fecha completa si es más antigua. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "ahora mismo";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 7 * 86400) return `hace ${Math.floor(diff / 86400)} d`;
  return dateFmt.format(d);
}

export const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/;

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------

export function getUser(username: string): PublicUser | null {
  const row = db.prepare(
    `SELECT username, role, description, profile_picture AS profilePicture
       FROM users WHERE username = ?`,
  ).get(username);
  return row ? plain<PublicUser>(row) : null;
}

export function getPasswordHash(username: string): string | null {
  const row = db.prepare("SELECT password_hash FROM users WHERE username = ?")
    .get(username) as { password_hash: string } | undefined;
  return row?.password_hash ?? null;
}

export function getUserStats(username: string): UserStats {
  return plain<UserStats>(
    db.prepare(
      `SELECT
       (SELECT COUNT(*) FROM posts WHERE author = $u)            AS posts,
       (SELECT COUNT(*) FROM follows WHERE following = $u)       AS followers,
       (SELECT COUNT(*) FROM follows WHERE follower = $u)        AS following,
       (SELECT COUNT(*) FROM follows a JOIN follows b
          ON a.following = b.follower AND b.following = a.follower
         WHERE a.follower = $u)                                  AS friends`,
    ).get({ u: username }),
  );
}

const USER_COLS =
  "u.username, u.role, u.description, u.profile_picture AS profilePicture";

export function getFollowers(username: string): PublicUser[] {
  return plainAll<PublicUser>(
    db.prepare(
      `SELECT ${USER_COLS} FROM follows f JOIN users u ON u.username = f.follower
      WHERE f.following = ? ORDER BY u.username`,
    ).all(username),
  );
}

export function getFollowing(username: string): PublicUser[] {
  return plainAll<PublicUser>(
    db.prepare(
      `SELECT ${USER_COLS} FROM follows f JOIN users u ON u.username = f.following
      WHERE f.follower = ? ORDER BY u.username`,
    ).all(username),
  );
}

/** Amigos = seguimiento mutuo. */
export function getFriends(username: string): PublicUser[] {
  return plainAll<PublicUser>(
    db.prepare(
      `SELECT ${USER_COLS} FROM follows a
       JOIN follows b ON a.following = b.follower AND b.following = a.follower
       JOIN users u ON u.username = a.following
      WHERE a.follower = ? ORDER BY u.username`,
    ).all(username),
  );
}

export function isFollowing(follower: string, following: string): boolean {
  return !!db.prepare(
    "SELECT 1 FROM follows WHERE follower = ? AND following = ?",
  ).get(follower, following);
}

/** Usuarios a los que el usuario aún no sigue (para "a quién seguir"). */
export function getSuggestions(username: string, limit = 5): PublicUser[] {
  return plainAll<PublicUser>(
    db.prepare(
      `SELECT ${USER_COLS} FROM users u
      WHERE u.username <> $u AND u.password_hash <> '!'
        AND u.username NOT IN (SELECT following FROM follows WHERE follower = $u)
      ORDER BY (SELECT COUNT(*) FROM follows WHERE following = u.username) DESC
      LIMIT $limit`,
    ).all({ u: username, limit }),
  );
}

export function searchUsers(q: string, limit = 8): PublicUser[] {
  return plainAll<PublicUser>(
    db.prepare(
      `SELECT ${USER_COLS} FROM users u
      WHERE u.username LIKE ? ESCAPE '\\' AND u.password_hash <> '!'
      ORDER BY u.username LIMIT ?`,
    ).all(`%${q.replace(/[\\%_]/g, "\\$&")}%`, limit),
  );
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

interface PostRow {
  id: string;
  title: string;
  content: string;
  author: string;
  authorPicture: string | null;
  created_at: string;
}

/** Completa likes y comentarios de una lista de posts (3 consultas en total). */
function hydratePosts(rows: PostRow[]): PostView[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");

  const likes = new Map<string, string[]>();
  for (
    const l of db.prepare(
      `SELECT post_id, username FROM post_likes WHERE post_id IN (${placeholders})
        ORDER BY created_at`,
    ).all(...ids) as { post_id: string; username: string }[]
  ) {
    (likes.get(l.post_id) ?? likes.set(l.post_id, []).get(l.post_id)!).push(
      l.username,
    );
  }

  const commentRows = db.prepare(
    `SELECT c.id, c.post_id, c.author, c.content, c.created_at,
            u.profile_picture AS authorPicture
       FROM comments c JOIN users u ON u.username = c.author
      WHERE c.post_id IN (${placeholders})
      ORDER BY c.created_at`,
  ).all(...ids) as {
    id: string;
    post_id: string;
    author: string;
    content: string;
    created_at: string;
    authorPicture: string | null;
  }[];

  const commentLikes = new Map<string, string[]>();
  if (commentRows.length) {
    const cids = commentRows.map((c) => c.id);
    for (
      const l of db.prepare(
        `SELECT comment_id, username FROM comment_likes
          WHERE comment_id IN (${cids.map(() => "?").join(",")})`,
      ).all(...cids) as { comment_id: string; username: string }[]
    ) {
      (commentLikes.get(l.comment_id) ??
        commentLikes.set(l.comment_id, []).get(l.comment_id)!).push(
          l.username,
        );
    }
  }

  const comments = new Map<string, CommentView[]>();
  for (const c of commentRows) {
    const list = comments.get(c.post_id) ??
      comments.set(c.post_id, []).get(c.post_id)!;
    list.push({
      id: c.id,
      author: c.author,
      authorPicture: c.authorPicture,
      content: c.content,
      dateLabel: formatDate(c.created_at),
      likes: commentLikes.get(c.id) ?? [],
    });
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    author: r.author,
    authorPicture: r.authorPicture,
    dateLabel: formatDate(r.created_at),
    likes: likes.get(r.id) ?? [],
    comments: comments.get(r.id) ?? [],
  }));
}

const POST_SELECT = `SELECT p.id, p.title, p.content, p.author, p.created_at,
                            u.profile_picture AS authorPicture
                       FROM posts p JOIN users u ON u.username = p.author`;

export type FeedSort = "new" | "hot" | "popular" | "friends";

export function getFeed(
  sort: FeedSort,
  viewer: string | null,
  limit = 50,
): PostView[] {
  let sql: string;
  let params: Record<string, string | number> = { limit };

  switch (sort) {
    case "hot": // más likes en total
      sql = `${POST_SELECT}
        ORDER BY (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) DESC,
                 p.created_at DESC LIMIT $limit`;
      break;
    case "popular": // más actividad (likes + comentarios) en las últimas 24 h
      sql = `${POST_SELECT}
        ORDER BY (
          (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.created_at > $since) +
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.created_at > $since)
        ) DESC, p.created_at DESC LIMIT $limit`;
      params = {
        limit,
        since: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      };
      break;
    case "friends":
      sql = `${POST_SELECT}
        WHERE p.author IN (
          SELECT a.following FROM follows a
            JOIN follows b ON a.following = b.follower AND b.following = a.follower
           WHERE a.follower = $viewer)
        ORDER BY p.created_at DESC LIMIT $limit`;
      params = { limit, viewer: viewer ?? "" };
      break;
    default:
      sql = `${POST_SELECT} ORDER BY p.created_at DESC LIMIT $limit`;
  }

  return hydratePosts(db.prepare(sql).all(params) as unknown as PostRow[]);
}

export function getPostsByUser(username: string): PostView[] {
  return hydratePosts(
    db.prepare(`${POST_SELECT} WHERE p.author = ? ORDER BY p.created_at DESC`)
      .all(username) as unknown as PostRow[],
  );
}

export function getPostAuthor(postId: string): string | null {
  const row = db.prepare("SELECT author FROM posts WHERE id = ?").get(postId) as
    | { author: string }
    | undefined;
  return row?.author ?? null;
}

export function getCommentInfo(
  commentId: string,
): { author: string; postAuthor: string } | null {
  const row = db.prepare(
    `SELECT c.author, p.author AS postAuthor
       FROM comments c JOIN posts p ON p.id = c.post_id WHERE c.id = ?`,
  ).get(commentId) as { author: string; postAuthor: string } | undefined;
  return row ?? null;
}

/** Alterna una fila en una tabla de "likes". Devuelve la lista actualizada. */
export function toggleLike(
  table: "post_likes" | "comment_likes",
  idCol: "post_id" | "comment_id",
  id: string,
  username: string,
): string[] {
  const exists = db.prepare(
    `SELECT 1 FROM ${table} WHERE ${idCol} = ? AND username = ?`,
  ).get(id, username);
  if (exists) {
    db.prepare(`DELETE FROM ${table} WHERE ${idCol} = ? AND username = ?`)
      .run(id, username);
  } else {
    db.prepare(`INSERT INTO ${table} (${idCol}, username) VALUES (?, ?)`)
      .run(id, username);
  }
  return (db.prepare(`SELECT username FROM ${table} WHERE ${idCol} = ?`)
    .all(id) as { username: string }[]).map((r) => r.username);
}
