import { createDefine } from "fresh";
import type { SessionUser } from "./lib/types.ts";

// Tipo de "ctx.state", compartido entre middlewares, layouts y rutas.
export interface State {
  user: SessionUser | null;
}

export const define = createDefine<State>();
