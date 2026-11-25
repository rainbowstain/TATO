import { useState } from "preact/hooks";
import { api } from "../lib/fetcher.ts";

interface LikeButtonProps {
  postId: string;
  likes: string[];
  viewer: string | null;
}

function likeText(users: string[]): string {
  const n = users.length;
  if (n === 0) return "Me gusta";
  if (n === 1) return `Le gusta a ${users[0]}`;
  if (n === 2) return `Les gusta a ${users[0]} y ${users[1]}`;
  return `Les gusta a ${users[0]}, ${users[1]} y ${n - 2} más`;
}

export default function LikeButton({ postId, likes, viewer }: LikeButtonProps) {
  const [users, setUsers] = useState(likes);
  const [busy, setBusy] = useState(false);
  const liked = viewer !== null && users.includes(viewer);

  const toggle = async () => {
    if (!viewer) {
      globalThis.location.href = "/login";
      return;
    }
    if (busy) return;
    const previous = users;
    // Actualización optimista
    setUsers(liked ? users.filter((u) => u !== viewer) : [...users, viewer]);
    setBusy(true);
    try {
      const res = await api<{ likes: string[] }>(`/api/posts/${postId}/like`);
      setUsers(res.likes);
    } catch (err) {
      setUsers(previous);
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      class={`flex items-center gap-2 transition-colors ${
        liked ? "text-red-400" : "text-white hover:text-red-400"
      }`}
      title={users.join(", ")}
    >
      <span class={liked ? "scale-110" : "grayscale opacity-70"}>❤️</span>
      <span class="text-sm">{likeText(users)}</span>
    </button>
  );
}
