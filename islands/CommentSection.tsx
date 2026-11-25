import { useRef, useState } from "preact/hooks";
import type { CommentView, SessionUser } from "../lib/types.ts";
import ProfileImage from "../components/ProfileImage.tsx";
import { api } from "../lib/fetcher.ts";

interface CommentSectionProps {
  postId: string;
  postAuthor: string;
  comments: CommentView[];
  viewer: SessionUser | null;
}

export default function CommentSection(
  { postId, postAuthor, comments, viewer }: CommentSectionProps,
) {
  const [list, setList] = useState(comments);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const t = textareaRef.current;
    if (t) {
      t.style.height = "auto";
      t.style.height = `${t.scrollHeight}px`;
    }
  };

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const comment = await api<CommentView>(
        `/api/posts/${postId}/comments`,
        "POST",
        { content: text },
      );
      setList([...list, comment]);
      setText("");
      setOpen(true);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleLike = async (id: string) => {
    if (!viewer) {
      globalThis.location.href = "/login";
      return;
    }
    try {
      const res = await api<{ likes: string[] }>(`/api/comments/${id}/like`);
      setList(list.map((c) => (c.id === id ? { ...c, likes: res.likes } : c)));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Borrar este comentario?")) return;
    try {
      await api(`/api/comments/${id}`, "DELETE");
      setList(list.filter((c) => c.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const canDelete = (c: CommentView) =>
    !!viewer &&
    (viewer.username === c.author || viewer.username === postAuthor ||
      viewer.role === "admin");

  return (
    <div class="mt-4 space-y-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <span
          class={`inline-block transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▸
        </span>
        {open ? "Ocultar comentarios" : `Ver comentarios (${list.length})`}
      </button>

      {open && (
        <div class="space-y-3 animate-fadeIn">
          {list.length === 0 && (
            <p class="text-gray-400 text-center py-2 text-sm">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          )}
          {list.map((c) => (
            <div key={c.id} class="p-3 bg-white/5 rounded-lg flex gap-3">
              <ProfileImage
                src={c.authorPicture}
                username={c.author}
                size="xs"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <a
                    href={`/user/${encodeURIComponent(c.author)}`}
                    class="font-medium text-red-400 hover:underline"
                  >
                    {c.author}
                  </a>
                  <span class="text-gray-500 text-xs">{c.dateLabel}</span>
                  {canDelete(c) && (
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      class="ml-auto text-xs text-gray-500 hover:text-red-400"
                    >
                      Borrar
                    </button>
                  )}
                </div>
                <p class="text-white/90 whitespace-pre-wrap break-words">
                  {c.content}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    toggleLike(c.id)}
                  class="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-red-400"
                  title={c.likes.join(", ")}
                >
                  <span
                    class={viewer && c.likes.includes(viewer.username)
                      ? ""
                      : "grayscale opacity-70"}
                  >
                    ❤️
                  </span>
                  <span>{c.likes.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewer
        ? (
          <form onSubmit={submit} class="flex items-start gap-2">
            <ProfileImage
              src={viewer.profilePicture}
              username={viewer.username}
              size="xs"
            />
            <div class="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={text}
                onInput={(e) => {
                  setText((e.target as HTMLTextAreaElement).value);
                  resize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) submit(e);
                }}
                placeholder="Escribe un comentario... (Enter para enviar)"
                maxLength={1000}
                rows={1}
                class="w-full min-h-[40px] max-h-[200px] py-2 pl-3 pr-24 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-red-500 resize-none overflow-hidden"
              />
              <button
                type="submit"
                disabled={busy || !text.trim()}
                class="absolute right-2 top-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 disabled:opacity-50 disabled:pointer-events-none"
              >
                {busy ? "..." : "Publicar"}
              </button>
            </div>
          </form>
        )
        : (
          <div class="p-3 bg-white/5 rounded-lg text-center text-sm">
            <a href="/login" class="text-red-400 hover:underline">
              Inicia sesión
            </a>{" "}
            para dejar un comentario
          </div>
        )}
    </div>
  );
}
