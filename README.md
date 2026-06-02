# folio

Personal website built with [Next.js](https://nextjs.org) (App Router), React, TypeScript, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Editing content

- **Hero / About / Contact** — `src/app/page.tsx`
- **Projects** — `src/data/projects.ts`
- **Nav & footer** — `src/components/`
- **Site metadata (title, description)** — `src/app/layout.tsx`
- **Theme colors** — `src/app/globals.css`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |

## Deployment

Deployed on [Vercel](https://vercel.com). Pushing to `main` triggers a production deploy once the repo is connected.
