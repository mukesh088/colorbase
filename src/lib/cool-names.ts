/** Stylish nickname / cool username transforms inspired by nickfinder-style generators. */

const SCRIPT: Record<string, string> = {
  a: "𝓪", b: "𝓫", c: "𝓬", d: "𝓭", e: "𝓮", f: "𝓯", g: "𝓰", h: "𝓱", i: "𝓲", j: "𝓳",
  k: "𝓴", l: "𝓵", m: "𝓶", n: "𝓷", o: "𝓸", p: "𝓹", q: "𝓺", r: "𝓻", s: "𝓼", t: "𝓽",
  u: "𝓾", v: "𝓿", w: "𝔀", x: "𝔁", y: "𝔂", z: "𝔃",
};

const BOLD_SCRIPT: Record<string, string> = {
  a: "𝒶", b: "𝒷", c: "𝒸", d: "𝒹", e: "𝑒", f: "𝒻", g: "𝑔", h: "𝒽", i: "𝒾", j: "𝒿",
  k: "𝓀", l: "𝓁", m: "𝓂", n: "𝓃", o: "𝑜", p: "𝓅", q: "𝓆", r: "𝓇", s: "𝓈", t: "𝓉",
  u: "𝓊", v: "𝓋", w: "𝓌", x: "𝓍", y: "𝓎", z: "𝓏",
};

const SMALL_CAPS: Record<string, string> = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ғ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ",
  k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ",
  u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ",
};

const SUPERSCRIPT: Record<string, string> = {
  a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ",
  k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ", q: "q", r: "ʳ", s: "ˢ", t: "ᵗ",
  u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
};

const FRAKTUR: Record<string, string> = {
  a: "𝖆", b: "𝖇", c: "𝖈", d: "𝖉", e: "𝖊", f: "𝖋", g: "𝖌", h: "𝖍", i: "𝖎", j: "𝖏",
  k: "𝖐", l: "𝖑", m: "𝖒", n: "𝖓", o: "𝖔", p: "𝖕", q: "𝖖", r: "𝖗", s: "𝖘", t: "𝖙",
  u: "𝖚", v: "𝖛", w: "𝖜", x: "𝖝", y: "𝖞", z: "𝖟",
};

const DOUBLE_STRUCK: Record<string, string> = {
  a: "𝕒", b: "𝕓", c: "𝕔", d: "𝕕", e: "𝕖", f: "𝕗", g: "𝕘", h: "𝕙", i: "𝕚", j: "𝕛",
  k: "𝕜", l: "𝕝", m: "𝕞", n: "𝕟", o: "𝕠", p: "𝕡", q: "𝕢", r: "𝕣", s: "𝕤", t: "𝕥",
  u: "𝕦", v: "𝕧", w: "𝕨", x: "𝕩", y: "𝕪", z: "𝕫",
};

const BUBBLE: Record<string, string> = {
  a: "ⓐ", b: "ⓑ", c: "ⓒ", d: "ⓓ", e: "ⓔ", f: "ⓕ", g: "ⓖ", h: "ⓗ", i: "ⓘ", j: "ⓙ",
  k: "ⓚ", l: "ⓛ", m: "ⓜ", n: "ⓝ", o: "ⓞ", p: "ⓟ", q: "ⓠ", r: "ⓡ", s: "ⓢ", t: "ⓣ",
  u: "ⓤ", v: "ⓥ", w: "ⓦ", x: "ⓧ", y: "ⓨ", z: "ⓩ",
};

const SQUARED: Record<string, string> = {
  a: "🅐", b: "🅑", c: "🅒", d: "🅓", e: "🅔", f: "🅕", g: "🅖", h: "🅗", i: "🅘", j: "🅙",
  k: "🅚", l: "🅛", m: "🅜", n: "🅝", o: "🅞", p: "🅟", q: "🅠", r: "🅡", s: "🅢", t: "🅣",
  u: "🅤", v: "🅥", w: "🅦", x: "🅧", y: "🅨", z: "🅩",
};

const LEET: Record<string, string> = {
  a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", b: "8", g: "9",
};

