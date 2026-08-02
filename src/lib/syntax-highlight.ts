export type CodeLanguage =
  | "json"
  | "css"
  | "js"
  | "html"
  | "xml"
  | "sql"
  | "yaml"
  | "markdown"
  | "plain";

export type HighlightToken = {
  type:
    | "plain"
    | "key"
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "punctuation"
    | "comment"
    | "keyword"
    | "property"
    | "selector"
    | "tag"
    | "attr"
    | "operator";
  text: string;
};

const TOKEN_CLASS: Record<HighlightToken["type"], string> = {
  plain: "text-[#e6edf3]",
  key: "text-[#7ee787]",
  string: "text-[#a5d6ff]",
  number: "text-[#ffa657]",
  boolean: "text-[#ff7b72]",
  null: "text-[#ff7b72]",
  punctuation: "text-[#8b949e]",
  comment: "text-[#8b949e] italic",
  keyword: "text-[#ff7b72]",
  property: "text-[#79c0ff]",
  selector: "text-[#d2a8ff]",
  tag: "text-[#7ee787]",
  attr: "text-[#79c0ff]",
  operator: "text-[#ff7b72]",
};

export function tokenClassName(type: HighlightToken["type"]) {
  return TOKEN_CLASS[type];
}

export function inferLanguage(filename?: string, fallback: CodeLanguage = "plain"): CodeLanguage {
  if (!filename) return fallback;
  const name = filename.toLowerCase();
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".js") || name.endsWith(".jsx") || name.endsWith(".ts") || name.endsWith(".tsx")) return "js";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "html";
  if (name.endsWith(".xml") || name.endsWith(".svg")) return "xml";
  if (name.endsWith(".sql")) return "sql";
  if (name.endsWith(".yml") || name.endsWith(".yaml")) return "yaml";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";
  return fallback;
}

function push(tokens: HighlightToken[], type: HighlightToken["type"], text: string) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.type === type) last.text += text;
  else tokens.push({ type, text });
}

export function highlightCode(code: string, language: CodeLanguage): HighlightToken[] {
  if (!code) return [];
  switch (language) {
    case "json":
      return highlightJson(code);
    case "css":
      return highlightCss(code);
    case "js":
      return highlightJs(code);
    case "html":
    case "xml":
      return highlightMarkup(code);
    case "sql":
      return highlightSql(code);
    case "yaml":
      return highlightYaml(code);
    case "markdown":
      return highlightMarkdown(code);
    default:
      return [{ type: "plain", text: code }];
  }
}

function highlightJson(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const re =
    /("(?:\\.|[^"\\])*")\s*(:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|([{}[\]:,])|(\s+)|./g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[1] !== undefined) {
      push(tokens, m[2] ? "key" : "string", m[1]);
      if (m[2]) push(tokens, "punctuation", m[2]);
    } else if (m[3] !== undefined) push(tokens, "number", m[3]);
    else if (m[4] !== undefined) push(tokens, m[4] === "null" ? "null" : "boolean", m[4]);
    else if (m[5] !== undefined) push(tokens, "comment", m[5]);
    else if (m[6] !== undefined) push(tokens, "punctuation", m[6]);
    else if (m[7] !== undefined) push(tokens, "plain", m[7]);
    else push(tokens, "plain", m[0]);
  }
  return tokens;
}

function highlightCss(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const re =
    /(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|([.#]?[a-zA-Z_-][\w-]*)(?=\s*\{)|([a-zA-Z-]+)(?=\s*:)|(-?[\d.]+[a-z%]*)|([{}:;,()#]|!important)|(\s+)|./gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[1]) push(tokens, "comment", m[1]);
    else if (m[2]) push(tokens, "string", m[2]);
    else if (m[3]) push(tokens, "selector", m[3]);
    else if (m[4]) push(tokens, "property", m[4]);
    else if (m[5]) push(tokens, "number", m[5]);
    else if (m[6]) push(tokens, "punctuation", m[6]);
    else if (m[7]) push(tokens, "plain", m[7]);
    else push(tokens, "plain", m[0]);
  }
  return tokens;
}

const JS_KEYWORDS =
  /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|typeof|instanceof|class|extends|import|from|export|default|async|await|try|catch|finally|throw|of|in|this|super|null|undefined|true|false)\b/;

function highlightJs(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}()[\];,.:?=<>!&|+\-*/%])|(\s+)|([A-Za-z_$][\w$]*)|./g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[1]) push(tokens, "comment", m[1]);
    else if (m[2]) push(tokens, "string", m[2]);
    else if (m[3]) push(tokens, "number", m[3]);
    else if (m[4]) push(tokens, "punctuation", m[4]);
    else if (m[5]) push(tokens, "plain", m[5]);
    else if (m[6]) {
      if (JS_KEYWORDS.test(m[6])) push(tokens, m[6] === "true" || m[6] === "false" ? "boolean" : m[6] === "null" || m[6] === "undefined" ? "null" : "keyword", m[6]);
      else push(tokens, "plain", m[6]);
    } else push(tokens, "plain", m[0]);
  }
  return tokens;
}

