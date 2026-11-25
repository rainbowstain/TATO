import { useEffect, useRef, useState } from "preact/hooks";
import type { SessionUser } from "../lib/types.ts";
import ProfileImage from "../components/ProfileImage.tsx";
import { api } from "../lib/fetcher.ts";

const editorStyles = `
.rich-editor {
  outline: none;
  min-height: 150px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;
  color: white;
  background-color: rgba(255, 255, 255, 0.05);
}
.rich-editor:empty::before {
  content: attr(data-placeholder);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.editor-toolbar .tb {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  color: white;
  font-size: 0.9rem;
}
.editor-toolbar .tb:hover { background-color: rgba(255, 255, 255, 0.15); }
.editor-toolbar .tb.active { background-color: rgba(255, 255, 255, 0.2); color: #f87171; }
.editor-toolbar .sep { width: 1px; height: 1.5rem; background: rgba(255,255,255,0.15); margin: 0 0.25rem; }
.editor-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  z-index: 30;
  padding: 0.75rem;
  background-color: rgba(30, 30, 30, 0.97);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.color-grid { display: grid; grid-template-columns: repeat(5, 1.75rem); gap: 0.4rem; }
.color-grid button {
  width: 1.75rem; height: 1.75rem; border-radius: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.color-grid button:hover { transform: scale(1.1); border-color: white; }
.font-option {
  display: block; width: 100%; text-align: left; white-space: nowrap;
  padding: 0.5rem 0.75rem; border-radius: 0.25rem; color: white;
}
.font-option:hover { background-color: rgba(255, 255, 255, 0.1); }
`;

const COLORS = [
  "#ff0000",
  "#ff5733",
  "#ff9900",
  "#ffcc00",
  "#ffff00",
  "#99cc00",
  "#33cc33",
  "#00cc99",
  "#00ccff",
  "#0099ff",
  "#0066ff",
  "#3333ff",
  "#6633ff",
  "#9933ff",
  "#cc33ff",
  "#ff33cc",
  "#ff3366",
  "#ffffff",
  "#cccccc",
  "#999999",
];

const FONTS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Tahoma",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
];

const STATE_COMMANDS = [
  "bold",
  "italic",
  "underline",
  "strikeThrough",
  "insertUnorderedList",
  "insertOrderedList",
];

