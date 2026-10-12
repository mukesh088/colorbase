/**
 * Idempotent brand catalog import.
 *
 * ColorBase stores brands in src/lib/data, not in Postgres. This script
 * validates the 40-brand shortlist and, only with --apply, rewrites
 * src/lib/data/imported-brands.ts. It never edits the original brand,
 * food, or football files and never deletes unrelated records.
 *
 * Dry run (default):
 *   node --experimental-strip-types scripts/seed-brands.ts
 *
 * Write new slugs:
 *   node --experimental-strip-types scripts/seed-brands.ts --apply
 *
 * Refresh slugs that this script already imported:
 *   node --experimental-strip-types scripts/seed-brands.ts --apply --update
 */
import fs from "node:fs";
import path from "node:path";

type LogoProvider = "simple-icons" | "google-favicon";

type Swatch = {
  hex: string;
  verified: boolean;
};

type SeedBrand = {
  name: string;
  slug: string;
  category: string;
  primaryColor: string;
  palette: Swatch[];
  logoProvider: LogoProvider;
  /** Confirmed against cdn.simpleicons.org. Never guessed. */
  simpleIconSlug?: string;
  domain: string;
  description: string;
  websiteUrl: string;
  metaTitle: string;
  metaDescription: string;
  related: string[];
};

type CatalogBrand = {
  slug: string;
  name: string;
  overview: string;
  category: string;
  primary: string[];
  secondary: string[];
  related: string[];
  websiteUrl: string;
  metaTitle: string;
  metaDescription: string;
  logoUrl: string;
  logoProvider: LogoProvider;
  unverified: string[];
};

type RowStatus = "inserted" | "skipped" | "updated" | "failed";

const HEX = /^#[0-9A-F]{6}$/;
const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, "src", "lib", "data", "imported-brands.ts");
const SOURCE_FILES = [
  path.join(ROOT, "src", "lib", "data", "brands.ts"),
  path.join(ROOT, "src", "lib", "data", "food-brands.ts"),
  path.join(ROOT, "src", "lib", "data", "football-brands.ts"),
  OUT_FILE,
];

function s(hex: string, verified = false): Swatch {
  return { hex: hex.toUpperCase(), verified };
}

