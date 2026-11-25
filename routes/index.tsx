import { page } from "fresh";
import { define } from "../utils.ts";
import {
  type FeedSort,
  getFeed,
  getFriends,
  getSuggestions,
  getUserStats,
} from "../lib/queries.ts";
import CreatePostForm from "../islands/CreatePostForm.tsx";
import LeftSidebar from "../islands/LeftSidebar.tsx";
import PostList from "../islands/PostList.tsx";
import ProfileSidebar from "../components/ProfileSidebar.tsx";

const SORTS: FeedSort[] = ["new", "hot", "popular", "friends"];

export const handler = define.handlers({
  GET(ctx) {
    const param = ctx.url.searchParams.get("sort") as FeedSort | null;
    const sort: FeedSort = param && SORTS.includes(param) ? param : "new";
    const user = ctx.state.user;

    let posts = getFeed(sort, user?.username ?? null);
    let notice: string | null = null;

    if (sort === "friends") {
      if (!user) {
        notice =
          "Inicia sesión para ver las publicaciones de tus amigos. Mientras, aquí tienes las destacadas.";
        posts = getFeed("hot", null);
      } else if (posts.length === 0) {
        notice =
          "Tus amigos no han publicado nada todavía... mostrando publicaciones destacadas";
        posts = getFeed("hot", null);
      } else if (posts.length <= 2) {
        notice =
          "Tus amigos publican poco... completando con publicaciones destacadas";
        const ids = new Set(posts.map((p) => p.id));
        posts = [
          ...posts,
          ...getFeed("hot", null).filter((p) => !ids.has(p.id)),
        ];
      }
    }

    return page({
      sort,
      posts,
      notice,
      stats: user ? getUserStats(user.username) : null,
      friends: user ? getFriends(user.username) : [],
      suggestions: user ? getSuggestions(user.username) : [],
    });
  },
});

export default define.page<typeof handler>(function Home({ data, state }) {
  return (
    <main class="max-w-6xl mx-auto p-4">
      <div class="flex flex-col md:flex-row gap-6">
        <LeftSidebar currentSort={data.sort} />

        <div class="flex-1 min-w-0 space-y-6">
          <CreatePostForm user={state.user} />
          {/* key: fuerza a recrear la lista al cambiar de filtro */}
          <PostList
            key={data.sort}
            posts={data.posts}
            viewer={state.user}
            notice={data.notice}
          />
        </div>

        <aside class="w-full md:w-72 hidden md:block md:sticky md:top-20 self-start">
          <ProfileSidebar
            user={state.user}
            stats={data.stats}
            friends={data.friends}
            suggestions={data.suggestions}
          />
        </aside>
      </div>
    </main>
  );
});
