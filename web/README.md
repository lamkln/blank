# Blank landing site

OpenCode-inspired marketing page for Blank (cream canvas `#fdfcfc`, ink `#201d1d`, monospace typography, dark TUI hero).

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Deploy on Vercel

1. Import the repo in Vercel and set **Root Directory** to `web`.
2. Or from this folder: `npx vercel link` then `npx vercel --prod`.

Optional environment variables:

- `NEXT_PUBLIC_GITHUB_REPO` — default `https://github.com/lamkln/blank`
- `NEXT_PUBLIC_RELEASES_URL` — default GitHub latest release URL

## Temporary deploy (no login)

```bash
npx vercel deploy --temporary
```

Use the printed **claim URL** to attach the deployment to your Vercel account before it expires.
