export type FontStyleCategory =
  | "all"
  | "bold"
  | "script"
  | "serif"
  | "mono"
  | "symbols"
  | "decorated"
  | "emoji"
  | "fun";

export type FontStyleDef = {
  id: string;
  label: string;
  category: Exclude<FontStyleCategory, "all">;
  blurb: string;
  apply: (text: string) => string;
};

export type GeneratedFontStyle = {
  id: string;
  label: string;
  category: Exclude<FontStyleCategory, "all">;
  blurb: string;
  value: string;
};

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
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

const SUBSCRIPT: Record<string, string> = {
  a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ",
  p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
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
  "0": "𝟘", "1": "𝟙", "2": "𝟚", "3": "𝟛", "4": "𝟜", "5": "𝟝", "6": "𝟞", "7": "𝟟", "8": "𝟠", "9": "𝟡",
};

const BUBBLE: Record<string, string> = {
  a: "ⓐ", b: "ⓑ", c: "ⓒ", d: "ⓓ", e: "ⓔ", f: "ⓕ", g: "ⓖ", h: "ⓗ", i: "ⓘ", j: "ⓙ",
  k: "ⓚ", l: "ⓛ", m: "ⓜ", n: "ⓝ", o: "ⓞ", p: "ⓟ", q: "ⓠ", r: "ⓡ", s: "ⓢ", t: "ⓣ",
  u: "ⓤ", v: "ⓥ", w: "ⓦ", x: "ⓧ", y: "ⓨ", z: "ⓩ",
  "0": "⓪", "1": "①", "2": "②", "3": "③", "4": "④", "5": "⑤", "6": "⑥", "7": "⑦", "8": "⑧", "9": "⑨",
};

const SQUARED: Record<string, string> = {
  a: "🅐", b: "🅑", c: "🅒", d: "🅓", e: "🅔", f: "🅕", g: "🅖", h: "🅗", i: "🅘", j: "🅙",
  k: "🅚", l: "🅛", m: "🅜", n: "🅝", o: "🅞", p: "🅟", q: "🅠", r: "🅡", s: "🅢", t: "🅣",
  u: "🅤", v: "🅥", w: "🅦", x: "🅧", y: "🅨", z: "🅩",
};

const PAREN: Record<string, string> = {
  a: "⒜", b: "⒝", c: "⒞", d: "⒟", e: "⒠", f: "⒡", g: "⒢", h: "⒣", i: "⒤", j: "⒥",
  k: "⒦", l: "⒧", m: "⒨", n: "⒩", o: "⒪", p: "⒫", q: "⒬", r: "⒭", s: "⒮", t: "⒯",
  u: "⒰", v: "⒱", w: "⒲", x: "⒳", y: "⒴", z: "⒵",
};

const UPSIDE: Record<string, string> = {
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ",
  k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ",
  u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  A: "∀", B: "𐐒", C: "Ɔ", D: "ᗡ", E: "Ǝ", F: "Ⅎ", G: "פ", H: "H", I: "I", J: "ſ",
  K: "ʞ", L: "˥", M: "W", N: "N", O: "O", P: "Ԁ", Q: "Ό", R: "ᴚ", S: "S", T: "⊥",
  U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  "0": "0", "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6",
  "?": "¿", "!": "¡", ".": "˙", ",": "'", "'": ",", '"': "„", "(": ")", ")": "(", "[": "]", "]": "[",
  "{": "}", "}": "{", "<": ">", ">": "<",
};

const LEET: Record<string, string> = {
  a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", b: "8", g: "9",
};

const CURSIVE_ALT: Record<string, string> = {
  a: "α", b: "в", c: "¢", d: "∂", e: "є", f: "ƒ", g: "g", h: "н", i: "ι", j: "נ",
  k: "к", l: "ℓ", m: "м", n: "η", o: "σ", p: "ρ", q: "q", r: "я", s: "ѕ", t: "т",
  u: "υ", v: "ν", w: "ω", x: "χ", y: "у", z: "z",
};

