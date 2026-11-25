import { HttpError, page } from "fresh";
import { define } from "../../utils.ts";
import { db } from "../../lib/db.ts";
import { formatDate } from "../../lib/queries.ts";

interface UserRowData {
  username: string;
  role: string;
  created_at: string;
  posts: number;
  followers: number;
}

export const handler = define.handlers({
  GET(ctx) {
    if (ctx.state.user?.role !== "admin") throw new HttpError(404);

    const totals = db.prepare(
      `SELECT (SELECT COUNT(*) FROM users WHERE password_hash <> '!') AS users,
              (SELECT COUNT(*) FROM posts)    AS posts,
              (SELECT COUNT(*) FROM comments) AS comments,
              (SELECT COUNT(*) FROM post_likes) AS likes`,
    ).get() as Record<string, number>;

    const users = db.prepare(
      `SELECT u.username, u.role, u.created_at,
              (SELECT COUNT(*) FROM posts p WHERE p.author = u.username) AS posts,
              (SELECT COUNT(*) FROM follows f WHERE f.following = u.username) AS followers
         FROM users u WHERE u.password_hash <> '!' ORDER BY u.created_at DESC`,
    ).all() as unknown as UserRowData[];

    return page({ totals, users });
  },

  // Acciones de admin: cambiar rol o borrar usuario
  async POST(ctx) {
    const me = ctx.state.user;
    if (me?.role !== "admin") throw new HttpError(404);
    const form = await ctx.req.formData();
    const action = String(form.get("action"));
    const username = String(form.get("username"));

    if (username === me.username) {
      return new Response("No puedes modificar tu propia cuenta aquí", {
        status: 400,
      });
    }
    if (action === "delete") {
      db.prepare("DELETE FROM users WHERE username = ?").run(username);
    } else if (action === "promote" || action === "demote") {
      db.prepare("UPDATE users SET role = ? WHERE username = ?")
        .run(action === "promote" ? "admin" : "user", username);
    }
    return ctx.redirect("/admin");
  },
});

export default define.page<typeof handler>(function Admin({ data, state }) {
  const card = (label: string, value: number) => (
    <div class="bg-white/10 rounded-lg p-4 text-center">
      <p class="text-3xl font-bold text-white">{value}</p>
      <p class="text-white/60 text-sm">{label}</p>
    </div>
  );
  return (
    <main class="max-w-5xl mx-auto p-4">
      <h1 class="text-3xl font-bold text-red-500 mb-6">
        Panel de administración
      </h1>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {card("Usuarios", data.totals.users)}
        {card("Publicaciones", data.totals.posts)}
        {card("Comentarios", data.totals.comments)}
        {card("Me gusta", data.totals.likes)}
      </div>

      <div class="bg-white/10 rounded-lg overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-white/60 border-b border-white/10">
            <tr>
              <th class="p-3">Usuario</th>
              <th class="p-3">Rol</th>
              <th class="p-3">Posts</th>
              <th class="p-3">Seguidores</th>
              <th class="p-3">Alta</th>
              <th class="p-3" />
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.username} class="border-b border-white/5">
                <td class="p-3">
                  <a
                    href={`/user/${encodeURIComponent(u.username)}`}
                    class="text-red-400 hover:underline"
                  >
                    {u.username}
                  </a>
                </td>
                <td class="p-3">{u.role}</td>
                <td class="p-3">{u.posts}</td>
                <td class="p-3">{u.followers}</td>
                <td class="p-3 text-white/60">{formatDate(u.created_at)}</td>
                <td class="p-3">
                  {u.username !== state.user?.username && (
                    <form method="post" class="flex gap-2 justify-end">
                      <input type="hidden" name="username" value={u.username} />
                      <button
                        type="submit"
                        name="action"
                        value={u.role === "admin" ? "demote" : "promote"}
                        class="px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                      >
                        {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="delete"
                        class="px-2 py-1 bg-red-500/30 rounded hover:bg-red-500/60"
                      >
                        Borrar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="text-white/40 text-xs mt-3">
        Borrar un usuario elimina también sus publicaciones, comentarios y
        likes.
      </p>
    </main>
  );
});
