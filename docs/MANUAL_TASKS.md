# Manual tasks for the site owner

Things the code cannot do for you, in order of impact. The 2026-11-23 live audit found the site technically sound; Google hasn't indexed it mainly because **Search Console was never set up** (step 1).

## 1. Google Search Console — do this first (about 15 minutes)
Google does not support IndexNow and retired sitemap "ping" URLs in 2023, so Search Console is the only way to tell Google the site exists.

1. Open https://search.google.com/search-console, click **Add property** and choose **Domain**, then enter `colorbase.in`.
2. Google shows a TXT record like `google-site-verification=abc123…`. Copy it.
3. In Hostinger hPanel go to **Domains → colorbase.in → DNS / Nameservers → DNS records** and add:
   - Type `TXT`, Name `@`, Value: the full `google-site-verification=…` string, TTL default.
4. Back in Search Console click **Verify**. DNS can take a few minutes up to an hour; retry if it fails at first. (DNS verification needs no redeploy. The `GSC_VERIFICATION` meta-tag route in §3 also works, but needs a rebuild.)
5. **Sitemaps** (left menu) → enter `sitemap.xml` → **Submit**. Search Console reads every `/sitemaps/*.xml` file in the index. Expect "Success" and roughly 13,500 discovered URLs after the next deploy (the pruned sitemap).
6. **URL Inspection** (search bar at the top) → paste `https://colorbase.in/` → **Test live URL**.
   - If the result says **"URL is available to Google"**, the CDN is letting Googlebot in. Click **Request indexing**.
   - If it says **blocked / 403 / "Failed: Blocked due to access forbidden"**, the Hostinger CDN is blocking Googlebot: do §2 now, then test again.
7. Request indexing for the hubs (there is a daily limit of about 10–12; continue the next day). Hubs link to everything else:
   - https://colorbase.in/
   - https://colorbase.in/tools
   - https://colorbase.in/flags
   - https://colorbase.in/teams
   - https://colorbase.in/colors-that-go-with
   - https://colorbase.in/color-names
   - https://colorbase.in/brands
   - https://colorbase.in/contrast-checker
   - https://colorbase.in/color-picker
   - https://colorbase.in/palette-generator
   - https://colorbase.in/image-color-picker
   - https://colorbase.in/color-blind-test
   - https://colorbase.in/color-blind-simulator
   - https://colorbase.in/discord-color-text-generator
   - https://colorbase.in/gradient-generator
   - https://colorbase.in/blog
   - https://colorbase.in/flags/india
   - https://colorbase.in/teams/ipl
   - https://colorbase.in/colors-that-go-with/navy-blue
   - https://colorbase.in/tailwind-colors
8. Check **Pages** (indexing report) weekly. First pages usually appear within days to two weeks of submitting. "Discovered – currently not indexed" clears as Google crawls; "Crawled – currently not indexed" on one page type means that type needs more unique content.

## 2. Hostinger CDN bot settings
The live audit found:
- Requests that say "Googlebot" but come from a non-Google IP get **HTTP 403** from Hostinger's CDN (`hcdn`). This is most likely its fake-bot filter (real Googlebot passes), but only the Search Console live test (§1 step 6) can confirm it.
- **GPTBot gets HTTP 429** (rate limited). That keeps ColorBase out of ChatGPT search results and citations.

In hPanel, open **Websites → colorbase.in → Performance → CDN** (or **Security**) and look for bot protection / "AI crawlers" / "AI Audit" settings:
- Make sure search engine bots (Google, Bing) are **allowed**.
- Allow the AI search crawlers you want citations from: `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Claude-User`, `Applebot`. (robots.txt already allows them; the CDN overrides robots.txt.)
- If the live test in §1 fails and you can't find the setting, ask Hostinger support: "Your CDN returns 403 to Googlebot on colorbase.in; please whitelist verified search engine bots."

## 3. Deploy with the right environment variables
Set these in Hostinger **before** the build (static pages bake them in), then redeploy:
- `NEXT_PUBLIC_SITE_URL=https://colorbase.in`
- `GSC_VERIFICATION`: only needed if you verify with the meta tag instead of DNS (the `content` value of Google's `google-site-verification` tag).
- `BING_VERIFICATION`: the value of Bing's `msvalidate.01` meta tag (not needed if you import from Search Console, see §4).

Force HTTPS and the www → apex redirect are already working (checked 2026-11-23).

## 4. Bing Webmaster Tools and IndexNow (Bing, Yandex, Seznam, Naver; Bing also feeds ChatGPT search and Copilot)
1. At https://www.bing.com/webmasters choose **Import from Google Search Console** (after §1) and confirm `https://colorbase.in/sitemap.xml` is listed.
2. IndexNow key file (live): https://colorbase.in/42260d102688fbbfae40b229ce3088dc.txt
3. Submissions:
   ```
   npm run seo:indexnow -- --dry-run                    # preview from the live sitemap
   npm run seo:indexnow                                 # send every live sitemap URL
   npm run seo:indexnow -- --since 2026-12-01           # only URLs changed since a date
   npm run seo:indexnow -- --from http://localhost:3123 # read the sitemap from a local build
   ```

## 5. Things that make Google index a new site faster
Google crawls new domains slowly until other sites link to them. Each of these is a real link Google follows:
- Launch listings: Product Hunt, AlternativeTo, SaaSHub, Toolify, There's An AI For That, BetaList.
- Link colorbase.in from your GitHub profile/README, LinkedIn, X/Twitter bio, and any design communities you post in (Dribbble, Behance, Reddit r/web_design and r/tailwindcss where self-promotion is allowed).
- Answer color questions on Stack Overflow / Reddit with a link to the specific tool page when it genuinely answers the question.

## 6. Check the data you approved
- Flags (`src/lib/data/flags.json`) and teams (`src/lib/data/teams.json`) are `verified: true` at your request. Spot-check a few against official specs; fix a value by editing the JSON (and set `verified: false` if you want a page out of the index until fixed).
- Known quirks: Germany's flag red is listed as #D00000 (often quoted #DD0000); NBA colors come from the 2014–15 logo sheet; some NFL entries' HEX and RGB disagree.
- 6 IPL teams (Delhi Capitals, Punjab Kings, Rajasthan Royals, Sunrisers Hyderabad, Gujarat Titans, Lucknow Super Giants) are missing because Wikimedia rate-limited the download; send their official HEX codes or ask me to retry.

## 7. Ongoing
- Each month, ask ChatGPT, Perplexity and Gemini your target questions ("flag colors of India hex", "Lakers colors hex", "colors that go with navy blue") and note whether ColorBase is cited.