const WIRE: Record<string, string> = {
  a: "ᗩ", b: "ᗷ", c: "ᑕ", d: "ᗪ", e: "E", f: "ᖴ", g: "G", h: "ᕼ", i: "I", j: "ᒍ",
  k: "K", l: "ᒪ", m: "ᗰ", n: "ᑎ", o: "O", p: "ᑭ", q: "ᑫ", r: "ᖇ", s: "S", t: "T",
  u: "ᑌ", v: "ᐯ", w: "ᗯ", x: "᙭", y: "Y", z: "ᘔ",
};

const ANCIENT: Record<string, string> = {
  a: "ል", b: "ጌ", c: "ር", d: "ዕ", e: "ቿ", f: "ቻ", g: "ኗ", h: "ዘ", i: "ጎ", j: "ጋ",
  k: "ኸ", l: "ረ", m: "ጠ", n: "ክ", o: "ዐ", p: "የ", q: "ዒ", r: "ዪ", s: "ነ", t: "ፕ",
  u: "ሁ", v: "ሀ", w: "ሠ", x: "ሸ", y: "ሃ", z: "ጊ",
};

function mapTable(text: string, table: Record<string, string>) {
  return [...text]
    .map((ch) => table[ch] ?? table[ch.toLowerCase()] ?? ch)
    .join("");
}

function mapMath(text: string, upperBase: number, lowerBase: number, digitBase?: number) {
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(upperBase + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(lowerBase + (code - 97));
      if (digitBase != null && code >= 48 && code <= 57) {
        return String.fromCodePoint(digitBase + (code - 48));
      }
      return ch;
    })
    .join("");
}

function fullwidth(text: string) {
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code === 32) return "\u3000";
      if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xfee0);
      return ch;
    })
    .join("");
}

function spaced(text: string) {
  return [...text].join(" ").replace(/ +/g, " ").trim();
}

function combine(text: string, mark: string) {
  return [...text]
    .map((ch) => (/\s/.test(ch) ? ch : `${ch}${mark}`))
    .join("");
}

function upsideDown(text: string) {
  return [...text]
    .map((ch) => UPSIDE[ch] ?? UPSIDE[ch.toLowerCase()] ?? ch)
    .reverse()
    .join("");
}

function reverse(text: string) {
  return [...text].reverse().join("");
}

function alternateCase(text: string) {
  let upper = true;
  return [...text]
    .map((ch) => {
      if (!/[a-z]/i.test(ch)) return ch;
      const out = upper ? ch.toUpperCase() : ch.toLowerCase();
      upper = !upper;
      return out;
    })
    .join("");
}

type BaseFont = {
  id: string;
  label: string;
  category: Exclude<FontStyleCategory, "all">;
  blurb: string;
  apply: (text: string) => string;
  combinable?: boolean;
};

