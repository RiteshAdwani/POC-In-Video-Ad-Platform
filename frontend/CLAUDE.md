# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from this directory, or from the repo root with `--workspace=frontend`:

- `npm run dev` — Vite dev server on port 5173
- `npm run build` — `tsc` then `vite build` (type errors fail the build)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Stack

Vite + React 19 + TypeScript (strict) + React Router v7 + antd for UI components +
**TanStack Query + Axios** for all server data (queries and mutations) + plain CSS per page (no
Tailwind, no CSS-in-JS). The dev server proxies `/api/v1/...` to the backend on port 8000
(`vite.config.ts`) — call relative paths, never hardcode the backend origin.

`src/lib/playbackApi.ts` predates this convention (plain `fetch`, no Query wrapper) — treat it as
legacy to migrate the next time it's touched, not as a pattern to copy.

## Folder structure

Organize by layer for cross-cutting concerns, by feature for everything page-specific:

```
src/
  api/                    # one shared axios instance (baseURL, interceptors); nothing else
  constants/
    routes.constants.ts       # frontend route paths (react-router)
    apiRoutes.constants.ts    # backend endpoint paths
    queryKeys.constants.ts    # TanStack Query key factories
  enums/                  # shared enums, mirroring backend Prisma enums where applicable
  types/                  # shared domain types
  dtos/                   # request/response shapes, one file per feature
  features/
    <feature>/
      components/
        <Component>/        # <Component>.tsx + <Component>.css, colocated
      hooks/                # this feature's query/mutation hooks
  components/             # components shared across features
  hooks/                  # hooks shared across features
  lib/                    # generic non-API utilities (e.g. session id helpers)
  pages/
    <page>/               # once a page has more than one file (component + its own CSS)
      <Page>.tsx
      <Page>.css
    <OtherPage>.tsx        # a page with nothing else yet stays a flat file
  routes.tsx
```

A component/hook used by exactly one feature lives inside that feature's folder, not in the
shared `components/`/`hooks/`. Don't create a shared folder for something with one caller.

The actual `<Page>` component always lives in `pages/`, never inside `features/<feature>/` —
`features/` holds only the building blocks (hooks, sub-components) a page is composed from. Never
have a real page component in `features/` with a re-export shim in `pages/` pointing at it; pick
one location. A page only gets its own `pages/<page>/` subfolder once it has more than one file to
hold — an unbuilt stub with nothing but JSX stays a flat `pages/<Page>.tsx` until it earns one.

CSS is colocated with the component that uses its class names, at every level — a feature
component's styles live next to that component (`AdControls/AdControls.css`), not centralized in
the page's stylesheet. The page's own `.css` covers only the page's own layout, not its
sub-components' styles. This means a component's styles move and delete with it automatically;
nothing depends on which page happens to render it.

## Naming conventions

- Components: PascalCase, one per file, filename matches the export.
- Data-fetching hooks: `use<Entity><Action>Query` / `use<Entity><Action>Mutation` — e.g.
  `usePlaybackConfigQuery`, `useUploadVideoMutation`, `useRecordPlaybackEventMutation`. Never call
  `useQuery`/`useMutation` directly inside a component — always through a named wrapper hook.
- Constants: `SCREAMING_SNAKE_CASE` for primitives, a `PascalCase` const object (matching the
  backend's own enum style, e.g. `AdType`) for string-union "enums."
- DTOs: `<Entity><Action>RequestDto` / `<Entity><Action>ResponseDto`.
- Every function and component is an arrow function (`const Foo = () => {}`), never a `function`
  declaration.

## Documentation

Every exported component, hook, and non-trivial function gets a JSDoc block:

```ts
/**
 * @description Fetches a video's playback config and polls while it isn't READY yet.
 */
```

Keep it to 2-4 lines: state the purpose, then any non-obvious "why." Not a restatement of the
function signature, not a changelog of what it used to do.

Every `useEffect` gets the same treatment, directly above the call:

```ts
/**
 * @description Swaps the <video> element's src to whatever's active, resuming main content
 * where the last ad interrupted it.
 */
useEffect(() => {
  // ...
}, [activeAd, config]);
```

## State and memoization

Prefer deriving a value during render over storing it in its own `useState` — if a component is
carrying more than ~4-5 independent state variables, check whether some of them are actually
computable from the others (props, or other state) rather than tracked separately.

Memoize (`useMemo`/`useCallback`) values passed to a memoized child, used as another hook's
dependency, or genuinely expensive to recompute — not reflexively on every value. Unnecessary
memoization adds noise without a measurable benefit.

## Data fetching (TanStack Query + Axios)

- One `axios` instance in `api/`, reused everywhere — no ad hoc `fetch`/`axios.create()` calls
  scattered through feature code.
- Query keys are typed factory functions in `constants/queryKeys.constants.ts`
  (e.g. `playbackConfigKey(videoId)`), never inline arrays repeated at each call site.
- After a mutation succeeds, invalidate the query keys it affects via
  `queryClient.invalidateQueries` in `onSuccess` — don't manually patch cached data or duplicate
  server state into local component state.

## Design patterns

Reach for a custom hook first to pull non-trivial logic out of a component. Reserve HOCs for
genuine cross-cutting concerns applied uniformly across many components — e.g. the eventual
private-route guard for `routes.tsx`'s `private` flag, which isn't implemented yet.

## Component size

Keep components at roughly 200-250 lines. Past that, extract sub-components, hooks, or plain
helper functions rather than letting one file keep growing.

## UI practices

- No inline `style={{...}}` — use the page's CSS file, or antd's own styling/theme props.
- Prefer an antd component over a hand-rolled one (buttons, forms, modals, tables, loading/error
  states via `Spin`/`Result`) — drop to plain HTML only where antd has no equivalent (e.g. the
  native `<video>` element).
