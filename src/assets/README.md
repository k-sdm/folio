# src/assets/

Assets imported directly into components. The bundler processes these
(optimization, hashing, etc.), and `next/image` can infer dimensions
automatically.

```tsx
import Image from "next/image";
import photo from "@/assets/images/photo.png";

<Image src={photo} alt="" />
```

Use this for images that belong to specific components. For static
files referenced by URL, use the top-level `public/` folder instead.
