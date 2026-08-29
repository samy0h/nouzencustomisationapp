# Repository Guidelines

## Project Overview

Nouzen Clothes: a custom clothing e-commerce platform. The root is a React + Vite frontend; `.\server` is an Express + Prisma + PostgreSQL backend API. Despite `.\README.md` and `.\ARCHITECTURE.md` describing an early Fabric.js/Zustand catalog phase, the actual app has evolved into a full catalog, product customizer, cart, checkout, and admin dashboard — treat those docs as outdated planning artifacts, not current architecture.

## Project Structure & Module Organization

- `.\src\pages` — route-level screens: `Catalog`, `ProductDetail`, `Customizer`, `Cart`, `Checkout`, and `Admin*` (products, orders, dashboard, settings, product editor).
- `.\src\services\api.ts` — single API client abstraction; reads `VITE_API_URL` (see `.\.env.example`).
- `.\src\stores\cartStore.ts` — cart state (no Zustand; check implementation before assuming a library).
- `.\src\contexts` — `ThemeContext` and `LanguageContext` (i18n strings live in `.\src\data\translations.ts`).
- `.\server\src\controllers` and `.\server\src\routes` — Express route handlers for products, categories, product types, and orders.
- `.\server\prisma\schema.prisma` — source of truth for the data model (Product, ProductVariant, ProductImage/VariantImage, PrintArea, Order/OrderItem, Design, Admin).
- `.\server\src\scripts` — one-off DB maintenance scripts (backups, migrations, image updates) run via `tsx`.
- `.\server\uploads` and root `.\uploads\orders` — file storage for order-related uploads (product images, customization exports).

## Build, Test, and Development Commands

Frontend (root):
```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # tsc -b && vite build
npm run lint      # oxlint
npm run preview   # preview production build
```

Backend (`.\server`):
```bash
npm run dev          # tsx watch src/index.ts (http://localhost:3001)
npm run build        # tsc compile to dist/
npm start            # run compiled server
npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
npm run db:push      # prisma db push
npm run db:seed      # tsx prisma/seed.ts
npm run db:studio    # prisma studio (http://localhost:5555)
```

No test runner is configured in either `package.json`.

## Coding Style & Naming Conventions

- TypeScript strict-ish frontend config (`.\tsconfig.app.json`): `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `erasableSyntaxOnly`.
- Linting via `oxlint` (`.\.oxlintrc.json`): react, typescript, oxc plugins; `react/rules-of-hooks` is an error, `react/only-export-components` is a warning (constant exports allowed).
- Components are PascalCase `.tsx` files under `.\src\components` and `.\src\pages`; hooks are camelCase `useX.ts` under `.\src\hooks`.
- Both frontend and backend use ESM (`"type": "module"`).

## Commit & Pull Request Guidelines

Commit messages are short, imperative, present-tense summaries (e.g. `Fix product editor interactions`, `Add product management controls`); some use a `feat:` prefix but it is not consistently enforced. No PR template is present in the repo.
