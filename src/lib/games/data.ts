/** Shared word & geography data for browser games. */

export const WORDLE_ANSWERS = [
  "APPLE","BRAVE","CANDY","DREAM","EAGLE","FLAME","GRAPE","HOUSE","IVORY","JOKER",
  "KNIGHT","LEMON","MAGIC","NIGHT","OCEAN","PIANO","QUEEN","RIVER","STORM","TIGER",
  "ULTRA","VIVID","WORLD","XENON","YOUTH","ZEBRA","BLEND","CRISP","DELTA","EMBER",
  "FROST","GHOST","HAPPY","IMAGE","JUICE","KARMA","LUNAR","MANGO","NOVEL","OLIVE",
  "PEARL","QUIRK","ROBOT","SHINE","TRACE","UNITY","VALUE","WHEAT","YACHT","ZONAL",
  "CLOUD","PLANT","MUSIC","LIGHT","SOUND","HEART","SMILE","POWER","PEACE","TRUST",
].filter((w) => w.length === 5);

export const WORDLE_ALLOWED = new Set([
  ...WORDLE_ANSWERS,
  "ABOUT","ABOVE","ACTOR","ACUTE","ADMIT","ADOPT","ADULT","AFTER","AGAIN","AGENT",
  "AGREE","AHEAD","ALARM","ALBUM","ALERT","ALIEN","ALIGN","ALIKE","ALIVE","ALLOW",
  "ALONE","ALONG","ALTER","AMONG","ANGER","ANGLE","ANGRY","APART","APRON","ARENA",
  "ARGUE","ARISE","ARRAY","ARROW","ASIDE","ASSET","AUDIO","AVOID","AWAKE","AWARD",
  "AWARE","BADLY","BAKER","BASES","BASIC","BEACH","BEGAN","BEGIN","BEING","BELOW",
  "BENCH","BILLY","BIRTH","BLACK","BLAME","BLANK","BLAST","BLIND","BLOCK","BLOOD",
  "BOARD","BOOST","BOOTH","BOUND","BRAIN","BRAND","BREAD","BREAK","BREED","BRIEF",
  "BRING","BROAD","BROKE","BROWN","BUILD","BUILT","BUYER","CABLE","CALIF","CARRY",
  "CATCH","CAUSE","CHAIN","CHAIR","CHAOS","CHARM","CHART","CHASE","CHEAP","CHECK",
  "CHEST","CHIEF","CHILD","CHINA","CHOSE","CIVIL","CLAIM","CLASS","CLEAN","CLEAR",
  "CLICK","CLIMB","CLOCK","CLOSE","COACH","COAST","COULD","COUNT","COURT","COVER",
  "CRAFT","CRASH","CRAZY","CREAM","CRIME","CROSS","CROWD","CROWN","CRUDE","CURVE",
  "CYCLE","DAILY","DANCE","DATED","DEALT","DEATH","DEBUT","DELAY","DEPTH","DOING",
  "DOUBT","DOZEN","DRAFT","DRAMA","DRANK","DRAWN","DRESS","DRILL","DRINK","DRIVE",
  "DROVE","DYING","EAGER","EARLY","EARTH","EIGHT","ELITE","EMPTY","ENEMY","ENJOY",
  "ENTER","ENTRY","EQUAL","ERROR","EVENT","EVERY","EXACT","EXIST","EXTRA","FAITH",
  "FALSE","FAULT","FIBER","FIELD","FIFTH","FIFTY","FIGHT","FINAL","FIRST","FIXED",
  "FLASH","FLEET","FLOOR","FLUID","FOCUS","FORCE","FORTH","FORTY","FORUM","FOUND",
  "FRAME","FRANK","FRAUD","FRESH","FRONT","FRUIT","FULLY","FUNNY","GIANT","GIVEN",
  "GLASS","GLOBE","GOING","GRACE","GRADE","GRAND","GRANT","GRASS","GRAVE","GREAT",
  "GREEN","GROSS","GROUP","GROWN","GUARD","GUESS","GUEST","GUIDE","HAPPY","HARRY",
  "HEAVY","HENCE","HENRY","HORSE","HOTEL","HUMAN","IDEAL","INDEX","INNER","INPUT",
  "ISSUE","JAPAN","JIMMY","JOINT","JONES","JUDGE","KNOWN","LABEL","LARGE","LASER",
  "LATER","LAUGH","LAYER","LEARN","LEASE","LEAST","LEAVE","LEGAL","LEVEL","LEWIS",
  "LIGHT","LIMIT","LINKS","LIVES","LOCAL","LOOSE","LOWER","LUCKY","LUNCH","LYING",
  "MAGIC","MAJOR","MAKER","MARCH","MARIA","MATCH","MAYBE","MAYOR","MEANT","MEDIA",
  "METAL","MIGHT","MINOR","MINUS","MIXED","MODEL","MONEY","MONTH","MORAL","MOTOR",
  "MOUNT","MOUSE","MOUTH","MOVED","MOVIE","NEEDS","NEVER","NEWLY","NIGHT","NOISE",
  "NORTH","NOTED","NOVEL","NURSE","OCCUR","OFFER","OFTEN","ORDER","OTHER","OUGHT",
  "PAINT","PANEL","PAPER","PARTY","PEACE","PETER","PHASE","PHONE","PHOTO","PIECE",
  "PILOT","PITCH","PLACE","PLAIN","PLANE","PLANT","PLATE","POINT","POUND","POWER",
  "PRESS","PRICE","PRIDE","PRIME","PRINT","PRIOR","PRIZE","PROOF","PROUD","PROVE",
  "QUEEN","QUICK","QUIET","QUITE","RADIO","RAISE","RANGE","RAPID","RATIO","REACH",
  "READY","REALM","REBEL","REFER","RELAX","REPAY","REPLY","RIGHT","RIGID","RIVAL",
  "RIVER","ROBIN","ROGER","ROMAN","ROUGH","ROUND","ROUTE","ROYAL","RURAL","SCALE",
  "SCENE","SCOPE","SCORE","SENSE","SERVE","SEVEN","SHALL","SHAPE","SHARE","SHARP",
  "SHEET","SHELF","SHELL","SHIFT","SHINE","SHIRT","SHOCK","SHOOT","SHORT","SHOWN",
  "SIDED","SIGHT","SILLY","SINCE","SIXTH","SIXTY","SIZED","SKILL","SLEEP","SLIDE",
  "SMALL","SMART","SMILE","SMITH","SMOKE","SOLID","SOLVE","SORRY","SOUND","SOUTH",
  "SPACE","SPARE","SPEAK","SPEED","SPEND","SPENT","SPLIT","SPOKE","SPORT","STAFF",
  "STAGE","STAKE","STAND","START","STATE","STEAM","STEEL","STEEP","STEER","STEIN",
  "STICK","STILL","STOCK","STONE","STOOD","STORE","STORM","STORY","STRIP","STUCK",
  "STUDY","STUFF","STYLE","SUGAR","SUITE","SUPER","SWEET","TABLE","TAKEN","TASTE",
  "TAXES","TEACH","TEETH","TERRY","TEXAS","THANK","THEFT","THEIR","THEME","THERE",
  "THESE","THICK","THING","THINK","THIRD","THOSE","THREE","THREW","THROW","THUMB",
  "TIGHT","TIRED","TITLE","TODAY","TOPIC","TOTAL","TOUCH","TOUGH","TOWER","TRACK",
  "TRADE","TRAIN","TREAT","TREND","TRIAL","TRIBE","TRICK","TRIED","TRIES","TRUCK",
  "TRULY","TRUNK","TRUST","TRUTH","TWICE","TWIST","TYLER","UNDER","UNDUE","UNION",
  "UNITY","UNTIL","UPPER","UPSET","URBAN","USAGE","USUAL","VALID","VALUE","VIDEO",
  "VIRUS","VISIT","VITAL","VOCAL","VOICE","WASTE","WATCH","WATER","WHEEL","WHERE",
  "WHICH","WHILE","WHITE","WHOLE","WHOSE","WOMAN","WOMEN","WORLD","WORRY","WORSE",
  "WORST","WORTH","WOULD","WOUND","WRITE","WRONG","WROTE","YIELD","YOUNG","YOUTH",
]);

