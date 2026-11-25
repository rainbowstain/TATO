import type { Context } from "fresh";
import { define, type State } from "../../../../utils.ts";
import { db } from "../../../../lib/db.ts";
import { jsonError } from "../../../../lib/auth.ts";
import { getUser, getUserStats, isFollowing } from "../../../../lib/queries.ts";

// POST = seguir, DELETE = dejar de seguir. Ambas son idempotentes.
function setFollow(ctx: Context<State>, follow: boolean): Response {
  const me = ctx.state.user;
  if (!me) return jsonError("Debes iniciar sesión", 401);

  const target = decodeURIComponent(ctx.params.username);
  if (target === me.username) {
    return jsonError("No puedes seguirte a ti mismo", 400);
  }
  if (!getUser(target)) return jsonError("Usuario no encontrado", 404);

  if (follow) {
    db.prepare(
      "INSERT OR IGNORE INTO follows (follower, following) VALUES (?, ?)",
    ).run(me.username, target);
  } else {
    db.prepare("DELETE FROM follows WHERE follower = ? AND following = ?")
      .run(me.username, target);
  }

  return Response.json({
    following: isFollowing(me.username, target),
    followers: getUserStats(target).followers,
  });
}

export const handler = define.handlers({
  POST: (ctx) => setFollow(ctx, true),
  DELETE: (ctx) => setFollow(ctx, false),
});