export default function CreatePostForm({ user }: { user: SessionUser | null }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [hasText, setHasText] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<"color" | "font" | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded) editorRef.current?.focus();
  }, [expanded]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menu]);

  // Marcar botones activos según la selección actual
  useEffect(() => {
    if (!expanded) return;
    const update = () => {
      const el = editorRef.current;
      const sel = document.getSelection();
      if (!el || !sel || !el.contains(sel.anchorNode)) return;
      const next: Record<string, boolean> = {};
      for (const c of STATE_COMMANDS) next[c] = document.queryCommandState(c);
      setActive(next);
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, [expanded]);

  const syncText = () => {
    const el = editorRef.current;
    if (!el) return;
    // Si solo queda un <br> el navegador no vacía el div: lo vaciamos para el placeholder
    if (el.innerHTML === "<br>") el.innerHTML = "";
    setHasText((el.textContent ?? "").trim().length > 0);
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncText();
  };

  const addLink = () => {
    const url = prompt("Dirección del enlace (https://...)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      alert("El enlace debe empezar por http:// o https://");
      return;
    }
    exec("createLink", url);
  };

  const reset = () => {
    setExpanded(false);
    setTitle("");
    setHasText(false);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const submit = async (e: Event) => {
    e.preventDefault();
    const content = editorRef.current?.innerHTML ?? "";
    if (!title.trim() || !hasText || busy) return;
    setBusy(true);
    try {
      await api("/api/posts", "POST", { title, content });
      // Ir al feed de recientes para ver la publicación arriba del todo
      globalThis.location.href = "/?sort=new";
    } catch (err) {
      alert((err as Error).message);
      setBusy(false);
    }
  };

  // onMouseDown + preventDefault: evita que el botón robe el foco y se pierda la selección
  const tb = (
    label: string,
    title: string,
    onClick: () => void,
    command?: string,
    extraClass = "",
  ) => (
    <button
      type="button"
      title={title}
      class={`tb ${command && active[command] ? "active" : ""} ${extraClass}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );

  if (!user) {
    return (
      <a
        href="/login"
        class="block bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors border border-white/5 text-white/70"
      >
        <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
        Inicia sesión para compartir algo con la comunidad
      </a>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        class="w-full flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 text-left"
      >
        <ProfileImage src={user.profilePicture} username={user.username} />
        <span class="flex-1 p-3 bg-white/5 rounded-xl text-white/70 border border-white/5">
          <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
          ¿Qué tienes en mente, {user.username}?
        </span>
      </button>
    );
  }

  return (
    <div class="p-4 bg-white/10 backdrop-blur-md rounded-lg">
      <style>{editorStyles}</style>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-red-500">Crear publicación</h2>
        <div class="flex items-center gap-2">
          <ProfileImage
            src={user.profilePicture}
            username={user.username}
            size="xs"
          />
          <span class="text-sm text-white/70">{user.username}</span>
        </div>
      </div>

      <form onSubmit={submit} class="space-y-4">
        <input
          type="text"
          value={title}
          onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
          placeholder="Título"
          maxLength={150}
          required
          class="w-full p-3 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div class="rounded-lg overflow-visible border border-white/10">
          <div class="editor-toolbar rounded-t-lg">
            {tb(
              "B",
              "Negrita (Ctrl+B)",
              () => exec("bold"),
              "bold",
              "font-bold",
            )}
            {tb(
              "I",
              "Cursiva (Ctrl+I)",
              () => exec("italic"),
              "italic",
              "italic",
            )}
            {tb(
              "U",
              "Subrayado (Ctrl+U)",
              () => exec("underline"),
              "underline",
              "underline",
            )}
            {tb(
              "S",
              "Tachado",
              () => exec("strikeThrough"),
              "strikeThrough",
              "line-through",
            )}
            <span class="sep" />
            {tb("H", "Título grande", () => exec("formatBlock", "<h2>"))}
            {tb("¶", "Texto normal", () => exec("formatBlock", "<div>"))}
            {tb("“", "Cita", () => exec("formatBlock", "<blockquote>"))}
            {tb(
              "•",
              "Lista",
              () => exec("insertUnorderedList"),
              "insertUnorderedList",
            )}
            {tb(
              "1.",
              "Lista numerada",
              () => exec("insertOrderedList"),
              "insertOrderedList",
            )}
            <span class="sep" />

            <div class="relative">
              {tb(
                "A",
                "Color de texto",
                () => {
                  setTimeout(() => setMenu(menu === "color" ? null : "color"));
                },
                undefined,
                "text-red-400 font-bold",
              )}
              {menu === "color" && (
                <div
                  class="editor-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div class="color-grid">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        title={c}
                        style={{ backgroundColor: c }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          exec("foreColor", c);
                          setMenu(null);
                        }}
                      />
                    ))}
                  </div>
                  <label class="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-white/70">
                    <input
                      type="color"
                      class="w-10 h-6 bg-transparent cursor-pointer"
                      onChange={(e) => {
                        exec("foreColor", (e.target as HTMLInputElement).value);
                        setMenu(null);
                      }}
                    />
                    Color personalizado
                  </label>
                </div>
              )}
            </div>

            <div class="relative">
              {tb("Aa", "Tipografía", () => {
                setTimeout(() => setMenu(menu === "font" ? null : "font"));
              })}
              {menu === "font" && (
                <div
                  class="editor-menu max-h-64 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {FONTS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      class="font-option"
                      style={{ fontFamily: f }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        exec("fontName", f);
                        setMenu(null);
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span class="sep" />
            {tb("🔗", "Insertar enlace", addLink)}
            {tb("✕", "Quitar formato", () => exec("removeFormat"))}
          </div>

          <div
            ref={editorRef}
            class="rich-editor post-content rounded-b-lg"
            contentEditable
            data-placeholder="¿Qué quieres compartir?"
            onInput={syncText}
            onPaste={(e) => {
              // Pegar como texto plano para no arrastrar estilos raros de otras webs
              e.preventDefault();
              const text = e.clipboardData?.getData("text/plain") ?? "";
              document.execCommand("insertText", false, text);
            }}
          />
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            onClick={reset}
            class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy || !title.trim() || !hasText}
            class="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
