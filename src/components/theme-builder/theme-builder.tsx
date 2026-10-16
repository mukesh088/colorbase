"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Code2,
  Copy,
  Download,
  ImagePlus,
  LayoutDashboard,
  Link2,
  Loader2,
  Monitor,
  Moon,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemePreview } from "@/components/theme-builder/theme-preview";
import {
  buildThemeSystems,
  decodeThemeProject,
  downloadText,
  encodeThemeProject,
  newThemeProject,
  repairThemeText,
  THEME_PRESETS,
  THEME_TEMPLATES,
  themeTextPairs,
  type ThemeMode,
  type ThemeProject,
} from "@/lib/theme-builder";
import { exportTheme, THEME_EXPORTS, type ThemeExportFormat } from "@/lib/theme-exports";
import {
  deleteThemeProject,
  listThemeProjects,
  saveThemeProject,
  type StoredThemeProject,
} from "@/lib/palettes/db";
import { imageFilePalette } from "@/lib/colors/image-palette";
import { readHexColor } from "@/lib/colors/tool-links";
import { tokenMap, type ColorRole } from "@/lib/copilot/types";
import { getContrastRatio } from "@/lib/colors/convert";
import { cn } from "@/lib/utils";
import "./theme-builder.css";

type History = { past: ThemeProject[]; present: ThemeProject; future: ThemeProject[] };
type Action = { type: "set"; project: ThemeProject } | { type: "undo" | "redo" };
function historyReducer(state: History, action: Action): History {
  if (action.type === "set") {
    if (JSON.stringify(state.present) === JSON.stringify(action.project)) return state;
    return { past: [...state.past, state.present].slice(-40), present: action.project, future: [] };
  }
  if (action.type === "undo" && state.past.length)
    return {
      past: state.past.slice(0, -1),
      present: state.past[state.past.length - 1],
      future: [state.present, ...state.future],
    };
  if (action.type === "redo" && state.future.length)
    return {
      past: [...state.past, state.present],
      present: state.future[0],
      future: state.future.slice(1),
    };
  return state;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);
  useEffect(() => {
    setDraft(value);
    setError(false);
  }, [value]);
  const commit = () => {
    const valid = readHexColor(draft);
    if (valid) {
      onChange(valid);
      setDraft(valid);
      setError(false);
    } else setError(true);
  };
  return (
    <div className="tb-color-field">
      <label className="tb-color-label">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Pick ${label.toLowerCase()}`}
        />
        <span>{label}</span>
      </label>
      <input
        className="tb-hex"
        aria-label={`${label} HEX`}
        value={draft}
        spellCheck={false}
        maxLength={7}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraft(value);
            setError(false);
          }
        }}
        aria-invalid={error}
      />
      {error && (
        <span role="alert" className="tb-field-error">
          Use a 3 or 6 digit HEX color.
        </span>
      )}
    </div>
  );
}

export function ThemeBuilder() {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: newThemeProject(),
    future: [],
  });
  const project = history.present;
  const setProject = (value: ThemeProject) => dispatch({ type: "set", project: value });
  const [mode, setMode] = useState<ThemeMode | "split">("light");
  const [editMode, setEditMode] = useState<ThemeMode>("light");
  const [step, setStep] = useState("colors");
  const [view, setView] = useState<"preview" | "export">("preview");
  const [format, setFormat] = useState<ThemeExportFormat>("shadcn");
  const [projects, setProjects] = useState<StoredThemeProject[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageColors, setImageColors] = useState<string[]>([]);
  const [storageError, setStorageError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [target, setTarget] = useState<4.5 | 7>(4.5);
  const projectId = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const systems = useMemo(() => buildThemeSystems(project), [project]);
  const tokens = tokenMap(systems[editMode]);
  const code = useMemo(() => exportTheme(project, systems, format), [project, systems, format]);
  const snapshot = JSON.stringify(project);
  const saved = snapshot === savedSnapshot;

  useEffect(() => {
    const loadLocation = () => {
      const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("theme");
      if (fromHash) {
        const parsed = decodeThemeProject(fromHash);
        if (parsed) {
          dispatch({ type: "set", project: parsed });
          projectId.current = null;
          setSavedSnapshot("");
          setImageColors([]);
        } else toast.error("This theme link could not be opened.");
      } else {
        const params = new URLSearchParams(window.location.search);
        const colors = params
          .get("colors")
          ?.split("-")
          .map((color) => readHexColor(color));
        const primary = readHexColor(params.get("hex")) ?? colors?.[0];
        if (primary)
          dispatch({
            type: "set",
            project: {
              ...newThemeProject(),
              primary,
              secondary: colors?.[1] ?? newThemeProject().secondary,
              accent: colors?.[2] ?? newThemeProject().accent,
            },
          });
        if (params.get("source") === "image") fileInput.current?.focus();
      }
    };
    loadLocation();
    window.addEventListener("hashchange", loadLocation);
    listThemeProjects()
      .then(setProjects)
      .catch(() =>
        setStorageError(
          "Local saving is unavailable in this browser. You can still share or download your theme."
        )
      );
    return () => window.removeEventListener("hashchange", loadLocation);
  }, []);

  const updateRole = (role: ColorRole, hex: string) => {
    if (role === "primary" || role === "secondary" || role === "accent")
      setProject({ ...project, [role]: hex });
    else
      setProject({
        ...project,
        overrides: {
          ...project.overrides,
          [editMode]: { ...project.overrides[editMode], [role]: hex },
        },
      });
  };
  const save = async () => {
    setSaving(true);
    try {
      const id = projectId.current ?? crypto.randomUUID();
      const namedProject = { ...project, name: project.name.trim() || "Untitled theme" };
      if (namedProject.name !== project.name) setProject(namedProject);
      await saveThemeProject(id, namedProject);
      projectId.current = id;
      setSavedSnapshot(JSON.stringify(namedProject));
      setProjects(await listThemeProjects());
      setStorageError("");
      toast.success("Theme saved on this device");
    } catch {
      setStorageError("The theme could not be saved. Try a download or share link instead.");
      toast.error("Could not save theme");
    } finally {
      setSaving(false);
    }
  };
  const share = async () => {
    const url = `${window.location.origin}/theme-builder#theme=${encodeThemeProject(project)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Restorable theme link copied");
    } catch {
      setShareLink(url);
    }
  };
  const loadImage = async (file?: File) => {
    if (!file || imageBusy) return;
    setImageBusy(true);
    try {
      const colors = await imageFilePalette(file);
      setImageColors(colors);
      setProject({
        ...project,
        primary: colors[0],
        secondary: colors[1] ?? project.secondary,
        accent: colors[2] ?? project.accent,
      });
      toast.success("Image colors ready. Choose a swatch to change the brand accent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read this image");
    } finally {
      setImageBusy(false);
    }
  };
  const chooseStep = (value: string) => {
    setStep(value);
    if (value !== "colors") setView(value === "export" ? "export" : "preview");
  };
  const previewModes: ThemeMode[] = mode === "split" ? ["light", "dark"] : [mode];
  const pairs = previewModes.flatMap((theme) =>
    themeTextPairs(systems[theme]).map((pair) => ({
      ...pair,
      theme,
      ratio: getContrastRatio(pair.fg, pair.bg),
    }))
  );
  const passed = pairs.filter((pair) => pair.ratio >= target).length;

  return (
    <div
      className="theme-builder-page"
      onPaste={(event) => {
        const file = event.clipboardData.files[0];
        if (file) {
          event.preventDefault();
          void loadImage(file);
        }
      }}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) event.preventDefault();
      }}
      onDrop={(event) => {
        const file = event.dataTransfer.files[0];
        if (file) {
          event.preventDefault();
          void loadImage(file);
        }
      }}
    >
      <div className="tb-intro">
        <div>
          <p className="tb-kicker">
            <span /> THE COLORBASE STUDIO
          </p>
          <h1>Good color. Great interfaces.</h1>
          <p>Shape your palette into a complete theme. Preview it, refine it, make it yours.</p>
        </div>
        <Link href="/chart-palette-generator" className="tb-text-link">
          Designing with data? Try chart palettes <ArrowRight size={14} />
        </Link>
      </div>
      <section className="tb-workbench" aria-label="UI theme editor">
        <div className="tb-toolbar">
          <div className="tb-project-title">
            <span className="tb-project-icon">
              <Palette size={17} />
            </span>
            <Input
              aria-label="Theme name"
              value={project.name}
              maxLength={64}
              onChange={(event) => setProject({ ...project, name: event.target.value })}
            />
            <span className="tb-save-state">{saved ? "Saved on device" : "Unsaved changes"}</span>
          </div>
          <div className="tb-toolbar-actions">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Undo theme change"
              disabled={!history.past.length}
              onClick={() => dispatch({ type: "undo" })}
            >
              <Undo2 />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Redo theme change"
              disabled={!history.future.length}
              onClick={() => dispatch({ type: "redo" })}
            >
              <Redo2 />
            </Button>
            <span className="tb-toolbar-divider" />
            <Button variant="outline" size="sm" onClick={share}>
              <Link2 />
              <span>Share</span>
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : saved ? <Check /> : <Save />}
              <span>{saved ? "Saved" : "Save theme"}</span>
            </Button>
          </div>
        </div>
        {shareLink && (
          <div className="tb-share-fallback">
            <Input
              aria-label="Theme share link"
              readOnly
              value={shareLink}
              onFocus={(event) => event.target.select()}
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Close share link"
              onClick={() => setShareLink("")}
            >
              <X />
            </Button>
          </div>
        )}
        <div className="tb-mobile-steps" aria-label="Editor steps">
          {["colors", "preview", "export"].map((value, i) => (
            <button
              type="button"
              key={value}
              aria-pressed={step === value}
              onClick={() => chooseStep(value)}
            >
              <span>{i + 1}</span>
              {value}
            </button>
          ))}
        </div>
        <div className="tb-layout">
          <aside className={cn("tb-controls", step !== "colors" && "tb-mobile-hidden")}>
            <div className="tb-control-section">
              <div className="tb-section-title">
                <h2>Your palette</h2>
                <span>01</span>
              </div>
              <p className="tb-caption">Start with a direction. Refine every detail.</p>
              <div className="tb-presets">
                {THEME_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    aria-label={`${preset.name} preset`}
                    title={preset.name}
                    aria-pressed={
                      project.primary === preset.primary &&
                      project.secondary === preset.secondary &&
                      project.accent === preset.accent
                    }
                    onClick={() =>
                      setProject({
                        ...project,
                        primary: preset.primary,
                        secondary: preset.secondary,
                        accent: preset.accent,
                        overrides: { light: {}, dark: {} },
                      })
                    }
                  >
                    {[preset.primary, preset.secondary, preset.accent].map((color) => (
                      <span key={color} style={{ background: color }} />
                    ))}
                  </button>
                ))}
              </div>
              {(["primary", "secondary", "accent"] as const).map((role) => (
                <ColorField
                  key={role}
                  label={
                    role === "primary" ? "Brand" : role === "secondary" ? "Secondary" : "Accent"
                  }
                  value={project[role]}
                  onChange={(hex) => updateRole(role, hex)}
                />
              ))}
              <button
                type="button"
                className="tb-image-upload"
                disabled={imageBusy}
                onClick={() => fileInput.current?.click()}
              >
                {imageBusy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ImagePlus size={16} />
                )}{" "}
                {imageBusy ? "Reading image…" : "Extract from an image"}
                <span>↗</span>
              </button>
              <input
                ref={fileInput}
                type="file"
                className="sr-only"
                aria-label="Upload image for theme"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(event) => {
                  void loadImage(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <p className="tb-private-note">Processed in your browser. Your image stays here.</p>
              {imageColors.length > 0 && (
                <div className="tb-extracted" aria-label="Extracted image colors">
                  {imageColors.map((hex) => (
                    <button
                      key={hex}
                      style={{ background: hex }}
                      title={`Use ${hex} as brand color`}
                      aria-label={`Use ${hex} as brand color`}
                      onClick={() => updateRole("primary", hex)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="tb-control-section">
              <div className="tb-section-title">
                <h2>Interface colors</h2>
                <span>02</span>
              </div>
              <div className="tb-segmented tb-small" aria-label="Color editing mode">
                {(["light", "dark"] as const).map((value) => (
                  <button
                    key={value}
                    aria-pressed={editMode === value}
                    onClick={() => {
                      setEditMode(value);
                      if (mode !== "split") setMode(value);
                    }}
                  >
                    {value === "light" ? <Sun size={13} /> : <Moon size={13} />}
                    {value}
                  </button>
                ))}
              </div>
              {(["background", "surface", "text"] as const).map((role) => (
                <ColorField
                  key={role}
                  label={role === "background" ? "Canvas" : role === "surface" ? "Card" : "Text"}
                  value={tokens[role].hex}
                  onChange={(hex) => updateRole(role, hex)}
                />
              ))}
              <details className="tb-advanced">
                <summary>Advanced tokens</summary>
                {(["textMuted", "border", "primaryLight", "focus"] as const).map((role) => (
                  <ColorField
                    key={role}
                    label={
                      role === "textMuted"
                        ? "Muted text"
                        : role === "primaryLight"
                          ? "Soft brand"
                          : role === "focus"
                            ? "Focus ring"
                            : "Border"
                    }
                    value={tokens[role].hex}
                    onChange={(hex) => updateRole(role, hex)}
                  />
                ))}
              </details>
            </div>
            <div className="tb-control-section">
              <div className="tb-section-title">
                <h2>On this device</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="New theme project"
                  onClick={() => {
                    projectId.current = null;
                    setSavedSnapshot("");
                    setProject(newThemeProject());
                    setImageColors([]);
                  }}
                >
                  <Plus size={14} />
                </Button>
              </div>
              {storageError ? (
                <p role="status" className="tb-caption">
                  {storageError}
                </p>
              ) : projects.length ? (
                <div className="tb-saved-projects">
                  {projects.map((row) => (
                    <div key={row.id}>
                      <button
                        onClick={() => {
                          projectId.current = row.id;
                          setProject(row.project);
                          setSavedSnapshot(JSON.stringify(row.project));
                          setImageColors([]);
                        }}
                      >
                        <span style={{ background: row.project.primary }} />
                        {row.project.name}
                      </button>
                      <button
                        aria-label={`Delete ${row.project.name}`}
                        onClick={async () => {
                          try {
                            await deleteThemeProject(row.id);
                            setProjects(await listThemeProjects());
                            if (row.id === projectId.current) {
                              projectId.current = null;
                              setSavedSnapshot("");
                            }
                          } catch {
                            toast.error("Could not delete theme");
                          }
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="tb-caption">Save your first theme to pick up where you left off.</p>
              )}
            </div>
            <button className="tb-mobile-next" onClick={() => chooseStep("preview")}>
              Preview your theme <ArrowRight size={16} />
            </button>
          </aside>
          <div className={cn("tb-stage", step === "colors" && "tb-mobile-hidden")}>
            <div className="tb-stage-toolbar">
              <div className="tb-view-tabs">
                <button
                  aria-pressed={view === "preview"}
                  onClick={() => {
                    setView("preview");
                    setStep("preview");
                  }}
                >
                  <Monitor size={14} />
                  Preview
                </button>
                <button
                  aria-pressed={view === "export"}
                  onClick={() => {
                    setView("export");
                    setStep("export");
                  }}
                >
                  <Code2 size={14} />
                  Export code
                </button>
              </div>
              {view === "preview" && (
                <div className="tb-segmented tb-small" aria-label="Preview color mode">
                  {[
                    { id: "light", icon: Sun, label: "Light" },
                    { id: "dark", icon: Moon, label: "Dark" },
                    { id: "split", icon: Monitor, label: "Compare" },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      aria-label={`${label} preview`}
                      aria-pressed={mode === id}
                      onClick={() => setMode(id as typeof mode)}
                    >
                      <Icon size={13} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {view === "preview" ? (
              <>
                <div className="tb-template-bar">
                  <span className="tb-caption">
                    <LayoutDashboard size={14} /> SAMPLE INTERFACE
                  </span>
                  <div>
                    {THEME_TEMPLATES.map((template) => (
                      <button
                        key={template}
                        aria-pressed={project.template === template}
                        onClick={() => setProject({ ...project, template })}
                      >
                        {template === "landing" ? "Landing page" : template}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={cn("tb-preview-canvas", mode === "split" && "tb-preview-split")}>
                  {previewModes.map((value) => (
                    <div key={value} className="tb-preview-frame">
                      <div className="tb-browser-chrome">
                        <span />
                        <span />
                        <span />
                        <p>forma.design / {project.template}</p>
                        <span className="tb-mode-label">{value}</span>
                      </div>
                      <ThemePreview
                        system={systems[value]}
                        template={project.template}
                        compact={mode === "split"}
                      />
                    </div>
                  ))}
                </div>
                <div className="tb-preview-footnote">
                  <span>
                    <span className="tb-live-dot" />
                    Live preview · sample content
                  </span>
                  <span>Brand colors stay exactly as chosen.</span>
                </div>
              </>
            ) : (
              <div className="tb-export-panel">
                <div className="tb-export-heading">
                  <span className="tb-export-icon">
                    <Code2 size={22} />
                  </span>
                  <h2>From considered to coded.</h2>
                  <p>Both modes. Semantic tokens. Ready for your project.</p>
                </div>
                <label htmlFor="theme-export-format" className="tb-input-label">
                  Export format
                </label>
                <select
                  id="theme-export-format"
                  className="tb-select"
                  value={format}
                  onChange={(event) => setFormat(event.target.value as ThemeExportFormat)}
                >
                  {THEME_EXPORTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="tb-export-instructions">
                  {format === "shadcn"
                    ? "For shadcn/ui with Tailwind CSS v4. Merge the variables and @theme block into your global CSS, keeping your existing imports. Add .dark to your root element for dark mode."
                    : format === "tailwind"
                      ? "For Tailwind CSS v4. Merge into your global CSS. Use classes such as bg-primary, text-text, and bg-surface. Add .dark to the root element to change modes."
                      : format === "html"
                        ? "Download and open this self-contained HTML file. It includes a responsive sample and a working dark-mode toggle. No dependencies."
                        : format === "json"
                          ? "Named color tokens grouped by light and dark mode, using $type and $value fields. Import or adapt them for your design pipeline."
                          : "Paste these variables into your stylesheet. Use var(--background), var(--foreground), and var(--primary). Add .dark to your root element to switch modes."}
                </div>
                <div className="tb-code-toolbar">
                  <span>{THEME_EXPORTS.find((item) => item.id === format)?.filename}</span>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(code);
                          toast.success("Theme code copied");
                        } catch {
                          toast.error("Copy is unavailable. Download the file instead.");
                        }
                      }}
                    >
                      <Copy />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const item = THEME_EXPORTS.find((entry) => entry.id === format)!;
                        downloadText(
                          code,
                          item.filename,
                          format === "html"
                            ? "text/html;charset=utf-8"
                            : format === "json"
                              ? "application/json"
                              : "text/css;charset=utf-8"
                        );
                      }}
                    >
                      <Download />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="tb-code" tabIndex={0} aria-label="Exported theme code">
                  <code>{code}</code>
                </pre>
              </div>
            )}
            <div className="tb-contrast-panel">
              <div className="tb-contrast-heading">
                <div>
                  <span className="tb-kicker">
                    <ShieldCheck size={14} /> CONTRAST CHECK
                  </span>
                  <h2>
                    {passed} of {pairs.length} tested pairs pass {target === 7 ? "AAA" : "AA"}{" "}
                    normal text
                  </h2>
                </div>
                <div className="tb-contrast-actions">
                  <select
                    aria-label="Contrast target"
                    className="tb-select"
                    value={target}
                    onChange={(event) => setTarget(Number(event.target.value) as 4.5 | 7)}
                  >
                    <option value="4.5">AA · 4.5:1</option>
                    <option value="7">AAA · 7:1</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProject(repairThemeText(project, target));
                      toast.success("Text suggestions applied. Review the tested pairs below.");
                    }}
                  >
                    <CheckCheck />
                    Repair text
                  </Button>
                </div>
              </div>
              <div className="tb-pair-grid">
                {pairs.map((pair) => (
                  <div key={`${pair.theme}-${pair.label}`} className="tb-pair">
                    <span
                      className="tb-pair-sample"
                      style={{ color: pair.fg, background: pair.bg }}
                    >
                      Aa
                    </span>
                    <div>
                      <strong>{pair.label}</strong>
                      <span>
                        {pair.theme} · {pair.ratio.toFixed(2)}:1
                      </span>
                    </div>
                    <span className={pair.ratio >= target ? "tb-pass" : "tb-fail"}>
                      {pair.ratio >= target ? "Pass" : "Fail"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="tb-caption">
                Normal text: AA ≥ 4.5:1; AAA ≥ 7:1. Checks cover only these pairs. Repair preserves
                brand colors; incompatible surfaces or button labels may still fail.{" "}
                <Link href="/contrast-checker">Check another pair ↗</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="tb-how">
        <div>
          <span className="tb-kicker">A SMALLER GAP BETWEEN IDEA AND INTERFACE</span>
          <h2>One palette. Every part of your product.</h2>
        </div>
        <div>
          {[
            {
              icon: Palette,
              title: "Start with something yours",
              detail:
                "Choose a preset, type a brand HEX, or extract colors from a photo. Your exact brand colors carry through.",
            },
            {
              icon: Monitor,
              title: "See the whole picture",
              detail:
                "Try three real interface layouts. Refine light and dark surfaces and inspect specific text contrast pairs.",
            },
            {
              icon: Code2,
              title: "Take the useful parts",
              detail:
                "Export shadcn/ui, Tailwind v4, CSS, or JSON. Download a working HTML example to start building.",
            },
          ].map(({ icon: Icon, title, detail }) => (
            <article key={title}>
              <Icon size={20} />
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="tb-bottom-links">
        <Link href="/palette-generator">
          Explore palette generation <ArrowRight size={14} />
        </Link>
        <Link href="/ai-color-copilot">
          Need a starting direction? Open Color Copilot <ArrowRight size={14} />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setProject({ ...project, overrides: { light: {}, dark: {} } });
            toast.success("Interface overrides reset. Brand palette retained.");
          }}
        >
          <RotateCcw />
          Reset interface colors
        </Button>
      </div>
    </div>
  );
}
