# public/

Static assets served as-is from the site root. A file at
`public/images/photo.png` is available at `/images/photo.png`.

```tsx
import Image from "next/image";

<Image src="/images/photo.png" alt="" width={800} height={600} />
```

- `images/` — photos, screenshots, og-images, etc.
- `fonts/` — self-hosted font files (woff2, etc.)

Use this folder for things referenced by URL (favicons, robots.txt,
og-images). For images you `import` into a component, use
`src/assets/` instead.
