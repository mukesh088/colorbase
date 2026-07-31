import type { TableCell, TableDocument, TableStyle } from "./types";
import { createBlankDocument, createCell } from "./types";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Only allow safe link protocols in exported HTML. */
export function safeHref(href: string): string {
  const t = href.trim();
  if (/^(https?:\/\/|mailto:|#)/i.test(t)) return t;
  return "";
}

function neutralizeCsvValue(v: string) {
  // Prevent spreadsheet formula injection when exported CSV is opened in Excel.
  if (/^[=+\-@\t\r]/.test(v)) return `'${v}`;
  return v;
}

function cellInlineStyle(cell: TableCell, tableStyle: TableStyle): string {
  const s = cell.style;
  const parts: string[] = [];
  if (s.bold) parts.push("font-weight:700");
  if (s.italic) parts.push("font-style:italic");
  if (s.underline) parts.push("text-decoration:underline");
  if (s.strike) parts.push("text-decoration:line-through");
  if (s.fontSize) parts.push(`font-size:${s.fontSize}px`);
  if (s.fontFamily) parts.push(`font-family:${s.fontFamily}`);
  if (s.color) parts.push(`color:${s.color}`);
  if (s.background) parts.push(`background:${s.background}`);
  if (s.align) parts.push(`text-align:${s.align}`);
  if (s.verticalAlign) parts.push(`vertical-align:${s.verticalAlign}`);
  if (s.padding != null) parts.push(`padding:${s.padding}px`);
  else parts.push(`padding:${tableStyle.cellPadding}px`);
  if (s.wrap === false) parts.push("white-space:nowrap");
  if (s.rotation) parts.push(`transform:rotate(${s.rotation}deg)`);
  return parts.join(";");
}

function renderCellContent(cell: TableCell) {
  const text = escapeHtml(cell.value);
  const href = cell.style.href ? safeHref(cell.style.href) : "";
  if (href) {
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${text || escapeHtml(href)}</a>`;
  }
  return text;
}

export function buildTableCss(doc: TableDocument, className = "cb-table"): string {
  const st = doc.style;
  return `/* colorBase Table Generator */
.${className}-wrap {
  width: 100%;
  overflow-x: ${st.responsive ? "auto" : "visible"};
}
.${className} {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: ${st.fontFamily};
  font-size: ${st.fontSize}px;
  border: ${st.borderWidth}px solid ${st.borderColor};
  border-radius: ${st.rounded ? st.borderRadius : 0}px;
  overflow: hidden;
  ${st.shadow ? "box-shadow: 0 10px 30px -18px rgba(15, 23, 42, 0.35);" : ""}
  ${st.theme === "dark" ? "background:#0f172a;color:#e2e8f0;" : "background:#fff;color:#0f172a;"}
}
.${className} th,
.${className} td {
  border: ${st.borderWidth}px solid ${st.borderColor};
  padding: ${st.compact ? Math.max(4, st.cellPadding - 4) : st.cellPadding}px;
  text-align: left;
  ${st.animation ? "transition: background 160ms ease;" : ""}
}
.${className} thead th {
  background: ${st.headerBackground};
  color: ${st.headerColor};
  font-weight: 700;
}
.${className} tbody tr:nth-child(even) {
  background: ${st.striped || st.alternateRows ? (st.theme === "dark" ? "rgba(255,255,255,0.04)" : "#f8fafc") : "transparent"};
}
.${className} tbody tr:hover {
  background: ${st.hoverEffect ? (st.theme === "dark" ? "rgba(225,29,72,0.12)" : "#fff1f2") : "inherit"};
}`;
}

export function exportHtml(doc: TableDocument, withCss = true): string {
  const className = "cb-table";
  const st = doc.style;
  const bodyStart = doc.hasHeader ? 1 : 0;
  let html = "";
  if (withCss) html += `<style>\n${buildTableCss(doc, className)}\n</style>\n`;
  html += `<div class="${className}-wrap">\n<table class="${className}">\n`;
  if (doc.hasHeader && doc.rows[0]) {
    html += "  <thead>\n    <tr>\n";
    for (const cell of doc.rows[0]) {
      if (cell.hidden) continue;
      const cs = cell.colspan && cell.colspan > 1 ? ` colspan="${cell.colspan}"` : "";
      const rs = cell.rowspan && cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : "";
      html += `      <th${cs}${rs} style="${cellInlineStyle(cell, st)}">${renderCellContent(cell)}</th>\n`;
    }
    html += "    </tr>\n  </thead>\n";
  }
  html += "  <tbody>\n";
  for (let r = bodyStart; r < doc.rows.length; r++) {
    html += "    <tr>\n";
    for (const cell of doc.rows[r]) {
      if (cell.hidden) continue;
      const cs = cell.colspan && cell.colspan > 1 ? ` colspan="${cell.colspan}"` : "";
      const rs = cell.rowspan && cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : "";
      html += `      <td${cs}${rs} style="${cellInlineStyle(cell, st)}">${renderCellContent(cell)}</td>\n`;
    }
    html += "    </tr>\n";
  }
  html += "  </tbody>\n</table>\n</div>";
  return html;
}

export function exportMarkdown(doc: TableDocument): string {
  if (!doc.rows.length) return "";
  const rows = doc.rows.map((row) =>
    row.filter((c) => !c.hidden).map((c) => c.value.replace(/\|/g, "\\|").replace(/\n/g, " "))
  );
  const widths = rows[0].map((_, i) => Math.max(3, ...rows.map((r) => (r[i] ?? "").length)));
  const line = (cells: string[]) =>
    `| ${cells.map((c, i) => c.padEnd(widths[i], " ")).join(" | ")} |`;
  const sep = `| ${widths.map((w) => "-".repeat(w)).join(" | ")} |`;
  const out = [line(rows[0]), sep, ...rows.slice(1).map(line)];
  return out.join("\n");
}

export function exportCsv(doc: TableDocument, sep = ","): string {
  const escape = (v: string) => {
    const safe = neutralizeCsvValue(v);
    if (/[",\n\t]/.test(safe) || (sep !== "\t" && safe.includes(sep))) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };
  return doc.rows
    .map((row) => row.filter((c) => !c.hidden).map((c) => escape(c.value)).join(sep))
    .join("\n");
}

export function exportJson(doc: TableDocument): string {
  const headers = doc.hasHeader
    ? doc.rows[0]?.filter((c) => !c.hidden).map((c) => c.value || "column")
    : doc.rows[0]?.map((_, i) => `col_${i + 1}`) ?? [];
  const start = doc.hasHeader ? 1 : 0;
  const data = doc.rows.slice(start).map((row) => {
    const obj: Record<string, string> = {};
    row
      .filter((c) => !c.hidden)
      .forEach((cell, i) => {
        obj[headers[i] ?? `col_${i + 1}`] = cell.value;
      });
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

export function exportSql(doc: TableDocument, tableName = "generated_table"): string {
  const headers = (doc.hasHeader ? doc.rows[0] : doc.rows[0])
    ?.filter((c) => !c.hidden)
    .map((c, i) => {
      const raw = (doc.hasHeader ? c.value : `col_${i + 1}`) || `col_${i + 1}`;
      return raw.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || `col_${i + 1}`;
    }) ?? [];
  const start = doc.hasHeader ? 1 : 0;
  const esc = (v: string) => `'${v.replace(/'/g, "''")}'`;
  return doc.rows
    .slice(start)
    .map((row) => {
      const vals = row.filter((c) => !c.hidden).map((c) => esc(c.value));
      return `INSERT INTO ${tableName} (${headers.join(", ")}) VALUES (${vals.join(", ")});`;
    })
    .join("\n");
}

export function exportLatex(doc: TableDocument): string {
  const cols = doc.rows[0]?.filter((c) => !c.hidden).length ?? 0;
  const align = "l".repeat(Math.max(1, cols));
  const lines = doc.rows.map((row) =>
    row
      .filter((c) => !c.hidden)
      .map((c) => c.value.replace(/([&%$#_{}])/g, "\\$1").replace(/\n/g, " "))
      .join(" & ")
  );
  return [
    "\\begin{tabular}{" + align + "}",
    "\\hline",
    ...lines.flatMap((line, i) =>
      i === 0 && doc.hasHeader ? [line + " \\\\", "\\hline"] : [line + " \\\\"]
    ),
    "\\hline",
    "\\end{tabular}",
  ].join("\n");
}

export function exportMediaWiki(doc: TableDocument): string {
  const lines = ['{| class="wikitable"', "|-"];
  doc.rows.forEach((row, ri) => {
    const cells = row.filter((c) => !c.hidden);
    const prefix = doc.hasHeader && ri === 0 ? "!" : "|";
    lines.push(cells.map((c) => `${prefix} ${c.value}`).join(`\n${prefix} `));
    lines.push("|-");
  });
  lines.push("|}");
  return lines.join("\n");
}

export function exportBbcode(doc: TableDocument): string {
  const rows = doc.rows
    .map((row) => {
      const cells = row
        .filter((c) => !c.hidden)
        .map((c) => `[td]${c.value}[/td]`)
        .join("");
      return `[tr]${cells}[/tr]`;
    })
    .join("\n");
  return `[table]\n${rows}\n[/table]`;
}

export function exportAscii(doc: TableDocument): string {
  const grid = doc.rows.map((row) => row.filter((c) => !c.hidden).map((c) => c.value));
  if (!grid.length) return "";
  const widths = grid[0].map((_, i) => Math.max(1, ...grid.map((r) => (r[i] ?? "").length)));
  const bar = `+${widths.map((w) => "-".repeat(w + 2)).join("+")}+`;
  const line = (cells: string[]) =>
    `|${cells.map((c, i) => ` ${c.padEnd(widths[i], " ")} `).join("|")}|`;
  const out: string[] = [bar];
  grid.forEach((row, i) => {
    out.push(line(row));
    if (i === 0 && doc.hasHeader) out.push(bar);
  });
  out.push(bar);
  return out.join("\n");
}

export function exportRst(doc: TableDocument): string {
  return exportAscii(doc);
}

export function exportOrg(doc: TableDocument): string {
  return doc.rows
    .map((row, i) => {
      const cells = row.filter((c) => !c.hidden).map((c) => c.value);
      const line = `| ${cells.join(" | ")} |`;
      if (i === 0 && doc.hasHeader) {
        return `${line}\n|${cells.map(() => "---").join("+")}|`;
      }
      return line;
    })
    .join("\n");
}

export function exportAsciiDoc(doc: TableDocument): string {
  const cols = doc.rows[0]?.filter((c) => !c.hidden).length ?? 1;
  const lines = [`[cols="${cols}", options="header"]`, "|===", ...doc.rows.map((row) =>
    `| ${row.filter((c) => !c.hidden).map((c) => c.value).join(" | ")}`
  ), "|==="];
  return lines.join("\n");
}

export function exportExcelXml(doc: TableDocument): string {
  const rows = doc.rows
    .map((row) => {
      const cells = row
        .filter((c) => !c.hidden)
        .map((c) => `    <Cell><Data ss:Type="String">${escapeHtml(c.value)}</Data></Cell>`)
        .join("\n");
      return `   <Row>\n${cells}\n   </Row>`;
    })
    .join("\n");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${escapeHtml(doc.name)}">
  <Table>
${rows}
  </Table>
 </Worksheet>
</Workbook>`;
}

export function exportTailwind(doc: TableDocument): string {
  const header = doc.hasHeader
    ? `      <thead class="bg-rose-600 text-white">\n        <tr>\n${doc.rows[0]
        .filter((c) => !c.hidden)
        .map((c) => `          <th class="px-4 py-3 text-left text-sm font-semibold">${escapeHtml(c.value)}</th>`)
        .join("\n")}\n        </tr>\n      </thead>`
    : "";
  const start = doc.hasHeader ? 1 : 0;
  const body = doc.rows
    .slice(start)
    .map(
      (row, i) =>
        `        <tr class="${i % 2 ? "bg-slate-50" : "bg-white"} hover:bg-rose-50">\n${row
          .filter((c) => !c.hidden)
          .map((c) => `          <td class="px-4 py-3 text-sm text-slate-700">${escapeHtml(c.value)}</td>`)
          .join("\n")}\n        </tr>`
    )
    .join("\n");
  return `<div class="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
  <table class="min-w-full border-collapse">
${header}
    <tbody>
${body}
    </tbody>
  </table>
</div>`;
}

export function exportBootstrap(doc: TableDocument): string {
  return exportHtml(
    {
      ...doc,
      style: { ...doc.style, striped: true, hoverEffect: true, responsive: true },
    },
    false
  ).replace('class="cb-table"', 'class="table table-striped table-hover table-bordered"');
}

export function exportShadcn(doc: TableDocument): string {
  const headers = doc.rows[0]?.filter((c) => !c.hidden).map((c) => c.value) ?? [];
  const start = doc.hasHeader ? 1 : 0;
  const data = doc.rows.slice(start).map((row) => row.filter((c) => !c.hidden).map((c) => c.value));
  return `"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const headers = ${JSON.stringify(headers, null, 2)};
const rows = ${JSON.stringify(data, null, 2)};

export function GeneratedTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}`;
}

export function exportReact(doc: TableDocument): string {
  const headers = doc.rows[0]?.filter((c) => !c.hidden).map((c) => c.value) ?? [];
  const start = doc.hasHeader ? 1 : 0;
  const data = doc.rows.slice(start).map((row) => row.filter((c) => !c.hidden).map((c) => c.value));
  return `import React from "react";

const headers = ${JSON.stringify(headers, null, 2)} as const;
const rows = ${JSON.stringify(data, null, 2)} as const;

export function GeneratedTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #e2e8f0" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`;
}

export type Exporter = (doc: TableDocument) => string;

export const EXPORTERS: Record<string, Exporter> = {
  html: (d) => exportHtml(d, true),
  css: (d) => buildTableCss(d),
  markdown: exportMarkdown,
  latex: exportLatex,
  csv: (d) => exportCsv(d, ","),
  tsv: (d) => exportCsv(d, "\t"),
  json: exportJson,
  sql: exportSql,
  "excel-xml": exportExcelXml,
  mediawiki: exportMediaWiki,
  ascii: exportAscii,
  bbcode: exportBbcode,
  rst: exportRst,
  org: exportOrg,
  asciidoc: exportAsciiDoc,
  tailwind: exportTailwind,
  bootstrap: exportBootstrap,
  shadcn: exportShadcn,
  react: exportReact,
};

export const EXPORT_META: { id: keyof typeof EXPORTERS; label: string; ext: string; lang: string }[] = [
  { id: "html", label: "HTML", ext: "html", lang: "html" },
  { id: "css", label: "CSS", ext: "css", lang: "css" },
  { id: "markdown", label: "Markdown", ext: "md", lang: "markdown" },
  { id: "latex", label: "LaTeX", ext: "tex", lang: "latex" },
  { id: "csv", label: "CSV", ext: "csv", lang: "csv" },
  { id: "tsv", label: "TSV", ext: "tsv", lang: "tsv" },
  { id: "json", label: "JSON", ext: "json", lang: "json" },
  { id: "sql", label: "SQL INSERT", ext: "sql", lang: "sql" },
  { id: "excel-xml", label: "Excel XML", ext: "xml", lang: "xml" },
  { id: "mediawiki", label: "MediaWiki", ext: "txt", lang: "text" },
  { id: "ascii", label: "ASCII Table", ext: "txt", lang: "text" },
  { id: "bbcode", label: "BBCode", ext: "txt", lang: "text" },
  { id: "rst", label: "reStructuredText", ext: "rst", lang: "text" },
  { id: "org", label: "Org Mode", ext: "org", lang: "text" },
  { id: "asciidoc", label: "AsciiDoc", ext: "adoc", lang: "text" },
  { id: "tailwind", label: "Tailwind HTML", ext: "html", lang: "html" },
  { id: "bootstrap", label: "Bootstrap", ext: "html", lang: "html" },
  { id: "shadcn", label: "shadcn/ui", ext: "tsx", lang: "tsx" },
  { id: "react", label: "React Component", ext: "tsx", lang: "tsx" },
];

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { createBlankDocument, createCell };
