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
| Entry file | **leave empty** (use `next start`) |

Env:

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
NODE_ENV=production
```

Do **not** set `PREBUILD_LIBRARY_PAGES=1` on Hostinger (that prebuilds 7k+ pages and burns inodes).

4. Click **Deploy**
5. Open **Deployments** → open the new build → you should now see real build logs (not null)

## Do NOT

- Upload a ZIP of `Desktop/colorbase` (can include a nested clone)
- Set Root directory to `/`, `src`, or `colorbase`
- Use Hostinger Connector against a nested/wrong folder

## Files & directories (inodes) limit

If hPanel warns that **inodes are running out**:

1. **Delete old / unused websites and Node apps** in hPanel (each failed deploy can leave a full `node_modules` + `.next`).
2. **Remove leftover folders** via File Manager / SSH under `domains/` or `nodejs/` that are not the live app (old clones, `node_modules` copies, `.next` from failed builds).
3. **Clear Hostinger caches** for the site, then **Redeploy once** from Git (do not keep stacking deploys without cleanup).
4. Prefer **one** Node.js app for `colorbase.in` — not ZIP + Git + Connector side by side.
5. This repo is tuned for low inodes: no `standalone` output, and large library pages are generated on demand (still listed in the sitemap).

### What happens if inodes run out?

New files cannot be created → builds fail, app may crash, cron/tasks stop, sometimes odd “missing file” errors. Fix by freeing inodes (delete unused trees), then redeploy.

## After a green build

Restart the Node process, purge CDN cache, hard-refresh the site.
