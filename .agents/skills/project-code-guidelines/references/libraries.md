# Library Map

Reuse these packages for their established responsibility. Do not add a package for functionality already covered here.

## Runtime and Framework

| Package              | Use                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `next`               | App Router, Server/Client Components, route handlers, metadata, images, navigation, caching and revalidation |
| `react`, `react-dom` | Component rendering and React primitives; do not add a second UI runtime                                     |
| `server-only`        | Mark modules containing secrets, privileged SDKs, or server-only data access                                 |
| `sharp`              | Payload image processing; do not invoke it in client or ordinary page code                                   |

## Payload CMS

| Package                            | Use                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `payload`                          | Collection/global configuration, Local API, auth integration, generated types                                                                           |
| `@payloadcms/next`                 | Payload's Next.js admin, route, layout, and integration helpers                                                                                         |
| `@payloadcms/db-postgres`          | The only configured database adapter                                                                                                                    |
| `@payloadcms/richtext-lexical`     | Payload rich-text fields and editing                                                                                                                    |
| `@payloadcms/email-nodemailer`     | Transactional email transport through `payload.sendEmail()`                                                                                             |
| `@payloadcms/storage-s3`           | S3-compatible media storage and client uploads                                                                                                          |
| `@payloadcms/plugin-cloud-storage` | Supporting Payload storage package; do not configure a second storage path alongside `@payloadcms/storage-s3` without an explicit architecture decision |
| `@payloadcms/plugin-seo`           | CMS SEO fields/metadata when collections or globals are intentionally enrolled                                                                          |
| `@payloadcms/ui`                   | Payload admin custom components only, not storefront UI                                                                                                 |
| `graphql`                          | Payload compatibility dependency; GraphQL is currently disabled, so do not build new GraphQL features without enabling it intentionally                 |

Use the Payload Local API in Server Components, Server Actions, jobs, and hooks. Do not call the REST API from the server merely to reach the same Payload instance.

## Authentication and Accounts

| Package                               | Use                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `better-auth`                         | Email/password, verification, password reset, sessions, social accounts, and two-factor APIs          |
| `@delmaredigital/payload-better-auth` | Better Auth/Payload adapter, Payload auth strategy, generated auth collections, and admin integration |

Better Auth is the authentication source of truth. Payload's local password strategy is disabled. Do not create a parallel session, JWT, password, OAuth, or user-account system.

## Forms and Validation

| Package               | Use                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------- |
| `react-hook-form`     | Client form state, registration, controlled fields, submission state, and field errors |
| `zod`                 | Shared runtime validation and inferred input types                                     |
| `@hookform/resolvers` | `zodResolver` bridge between Zod and React Hook Form                                   |
| `input-otp`           | Accessible OTP input behavior through the local shadcn wrapper                         |
| `qrcode.react`        | TOTP enrollment QR codes                                                               |

Do not introduce a second schema validator or form-state library. Native `FormData` may be appropriate for a tiny server-only form only when it does not create a second convention inside an existing form flow.

## UI and Styling Infrastructure

| Package                                          | Use                                                                                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `shadcn`                                         | Add source-owned Base Nova UI primitives matching `components.json`                                                        |
| `@base-ui/react`                                 | Headless accessible behavior underlying local shadcn primitives; consume through `src/components/ui` when a wrapper exists |
| `class-variance-authority`                       | Central semantic variants for shared UI primitives                                                                         |
| `cn`                                             | Merge conditional classes in shared primitives and components                                                              |
| `tailwindcss`, `@tailwindcss/postcss`, `postcss` | Utility generation and CSS build pipeline                                                                                  |
| `tw-animate-css`                                 | Shared Tailwind animation utilities                                                                                        |
| `lucide-react`                                   | General interface icons                                                                                                    |
| `@icons-pack/react-simple-icons`                 | Brand icons when needed and available; do not use it for ordinary interface icons                                          |

Prefer shadcn component props and centrally defined variants over visual utility strings at each call site. Do not add another design system, headless component suite, class-merging utility, icon family, or animation library without approval.

## Consent and Privacy UI

| Package        | Use                                                      |
| -------------- | -------------------------------------------------------- |
| `@c15t/nextjs` | Next.js consent provider, banner, and dialog integration |
| `c15t`         | Core consent dependency used by the Next.js integration  |

Register consent-controlled scripts in the existing provider rather than loading them ad hoc in pages.

## Configuration and Tooling

| Package                                   | Use                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `envalid`                                 | Central parsing and validation of environment variables in `env.config.ts`                                                                       |
| `dotenv`                                  | Environment bootstrap support; application modules should read the validated `envConfig`, not call `dotenv` or `process.env` throughout the tree |
| `cross-env`                               | Cross-platform environment values in package scripts                                                                                             |
| `typescript`                              | Strict static checking; generated Payload types are authoritative for CMS documents                                                              |
| `tsx`                                     | Execute TypeScript maintenance or seed scripts when such scripts exist                                                                           |
| `prettier`, `prettier-plugin-tailwindcss` | Formatting and deterministic Tailwind class ordering                                                                                             |

## Package Selection Rules

- Check this map and existing imports before adding a dependency.
- Prefer platform APIs for small needs: `URL`, `URLSearchParams`, `Headers`, Web Crypto, and standard `fetch` where appropriate.
- Ask before adding a library that changes data flow, state ownership, rendering, styling, authentication, validation, storage, email, testing, or deployment behavior.
- Keep exact versions aligned across Payload packages; do not independently upgrade one Payload package.
- Use Bun for dependency changes and commit the resulting `bun.lock` update.
