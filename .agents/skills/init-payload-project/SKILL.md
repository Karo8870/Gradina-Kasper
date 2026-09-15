---
name: init-payload-project
description: Apply the developer's standard setup immediately after creating a fresh Payload CMS project. Use only for newly initialized, otherwise unmodified Payload projects.
---

# General

- Always use bun

# Prettier

1. Install prettier and prettier-plugin-tailwindcss as a dev dependencies
2. Create the file `.prettierrc` in the root of the project with the following config:

```json
{
  "singleQuote": true,
  "jsxSingleQuote": true,
  "trailingComma": "none",
  "useTabs": false,
  "tabWidth": 2,
  "plugins": [
    "prettier-plugin-tailwindcss"
  ]
}
```

# Environment variables

1. Install `envalid` as a dependency
2. Create a file `env.config.ts` with the following general structure. Add default values only for variables you see fit, for the rest force type to be non null using '!'. The env vars can change based on the project:

```ts
import { cleanEnv, str, url } from 'envalid';

export default cleanEnv(process.env, {
  S3_BUCKET: str(),
  S3_ACCESS_KEY_ID: str(),
  S3_SECRET_ACCESS_KEY: str(),
  S3_BUCKET_PUBLIC_ENDPOINT: str(),
  S3_REGION: str({
    default: 'auto'
  }),

  PAYLOAD_SECRET: str(),
  DATABASE_URL: url(),

  // SMTP_HOST
  // SMTP_PORT
  // SMTP_USER
  // SMTP_PASS
  // SMTP_FROM_NAME
  // SMTP_FROM_ADDRESS
  // SMTP_SECURE (true or false)
});
```

# Tailwind

1. Install `tailwindcss`, `@tailwindcss/postcss` and `postcss` as dependencies
2. Create a file `postcss.config.js` with the following code:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

3. If there isn't one already, create a `globals.css` file and add the following at the top most line:

```css
@import "tailwindcss";
```

4. Import `globals.css` inside the `layout.tsx` file from the (frontend) folder.

# ShadCN

1. Use `bunx --bun shadcn@latest init` to initialize ShadCN

# Icons

1. Install `lucide-react` for general icons
2. Install `@icons-pack/react-simple-icons` for social and brand icons

# Storage

1. Install `@payloadcms/storage-s3` as a dependency
2. Add the following code in `payload.config.ts` as a plugin:

```ts
s3Storage({
  collections: {
    media: {
      disablePayloadAccessControl: true,
      generateFileURL({ filename, prefix }) {
        const key = prefix ? `${prefix}/${filename}` : filename;

        return `${envConfig.R2_PUBLIC_URL}/${key}`;
      }
    }
  },
  bucket: envConfig.S3_BUCKET,
  config: {
    endpoint: envConfig.S3_BUCKET_PUBLIC_ENDPOINT,
    credentials: {
      accessKeyId: envConfig.S3_ACCESS_KEY_ID,
      secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY
    },
    region: envConfig.S3_REGION
  },
  clientUploads: true
})
```

# Mailing

1. Install `@payloadcms/email-nodemailer` as a dependency
2. Add the following code in `payload.config.ts`:

```ts
nodemailerAdapter({
  defaultFromAddress: envConfig.SMTP_FROM_ADDRESS,
  defaultFromName: envConfig.SMTP_FROM_NAME,
  transportOptions: {
    host: envConfig.SMTP_HOST,
    port: envConfig.SMTP_PORT,
    auth: {
      user: envConfig.SMTP_USER,
      pass: envConfig.SMTP_PASS,
    }
  }
})
```

# Sharp

1. Add `sharp` as a dependency
2. Add sharp in build config
3. Configure the `Media.ts` collection:

```ts
upload: {
  formatOptions: {
    format: 'webp',
    options: {
      quality: 80,
      effort: 5
    }
  },

  crop: true,
  focalPoint: true,

  adminThumbnail: 'thumbnail',

  withMetadata: false
}
```

# src/lib/cms.ts

Add the following code in the file:

