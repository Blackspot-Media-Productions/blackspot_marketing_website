import sanitizeHtml from "sanitize-html";

export function plainTextToHtml(value: string) {
  if (!value.trim()) return "";
  const escaped = value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replaceAll("\n", "<br>") || "<br>"}</p>`)
    .join("");
}

export function normalizeRichText(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value) ? value : plainTextToHtml(value);
}

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ["p", "div", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h1", "h2", "h3", "span"],
    allowedAttributes: {
      "*": ["style"],
      span: ["class", "data-variable"],
    },
    allowedClasses: { span: ["offer-variable"] },
    allowedStyles: {
      "*": { "text-align": [/^left$/, /^center$/, /^right$/] },
    },
  });
}
