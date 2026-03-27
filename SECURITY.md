# Security Notes

This app is an Expo/React Native client with a small backend route for Heia. The goal is to keep secrets off the client, minimize sensitive persistence on devices, and fail safely when networks or providers are unreliable.

## What Is Public

- Any `EXPO_PUBLIC_*` value is bundled into the client and should be treated as public.
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is allowed on the client.
- Server secrets such as `OPENAI_API_KEY` must never use the `EXPO_PUBLIC_` prefix.
- `.env.*` files are git-ignored, with only `.env.example` intended for source control.

## Runtime Config Rules

- Public runtime config is normalized through `services/runtime/public-config.shared.ts`.
- Production API and Supabase URLs are expected to be HTTPS.
- Local HTTP API URLs are only allowed outside production for local-device development.
- Secret-looking values are stripped from public config so service-role or private keys do not leak into the app bundle by mistake.

## Auth And Token Storage

- Supabase session persistence on native now uses `expo-secure-store`.
- Do not move auth tokens back into `AsyncStorage`, local files, or Zustand persistence.
- Treat secure storage failures as a reason to reduce persistence, not to downgrade to insecure storage.
- Keep Supabase access limited to publishable/anon client credentials only.

## Network And API Safety

- Client API calls should go through `services/api/request.ts`.
- The request layer sends safe default headers, omits ambient credentials, attaches a client request id, and returns generic user-safe errors by default.
- Heia backend responses set `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and `X-Request-Id`.
- The Heia route only accepts `POST` with a JSON body.
- Rate-limit identifiers are hashed before being stored in memory so raw IP-like identifiers are not retained.

## Validation And Trust Boundaries

- Treat the mobile app as untrusted input. Backend routes must validate all payloads.
- Heia request schemas trim string input and reject unexpected object shapes.
- Auth screens now validate email format before sending requests.
- Keep any future mutation endpoint behind schema validation and server-side authorization checks.

## Logging And Personal Data

- Avoid logging auth sessions, raw request bodies, tokens, email addresses, or provider secrets.
- Keep user-facing errors generic. Save detailed provider failures only in secure server observability tooling if added later.
- Travel preferences stored in Zustand/AsyncStorage should remain non-secret preference data only.
- If more personal data is added, review whether it belongs on-device at all and whether retention should be shortened.

## Dependency Hygiene

- Production dependencies were re-audited on March 27, 2026 with `npm audit --omit=dev` and resolved to zero runtime vulnerabilities.
- Transitive security overrides are pinned in `package.json` for `brace-expansion`, `node-forge`, `picomatch`, and `yaml`.
- Re-run `npm audit --omit=dev` before release builds and after Expo SDK upgrades.

## Recommended Follow-Up

- Confirm Supabase Row Level Security policies are enabled for every user-owned table.
- Rotate any key that was ever placed in a public env var, even briefly.
- Add a backend origin allowlist if the final web deployment domains are fixed and known.
- Add centralized mobile crash/error reporting only after redacting tokens, emails, and request payloads.
