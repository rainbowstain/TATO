import { Handlers, PageProps } from "$fresh/server.ts";
import { v4 } from "https://deno.land/std@0.140.0/uuid/mod.ts";
import Navbar from "../../islands/Navbar.tsx";

interface FormData {
  title: string;
  content: string;
}

export const handler: Handlers<FormData> = {
  GET(_req, ctx) {
    return ctx.render({} as FormData);
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const title = form.get("title")?.toString() || "";
    const content = form.get("content")?.toString() || "";
    const username = form.get("username")?.toString() || "";

    if (!title || !content || !username) {
      return ctx.render({ title, content });
    }

    try {
      // Leer posts actuales
      const postsText = await Deno.readTextFile("./data/posts.json");
      const posts = JSON.parse(postsText);

      // Crear nuevo post
      const newPost = {
        id: v4.generate(),
        title,
        content,
        author: username,
        date: new Date().toISOString().split("T")[0],
        likes: {},
        comments: []
      };

      // Añadir nuevo post
      posts.unshift(newPost); // Añadir al principio para que aparezca primero

      // Guardar posts
      await Deno.writeTextFile("./data/posts.json", JSON.stringify(posts, null, 2));

      // Redireccionar a la página principal
      return new Response("", {
        status: 303,
        headers: {
          Location: "/"
        }
      });
    } catch (error) {
      console.error("Error creating post:", error);
      return ctx.render({ title, content });
    }
  }
};

export default function NewPost({ data }: PageProps<FormData>) {
  // Obtener el nombre de usuario del localStorage del cliente
  const username = globalThis.localStorage?.getItem("username") || "";

  if (!username) {
    // Si no hay usuario logueado, redirigir a login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <main class="min-h-screen bg-black text-white">
      <Navbar />
      <div class="max-w-4xl mx-auto p-4">
        <div class="p-6 bg-white/10 backdrop-blur-md rounded-lg">
          <h1 class="text-2xl font-bold text-red-500 mb-6">Create a New Post</h1>
          
          <form method="POST" class="space-y-4">
            <input type="hidden" name="username" value={username} />
            
            <div>
              <label for="title" class="block text-white mb-2">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={data.title || ""}
                required
                class="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Give your post a title"
              />
            </div>
            
            <div>
              <label for="content" class="block text-white mb-2">Content</label>
              <textarea
                id="content"
                name="content"
                value={data.content || ""}
                required
                rows={8}
                class="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="What would you like to share?"
              />
            </div>
            
            <div class="flex justify-end space-x-4">
              <a
                href="/"
                class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Cancel
              </a>
              <button
                type="submit"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
