# AGENTS.md

## Project

Dashboard for the GSTIN platform (React 18 + Vite + Tailwind 4 + befui). The API is a separate repo,
`gstin-platform-backend`. The UI never calls GST providers itself; it talks only to the backend.

## Commands

- `Dockerfile` + `Caddyfile`: static app + reverse proxy to the backend + HTTPS (used by the backend repo's full-stack
  compose; not needed when the backend serves `dist` via `WEB_DIST`). The Caddyfile passes `Host` through unchanged and sets
  the same CSP the backend sends; keep the two policies in step.
- `npm ci`, `npm run dev` (needs the backend; `GST_API` overrides `http://localhost:3001`), `npm run build`.
- No test or lint setup yet. After UI changes, build and check in a real browser, including a phone width.

## Rules and gotchas

- **Same origin as the API.** Cookie sessions plus the server's Origin/Host CSRF check mean the app must be served
  from the API's origin (or behind a proxy that preserves `Host`). `vite.config.js` sets `changeOrigin: false` on
  every proxy entry for this reason. Do not "fix" it back to the Vite default or every sign-in fails with
  "Cross-site requests are not allowed".
- **All requests go through `src/lib/http.js`.** It sends `X-Requested-With: gst-web` on writes (the server requires
  it for cookie auth) and turns a 401 `login_required` into a signed-out state. Do not call `fetch` directly.
- **Authorization is the server's job.** Hiding a menu item or page is convenience, never security. Member scoping,
  admin-only routes and the key allowance are enforced by the API; keep UI limits (`MEMBER_MAX` in `pages/Keys.jsx`)
  in step with `MEMBER_CAPS` in the backend.
- **Pages fill the full width of the content area.** `Shell` has no `max-w-*`/`mx-auto` wrapper and neither should any page.
  Limit individual form fields, dialogs or the login card if you must, but never the page or a section. Check at 1920 px
  and 390 px after layout changes.
- **Navigation lives in `layout/nav.jsx`**; the sidebar, bottom bar and breadcrumb all read it. The bottom bar shows
  four destinations plus "More" (opens the sidebar sheet). `SidebarItem` is given `onClick` (not `href`) so navigation
  stays client-side and the mobile sheet closes.
- **befui components in `src/components/ui/` are copied files we own.** Add more from the registry JSON
  (`https://befui.vercel.app/r/<name>.json`, each lists its files and npm deps) and install the listed deps. Prefer
  that over `npx github:RandomKid24/befui add`, which runs remote code. Blocks are `r/block-<name>.json`.
  Our edits to them: the sidebar sheet does not steal focus on open; `index.css` has a base rule making every
  plain `.grid` a `minmax(0, 1fr)` column (without it one wide child pushes the page sideways on phones).
- **`vercel.json` order matters.** The four API rewrites must stay above the SPA fallback (`/((?!assets/).*)`), which must keep
  excluding `/assets/` so a missing asset is a real 404, not the app shell. Destinations are literals (Vercel cannot read env vars
  there): change them with `npm run set-backend -- https://host`, never by hand-editing one of the four. The API has to be proxied,
  not called cross-origin: the session cookie is `SameSite=Lax`, so a browser will not send it to a different site.
- **No inline scripts.** The backend sends a strict Content-Security-Policy with the app, so dark-mode bootstrap is
  `public/theme-init.js`, not an inline `<script>`. External scripts and styles are limited to self and Google Fonts.
- **Never show or store secrets.** A new API key is shown once in the UI and never kept. The admin token is typed on
  the setup screen only; there is no token in browser storage.
- Dates and numbers from the API are already normalised (ISO dates, string `reference_id`). Do not reparse provider
  formats in the UI.
