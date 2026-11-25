import { define } from "../utils.ts";
import { destroySession } from "../lib/auth.ts";

export const handler = define.handlers({
  POST(ctx) {
    const headers = new Headers({ Location: "/" });
    destroySession(ctx.req, headers);
    return new Response(null, { status: 303, headers });
  },
});
