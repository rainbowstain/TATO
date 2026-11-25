import { define } from "../../../utils.ts";
import { db } from "../../../lib/db.ts";
import { jsonError } from "../../../lib/auth.ts";
import { getCommentInfo } from "../../../lib/queries.ts";

export const handler = define.handlers({
  DELETE(ctx) {
    const user = ctx.state.user;
    if (!user) return jsonError("Debes iniciar sesión", 401);

    const info = getCommentInfo(ctx.params.id);
    if (!info) return jsonError("El comentario no existe", 404);
    // Puede borrar: el autor del comentario, el autor del post o un admin
    if (
      info.author !== user.username && info.postAuthor !== user.username &&
      user.role !== "admin"
    ) {
      return jsonError("No puedes borrar este comentario", 403);
    }

    db.prepare("DELETE FROM comments WHERE id = ?").run(ctx.params.id);
    return Response.json({ ok: true });
  },
});
