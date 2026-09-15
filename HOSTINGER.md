# Hostinger deployment — colorBase (colorbase.in)

## Important

GitHub already has a valid Next.js app at the **repo root**:
https://github.com/mukesh088/colorbase/blob/main/package.json

If hPanel diagnosis says `package.json` / project structure is **null**, Hostinger is
**not reading the repo root**. That is a panel setting problem, not missing source files.

## Exact hPanel values (copy these)

Create / edit the Node.js app → Import Git repository → `mukesh088/colorbase` → branch `main`.

| Field | Exact value |
| --- | --- |
| Application type | `next` (Next.js) |
| Branch | `main` |
| Root directory | **leave blank** (empty). Do **not** type `/`, `colorbase`, `src`, or any folder |
| Node.js version | `20` |
| Package manager | `npm` |
| Build script | `build` |
| Output directory | `.next` |
| Entry file | **leave blank** (Hostinger ignores it for Next.js) |
| Start command | leave default / `npm run start` |

### Env vars

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
NODE_ENV=production
```

Optional:

```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

Save settings → **Deploy** / **Redeploy**.

## If it still shows null

1. Delete the Node.js app in hPanel and create a **new** one with **Import Git repository** (do not upload a ZIP from Desktop).
2. Re-authorize the Hostinger GitHub App for `mukesh088/colorbase`.
3. Confirm Root directory is empty and Application type is `next`.
4. Do not deploy the local nested `Desktop/colorbase/colorbase` folder as a ZIP — use GitHub only.

## How Hostinger runs Next.js

Hostinger wraps your config and forces `output: "standalone"`, then starts the
bundled server. Keep standard scripts:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

Output directory must stay `.next`.

## After deploy

1. Restart the Node app
2. Purge CDN / LiteSpeed cache for `colorbase.in` + `www`
3. Hard refresh (Ctrl+F5)

## Domain

Point `colorbase.in` / `www` to Hostinger and enable SSL.
