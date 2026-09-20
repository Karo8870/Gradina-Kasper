# Authentication, Payload, and Security

## Authentication Boundary

- Use `getCurrentUser()` in Server Components and layouts when only the authenticated Payload user is needed.
- Use `getBetterAuthRequest()` in Server Actions that call Better Auth APIs. It supplies the configured auth instance, Payload instance, and current request headers.
- Use `getBetterAuth(payload)` only in server code that already owns a Payload instance and request headers.
- Keep authentication helpers and secret-bearing provider configuration server-only. Never import them into Client Components.
- Use the existing Better Auth cookie helpers instead of manually parsing or copying auth cookies.
- Keep the `users` collection's Better Auth strategy as the only Payload auth strategy unless the user approves a different authentication architecture.

## Users and Roles

The established roles are `admin` and `customer`.

- Default self-sign-up to `customer` on the server. Never accept a client-provided role.
- Save the role and only the user fields required by request-time access checks to the Payload JWT.
- Only admins may access Payload admin, create/delete/unlock users through Payload, or update roles and protected identity fields.
- A customer may read only their own user document. Prefer a Payload `Where` constraint for row-level access.
- Keep field-level restrictions on role, verification state, and two-factor state. Field access functions return booleans only.
- Do not expose the role field or other protected account fields to clients that do not need them.

## Server Actions Are Public Entry Points

Treat every exported Server Action as directly callable by an attacker.

1. Parse the complete input with the shared Zod schema.
2. Obtain and verify the current session for authenticated operations.
3. Verify authorization and resource ownership; possession of an ID is not authorization.
4. Perform the operation through Better Auth or Payload.
5. Return only the small result required by the UI.

Page/layout protection does not replace action authorization. TypeScript types and client validation provide no security boundary.

Use generic failure messages for login, reset, verification, and account-linking flows. Forgot-password requests must return the same observable result whether or not the address exists.

## Redirects and URL Parameters

- Treat `params`, `searchParams`, form data, headers, and cookies as untrusted input.
- Pass post-auth destinations through `safeInternalRedirect()`.
- Accept only paths beginning with one `/`; reject protocol-relative and external URLs.
- Use `withSafeRedirect()` and `withFeedback()` to preserve safe destinations and encode feedback.
- Whitelist routes or provider identifiers used to construct callbacks.
- Never redirect to a raw client-provided URL.

## Payload Access Control

- Put reusable collection and field rules in `src/access` and fail closed.
- Use collection-level `Where` constraints for ownership and tenant boundaries instead of fetching broadly and filtering in application code.
- Payload Local API calls bypass access control by default. Whenever an operation acts on behalf of a user, pass both `user` and `overrideAccess: false`.
- Use the default privileged Local API behavior only for explicit internal system work such as trusted maintenance, migrations, or controlled jobs.
- Select only needed fields and set deliberate relationship `depth`; use `depth: 0` when IDs are sufficient.
- Index fields used for equality filters, unique lookup, sorting, ownership, or access-control constraints.
- Public access must be explicit. A public media collection plus storage-level access bypass is acceptable only while all stored media is intentionally public.

## Hooks and Transactions

- Use `beforeValidate` for normalization and derived input formatting.
- Use `beforeChange` for business invariants applied before persistence.
- Use `afterChange` for side effects and revalidation.
- Use `afterRead` only for read-time computed values that cannot be represented more directly.
- Pass the originating `req` into every nested Payload operation from a hook so it participates in the same transaction.
- Use `req.context` flags when a nested operation could trigger the same hook again.
- Cache expensive request-scoped checks in `req.context` rather than repeating them per document.
- Revalidation hooks should respect an explicit context flag so seeds, migrations, and bulk internal operations can suppress redundant work.

## Passwords, Sessions, and Two-Factor Authentication

- Keep password constraints shared between form and action schemas and aligned with Better Auth configuration.
- Require email verification according to Better Auth configuration; do not create a bypass in page code.
- Revoke other sessions on password change and all sessions on password reset as configured.
- Before revoking a session by ID, confirm it belongs to the authenticated user's session list and do not revoke the current session through the single-session action.
- Respect `TFA_MODE`; do not render or call an OTP/TOTP path that is disabled at runtime.
- Validate OTP, TOTP, and backup-code formats on the server and let Better Auth enforce validity and attempt limits.
- Store OTPs and backup codes encrypted. Display newly generated backup codes only when required by the enrollment/regeneration response and never persist them in client storage.
- Use generic security-flow errors and send security notifications without leaking mail transport failures to the client.

## Secrets, Data, and Output

- Define and validate environment variables centrally with Envalid.
- Only variables intentionally prefixed `NEXT_PUBLIC_` may be read by browser code.
- Mark modules that load Payload, private environment values, email providers, storage credentials, or server auth APIs with `server-only` when they might otherwise be imported through shared code.
- Never pass full user, session, account, or Payload documents to a Client Component. Construct the smallest DTO needed for rendering.
- Never log passwords, reset tokens, verification tokens, OTPs, backup codes, session tokens, cookie headers, or provider secrets.
- Escape or safely generate email content; do not insert untrusted raw HTML.

## Mutation and Abuse Controls

- Perform mutations through POST-backed Server Actions or route handlers, never as render side effects or GET behavior.
- Prevent repeat submission in the UI, but do not mistake that for server protection.
- Before adding a public email-sending, authentication, search, upload, or expensive action, confirm whether Better Auth/Payload already rate-limits it; add an approved server-side rate limit when it does not.
- Validate upload type, size, and ownership. Do not infer that a public read policy also permits public creation, update, or deletion.
- Keep security headers and trusted/CORS origins centralized in configuration and environment-driven for deployment-specific domains.

## Review Checklist

- Is every untrusted value parsed at the server boundary?
- Does every protected action authenticate and authorize independently?
- Can a supplied document, account, or session ID target another user?
- Does every user-scoped Payload Local API call set `overrideAccess: false`?
- Do hook-internal writes pass `req`, and can they recurse?
- Are redirect targets internal and callback/provider values whitelisted?
- Are returned objects and client props minimized?
- Are secrets and auth artifacts absent from logs, URLs, and serialized props?
- Is any new public or administrative access rule explicit and tested?
