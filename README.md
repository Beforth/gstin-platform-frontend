# GSTIN Platform: frontend

The dashboard for the GSTIN platform. React 18, Vite, Tailwind 4 and [befui](https://befui.vercel.app/) components.

- **Auth**: first-run setup, sign-in, forced password change for temporary passwords.
- **Pages**: Overview, Verify GSTIN, API keys, Usage, API docs (with a "Try it" console), Team (admins), Settings.
- **Navigation**: collapsible sidebar on desktop, bottom tab bar on mobile ("More" opens the full menu).
- **Roles**: admins see everything and manage the team; members see only their own keys and usage. The server enforces
  this. The UI only hides what you cannot use.

It needs the backend: **gstin-platform-backend**.

## Develop

Requires Node 20.11+. Start the backend first (default `http://localhost:3001`), then:

```bash
npm ci
npm run dev          # http://localhost:5173
```

The dev server proxies `/api`, `/auth`, `/console` and `/v1` to the backend. Point it elsewhere with `GST_API`:

```bash
GST_API=http://localhost:4000 npm run dev
```

First run: open the app, enter the setup token the backend printed (also in its `data/admin-token`), and create the
first administrator.

## Build and deploy

```bash
npm run build        # outputs dist/
```

**Serve it from the same origin as the API.** Sign-in uses an `HttpOnly; SameSite=Lax` cookie and the server's CSRF
check compares `Origin` with `Host`, so a separate origin would break sign-in. Two ways:

1. Let the backend serve it: `WEB_DIST=/path/to/gstin-platform-frontend/dist npm start` (in the backend repo).
2. Put a reverse proxy in front of both and route `/api`, `/auth`, `/console`, `/v1` to the backend and everything else
   to the static files (with a fallback to `index.html` for client-side routes). **Preserve the Host header**
   (nginx: `proxy_set_header Host $host;`).

## Structure

```
src/
  App.jsx             routes and guards (loading, anonymous, setup, forced password change, admin-only)
  lib/                http.js (fetch wrapper), auth.jsx (session state), api.js, console.js, theme.js, gstin.js
  layout/             Shell (sidebar + topbar), BottomNav, UserMenu, AuthLayout, nav.jsx (the one nav config)
  pages/              one file per screen
  widgets/            pieces of the Verify screen (profile, comparison, CAPTCHA card, sidebar panels)
  components/ui/      befui components (copied in, so they are ours to edit)
public/theme-init.js  sets dark mode before first paint (a file, because the backend's CSP forbids inline scripts)
```

## Notes

- There are **no automated frontend tests** yet. It was checked by driving a real browser through setup, sign-in, the
  forced password change, role restrictions and the mobile layout.
- Dark mode is a `dark` class on `<html>`, remembered in `localStorage`.
- The UI is best-effort and says so: GST data is not authoritative for tax or compliance decisions.

See `AGENTS.md` for the conventions and gotchas.