export const HANGMAN_WORDS: { word: string; hint: string }[] = [
  { word: "ELEPHANT", hint: "Large land mammal" },
  { word: "COMPUTER", hint: "Digital machine" },
  { word: "RAINBOW", hint: "Colorful arc in the sky" },
  { word: "GUITAR", hint: "Stringed instrument" },
  { word: "PYRAMID", hint: "Egyptian monument" },
  { word: "VOLCANO", hint: "Erupting mountain" },
  { word: "LIBRARY", hint: "Home of books" },
  { word: "BICYCLE", hint: "Two wheels" },
  { word: "DIAMOND", hint: "Precious gem" },
  { word: "SUNFLOWER", hint: "Tall yellow flower" },
  { word: "ASTRONAUT", hint: "Space traveler" },
  { word: "CHOCOLATE", hint: "Sweet treat" },
  { word: "BUTTERFLY", hint: "Winged insect" },
  { word: "ADVENTURE", hint: "Exciting journey" },
  { word: "KEYBOARD", hint: "Typing device" },
  { word: "MOUNTAIN", hint: "High peak" },
  { word: "TREASURE", hint: "Hidden riches" },
  { word: "UMBRELLA", hint: "Rain shield" },
  { word: "DINOSAUR", hint: "Extinct reptile" },
  { word: "FIREWORK", hint: "Sky celebration" },
];

