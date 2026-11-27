# trackr

Mobile-first score tracker for table games. Flip 7 and Hearts ship built-in; sessions live in **localStorage** on this device.

**Live:** [ryazlee.github.io/trackr](https://ryazlee.github.io/trackr/)

## Privacy

- **Scores stay local.** Players, rounds, and game configs are stored in your browser. Nothing is uploaded, and there is no login.
- **Analytics.** Anonymous pageviews go to GoatCounter. Paths only — no score payloads or hashes.

## Games

| Game | Target | Wins | Scoring factors |
|---|---|---|---|
| **Flip 7** | 200 | highest | Number-card sum → ×2 → modifiers (+2…+10) → Flip 7 +15; bust = 0 |
| **Hearts** | 100 | lowest | Hearts (1 each) + ♠Q (+13); shoot the moon → shooter 0, others 26 |

Built-ins are hardcoded. Custom games can be added later under the `trackr-games` localStorage key (same shape as `GameConfig`).

## Develop

```bash
npm ci
npm run dev
```

```bash
npm run build
npm run lint
npm run preview
```

Vite `base` is `/trackr/` for GitHub Pages.

## Deploy

Push to `main` runs [`.github/workflows/deploy.yaml`](.github/workflows/deploy.yaml) (Node 20, `npm ci`, build, upload `dist`, deploy Pages).

**One-time GitHub setup** (repo owner):

1. **Settings → Pages** → Source: **GitHub Actions**
2. Merge to `main` (or run **Deploy to GitHub Pages** via workflow dispatch)

Site URL: `https://ryazlee.github.io/trackr/`

## Stack

Vite + React 19 + TypeScript, semantic CSS + Tailwind 4 tokens, oxlint, React Router 7. Patterns from [ryazlee/dev-guide](https://github.com/ryazlee/dev-guide) / overlap / poker-session-manager.
