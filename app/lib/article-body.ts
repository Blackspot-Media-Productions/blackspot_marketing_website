import sanitizeHtml from "sanitize-html";
import { slugify } from "./format";

const HTML_BLOCK = /<\/?(p|h2|h3|blockquote|ul|ol|li|strong|em|u|a)\b/i;

export function isHtmlBody(body: string) {
  return HTML_BLOCK.test(body);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function legacyBodyToHtml(body: string) {
  const html: string[] = [];
  let paragraph: string[] = [];

  function flushParagraph() {
    const text = paragraph.join("\n").trim();
    paragraph = [];
    if (text) html.push(`<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`);
  }

  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    if (line.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2>${escapeHtml(line.replace(/^##\s+/, "").trim())}</h2>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      html.push(`<blockquote><p>${escapeHtml(line.replace(/^>\s+/, "").trim())}</p></blockquote>`);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  return html.join("");
}

export function toEditorHtml(body: string) {
  const trimmed = body.trim();
  if (!trimmed) return "";
  return isHtmlBody(trimmed) ? trimmed : legacyBodyToHtml(trimmed);
}

export function withHeadingIds(html: string) {
  return html.replace(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level: string, attrs: string, inner: string) => {
    const id = slugify(stripTags(inner));
    const cleaned = attrs.replace(/\s*\bid\s*=\s*(["']).*?\1/i, "").replace(/\s*\bid\s*=\s*\S+/i, "");
    return `<h${level}${cleaned} id="${id}">${inner}</h${level}>`;
  });
}

export function prepareArticleHtml(body: string) {
  const html = toEditorHtml(body);
  if (!html) return "";
  const sanitized = sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "blockquote", "strong", "em", "u", "a", "ul", "ol", "li", "br", "hr"],
    allowedAttributes: {
      a: ["href", "rel", "target"],
      h2: ["id"],
      h3: ["id"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
  return withHeadingIds(sanitized);
}

export function articleHeadingsFromHtml(html: string) {
  return [...html.matchAll(/<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => ({
    id: match[1],
    label: stripTags(match[2]),
  }));
}

export function articleHeadings(body: string) {
  return articleHeadingsFromHtml(prepareArticleHtml(body));
}
