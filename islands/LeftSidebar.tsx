import { useRef, useEffect } from "preact/hooks";

interface LeftSidebarProps {
  currentSort: string;
}

export default function LeftSidebar({ currentSort }: LeftSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // @ts-ignore - GSAP se carga desde CDN
    const gsap = globalThis.gsap;
    
    if (gsap && sidebarRef.current) {
      // Animación principal del sidebar
      gsap.fromTo(sidebarRef.current, 
        { opacity: 0, x: -20 }, 
        { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }
      );
      
      // Animación del logo
      if (logoRef.current) {
        gsap.fromTo(logoRef.current, 
          { opacity: 0, scale: 0.9, y: -10 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: 0.3, ease: "back.out" }
        );
      }
      
      // Animación de los enlaces
      if (navRef.current) {
        const links = navRef.current.querySelectorAll('a');
        gsap.fromTo(links, 
          { opacity: 0, x: -10 }, 
          { 
            opacity: 1, 
            x: 0, 
            stagger: 0.1, 
            duration: 0.4, 
            delay: 0.5, 
            ease: "power1.out" 
          }
        );
      }
    }
  }, []);
  
  return (
    <div ref={sidebarRef} class="w-full md:w-64 space-y-6 md:sticky md:top-20 self-start">
      {/* Logo y nombre con animación */}
      <div ref={logoRef} class="flex items-center space-x-3 mb-6 scale-hover">
        <div class="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg shadow-red-500/30 transform transition-all duration-300 hover:rotate-6">
          <span class="text-3xl">T</span>
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
          Tato
        </h1>
      </div>

      {/* Filtros y ordenamiento con animación */}
      <div ref={navRef} class="bg-black/30 backdrop-blur-sm rounded-lg p-5 shadow-lg shadow-black/20 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-red-500/15 to-transparent opacity-60"></div>
        <div class="relative z-10">
          <h2 class="text-xl font-bold text-red-400 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Explorar
          </h2>
          <div class="flex flex-col space-y-3">
            <a 
              href="/?sort=new" 
              class={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                currentSort === "new" 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 font-medium" 
                  : "bg-white/10 text-white hover:bg-white/20 hover:shadow-lg hover:shadow-white/5 hover:scale-105"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Recientes
            </a>
            <a 
              href="/?sort=hot" 
              class={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                currentSort === "hot" 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 font-medium" 
                  : "bg-white/10 text-white hover:bg-white/20 hover:shadow-lg hover:shadow-white/5 hover:scale-105"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
              Destacados
            </a>
            <a 
              href="/?sort=popular" 
              class={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                currentSort === "popular" 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 font-medium" 
                  : "bg-white/10 text-white hover:bg-white/20 hover:shadow-lg hover:shadow-white/5 hover:scale-105"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-6"></path></svg>
              Populares
            </a>
            <a 
              href="/?sort=friends" 
              class={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                currentSort === "friends" 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 font-medium" 
                  : "bg-white/10 text-white hover:bg-white/20 hover:shadow-lg hover:shadow-white/5 hover:scale-105"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Amigos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
