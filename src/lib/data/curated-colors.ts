import type { ColorFamily } from "@/lib/data/families";

export interface CuratedColor {
  slug: string;
  name: string;
  hex: string;
  family: ColorFamily;
  intro: string;
  designTips: {
    webUi: string;
    interiors: string;
    branding: string;
  };
  harmonies: {
    complementary: string;
    analogous: [string, string];
    triadic: [string, string];
  };
  faqs: { question: string; answer: string }[];
}

export const CURATED_TARGET_COLORS: CuratedColor[] = [
  {
    slug: "sage-green",
    name: "Sage Green",
    hex: "#9CAF88",
    family: "green",
    intro:
      "Sage green is a soft, muted grey-green that evokes dried sage leaves. It blends green's natural tranquility with neutral grey undertones, making it one of the most versatile colors in modern interior design and digital UI.",
    designTips: {
      webUi: "Excellent for card backgrounds, health and wellness app shells, and subtle accent borders that avoid the harshness of vivid emerald greens.",
      interiors: "A perennial favorite for bedrooms, kitchen cabinetry, and living room accent walls paired with brass hardware, natural oak, and warm whites.",
      branding: "Conveys sustainability, calm, organic purity, and understated luxury.",
    },
    harmonies: {
      complementary: "#AF889C",
      analogous: ["#88AF93", "#A8AF88"],
      triadic: ["#889CAF", "#AF889C"],
    },
    faqs: [
      {
        question: "What is the exact HEX code for sage green?",
        answer: "The benchmark HEX code for sage green is #9CAF88 (RGB: 156, 175, 136 | HSL: 89°, 20%, 61%). Variations range from lighter silvery tones (#B2AC88) to deeper earthy moss (#77815C).",
      },
      {
        question: "What colors pair best with sage green?",
        answer: "Sage green pairs exceptionally well with warm neutrals (terracotta, cream, taupe), muted blush pinks (#E8C5C8), and deep charcoal (#27272A) for high-contrast typography.",
      },
      {
        question: "Is sage green accessible for web text?",
        answer: "On pure white (#FFFFFF), #9CAF88 achieves a 2.1:1 contrast ratio, which fails WCAG AA for body text. Use it for non-text fills or UI backgrounds with dark text (#18181B, 11.2:1 contrast).",
      },
    ],
  },
  {
    slug: "burnt-orange",
    name: "Burnt Orange",
    hex: "#CC5500",
    family: "orange",
    intro:
      "Burnt orange is an intense, earthy red-orange with warm terracotta and amber depths. Popularized in mid-century design, it delivers warmth, creativity, and autumn-inspired comfort.",
    designTips: {
      webUi: "A high-conversion CTA button color on dark mode or off-white backgrounds, providing vibrant urgency without the alarm of pure red.",
      interiors: "Warm accent textiles, leather sofas, velvet dining chairs, and statement entryways.",
      branding: "Evokes artisanal craftsmanship, harvest warmth, hospitality, and confident enthusiasm.",
    },
    harmonies: {
      complementary: "#0077CC",
      analogous: ["#CC2400", "#CC8500"],
      triadic: ["#00CC55", "#5500CC"],
    },
    faqs: [
      {
        question: "What is the HEX code for burnt orange?",
        answer: "The classic burnt orange HEX is #CC5500 (RGB: 204, 85, 0 | HSL: 25°, 100%, 40%). University of Texas burnt orange uses a slightly deeper tone (#BF5700).",
      },
      {
        question: "What colors complement burnt orange?",
        answer: "Its direct complement is a deep slate azure (#0077CC). In interior design, it harmonizes naturally with sage green, cream, and midnight navy.",
      },
    ],
  },
  {
    slug: "terracotta",
    name: "Terracotta",
    hex: "#E2725B",
    family: "orange",
    intro:
      "Terracotta, Italian for 'baked earth', is a clay-derived reddish-brown and coral tone. It bridges earthiness and sunset vibrancy, bringing warmth and tactile texture to visual compositions.",
    designTips: {
      webUi: "Ideal for ceramic, architecture, and lifestyle editorial layouts, warm product cards, and secondary accents.",
      interiors: "Potted ceramic planters, Spanish and Mediterranean plaster walls, linen bedsheets, and tiled accents.",
      branding: "Communicates grounded authenticity, handmade quality, warmth, and organic heritage.",
    },
    harmonies: {
      complementary: "#5BCBE2",
      analogous: ["#E25B7E", "#E2995B"],
      triadic: ["#5BE272", "#725BE2"],
    },
    faqs: [
      {
        question: "What is the HEX code for terracotta?",
        answer: "The benchmark terracotta color is #E2725B (RGB: 226, 114, 91 | HSL: 10°, 70%, 62%).",
      },
      {
        question: "Is terracotta considered a neutral color?",
        answer: "While terracotta has strong warm chromaticity, designers frequently treat muted terracotta as an 'earthy neutral' that pairs easily with olive, beige, charcoal, and ivory.",
      },
    ],
  },
  {
    slug: "olive-green",
    name: "Olive Green",
    hex: "#708238",
    family: "green",
    intro:
      "Olive green is a dark yellowish-green inspired by unripe green olives. It balances military utility with organic Mediterranean vegetation, providing grounded, timeless elegance.",
    designTips: {
      webUi: "Sophisticated surface containers, badges, and dark-mode secondary accents.",
      interiors: "Kitchen island cabinetry, cozy dens, exterior siding, and olive-tree inspired patio decors.",
      branding: "Represents peace, military precision, tactical outdoor gear, and gourmet culinary craft.",
    },
    harmonies: {
      complementary: "#4A3882",
      analogous: ["#528238", "#827C38"],
      triadic: ["#387082", "#823870"],
    },
    faqs: [
      {
        question: "What is the HEX code for olive green?",
        answer: "Standard olive green is #708238 (RGB: 112, 130, 56 | HSL: 75°, 40%, 36%). Traditional CSS 'olive' is #808000.",
      },
      {
        question: "What is the difference between olive green and sage green?",
        answer: "Olive green has a stronger yellow-brown undertone and lower lightness (L: ~36%), while sage green is much lighter (L: ~61%) with silvery grey undertones.",
      },
    ],
  },
  {
    slug: "emerald-green",
    name: "Emerald Green",
    hex: "#50C878",
    family: "green",
    intro:
      "Emerald green is a luminous, vivid green with subtle blue undertones, named after the precious gemstone. It symbolizes wealth, rejuvenation, growth, and majestic vitality.",
    designTips: {
      webUi: "High-impact success indicators, fintech primary actions, luxury headers, and sustainability badges.",
      interiors: "Jewel-toned velvet armchairs, dramatic powder rooms, and emerald green tiled backsplashes.",
      branding: "Conveys prosperity, prestigious quality, royal elegance, and lush botanical vitality.",
    },
    harmonies: {
      complementary: "#C850A0",
      analogous: ["#50C8A7", "#71C850"],
      triadic: ["#7850C8", "#C87850"],
    },
    faqs: [
      {
        question: "What is the HEX code for emerald green?",
        answer: "The standard emerald green HEX code is #50C878 (RGB: 80, 200, 120 | HSL: 140°, 52%, 55%). Deep emerald shades include #046307 and #02401B.",
      },
    ],
  },
  {
    slug: "burgundy",
    name: "Burgundy",
    hex: "#800020",
    family: "red",
    intro:
      "Burgundy is a rich, deep reddish-purple named after Burgundy wine from eastern France. It possesses more purple depth than maroon and conveys opulent authority and heritage.",
    designTips: {
      webUi: "Premium packaging, luxury fashion portfolios, wine and spirits websites, and deep button states.",
      interiors: "Formal dining rooms, leather study chairs, heavy drape curtains, and Persian rug tones.",
      branding: "Associated with prestige, fine vintage, academic authority, and reserved power.",
    },
    harmonies: {
      complementary: "#008060",
      analogous: ["#800045", "#801B00"],
      triadic: ["#002080", "#208000"],
    },
    faqs: [
      {
        question: "What is the difference between burgundy and maroon?",
        answer: "Burgundy (#800020) has distinct purplish-blue undertones, whereas maroon (#800000) is a warm brown-red without blue tint.",
      },
    ],
  },
  {
    slug: "mauve",
    name: "Mauve",
    hex: "#E0B0FF",
    family: "purple",
    intro:
      "Mauve is a pale, delicate purple with greyish and pinkish undertones, historically famous as the first synthetic chemical dye discovered by William Perkin in 1856.",
    designTips: {
      webUi: "Subtle card backgrounds, beauty/skincare hero banners, and gentle tag labels.",
      interiors: "Romantic bedroom textiles, soft nursery palettes, and vintage Parisian wallpaper accents.",
      branding: "Evokes nostalgic elegance, gentle care, artistic sensibility, and modern floral chic.",
    },
    harmonies: {
      complementary: "#CFFF80",
      analogous: ["#C7B0FF", "#FFB0E8"],
      triadic: ["#B0FFE0", "#FFE0B0"],
    },
    faqs: [
      {
        question: "What is the HEX code for mauve?",
        answer: "Classic mauve is #E0B0FF (RGB: 224, 176, 255 | HSL: 276°, 100%, 85%). Muted dusty mauve often uses #915F6D or #B784A7.",
      },
    ],
  },
  {
    slug: "taupe",
    name: "Taupe",
    hex: "#483C32",
    family: "brown",
    intro:
      "Taupe, derived from the French word for 'mole', is a complex neutral that hovers between dark grey and brown. It offers an understated, versatile warmth that outshines plain flat grey.",
    designTips: {
      webUi: "Warm neutral typography, card dividers, and high-end editorial background fills.",
      interiors: "Living room upholstery, woven wool rugs, exterior architectural finishes, and neutral drapery.",
      branding: "Communicates calm stability, timeless minimalism, organic sophistication, and quiet luxury.",
    },
    harmonies: {
      complementary: "#323E48",
      analogous: ["#483238", "#484632"],
      triadic: ["#32483C", "#3C3248"],
    },
    faqs: [
      {
        question: "What is the HEX code for taupe?",
        answer: "Traditional dark taupe is #483C32 (RGB: 72, 60, 50). Modern light taupe decor uses #B38B6D or #D2B48C.",
      },
    ],
  },
  {
    slug: "teal",
    name: "Teal",
    hex: "#008080",
    family: "cyan",
    intro:
      "Teal is a deep, tranquil cyan-green named after the common teal duck, which features a striking stripe of this color around its eyes. It bridges the trustworthiness of blue with the vitality of green.",
    designTips: {
      webUi: "Primary actions, technology platform headers, data visualization series, and active navigation links.",
      interiors: "Mid-century modern accent walls, velvet cushions, bathroom tiles, and front entry doors.",
      branding: "Conveys clarity, open communication, health innovation, and modern intellect.",
    },
    harmonies: {
      complementary: "#800000",
      analogous: ["#008055", "#005580"],
      triadic: ["#800080", "#808000"],
    },
    faqs: [
      {
        question: "What is the HEX code for teal?",
        answer: "Standard CSS teal is #008080 (RGB: 0, 128, 128 | HSL: 180°, 100%, 25%).",
      },
    ],
  },
  {
    slug: "dusty-rose",
    name: "Dusty Rose",
    hex: "#DCAE96",
    family: "pink",
    intro:
      "Dusty rose is a sophisticated, muted pink with warm brown and beige undertones. It removes the juvenile quality of candy pink, producing a calm, romantic, and mature aesthetic.",
    designTips: {
      webUi: "Beauty, cosmetics, and wellness platforms, warm product framing, and lifestyle blog accents.",
      interiors: "Linen beddings, velvet throw pillows, and accent wall paint paired with brushed gold and marble.",
      branding: "Evokes quiet affection, artisan ceramics, softness, and modern femininity.",
    },
    harmonies: {
      complementary: "#96C4DC",
      analogous: ["#DC96A3", "#DCC496"],
      triadic: ["#AEDC96", "#96AEDC"],
    },
    faqs: [
      {
        question: "What is the HEX code for dusty rose?",
        answer: "Dusty rose is represented by #DCAE96 (RGB: 220, 174, 150 | HSL: 21°, 51%, 73%).",
      },
    ],
  },
  {
    slug: "fuchsia-pink",
    name: "Fuchsia Pink",
    hex: "#FF77FF",
    family: "pink",
    intro:
      "Fuchsia pink is an electric, vibrant pink-purple named after the fuchsia flower. It commands high visual attention with playful exuberance and bold creative energy.",
    designTips: {
      webUi: "High-contrast promotional banners, gaming UI, creative agency accents, and music festival themes.",
      interiors: "Statement art pieces, neon wall signs, and eclectic accent cushions in neutral spaces.",
      branding: "Projects fearless individuality, youthful confidence, and magnetic glamour.",
    },
    harmonies: {
      complementary: "#77FF77",
      analogous: ["#FF77B9", "#BD77FF"],
      triadic: ["#77FFFF", "#FFFF77"],
    },
    faqs: [
      {
        question: "What is the difference between fuchsia and magenta?",
        answer: "In web standards, Fuchsia and Magenta share the exact same HEX code #FF00FF. Fuchsia pink (#FF77FF) is slightly softened with a lighter tint.",
      },
    ],
  },
  {
    slug: "neon-green",
    name: "Neon Green",
    hex: "#39FF14",
    family: "green",
    intro:
      "Neon green is an ultra-bright, fluorescent lime-green that pops vividly against dark surfaces. It is synonymous with cyber culture, electronic music, and futuristic interfaces.",
    designTips: {
      webUi: "Glow effects, terminal code themes, fintech highlight cards, and dark-mode CTA buttons.",
      interiors: "Minimalist gaming rooms, club lighting, and modern pop-art studio installations.",
      branding: "Conveys high energy, disruption, technical boldness, and digital-first innovation.",
    },
    harmonies: {
      complementary: "#DA14FF",
      analogous: ["#14FF7E", "#9EFF14"],
      triadic: ["#1439FF", "#FF1439"],
    },
    faqs: [
      {
        question: "What is the HEX code for neon green?",
        answer: "The benchmark electric neon green is #39FF14 (RGB: 57, 255, 20 | HSL: 111°, 100%, 54%).",
      },
    ],
  },
  {
    slug: "light-pink",
    name: "Light Pink",
    hex: "#FFB6C1",
    family: "pink",
    intro:
      "Light pink is a delicate, gentle pastel pink that radiates tenderness, optimism, and warmth. It is widely used in baby decor, celebratory confectionery, and soft digital design.",
    designTips: {
      webUi: "Soft backgrounds, toast notification tints, and lifestyle blog accents.",
      interiors: "Nurseries, powder rooms, and gentle floral interior accents.",
      branding: "Represents sweetness, innocent charm, relaxation, and friendly hospitality.",
    },
    harmonies: {
      complementary: "#B6FFFF",
      analogous: ["#FFB6E0", "#FFCBB6"],
      triadic: ["#B6FFB6", "#B6B6FF"],
    },
    faqs: [
      {
        question: "What is the official CSS code for light pink?",
        answer: "The standard CSS named color LightPink uses HEX #FFB6C1 (RGB: 255, 182, 193).",
      },
    ],
  },
  {
    slug: "dark-green",
    name: "Dark Green",
    hex: "#006400",
    family: "green",
    intro:
      "Dark green is a profound, traditional shade that evokes dense pine canopies, classic library leather, and legacy university campuses. It represents stability, tradition, and quiet wealth.",
    designTips: {
      webUi: "Editorial card backgrounds, financial institution badges, and luxury product frames.",
      interiors: "Study wood paneling, dark green velvet sofas, and classical entryways.",
      branding: "Associated with financial integrity, organic nature, academic heritage, and longevity.",
    },
    harmonies: {
      complementary: "#640064",
      analogous: ["#006432", "#326400"],
      triadic: ["#000064", "#640000"],
    },
    faqs: [
      {
        question: "What is the HEX code for dark green?",
        answer: "Standard CSS DarkGreen is #006400 (RGB: 0, 100, 0 | HSL: 120°, 100%, 20%).",
      },
    ],
  },
  {
    slug: "turquoise",
    name: "Turquoise",
    hex: "#40E0D0",
    family: "cyan",
    intro:
      "Turquoise is an invigorating cyan-blue inspired by the ancient mineral talisman and tropical shallows. It blends blue's calm serenity with yellow's cheerful warmth.",
    designTips: {
      webUi: "Vacation booking platforms, interactive metric graphs, and modern app toggles.",
      interiors: "Coastal living spaces, bathroom feature walls, and southwestern mosaic decor.",
      branding: "Signals freshness, ocean purity, emotional balance, and adventurous freedom.",
    },
    harmonies: {
      complementary: "#E04050",
      analogous: ["#40E099", "#40B5E0"],
      triadic: ["#D040E0", "#E0D040"],
    },
    faqs: [
      {
        question: "What is the HEX code for turquoise?",
        answer: "Official CSS Turquoise is #40E0D0 (RGB: 64, 224, 208 | HSL: 174°, 72%, 56%).",
      },
    ],
  },
  {
    slug: "duck-egg-blue",
    name: "Duck Egg Blue",
    hex: "#C0D6D2",
    family: "cyan",
    intro:
      "Duck egg blue is an understated pale greenish-blue with powdery grey undertones, replicating the delicate shells of duck eggs. It brings heritage English cottage calm to any setting.",
    designTips: {
      webUi: "Subtle card tints, mindfulness platforms, and serene editorial backgrounds.",
      interiors: "Cottage kitchen cupboards, shiplap bathrooms, and restful master bedrooms.",
      branding: "Expresses classic British heritage, gentle wellness, and artisanal handcrafting.",
    },
    harmonies: {
      complementary: "#D6C0C4",
      analogous: ["#C0D6C4", "#C0CCD6"],
      triadic: ["#D6D2C0", "#D2C0D6"],
    },
    faqs: [
      {
        question: "What is the HEX code for duck egg blue?",
        answer: "Duck egg blue is commonly designated as #C0D6D2 (RGB: 192, 214, 210 | HSL: 169°, 22%, 80%).",
      },
    ],
  },
  {
    slug: "teal-green",
    name: "Teal Green",
    hex: "#00827F",
    family: "green",
    intro:
      "Teal green emphasizes rich emerald-forest tones over cyan blue, offering an organic, deep marine hue that feels grounded and mature.",
    designTips: {
      webUi: "Fintech navigation headers, corporate report covers, and ecological feature highlights.",
      interiors: "Kitchen backsplashes, dining chair textiles, and modern botanical bedrooms.",
      branding: "Represents ecological intelligence, financial growth, and trustworthy modern service.",
    },
    harmonies: {
      complementary: "#820003",
      analogous: ["#00824B", "#006F82"],
      triadic: ["#7F0082", "#827F00"],
    },
    faqs: [
      {
        question: "What is the HEX code for teal green?",
        answer: "Teal green is benchmarked at #00827F (RGB: 0, 130, 127 | HSL: 179°, 100%, 25%).",
      },
    ],
  },
  {
    slug: "pastel-green",
    name: "Pastel Green",
    hex: "#77DD77",
    family: "green",
    intro:
      "Pastel green is a light, uplifting mint-leaf tone that embodies springtime renewal and gentle organic freshness.",
    designTips: {
      webUi: "Success notification backgrounds, organic health metrics, and light-theme card surfaces.",
      interiors: "Children's rooms, laundry rooms, and bright breakfast nooks.",
      branding: "Evokes springtime, clean eating, gentle environmentalism, and youthful joy.",
    },
    harmonies: {
      complementary: "#DD77DD",
      analogous: ["#77DDAA", "#AADD77"],
      triadic: ["#7777DD", "#DD7777"],
    },
    faqs: [
      {
        question: "What is the HEX code for pastel green?",
        answer: "The classic pastel green HEX is #77DD77 (RGB: 119, 221, 119 | HSL: 120°, 60%, 67%).",
      },
    ],
  },
  {
    slug: "light-green",
    name: "Light Green",
    hex: "#90EE90",
    family: "green",
    intro:
      "Light green is a bright, optimistic pale green that matches young grass shoots and springtime blossoms.",
    designTips: {
      webUi: "Positive indicators, verification checkmark pills, and friendly educational badges.",
      interiors: "Sunrooms, botanical studios, and bright cheerful kitchen cabinetry.",
      branding: "Signifies growth, clean energy, fresh ingredients, and youthful vitality.",
    },
    harmonies: {
      complementary: "#EE90EE",
      analogous: ["#90EEC5", "#C5EE90"],
      triadic: ["#9090EE", "#EE9090"],
    },
    faqs: [
      {
        question: "What is the CSS HEX for light green?",
        answer: "Standard CSS LightGreen is #90EE90 (RGB: 144, 238, 144 | HSL: 120°, 73%, 75%).",
      },
    ],
  },
  {
    slug: "lavender",
    name: "Lavender",
    hex: "#E6E6FA",
    family: "purple",
    intro:
      "Lavender is a dreamy, soothing pale purple named after the flowering lavender herb. Known for promoting restfulness and mental calm.",
    designTips: {
      webUi: "Sleep tracking apps, mental wellness dashboards, and subtle page background gradients.",
      interiors: "Bedrooms, modern spas, reading alcoves, and guest powder rooms.",
      branding: "Signifies aromatherapy, peaceful slumber, gentle care, and mindful presence.",
    },
    harmonies: {
      complementary: "#FAFAD6",
      analogous: ["#DFE6FA", "#FAE6F4"],
      triadic: ["#FAE6E6", "#E6FAE6"],
    },
    faqs: [
      {
        question: "What is the official HEX code for lavender?",
        answer: "Official CSS Lavender is #E6E6FA (RGB: 230, 230, 250 | HSL: 240°, 67%, 94%).",
      },
    ],
  },
  {
    slug: "nude",
    name: "Nude",
    hex: "#E3BC9A",
    family: "brown",
    intro:
      "Nude is a warm, beige-apricot neutral that mimics unadorned skin tones. It provides effortless minimalist warmth in cosmetics, fashion, and editorial layouts.",
    designTips: {
      webUi: "Cosmetics catalogs, clean apparel stores, and neutral warm card panels.",
      interiors: "Minimalist plaster walls, linen drapery, and Scandinavian ceramic vases.",
      branding: "Projects natural beauty, honest transparency, and warm modern minimalism.",
    },
    harmonies: {
      complementary: "#9AC1E3",
      analogous: ["#E39AB5", "#D7E39A"],
      triadic: ["#9AE3BC", "#BC9AE3"],
    },
    faqs: [
      {
        question: "What is the HEX code for nude color?",
        answer: "The classic nude tone is #E3BC9A (RGB: 227, 188, 154 | HSL: 28°, 56%, 75%).",
      },
    ],
  },
  {
    slug: "off-white",
    name: "Off White",
    hex: "#FAF9F6",
    family: "white",
    intro:
      "Off-white is a softened white with subtle warm or grey undertones that prevents the clinical glare of pure #FFFFFF, offering comfortable reading and timeless residential comfort.",
    designTips: {
      webUi: "The gold standard for modern website body backgrounds, reducing eye fatigue compared to harsh #FFFFFF.",
      interiors: "Trim, crown moldings, ceiling surfaces, and open-plan residential walls.",
      branding: "Signifies museum-grade minimalism, architectural elegance, and thoughtful craft.",
    },
    harmonies: {
      complementary: "#F6F7FA",
      analogous: ["#FAF6F7", "#F6FAF9"],
      triadic: ["#F9FAF6", "#F9F6FA"],
    },
    faqs: [
      {
        question: "Why do designers use off-white instead of pure white?",
        answer: "Pure white (#FFFFFF) on high-brightness digital screens causes visual glare and eye strain. Off-white (#FAF9F6) softens contrast while maintaining crisp readability.",
      },
    ],
  },
  {
    slug: "light-purple",
    name: "Light Purple",
    hex: "#D8B4E2",
    family: "purple",
    intro:
      "Light purple blends violet mystery with pastel brightness, evoking lilacs, amethyst crystals, and creative playfulness.",
    designTips: {
      webUi: "Creative portfolio accents, education badges, and playful onboarding illustrations.",
      interiors: "Creative studios, modern boutique decors, and soft bedroom feature elements.",
      branding: "Represents creative imagination, artistic intuition, and modern approachable whimsy.",
    },
    harmonies: {
      complementary: "#BEE2B4",
      analogous: ["#B4BFE2", "#E2B4CB"],
      triadic: ["#E2D8B4", "#B4E2D8"],
    },
    faqs: [
      {
        question: "What is the HEX code for light purple?",
        answer: "A benchmark light purple HEX is #D8B4E2 (RGB: 216, 180, 226 | HSL: 287°, 44%, 80%).",
      },
    ],
  },
  {
    slug: "lilac",
    name: "Lilac",
    hex: "#C8A2C8",
    family: "purple",
    intro:
      "Lilac is a pale, slightly muted violet named after the syringa flower. It balances cool floral dignity with gentle nostalgia.",
    designTips: {
      webUi: "Perfume and lifestyle storefronts, delicate cards, and friendly social badges.",
      interiors: "Spring-inspired living rooms, antique vanities, and botanical accent papers.",
      branding: "Conveys romance, poetic nostalgia, floral freshness, and gentle sophistication.",
    },
    harmonies: {
      complementary: "#A2C8A2",
      analogous: ["#A2A8C8", "#C8A2B6"],
      triadic: ["#C8C2A2", "#A2C8C2"],
    },
    faqs: [
      {
        question: "What is the HEX code for lilac?",
        answer: "The classic lilac HEX code is #C8A2C8 (RGB: 200, 162, 200 | HSL: 300°, 26%, 71%).",
      },
    ],
  },
  {
    slug: "pastel-pink",
    name: "Pastel Pink",
    hex: "#FFD1DC",
    family: "pink",
    intro:
      "Pastel pink is a soft, sweet tint of pink that radiates innocence, delicacy, and soothing sweetness.",
    designTips: {
      webUi: "Pastry/bakery e-commerce, nursery landing pages, and playful mobile application pills.",
      interiors: "Cozy reading nooks, vintage tea rooms, and nursery accent walls.",
      branding: "Expresses confectionery joy, maternal warmth, and approachable sweetness.",
    },
    harmonies: {
      complementary: "#D1FFEC",
      analogous: ["#FFD1F2", "#FFDFD1"],
      triadic: ["#D1DCFF", "#DCFFD1"],
    },
    faqs: [
      {
        question: "What is the HEX code for pastel pink?",
        answer: "Pastel pink benchmark HEX is #FFD1DC (RGB: 255, 209, 220 | HSL: 346°, 100%, 91%).",
      },
    ],
  },
  {
    slug: "turquoise-blue",
    name: "Turquoise Blue",
    hex: "#00C5CD",
    family: "cyan",
    intro:
      "Turquoise blue leans toward azure skies, offering higher energy and clarity than deep marine teals.",
    designTips: {
      webUi: "Clean tech buttons, hydration trackers, and high-visibility data indicators.",
      interiors: "Swimming pool patios, bright coastal bathrooms, and energetic art accents.",
      branding: "Signifies high efficiency, crystalline water, and optimistic clarity.",
    },
    harmonies: {
      complementary: "#CD0800",
      analogous: ["#00CD9E", "#0086CD"],
      triadic: ["#C500CD", "#CDBE00"],
    },
    faqs: [
      {
        question: "What is the HEX code for turquoise blue?",
        answer: "Turquoise blue is defined by HEX #00C5CD (RGB: 0, 197, 205 | HSL: 182°, 100%, 40%).",
      },
    ],
  },
  {
    slug: "coral",
    name: "Coral",
    hex: "#FF7F50",
    family: "orange",
    intro:
      "Coral is a warm, spirited pink-orange inspired by tropical coral reefs. It balances the urgency of orange with the friendliness of pink.",
    designTips: {
      webUi: "High-click call-to-actions, summer campaign themes, and vibrant notifications.",
      interiors: "Accent armchairs, modern tropical wallpapers, and vibrant kitchen dishware.",
      branding: "Communicates vibrant enthusiasm, community warmth, and cheerful tropical health.",
    },
    harmonies: {
      complementary: "#50D0FF",
      analogous: ["#FF506F", "#FFAF50"],
      triadic: ["#50FF7F", "#7F50FF"],
    },
    faqs: [
      {
        question: "What is the official CSS HEX for coral?",
        answer: "Official CSS Coral is #FF7F50 (RGB: 255, 127, 80 | HSL: 16°, 100%, 66%).",
      },
    ],
  },
  {
    slug: "indigo",
    name: "Indigo",
    hex: "#4B0082",
    family: "purple",
    intro:
      "Indigo is a deep, mystic midnight blue-purple historically harvested from the Indigofera plant. It symbolizes intuition, deep contemplation, and intellectual mystery.",
    designTips: {
      webUi: "SaaS brand primaries, dark-mode backdrops, and developer infrastructure interfaces.",
      interiors: "Mood dining rooms, dark library walls, and indigo block-print textiles.",
      branding: "Represents deep intellect, developer tools, visionary leadership, and structured reliability.",
    },
    harmonies: {
      complementary: "#378200",
      analogous: ["#1B0082", "#7B0082"],
      triadic: ["#824B00", "#00824B"],
    },
    faqs: [
      {
        question: "What is the official CSS HEX for indigo?",
        answer: "Official CSS Indigo is #4B0082 (RGB: 75, 0, 130 | HSL: 275°, 100%, 25%).",
      },
    ],
  },
  {
    slug: "forest-green",
    name: "Forest Green",
    hex: "#228B22",
    family: "green",
    intro:
      "Forest green captures the rich, vibrant shade of evergreen conifers and damp forest moss. It signifies vitality, outdoor conservation, and organic growth.",
    designTips: {
      webUi: "Eco-commerce platforms, national park guides, and outdoor apparel product grids.",
      interiors: "Cabin living rooms, botanical conservatories, and velvet study upholstery.",
      branding: "Commands respect for nature, conservation trust, and organic longevity.",
    },
    harmonies: {
      complementary: "#8B228B",
      analogous: ["#228B57", "#578B22"],
      triadic: ["#22228B", "#8B2222"],
    },
    faqs: [
      {
        question: "What is the official CSS HEX for forest green?",
        answer: "CSS ForestGreen is #228B22 (RGB: 34, 139, 34 | HSL: 120°, 61%, 34%).",
      },
    ],
  },
  {
    slug: "peacock-green",
    name: "Peacock Green",
    hex: "#005959",
    family: "cyan",
    intro:
      "Peacock green is an intense, jewel-toned teal with deep blue undertones inspired by the iridescent plumage of the Indian peafowl. It is regal, mysterious, and deeply decorative.",
    designTips: {
      webUi: "Luxury portfolio headers, architectural studios, and rich button states.",
      interiors: "Dramatic powder rooms, velvet dining chairs, and art-deco wallpaper murals.",
      branding: "Associated with regal luxury, artistic grandeur, and theatrical elegance.",
    },
    harmonies: {
      complementary: "#590000",
      analogous: ["#00593B", "#003B59"],
      triadic: ["#590059", "#595900"],
    },
    faqs: [
      {
        question: "What is the HEX code for peacock green?",
        answer: "Peacock green is widely represented by #005959 (RGB: 0, 89, 89 | HSL: 180°, 100%, 17%).",
      },
    ],
  },
  {
    slug: "pastel-blue",
    name: "Pastel Blue",
    hex: "#AEC6CF",
    family: "blue",
    intro:
      "Pastel blue is a serene, soft powder-blue that recalls tranquil morning skies and calm alpine lakes.",
    designTips: {
      webUi: "Weather app cards, patient healthcare portals, and tranquil SaaS background fills.",
      interiors: "Coastal bedrooms, light bathrooms, and relaxed kitchen cabinetry.",
      branding: "Inspires trustworthy calm, clarity, unhurried ease, and gentle reliability.",
    },
    harmonies: {
      complementary: "#CFB7AE",
      analogous: ["#AECFC5", "#B3AECF"],
      triadic: ["#CFCFAE", "#CFAECF"],
    },
    faqs: [
      {
        question: "What is the HEX code for pastel blue?",
        answer: "Classic pastel blue is #AEC6CF (RGB: 174, 198, 207 | HSL: 196°, 26%, 75%).",
      },
    ],
  },
  {
    slug: "yellow",
    name: "Yellow",
    hex: "#FFFF00",
    family: "yellow",
    intro:
      "Yellow is the brightest hue on the visible spectrum, capturing daylight, gold, and vibrant optimism. In UI design, it grabs instantaneous attention and signals warning or energy.",
    designTips: {
      webUi: "Warning banners, discount callout tags, search highlight badges, and high-energy accents.",
      interiors: "Warm breakfast nooks, sunny kitchen walls, and cheerful modern front doors.",
      branding: "Evokes boundless optimism, warmth, speed, and creative intelligence.",
    },
    harmonies: {
      complementary: "#0000FF",
      analogous: ["#BFFF00", "#FFBF00"],
      triadic: ["#00FFFF", "#FF00FF"],
    },
    faqs: [
      {
        question: "What is the HEX code for pure yellow?",
        answer: "Pure sRGB yellow is #FFFF00 (RGB: 255, 255, 0 | HSL: 60°, 100%, 50%). Warm golden yellow is #FFD700.",
      },
      {
        question: "How do I make yellow accessible on the web?",
        answer: "Pure yellow on white has an extremely low 1.07:1 contrast ratio. Always use dark text (#111827) on yellow backgrounds, or darken the yellow to an amber (#B45309) for text on white.",
      },
    ],
  },
  {
    slug: "black",
    name: "Black",
    hex: "#000000",
    family: "black",
    intro:
      "Black represents the total absorption of light. In digital interfaces, it creates ultimate contrast, timeless luxury, and crisp editorial discipline.",
    designTips: {
      webUi: "Primary text on light surfaces, high-contrast dark modes, and high-fashion branding borders.",
      interiors: "Matte black faucets, industrial steel frames, and dramatic moody home studies.",
      branding: "Conveys prestige, timeless power, modern minimalism, and uncompromising authority.",
    },
    harmonies: {
      complementary: "#FFFFFF",
      analogous: ["#111827", "#18181B"],
      triadic: ["#0F172A", "#1C1917"],
    },
    faqs: [
      {
        question: "What is the HEX code for pure black?",
        answer: "Pure black is #000000. In digital UI design, rich off-blacks such as #09090B or #111827 are often preferred for eye comfort.",
      },
    ],
  },
  {
    slug: "beige",
    name: "Beige",
    hex: "#F5F5DC",
    family: "yellow",
    intro:
      "Beige is a calm, pale sandy neutral with soft yellow undertones. It embodies unpretentious warmth, organic linen, and grounding serenity.",
    designTips: {
      webUi: "Warm background fills, architectural portfolio cards, and gentle book layout themes.",
      interiors: "Linen curtains, boucle chairs, travertine stone tiles, and neutral walls.",
      branding: "Signifies understated quiet luxury, organic simplicity, and timeless comfort.",
    },
    harmonies: {
      complementary: "#DCDCF5",
      analogous: ["#F5E6DC", "#EBF5DC"],
      triadic: ["#DCF5F5", "#F5DCEB"],
    },
    faqs: [
      {
        question: "What is the official CSS HEX for beige?",
        answer: "The CSS named color Beige is #F5F5DC (RGB: 245, 245, 220 | HSL: 60°, 56%, 91%).",
      },
    ],
  },
  {
    slug: "maroon",
    name: "Maroon",
    hex: "#800000",
    family: "red",
    intro:
      "Maroon is a deep, brownish-crimson red named after the French word 'marron' (chestnut). It radiates academic heritage, warmth, and grounded strength.",
    designTips: {
      webUi: "Collegiate portals, historical museum websites, and deep autumn e-commerce cards.",
      interiors: "Traditional library walls, Persian carpets, and rich leather dining chairs.",
      branding: "Associated with academic excellence, vintage prestige, and bold grounded heritage.",
    },
    harmonies: {
      complementary: "#008080",
      analogous: ["#800030", "#803000"],
      triadic: ["#000080", "#008000"],
    },
    faqs: [
      {
        question: "What is the difference between maroon and burgundy?",
        answer: "Maroon (#800000) has warm brownish-red undertones, while burgundy (#800020) has cooler purplish undertones.",
      },
    ],
  },
  {
    slug: "grey",
    name: "Grey",
    hex: "#808080",
    family: "grey",
    intro:
      "Grey (or gray) is the ultimate achromatic balance between black and white. It provides impartial objectivity, structural framework, and refined subtlety.",
    designTips: {
      webUi: "The backbone of UI design tokens: border hairlines, secondary text, and inactive toggles.",
      interiors: "Polished concrete, stainless steel appliances, and versatile wall backdrops.",
      branding: "Represents neutrality, high-tech engineering, professional balance, and minimalist design.",
    },
    harmonies: {
      complementary: "#808080",
      analogous: ["#798080", "#807980"],
      triadic: ["#808079", "#798079"],
    },
    faqs: [
      {
        question: "Is it spelled grey or gray?",
        answer: "'Grey' is the preferred British/Commonwealth spelling, while 'gray' is standard in American English. In CSS, both 'grey' and 'gray' map to #808080.",
      },
    ],
  },
  {
    slug: "violet",
    name: "Violet",
    hex: "#8F00FF",
    family: "purple",
    intro:
      "Violet is the spectral color at the shortest wavelength of visible light (~380–450 nm). It is more intense and blue-biased than purple, conveying mystic innovation and electric grandeur.",
    designTips: {
      webUi: "AI product glows, creative branding gradients, and high-visibility digital actions.",
      interiors: "Statement lighting, theatrical velvet accents, and modern artistic gallery spaces.",
      branding: "Signifies spiritual insight, cutting-edge artificial intelligence, and royal distinction.",
    },
    harmonies: {
      complementary: "#70FF00",
      analogous: ["#4000FF", "#DF00FF"],
      triadic: ["#00FF8F", "#FF8F00"],
    },
    faqs: [
      {
        question: "What is the difference between violet and purple?",
        answer: "Violet is a true spectral wavelength with strong blue bias (#8F00FF). Purple is an extra-spectral mixture of red and blue light.",
      },
    ],
  },
  {
    slug: "magenta",
    name: "Magenta",
    hex: "#FF00FF",
    family: "pink",
    intro:
      "Magenta is an extra-spectral color of intense purplish-red that our brain creates when seeing red and blue wavelengths simultaneously without green. It represents bold innovation and exuberant passion.",
    designTips: {
      webUi: "Creative studio portfolios, bold marketing highlights, and dark-mode gradient stops.",
      interiors: "Modern pop-art installations, high-fashion boutique walls, and vibrant neon accents.",
      branding: "Projects bold creative disruption, artistic defiance, and unforgettable vibrancy.",
    },
    harmonies: {
      complementary: "#00FF00",
      analogous: ["#FF007F", "#7F00FF"],
      triadic: ["#00FFFF", "#FFFF00"],
    },
    faqs: [
      {
        question: "What is the HEX code for magenta?",
        answer: "Pure digital magenta is #FF00FF (RGB: 255, 0, 255 | HSL: 300°, 100%, 50%). In process printing, Process Magenta is slightly deeper (#EC008C).",
      },
    ],
  },
];

const CURATED_BY_SLUG = new Map<string, CuratedColor>();
for (const c of CURATED_TARGET_COLORS) {
  CURATED_BY_SLUG.set(c.slug.toLowerCase(), c);
  CURATED_BY_SLUG.set(c.slug.replace(/-/g, "").toLowerCase(), c);
}

export function getCuratedColorBySlug(slug: string): CuratedColor | undefined {
  const norm = slug.toLowerCase().trim();
  return CURATED_BY_SLUG.get(norm) ?? CURATED_BY_SLUG.get(norm.replace(/-/g, ""));
}