const SEED_BRANDS: SeedBrand[] = [
  {
    name: "Anthropic",
    slug: "anthropic",
    category: "AI & developer tools",
    primaryColor: "#191919",
    palette: [s("#191919", true), s("#FFFFFF"), s("#D97757"), s("#F5F0E8"), s("#44403C")],
    logoProvider: "simple-icons",
    simpleIconSlug: "anthropic",
    domain: "anthropic.com",
    description:
      "Anthropic publishes a near-black wordmark. The tan accent on this page is an interface estimate, not a guideline color, and the black value comes from the Simple Icons brand record.",
    websiteUrl: "https://www.anthropic.com",
    metaTitle: "Anthropic Hex Colors & Brand Palette",
    metaDescription:
      "Anthropic brand hex #191919 with estimated interface colors. Copy the logo black and see which swatches are unverified.",
    related: ["perplexity", "hugging-face", "replit"],
  },
  {
    name: "Perplexity",
    slug: "perplexity",
    category: "AI & developer tools",
    primaryColor: "#1FB8CD",
    palette: [s("#1FB8CD", true), s("#0F3D42"), s("#FFFFFF"), s("#111827"), s("#D8F7F8")],
    logoProvider: "simple-icons",
    simpleIconSlug: "perplexity",
    domain: "perplexity.ai",
    description:
      "Perplexity's published logo teal is #1FB8CD. The darker sea-green and page neutrals are estimates for UI mockups and are labeled unverified.",
    websiteUrl: "https://www.perplexity.ai",
    metaTitle: "Perplexity Hex Color #1FB8CD",
    metaDescription:
      "Perplexity logo hex #1FB8CD plus estimated interface neutrals. Copy the verified teal and check contrast before using it as text.",
    related: ["anthropic", "hugging-face", "vercel"],
  },
  {
    name: "Vercel",
    slug: "vercel",
    category: "AI & developer tools",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#171717"), s("#EDEDED"), s("#0070F3")],
    logoProvider: "simple-icons",
    simpleIconSlug: "vercel",
    domain: "vercel.com",
    description:
      "Vercel's current mark is black on light surfaces. The older triangle blue is kept only as an unverified historical swatch so it is not presented as today's guideline.",
    websiteUrl: "https://vercel.com",
    metaTitle: "Vercel Hex Color #000000",
    metaDescription:
      "Vercel brand hex #000000 for the current mark, with white and an unverified legacy blue. Copy the logo color for docs and decks.",
    related: ["supabase", "docker", "replit"],
  },
  {
    name: "Supabase",
    slug: "supabase",
    category: "AI & developer tools",
    primaryColor: "#3FCF8E",
    palette: [s("#3FCF8E", true), s("#11181C"), s("#FFFFFF"), s("#249361"), s("#E6F7EF")],
    logoProvider: "simple-icons",
    simpleIconSlug: "supabase",
    domain: "supabase.com",
    description:
      "Supabase's published brand green is #3FCF8E. The ink, white, and lighter green here are layout estimates, not additional official logo colors.",
    websiteUrl: "https://supabase.com",
    metaTitle: "Supabase Hex Color #3FCF8E",
    metaDescription:
      "Supabase logo hex #3FCF8E with estimated dark and light UI swatches. Copy the verified green for brand references.",
    related: ["vercel", "docker", "jetbrains"],
  },
  {
    name: "Docker",
    slug: "docker",
    category: "AI & developer tools",
    primaryColor: "#2496ED",
    palette: [s("#2496ED", true), s("#FFFFFF"), s("#0DB7ED"), s("#223344"), s("#E7F3FD")],
    logoProvider: "simple-icons",
    simpleIconSlug: "docker",
    domain: "docker.com",
    description:
      "Docker's whale blue in the Simple Icons media-resource record is #2496ED. Nearby cyans and the slate are unverified supporting swatches.",
    websiteUrl: "https://www.docker.com",
    metaTitle: "Docker Hex Color #2496ED",
    metaDescription:
      "Docker brand hex #2496ED from the published logo blue, plus unverified UI companions. Copy the verified whale blue.",
    related: ["supabase", "jetbrains", "vercel"],
  },
  {
    name: "Hugging Face",
    slug: "hugging-face",
    category: "AI & developer tools",
    primaryColor: "#FFD21E",
    palette: [s("#FFD21E", true), s("#000000"), s("#FFFFFF"), s("#FF9D00"), s("#FFF4CC")],
    logoProvider: "simple-icons",
    simpleIconSlug: "huggingface",
    domain: "huggingface.co",
    description:
      "The Hugging Face mark is a yellow face. #FFD21E is that logo yellow. Orange, black, and cream swatches are estimates and stay labeled unverified.",
    websiteUrl: "https://huggingface.co",
    metaTitle: "Hugging Face Hex Color #FFD21E",
    metaDescription:
      "Hugging Face logo yellow #FFD21E with unverified orange and neutral swatches. Copy the face color for model-hub references.",
    related: ["anthropic", "perplexity", "replit"],
  },
  {
    name: "Replit",
    slug: "replit",
    category: "AI & developer tools",
    primaryColor: "#F26207",
    palette: [s("#F26207", true), s("#0E1525"), s("#FFFFFF"), s("#000000"), s("#FDE7D8")],
    logoProvider: "simple-icons",
    simpleIconSlug: "replit",
    domain: "replit.com",
    description:
      "Replit's published orange is #F26207. The navy editor background and peach tint are unverified interface colors for mockups.",
    websiteUrl: "https://replit.com",
    metaTitle: "Replit Hex Color #F26207",
    metaDescription:
      "Replit brand hex #F26207 with estimated editor navy and peach. Copy the verified orange logo color.",
    related: ["vercel", "jetbrains", "docker"],
  },
  {
    name: "JetBrains",
    slug: "jetbrains",
    category: "AI & developer tools",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#FE315D"), s("#087CFA"), s("#F97A12")],
    logoProvider: "simple-icons",
    simpleIconSlug: "jetbrains",
    domain: "jetbrains.com",
    description:
      "The JetBrains wordmark in the icon set is black. Product accents such as pink, blue, and orange belong to individual IDEs and are marked unverified here.",
    websiteUrl: "https://www.jetbrains.com",
    metaTitle: "JetBrains Hex Color #000000",
    metaDescription:
      "JetBrains wordmark hex #000000. IDE accent colors on this page are unverified and should not be treated as the company logo color.",
    related: ["docker", "replit", "supabase"],
  },
  {
    name: "Epic Games",
    slug: "epic-games",
    category: "Gaming",
    primaryColor: "#313131",
    palette: [s("#313131", true), s("#000000"), s("#FFFFFF"), s("#2A2A2A"), s("#F5F5F5")],
    logoProvider: "simple-icons",
    simpleIconSlug: "epicgames",
    domain: "epicgames.com",
    description:
      "Epic Games' published icon gray is #313131. Black, white, and the lighter grays are contrast pairs for layouts, not extra logo inks.",
    websiteUrl: "https://www.epicgames.com",
    metaTitle: "Epic Games Hex Color #313131",
    metaDescription:
      "Epic Games logo hex #313131 with neutral layout swatches marked unverified. Copy the published gray for the mark.",
    related: ["riot-games", "rockstar-games", "ubisoft"],
  },
  {
    name: "Riot Games",
    slug: "riot-games",
    category: "Gaming",
    primaryColor: "#EB0029",
    palette: [s("#EB0029", true), s("#111111"), s("#FFFFFF"), s("#1F1F1F"), s("#F4F4F4")],
    logoProvider: "simple-icons",
    simpleIconSlug: "riotgames",
    domain: "riotgames.com",
    description:
      "Riot's published fist red is #EB0029. The charcoal and paper colors are unverified surfaces so the red is not used as body text by accident.",
    websiteUrl: "https://www.riotgames.com",
    metaTitle: "Riot Games Hex Color #EB0029",
    metaDescription:
      "Riot Games brand hex #EB0029. Supporting blacks and whites are unverified layout colors. Copy the verified red.",
    related: ["valorant", "league-of-legends", "epic-games"],
  },
  {
    name: "Roblox",
    slug: "roblox",
    category: "Gaming",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#E2231A"), s("#00A2FF"), s("#393B3D")],
    logoProvider: "simple-icons",
    simpleIconSlug: "roblox",
    domain: "roblox.com",
    description:
      "The current Roblox icon record is black. Older red and blue logo memories are included only as unverified historical swatches.",
    websiteUrl: "https://www.roblox.com",
    metaTitle: "Roblox Logo Hex Color #000000",
    metaDescription:
      "Roblox logo hex #000000. Red and blue on this page are unverified legacy guesses, separate from BrickColor codes.",
    related: ["epic-games", "electronic-arts", "ubisoft"],
  },
  {
    name: "Electronic Arts",
    slug: "electronic-arts",
    category: "Gaming",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#FF4747"), s("#1A1A1A"), s("#F5F5F5")],
    logoProvider: "simple-icons",
    simpleIconSlug: "ea",
    domain: "ea.com",
    description:
      "EA's published mark is black. The red swatch is an unverified accent and should not be described as the official EA logo color.",
    websiteUrl: "https://www.ea.com",
    metaTitle: "EA Hex Color #000000",
    metaDescription:
      "Electronic Arts logo hex #000000. Extra red and gray swatches are unverified. Copy the black wordmark color.",
    related: ["ubisoft", "epic-games", "rockstar-games"],
  },
  {
    name: "Ubisoft",
    slug: "ubisoft",
    category: "Gaming",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#0086F9"), s("#111111"), s("#E5E5E5")],
    logoProvider: "simple-icons",
    simpleIconSlug: "ubisoft",
    domain: "ubisoft.com",
    description:
      "Ubisoft's icon record is black. The blue swirl approximation is unverified and is not a substitute for Ubisoft's brand guidelines.",
    websiteUrl: "https://www.ubisoft.com",
    metaTitle: "Ubisoft Hex Color #000000",
    metaDescription:
      "Ubisoft logo hex #000000 with an unverified blue estimate. Copy the published black mark color.",
    related: ["electronic-arts", "epic-games", "riot-games"],
  },
  {
    name: "Rockstar Games",
    slug: "rockstar-games",
    category: "Gaming",
    primaryColor: "#FCAF17",
    palette: [s("#FCAF17", true), s("#000000"), s("#FFFFFF"), s("#1A1A1A"), s("#FFF4D6")],
    logoProvider: "simple-icons",
    simpleIconSlug: "rockstargames",
    domain: "rockstargames.com",
    description:
      "Rockstar's published yellow is #FCAF17. Black and cream around it are unverified layout colors for posters and UI frames.",
    websiteUrl: "https://www.rockstargames.com",
    metaTitle: "Rockstar Games Hex Color #FCAF17",
    metaDescription:
      "Rockstar Games logo hex #FCAF17. Black and cream swatches are unverified. Copy the verified yellow.",
    related: ["epic-games", "electronic-arts", "riot-games"],
  },
  {
    name: "Valorant",
    slug: "valorant",
    category: "Gaming",
    primaryColor: "#FA4454",
    palette: [s("#FA4454", true), s("#0F1923"), s("#FFFFFF"), s("#ECE8E1"), s("#111111")],
    logoProvider: "simple-icons",
    simpleIconSlug: "valorant",
    domain: "playvalorant.com",
    description:
      "Valorant's published red is #FA4454. The dark navy and bone colors are common in the game UI but are marked unverified on this page.",
    websiteUrl: "https://playvalorant.com",
    metaTitle: "Valorant Hex Color #FA4454",
    metaDescription:
      "Valorant logo hex #FA4454 with unverified navy and bone UI colors. Copy the verified red for the mark.",
    related: ["riot-games", "league-of-legends", "epic-games"],
  },
  {
    name: "League of Legends",
    slug: "league-of-legends",
    category: "Gaming",
    primaryColor: "#C28F2C",
    palette: [s("#C28F2C", true), s("#010A13"), s("#FFFFFF"), s("#091428"), s("#C8AA6E")],
    logoProvider: "simple-icons",
    simpleIconSlug: "leagueoflegends",
    domain: "leagueoflegends.com",
    description:
      "The League of Legends icon gold is #C28F2C. The extra gold and night-blue swatches are unverified client colors, not a second official logo ink.",
    websiteUrl: "https://www.leagueoflegends.com",
    metaTitle: "League of Legends Hex Color #C28F2C",
    metaDescription:
      "League of Legends logo hex #C28F2C. Night blue and the second gold are unverified. Copy the published gold.",
    related: ["riot-games", "valorant", "epic-games"],
  },
  {
    name: "Paytm",
    slug: "paytm",
    category: "Indian brands",
    primaryColor: "#20336B",
    palette: [s("#20336B", true), s("#00BAF2"), s("#FFFFFF"), s("#002970"), s("#E5F6FD")],
    logoProvider: "simple-icons",
    simpleIconSlug: "paytm",
    domain: "paytm.com",
    description:
      "Paytm's Simple Icons record uses navy #20336B. The brighter app blue is included as an unverified companion because public pages disagree on which blue is primary.",
    websiteUrl: "https://paytm.com",
    metaTitle: "Paytm Hex Color #20336B",
    metaDescription:
      "Paytm brand hex #20336B from the published icon record. The brighter blue is unverified. Copy the navy before using it in UI.",
    related: ["phonepe", "razorpay", "hdfc-bank"],
  },
  {
    name: "PhonePe",
    slug: "phonepe",
    category: "Indian brands",
    primaryColor: "#5F259F",
    palette: [s("#5F259F", true), s("#FFFFFF"), s("#2D0A4E"), s("#F3E8FF"), s("#111111")],
    logoProvider: "simple-icons",
    simpleIconSlug: "phonepe",
    domain: "phonepe.com",
    description:
      "PhonePe's published purple is #5F259F. Deep purple and lilac are unverified tints for cards and empty states.",
    websiteUrl: "https://www.phonepe.com",
    metaTitle: "PhonePe Hex Color #5F259F",
    metaDescription:
      "PhonePe logo hex #5F259F with unverified purple tints. Copy the verified purple for payment references.",
    related: ["paytm", "razorpay", "zerodha"],
  },
  {
    name: "Jio",
    slug: "jio",
    category: "Indian brands",
    primaryColor: "#0A2885",
    palette: [s("#0A2885", true), s("#FFFFFF"), s("#E31D1A"), s("#061A4D"), s("#E8EEF8")],
    logoProvider: "simple-icons",
    simpleIconSlug: "jio",
    domain: "jio.com",
    description:
      "Jio's logo blue on jio.com is #0A2885. The red swoosh approximation and pale blue are unverified and are not a full brand guideline.",
    websiteUrl: "https://www.jio.com",
    metaTitle: "Jio Hex Color #0A2885",
    metaDescription:
      "Jio logo blue #0A2885. Red and pale blue swatches are unverified estimates. Copy the blue for telecom references.",
    related: ["airtel", "paytm", "hdfc-bank"],
  },
  {
    name: "Razorpay",
    slug: "razorpay",
    category: "Indian brands",
    primaryColor: "#0C2451",
    palette: [s("#0C2451", true), s("#3395FF"), s("#FFFFFF"), s("#07244A"), s("#E7F1FF")],
    logoProvider: "simple-icons",
    simpleIconSlug: "razorpay",
    domain: "razorpay.com",
    description:
      "Razorpay's published icon navy is #0C2451. The brighter product blue is a common dashboard color and is labeled unverified.",
    websiteUrl: "https://razorpay.com",
    metaTitle: "Razorpay Hex Color #0C2451",
    metaDescription:
      "Razorpay brand hex #0C2451. The bright blue is unverified. Copy the navy logo color for payment docs.",
    related: ["paytm", "phonepe", "zerodha"],
  },
  {
    name: "Zerodha",
    slug: "zerodha",
    category: "Indian brands",
    primaryColor: "#387ED1",
    palette: [s("#387ED1", true), s("#FFFFFF"), s("#1B1B1B"), s("#E8F1FB"), s("#0D3B66")],
    logoProvider: "simple-icons",
    simpleIconSlug: "zerodha",
    domain: "zerodha.com",
    description:
      "Zerodha's published kite blue is #387ED1. Ink and pale blue are unverified surfaces for article layouts.",
    websiteUrl: "https://zerodha.com",
    metaTitle: "Zerodha Hex Color #387ED1",
    metaDescription:
      "Zerodha logo hex #387ED1 with unverified ink and pale blue. Copy the verified kite blue.",
    related: ["razorpay", "hdfc-bank", "phonepe"],
  },
  {
    name: "Airtel",
    slug: "airtel",
    category: "Indian brands",
    primaryColor: "#E40000",
    palette: [s("#E40000", true), s("#FFFFFF"), s("#1A1A1A"), s("#FFD6D6"), s("#9B0000")],
    logoProvider: "simple-icons",
    simpleIconSlug: "airtel",
    domain: "airtel.in",
    description:
      "Airtel's published red is #E40000. The darker red and pink tint are unverified and should not be called official logo variants.",
    websiteUrl: "https://www.airtel.in",
    metaTitle: "Airtel Hex Color #E40000",
    metaDescription:
      "Airtel brand hex #E40000. Darker red and pink are unverified. Copy the published red for the mark.",
    related: ["jio", "paytm", "hdfc-bank"],
  },
  {
    name: "HDFC Bank",
    slug: "hdfc-bank",
    category: "Indian brands",
    primaryColor: "#004B8D",
    palette: [s("#004B8D", true), s("#ED1C24"), s("#FFFFFF"), s("#002F5F"), s("#E6F0F7")],
    logoProvider: "simple-icons",
    simpleIconSlug: "hdfcbank",
    domain: "hdfcbank.com",
    description:
      "HDFC Bank's published blue is #004B8D. The red in the logo lockup is shown as unverified here because this page does not reproduce the full guideline spacing or wording.",
    websiteUrl: "https://www.hdfcbank.com",
    metaTitle: "HDFC Bank Hex Color #004B8D",
    metaDescription:
      "HDFC Bank blue #004B8D. The red swatch is unverified on this page. Copy the published blue for references.",
    related: ["airtel", "razorpay", "zerodha"],
  },
  {
    name: "Flipkart",
    slug: "flipkart",
    category: "Indian brands",
    primaryColor: "#2874F0",
    palette: [s("#2874F0", true), s("#FFFFFF"), s("#FFE11B"), s("#172337"), s("#E8F0FE")],
    logoProvider: "google-favicon",
    domain: "flipkart.com",
    description:
      "Flipkart blue #2874F0 is the color stored in the Simple Icons dataset. The current CDN no longer serves that icon, so the logo uses Flipkart's favicon instead of a substitute mark. Yellow is unverified.",
    websiteUrl: "https://www.flipkart.com",
    metaTitle: "Flipkart Hex Color #2874F0",
    metaDescription:
      "Flipkart blue #2874F0 with an unverified yellow. The logo is the site favicon because Simple Icons no longer hosts the mark.",
    related: ["myntra", "bigbasket", "makemytrip"],
  },
  {
    name: "Expedia",
    slug: "expedia",
    category: "Shopping, travel & delivery",
    primaryColor: "#191E3B",
    palette: [s("#191E3B", true), s("#F7C31A"), s("#FFFFFF"), s("#0D0D0D"), s("#FFF6D8")],
    logoProvider: "simple-icons",
    simpleIconSlug: "expedia",
    domain: "expedia.com",
    description:
      "Expedia's published icon navy is #191E3B. The yellow plane color is a familiar logo accent and is labeled unverified so it is not treated as a second official hex without the guideline.",
    websiteUrl: "https://www.expedia.com",
    metaTitle: "Expedia Hex Color #191E3B",
    metaDescription:
      "Expedia brand hex #191E3B. Yellow is unverified. Copy the published navy for travel references.",
    related: ["makemytrip", "myntra", "aliexpress"],
  },
  {
    name: "eBay",
    slug: "ebay",
    category: "Shopping, travel & delivery",
    primaryColor: "#E53238",
    palette: [s("#E53238", true), s("#0064D2", true), s("#F5AF02", true), s("#86B817", true), s("#FFFFFF")],
    logoProvider: "simple-icons",
    simpleIconSlug: "ebay",
    domain: "ebay.com",
    description:
      "eBay's wordmark is four letters: red #E53238, blue #0064D2, yellow #F5AF02, and green #86B817. White is only a page background and is unverified as a logo ink.",
    websiteUrl: "https://www.ebay.com",
    metaTitle: "eBay Logo Hex Colors",
    metaDescription:
      "eBay logo hex colors #E53238, #0064D2, #F5AF02, and #86B817. Copy each letter color. White is an unverified backdrop.",
    related: ["etsy", "aliexpress", "flipkart"],
  },
  {
    name: "Etsy",
    slug: "etsy",
    category: "Shopping, travel & delivery",
    primaryColor: "#F16521",
    palette: [s("#F16521", true), s("#222222"), s("#FFFFFF"), s("#D35400"), s("#FFF1E8")],
    logoProvider: "simple-icons",
    simpleIconSlug: "etsy",
    domain: "etsy.com",
    description:
      "Etsy's published orange is #F16521. Charcoal and the deeper orange are unverified stand-ins for body text and pressed states.",
    websiteUrl: "https://www.etsy.com",
    metaTitle: "Etsy Hex Color #F16521",
    metaDescription:
      "Etsy logo hex #F16521. Charcoal and deep orange are unverified. Copy the published orange.",
    related: ["ebay", "aliexpress", "myntra"],
  },
  {
    name: "AliExpress",
    slug: "aliexpress",
    category: "Shopping, travel & delivery",
    primaryColor: "#FF4747",
    palette: [s("#FF4747", true), s("#000000"), s("#FFFFFF"), s("#E62E04"), s("#FFF0ED")],
    logoProvider: "simple-icons",
    simpleIconSlug: "aliexpress",
    domain: "aliexpress.com",
    description:
      "AliExpress's published red is #FF4747. The deeper red and blush are unverified and are not additional logo colors.",
    websiteUrl: "https://www.aliexpress.com",
    metaTitle: "AliExpress Hex Color #FF4747",
    metaDescription:
      "AliExpress logo hex #FF4747 with unverified deeper red and blush. Copy the verified red.",
    related: ["ebay", "etsy", "flipkart"],
  },
  {
    name: "BigBasket",
    slug: "bigbasket",
    category: "Shopping, travel & delivery",
    primaryColor: "#A5CD39",
    palette: [s("#A5CD39", true), s("#FFFFFF"), s("#1A1A1A"), s("#689F38"), s("#F4FBE6")],
    logoProvider: "simple-icons",
    simpleIconSlug: "bigbasket",
    domain: "bigbasket.com",
    description:
      "BigBasket's published green is #A5CD39. The darker leaf green and pale wash are unverified UI estimates.",
    websiteUrl: "https://www.bigbasket.com",
    metaTitle: "BigBasket Hex Color #A5CD39",
    metaDescription:
      "BigBasket logo hex #A5CD39. Darker green is unverified. Copy the published grocery green.",
    related: ["blinkit", "flipkart", "myntra"],
  },
  {
    name: "Myntra",
    slug: "myntra",
    category: "Shopping, travel & delivery",
    primaryColor: "#FF3F6C",
    palette: [s("#FF3F6C", true), s("#282C3F"), s("#FFFFFF"), s("#000000"), s("#FFF0F3")],
    logoProvider: "google-favicon",
    domain: "myntra.com",
    description:
      "Myntra's storefront pink is #FF3F6C. Simple Icons does not host this mark, so the logo is the Myntra favicon. Navy is an unverified header color.",
    websiteUrl: "https://www.myntra.com",
    metaTitle: "Myntra Hex Color #FF3F6C",
    metaDescription:
      "Myntra pink #FF3F6C with an unverified navy. The logo is the official favicon, not a lookalike icon.",
    related: ["flipkart", "etsy", "bigbasket"],
  },
  {
    name: "MakeMyTrip",
    slug: "makemytrip",
    category: "Shopping, travel & delivery",
    primaryColor: "#E11931",
    palette: [s("#E11931"), s("#008CFF"), s("#FFFFFF"), s("#111111"), s("#FFF1F2")],
    logoProvider: "google-favicon",
    domain: "makemytrip.com",
    description:
      "MakeMyTrip is not on Simple Icons. Red #E11931 and blue #008CFF are both unverified estimates of the public logo, and the image is the site favicon rather than a drawn substitute.",
    websiteUrl: "https://www.makemytrip.com",
    metaTitle: "MakeMyTrip Hex Colors (Unverified)",
    metaDescription:
      "MakeMyTrip reference red #E11931 and blue #008CFF are unverified estimates. The logo is the site favicon. Confirm before print.",
    related: ["expedia", "flipkart", "myntra"],
  },
  {
    name: "Blinkit",
    slug: "blinkit",
    category: "Shopping, travel & delivery",
    primaryColor: "#F8CB46",
    palette: [s("#F8CB46"), s("#000000"), s("#FFFFFF"), s("#1C1C1C"), s("#FFF6D6")],
    logoProvider: "google-favicon",
    domain: "blinkit.com",
    description:
      "Blinkit is not in Simple Icons. Yellow #F8CB46 is an unverified estimate of the storefront mark, and the logo image is Blinkit's favicon.",
    websiteUrl: "https://blinkit.com",
    metaTitle: "Blinkit Hex Color #F8CB46 (Unverified)",
    metaDescription:
      "Blinkit yellow #F8CB46 is an unverified estimate. The logo is the Blinkit favicon. Copy it only as a reference swatch.",
    related: ["bigbasket", "flipkart", "myntra"],
  },
  {
    name: "The New York Times",
    slug: "new-york-times",
    category: "Global business & media",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#326891"), s("#111111"), s("#F7F7F7")],
    logoProvider: "simple-icons",
    simpleIconSlug: "newyorktimes",
    domain: "nytimes.com",
    description:
      "The New York Times blackletter record is black. The site blue is a familiar link color and is marked unverified so it is not described as the masthead ink.",
    websiteUrl: "https://www.nytimes.com",
    metaTitle: "New York Times Hex Color #000000",
    metaDescription:
      "New York Times masthead hex #000000. The blue swatch is unverified. Copy the black for the wordmark.",
    related: ["bbc", "reuters", "bloomberg"],
  },
  {
    name: "Unilever",
    slug: "unilever",
    category: "Global business & media",
    primaryColor: "#1F36C7",
    palette: [s("#1F36C7", true), s("#FFFFFF"), s("#000000"), s("#E8EBFA"), s("#0E1A66")],
    logoProvider: "simple-icons",
    simpleIconSlug: "unilever",
    domain: "unilever.com",
    description:
      "Unilever's published U blue is #1F36C7. Pale and deep blues are unverified tints for diagrams, not extra logo colors.",
    websiteUrl: "https://www.unilever.com",
    metaTitle: "Unilever Hex Color #1F36C7",
    metaDescription:
      "Unilever logo hex #1F36C7. Lighter and darker blues are unverified. Copy the published blue.",
    related: ["nestle", "goldman-sachs", "forbes"],
  },
  {
    name: "Goldman Sachs",
    slug: "goldman-sachs",
    category: "Global business & media",
    primaryColor: "#7399C6",
    palette: [s("#7399C6", true), s("#000000"), s("#FFFFFF"), s("#1A1A1A"), s("#E6EEF5")],
    logoProvider: "simple-icons",
    simpleIconSlug: "goldmansachs",
    domain: "goldmansachs.com",
    description:
      "Goldman Sachs' published blue-gray is #7399C6. Black and pale blue are unverified document colors.",
    websiteUrl: "https://www.goldmansachs.com",
    metaTitle: "Goldman Sachs Hex Color #7399C6",
    metaDescription:
      "Goldman Sachs logo hex #7399C6. Black and pale blue are unverified. Copy the published blue-gray.",
    related: ["bloomberg", "forbes", "unilever"],
  },
  {
    name: "BBC",
    slug: "bbc",
    category: "Global business & media",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#BB1919"), s("#222222"), s("#F5F5F5")],
    logoProvider: "google-favicon",
    domain: "bbc.com",
    description:
      "The BBC blocks are black. Simple Icons does not currently serve this slug, so the logo is the BBC favicon. #BB1919 is the familiar news red and is marked unverified.",
    websiteUrl: "https://www.bbc.com",
    metaTitle: "BBC Hex Color #000000",
    metaDescription:
      "BBC blocks hex #000000. News red #BB1919 is unverified here. The logo is the BBC favicon, not a redrawn mark.",
    related: ["reuters", "bloomberg", "new-york-times"],
  },
  {
    name: "Bloomberg",
    slug: "bloomberg",
    category: "Global business & media",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#2800D7"), s("#111111"), s("#E5E5E5")],
    logoProvider: "google-favicon",
    domain: "bloomberg.com",
    description:
      "Bloomberg's wordmark is black. The logo is the site favicon because Simple Icons has no current slug. Purple is an unverified accent, not a confirmed guideline color.",
    websiteUrl: "https://www.bloomberg.com",
    metaTitle: "Bloomberg Hex Color #000000",
    metaDescription:
      "Bloomberg wordmark hex #000000. Purple is unverified. The logo is the Bloomberg favicon.",
    related: ["reuters", "goldman-sachs", "bbc"],
  },
  {
    name: "Reuters",
    slug: "reuters",
    category: "Global business & media",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FF8000"), s("#FFFFFF"), s("#1A1A1A"), s("#FFF3E6")],
    logoProvider: "google-favicon",
    domain: "reuters.com",
    description:
      "Reuters' current wordmark is black, shown here with the site favicon. Orange #FF8000 is a historical accent and is unverified for the current lockup.",
    websiteUrl: "https://www.reuters.com",
    metaTitle: "Reuters Hex Color #000000",
    metaDescription:
      "Reuters wordmark hex #000000. Orange #FF8000 is an unverified historical accent. The logo is the Reuters favicon.",
    related: ["bbc", "bloomberg", "new-york-times"],
  },
  {
    name: "Nestlé",
    slug: "nestle",
    category: "Global business & media",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#C8102E"), s("#1A1A1A"), s("#F5F5F5")],
    logoProvider: "google-favicon",
    domain: "nestle.com",
    description:
      "Nestlé is not in the current Simple Icons CDN, so this page uses the nestle.com favicon. The wordmark black is the primary reference and the red is unverified.",
    websiteUrl: "https://www.nestle.com",
    metaTitle: "Nestlé Hex Color #000000",
    metaDescription:
      "Nestlé wordmark hex #000000. Red is unverified. The logo is the Nestlé favicon rather than a substitute icon.",
    related: ["unilever", "forbes", "goldman-sachs"],
  },
  {
    name: "Forbes",
    slug: "forbes",
    category: "Global business & media",
    primaryColor: "#000000",
    palette: [s("#000000", true), s("#FFFFFF"), s("#111111"), s("#F2F2F2"), s("#666666")],
    logoProvider: "google-favicon",
    domain: "forbes.com",
    description:
      "Forbes' masthead is black. Simple Icons does not serve this slug, so the logo is the Forbes favicon. Grays are unverified text colors.",
    websiteUrl: "https://www.forbes.com",
    metaTitle: "Forbes Hex Color #000000",
    metaDescription:
      "Forbes masthead hex #000000. Gray swatches are unverified. The logo is the Forbes favicon.",
    related: ["bloomberg", "goldman-sachs", "new-york-times"],
  },
];

