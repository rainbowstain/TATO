import { HttpError, page } from "fresh";
import { define } from "../../utils.ts";
import {
  getFollowers,
  getFollowing,
  getFriends,
  getPostsByUser,
  getUser,
  getUserStats,
  isFollowing,
} from "../../lib/queries.ts";
import UserProfileIsland from "../../islands/UserProfileIsland.tsx";
import PostList from "../../islands/PostList.tsx";

const TABS = ["friends", "followers", "following"] as const;
type Tab = typeof TABS[number];

export const handler = define.handlers({
  GET(ctx) {
    const username = decodeURIComponent(ctx.params.username);
    const profile = getUser(username);
    if (!profile) throw new HttpError(404);

    const viewer = ctx.state.user?.username ?? null;
    const tab = ctx.url.searchParams.get("tab") as Tab | null;

    return page({
      profile,
      stats: getUserStats(username),
      followers: getFollowers(username),
      following: getFollowing(username),
      friends: getFriends(username),
      posts: getPostsByUser(username),
      viewerFollows: viewer ? isFollowing(viewer, username) : false,
      followsViewer: viewer ? isFollowing(username, viewer) : false,
      tab: tab && TABS.includes(tab) ? tab : null,
    });
  },
});

export default define.page<typeof handler>(
  function UserProfile({ data, state }) {
    return (
      <main class="max-w-4xl mx-auto p-4">
        <UserProfileIsland
          profile={data.profile}
          stats={data.stats}
          followers={data.followers}
          following={data.following}
          friends={data.friends}
          viewer={state.user}
          viewerFollows={data.viewerFollows}
          followsViewer={data.followsViewer}
          initialTab={data.tab}
        />
        <h2 class="text-2xl font-bold text-red-500 mb-6">
          Publicaciones de {data.profile.username}
        </h2>
        <PostList
          posts={data.posts}
          viewer={state.user}
          emptyText="Este usuario no ha publicado nada todavía."
        />
      </main>
    );
  },
);
