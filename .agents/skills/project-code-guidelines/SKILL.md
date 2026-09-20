---
name: project-code-guidelines
description: Apply this repository's conventions when writing or reviewing application code in the Payload CMS and Next.js ecommerce template, including file placement, pages, components, forms, Server Actions, authentication, Payload access control, security, and library selection. Do not use it to reproduce generated Payload files or starter/demo content.
---

# Project Code Guidelines

Use these conventions to make new code look and behave like the maintained parts of this repository.

Do not treat the starter homepage, starter metadata, README prose, generated Payload routes, generated import map, or generated Payload types as style examples. Do not introduce localization architecture unless the user asks for it.

## Before Changing Code

1. Read [references/architecture.md](references/architecture.md) for file placement, page composition, forms, actions, and TypeScript style.
2. Read [references/libraries.md](references/libraries.md) before selecting, adding, replacing, or removing a library.
3. Read [references/security.md](references/security.md) for authentication, account data, Server Actions, Payload Local API calls, access control, hooks, uploads, redirects, or secrets.
4. Read the relevant bundled Next.js 16 guide in `node_modules/next/dist/docs/` before changing Next.js code. Do not rely on remembered APIs.
5. For Payload work, also read `.agents/skills/payload/SKILL.md` and only the detailed Payload references relevant to the task.
6. Inspect the nearest maintained implementation before creating a new pattern.

## Decision Boundary

Follow an existing local pattern when it clearly applies. Ask the user before making an architectural or styling decision that has no established precedent or would change the established approach, including:

- adding a top-level source directory or moving responsibilities between directories;
- introducing a repository, service, feature-module, client-fetching, state-management, or event-bus layer;
- adding or replacing an authentication, validation, forms, UI, styling, data-access, or testing library;
- changing the Server Component/Client Component boundary or choosing an API route instead of a Server Action;
- changing roles, authorization ownership, public/private media behavior, session behavior, or user-visible security flows;
- introducing theme tokens, new visual primitives, or a new shadcn variant/size convention that affects multiple consumers.

Small implementation choices that directly follow an existing example do not need confirmation.

## Core Rules

- Use Bun. Keep `bun.lock` as the only lockfile and run scripts with `bun run`.
- Use strict TypeScript and the `@/` alias for cross-directory imports.
- Prefer Server Components. Add `'use client'` only for browser APIs, React state/effects, navigation hooks, or interactive forms.
- Keep route files thin: authorize, load data, handle redirects/not-found states, define metadata, and compose components.
- Use `getCMS()` for Payload access and the established Better Auth helpers for authentication. Do not create parallel auth or database clients.
- Validate every untrusted input on the server, even when the client uses the same Zod schema.
- Use the existing shadcn/Base UI components from `src/components/ui` for common controls and structure. Prefer semantic component props such as `variant`, `size`, and `orientation` over bespoke visual classes at call sites.
- Keep aesthetics out of business and route code. Feature components may use classes for layout and responsive composition; shared visual behavior belongs in UI primitives or their centrally defined variants.
- Preserve generated files. Regenerate Payload types/import maps and shadcn primitives with their tools instead of hand-maintaining generated output.
- Reuse the installed stack before adding dependencies.

## Expected Verification

Match verification to the change. At minimum, run TypeScript for code changes and regenerate Payload artifacts after schema or admin-component changes. Run focused behavior checks for authentication, redirects, access control, form validation, and hooks. Use `bun run build` when the change affects routing, configuration, server/client boundaries, or production compilation and the required infrastructure is available.
