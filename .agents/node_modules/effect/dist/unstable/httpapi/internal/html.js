const ESCAPE_SCRIPT_END = /<\/script>/gi;
const ESCAPE_LINE_TERMS = /[\u2028\u2029]/g;
/** @internal */
export function escapeJson(spec) {
  return JSON.stringify(spec).replace(ESCAPE_SCRIPT_END, "<\\/script>").replace(ESCAPE_LINE_TERMS, c => c === "\u2028" ? "\\u2028" : "\\u2029");
}
/** @internal */
export function escape(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
//# sourceMappingURL=html.js.map