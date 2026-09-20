# Architecture and Code Style

## Request Flow

Use these existing boundaries:

```text
Next.js page/layout
  -> domain or page component
  -> interactive form/component when needed
  -> Server Action for mutation
  -> Better Auth helper or Payload Local API
  -> small serializable result back to the client
```

Payload configuration follows a separate path:

```text
payload.config.ts
  -> collection/global config
  -> reusable access function
  -> extracted hook when behavior is non-trivial
  -> generated payload-types.ts
```

Do not add another abstraction layer unless the current shape stops being adequate and the user approves the architectural change.

## File Placement

| Location                         | Responsibility                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/app/(frontend)`             | Public App Router pages, layouts, metadata boundaries, route-level authorization and data loading               |
| `src/app/(payload)`              | Payload-generated admin and API integration; do not hand-edit generated files                                   |
| `src/actions`                    | Named Server Actions grouped by domain; validation and orchestration for mutations                              |
| `src/access`                     | Reusable Payload collection and field access functions                                                          |
| `src/collections`                | One Payload collection config per file                                                                          |
| `src/components/ui`              | shadcn/Base UI primitives and central semantic variants                                                         |
| `src/components/form-components` | Generic React Hook Form adapters such as fields, status, and submit controls                                    |
| `src/components/forms/<domain>`  | Interactive domain forms and their colocated `*.schema.ts` files                                                |
| `src/components/<domain>`        | Reusable domain compositions that are not route entrypoints                                                     |
| `src/components/auth`            | Shared authentication-page compositions and feedback UI                                                         |
| `src/components/icons`           | Project-owned SVG icon components when an installed icon set is insufficient                                    |
| `src/lib`                        | Shared application utilities and server integrations                                                            |
| `src/lib/auth`                   | Better Auth request helpers, current-user access, safe redirects, provider configuration, and 2FA configuration |
| `src/emails/<domain>`            | Email subject and HTML builders grouped by domain                                                               |
| `public`                         | Static files addressed by URL                                                                                   |
| `src/payload-types.ts`           | Generated Payload types; never edit manually                                                                    |

Create `src/hooks` only for genuinely reusable React hooks. Extract `src/hooks` for Payload hooks only if collection behavior grows enough to justify shared hook modules; avoid giving one directory two unrelated meanings.

## Pages and Layouts

- Pages and layouts are Server Components unless interaction requires otherwise.
- Keep a page focused on request-bound concerns: await `params`/`searchParams`, obtain the current user, query data, redirect, return not-found, and compose UI.
- Run independent request work with `Promise.all`.
- Put shared route protection in the nearest layout, but re-check authentication and authorization inside every Server Action because actions are independent public entrypoints.
- Pass the smallest serializable DTO into Client Components. Do not pass full Payload, Better Auth, session, or database records when the client needs only a few fields.
- Serialize dates before crossing the server/client boundary.
- Use `staticMetadata()` for ordinary static page metadata. Use a narrowly scoped metadata helper for CMS-backed metadata.
- Use `redirect()` for server-side navigation and `router.replace()` for completed client-side flows where history should not retain the form step.
- Use `notFound()` for missing public resources rather than rendering an ambiguous empty state.

## Components

- Use named exports for reusable components and helpers. Use default exports only where Next.js or another framework convention requires them.
- Prefer composition over components with many boolean presentation flags.
- Keep props explicit and narrow. Define a local object type inline for small one-off props; name and export types that are reused across modules.
- Keep server-capable components free of `'use client'`. Place the directive at the smallest interactive boundary.
- Use `next/link` for internal navigation and Next.js navigation APIs for application flows.
- Use Lucide for ordinary interface icons. Use a project-owned SVG or the installed brand-icon package for a brand mark not supplied by Lucide.
- Use `RenderMedia` for populated Payload media documents that may be images or videos. Ensure the relationship was queried at sufficient depth before passing it.

## shadcn and Styling Boundary

Treat shadcn/Base Nova components as the standard UI vocabulary. Base UI supplies accessible behavior; the local files in `src/components/ui` expose the supported component API.

- Use an existing UI primitive before writing raw buttons, inputs, checkboxes, alerts, cards, separators, dialogs, menus, and similar controls.
- Make design choices through semantic props such as `variant`, `size`, `orientation`, state, and slot composition.
- Feature and page code may use classes for layout, spacing, responsive structure, and exceptional one-off positioning.
- Do not scatter colors, borders, shadows, radii, or control-state styling across feature code.
- When a repeated visual treatment is missing, ask before establishing a new shared variant convention. If approved, define it centrally so consumers select it with props.
- Add missing shadcn primitives using the repository's Base Nova configuration. Do not introduce a competing component library.
- Preserve accessibility props, focus behavior, labels, descriptions, and keyboard behavior when wrapping primitives.

This skill intentionally does not prescribe branding, colors, typography, or aesthetic direction.

## Forms and Schemas

- Use React Hook Form with `zodResolver` and explicit `defaultValues`.
- Place each form's schema in a colocated `name.schema.ts` file. Export both the Zod schema and its inferred value type.
- Reuse shared field schemas such as email or password constraints when the rule is genuinely identical.
- Use the same schema in the Client Component and Server Action. The client validation improves feedback; only the server validation is trusted.
- Use `FormField`, `FormPasswordField`, `FormCheckboxField`, `FormOTPField`, `FormStatus`, and `FormSubmitButton` before creating another form adapter.
- Use controlled fields only when the underlying primitive requires them; otherwise use `register`.
- Represent pending state through React Hook Form submission state or `useTransition`, disable repeat submission, and provide a useful pending label.
- Put field-specific failures on the field with `setError`. Use generic status feedback for non-field failures.
- Never expose account existence, internal exception messages, tokens, or provider responses in user-facing errors.

## Server Actions

- Put `'use server'` once at the top of the action module.
- Accept a single object input when an action has parameters.
- Parse the entire input with `safeParse` before authentication calls, queries, emails, or mutations.
- Authenticate and authorize inside the action or the server-only function it invokes. Do not rely on a protected page or layout.
- Return a small stable result such as `{ success: boolean }` or a discriminated union. Never return raw Payload or Better Auth records.
- Catch expected provider/auth failures and return the flow's generic result. Log unexpected server failures without exposing them to the client.
- Apply authentication response cookies with the established helper whenever a Better Auth API returns headers.
- Refresh or revalidate only the affected UI after a successful mutation.

## TypeScript and Formatting

- Preserve strict typing. Avoid `any`; narrow `unknown` at boundaries.
- Prefer generated Payload types from `@/payload-types` over handwritten document interfaces.
- Use `import type` for type-only imports.
- Use `satisfies` when checking configuration objects without widening their inferred values.
- Use `as const` for immutable option lists and discriminants.
- Prefer early returns for validation and authorization failures.
- Use single quotes in TypeScript and JSX, semicolons, two spaces, and no trailing commas, as configured by Prettier.
- Import order: packages first, then a blank line, then `@/` project imports, then a blank line, then relative imports. Let Prettier sort Tailwind classes.
- Use `@/` for cross-directory application imports and relative imports for files in the same local module group.
- Add comments only for security intent, transaction/context invariants, generated-file boundaries, or non-obvious domain reasoning.

## Generated Artifacts

- After collection, global, field, or auth-schema changes, run `bun run generate:types`.
- After adding or changing Payload admin components, run `bun run generate:importmap`.
- Do not manually edit `src/payload-types.ts`, Payload-generated route files, or `src/app/(payload)/admin/importMap.js`.
- Add shadcn components through its CLI so they match `components.json`; then expose any approved semantic variants through the local primitive API.
