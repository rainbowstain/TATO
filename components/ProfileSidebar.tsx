import type { PublicUser, SessionUser, UserStats } from "../lib/types.ts";
import ProfileImage from "./ProfileImage.tsx";
import UserRow from "./UserRow.tsx";

interface Props {
  user: SessionUser | null;
  stats: UserStats | null;
  friends: PublicUser[];
  suggestions: PublicUser[];
}

export default function ProfileSidebar(
  { user, stats, friends, suggestions }: Props,
) {
  if (!user || !stats) {
    return (
      <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
        <h2 class="text-xl font-semibold text-red-500 mb-4">
          ¡Bienvenido a Tato!
        </h2>
        <p class="text-white/80 mb-4">
          Únete a nuestra comunidad para compartir y conectar con amigos.
        </p>
        <div class="flex flex-col gap-2">
          <a
            href="/login"
            class="px-4 py-2 bg-red-500 text-white rounded-lg text-center hover:bg-red-600"
          >
            Iniciar sesión
          </a>
          <a
            href="/register"
            class="px-4 py-2 bg-white/10 text-white rounded-lg text-center hover:bg-white/20"
          >
            Registrarse
          </a>
        </div>
      </div>
    );
  }

  const profileUrl = `/user/${encodeURIComponent(user.username)}`;
  const stat = (label: string, value: number, tab?: string) => (
    <a
      href={tab ? `${profileUrl}?tab=${tab}` : profileUrl}
      class="bg-white/5 p-2 rounded hover:bg-white/10 transition-colors"
    >
      <span class="block text-sm text-gray-400">{label}</span>
      <span class="text-white font-medium">{value}</span>
    </a>
  );

  return (
    <div class="space-y-6">
      <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
        <a href={profileUrl} class="flex items-center gap-3 mb-4 group">
          <ProfileImage
            src={user.profilePicture}
            username={user.username}
            size="md"
          />
          <div>
            <h2 class="text-xl font-semibold text-white group-hover:text-red-400">
              {user.username}
            </h2>
            <span class="text-red-400 text-sm">Ver perfil</span>
          </div>
        </a>
        <div class="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
          {stat("Amigos", stats.friends, "friends")}
          {stat("Publicaciones", stats.posts)}
          {stat("Siguiendo", stats.following, "following")}
          {stat("Seguidores", stats.followers, "followers")}
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
        <h3 class="text-red-500 font-semibold mb-3">Amigos</h3>
        {friends.length > 0
          ? (
            <div class="flex flex-wrap gap-2">
              {friends.map((f) => (
                <a
                  key={f.username}
                  href={`/user/${encodeURIComponent(f.username)}`}
                  title={f.username}
                  class="hover:scale-110 transition-transform"
                >
                  <ProfileImage
                    src={f.profilePicture}
                    username={f.username}
                    class="ring-2 ring-transparent hover:ring-red-500"
                  />
                </a>
              ))}
            </div>
          )
          : (
            <p class="text-gray-400 text-sm">
              Aún no tienes amigos. Un amigo es alguien que te sigue y a quien
              tú también sigues.
            </p>
          )}
      </div>

      {suggestions.length > 0 && (
        <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
          <h3 class="text-red-500 font-semibold mb-2">A quién seguir</h3>
          <div class="space-y-1">
            {suggestions.map((s) => <UserRow key={s.username} user={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}
