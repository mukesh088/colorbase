/** Client-safe XML format / minify / validate helpers (DOMParser). */

export type XmlFormatResult = {
  output: string;
  error: string | null;
  meta: null | {
    elements: number;
    attributes: number;
    size: number;
    root: string | null;
  };
};

function countNodes(node: Node): { elements: number; attributes: number } {
  let elements = 0;
  let attributes = 0;
  const walk = (n: Node) => {
    if (n.nodeType === Node.ELEMENT_NODE) {
      elements += 1;
      attributes += (n as Element).attributes.length;
    }
    n.childNodes.forEach(walk);
  };
  walk(node);
  return { elements, attributes };
}

export function parseXml(input: string): { doc: Document; error: string | null } {
  if (typeof DOMParser === "undefined") {
    return {
      doc: null as unknown as Document,
      error: "XML formatting requires a browser environment.",
    };
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "application/xml");
  const errNode = doc.querySelector("parsererror");
  if (errNode) {
    const text = (errNode.textContent || "Invalid XML").replace(/\s+/g, " ").trim();
    return { doc, error: text.slice(0, 280) };
  }
  return { doc, error: null };
}

function isIgnorableText(node: Node) {
  return node.nodeType === Node.TEXT_NODE && !/\S/.test(node.textContent || "");
}

function serializeNode(node: Node, indentSize: number, depth: number): string {
  const pad = " ".repeat(indentSize * depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    return text ? `${pad}${escapeXmlText(text)}\n` : "";
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.textContent || ""}]]>\n`;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent || ""}-->\n`;
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction;
    return `${pad}<?${pi.target} ${pi.data}?>\n`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const attrs = Array.from(el.attributes)
    .map((a) => ` ${a.name}="${escapeXmlAttr(a.value)}"`)
    .join("");

  const children = Array.from(el.childNodes).filter((c) => !isIgnorableText(c));
  const onlyText =
    children.length === 1 && children[0].nodeType === Node.TEXT_NODE
      ? (children[0].textContent || "").replace(/\s+/g, " ").trim()
      : null;

  if (children.length === 0) {
    return `${pad}<${el.tagName}${attrs} />\n`;
  }

  if (onlyText !== null && onlyText.length < 80 && !onlyText.includes("<")) {
    return `${pad}<${el.tagName}${attrs}>${escapeXmlText(onlyText)}</${el.tagName}>\n`;
  }

  let out = `${pad}<${el.tagName}${attrs}>\n`;
  for (const child of children) {
    out += serializeNode(child, indentSize, depth + 1);
  }
  out += `${pad}</${el.tagName}>\n`;
  return out;
}

function escapeXmlText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXmlAttr(value: string) {
  return escapeXmlText(value).replace(/"/g, "&quot;");
}

export function minifyXml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatXml(input: string, indentSize: number, mode: "formatted" | "minified"): XmlFormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: "", error: null, meta: null };
  }

  const { doc, error } = parseXml(trimmed);
  if (error) {
    return { output: "", error, meta: null };
  }

  const root = doc.documentElement;
  if (!root) {
    return { output: "", error: "No root element found.", meta: null };
  }

  const declaration = trimmed.startsWith("<?xml")
    ? trimmed.match(/^<\?xml[^?]*\?>/i)?.[0] ?? null
    : null;

  let body: string;
  if (mode === "minified") {
    if (typeof XMLSerializer === "undefined") {
      return { output: "", error: "XML formatting requires a browser environment.", meta: null };
    }
    const xml = new XMLSerializer().serializeToString(root);
    body = minifyXml(xml);
  } else {
    body = serializeNode(root, indentSize, 0).replace(/\n$/, "");
  }

  const output = declaration ? `${declaration}\n${body}` : body;
  const counts = countNodes(root);
  const size =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(output).length
      : output.length;

  return {
    output,
    error: null,
    meta: {
      elements: counts.elements,
      attributes: counts.attributes,
      size,
      root: root.tagName,
    },
  };
}
