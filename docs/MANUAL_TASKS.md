# Manual tasks for the site owner

Things the code cannot do for you. Do them in this order after deploying the `seo/*` branches.

## 1. Deploy with the right environment variables
Set these in Hostinger **before** the build (static pages bake them in), then redeploy:
- `GSC_VERIFICATION` — the value of Google's `google-site-verification` meta tag (only the content string).
- `BING_VERIFICATION` — the value of Bing's `msvalidate.01` meta tag.
- `NEXT_PUBLIC_SITE_URL=https://colorbase.in`

Then turn on **Force HTTPS** for colorbase.in in hPanel and check both redirect to `https://colorbase.in/`:
```
curl -I http://colorbase.in/
curl -I https://www.colorbase.in/
```

## 2. Google Search Console (the only way to speed up Google)
Google does not support IndexNow and retired sitemap "ping" URLs in 2023.
1. Add a **Domain property** for `colorbase.in` and verify it with the DNS TXT record (or the meta tag from step 1).
2. **Sitemaps → Add**: `https://colorbase.in/sitemap.xml` (a sitemap index; Search Console reads every `/sitemaps/*.xml` file in it).
3. **URL Inspection → Request indexing** for the most important new pages (each request is limited per day, so start with hubs, which link to everything else):
   - https://colorbase.in/
   - https://colorbase.in/tools
   - https://colorbase.in/flags
   - https://colorbase.in/teams
   - https://colorbase.in/teams/ipl
   - https://colorbase.in/teams/nba
   - https://colorbase.in/colors-that-go-with
   - https://colorbase.in/color-blind-test
   - https://colorbase.in/color-blind-simulator
   - https://colorbase.in/discord-color-text-generator
   - https://colorbase.in/color-names
   - https://colorbase.in/contrast-checker
   - https://colorbase.in/color-picker
   - https://colorbase.in/palette-generator
   - https://colorbase.in/image-color-picker
   - https://colorbase.in/flags/india
   - https://colorbase.in/teams/ipl/mumbai-indians
   - https://colorbase.in/colors-that-go-with/navy-blue
   - https://colorbase.in/brands
   - https://colorbase.in/gradient-library
4. Check **Pages** (indexing report) weekly. "Discovered – currently not indexed" usually clears as Google crawls; "Crawled – currently not indexed" on a page type means it needs more unique content.

## 3. Bing Webmaster Tools and IndexNow (instant for Bing, Yandex, Seznam, Naver)
1. In Bing Webmaster Tools choose **Import from Google Search Console** (or verify with `BING_VERIFICATION`) and submit `https://colorbase.in/sitemap.xml`.
2. After the deploy is live, confirm the IndexNow key file opens: https://colorbase.in/42260d102688fbbfae40b229ce3088dc.txt
3. Submit every URL once:
   ```
   npm run seo:indexnow -- --dry-run   # preview
   npm run seo:indexnow                # send
   ```
   After later content updates, send only what changed: `npm run seo:indexnow -- --since 2026-12-01`.

## 4. Check the data you approved
- Flags (`src/lib/data/flags.json`) and teams (`src/lib/data/teams.json`) are now `verified: true` at your request. Spot-check a few against official specs; fix a value by editing the JSON (and set `verified: false` if you want a page out of the index until fixed).
- Known quirks: Germany's flag red is listed as #D00000 (often quoted #DD0000); NBA colors come from the 2014–15 logo sheet; some NFL entries' HEX and RGB disagree.
- 6 IPL teams (Delhi Capitals, Punjab Kings, Rajasthan Royals, Sunrisers Hyderabad, Gujarat Titans, Lucknow Super Giants) are missing because Wikimedia rate-limited the download; send their official HEX codes or ask me to retry.

## 5. Ongoing
- Each month, ask ChatGPT, Perplexity and Gemini your target questions ("flag colors of India hex", "Lakers colors hex", "colors that go with navy blue") and note whether ColorBase is cited.
- Launch listings: Product Hunt, AlternativeTo, SaaSHub, Toolify, There's An AI For That, BetaList.