const ADJECTIVES = [
  "Dark", "Silent", "Crazy", "Lucky", "Shadow", "Neon", "Wild", "Frozen", "Golden", "Mystic",
  "Rapid", "Cyber", "Royal", "Broken", "Epic", "Ghost", "Storm", "Blaze", "Night", "Pixel",
  "Cosmic", "Iron", "Silent", "Hyper", "Ultra", "Prime", "Swift", "Toxic", "Viper", "Nova",
];

const NOUNS = [
  "Wolf", "King", "Queen", "Ninja", "Gamer", "Tiger", "Fox", "Hawk", "Dragon", "Phoenix",
  "Legend", "Hunter", "Rider", "Blade", "Storm", "Soul", "Ghost", "Ace", "Viper", "Rebel",
  "Knight", "Shadow", "Spark", "Flame", "Wave", "Star", "Bolt", "Fang", "Raven", "Sniper",
];

const SUFFIXES = ["ツ", "࿐", "♡", "✨", "🔥", "⚡", "√", "乂", "モ", "ッ", "★", "☆", "✦"];
const PREFIXES = ["×͜×", "『", "꧁", "༄", "✿", "✧", "♛", "♔", "『sᴛʀᴋ』", "ᴹᴿ"];

export type CoolNameCategory = "all" | "stylish" | "gamer" | "aesthetic" | "minimal" | "symbols";

export type CoolNameVariant = {
  id: string;
  label: string;
  value: string;
  category: Exclude<CoolNameCategory, "all">;
};

function mapChars(text: string, table: Record<string, string>, keepCase = false) {
  return [...text]
    .map((ch) => {
      const lower = ch.toLowerCase();
      const mapped = table[lower];
      if (!mapped) return ch;
      if (keepCase && ch === ch.toUpperCase() && /[A-Z]/.test(ch)) return mapped;
      return mapped;
    })
    .join("");
}

function mapFancy(s: string, upper: number, lower: number) {
  return s.replace(/[a-z]/gi, (ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(upper + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(lower + (code - 97));
    return ch;
  });
}

function fullwidth(s: string) {
  return [...s]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code === 32) return "\u3000";
      if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xfee0);
      return ch;
    })
    .join("");
}

function spaced(s: string) {
  return s.trim().split(/\s+/).join(" ").split("").join(" ").replace(/\s+/g, " ").trim();
}

function dotted(s: string) {
  return [...s.replace(/\s+/g, "")].join("·");
}

function barred(s: string) {
  return [...s.replace(/\s+/g, "").toUpperCase()].map((c) => `░${c}`).join("") + "░";
}