function normalizeHex(value: string) {
  return value.trim().toUpperCase();
}

function logoUrlFor(brand: SeedBrand) {
  if (brand.logoProvider === "simple-icons") {
    const hex = normalizeHex(brand.primaryColor).slice(1);
    return `https://cdn.simpleicons.org/${brand.simpleIconSlug}/${hex}`;
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand.domain)}&sz=128`;
}

function readExistingSlugs() {
  const slugs = new Set<string>();
  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, "utf8");
    if (file.endsWith("imported-brands.ts")) {
      for (const match of source.matchAll(/slug: "([^"]+)"/g)) slugs.add(match[1]);
      continue;
    }
    if (file.endsWith(`${path.sep}brands.ts`)) {
      const withoutSpread = source.split("...FOOTBALL_BRANDS")[0] ?? source;
      for (const match of withoutSpread.matchAll(/slug: "([^"]+)"/g)) slugs.add(match[1]);
      continue;
    }
    for (const match of source.matchAll(/slug: "([^"]+)"/g)) slugs.add(match[1]);
  }
  return slugs;
}

function validate(brand: SeedBrand, seen: Set<string>): string | null {
  if (!brand.slug || seen.has(brand.slug)) return "duplicate slug in the seed list";
  seen.add(brand.slug);
  if (!/^https:\/\/[^\s]+$/i.test(brand.websiteUrl)) return "websiteUrl must be an https URL";
  try {
    const host = new URL(brand.websiteUrl).hostname.replace(/^www\./, "");
    if (host !== brand.domain) return "websiteUrl host does not match domain";
  } catch {
    return "websiteUrl is not a valid URL";
  }
  const primary = normalizeHex(brand.primaryColor);
  if (!HEX.test(primary)) return "primaryColor is not a 6-digit HEX color";
  if (brand.palette.length < 5 || brand.palette.length > 8) return "palette must contain 5 to 8 colors";
  const hexes = new Set<string>();
  for (const swatch of brand.palette) {
    const hex = normalizeHex(swatch.hex);
    if (!HEX.test(hex)) return `invalid HEX ${swatch.hex}`;
    if (hexes.has(hex)) return `duplicate HEX ${hex}`;
    hexes.add(hex);
  }
  if (!hexes.has(primary)) return "primaryColor is missing from palette";
  if (!brand.description.trim() || !brand.metaTitle.trim() || !brand.metaDescription.trim()) {
    return "description and meta fields are required";
  }
  if (brand.metaDescription.length > 170) return "metaDescription is longer than 170 characters";
  const logo = logoUrlFor(brand);
  if (brand.logoProvider === "simple-icons") {
    if (!brand.simpleIconSlug || !/^[a-z0-9]+$/.test(brand.simpleIconSlug)) {
      return "simple icons slug is missing or not a verified lowercase slug";
    }
    const expected = `https://cdn.simpleicons.org/${brand.simpleIconSlug}/${primary.slice(1)}`;
    if (logo !== expected) return "logo URL does not match the Simple Icons CDN";
  } else if (!logo.startsWith("https://www.google.com/s2/favicons?domain=")) {
    return "favicon fallback URL is invalid";
  }
  return null;
}

