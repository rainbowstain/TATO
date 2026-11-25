import { define } from "../../../utils.ts";
import { db } from "../../../lib/db.ts";
import { jsonError } from "../../../lib/auth.ts";
import { getPostAuthor } from "../../../lib/queries.ts";

export const handler = define.handlers({
  DELETE(ctx) {
    const user = ctx.state.user;
    if (!user) return jsonError("Debes iniciar sesión", 401);

    const author = getPostAuthor(ctx.params.id);
    if (!author) return jsonError("La publicación no existe", 404);
    if (author !== user.username && user.role !== "admin") {
      return jsonError("No puedes borrar publicaciones de otros", 403);
    }

    db.prepare("DELETE FROM posts WHERE id = ?").run(ctx.params.id);
    return Response.json({ ok: true });
  },
});