function cleanBase(input: string) {
  return input.trim().replace(/\s+/g, " ").slice(0, 32);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!;
}

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generate stylish nickname variants from a base name/keyword. */
export function generateCoolNames(raw: string, seed = 0): CoolNameVariant[] {
  const base = cleanBase(raw);
  if (!base) return [];

  const lower = base.toLowerCase();
  const noSpace = base.replace(/\s+/g, "");
  const title = base.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const small = mapChars(noSpace, SMALL_CAPS);
  const script = mapChars(noSpace, SCRIPT);
  const boldScript = mapChars(noSpace, BOLD_SCRIPT);
  const superScript = mapChars(noSpace, SUPERSCRIPT);
  const fraktur = mapChars(noSpace, FRAKTUR);
  const doubleStruck = mapChars(noSpace, DOUBLE_STRUCK);
  const bubble = mapChars(noSpace.toLowerCase(), BUBBLE);
  const squared = mapChars(noSpace.toLowerCase(), SQUARED);
  const bold = mapFancy(noSpace, 0x1d5d4, 0x1d5ee);
  const mono = mapFancy(noSpace, 0x1d670, 0x1d68a);
  const italic = mapFancy(noSpace, 0x1d434, 0x1d44e);
  const fw = fullwidth(noSpace);
  const leet = [...lower.replace(/\s+/g, "")]
    .map((c) => LEET[c] ?? c)
    .join("");
  const adj = pick(ADJECTIVES, seed + hashSeed(base));
  const noun = pick(NOUNS, seed + hashSeed(base) + 7);
  const suffix = pick(SUFFIXES, seed + 3);
  const prefix = pick(PREFIXES, seed + 11);

  const variants: CoolNameVariant[] = [
    { id: "frame-ornate", label: "Ornate frame", value: `꧁༺${title}༻꧂`, category: "stylish" },
    { id: "frame-star", label: "Star frame", value: `꧁☆☬${small}☬☆꧂`, category: "stylish" },
    { id: "frame-quote", label: "Bracket quote", value: `『${small}』`, category: "stylish" },
    { id: "frame-flower", label: "Flower wrap", value: `༄ᶦᶰᵈ᭄✿${small}࿐`, category: "aesthetic" },
    { id: "frame-heart", label: "Heart wrap", value: `♡${script}♡`, category: "aesthetic" },
    { id: "frame-crown", label: "Crown", value: `♔〘${title}〙♔`, category: "stylish" },
    { id: "frame-dark", label: "Dark frame", value: `꧁༒☬${fraktur}☬༒꧂`, category: "gamer" },
    { id: "frame-slash", label: "Slash boy", value: `×͜×ㅤ${mono}ㅤ`, category: "gamer" },
    { id: "script", label: "Script", value: script, category: "aesthetic" },
    { id: "bold-script", label: "Soft script", value: boldScript, category: "aesthetic" },
    { id: "broken-heart", label: "Broken heart", value: `${boldScript}♡`, category: "aesthetic" },
    { id: "small-caps", label: "Small caps", value: small, category: "minimal" },
    { id: "super-tag", label: "Super tag", value: `${small}${superScript.slice(0, 3) || "ˣ"}`, category: "gamer" },
    { id: "mr-prefix", label: "MR prefix", value: `ᴹᴿメ${spaced(title)}`, category: "gamer" },
    { id: "ff-suffix", label: "FF suffix", value: `${small} ᶠᶠ`, category: "gamer" },
    { id: "jp-suffix", label: "JP flair", value: `${small}${suffix}`, category: "symbols" },
    { id: "prefix-random", label: "Tagged", value: `${prefix}${small}`, category: "symbols" },
    { id: "fraktur", label: "Gothic", value: fraktur, category: "stylish" },
    { id: "double", label: "Double struck", value: doubleStruck, category: "minimal" },
    { id: "bubble", label: "Bubble", value: bubble, category: "symbols" },
    { id: "squared", label: "Squared", value: squared, category: "symbols" },
    { id: "bold", label: "Bold unicode", value: bold, category: "minimal" },
    { id: "mono", label: "Mono", value: mono, category: "minimal" },
    { id: "italic", label: "Italic", value: italic, category: "minimal" },
    { id: "fullwidth", label: "Fullwidth", value: fw, category: "stylish" },
    { id: "spaced", label: "Spaced", value: spaced(title.toUpperCase()), category: "minimal" },
    { id: "dotted", label: "Dotted", value: dotted(title), category: "minimal" },
    { id: "barred", label: "Neon bars", value: barred(noSpace), category: "gamer" },
    { id: "leet", label: "Leet", value: leet, category: "gamer" },
    { id: "combo", label: "Combo name", value: `${adj}${noun}`, category: "gamer" },
    { id: "combo-style", label: "Styled combo", value: `꧁༺${adj}${noun}༻꧂`, category: "stylish" },
    { id: "sunflower", label: "Emoji wrap", value: `🌻${fw}🌻`, category: "aesthetic" },
    { id: "queen", label: "Queen vibe", value: `✿ • ${spaced(title.toUpperCase())}✿ᴳᴵᴿᴸ࿐`, category: "aesthetic" },
    { id: "alone", label: "Alone boy", value: `×͜×ㅤ${mono}ㅤ`, category: "gamer" },
    { id: "don", label: "Don frame", value: `꧁ঔৣ☬✞${fraktur}✞☬ঔৣ꧂`, category: "stylish" },
    { id: "legend", label: "Legend tag", value: `༺${title}༻ᴳᵒᵈ`, category: "gamer" },
    { id: "underscore", label: "Underscore", value: `${noSpace.toLowerCase()}_${pick(["x", "xx", "pro", "yt", "tv"], seed)}`, category: "minimal" },
    { id: "x-wrap", label: "X wrap", value: `xX${noSpace}Xx`, category: "gamer" },
    { id: "waves", label: "Wave frame", value: `┈━═☆❣️${script}❣️☆═━┈`, category: "aesthetic" },
  ];

  // De-dupe by value while keeping order
  const seen = new Set<string>();
  return variants.filter((v) => {
    if (!v.value.trim() || seen.has(v.value)) return false;
    seen.add(v.value);
    return true;
  });
}