function highlightMarkup(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const re =
    /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][\w:-]*)|(\s+[a-zA-Z_:][\w:.-]*)(=)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\/?>)|([^<]+)|./g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[1]) push(tokens, "comment", m[1]);
    else if (m[2]) push(tokens, "tag", m[2]);
    else if (m[3]) {
      push(tokens, "attr", m[3]);
      if (m[4]) push(tokens, "operator", m[4]);
    } else if (m[5]) push(tokens, "string", m[5]);
    else if (m[6]) push(tokens, "tag", m[6]);
    else if (m[7]) push(tokens, "plain", m[7]);
    else push(tokens, "plain", m[0]);
  }
  return tokens;
}

function highlightSql(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const re =
    /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:''|[^'])*')|(-?\d+(?:\.\d+)?)|(\b(?:SELECT|FROM|WHERE|AND|OR|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|AS|IN|NOT|NULL|TRUE|FALSE)\b)|([(),;=*<>])|(\s+)|./gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[1]) push(tokens, "comment", m[1]);
    else if (m[2]) push(tokens, "string", m[2]);
    else if (m[3]) push(tokens, "number", m[3]);
    else if (m[4]) push(tokens, "keyword", m[4].toUpperCase());
    else if (m[5]) push(tokens, "punctuation", m[5]);
    else if (m[6]) push(tokens, "plain", m[6]);
    else push(tokens, "plain", m[0]);
  }
  return tokens;
}

function highlightYaml(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const lines = code.split(/(\n)/);
  for (const line of lines) {
    if (line === "\n") {
      push(tokens, "plain", "\n");
      continue;
    }
    const comment = line.match(/^(\s*)(#.*)$/);
    if (comment) {
      push(tokens, "plain", comment[1]);
      push(tokens, "comment", comment[2]);
      continue;
    }
    const kv = line.match(/^(\s*)([^:#\n]+)(:)(\s*)(.*)$/);
    if (kv) {
      push(tokens, "plain", kv[1]);
      push(tokens, "key", kv[2]);
      push(tokens, "punctuation", kv[3]);
      push(tokens, "plain", kv[4]);
      const val = kv[5];
      if (/^(true|false|null)$/i.test(val)) push(tokens, "boolean", val);
      else if (/^-?\d+(\.\d+)?$/.test(val)) push(tokens, "number", val);
      else if (/^["'].*["']$/.test(val)) push(tokens, "string", val);
      else push(tokens, "string", val);
      continue;
    }
    push(tokens, "plain", line);
  }
  return tokens;
}

function highlightMarkdown(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const lines = code.split(/(\n)/);
  for (const line of lines) {
    if (line === "\n") {
      push(tokens, "plain", "\n");
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      push(tokens, "keyword", line);
      continue;
    }
    if (/^```/.test(line)) {
      push(tokens, "punctuation", line);
      continue;
    }
    if (/^>\s?/.test(line)) {
      push(tokens, "comment", line);
      continue;
    }
    if (/^[-*+]\s/.test(line) || /^\d+\.\s/.test(line)) {
      const m = line.match(/^([-*+]|\d+\.)(\s)(.*)$/);
      if (m) {
        push(tokens, "keyword", m[1]);
        push(tokens, "plain", m[2]);
        push(tokens, "plain", m[3]);
        continue;
      }
    }
    // inline code / bold light pass
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__)/g);
    for (const part of parts) {
      if (!part) continue;
      if (part.startsWith("`")) push(tokens, "string", part);
      else if (part.startsWith("**") || part.startsWith("__")) push(tokens, "keyword", part);
      else push(tokens, "plain", part);
    }
  }
  return tokens;
}
