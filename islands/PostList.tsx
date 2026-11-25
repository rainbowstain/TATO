import { useEffect, useRef, useState } from "preact/hooks";
import type { PostView, SessionUser } from "../lib/types.ts";
import ProfileImage from "../components/ProfileImage.tsx";
import LikeButton from "./LikeButton.tsx";
import CommentSection from "./CommentSection.tsx";
import { api } from "../lib/fetcher.ts";

interface PostListProps {
  posts: PostView[];
  viewer: SessionUser | null;
  notice?: string | null;
  emptyText?: string;
}

export default function PostList(
  { posts, viewer, notice, emptyText }: PostListProps,
) {
  const [list, setList] = useState(posts);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // deno-lint-ignore no-explicit-any
    const gsap = (globalThis as any).gsap;
    if (gsap && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".post-card"),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "all",
        },
      );
    }
  }, []);

  const remove = async (id: string) => {
    if (!confirm("¿Borrar esta publicación?")) return;
    try {
      await api(`/api/posts/${id}`, "DELETE");
      setList(list.filter((p) => p.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div ref={containerRef} class="flex-1 min-w-0 space-y-6">
      {notice && (
        <div class="p-4 bg-black/30 backdrop-blur-sm rounded-lg text-center">
          <p class="text-red-400">{notice}</p>
        </div>
      )}

      {list.length === 0 && (
        <div class="p-8 bg-black/30 backdrop-blur-sm rounded-lg text-center">
          <p class="text-gray-400 text-lg">
            {emptyText ?? "No hay publicaciones para mostrar"}
          </p>
          <p class="text-gray-500 text-sm mt-2">
            ¡Sé el primero en compartir algo!
          </p>
        </div>
      )}

      {list.map((post) => (
        <article
          key={post.id}
          class="post-card p-6 bg-black/30 backdrop-blur-sm rounded-lg shadow-lg relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/15 to-transparent opacity-60 pointer-events-none" />
          <div class="relative">
            <div class="flex items-center gap-3 mb-4">
              <a
                href={`/user/${encodeURIComponent(post.author)}`}
                class="flex items-center gap-3 group"
              >
                <ProfileImage
                  src={post.authorPicture}
                  username={post.author}
                  class="ring-2 ring-red-500/30 group-hover:ring-red-500"
                />
                <div>
                  <span class="font-medium text-red-400 group-hover:text-red-300">
                    {post.author}
                  </span>
                  <p class="text-red-400/70 text-xs">{post.dateLabel}</p>
                </div>
              </a>
              {viewer &&
                (viewer.username === post.author ||
                  viewer.role === "admin") &&
                (
                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    class="ml-auto text-sm text-white/40 hover:text-red-400"
                    title="Borrar publicación"
                  >
                    Borrar
                  </button>
                )}
            </div>

            <h2 class="text-2xl font-bold text-red-500 mb-2 break-words">
              {post.title}
            </h2>
            <div
              class="post-content text-white/80 leading-relaxed break-words"
              // deno-lint-ignore react-no-danger -- HTML sanitizado en el servidor (lib/sanitize.ts)
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div class="mt-5 flex items-center gap-6 border-b border-white/10 pb-4">
              <LikeButton
                postId={post.id}
                likes={post.likes}
                viewer={viewer?.username ?? null}
              />
            </div>

            <CommentSection
              postId={post.id}
              postAuthor={post.author}
              comments={post.comments}
              viewer={viewer}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