export function filterCoolNames(variants: CoolNameVariant[], category: CoolNameCategory) {
  if (category === "all") return variants;
  return variants.filter((v) => v.category === category);
}

/** Random cool nicknames without requiring a base (nickfinder-style random). */
export function generateRandomCoolNames(count = 12, seed = Date.now()): CoolNameVariant[] {
  const out: CoolNameVariant[] = [];
  for (let i = 0; i < count; i++) {
    const s = seed + i * 97;
    const adj = pick(ADJECTIVES, s);
    const noun = pick(NOUNS, s + 13);
    const shortPool = ["King", "Queen", "Legend", "Ninja", "Ghost", "Blaze", "Nova", "Ace", "Viper", "Storm"];
    const useCombo = (s % 100) > 35;
    const base = useCombo ? `${adj}${noun}` : pick(shortPool, s + 29);
    const batch = generateCoolNames(base, s);
    const pickOne = batch[s % batch.length];
    if (pickOne) out.push({ ...pickOne, id: `rand-${i}-${pickOne.id}`, label: "Random" });
  }
  return out;
}

export const COOL_NAME_CATEGORIES: { value: CoolNameCategory; label: string }[] = [
  { value: "all", label: "All styles" },
  { value: "stylish", label: "Stylish" },
  { value: "gamer", label: "Gamer" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "minimal", label: "Minimal" },
  { value: "symbols", label: "Symbols" },
];

/** Unicode “fonts” for the rich nickname editor (copyable characters). */
export const COOL_EDITOR_FONTS: {
  id: string;
  label: string;
  sample: string;
  apply: (s: string) => string;
}[] = [
  { id: "plain", label: "Plain", sample: "Abc", apply: (s) => s },
  { id: "script", label: "Script", sample: "𝒜𝒷𝒸", apply: (s) => mapChars(s, SCRIPT) },
  { id: "bold-script", label: "Soft script", sample: "𝒶𝒷𝒸", apply: (s) => mapChars(s, BOLD_SCRIPT) },
  { id: "small-caps", label: "Small caps", sample: "ᴀʙᴄ", apply: (s) => mapChars(s, SMALL_CAPS) },
  { id: "superscript", label: "Tiny", sample: "ᵃᵇᶜ", apply: (s) => mapChars(s, SUPERSCRIPT) },
  { id: "gothic", label: "Gothic", sample: "𝖆𝖇𝖈", apply: (s) => mapChars(s, FRAKTUR) },
  { id: "double", label: "Double", sample: "𝕒𝕓𝕔", apply: (s) => mapChars(s, DOUBLE_STRUCK) },
  { id: "bubble", label: "Bubble", sample: "ⓐⓑⓒ", apply: (s) => mapChars(s.toLowerCase(), BUBBLE) },
  { id: "squared", label: "Squared", sample: "🅐🅑🅒", apply: (s) => mapChars(s.toLowerCase(), SQUARED) },
  { id: "bold", label: "Bold", sample: "𝗔𝗯𝗰", apply: (s) => mapFancy(s, 0x1d5d4, 0x1d5ee) },
  { id: "italic", label: "Italic", sample: "𝐴𝑏𝑐", apply: (s) => mapFancy(s, 0x1d434, 0x1d44e) },
  { id: "mono", label: "Mono", sample: "𝙰𝚋𝚌", apply: (s) => mapFancy(s, 0x1d670, 0x1d68a) },
  { id: "fullwidth", label: "Wide", sample: "Ａｂｃ", apply: (s) => fullwidth(s) },
  {
    id: "leet",
    label: "Leet",
    sample: "1337",
    apply: (s) =>
      [...s]
        .map((c) => LEET[c.toLowerCase()] ?? c)
        .join(""),
  },
  { id: "spaced", label: "Spaced", sample: "A B C", apply: (s) => spaced(s.toUpperCase()) },
  { id: "barred", label: "Bars", sample: "░A░", apply: (s) => barred(s) },
];

