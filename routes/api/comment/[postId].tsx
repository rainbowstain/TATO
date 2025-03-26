import { Handlers } from "$fresh/server.ts";
import { Post } from "../../../types.d.ts";
import { v4 } from "https://deno.land/std@0.140.0/uuid/mod.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const { content, author } = await req.json();
    const postId = ctx.params.postId;

    if (!content || !author) {
      return new Response("Missing content or author", { status: 400 });
    }

    try {
      const posts = JSON.parse(await Deno.readTextFile("./data/posts.json"));
      const postIndex = posts.findIndex((p: Post) => p.id === postId);

      if (postIndex === -1) {
        return new Response("Post not found", { status: 404 });
      }

      const post = posts[postIndex];

      // Initialize comments array if it doesn't exist
      if (!post.comments) {
        post.comments = [];
      }

      // Create new comment
      const newComment = {
        id: v4.generate(),
        author,
        content,
        date: new Date().toISOString().split("T")[0],
        likes: {}
      };

      // Add comment to post
      post.comments.push(newComment);

      // Save changes
      posts[postIndex] = post;
      await Deno.writeTextFile("./data/posts.json", JSON.stringify(posts, null, 2));

      return new Response(JSON.stringify(newComment), { 
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      return new Response("Error adding comment", { status: 500 });
    }
  },
};
