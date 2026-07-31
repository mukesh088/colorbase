export const TABLE_GENERATOR_FAQS = [
  {
    question: "What export formats does the Table Generator support?",
    answer:
      "You can export HTML, CSS, Markdown, LaTeX, CSV, TSV, JSON, SQL INSERT, Excel XML, MediaWiki, ASCII, BBCode, reStructuredText, Org Mode, AsciiDoc, Tailwind, Bootstrap, shadcn/ui, and React components.",
  },
  {
    question: "Can I import existing data?",
    answer:
      "Yes. Paste or upload CSV, TSV, JSON, Markdown tables, or HTML tables. The importer detects delimiters and auto-formats the grid. For Excel workbooks, save as CSV first.",
  },
  {
    question: "Does it save my work?",
    answer:
      "Tables autosave to local storage in your browser, including recent files and favorites. You can also share a URL snapshot of the current table.",
  },
  {
    question: "Is the editor keyboard accessible?",
    answer:
      "Yes. Use arrow keys to navigate, Enter/F2 to edit, Shift+arrows to multi-select, and Ctrl/Cmd+C/X/V/Z for clipboard and undo. Ctrl/Cmd+K opens the command palette.",
  },
];

export function tableGeneratorHowToJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to create a table with the Universal Table Generator",
    description:
      "Create, style, and export HTML, Markdown, LaTeX, CSV and more tables visually.",
    step: [
      {
        "@type": "HowToStep",
        name: "Create or import a table",
        text: "Click Create Table or import CSV, Excel, Markdown, JSON, or HTML.",
      },
      {
        "@type": "HowToStep",
        name: "Edit cells visually",
        text: "Type into the spreadsheet grid, merge cells, style text, and apply table themes.",
      },
      {
        "@type": "HowToStep",
        name: "Export your format",
        text: "Choose HTML, Markdown, LaTeX, SQL, React, Tailwind, or another format and copy or download.",
      },
    ],
  };
}
