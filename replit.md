# Sitecore XM Cloud Front End Starter Kits

## Project Overview
This is the official Sitecore XM Cloud Front End Starter Kits repository. It contains multiple Next.js starter applications for building headless front-end apps powered by Sitecore XM Cloud. The active site being developed is **NovaTech** — a modern, AI-focused technology company marketing website.

## Active Application
The configured workflow runs the **basic-nextjs** example (`examples/basic-nextjs`), which is a Next.js 15 App Router application using the Sitecore Content SDK.

## Repository Structure
- `/examples/basic-nextjs` - Next.js App Router starter (active, runs on port 5000)
- `/examples/basic-nextjs-pages-router` - Next.js Pages Router starter
- `/examples/basic-spa` - SPA starter with Node proxy
- `/examples/kit-nextjs-article-starter` - Article site kit
- `/examples/kit-nextjs-location-finder` - Location finder kit
- `/examples/kit-nextjs-product-listing` - Product listing kit
- `/examples/kit-nextjs-skate-park` - Skate park demo kit
- `/authoring` - Sitecore content item definitions (.NET/C# project)
- `/local-containers` - Docker configuration for local dev

## Pages
- **Home** (`/`) — Hero, 3 FeatureCards, ContentBlock, Testimonial, CTABanner
- **Products** (`/Products`) — ProductHero, 3 ProductFeatures, PricingTable, CTABanner

## NovaTech Components
Components located in `examples/basic-nextjs/src/components/`:
- **Hero** - Full-width banner with heading, subheading, background image, and CTA
- **CTABanner** - Dark navy conversion section with primary/secondary buttons
- **FeatureCard** - White card with icon, title, description, and link
- **Testimonial** - Blockquote with author attribution
- **ContentBlock** - Two-column text + image layout (configurable position)
- **SiteHeader** - Sticky dark navy header with logo and CTA (links to /Products)
- **SiteFooter** - Dark navy footer with logo and copyright
- **ProductHero** - Product page hero with "Product" badge, heading, tagline, 2 CTAs
- **ProductFeature** - Alternating left/right feature sections with badge, title, description, image placeholder
- **PricingTable** - 3-tier pricing section (Starter $49/mo, Professional $149/mo, Enterprise Custom)

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + inline styles on components
- **CMS**: Sitecore XM Cloud (connected via Edge API)
- **i18n**: next-intl

## Environment Variables (Configured)
- `SITECORE_EDGE_CONTEXT_ID` - Server-side Edge context ID (secret)
- `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` - Client-side Edge context ID (secret)
- `NEXT_PUBLIC_DEFAULT_SITE_NAME` - Set to "NovaTech" (env var)
- `SITECORE_EDITING_SECRET` - Editing endpoint auth token (secret)

## Running the App
```
cd examples/basic-nextjs && npm run next:dev -- -p 5000 -H 0.0.0.0
```

## Default Content Layer
When Sitecore CMS placeholders are empty or Edge API returns empty rendered data, the app renders default NovaTech content via:
- `src/lib/default-content.ts` — Static content data for Home and Products pages (exported via `getDefaultContent(routePath)`)
- `src/components/default-content/DefaultContent.tsx` — Renders default components when placeholders are empty, with page-specific layouts
- `src/Layout.tsx` — Checks if placeholders are empty and falls back to default content, passing `routePath` for page-specific defaults
- `src/app/[site]/[locale]/[[...path]]/page.tsx` — Creates fallback page object for known paths when Edge returns no data

When components are placed in Sitecore CMS, the CMS content takes priority automatically.

## SDK Patch
The Sitecore Content SDK (`@sitecore-content-sdk/core`) has a bug where it crashes when Edge returns `rendered: {}` (empty object). The layout-service.js files (CJS and ESM) are patched to check for `rendered.sitecore` before using the rendered data. This patch will need to be re-applied if node_modules are reinstalled.

## Sitecore CMS Architecture
- **CM URL**: `xmc-icreonpartncfab-novatechshof00c-novatech964b.sitecorecloud.io`
- **Home page ID**: `0a7f28d1a8b24b8090c9e4643fdf866f`
- **Products page ID**: `4aa845a07de340c68dc1f0ae57885350`
- **Rendering folder**: `326231e90099427aa7e54643f5d9278c`
- **Data folder**: `9af2100833f44c0c8cd5493da38d1268`
- Templates: ProductHero, ProductFeature, PricingTable (+ existing Hero, CTABanner, etc.)
- Publishing target: `experienceedge` via `publishSite` mutation

## Key Configuration Changes Made
- `examples/basic-nextjs/next.config.ts`: Added `allowedDevOrigins` for Replit proxy compatibility
- `examples/basic-nextjs/sitecore.config.ts`: Reads Edge credentials from env vars with graceful fallback
- `examples/basic-nextjs/src/Layout.tsx`: Added default content fallback for empty Sitecore placeholders, optional chaining for layout.sitecore
- `examples/basic-nextjs/src/Scripts.tsx`: Guards SDK components that access layout.sitecore
- `examples/basic-nextjs/src/byoc/index.tsx`: Optional chaining for layout.sitecore.context
- `examples/basic-nextjs/src/components/content-sdk/CdpPageView.tsx`: Optional chaining for layout.sitecore

## Deployment
- Target: Autoscale
- Build: `cd examples/basic-nextjs && npm run next:build`
- Run: `cd examples/basic-nextjs && npm run next:start -- -p 5000 -H 0.0.0.0`
