import { Handlers, PageProps } from "$fresh/server.ts";
import { Post } from "../../types.d.ts";

const ADMIN_PASSWORD = "edudev123"; // Cambia esto por una contraseña segura

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const loggedIn = url.searchParams.get("loggedIn");

    if (loggedIn !== "true") {
      const headers = new Headers();
      headers.set("Location", "/login");
      return new Response(null, {
        status: 303,
        headers,
      });
    }

    return ctx.render();
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const password = formData.get("password");

    if (password !== ADMIN_PASSWORD) {
      return new Response("Contraseña incorrecta", { status: 401 });
    }

    const title = formData.get("title");
    const content = formData.get("content");

    if (!title || !content) {
      return new Response("Faltan campos requeridos", { status: 400 });
    }

    const posts = JSON.parse(await Deno.readTextFile("./data/posts.json"));
    const newPost: Post = {
      id: crypto.randomUUID(),
      title: title.toString(),
      content: content.toString(),
      date: new Date().toISOString().split("T")[0],
      likes: {}
    };

    posts.push(newPost);
    await Deno.writeTextFile("./data/posts.json", JSON.stringify(posts, null, 2));

    return new Response("Post creado exitosamente", { status: 200 });
  },
};

export default function Admin() {
  return (
    <main class="min-h-screen bg-black text-white">
      <div class="max-w-4xl mx-auto p-4">
        <h1 class="text-4xl font-bold text-red-500 mb-8">Admin Panel</h1>
        <form method="POST" class="space-y-4">
          <div>
            <label for="password" class="block text-white/80">Contraseña:</label>
            <input
              type="password"
              name="password"
              class="w-full p-2 bg-white/10 backdrop-blur-md rounded-lg"
              required
            />
          </div>
          <div>
            <label for="title" class="block text-white/80">Título:</label>
            <input
              type="text"
              name="title"
              class="w-full p-2 bg-white/10 backdrop-blur-md rounded-lg"
              required
            />
          </div>
          <div>
            <label for="content" class="block text-white/80">Contenido:</label>
            <textarea
              name="content"
              class="w-full p-2 bg-white/10 backdrop-blur-md rounded-lg"
            
              required
            ></textarea>
          </div>
          <button
            type="submit"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Crear Post
          </button>
        </form>
      </div>
    </main>
  );
}