const BASE_FONTS: BaseFont[] = [
  { id: "bold-sans", label: "Bold", category: "bold", blurb: "Math bold sans", combinable: true, apply: (t) => mapMath(t, 0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { id: "bold-italic-sans", label: "Bold italic", category: "bold", blurb: "Bold italic sans", combinable: true, apply: (t) => mapMath(t, 0x1d63c, 0x1d656) },
  { id: "italic-sans", label: "Italic", category: "bold", blurb: "Sans italic", combinable: true, apply: (t) => mapMath(t, 0x1d608, 0x1d622) },
  { id: "sans", label: "Sans", category: "mono", blurb: "Clean math sans", combinable: true, apply: (t) => mapMath(t, 0x1d5a0, 0x1d5ba, 0x1d7e2) },
  { id: "bold-serif", label: "Bold serif", category: "serif", blurb: "Classic bold serif", combinable: true, apply: (t) => mapMath(t, 0x1d400, 0x1d41a, 0x1d7ce) },
  { id: "italic-serif", label: "Italic serif", category: "serif", blurb: "Serif italic", combinable: true, apply: (t) => mapMath(t, 0x1d434, 0x1d44e) },
  { id: "bold-italic-serif", label: "Bold italic serif", category: "serif", blurb: "Serif bold italic", combinable: true, apply: (t) => mapMath(t, 0x1d468, 0x1d482) },
  { id: "script", label: "Cursive", category: "script", blurb: "Fancy cursive", combinable: true, apply: (t) => mapTable(t, SCRIPT) },
  { id: "bold-script", label: "Soft cursive", category: "script", blurb: "Light script", combinable: true, apply: (t) => mapTable(t, BOLD_SCRIPT) },
  { id: "cursive-spaced", label: "Cursive spaced", category: "script", blurb: "Airy cursive", combinable: true, apply: (t) => spaced(mapTable(t, SCRIPT)) },
  { id: "fraktur", label: "Gothic", category: "serif", blurb: "Blackletter", combinable: true, apply: (t) => mapTable(t, FRAKTUR) },
  { id: "double-struck", label: "Double struck", category: "symbols", blurb: "Outline bold", combinable: true, apply: (t) => mapTable(t, DOUBLE_STRUCK) },
  { id: "mono", label: "Monospace", category: "mono", blurb: "Typewriter math", combinable: true, apply: (t) => mapMath(t, 0x1d670, 0x1d68a, 0x1d7f6) },
  { id: "small-caps", label: "Small caps", category: "fun", blurb: "Tiny capitals", combinable: true, apply: (t) => mapTable(t, SMALL_CAPS) },
  { id: "superscript", label: "Superscript", category: "fun", blurb: "Raised letters", combinable: true, apply: (t) => mapTable(t, SUPERSCRIPT) },
  { id: "subscript", label: "Subscript", category: "fun", blurb: "Lowered letters", combinable: false, apply: (t) => mapTable(t, SUBSCRIPT) },
  { id: "bubble", label: "Bubble", category: "symbols", blurb: "Circled letters", combinable: true, apply: (t) => mapTable(t.toLowerCase(), BUBBLE) },
  { id: "squared", label: "Squared", category: "symbols", blurb: "Filled squares", combinable: true, apply: (t) => mapTable(t.toLowerCase(), SQUARED) },
  { id: "paren", label: "Parenthesized", category: "symbols", blurb: "Paren letters", combinable: false, apply: (t) => mapTable(t.toLowerCase(), PAREN) },
  { id: "fullwidth", label: "Wide", category: "decorated", blurb: "Fullwidth forms", combinable: true, apply: fullwidth },
  { id: "spaced", label: "Spaced", category: "decorated", blurb: "Wide tracking", combinable: true, apply: (t) => spaced(t.toUpperCase()) },
  { id: "upside-down", label: "Upside down", category: "fun", blurb: "Flipped text", combinable: false, apply: upsideDown },
  { id: "reversed", label: "Reversed", category: "fun", blurb: "Backwards text", combinable: false, apply: reverse },
  { id: "strike", label: "Strikethrough", category: "decorated", blurb: "Long stroke", combinable: false, apply: (t) => combine(t, "\u0336") },
  { id: "underline", label: "Underline", category: "decorated", blurb: "Low line", combinable: false, apply: (t) => combine(t, "\u0332") },
  { id: "wavy", label: "Wavy", category: "decorated", blurb: "Tilde marks", combinable: false, apply: (t) => combine(t, "\u0303") },
  { id: "dotted", label: "Dotted", category: "decorated", blurb: "Dot above", combinable: false, apply: (t) => combine(t, "\u0307") },
  { id: "slash", label: "Slash overlay", category: "decorated", blurb: "Solidus overlay", combinable: false, apply: (t) => combine(t, "\u0338") },
  { id: "double-underline", label: "Double underline", category: "decorated", blurb: "Double low line", combinable: false, apply: (t) => combine(t, "\u0333") },
  { id: "slash-through", label: "Crossed", category: "decorated", blurb: "Short stroke", combinable: false, apply: (t) => combine(t, "\u0335") },
  { id: "leet", label: "Leet", category: "fun", blurb: "1337 style", combinable: true, apply: (t) => [...t].map((c) => LEET[c.toLowerCase()] ?? c).join("") },
  { id: "currency", label: "Currency vibe", category: "fun", blurb: "Greek/special mix", combinable: true, apply: (t) => mapTable(t, CURSIVE_ALT) },
  { id: "wire", label: "Wireframe", category: "symbols", blurb: "Angular caps", combinable: true, apply: (t) => mapTable(t, WIRE) },
  { id: "ancient", label: "Ancient", category: "fun", blurb: "Ethiopic-looking", combinable: true, apply: (t) => mapTable(t, ANCIENT) },
  { id: "alt-case", label: "aLt CaSe", category: "fun", blurb: "Alternating case", combinable: true, apply: alternateCase },
  { id: "upper", label: "UPPERCASE", category: "fun", blurb: "All caps", combinable: true, apply: (t) => t.toUpperCase() },
  { id: "lower", label: "lowercase", category: "fun", blurb: "All lower", combinable: true, apply: (t) => t.toLowerCase() },
  { id: "bars", label: "Neon bars", category: "decorated", blurb: "░A░ separators", combinable: false, apply: (t) => ([...t.replace(/\s+/g, "").toUpperCase()].map((c) => `░${c}`).join("") + (t.trim() ? "░" : "")) },
  { id: "dot-sep", label: "Dot separator", category: "decorated", blurb: "A·B·C style", combinable: false, apply: (t) => [...t.replace(/\s+/g, "")].join("·") },
  { id: "slash-sep", label: "Slash separator", category: "decorated", blurb: "A/B/C style", combinable: false, apply: (t) => [...t.replace(/\s+/g, "").toUpperCase()].join("/") },
  { id: "pipe-sep", label: "Pipe separator", category: "decorated", blurb: "A|B|C style", combinable: false, apply: (t) => [...t.replace(/\s+/g, "").toUpperCase()].join("|") },
  { id: "clap", label: "Clap text", category: "emoji", blurb: "Word clap emoji", combinable: false, apply: (t) => t.trim().split(/\s+/).join(" 👏 ") },
  { id: "sparkle-words", label: "Sparkle words", category: "emoji", blurb: "✨ between words", combinable: false, apply: (t) => t.trim().split(/\s+/).join(" ✨ ") },
];

type Wrapper = {
  id: string;
  label: string;
  category: "emoji" | "decorated";
  wrap: (inner: string) => string;
};

const EMOJI_WRAPS: Array<[string, string, string]> = [
  ["sparkle", "✨", "Sparkles"],
  ["heart", "💕", "Hearts"],
  ["fire", "🔥", "Fire"],
  ["crown", "👑", "Crown"],
  ["star", "⭐", "Stars"],
  ["flower", "🌸", "Flower"],
  ["rose", "🌹", "Rose"],
  ["butterfly", "🦋", "Butterfly"],
  ["moon", "🌙", "Moon"],
  ["rainbow", "🌈", "Rainbow"],
  ["cool", "😎", "Cool"],
  ["love-face", "😍", "Love face"],
  ["ghost", "👻", "Ghost"],
  ["skull", "💀", "Skull"],
  ["robot", "🤖", "Robot"],
  ["alien", "👽", "Alien"],
  ["game", "🎮", "Gamer"],
  ["trophy", "🏆", "Trophy"],
  ["rocket", "🚀", "Rocket"],
  ["diamond", "💎", "Diamond"],
  ["wave", "🌊", "Wave"],
  ["sun", "☀️", "Sun"],
  ["snow", "❄️", "Snow"],
  ["music", "🎵", "Music"],
  ["camera", "📸", "Camera"],
  ["coffee", "☕", "Coffee"],
  ["pizza", "🍕", "Pizza"],
  ["cat", "🐱", "Cat"],
  ["dog", "🐶", "Dog"],
  ["unicorn", "🦄", "Unicorn"],
  ["peach", "🍑", "Peach"],
  ["cherry", "🍒", "Cherry"],
  ["leaf", "🍃", "Leaf"],
  ["zap", "⚡", "Zap"],
  ["boom", "💥", "Boom"],
  ["100", "💯", "Hundred"],
  ["ok", "👌", "OK"],
  ["peace", "✌️", "Peace"],
  ["pray", "🙏", "Pray"],
  ["kiss", "💋", "Kiss"],
];

const SYMBOL_WRAPS: Array<[string, string, string, string]> = [
  ["ornate", "꧁༺", "༻꧂", "Ornate"],
  ["dark", "꧁༒☬", "☬༒꧂", "Dark frame"],
  ["brackets", "『", "』", "Brackets"],
  ["quotes", "«", "»", "Guillemets"],
  ["corners", "⌜", "⌟", "Corners"],
  ["heavy", "【", "】", "Heavy brackets"],
  ["lenticular", "〖", "〗", "Lenticular"],
  ["angle", "《", "》", "Angle"],
  ["slash-boy", "×͜× ", "", "Slash boy"],
  ["mr", "ᴹᴿメ ", "", "MR tag"],
  ["waves", "┈━═☆ ", " ☆═━┈", "Wave line"],
  ["dots-frame", "·˚ ༘ ", " ⋆｡˚", "Soft dots"],
  ["aesthetic", "⋆｡˚ ", " ˚｡⋆", "Aesthetic"],
  ["arrow", "➳❥ ", "", "Arrow"],
  ["starry", "⋆✧ ", " ✧⋆", "Starry"],
  ["plus", "✦ ", " ✦", "Plus stars"],
  ["heart-sym", "♡ ", " ♡", "Heart symbol"],
  ["flower-sym", "✿ ", " ✿", "Flower symbol"],
  ["tiara", "♔ ", " ♔", "Tiara"],
  ["swirl", "༄ ", " ࿐", "Swirl"],
];

function buildWrappers(): Wrapper[] {
  const wraps: Wrapper[] = EMOJI_WRAPS.map(([id, emoji, label]) => ({
    id: `e-${id}`,
    label,
    category: "emoji" as const,
    wrap: (inner: string) => `${emoji} ${inner} ${emoji}`,
  }));

  for (const [id, left, right, label] of SYMBOL_WRAPS) {
    wraps.push({
      id: `s-${id}`,
      label,
      category: "decorated",
      wrap: (inner: string) => `${left}${inner}${right}`,
    });
  }

  // Extra single-side / asymmetric emoji mixes for volume
  const extras: Array<[string, string, string]> = [
    ["spark-heart", "✨💕", "💕✨"],
    ["fire-star", "🔥⭐", "⭐🔥"],
    ["crown-spark", "👑✨", "✨👑"],
    ["moon-star", "🌙⭐", "⭐🌙"],
    ["rose-heart", "🌹💕", "💕🌹"],
    ["game-fire", "🎮🔥", "🔥🎮"],
    ["rain-spark", "🌈✨", "✨🌈"],
    ["ghost-skull", "👻💀", "💀👻"],
    ["cam-spark", "📸✨", "✨📸"],
    ["music-note", "🎵🎶", "🎶🎵"],
  ];
  for (const [id, left, right] of extras) {
    wraps.push({
      id: `x-${id}`,
      label: id.replace(/-/g, " "),
      category: "emoji",
      wrap: (inner: string) => `${left} ${inner} ${right}`,
    });
  }

  return wraps;
}

const WRAPPERS = buildWrappers();

/** Popular bases that get wrapped into hundreds of fancyText variants. */
const COMBINE_BASE_IDS = [
  "script",
  "bold-script",
  "bold-sans",
  "bold-serif",
  "italic-serif",
  "fraktur",
  "double-struck",
  "small-caps",
  "bubble",
  "mono",
  "fullwidth",
  "wire",
  "currency",
  "sans",
  "spaced",
] as const;

function buildCatalog(): FontStyleDef[] {
  const catalog: FontStyleDef[] = [];
  const seen = new Set<string>();

  const push = (style: FontStyleDef) => {
    if (seen.has(style.id)) return;
    seen.add(style.id);
    catalog.push(style);
  };

  for (const base of BASE_FONTS) {
    push({
      id: base.id,
      label: base.label,
      category: base.category === "emoji" ? "emoji" : base.category,
      blurb: base.blurb,
      apply: base.apply,
    });
  }

  // Standalone wrapper-on-plain styles
  for (const wrap of WRAPPERS) {
    push({
      id: `plain-${wrap.id}`,
      label: `${wrap.label} plain`,
      category: wrap.category,
      blurb: `${wrap.label} around plain text`,
      apply: (t) => (t.trim() ? wrap.wrap(t.trim()) : ""),
    });
  }

  const combinable = BASE_FONTS.filter((b) => b.combinable && (COMBINE_BASE_IDS as readonly string[]).includes(b.id));

  for (const base of combinable) {
    for (const wrap of WRAPPERS) {
      push({
        id: `${base.id}__${wrap.id}`,
        label: `${wrap.label} · ${base.label}`,
        category: wrap.category,
        blurb: `${base.label} with ${wrap.label}`,
        apply: (t) => {
          const core = base.apply(t);
          return core.trim() ? wrap.wrap(core) : "";
        },
      });
    }
  }

  // Extra fun mixes to push past 500
  const bonusMixes: Array<[string, string, (t: string) => string, Exclude<FontStyleCategory, "all">]> = [
    ["girl-vibe", "Girl vibe", (t) => (t.trim() ? `✿ • ${spaced(t.toUpperCase())}✿ᴳᴵᴿᴸ࿐` : ""), "decorated"],
    ["legend", "Legend tag", (t) => (t.trim() ? `༺${mapTable(t, SMALL_CAPS)}༻ᴳᵒᵈ` : ""), "decorated"],
    ["alone", "Alone boy", (t) => (t.trim() ? `×͜×ㅤ${mapMath(t, 0x1d670, 0x1d68a)}ㅤ` : ""), "decorated"],
    ["don", "Don frame", (t) => (t.trim() ? `꧁ঔৣ☬✞${mapTable(t, FRAKTUR)}✞☬ঔৣ꧂` : ""), "decorated"],
    ["sunflower", "Sunflower", (t) => (t.trim() ? `🌻 ${fullwidth(t)} 🌻` : ""), "emoji"],
    ["hearts-script", "Hearts script", (t) => (t.trim() ? `♡ ${mapTable(t, SCRIPT)} ♡` : ""), "emoji"],
    ["stars-bold", "Stars bold", (t) => (t.trim() ? `★ ${mapMath(t, 0x1d5d4, 0x1d5ee)} ★` : ""), "emoji"],
    ["ff-suffix", "FF suffix", (t) => (t.trim() ? `${mapTable(t, SMALL_CAPS)} ᶠᶠ` : ""), "decorated"],
    ["jp-flair", "JP flair", (t) => (t.trim() ? `${mapTable(t, SMALL_CAPS)}ツ` : ""), "decorated"],
    ["underscore", "Underscore vibe", (t) => (t.trim() ? `${t.replace(/\s+/g, "").toLowerCase()}_xx` : ""), "fun"],
    ["x-wrap", "xX wrap", (t) => (t.trim() ? `xX${t.replace(/\s+/g, "")}Xx` : ""), "fun"],
    ["aesthetic-line", "Aesthetic line", (t) => (t.trim() ? `‧₊˚ ${mapTable(t, BOLD_SCRIPT)} ˚₊‧` : ""), "decorated"],
    ["soft-blur", "Soft blur look", (t) => (t.trim() ? `˚₊· ͟͟͞͞➳❥ ${mapTable(t, SCRIPT)}` : ""), "decorated"],
    ["night-mode", "Night mode", (t) => (t.trim() ? `🌙 ⋆｡˚ ${mapTable(t, SCRIPT)} ˚｡⋆ 🌙` : ""), "emoji"],
    ["gamer-tag", "Gamer tag", (t) => (t.trim() ? `🎮 ×͜× ${mapMath(t, 0x1d670, 0x1d68a)} ×͜× 🎮` : ""), "emoji"],
  ];

  for (const [id, label, apply, category] of bonusMixes) {
    push({ id, label, category, blurb: label, apply });
  }

  return catalog;
}

export const FONT_STYLES: FontStyleDef[] = buildCatalog();

export const FONT_STYLE_COUNT = FONT_STYLES.length;

export const FONT_STYLE_CATEGORIES: { id: FontStyleCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "script", label: "Cursive" },
  { id: "bold", label: "Bold" },
  { id: "serif", label: "Serif" },
  { id: "emoji", label: "Emoji" },
  { id: "decorated", label: "Stylish" },
  { id: "symbols", label: "Symbols" },
  { id: "mono", label: "Mono" },
  { id: "fun", label: "Fun" },
];

export const FANCY_EMOJI_PACKS: { id: string; label: string; items: string[] }[] = [
  { id: "hearts", label: "Hearts", items: ["❤️", "💕", "💖", "💗", "💘", "💝", "💞", "💟", "🖤", "🤍", "🧡", "💛"] },
  { id: "sparkle", label: "Sparkle", items: ["✨", "⭐", "🌟", "💫", "⚡", "🔥", "🌈", "🎆", "🎇", "💎"] },
  { id: "faces", label: "Faces", items: ["😎", "😍", "🤩", "😈", "👻", "💀", "🤖", "👽", "👑", "🧢"] },
  { id: "nature", label: "Nature", items: ["🌸", "🌹", "🌻", "🍀", "🌙", "🌊", "🦋", "🍃", "🌺", "🌷"] },
  { id: "gaming", label: "Gaming", items: ["🎮", "🎯", "🏆", "⚔️", "🛡️", "🚀", "👾", "🐉", "💣", "🗡️"] },
];

export type FancyFrame = {
  id: string;
  label: string;
  wrap: (inner: string) => string;
};

export const FANCY_FRAMES: FancyFrame[] = [
  { id: "none", label: "None", wrap: (s) => s },
  ...WRAPPERS.filter((w) => w.id.startsWith("e-") || w.id.startsWith("s-")).slice(0, 24).map((w) => ({
    id: w.id,
    label: w.label,
    wrap: w.wrap,
  })),
];

export function composeFancyText(
  text: string,
  options: {
    styleId?: string;
    frameId?: string;
    emojiLeft?: string;
    emojiRight?: string;
  } = {}
) {
  const input = text.slice(0, 280);
  if (!input.trim()) return "";
  const style = FONT_STYLES.find((s) => s.id === options.styleId) ?? FONT_STYLES.find((s) => s.id === "script");
  let value = style ? style.apply(input) : input;
  if (options.emojiLeft || options.emojiRight) {
    value = `${options.emojiLeft ? `${options.emojiLeft} ` : ""}${value}${options.emojiRight ? ` ${options.emojiRight}` : ""}`;
  }
  const frame = FANCY_FRAMES.find((f) => f.id === (options.frameId ?? "none")) ?? FANCY_FRAMES[0];
  // Avoid double-wrapping if frame already applied similar emoji via style id combos
  if (frame.id === "none") return value;
  return frame.wrap(value);
}

export const SAMPLE_PHRASES = [
  "Make something colorful",
  "ColorBase studio",
  "Hello World",
  "Your Name",
  "Stay curious",
  "Aesthetic vibes",
  "Bold ideas only",
  "Design in public",
];

export function generateFontStyles(text: string, category: FontStyleCategory = "all"): GeneratedFontStyle[] {
  const input = text.slice(0, 280);
  if (!input.trim()) return [];

  const out: GeneratedFontStyle[] = [];
  const seenValues = new Set<string>();

  for (const style of FONT_STYLES) {
    if (category !== "all" && style.category !== category) continue;
    const value = style.apply(input);
    if (!value.trim() || value === input || seenValues.has(value)) continue;
    seenValues.add(value);
    out.push({
      id: style.id,
      label: style.label,
      category: style.category,
      blurb: style.blurb,
      value,
    });
  }

  return out;
}

export function filterGeneratedStyles(styles: GeneratedFontStyle[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return styles;
  return styles.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.blurb.toLowerCase().includes(q) ||
      s.category.includes(q) ||
      s.value.toLowerCase().includes(q)
  );
}

export function stylesToTextFile(styles: GeneratedFontStyle[], source: string) {
  const lines = [
    `ColorBase Font Generator`,
    `Source: ${source}`,
    `Styles: ${styles.length}`,
    "",
    ...styles.map((s) => `${s.label}: ${s.value}`),
  ];
  return lines.join("\n");
}
