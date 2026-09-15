function sanitize(raw: string) {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*("|')\s*javascript:[^"']*\1/gi, 'href="#"')
    .replace(/xlink:href\s*=\s*("|')\s*javascript:[^"']*\1/gi, 'xlink:href="#"');
}

export type SvgPluginId =
  | "removeDoctype"
  | "removeXMLProcInst"
  | "removeComments"
  | "removeMetadata"
  | "removeEditorsNSData"
  | "cleanupAttrs"
  | "cleanupIDs"
  | "removeRasterImages"
  | "removeUselessDefs"
  | "cleanupNumericValues"
  | "convertColors"
  | "removeUnknownsAndDefaults"
  | "removeHiddenElems"
  | "removeEmptyText"
  | "collapseGroups"
  | "convertPathData"
  | "removeEmptyAttrs"
  | "removeEmptyContainers"
  | "sortAttrs"
  | "removeTitle"
  | "removeDesc"
  | "removeViewBox"
  | "preferViewBox"
  | "removeXmlns"
  | "removeScript";

export type SvgPlugin = {
  id: SvgPluginId;
  label: string;
  group: "Cleanup" | "Elements" | "Geometry" | "Safety";
  defaultOn: boolean;
};

export const SVG_PLUGINS: SvgPlugin[] = [
  { id: "removeDoctype", label: "Remove doctype", group: "Cleanup", defaultOn: true },
  { id: "removeXMLProcInst", label: "Remove XML instructions", group: "Cleanup", defaultOn: true },
  { id: "removeComments", label: "Remove comments", group: "Cleanup", defaultOn: true },
  { id: "removeMetadata", label: "Remove <metadata>", group: "Cleanup", defaultOn: true },
  { id: "removeEditorsNSData", label: "Remove editor data", group: "Cleanup", defaultOn: true },
  { id: "cleanupAttrs", label: "Clean up attribute whitespace", group: "Cleanup", defaultOn: true },
  { id: "cleanupNumericValues", label: "Round / rewrite numbers", group: "Cleanup", defaultOn: true },
  { id: "convertColors", label: "Minify colors", group: "Cleanup", defaultOn: true },
  { id: "cleanupIDs", label: "Shorten IDs", group: "Cleanup", defaultOn: true },
  { id: "sortAttrs", label: "Sort attributes", group: "Cleanup", defaultOn: false },
  { id: "removeEmptyAttrs", label: "Remove empty attributes", group: "Cleanup", defaultOn: true },
  { id: "removeTitle", label: "Remove <title>", group: "Elements", defaultOn: false },
  { id: "removeDesc", label: "Remove <desc>", group: "Elements", defaultOn: false },
  { id: "removeUselessDefs", label: "Remove unused defs", group: "Elements", defaultOn: true },
  { id: "removeRasterImages", label: "Remove raster images", group: "Elements", defaultOn: false },
  { id: "removeHiddenElems", label: "Remove hidden elements", group: "Elements", defaultOn: true },
  { id: "removeEmptyText", label: "Remove empty text", group: "Elements", defaultOn: true },
  { id: "removeEmptyContainers", label: "Remove empty containers", group: "Elements", defaultOn: true },
  { id: "collapseGroups", label: "Collapse useless groups", group: "Elements", defaultOn: true },
  { id: "removeViewBox", label: "Remove viewBox", group: "Elements", defaultOn: false },
  { id: "preferViewBox", label: "Prefer viewBox to width/height", group: "Elements", defaultOn: true },
  { id: "removeXmlns", label: "Remove xmlns", group: "Elements", defaultOn: false },
  { id: "convertPathData", label: "Round path data", group: "Geometry", defaultOn: true },
  { id: "removeUnknownsAndDefaults", label: "Remove default attributes", group: "Geometry", defaultOn: true },
  { id: "removeScript", label: "Remove scripts & javascript URLs", group: "Safety", defaultOn: true },
];

export const SVG_PLUGIN_GROUPS = ["Cleanup", "Elements", "Geometry", "Safety"] as const;

export function defaultSvgPlugins(): Record<SvgPluginId, boolean> {
  return Object.fromEntries(SVG_PLUGINS.map((p) => [p.id, p.defaultOn])) as Record<SvgPluginId, boolean>;
}

export type SvgOptimizeSettings = {
  plugins: Record<SvgPluginId, boolean>;
  floatPrecision: number;
  multipass: boolean;
  pretty: boolean;
};

export type SvgOptimizeResult = {
  data: string;
  error?: string;
};

const NUMERIC_ATTRS = new Set([
  "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
  "width", "height", "stroke-width", "stroke-miterlimit", "stroke-dashoffset",
  "opacity", "fill-opacity", "stroke-opacity", "font-size", "letter-spacing",
  "word-spacing", "dx", "dy", "fx", "fy", "offset", "startOffset",
]);

const DEFAULT_ATTRS: Record<string, string> = {
  fill: "#000000",
  "fill-opacity": "1",
  "stroke-opacity": "1",
  opacity: "1",
  "stroke-width": "1",
  "stroke-linecap": "butt",
  "stroke-linejoin": "miter",
  "stroke-miterlimit": "4",
};

export function optimizeSvg(raw: string, settings: SvgOptimizeSettings): SvgOptimizeResult {
  let source = raw.trim();
  if (!source) return { data: "", error: "Paste or open an SVG first." };
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return { data: source };
  }

  const on = settings.plugins;
  if (on.removeXMLProcInst) source = source.replace(/<\?xml[\s\S]*?\?>/gi, "");
  if (on.removeDoctype) source = source.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  if (on.removeComments) source = source.replace(/<!--[\s\S]*?-->/g, "");
  if (on.removeScript) source = sanitize(source);

  const parser = new DOMParser();
  const doc = parser.parseFromString(source, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    return { data: raw, error: "Could not parse SVG. Check that the markup is valid." };
  }

  const passes = settings.multipass ? 3 : 1;
  for (let i = 0; i < passes; i++) {
    applyDomPlugins(doc, settings);
  }

  let out = new XMLSerializer().serializeToString(doc.documentElement);
  out = out.replace(/\sxmlns=""/g, "");
  if (settings.pretty) out = prettySvg(out);
  else out = out.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();

  return { data: out };
}

function applyDomPlugins(doc: Document, settings: SvgOptimizeSettings) {
  const on = settings.plugins;
  const svg = doc.documentElement;
  if (!svg) return;

  if (on.removeMetadata) removeTags(svg, ["metadata", "sodipodi:namedview"]);
  if (on.removeTitle) removeTags(svg, ["title"]);
  if (on.removeDesc) removeTags(svg, ["desc"]);
  if (on.removeRasterImages) removeTags(svg, ["image"]);
  if (on.removeEditorsNSData) stripEditorData(svg);
  if (on.removeHiddenElems) removeHidden(svg);
  if (on.removeEmptyText) removeEmptyText(svg);
  if (on.removeUselessDefs) removeUnusedDefs(svg);
  if (on.cleanupIDs) shortenIds(svg);
  if (on.removeViewBox) svg.removeAttribute("viewBox");
  if (on.preferViewBox && svg.getAttribute("viewBox")) {
    svg.removeAttribute("width");
    svg.removeAttribute("height");
  }
  if (on.removeXmlns) {
    svg.removeAttribute("xmlns");
    svg.removeAttribute("xmlns:xlink");
  }
  if (on.removeUnknownsAndDefaults) stripDefaults(svg);
  if (on.removeEmptyAttrs) stripEmptyAttrs(svg);
  if (on.cleanupAttrs) trimAttrs(svg);
  if (on.convertColors) minifyColors(svg);
  if (on.cleanupNumericValues || on.convertPathData) roundNumbers(svg, settings.floatPrecision, on.convertPathData);
  if (on.collapseGroups) collapseGroups(svg);
  if (on.removeEmptyContainers) removeEmptyContainers(svg);
  if (on.sortAttrs) sortAttrs(svg);
}

function walk(root: Element, fn: (el: Element) => void) {
  fn(root);
  [...root.querySelectorAll("*")].forEach(fn);
}

function removeTags(root: Element, names: string[]) {
  names.forEach((name) => {
    root.querySelectorAll(name).forEach((el) => el.remove());
  });
}

function stripEditorData(root: Element) {
  const prefixes = ["inkscape:", "sodipodi:", "sketch:", "xmlns:inkscape", "xmlns:sodipodi", "xmlns:sketch"];
  walk(root, (el) => {
    [...el.attributes].forEach((attr) => {
      if (prefixes.some((p) => attr.name.startsWith(p) || attr.name === p)) {
        el.removeAttribute(attr.name);
      }
    });
  });
}

function removeHidden(root: Element) {
  [...root.querySelectorAll("*")].reverse().forEach((el) => {
    const display = el.getAttribute("display");
    const vis = el.getAttribute("visibility");
    const opacity = el.getAttribute("opacity");
    const w = el.getAttribute("width");
    const h = el.getAttribute("height");
    if (
      display === "none" ||
      vis === "hidden" ||
      vis === "collapse" ||
      opacity === "0" ||
      w === "0" ||
      h === "0"
    ) {
      el.remove();
    }
  });
}

function removeEmptyText(root: Element) {
  root.querySelectorAll("text, tspan, textPath").forEach((el) => {
    if (!el.textContent?.trim() && el.childElementCount === 0) el.remove();
  });
}

function usedIds(root: Element) {
  const used = new Set<string>();
  const markup = root.outerHTML;
  for (const match of markup.matchAll(/url\(#([^)]+)\)/g)) used.add(match[1]);
  for (const match of markup.matchAll(/(?:href|xlink:href)="#([^"]+)"/g)) used.add(match[1]);
  return used;
}

function removeUnusedDefs(root: Element) {
  const used = usedIds(root);
  root.querySelectorAll("defs > *").forEach((el) => {
    const id = el.getAttribute("id");
    if (id && !used.has(id)) el.remove();
  });
  root.querySelectorAll("defs").forEach((defs) => {
    if (!defs.childElementCount) defs.remove();
  });
}

function shortenIds(root: Element) {
  const used = usedIds(root);
  const map = new Map<string, string>();
  let n = 0;
  const nextId = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let x = n++;
    let out = "";
    do {
      out = alphabet[x % 26] + out;
      x = Math.floor(x / 26) - 1;
    } while (x >= 0);
    return out;
  };

  walk(root, (el) => {
    const id = el.getAttribute("id");
    if (!id) return;
    if (!used.has(id)) {
      el.removeAttribute("id");
      return;
    }
    if (!map.has(id)) map.set(id, nextId());
    el.setAttribute("id", map.get(id)!);
  });

  const replaceRefs = (value: string) => {
    let next = value;
    map.forEach((short, old) => {
      next = next.replaceAll(`url(#${old})`, `url(#${short})`);
      next = next.replaceAll(`#${old}`, `#${short}`);
    });
    return next;
  };

  walk(root, (el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.value.includes("#")) el.setAttribute(attr.name, replaceRefs(attr.value));
    });
  });
}

function stripDefaults(root: Element) {
  walk(root, (el) => {
    Object.entries(DEFAULT_ATTRS).forEach(([name, value]) => {
      const current = el.getAttribute(name);
      if (!current) return;
      if (normalizeColor(current) === normalizeColor(value) || current === value) {
        el.removeAttribute(name);
      }
    });
  });
}

function stripEmptyAttrs(root: Element) {
  walk(root, (el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.value.trim() === "") el.removeAttribute(attr.name);
    });
  });
}

