import { page } from "fresh";
import { define } from "../utils.ts";
import { searchUsers } from "../lib/queries.ts";
import UserRow from "../components/UserRow.tsx";

export const handler = define.handlers({
  GET(ctx) {
    const q = (ctx.url.searchParams.get("q") ?? "").trim().slice(0, 50);
    return page({ q, results: q ? searchUsers(q, 30) : [] });
  },
});

export default define.page<typeof handler>(function Search({ data }) {
  return (
    <main class="max-w-2xl mx-auto p-4">
      <div class="bg-white/10 backdrop-blur-md rounded-lg p-6">
        <h1 class="text-2xl font-bold text-red-500 mb-4">Buscar usuarios</h1>
        <form method="get" class="mb-6">
          <input
            type="search"
            name="q"
            value={data.q}
            autofocus
            placeholder="Nombre de usuario..."
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </form>
        {data.q && data.results.length === 0 && (
          <p class="text-white/60 text-center py-4">
            No se encontró ningún usuario con «{data.q}»
          </p>
        )}
        <div class="space-y-1">
          {data.results.map((u) => <UserRow key={u.username} user={u} />)}
        </div>
      </div>
    </main>
  );
});