/** CSS preview fonts loaded in the editor (visual only — clipboard stays Unicode text). */
export const COOL_PREVIEW_FONTS: { id: string; label: string; family: string; google?: string }[] = [
  { id: "system", label: "System", family: "inherit" },
  { id: "display", label: "Display", family: '"Segoe UI", "Noto Sans", sans-serif' },
  {
    id: "pacifico",
    label: "Pacifico",
    family: '"Pacifico", cursive',
    google: "Pacifico",
  },
  {
    id: "press-start",
    label: "Pixel",
    family: '"Press Start 2P", system-ui',
    google: "Press+Start+2P",
  },
  {
    id: "cinzel",
    label: "Cinzel",
    family: '"Cinzel", serif',
    google: "Cinzel:wght@500;700",
  },
  {
    id: "orbitron",
    label: "Orbitron",
    family: '"Orbitron", sans-serif',
    google: "Orbitron:wght@500;700",
  },
  {
    id: "permanent-marker",
    label: "Marker",
    family: '"Permanent Marker", cursive',
    google: "Permanent+Marker",
  },
];

export const COOL_EDITOR_FRAMES: { id: string; label: string; wrap: (inner: string) => string }[] = [
  { id: "none", label: "None", wrap: (s) => s },
  { id: "ornate", label: "Ornate", wrap: (s) => `꧁༺${s}༻꧂` },
  { id: "star", label: "Stars", wrap: (s) => `꧁☆☬${s}☬☆꧂` },
  { id: "quote", label: "Quotes", wrap: (s) => `『${s}』` },
  { id: "flower", label: "Flower", wrap: (s) => `༄✿${s}࿐` },
  { id: "heart", label: "Hearts", wrap: (s) => `♡${s}♡` },
  { id: "crown", label: "Crown", wrap: (s) => `♔〘${s}〙♔` },
  { id: "dark", label: "Dark", wrap: (s) => `꧁༒☬${s}☬༒꧂` },
  { id: "slash", label: "Slash", wrap: (s) => `×͜×ㅤ${s}ㅤ` },
  { id: "don", label: "Don", wrap: (s) => `꧁ঔৣ☬✞${s}✞☬ঔৣ꧂` },
  { id: "waves", label: "Waves", wrap: (s) => `┈━═☆❣️${s}❣️☆═━┈` },
  { id: "sun", label: "Sun", wrap: (s) => `🌻${s}🌻` },
];

export const COOL_EDITOR_EMOJIS: { label: string; items: string[] }[] = [
  {
    label: "Smileys",
    items: ["😀", "😎", "🤩", "😈", "👻", "💀", "🤖", "👽", "🔥", "💯"],
  },
  {
    label: "Hearts",
    items: ["❤️", "♡", "💖", "💕", "💘", "🖤", "🤍", "💗", "💝", "💞"],
  },
  {
    label: "Symbols",
    items: ["✨", "⚡", "★", "☆", "✦", "♛", "♔", "ツ", "࿐", "√", "乂", "モ", "ッ", "✿", "✧"],
  },
  {
    label: "Gaming",
    items: ["🎮", "🎯", "🏆", "⚔️", "🛡️", "🗡️", "💣", "🚀", "👾", "🐉"],
  },
  {
    label: "Nature",
    items: ["🌻", "🌹", "🌙", "⭐", "🌈", "❄️", "🌊", "🍀", "🌸", "🦋"],
  },
];

/** Apply a unicode font to Latin letters in text; leave other symbols intact. */
export function applyCoolEditorFont(text: string, fontId: string): string {
  const font = COOL_EDITOR_FONTS.find((f) => f.id === fontId) ?? COOL_EDITOR_FONTS[0];
  return font.apply(text);
}

export function wrapCoolEditorFrame(text: string, frameId: string): string {
  const frame = COOL_EDITOR_FRAMES.find((f) => f.id === frameId) ?? COOL_EDITOR_FRAMES[0];
  return frame.wrap(text);
}

export function googleFontsHref(fonts: typeof COOL_PREVIEW_FONTS): string {
  const families = fonts
    .map((f) => f.google)
    .filter(Boolean)
    .join("&family=");
  if (!families) return "";
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}