function trimAttrs(root: Element) {
  walk(root, (el) => {
    [...el.attributes].forEach((attr) => {
      const trimmed = attr.value.replace(/\s+/g, " ").trim();
      if (trimmed !== attr.value) el.setAttribute(attr.name, trimmed);
    });
  });
}

function normalizeColor(input: string) {
  const v = input.trim().toLowerCase();
  const rgb = v.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgb) {
    const hex = [rgb[1], rgb[2], rgb[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("");
    return shortenHex(`#${hex}`);
  }
  if (/^#[0-9a-f]{3,8}$/.test(v)) return shortenHex(v);
  return v;
}

function shortenHex(hex: string) {
  const h = hex.toLowerCase();
  if (h.length === 7 && h[1] === h[2] && h[3] === h[4] && h[5] === h[6]) {
    return `#${h[1]}${h[3]}${h[5]}`;
  }
  return h;
}

function minifyColors(root: Element) {
  walk(root, (el) => {
    ["fill", "stroke", "stop-color", "color", "flood-color", "lighting-color"].forEach((name) => {
      const value = el.getAttribute(name);
      if (!value || value === "none" || value.startsWith("url(")) return;
      el.setAttribute(name, normalizeColor(value));
    });
    const style = el.getAttribute("style");
    if (style) {
      el.setAttribute(
        "style",
        style.replace(/#([0-9a-fA-F]{6})\b/g, (_, hex) => shortenHex(`#${hex}`))
      );
    }
  });
}

function roundNum(value: string, precision: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  const rounded = Number(n.toFixed(precision));
  return String(rounded);
}

function roundNumbers(root: Element, precision: number, paths: boolean) {
  walk(root, (el) => {
    [...el.attributes].forEach((attr) => {
      let value = attr.value.replace(/(-?\d*\.?\d+)(px|pt)\b/gi, "$1");
      if (NUMERIC_ATTRS.has(attr.name) || (paths && (attr.name === "d" || attr.name === "points" || attr.name === "transform"))) {
        value = value.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (num) => roundNum(num, precision));
      }
      if (value !== attr.value) el.setAttribute(attr.name, value);
    });
  });
}

function collapseGroups(root: Element) {
  let changed = true;
  while (changed) {
    changed = false;
    [...root.querySelectorAll("g")].reverse().forEach((g) => {
      if (g.attributes.length === 0 && g.childElementCount === 1 && g.parentElement) {
        g.replaceWith(g.firstElementChild!);
        changed = true;
      }
    });
  }
}

function removeEmptyContainers(root: Element) {
  [...root.querySelectorAll("g, defs, symbol, clipPath, mask")].reverse().forEach((el) => {
    if (el.childElementCount === 0 && !el.textContent?.trim()) el.remove();
  });
}

function sortAttrs(root: Element) {
  walk(root, (el) => {
    const attrs = [...el.attributes].sort((a, b) => a.name.localeCompare(b.name));
    attrs.forEach((attr) => el.removeAttribute(attr.name));
    attrs.forEach((attr) => el.setAttribute(attr.name, attr.value));
  });
}

function prettySvg(markup: string) {
  const compact = markup.replace(/>\s+</g, "><");
  let indent = 0;
  return compact.replace(/(<\/?[^>]+>)/g, (tag) => {
    const closing = /^<\//.test(tag);
    const self = /\/>$/.test(tag) || /^<(path|circle|rect|line|ellipse|polygon|polyline|stop|image|use)\b/i.test(tag);
    if (closing) indent = Math.max(0, indent - 1);
    const line = `${"  ".repeat(indent)}${tag}`;
    if (!closing && !self) indent += 1;
    return `${line}\n`;
  }).trim();
}

export function svgByteSize(text: string) {
  return new Blob([text]).size;
}

export async function gzipSize(text: string) {
  if (typeof CompressionStream === "undefined") return svgByteSize(text);
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const blob = await new Response(stream).blob();
  return blob.size;
}

export const DEMO_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="240px" height="240px" viewBox="0.00 0.00 240.00 240.00">
  <metadata>Created in a vector editor</metadata>
  <title>colorBase mark</title>
  <desc>Demo SVG with extra markup for optimization</desc>
  <!-- unused comment -->
  <defs>
    <linearGradient id="unusedGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" />
    </linearGradient>
    <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgb(225, 29, 72)" />
      <stop offset="100.00%" stop-color="#DB2777" />
    </linearGradient>
  </defs>
  <g>
    <g>
      <rect x="20.0000" y="20.0000" width="200.000" height="200.00" rx="42.000" fill="url(#brandGlow)" />
      <circle cx="120.000" cy="116.000" r="44.0000" fill="#FFFFFF" opacity="1" />
      <path d="M 102.250 132.500 L 112.000 142.250 L 140.500 104.000" fill="none" stroke="#e11d48" stroke-width="10.000" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>
</svg>
`;
