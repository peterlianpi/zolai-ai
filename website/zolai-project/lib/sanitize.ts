import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "strong", "em", "u", "s", "blockquote", "code", "pre",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span", "section", "article", "header", "footer", "main", "nav",
  "figure", "figcaption",
  "details", "summary",
  "abbr", "cite", "q", "sub", "sup",
  "dl", "dt", "dd",
  // Callout/admonition support
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height", "loading"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"],
  div: ["data-callout", "data-type", "class"],
};

const ALLOWED_URL_PATTERNS = ["http", "https", "mailto", "tel", "data"];

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Used before rendering user-generated content with dangerouslySetInnerHTML.
 */
export function sanitizeContentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_URL_PATTERNS,
    selfClosing: ["img", "br", "hr"],
    disallowedTagsMode: "discard",
  });
}
