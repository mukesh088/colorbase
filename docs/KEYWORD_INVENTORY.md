# 256k keyword inventory

The previous ~256k query list is restored as a **generated inventory**, not as 256k new pages and not as 256k paid rank-tracker slots.

## Generate

```bash
npm run keywords:inventory
```

Writes:

- `data/keyword-inventory-256k.csv` (gitignored)
- `data/keyword-inventory-meta.json` (counts)

Each row is `keyword,locale=US,device=desktop,canonical_url,group`. URLs already exist (`/color-names/*`, `/brands/*`, tools, families).

## What to import where

| File | Size | Use |
| --- | --- | --- |
| `docs/RANK_TRACKING.csv` | ~70 rows | Paid rank tracker + weekly GSC |
| `data/keyword-inventory-256k.csv` | 256,000 | Offline / GSC query matching / bulk research |

Do **not** paste 256k rows into AccuRanker or Ahrefs rank tracking (cost and noise). Filter GSC Performance by regex or page, not by 256k exact queries.

## What this is not

- Not new landing pages
- Not HEX × AI doorway URLs
- Not a promise that Google will rank 256k keywords
