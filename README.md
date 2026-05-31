# Drawbridge

Reusable admin application foundation extracted from a production Vue admin system.

Drawbridge provides a clean Vue 3 + Vite + Tailwind CSS starter for admin panels. It includes an app shell, configurable navigation, reusable table/detail/form patterns, theme tokens adapted from buildguard-admin, permission/API adapters, sample modules, and an in-app documentation page.

## Stack

- Vue 3 + Composition API
- TypeScript strict mode
- Vite 6
- Tailwind CSS v4
- Remix Icon
- vue-router
- shadcn-vue-style primitives powered by reka-ui

## Getting Started

```bash
pnpm install
pnpm dev
```

Build and preview:

```bash
pnpm build
pnpm preview
```

## Project Structure

```text
src/
  config/          # Brand, shell, nav, user, permission adapter
  layouts/         # App shell
  components/
    ui/            # shadcn-vue primitives adapted from buildguard-admin
    table-page/    # Config-driven list page
    detail/        # Detail page layout and sections
    form/          # Form page layout and fields
  examples/        # Replaceable demo data
  views/           # Demo pages and in-app docs
  content/         # Documentation content rendered by /docs
  styles/          # Global tokens and Tailwind theme mapping
```

## How To Reuse

1. Replace `src/config/drawbridge.config.ts` with your brand, shell, menu, quick actions, user model, and permission adapter.
2. Replace `src/examples/data.ts` with your domain data or API calls.
3. Keep `components/ui`, `components/table-page`, `components/detail`, `components/form`, `layouts`, `lib`, and `styles` as the reusable foundation.
4. Add project-specific routes in `src/router/index.ts`.
5. Keep API clients and business logic out of low-level UI components.

## Documentation

Run the app and open `/docs`. The documentation page covers:

- quick start
- directory structure
- configuration model
- table/detail/form extension
- API, auth, and permission adapter boundaries
- migration notes from the source admin project
- deployment

## Migration Boundary

Drawbridge intentionally does not include source-project business modules such as customers, parks, buildings, work orders, inspections, maps, uploads, or reports. Those belong in application-specific packages or examples, not in the reusable core.

The reusable UI base does include the source project's adapted shadcn-vue primitives where they are business-neutral: button, card, tooltip, dropdown menu, breadcrumb, select, empty state, skeleton, alert dialog, button group, status badge, and separator.