```ts
import { getPayload } from 'payload';
import config from '@payload-config';

let payloadPromise: ReturnType<typeof getPayload> | undefined;

export function getCMS() {
  payloadPromise ??= getPayload({ config });

  return payloadPromise;
}
```

# src/lib/generate-metadata.ts

```ts
import { getPayload, GlobalSlug } from 'payload';
import config from '@payload-config';
import { Media } from '@/payload-types';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';

const defaultTitle = '';
const defaultDescription = '';
const defaultImage = '';

export async function generateGlobalMetadata<T extends GlobalSlug>(slug: T) {
  const payload = await getCMS();

  const doc = (await payload.findGlobal({
    slug
  })) as {
    meta: {
      title?: string | null;
      image?: (number | null) | Media;
      description?: string | null;
    };
  };

  const title = doc?.meta?.title ?? defaultTitle;
  const description = doc?.meta?.description ?? defaultDescription;
  const image = doc?.meta?.image?.url ?? defaultImage;

  return {
    description,
    title,
    openGraph: {
      title,
      description,
      url: envConfig.NEXT_PUBLIC_SERVER_URL,
      images: [
        image
      ]
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [image]
    }
  };
}
```

# SEO

1. If it doesn't already exist, install `@payloadcms/plugin-seo` and configure it

# Robots

Add `src/app/robots.ts` with the following code:

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseURL = envConfig.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/']
    },
    sitemap: `${baseURL}/sitemap.xml`
  };
}
```

# Sitemap

Add `src/app/sitemap.ts` with the following template, add routes based on project, by default add no routes:

```ts
import type { MetadataRoute } from 'next';

import { getCMS } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getCMS();

  // Example code

  const [projects, pages, articles] = await Promise.all([
    payload.find({ collection: 'projects', pagination: false, depth: 0 }),
    payload.find({ collection: 'pages', pagination: false, depth: 0 }),
    payload.find({ collection: 'articles', pagination: false, depth: 0 })
  ]);
  const baseURL = envConfig.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '');
  const entry = (path: string, lastModified?: string | null) => ({
    url: `${baseURL}${path}`,
    ...(lastModified ? { lastModified: new Date(lastModified) } : {})
  });

  return [
    entry('/'),
    entry('/contact'),
    entry('/portfolio'),
    ...projects.docs.map((project) => entry(`/portfolio/${project.slug}`, project.updatedAt)),
    ...pages.docs.map((page) => entry(`/${page.slug}`, page.updatedAt)),
    ...articles.docs.map((article) => entry(`/articles/${article.slug}`, article.updatedAt))
  ];
}
```

# Manifest

Add `src/app/manifest.ts` with the following template:

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My Site',
    short_name: 'My Site',
    description: 'A short description of my site.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ]
  }
}
```

# 404 Not Found Page

Add an actual file for the not found page, it will return the default 404 not found nextjs page.

# Security Headers & Next.JS config

In `next.config.ts`, add the following code on top of the already existing config. Keep in mind the existing config might have a slightly different format:

```ts
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  }
];

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  },
  reactStrictMode: true
}
```

# Cookies

1. Add `c15t` as a dependency. C15T will only be used in offline mode, no need to save consent configuration server side.
2. Create a component for the cookies in the components folder called `cookie-consent.tsx` and add it as a wrapper in `(frontend)/layout.tsx`:

```ts
import {
  ConsentManagerProvider,
  ConsentBanner,
  ConsentDialog,
} from "@c15t/nextjs";

export default function() {
  return (
    <ConsentManagerProvider options={{
      mode: 'offline',
      scripts: [],
    }}>
      {children}
      <ConsentBanner />
      <ConsentDialog />
    </ConsentManagerProvider>
  );
}
```

# TO DELETE

1. All EsLint packages using `bun rm <package>` and all EsLint related files
2. All test packages using `bun rm <package>` and all test related files, including playwright and the test folder
3. Delete docker related files
4. Delete `test.env`, `.yarnrc`, `.npmrc`
5. Delete src/app/my-route if it exists

# Verification

1. Run `bun install`.
2. Run Payload's type-generation and import-map scripts if available.
3. Run `bun run build`.
4. Fix all resulting errors before finishing.