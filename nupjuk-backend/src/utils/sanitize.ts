import sanitizeHtml from "sanitize-html";

// Markdown 렌더링 결과를 서버에서 검증할 때 사용.
// 저장 전 원본 Markdown 텍스트의 HTML 인젝션을 차단.
const ALLOWED_TAGS = [
  "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target"],
};

export function sanitizeMarkdown(raw: string): string {
  return sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    // href는 http/https/mailto만 허용 (javascript: 차단)
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function sanitizeText(raw: string): string {
  return sanitizeHtml(raw, { allowedTags: [], allowedAttributes: {} });
}
