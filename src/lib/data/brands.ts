import { FOOTBALL_BRANDS } from "@/lib/data/football-brands";
import { FOOD_BRANDS } from "@/lib/data/food-brands";
import { normalizeHex } from "@/lib/colors/convert";

export interface BrandPalette {
  slug: string;
  name: string;
  overview: string;
  category: string;
  primary: string[];
  secondary: string[];
  related: string[];
}

export const BRANDS: BrandPalette[] = [
  { slug: "meta", name: "Meta", overview: "Meta's brand identity spans Facebook, Instagram, WhatsApp and Reality Labs with bold blues and gradients.", category: "Social", primary: ["#0668E1", "#FFFFFF"], secondary: ["#F5F6F7", "#1C1E21"], related: ["facebook", "instagram", "whatsapp"] },
  { slug: "facebook", name: "Facebook", overview: "Facebook's iconic blue communicates trust and connection across the social network.", category: "Social", primary: ["#1877F2", "#FFFFFF"], secondary: ["#42B72A", "#F02849", "#000000"], related: ["meta", "messenger", "instagram"] },
  { slug: "instagram", name: "Instagram", overview: "Instagram's gradient palette evokes creativity, youth, and visual storytelling.", category: "Social", primary: ["#E1306C", "#F77737", "#FCAF45", "#833AB4"], secondary: ["#405DE6", "#C13584", "#FFFFFF"], related: ["meta", "threads", "tiktok"] },
  { slug: "threads", name: "Threads", overview: "Threads uses a minimal black-and-white system aligned with Instagram's text-first app.", category: "Social", primary: ["#000000", "#FFFFFF"], secondary: ["#8E8E8E", "#F5F5F5"], related: ["instagram", "meta", "x-twitter"] },
  { slug: "whatsapp", name: "WhatsApp", overview: "WhatsApp green signals messaging, reliability, and global communication.", category: "Social", primary: ["#25D366", "#128C7E", "#075E54"], secondary: ["#DCF8C6", "#FFFFFF", "#34B7F1"], related: ["meta", "messenger", "telegram"] },
  { slug: "messenger", name: "Messenger", overview: "Messenger's gradient blue brand is built for friendly, instant conversations.", category: "Social", primary: ["#006AFF", "#00C6FF"], secondary: ["#FFFFFF", "#F0F2F5"], related: ["facebook", "meta", "whatsapp"] },
  { slug: "x-twitter", name: "X (Twitter)", overview: "X uses stark black-and-white branding with occasional sky accents from its Twitter heritage.", category: "Social", primary: ["#000000", "#FFFFFF"], secondary: ["#1D9BF0", "#536471", "#E7E9EA"], related: ["threads", "bluesky", "linkedin"] },
  { slug: "youtube", name: "YouTube", overview: "YouTube red is one of the most recognized media brand colors in the world.", category: "Media", primary: ["#FF0000", "#282828"], secondary: ["#FFFFFF", "#0F0F0F", "#AAAAAA"], related: ["google", "netflix", "tiktok"] },
  { slug: "google", name: "Google", overview: "Google's four-color palette is synonymous with search, products, and Material Design roots.", category: "Tech", primary: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"], secondary: ["#FFFFFF", "#F8F9FA"], related: ["chrome", "gmail", "android"] },
  { slug: "chrome", name: "Chrome", overview: "Chrome mirrors Google's multi-color mark with a circular, product-forward identity.", category: "Tech", primary: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"], secondary: ["#FFFFFF"], related: ["google", "android", "safari"] },
  { slug: "android", name: "Android", overview: "Android green represents openness and the mobile ecosystem.", category: "Tech", primary: ["#3DDC84", "#073042"], secondary: ["#FFFFFF", "#00A3E0"], related: ["google", "samsung", "oneplus"] },
  { slug: "gmail", name: "Gmail", overview: "Gmail's red envelope mark is a staple of Google's communication suite.", category: "Tech", primary: ["#EA4335", "#FFFFFF"], secondary: ["#FBBC04", "#34A853", "#4285F4"], related: ["google", "outlook", "yahoo"] },
  { slug: "google-maps", name: "Google Maps", overview: "Google Maps combines greens, blues, and pin red for navigation clarity.", category: "Tech", primary: ["#34A853", "#4285F4", "#EA4335"], secondary: ["#FBBC05", "#FFFFFF"], related: ["google", "uber", "apple"] },
  { slug: "microsoft", name: "Microsoft", overview: "Microsoft's four-square palette spans productivity, cloud, and consumer products.", category: "Tech", primary: ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"], secondary: ["#737373", "#FFFFFF"], related: ["windows", "xbox", "linkedin"] },
  { slug: "windows", name: "Windows", overview: "Windows blue conveys productivity and the modern desktop experience.", category: "Tech", primary: ["#0078D4", "#00BCF2"], secondary: ["#FFFFFF", "#00188F"], related: ["microsoft", "xbox", "surface"] },
  { slug: "xbox", name: "Xbox", overview: "Xbox green is iconic in gaming hardware and Game Pass branding.", category: "Gaming", primary: ["#107C10", "#9BF00B"], secondary: ["#000000", "#FFFFFF"], related: ["microsoft", "playstation", "steam"] },
  { slug: "linkedin", name: "LinkedIn", overview: "LinkedIn blue represents professional networking and B2B trust.", category: "Social", primary: ["#0A66C2", "#FFFFFF"], secondary: ["#004182", "#70B5F9"], related: ["microsoft", "x-twitter", "indeed"] },
  { slug: "pinterest", name: "Pinterest", overview: "Pinterest red supports discovery, inspiration, and visual bookmarking.", category: "Social", primary: ["#E60023", "#FFFFFF"], secondary: ["#111111", "#EFEFEF"], related: ["instagram", "canva", "etsy"] },
  { slug: "tiktok", name: "TikTok", overview: "TikTok's cyan-magenta duo creates a glitch-inspired, youthful brand.", category: "Social", primary: ["#000000", "#FE2C55", "#25F4EE"], secondary: ["#FFFFFF"], related: ["instagram", "youtube", "snapchat"] },
  { slug: "spotify", name: "Spotify", overview: "Spotify green is synonymous with music streaming and audio culture.", category: "Media", primary: ["#1DB954", "#191414"], secondary: ["#FFFFFF", "#B3B3B3"], related: ["apple", "youtube", "soundcloud"] },
  { slug: "netflix", name: "Netflix", overview: "Netflix red and near-black create cinematic contrast for entertainment.", category: "Media", primary: ["#E50914", "#221F1F"], secondary: ["#F5F5F1", "#564D4D"], related: ["disney-plus", "prime-video", "youtube"] },
  { slug: "prime-video", name: "Prime Video", overview: "Prime Video borrows Amazon's smile blue with dark cinematic UI tones.", category: "Media", primary: ["#00A8E1", "#0F171E"], secondary: ["#FFFFFF", "#1A242F"], related: ["amazon", "netflix", "disney-plus"] },
  { slug: "disney-plus", name: "Disney+", overview: "Disney+ uses deep blue skies and soft whites for family streaming.", category: "Media", primary: ["#113CCF", "#FFFFFF"], secondary: ["#1A1D29", "#8E99F0"], related: ["netflix", "prime-video", "apple"] },
  { slug: "apple", name: "Apple", overview: "Apple's minimal black, white, and product-color language emphasizes premium simplicity.", category: "Tech", primary: ["#000000", "#A2AAAD", "#FFFFFF"], secondary: ["#0071E3", "#BF4800"], related: ["ios", "macos", "safari"] },
  { slug: "ios", name: "iOS", overview: "iOS system colors are vibrant, accessible accents for Apple platforms.", category: "Tech", primary: ["#007AFF", "#34C759", "#FF3B30"], secondary: ["#5856D6", "#FF9500", "#AF52DE"], related: ["apple", "macos", "safari"] },
  { slug: "macos", name: "macOS", overview: "macOS branding blends soft system blues with light interface surfaces.", category: "Tech", primary: ["#007AFF", "#F5F5F7"], secondary: ["#1D1D1F", "#86868B"], related: ["apple", "ios", "safari"] },
  { slug: "safari", name: "Safari", overview: "Safari's compass blue is a classic Apple browser mark.", category: "Tech", primary: ["#006CFF", "#FFFFFF"], secondary: ["#1D1D1F"], related: ["apple", "chrome", "ios"] },
  { slug: "amazon", name: "Amazon", overview: "Amazon black type with smile orange communicates commerce and delight.", category: "Commerce", primary: ["#FF9900", "#146EB4", "#232F3E"], secondary: ["#FFFFFF", "#37475A"], related: ["aws", "prime-video", "audible"] },
  { slug: "aws", name: "AWS", overview: "AWS orange and dark slate define cloud infrastructure branding.", category: "Cloud", primary: ["#FF9900", "#232F3E"], secondary: ["#146EB4", "#FFFFFF"], related: ["amazon", "azure", "google-cloud"] },
  { slug: "adobe", name: "Adobe", overview: "Adobe red anchors Creative Cloud and document experiences.", category: "Design", primary: ["#FF0000", "#000000"], secondary: ["#FFFFFF", "#2C2C2C"], related: ["photoshop", "illustrator", "figma"] },
  { slug: "photoshop", name: "Photoshop", overview: "Photoshop blue is the flagship Creative Cloud editing identity.", category: "Design", primary: ["#31A8FF", "#001E36"], secondary: ["#FFFFFF"], related: ["adobe", "illustrator", "figma"] },
  { slug: "illustrator", name: "Illustrator", overview: "Illustrator orange signals vector creativity within Adobe's suite.", category: "Design", primary: ["#FF9A00", "#330000"], secondary: ["#FFFFFF"], related: ["adobe", "photoshop", "figma"] },
  { slug: "figma", name: "Figma", overview: "Figma's multicolor logo reflects collaborative, multiplayer design.", category: "Design", primary: ["#F24E1E", "#A259FF", "#1ABCFE", "#0ACF83", "#FF7262"], secondary: ["#000000", "#FFFFFF"], related: ["adobe", "canva", "sketch"] },
  { slug: "canva", name: "Canva", overview: "Canva's teal-to-purple brand feels approachable for DIY design.", category: "Design", primary: ["#00C4CC", "#7D2AE8"], secondary: ["#FFFFFF", "#0E1318"], related: ["figma", "pinterest", "adobe"] },
  { slug: "slack", name: "Slack", overview: "Slack's four-color hash mark is a staple of workplace collaboration.", category: "Productivity", primary: ["#4A154B", "#36C5F0", "#2EB67D", "#ECB22E", "#E01E5A"], secondary: ["#FFFFFF"], related: ["discord", "microsoft", "notion"] },
  { slug: "discord", name: "Discord", overview: "Discord blurple defines community chat and gaming social spaces.", category: "Social", primary: ["#5865F2", "#23272A"], secondary: ["#FFFFFF", "#57F287", "#ED4245"], related: ["slack", "twitch", "steam"] },
  { slug: "github", name: "GitHub", overview: "GitHub's near-black developer brand is paired with octocat neutrals.", category: "Developer", primary: ["#181717", "#FFFFFF"], secondary: ["#238636", "#1F6FEB", "#F78166"], related: ["gitlab", "bitbucket", "openai"] },
  { slug: "gitlab", name: "GitLab", overview: "GitLab orange represents DevSecOps and the tanuki brand mark.", category: "Developer", primary: ["#FC6D26", "#E24329"], secondary: ["#FFFFFF", "#303030"], related: ["github", "bitbucket", "atlassian"] },
  { slug: "bitbucket", name: "Bitbucket", overview: "Bitbucket blue sits within Atlassian's developer toolchain.", category: "Developer", primary: ["#0052CC", "#2684FF"], secondary: ["#FFFFFF", "#172B4D"], related: ["gitlab", "github", "atlassian"] },
  { slug: "reddit", name: "Reddit", overview: "Reddit orangered is playful and community-first.", category: "Social", primary: ["#FF4500", "#FF5700"], secondary: ["#FFFFFF", "#1A1A1B"], related: ["discord", "x-twitter", "tiktok"] },
  { slug: "paypal", name: "PayPal", overview: "PayPal dual blues communicate secure digital payments.", category: "Finance", primary: ["#003087", "#009CDE"], secondary: ["#012169", "#FFFFFF"], related: ["stripe", "visa", "mastercard"] },
  { slug: "stripe", name: "Stripe", overview: "Stripe blurple is a modern fintech classic for payments infrastructure.", category: "Finance", primary: ["#635BFF", "#0A2540"], secondary: ["#00D4FF", "#FFFFFF"], related: ["paypal", "visa", "shopify"] },
  { slug: "visa", name: "Visa", overview: "Visa blue and gold are among the most recognized payment colors globally.", category: "Finance", primary: ["#1A1F71", "#F7B600"], secondary: ["#FFFFFF"], related: ["mastercard", "paypal", "stripe"] },
  { slug: "mastercard", name: "Mastercard", overview: "Mastercard's overlapping red and orange circles are iconic worldwide.", category: "Finance", primary: ["#EB001B", "#F79E1B"], secondary: ["#FF5F00", "#000000"], related: ["visa", "paypal", "amex"] },
  { slug: "openai", name: "OpenAI", overview: "OpenAI's black-and-teal identity frames modern AI products.", category: "AI", primary: ["#000000", "#10A37F"], secondary: ["#FFFFFF", "#202123"], related: ["chatgpt", "github", "microsoft"] },
  { slug: "chatgpt", name: "ChatGPT", overview: "ChatGPT inherits OpenAI teal with soft interface neutrals.", category: "AI", primary: ["#10A37F", "#343541"], secondary: ["#FFFFFF", "#ECECF1"], related: ["openai", "notion", "microsoft"] },
  { slug: "notion", name: "Notion", overview: "Notion's monochrome brand supports flexible docs and wikis.", category: "Productivity", primary: ["#000000", "#FFFFFF"], secondary: ["#EB5757", "#2F80ED", "#27AE60"], related: ["slack", "figma", "dropbox"] },
  { slug: "dropbox", name: "Dropbox", overview: "Dropbox blue stands for cloud storage and file collaboration.", category: "Cloud", primary: ["#0061FF", "#FFFFFF"], secondary: ["#F7F9FC", "#1E1919"], related: ["google", "microsoft", "box"] },
  { slug: "zoom", name: "Zoom", overview: "Zoom blue became the color of remote meetings worldwide.", category: "Productivity", primary: ["#0B5CFF", "#2D8CFF"], secondary: ["#FFFFFF", "#0E72ED"], related: ["microsoft", "slack", "google"] },
  { slug: "uber", name: "Uber", overview: "Uber black is bold, urban, and mobility-focused.", category: "Transport", primary: ["#000000", "#FFFFFF"], secondary: ["#276EF1", "#06C167"], related: ["lyft", "uber-eats", "google-maps"] },
  { slug: "airbnb", name: "Airbnb", overview: "Airbnb Rausch is a warm coral built for belonging and travel.", category: "Travel", primary: ["#FF5A5F", "#00A699"], secondary: ["#FC642D", "#484848", "#FFFFFF"], related: ["booking", "uber", "tripadvisor"] },
  { slug: "tesla", name: "Tesla", overview: "Tesla's stark monochrome identity emphasizes premium EVs.", category: "Auto", primary: ["#CC0000", "#000000", "#FFFFFF"], secondary: ["#393C41"], related: ["bmw", "mercedes-benz", "apple"] },
  { slug: "samsung", name: "Samsung", overview: "Samsung blue anchors consumer electronics and Galaxy products.", category: "Tech", primary: ["#1428A0", "#000000"], secondary: ["#FFFFFF", "#0689D8"], related: ["android", "sony", "lg"] },
  { slug: "sony", name: "Sony", overview: "Sony uses refined black-and-white branding across electronics and entertainment.", category: "Tech", primary: ["#000000", "#FFFFFF"], secondary: ["#1D4ED8"], related: ["playstation", "samsung", "nintendo"] },
  { slug: "playstation", name: "PlayStation", overview: "PlayStation blue is a cornerstone of console gaming.", category: "Gaming", primary: ["#003791", "#000000"], secondary: ["#FFFFFF", "#0070D1"], related: ["xbox", "nintendo", "steam"] },
  { slug: "nintendo", name: "Nintendo", overview: "Nintendo red is playful, family-friendly, and instantly recognizable.", category: "Gaming", primary: ["#E60012", "#FFFFFF"], secondary: ["#1B1B1B", "#00C3E3"], related: ["playstation", "xbox", "steam"] },
  { slug: "steam", name: "Steam", overview: "Steam's dark blue UI and logo colors define PC gaming storefronts.", category: "Gaming", primary: ["#1B2838", "#66C0F4"], secondary: ["#171A21", "#FFFFFF"], related: ["xbox", "playstation", "discord"] },
  { slug: "intel", name: "Intel", overview: "Intel blue communicates processors, performance, and enterprise tech.", category: "Hardware", primary: ["#0071C5", "#000000"], secondary: ["#FFFFFF", "#00C7FD"], related: ["amd", "nvidia", "dell"] },
  { slug: "amd", name: "AMD", overview: "AMD black and red emphasize high-performance computing.", category: "Hardware", primary: ["#ED1C24", "#000000"], secondary: ["#FFFFFF"], related: ["intel", "nvidia", "asus"] },
  { slug: "nvidia", name: "NVIDIA", overview: "NVIDIA green is synonymous with GPUs and AI hardware.", category: "Hardware", primary: ["#76B900", "#000000"], secondary: ["#FFFFFF"], related: ["amd", "intel", "asus"] },
  { slug: "dell", name: "Dell", overview: "Dell blue supports enterprise PCs and infrastructure branding.", category: "Hardware", primary: ["#007DB8", "#000000"], secondary: ["#FFFFFF"], related: ["hp", "lenovo", "intel"] },
  { slug: "hp", name: "HP", overview: "HP blue is a long-standing personal computing brand color.", category: "Hardware", primary: ["#0096D6", "#000000"], secondary: ["#FFFFFF"], related: ["dell", "lenovo", "asus"] },
  { slug: "lenovo", name: "Lenovo", overview: "Lenovo red signals ThinkPad heritage and global PC leadership.", category: "Hardware", primary: ["#E2231A", "#000000"], secondary: ["#FFFFFF"], related: ["dell", "hp", "asus"] },
  { slug: "asus", name: "Asus", overview: "Asus mixes deep blacks with electric accents for gaming and PCs.", category: "Hardware", primary: ["#000000", "#00539B"], secondary: ["#FFFFFF", "#FF0055"], related: ["nvidia", "amd", "lenovo"] },
  { slug: "xiaomi", name: "Xiaomi", overview: "Xiaomi orange is energetic and consumer-electronics forward.", category: "Mobile", primary: ["#FF6900", "#000000"], secondary: ["#FFFFFF"], related: ["oneplus", "samsung", "nothing"] },
  { slug: "oneplus", name: "OnePlus", overview: "OnePlus red is bold and flagship-oriented.", category: "Mobile", primary: ["#F5010C", "#000000"], secondary: ["#FFFFFF"], related: ["xiaomi", "nothing", "samsung"] },
  { slug: "nothing", name: "Nothing", overview: "Nothing uses stark monochrome with transparent-tech aesthetics.", category: "Mobile", primary: ["#000000", "#FFFFFF", "#D71921"], secondary: ["#F2F2F2"], related: ["oneplus", "apple", "xiaomi"] },
  { slug: "nike", name: "Nike", overview: "Nike orange and black power athletic performance branding.", category: "Sport", primary: ["#FA5400", "#111111"], secondary: ["#FFFFFF"], related: ["adidas", "puma", "under-armour"] },
  { slug: "adidas", name: "Adidas", overview: "Adidas black-and-white stripes define sportswear minimalism.", category: "Sport", primary: ["#000000", "#FFFFFF"], secondary: ["#0277BD"], related: ["nike", "puma", "reebok"] },
  { slug: "puma", name: "Puma", overview: "Puma red is athletic, fierce, and lifestyle-oriented.", category: "Sport", primary: ["#ED1C24", "#000000"], secondary: ["#FFFFFF"], related: ["nike", "adidas", "reebok"] },
  { slug: "bmw", name: "BMW", overview: "BMW blue-and-white quarters convey premium automotive engineering.", category: "Auto", primary: ["#0066B1", "#FFFFFF", "#000000"], secondary: ["#1C69D4"], related: ["mercedes-benz", "audi", "tesla"] },
  { slug: "mercedes-benz", name: "Mercedes-Benz", overview: "Mercedes silver-star branding signals luxury and precision.", category: "Auto", primary: ["#333333", "#C0C0C0", "#FFFFFF"], secondary: ["#000000"], related: ["bmw", "audi", "tesla"] },
  { slug: "audi", name: "Audi", overview: "Audi rings in black and silver emphasize progressive luxury.", category: "Auto", primary: ["#000000", "#BB0A30", "#FFFFFF"], secondary: ["#8C8C8C"], related: ["bmw", "mercedes-benz", "ferrari"] },
  { slug: "ferrari", name: "Ferrari", overview: "Ferrari rosso corsa is the definitive racing red.", category: "Auto", primary: ["#FF2800", "#000000"], secondary: ["#FFFFFF", "#FFF200"], related: ["audi", "bmw", "lamborghini"] },
  { slug: "toyota", name: "Toyota", overview: "Toyota red supports reliable, global automotive branding.", category: "Auto", primary: ["#EB0A1E", "#FFFFFF"], secondary: ["#000000"], related: ["honda", "tesla", "bmw"] },
  { slug: "honda", name: "Honda", overview: "Honda red is friendly and engineering-driven.", category: "Auto", primary: ["#E40521", "#000000"], secondary: ["#FFFFFF"], related: ["toyota", "nissan", "bmw"] },
  { slug: "coca-cola", name: "Coca-Cola", overview: "Coca-Cola red is among the most recognized beverage colors in the world.", category: "Food", primary: ["#F40009", "#FFFFFF"], secondary: ["#1E1E1E", "#F8F8F8"], related: ["pepsi", "starbucks", "mcdonalds"] },
  { slug: "pepsi", name: "Pepsi", overview: "Pepsi's red, white, and blue globe is a classic global refreshment identity.", category: "Food", primary: ["#004B93", "#C8102E", "#FFFFFF"], secondary: ["#005CB4", "#000000"], related: ["coca-cola", "starbucks", "mcdonalds"] },
  { slug: "starbucks", name: "Starbucks", overview: "Starbucks siren green signals coffee, community, and the café experience.", category: "Food", primary: ["#006241", "#FFFFFF"], secondary: ["#1E3932", "#D4E9E2"], related: ["mcdonalds", "hellofresh", "swiggy"] },
  { slug: "mcdonalds", name: "McDonald's", overview: "McDonald's golden arches yellow and restaurant red are iconic fast-food colors.", category: "Food", primary: ["#FFC72C", "#DA291C"], secondary: ["#27251F", "#FFFFFF"], related: ["burger-king", "kfc", "swiggy"] },
  { slug: "ikea", name: "IKEA", overview: "IKEA blue and yellow make home furnishings instantly recognizable worldwide.", category: "Retail", primary: ["#0058A3", "#FFCC00"], secondary: ["#FFFFFF", "#111111"], related: ["target", "walmart", "amazon"] },
  { slug: "target", name: "Target", overview: "Target red is a bullseye of American retail branding.", category: "Retail", primary: ["#CC0000", "#FFFFFF"], secondary: ["#000000", "#F7F7F7"], related: ["walmart", "ikea", "amazon"] },
  { slug: "walmart", name: "Walmart", overview: "Walmart spark blue and yellow communicate everyday low prices and scale.", category: "Retail", primary: ["#0071CE", "#FFC220"], secondary: ["#FFFFFF", "#041E42"], related: ["target", "amazon", "ikea"] },
  { slug: "snapchat", name: "Snapchat", overview: "Snapchat yellow is playful, ephemeral, and built for camera-first social.", category: "Social", primary: ["#FFFC00", "#000000"], secondary: ["#FFFFFF", "#F23C57"], related: ["tiktok", "instagram", "discord"] },
  { slug: "twitch", name: "Twitch", overview: "Twitch purple owns live streaming and creator culture.", category: "Media", primary: ["#9146FF", "#0E0E10"], secondary: ["#FFFFFF", "#00F5D4"], related: ["discord", "youtube", "steam"] },
  { slug: "shopify", name: "Shopify", overview: "Shopify green represents independent commerce and online storefronts.", category: "Commerce", primary: ["#008060", "#002E25"], secondary: ["#FFFFFF", "#95BF47"], related: ["stripe", "amazon", "etsy"] },
  { slug: "ibm", name: "IBM", overview: "IBM blue is a landmark of enterprise computing and 8-bar heritage.", category: "Tech", primary: ["#0F62FE", "#161616"], secondary: ["#FFFFFF", "#0043CE"], related: ["microsoft", "oracle", "salesforce"] },
  { slug: "oracle", name: "Oracle", overview: "Oracle red anchors databases, cloud, and enterprise software branding.", category: "Cloud", primary: ["#C74634", "#312D2A"], secondary: ["#FFFFFF", "#F80000"], related: ["ibm", "salesforce", "aws"] },
  { slug: "salesforce", name: "Salesforce", overview: "Salesforce cloud blue is the color of CRM and customer companies.", category: "Cloud", primary: ["#00A1E0", "#032D60"], secondary: ["#FFFFFF", "#0B5CAB"], related: ["oracle", "ibm", "slack"] },
  { slug: "amex", name: "American Express", overview: "American Express blue signals premium cards and global payments.", category: "Finance", primary: ["#006FCF", "#00175A"], secondary: ["#FFFFFF", "#99C6EB"], related: ["visa", "mastercard", "paypal"] },
  { slug: "booking", name: "Booking.com", overview: "Booking.com blue is a staple of online travel and accommodation search.", category: "Travel", primary: ["#003580", "#009FE3"], secondary: ["#FFFFFF", "#00224F"], related: ["airbnb", "tripadvisor", "uber"] },
  { slug: "lyft", name: "Lyft", overview: "Lyft pink is friendly, urban, and built for rideshare.", category: "Transport", primary: ["#FF00BF", "#000000"], secondary: ["#FFFFFF", "#352384"], related: ["uber", "airbnb", "google-maps"] },
  { slug: "telegram", name: "Telegram", overview: "Telegram sky blue stands for fast, cloud-based messaging.", category: "Social", primary: ["#26A5E4", "#FFFFFF"], secondary: ["#0088CC", "#182533"], related: ["whatsapp", "messenger", "discord"] },
  { slug: "atlassian", name: "Atlassian", overview: "Atlassian's multi-blue system powers Jira, Confluence, and team software.", category: "Developer", primary: ["#0052CC", "#2684FF"], secondary: ["#36B37E", "#FF5630", "#FFFFFF"], related: ["bitbucket", "github", "slack"] },
  { slug: "nissan", name: "Nissan", overview: "Nissan red supports global automotive and EV branding.", category: "Auto", primary: ["#C3002F", "#000000"], secondary: ["#FFFFFF", "#1A1A1A"], related: ["honda", "toyota", "bmw"] },
  { slug: "lg", name: "LG", overview: "LG wine-red branding spans TVs, appliances, and consumer electronics.", category: "Tech", primary: ["#A50034", "#000000"], secondary: ["#FFFFFF", "#ED1C24"], related: ["samsung", "sony", "dell"] },
  ...FOOTBALL_BRANDS,
  ...FOOD_BRANDS,
];

export function getBrandBySlug(slug: string) {
  return BRANDS.find((b) => b.slug === slug);
}

export function getRelatedBrands(brand: BrandPalette) {
  return brand.related
    .map((slug) => getBrandBySlug(slug))
    .filter((b): b is BrandPalette => Boolean(b));
}

export function searchBrands(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return BRANDS;
  return BRANDS.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.overview.toLowerCase().includes(q) ||
      brandAllColors(b).some((c) => c.toLowerCase().includes(q.replace(/^#/, "")))
  );
}

export function brandAllColors(brand: BrandPalette) {
  return [...brand.primary, ...brand.secondary].map(normalizeHex);
}

export function getBrandCategories() {
  return [...new Set(BRANDS.map((b) => b.category))].sort();
}

export type BrandHexRole = "primary" | "secondary";

export interface BrandHexEntry {
  brand: BrandPalette;
  hex: string;
  hexSlug: string;
  role: BrandHexRole;
}

function uniqueNormalized(hexes: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const hex of hexes) {
    const n = normalizeHex(hex);
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

export function getAllBrandHexEntries(): BrandHexEntry[] {
  return BRANDS.flatMap((brand) => {
    const primary = uniqueNormalized(brand.primary);
    const primaryKeys = new Set(primary.map((h) => h.toLowerCase()));
    const secondary = uniqueNormalized(brand.secondary).filter((h) => !primaryKeys.has(h.toLowerCase()));
    return [
      ...primary.map((hex) => ({
        brand,
        hex,
        hexSlug: hex.slice(1).toLowerCase(),
        role: "primary" as const,
      })),
      ...secondary.map((hex) => ({
        brand,
        hex,
        hexSlug: hex.slice(1).toLowerCase(),
        role: "secondary" as const,
      })),
    ];
  });
}

export function getBrandHexEntry(slug: string, hexParam: string): BrandHexEntry | undefined {
  const wanted = hexParam.replace(/^#/, "").toLowerCase();
  return getAllBrandHexEntries().find((e) => e.brand.slug === slug && e.hexSlug === wanted);
}

export function getBrandsUsingHex(hex: string) {
  const key = normalizeHex(hex).toLowerCase();
  return BRANDS.filter((b) => brandAllColors(b).some((c) => c.toLowerCase() === key));
}
