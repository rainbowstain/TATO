import { Handlers } from "$fresh/server.ts";
import { Post } from "../../../../../types.d.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const { username } = await req.json();
    const { postId, commentId } = ctx.params;

    if (!username) {
      return new Response("Missing username", { status: 400 });
    }

    try {
      const posts = JSON.parse(await Deno.readTextFile("./data/posts.json"));
      const postIndex = posts.findIndex((p: Post) => p.id === postId);

      if (postIndex === -1) {
        return new Response("Post not found", { status: 404 });
      }

      const post = posts[postIndex];
      
      if (!post.comments) {
        return new Response("No comments found", { status: 404 });
      }

      const commentIndex = post.comments.findIndex((c: { id: string }) => c.id === commentId);
      
      if (commentIndex === -1) {
        return new Response("Comment not found", { status: 404 });
      }

      const comment = post.comments[commentIndex];

      // Initialize likes object if it doesn't exist
      if (!comment.likes) {
        comment.likes = {};
      }

      // Toggle like
      if (comment.likes[username]) {
        delete comment.likes[username];
      } else {
        comment.likes[username] = true;
      }

      // Update comment
      post.comments[commentIndex] = comment;
      
      // Save changes
      posts[postIndex] = post;
      await Deno.writeTextFile("./data/posts.json", JSON.stringify(posts, null, 2));

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error updating comment like:", error);
      return new Response("Error updating comment like", { status: 500 });
    }
  },
};