function toCatalog(brand: SeedBrand): CatalogBrand {
  const primary = normalizeHex(brand.primaryColor);
  const ordered = brand.palette.map((swatch) => ({ ...swatch, hex: normalizeHex(swatch.hex) }));
  const rest = ordered.filter((swatch) => swatch.hex !== primary);
  return {
    slug: brand.slug,
    name: brand.name,
    overview: brand.description,
    category: brand.category,
    primary: [primary],
    secondary: rest.map((swatch) => swatch.hex),
    related: brand.related.filter((slug) => slug !== brand.slug),
    websiteUrl: brand.websiteUrl,
    metaTitle: brand.metaTitle,
    metaDescription: brand.metaDescription,
    logoUrl: logoUrlFor(brand),
    logoProvider: brand.logoProvider,
    unverified: ordered.filter((swatch) => !swatch.verified).map((swatch) => swatch.hex),
  };
}

function emit(records: CatalogBrand[]) {
  return `import type { BrandPalette } from "@/lib/data/brands";

/** Generated by scripts/seed-brands.ts. Do not edit by hand. */
export const IMPORTED_BRANDS = ${JSON.stringify(records, null, 2)} as BrandPalette[];
`;
}

function main() {
  const apply = process.argv.includes("--apply");
  const update = process.argv.includes("--update");
  const existing = readExistingSlugs();
  const seen = new Set<string>();
  const summary: Record<RowStatus, string[]> = {
    inserted: [],
    skipped: [],
    updated: [],
    failed: [],
  };
  const writable: CatalogBrand[] = [];

  if (SEED_BRANDS.length !== 40) {
    console.error(`Expected 40 seed brands, found ${SEED_BRANDS.length}.`);
    process.exit(1);
  }

  for (const brand of SEED_BRANDS) {
    const error = validate(brand, seen);
    if (error) {
      summary.failed.push(`${brand.slug || brand.name}: ${error}`);
      continue;
    }
    const already = existing.has(brand.slug);
    if (already && !update) {
      summary.skipped.push(`${brand.slug}: already in the catalog`);
      continue;
    }
    if (already && update) {
      const protectedFile = existingFromCore(brand.slug);
      if (protectedFile) {
        summary.failed.push(`${brand.slug}: exists in ${protectedFile} and will not be overwritten`);
        continue;
      }
      summary.updated.push(brand.slug);
    } else {
      summary.inserted.push(brand.slug);
    }
    writable.push(toCatalog(brand));
  }

  const mode = apply ? (update ? "apply --update" : "apply") : "dry-run";
  console.log(`Brand import ${mode}`);
  console.log(`inserted: ${summary.inserted.length}`);
  console.log(`skipped: ${summary.skipped.length}`);
  console.log(`updated: ${summary.updated.length}`);
  console.log(`failed: ${summary.failed.length}`);
  for (const status of ["inserted", "skipped", "updated", "failed"] as const) {
    for (const line of summary[status]) console.log(`  ${status}  ${line}`);
  }

  if (summary.failed.length > 0) {
    console.error("Import stopped because one or more records failed validation.");
    process.exit(1);
  }

  if (!apply) {
    console.log("Dry run only. No files were written.");
    return;
  }

  if (writable.length === 0) {
    console.log("Nothing to write.");
    return;
  }

  const merged = new Map(readImported().map((row) => [row.slug, row]));
  for (const row of writable) merged.set(row.slug, row);
  const payload = emit([...merged.values()]);
  const temp = `${OUT_FILE}.tmp`;
  fs.writeFileSync(temp, payload);
  fs.renameSync(temp, OUT_FILE);
  console.log(`Wrote ${path.relative(ROOT, OUT_FILE)} (${merged.size} brands).`);
}

function existingFromCore(slug: string) {
  for (const file of SOURCE_FILES) {
    if (file === OUT_FILE || !fs.existsSync(file)) continue;
    const source = file.endsWith(`${path.sep}brands.ts`)
      ? (fs.readFileSync(file, "utf8").split("...FOOTBALL_BRANDS")[0] ?? "")
      : fs.readFileSync(file, "utf8");
    if (source.includes(`slug: "${slug}"`)) return path.basename(file);
  }
  return null;
}

function readImported(): CatalogBrand[] {
  if (!fs.existsSync(OUT_FILE)) return [];
  const source = fs.readFileSync(OUT_FILE, "utf8");
  const match = source.match(/export const IMPORTED_BRANDS = (\[[\s\S]*\]) as BrandPalette\[\]/);
  if (!match) return [];
  return JSON.parse(match[1]) as CatalogBrand[];
}

main();