export const WORD_SEARCH_WORDS = [
  "COLOR", "PIXEL", "BRAND", "SHADE", "TINT", "HUE", "PALETTE", "DESIGN",
  "LIGHT", "DARK", "ROSE", "CYAN", "GOLD", "INK", "ART", "GRID",
];

export type CountryQuiz = {
  name: string;
  capital: string;
  flag: string;
  code: string;
};

export const COUNTRIES: CountryQuiz[] = [
  { name: "India", capital: "New Delhi", flag: "🇮🇳", code: "IN" },
  { name: "United States", capital: "Washington, D.C.", flag: "🇺🇸", code: "US" },
  { name: "United Kingdom", capital: "London", flag: "🇬🇧", code: "GB" },
  { name: "France", capital: "Paris", flag: "🇫🇷", code: "FR" },
  { name: "Germany", capital: "Berlin", flag: "🇩🇪", code: "DE" },
  { name: "Japan", capital: "Tokyo", flag: "🇯🇵", code: "JP" },
  { name: "Brazil", capital: "Brasília", flag: "🇧🇷", code: "BR" },
  { name: "Australia", capital: "Canberra", flag: "🇦🇺", code: "AU" },
  { name: "Canada", capital: "Ottawa", flag: "🇨🇦", code: "CA" },
  { name: "Italy", capital: "Rome", flag: "🇮🇹", code: "IT" },
  { name: "Spain", capital: "Madrid", flag: "🇪🇸", code: "ES" },
  { name: "China", capital: "Beijing", flag: "🇨🇳", code: "CN" },
  { name: "Russia", capital: "Moscow", flag: "🇷🇺", code: "RU" },
  { name: "South Korea", capital: "Seoul", flag: "🇰🇷", code: "KR" },
  { name: "Mexico", capital: "Mexico City", flag: "🇲🇽", code: "MX" },
  { name: "Egypt", capital: "Cairo", flag: "🇪🇬", code: "EG" },
  { name: "Turkey", capital: "Ankara", flag: "🇹🇷", code: "TR" },
  { name: "Argentina", capital: "Buenos Aires", flag: "🇦🇷", code: "AR" },
  { name: "South Africa", capital: "Pretoria", flag: "🇿🇦", code: "ZA" },
  { name: "Saudi Arabia", capital: "Riyadh", flag: "🇸🇦", code: "SA" },
  { name: "Indonesia", capital: "Jakarta", flag: "🇮🇩", code: "ID" },
  { name: "Thailand", capital: "Bangkok", flag: "🇹🇭", code: "TH" },
  { name: "Sweden", capital: "Stockholm", flag: "🇸🇪", code: "SE" },
  { name: "Norway", capital: "Oslo", flag: "🇳🇴", code: "NO" },
  { name: "Netherlands", capital: "Amsterdam", flag: "🇳🇱", code: "NL" },
  { name: "Switzerland", capital: "Bern", flag: "🇨🇭", code: "CH" },
  { name: "Greece", capital: "Athens", flag: "🇬🇷", code: "GR" },
  { name: "Portugal", capital: "Lisbon", flag: "🇵🇹", code: "PT" },
  { name: "Poland", capital: "Warsaw", flag: "🇵🇱", code: "PL" },
  { name: "Ireland", capital: "Dublin", flag: "🇮🇪", code: "IE" },
  { name: "New Zealand", capital: "Wellington", flag: "🇳🇿", code: "NZ" },
  { name: "Singapore", capital: "Singapore", flag: "🇸🇬", code: "SG" },
  { name: "Vietnam", capital: "Hanoi", flag: "🇻🇳", code: "VN" },
  { name: "Malaysia", capital: "Kuala Lumpur", flag: "🇲🇾", code: "MY" },
  { name: "Nigeria", capital: "Abuja", flag: "🇳🇬", code: "NG" },
  { name: "Kenya", capital: "Nairobi", flag: "🇰🇪", code: "KE" },
  { name: "Chile", capital: "Santiago", flag: "🇨🇱", code: "CL" },
  { name: "Peru", capital: "Lima", flag: "🇵🇪", code: "PE" },
  { name: "Colombia", capital: "Bogotá", flag: "🇨🇴", code: "CO" },
  { name: "Pakistan", capital: "Islamabad", flag: "🇵🇰", code: "PK" },
];

export function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pickOne<T>(arr: T[], seed = Date.now()): T {
  return shuffle(arr, seed)[0]!;
}
