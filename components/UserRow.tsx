import type { PublicUser } from "../lib/types.ts";
import ProfileImage from "./ProfileImage.tsx";

/** Fila de usuario con avatar, para listas (seguidores, búsqueda, etc.). */
export default function UserRow({ user }: { user: PublicUser }) {
  return (
    <a
      href={`/user/${encodeURIComponent(user.username)}`}
      class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <ProfileImage src={user.profilePicture} username={user.username} />
      <div class="min-w-0">
        <p class="text-white font-medium truncate">{user.username}</p>
        {user.description && (
          <p class="text-white/50 text-xs truncate">{user.description}</p>
        )}
      </div>
    </a>
  );
}
