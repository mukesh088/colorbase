/** Simple Icons slugs that differ from our brand slugs. */
const ICON_SLUG: Record<string, string> = {
  "x-twitter": "x",
  "disney-plus": "disneyplus",
  "prime-video": "amazon",
  "google-maps": "googlemaps",
  chatgpt: "openai",
  macos: "apple",
  ios: "apple",
  aws: "amazonwebservices",
  photoshop: "adobephotoshop",
  illustrator: "adobeillustrator",
  "coca-cola": "cocacola",
  mcdonalds: "mcdonalds",
  "mercedes-benz": "mercedes",
  amex: "americanexpress",
  booking: "bookingdotcom",
  "oneplus": "oneplus",
  "premier-league": "premierleague",
  "just-eat": "justeat",
  "uber-eats": "ubereats",
  "taco-bell": "tacobell",
  "burger-king": "burgerking",
};

const CREST_CDN = "https://cdn.jsdelivr.net/gh/luukhopman/football-logos@master/logos";

function crest(league: string, file: string) {
  return `${CREST_CDN}/${encodeURIComponent(league)}/${encodeURIComponent(file)}`;
}

const PL = "England - Premier League";
const LL = "Spain - LaLiga";
const BL = "Germany - Bundesliga";
const SA = "Italy - Serie A";
const L1 = "France - Ligue 1";
const ER = "Netherlands - Eredivisie";
const PT = "Portugal - Liga Portugal";
const SP = "Scotland - Scottish Premiership";

/** Full-color football crests (not Simple Icons). */
const BRAND_CREST_URL: Record<string, string> = {
  arsenal: crest(PL, "Arsenal FC.png"),
  "aston-villa": crest(PL, "Aston Villa.png"),
  bournemouth: crest(PL, "AFC Bournemouth.png"),
  brentford: crest(PL, "Brentford FC.png"),
  brighton: crest(PL, "Brighton & Hove Albion.png"),
  chelsea: crest(PL, "Chelsea FC.png"),
  "coventry-city": crest(PL, "Coventry City.png"),
  "crystal-palace": crest(PL, "Crystal Palace.png"),
  everton: crest(PL, "Everton FC.png"),
  fulham: crest(PL, "Fulham FC.png"),
  "hull-city": crest(PL, "Hull City.png"),
  "ipswich-town": crest(PL, "Ipswich Town.png"),
  "leeds-united": crest(PL, "Leeds United.png"),
  liverpool: crest(PL, "Liverpool FC.png"),
  "manchester-city": crest(PL, "Manchester City.png"),
  "manchester-united": crest(PL, "Manchester United.png"),
  "newcastle-united": crest(PL, "Newcastle United.png"),
  "nottingham-forest": crest(PL, "Nottingham Forest.png"),
  sunderland: crest(PL, "Sunderland AFC.png"),
  tottenham: crest(PL, "Tottenham Hotspur.png"),
  "real-madrid": crest(LL, "Real Madrid.png"),
  barcelona: crest(LL, "FC Barcelona.png"),
  "atletico-madrid": crest(LL, "Atlético de Madrid.png"),
  sevilla: crest(LL, "Sevilla FC.png"),
  valencia: crest(LL, "Valencia CF.png"),
  "athletic-bilbao": crest(LL, "Athletic Bilbao.png"),
  "bayern-munich": crest(BL, "Bayern Munich.png"),
  "borussia-dortmund": crest(BL, "Borussia Dortmund.png"),
  "bayer-leverkusen": crest(BL, "Bayer 04 Leverkusen.png"),
  "rb-leipzig": crest(BL, "RB Leipzig.png"),
  "eintracht-frankfurt": crest(BL, "Eintracht Frankfurt.png"),
  juventus: crest(SA, "Juventus FC.png"),
  "ac-milan": crest(SA, "AC Milan.png"),
  "inter-milan": crest(SA, "Inter Milan.png"),
  napoli: crest(SA, "SSC Napoli.png"),
  "as-roma": crest(SA, "AS Roma.png"),
  lazio: crest(SA, "SS Lazio.png"),
  psg: crest(L1, "Paris Saint-Germain.png"),
  "olympique-marseille": crest(L1, "Olympique Marseille.png"),
  "olympique-lyon": crest(L1, "Olympique Lyon.png"),
  "as-monaco": crest(L1, "AS Monaco.png"),
  ajax: crest(ER, "Ajax Amsterdam.png"),
  psv: crest(ER, "PSV Eindhoven.png"),
  feyenoord: crest(ER, "Feyenoord Rotterdam.png"),
  benfica: crest(PT, "SL Benfica.png"),
  porto: crest(PT, "FC Porto.png"),
  "sporting-cp": crest(PT, "Sporting CP.png"),
  celtic: crest(SP, "Celtic FC.png"),
  rangers: crest(SP, "Rangers FC.png"),
};

export function brandCrestUrl(slug: string) {
  return BRAND_CREST_URL[slug];
}

export function brandIconSlug(slug: string) {
  return ICON_SLUG[slug] ?? slug.replace(/-/g, "");
}

export function brandIconUrl(slug: string, hex: string) {
  const icon = brandIconSlug(slug);
  const color = hex.replace("#", "").toLowerCase();
  return `https://cdn.simpleicons.org/${icon}/${color}`;
}

export function brandLogoSrc(slug: string, hex: string) {
  return brandCrestUrl(slug) ?? brandIconUrl(slug, hex);
}

/** Prefer a chromatic brand color so monochrome logos stay visible. */
export function brandMarkHex(colors: string[]) {
  const ranked = colors.filter((c) => {
    const n = c.toLowerCase();
    return n !== "#ffffff" && n !== "#f5f5f5" && n !== "#f8f8f8" && n !== "#fafafa";
  });
  const chromatic = ranked.find((c) => {
    const n = c.toLowerCase();
    return n !== "#000000" && n !== "#111111" && n !== "#1a1a1a" && n !== "#181717";
  });
  return chromatic ?? ranked[0] ?? colors[0] ?? "#111111";
}

export function brandInitial(name: string) {
  const cleaned = name.replace(/^\(|\)/g, "").trim();
  return cleaned.charAt(0).toUpperCase() || "B";
}
