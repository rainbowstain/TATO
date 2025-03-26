import { Handlers } from "$fresh/server.ts";
import { User } from "../../../types.d.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    try {
      // Leer el archivo de usuarios
      const usersText = await Deno.readTextFile("./data/users.json");
      const users: User[] = JSON.parse(usersText);
      
      // Eliminar las contraseñas por seguridad
      const safeUsers = users.map(user => {
        const { password: _password, ...safeUser } = user;
        return safeUser;
      });
      
      return new Response(JSON.stringify(safeUsers), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
