// Sanitizador de HTML por lista blanca para el contenido del editor enriquecido.
// Deja pasar solo las etiquetas/atributos que genera el editor y descarta todo
// lo demás (scripts, eventos onX, javascript: URLs, iframes, etc.).

const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "font",
  "span",
  "p",
  "div",
  "br",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
]);

const VOID_TAGS = new Set(["br"]);

// Etiquetas cuyo contenido también se descarta
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "template",
  "textarea",
  "svg",
  "math",
  "select",
  "title",
]);

const ALLOWED_STYLES = new Set([
  "color",
  "background-color",
  "font-family",
  "font-weight",
  "font-style",
  "text-align",
  "text-decoration",
]);

const SAFE_CSS_VALUE = /^[#\w\s,.'"%()-]+$/;
const SAFE_FONT = /^[\w\s,'"-]+$/;
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i;

function escapeText(s: string): string {
  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function cleanStyle(style: string): string {
  const out: string[] = [];
  for (const decl of style.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (!ALLOWED_STYLES.has(prop)) continue;
    if (!SAFE_CSS_VALUE.test(value)) continue;
    if (/url|expression|javascript|@import/i.test(value)) continue;
    out.push(`${prop}: ${value}`);
  }
  return out.join("; ");
}

function cleanAttrs(tag: string, raw: string): string {
  const attrRe =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  const out: string[] = [];
  for (const m of raw.matchAll(attrRe)) {
    const name = m[1].toLowerCase();
    const value = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (name === "style") {
      const style = cleanStyle(value);
      if (style) out.push(`style="${escapeAttr(style)}"`);
    } else if (tag === "font" && name === "color" && SAFE_COLOR.test(value)) {
      out.push(`color="${escapeAttr(value)}"`);
    } else if (tag === "font" && name === "face" && SAFE_FONT.test(value)) {
      out.push(`face="${escapeAttr(value)}"`);
    } else if (tag === "font" && name === "size" && /^[1-7]$/.test(value)) {
      out.push(`size="${value}"`);
    } else if (
      tag === "a" && name === "href" && /^(https?:|mailto:)/i.test(value)
    ) {
      out.push(`href="${escapeAttr(value)}"`);
    }
  }
  if (tag === "a") {
    out.push('target="_blank" rel="noopener noreferrer nofollow"');
  }
  return out.length ? " " + out.join(" ") : "";
}

export function sanitizeHtml(input: string): string {
  // Quitar comentarios HTML
  const html = input.replace(/<!--[\s\S]*?-->/g, "");
  const tokenRe = /<\/?[a-zA-Z][^>]*>/g;
  const out: string[] = [];
  const stack: string[] = [];
  let dropDepth = 0;
  let last = 0;

  const pushText = (text: string) => {
    if (dropDepth === 0 && text) out.push(escapeText(text));
  };

  for (const m of html.matchAll(tokenRe)) {
    pushText(html.slice(last, m.index));
    last = m.index! + m[0].length;

    const tagMatch = /^<(\/)?\s*([a-zA-Z0-9]+)([\s\S]*?)\/?>$/.exec(m[0]);
    if (!tagMatch) continue;
    const closing = !!tagMatch[1];
    const tag = tagMatch[2].toLowerCase();
    const attrs = tagMatch[3] ?? "";

    if (DROP_WITH_CONTENT.has(tag)) {
      if (closing) dropDepth = Math.max(0, dropDepth - 1);
      else dropDepth++;
      continue;
    }
    if (dropDepth > 0 || !ALLOWED_TAGS.has(tag)) continue;

    if (VOID_TAGS.has(tag)) {
      if (!closing) out.push(`<${tag}>`);
      continue;
    }

    if (!closing) {
      out.push(`<${tag}${cleanAttrs(tag, attrs)}>`);
      stack.push(tag);
    } else {
      const idx = stack.lastIndexOf(tag);
      if (idx === -1) continue; // cierre sin apertura: se ignora
      // Cerrar también las etiquetas abiertas dentro
      while (stack.length > idx) out.push(`</${stack.pop()}>`);
    }
  }
  pushText(html.slice(last));
  while (stack.length) out.push(`</${stack.pop()}>`);
  return out.join("");
}

/** Texto plano de un HTML (para validar que el post no esté vacío). */
export function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " "))
    .trim();
}
