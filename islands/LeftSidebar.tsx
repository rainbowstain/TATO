import { useEffect, useRef } from "preact/hooks";

const LINKS = [
  {
    sort: "new",
    label: "Recientes",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
  {
    sort: "hot",
    label: "Destacados",
    icon: (
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    ),
  },
  {
    sort: "popular",
    label: "Populares hoy",
    icon: (
      <>
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-6" />
      </>
    ),
  },
  {
    sort: "friends",
    label: "Amigos",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
];

export default function LeftSidebar({ currentSort }: { currentSort: string }) {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // deno-lint-ignore no-explicit-any
    const gsap = (globalThis as any).gsap;
    if (gsap && navRef.current) {
      gsap.fromTo(
        navRef.current.querySelectorAll("a"),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.4, ease: "power1.out" },
      );
    }
  }, []);

  return (
    <div class="w-full md:w-56 md:sticky md:top-20 self-start">
      <div
        ref={navRef}
        class="bg-black/30 backdrop-blur-sm rounded-lg p-4 shadow-lg relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-red-500/15 to-transparent opacity-60 pointer-events-none" />
        <div class="relative">
          <h2 class="text-lg font-bold text-red-400 mb-4">Explorar</h2>
          <div class="flex md:flex-col gap-2 overflow-x-auto">
            {LINKS.map((l) => (
              <a
                key={l.sort}
                href={`/?sort=${l.sort}`}
                class={`px-4 py-2.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                  currentSort === l.sort
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 font-medium"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  {l.icon}
                </svg>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
