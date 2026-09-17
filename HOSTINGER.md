# Fix Hostinger “package.json / structure / logs = null”

That diagnosis means Hostinger **never found your app root**. The GitHub repo is fine.

## Confirmed on GitHub (`main`)

- https://github.com/mukesh088/colorbase/blob/main/package.json
- https://github.com/mukesh088/colorbase/blob/main/next.config.js
- `src/app/`, `public/`, `package-lock.json` all present

## Do this in hPanel (required)

### A) Use the Node.js Git flow (not generic Git)

1. **Websites → Add Website → Node.js web app** (not “Git” static deploy)
2. **Import Git repository** → connect GitHub App → allow `mukesh088/colorbase`
3. Select repo **mukesh088/colorbase**, branch **main**

### B) If `colorbase.in` already exists as a normal website

Remove / disconnect that website first. Hostinger’s Node.js flow needs a **fresh** web-app slot for the domain.

### C) Deploy settings (copy exactly)

| Field | Value |
| --- | --- |
| Framework | **Next.js** (`next`) |
| Root directory | **leave empty** |
| Node.js | **20** |
| Build script | `build` |
| Output directory | `.next` |
| Entry file | **leave empty** |

Env:

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
NODE_ENV=production
```

4. Click **Deploy**
5. Open **Deployments** → open the new build → you should now see real build logs (not null)

## Do NOT

- Upload a ZIP of `Desktop/colorbase` (can include a nested clone)
- Set Root directory to `/`, `src`, or `colorbase`
- Use Hostinger Connector against a nested/wrong folder

## After a green build

Restart the Node process, purge CDN cache, hard-refresh the site.
