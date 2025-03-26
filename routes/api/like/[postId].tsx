import { Handlers } from "$fresh/server.ts";

interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  likes: { [username: string]: boolean };
}

export const handler: Handlers = {
  async POST(req, ctx) {
    const { username } = await req.json();
    const postId = ctx.params.postId;

    try {
      const posts = JSON.parse(await Deno.readTextFile("./data/posts.json"));
      const postIndex = posts.findIndex((p: Post) => p.id === postId);

      if (postIndex === -1) {
        return new Response("Post not found", { status: 404 });
      }

      const post = posts[postIndex];

      // Initialize likes object if it doesn't exist
      if (!post.likes) {
        post.likes = {};
      }

      // Check if user has already liked
      if (post.likes[username]) {
        // Remove like
        delete post.likes[username];
      } else {
        // Add like
        post.likes[username] = true;
      }

      // Save changes
      posts[postIndex] = post;
      await Deno.writeTextFile("./data/posts.json", JSON.stringify(posts, null, 2));

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error updating like:", error);
      return new Response("Error updating like", { status: 500 });
    }
  },
};
