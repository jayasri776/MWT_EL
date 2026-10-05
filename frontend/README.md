# TAMS — Temple Activity Management System (React)

A React (Vite) conversion of the original single-file HTML/CSS/JS design mockup
(`Temple_Activity_Management_UIUX_Design_v2.html`), rebuilt as a proper
multi-file React app.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
```

## Structure

- `src/App.jsx` — sets up `react-router-dom` v6 routing across all pages.
- `src/components/Layout.jsx` — sidebar + topbar shell shared by every route.
- `src/components/Sidebar.jsx`, `Topbar.jsx` — fully interactive nav/topbar,
  built as real JSX (not just markup dumps).
- `src/components/StaticPage.jsx` — a small helper that brings the
  mockup's static page fragments to life: live translations, SPA
  navigation for `data-goto` links, toasts for `data-toast` buttons,
  chip/report-type active-state toggling, and the temple-hero reveal
  animation.
- `src/pages/*.jsx` — one component per route. Most render their
  page's markup (extracted verbatim from the original design, in
  `src/data/pages/*.js`) through `StaticPage`.
- `src/pages/Activities.jsx` — the one page that was already React in
  the source file, rewritten as a standalone module. It demonstrates
  `useState`, `useRef`, `useContext`, `useEffect`, `useCallback` and
  `React.memo`, exactly as in the original.
- `src/context/` — `LanguageContext` (6 languages: EN/TA/HI/ML/KN/TE),
  `ThemeContext` (Classic / Dusk / Festive), `ToastContext`.
- `src/data/translations.js` — the full translation dictionary, extracted
  as-is from the original file.
- `src/styles.css` — the original design's CSS, unchanged.

## Notes

- Pages other than Activities keep their original static markup (with
  its exact styling and layout) but are wired up to live app state
  (language, routing, toasts) via `StaticPage`, rather than being
  hand-rewritten node-by-node into JSX. This preserves 1:1 visual
  fidelity with the source design while making the app a real,
  multi-file, routed React project.
- Google Fonts are loaded from `index.html`, same as the original.
