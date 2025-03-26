import { Handlers } from "$fresh/server.ts";
import { User } from "../../types.d.ts";

export const handler: Handlers = {
  async POST(_req, _ctx) {
    try {
      // En un entorno real, aquí procesaríamos la imagen subida
      // Para este ejemplo, simplemente simularemos que guardamos la imagen
      // y devolveremos una URL de imagen aleatoria de Unsplash
      
      const formData = await _req.formData();
      const username = formData.get("username") as string;
      
      if (!username) {
        return new Response(JSON.stringify({ error: "Nombre de usuario requerido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Leer el archivo de usuarios
      const usersText = await Deno.readTextFile("./data/users.json");
      const users: User[] = JSON.parse(usersText);
      
      // Encontrar el usuario
      const userIndex = users.findIndex(u => u.username === username);
      
      if (userIndex === -1) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Generar una URL de imagen aleatoria (en un entorno real, subiríamos la imagen a un servicio)
      const randomId = Math.floor(Math.random() * 1000);
      const imageUrl = `https://source.unsplash.com/random/200x200?portrait&sig=${randomId}`;
      
      // Actualizar el usuario
      users[userIndex].profilePicture = imageUrl;
      
      // Guardar los cambios
      await Deno.writeTextFile("./data/users.json", JSON.stringify(users, null, 2));
      
      return new Response(JSON.stringify({ imageUrl }), {
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
