import { useState } from "preact/hooks";
import type { PublicUser, SessionUser, UserStats } from "../lib/types.ts";
import ProfileImage from "../components/ProfileImage.tsx";
import UserRow from "../components/UserRow.tsx";
import ProfileImageUploader from "./ProfileImageUploader.tsx";
import { api } from "../lib/fetcher.ts";

type Tab = "friends" | "followers" | "following";

interface Props {
  profile: PublicUser;
  stats: UserStats;
  followers: PublicUser[];
  following: PublicUser[];
  friends: PublicUser[];
  viewer: SessionUser | null;
  /** ¿El visitante sigue a este perfil? */
  viewerFollows: boolean;
  /** ¿Este perfil sigue al visitante? */
  followsViewer: boolean;
  initialTab?: Tab | null;
}

const TAB_TITLES: Record<Tab, string> = {
  friends: "Amigos",
  followers: "Seguidores",
  following: "Siguiendo",
};

export default function UserProfileIsland(props: Props) {
  const { profile, viewer, followsViewer } = props;
  const isOwner = viewer?.username === profile.username;

  const [follows, setFollows] = useState(props.viewerFollows);
  const [followerCount, setFollowerCount] = useState(props.stats.followers);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab | null>(props.initialTab ?? null);

  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(profile.description);
  const [picture, setPicture] = useState(profile.profilePicture);
  const [saving, setSaving] = useState(false);

  const isFriend = follows && followsViewer;
  // Los amigos solo cambian si cambia el seguimiento entre el visitante y este perfil
  const friendCount = props.stats.friends;

  const toggleFollow = async () => {
    if (!viewer) {
      globalThis.location.href = "/login";
      return;
    }
    if (
      isFriend &&
      !confirm(
        `¿Dejar de seguir a ${profile.username}? Dejaréis de ser amigos.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await api<{ following: boolean; followers: number }>(
        `/api/users/${encodeURIComponent(profile.username)}/follow`,
        follows ? "DELETE" : "POST",
      );
      setFollows(res.following);
      setFollowerCount(res.followers);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/me", "PUT", {
        description,
        profilePicture: picture !== profile.profilePicture
          ? picture
          : undefined,
      });
      globalThis.location.reload();
    } catch (err) {
      alert((err as Error).message);
      setSaving(false);
    }
  };

  const followLabel = isFriend
    ? "Amigos ✓"
    : follows
    ? "Siguiendo ✓"
    : followsViewer
    ? "Seguir también"
    : "Seguir";

  const tabUsers: Record<Tab, PublicUser[]> = {
    friends: props.friends,
    followers: props.followers,
    following: props.following,
  };

  const statBox = (label: string, value: number, t?: Tab) => (
    <button
      type="button"
      disabled={!t}
      onClick={() => t && setTab(t)}
      class="bg-white/5 p-3 rounded-lg text-center hover:bg-white/10 transition-colors disabled:cursor-default"
    >
      <span class="block text-sm text-gray-400">{label}</span>
      <span class="text-xl font-medium text-white">{value}</span>
    </button>
  );

  return (
    <div class="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex flex-col items-center gap-4 md:w-40">
          {editing
            ? (
              <ProfileImageUploader
                current={picture}
                username={profile.username}
                onChange={setPicture}
              />
            )
            : (
              <ProfileImage
                src={profile.profilePicture}
                username={profile.username}
                size="lg"
              />
            )}

          {isOwner && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Editar perfil
            </button>
          )}
          {isOwner && editing && (
            <div class="flex gap-2 w-full">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                class="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? "..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDescription(profile.description);
                  setPicture(profile.profilePicture);
                }}
                class="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Cancelar
              </button>
            </div>
          )}
          {!isOwner && (
            <button
              type="button"
              onClick={toggleFollow}
              disabled={busy}
              class={`w-full px-4 py-2 text-white rounded-lg transition-all hover:shadow-glow disabled:opacity-50 ${
                follows
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={follows ? "Pulsa para dejar de seguir" : undefined}
            >
              {busy ? "..." : followLabel}
            </button>
          )}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <h1 class="text-2xl font-bold text-white break-all">
              {profile.username}
            </h1>
            {profile.role === "admin" && (
              <span class="px-2 py-0.5 bg-red-500/30 text-red-300 text-xs rounded-full">
                Admin
              </span>
            )}
            {isFriend && (
              <span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                Amigo
              </span>
            )}
            {!isOwner && followsViewer && !follows && (
              <span class="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-full">
                Te sigue
              </span>
            )}
          </div>

          {editing
            ? (
              <div class="mb-4">
                <label class="block text-sm text-gray-400 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onInput={(e) =>
                    setDescription((e.target as HTMLTextAreaElement).value)}
                  maxLength={300}
                  class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white min-h-[100px] focus:outline-none focus:border-red-500"
                  placeholder="Escribe algo sobre ti..."
                />
                <p class="text-xs text-white/40 text-right">
                  {description.length}/300
                </p>
              </div>
            )
            : (
              <p class="text-white/80 mb-6 whitespace-pre-wrap">
                {profile.description || "Este usuario no tiene descripción."}
              </p>
            )}

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statBox("Publicaciones", props.stats.posts)}
            {statBox("Amigos", friendCount, "friends")}
            {statBox("Siguiendo", props.stats.following, "following")}
            {statBox("Seguidores", followerCount, "followers")}
          </div>
        </div>
      </div>

      {tab && (
        <div
          class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setTab(null)}
        >
          <div
            class="bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-white">
                {TAB_TITLES[tab]} de {profile.username}
              </h3>
              <button
                type="button"
                onClick={() => setTab(null)}
                class="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div class="flex border-b border-white/10">
              {(Object.keys(TAB_TITLES) as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  class={`flex-1 py-2 text-sm ${
                    t === tab
                      ? "text-red-400 border-b-2 border-red-500"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {TAB_TITLES[t]} ({tabUsers[t].length})
                </button>
              ))}
            </div>
            <div class="p-2 overflow-y-auto">
              {tabUsers[tab].length === 0
                ? (
                  <p class="text-center text-white/60 py-6">
                    No hay nadie aquí todavía
                  </p>
                )
                : tabUsers[tab].map((u) => (
                  <UserRow key={u.username} user={u} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
