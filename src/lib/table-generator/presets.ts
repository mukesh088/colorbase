import type { TablePreset } from "./types";
import { createBlankDocument, createCell, createEmptyGrid } from "./types";

function fromMatrix(name: string, matrix: string[][], opts?: { headerBg?: string }): ReturnType<TablePreset["create"]> {
  const rows = matrix.length;
  const cols = Math.max(...matrix.map((r) => r.length));
  const grid = createEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c] = createCell(matrix[r][c] ?? "");
    }
  }
  const doc = createBlankDocument(rows, cols, name);
  doc.rows = grid;
  doc.colWidths = Array.from({ length: cols }, () => 150);
  doc.rowHeights = Array.from({ length: rows }, () => 42);
  if (opts?.headerBg) doc.style.headerBackground = opts.headerBg;
  return {
    name: doc.name,
    rows: doc.rows,
    colWidths: doc.colWidths,
    rowHeights: doc.rowHeights,
    hasHeader: true,
    freezeHeader: true,
    stickyFirstColumn: false,
    style: doc.style,
    favorite: false,
  };
}

export const TABLE_PRESETS: TablePreset[] = [
  {
    id: "pricing",
    name: "Pricing Table",
    description: "Plan comparison with features and prices",
    category: "Business",
    create: () =>
      fromMatrix("Pricing table", [
        ["Feature", "Starter", "Pro", "Business"],
        ["Price", "$0", "$19", "$49"],
        ["Projects", "1", "10", "Unlimited"],
        ["Storage", "1 GB", "50 GB", "500 GB"],
        ["Support", "Community", "Email", "Priority"],
        ["Analytics", "—", "Basic", "Advanced"],
      ], { headerBg: "#e11d48" }),
  },
  {
    id: "comparison",
    name: "Comparison Table",
    description: "Side-by-side product comparison",
    category: "Business",
    create: () =>
      fromMatrix("Comparison", [
        ["Criteria", "Option A", "Option B", "Option C"],
        ["Performance", "Good", "Better", "Best"],
        ["Price", "Low", "Medium", "High"],
        ["Ease of use", "★★★★", "★★★", "★★★★★"],
        ["Integrations", "5", "20", "100+"],
      ]),
  },
  {
    id: "timetable",
    name: "School Timetable",
    description: "Weekly class schedule",
    category: "Education",
    create: () =>
      fromMatrix("School timetable", [
        ["Time", "Mon", "Tue", "Wed", "Thu", "Fri"],
        ["09:00", "Math", "English", "Science", "Math", "History"],
        ["10:00", "English", "Math", "Art", "PE", "Science"],
        ["11:00", "Science", "History", "Math", "English", "Music"],
        ["13:00", "PE", "Science", "English", "Art", "Math"],
      ], { headerBg: "#2563eb" }),
  },
  {
    id: "weekly-planner",
    name: "Weekly Planner",
    description: "Plan tasks across the week",
    category: "Productivity",
    create: () =>
      fromMatrix("Weekly planner", [
        ["Day", "Morning", "Afternoon", "Evening"],
        ["Monday", "", "", ""],
        ["Tuesday", "", "", ""],
        ["Wednesday", "", "", ""],
        ["Thursday", "", "", ""],
        ["Friday", "", "", ""],
        ["Saturday", "", "", ""],
        ["Sunday", "", "", ""],
      ], { headerBg: "#0ea5e9" }),
  },
  {
    id: "monthly-calendar",
    name: "Monthly Calendar",
    description: "Simple month grid",
    category: "Productivity",
    create: () => {
      const header = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = Array.from({ length: 5 }, (_, w) =>
        Array.from({ length: 7 }, (_, d) => {
          const n = w * 7 + d - 1;
          return n >= 1 && n <= 30 ? String(n) : "";
        })
      );
      return fromMatrix("Monthly calendar", [header, ...days], { headerBg: "#7c3aed" });
    },
  },
  {
    id: "employee-schedule",
    name: "Employee Schedule",
    description: "Shifts by employee and day",
    category: "HR",
    create: () =>
      fromMatrix("Employee schedule", [
        ["Employee", "Mon", "Tue", "Wed", "Thu", "Fri"],
        ["Alex", "9–5", "9–5", "Off", "9–5", "9–5"],
        ["Jordan", "12–8", "12–8", "12–8", "Off", "12–8"],
        ["Sam", "Off", "9–5", "9–5", "9–5", "9–5"],
      ]),
  },
  {
    id: "invoice",
    name: "Invoice Table",
    description: "Line items for invoices",
    category: "Finance",
    create: () =>
      fromMatrix("Invoice", [
        ["Item", "Qty", "Unit price", "Total"],
        ["Design system audit", "1", "$800", "$800"],
        ["Component library", "1", "$1,200", "$1,200"],
        ["Documentation", "4", "$90", "$360"],
        ["", "", "Subtotal", "$2,360"],
      ], { headerBg: "#0f172a" }),
  },
  {
    id: "spec",
    name: "Product Specification",
    description: "Key/value product specs",
    category: "Product",
    create: () =>
      fromMatrix("Product specification", [
        ["Property", "Value"],
        ["Model", "CB-240"],
        ["Weight", "1.2 kg"],
        ["Dimensions", "220 × 140 × 18 mm"],
        ["Battery", "56 Wh"],
        ["Warranty", "2 years"],
      ]),
  },
  {
    id: "bank",
    name: "Bank Statement",
    description: "Transactions overview",
    category: "Finance",
    create: () =>
      fromMatrix("Bank statement", [
        ["Date", "Description", "Debit", "Credit", "Balance"],
        ["2026-07-01", "Opening balance", "", "", "$4,200.00"],
        ["2026-07-03", "Payroll", "", "$3,100.00", "$7,300.00"],
        ["2026-07-05", "Software", "$49.00", "", "$7,251.00"],
        ["2026-07-08", "Transfer", "$500.00", "", "$6,751.00"],
      ]),
  },
  {
    id: "attendance",
    name: "Attendance Sheet",
    description: "Mark present / absent",
    category: "Education",
    create: () =>
      fromMatrix("Attendance", [
        ["Name", "Mon", "Tue", "Wed", "Thu", "Fri"],
        ["Ava", "P", "P", "A", "P", "P"],
        ["Noah", "P", "P", "P", "P", "A"],
        ["Mia", "A", "P", "P", "P", "P"],
      ]),
  },
  {
    id: "exam",
    name: "Exam Marks",
    description: "Scores by subject",
    category: "Education",
    create: () =>
      fromMatrix("Exam marks", [
        ["Student", "Math", "Science", "English", "Total"],
        ["Ava", "88", "92", "85", "265"],
        ["Noah", "76", "81", "90", "247"],
        ["Mia", "94", "89", "91", "274"],
      ]),
  },
  {
    id: "fixtures",
    name: "Sports Fixtures",
    description: "Match schedule",
    category: "Sports",
    create: () =>
      fromMatrix("Sports fixtures", [
        ["Date", "Home", "Away", "Venue", "Time"],
        ["Aug 2", "Reds", "Blues", "Arena North", "18:00"],
        ["Aug 5", "Greens", "Golds", "City Stadium", "19:30"],
        ["Aug 9", "Blues", "Greens", "Harbor Park", "17:00"],
      ], { headerBg: "#16a34a" }),
  },
  {
    id: "palette",
    name: "Color Palette Table",
    description: "Name, hex, and usage tokens",
    category: "Design",
    create: () =>
      fromMatrix("Color palette", [
        ["Token", "Name", "HEX", "Usage"],
        ["--primary", "Rose", "#E11D48", "Buttons / links"],
        ["--accent", "Sky", "#0EA5E9", "Highlights"],
        ["--success", "Emerald", "#10B981", "Success states"],
        ["--warning", "Amber", "#F59E0B", "Warnings"],
        ["--surface", "Slate", "#F8FAFC", "Backgrounds"],
      ], { headerBg: "#e11d48" }),
  },
];

export function getPreset(id: string) {
  return TABLE_PRESETS.find((p) => p.id === id);
}
