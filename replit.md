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
- **Solutions** (`/Solutions`) — SolutionsHero, 4 SolutionCards (Financial Services, Healthcare, Manufacturing, Retail), ValueProposition, CaseStudy, CTABanner

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
- **SolutionsHero** - Solutions page hero with "Solutions" badge, heading, tagline, single CTA
- **SolutionCard** - Industry solution card with blue accent bar, icon placeholder, title, description, metrics highlight, and "Learn More" link
- **ValueProposition** - "Why NovaTech?" stats section with 3 large metric columns (500+ Clients, 99.99% Uptime, 40% ROI)
- **CaseStudy** - Featured customer success story with company details, quote with blue left border, author attribution, and 3 result metric cards

## NovaTech Design System
- **Primary Navy**: `#0A1628` (hero/banner bg)
- **Secondary Navy**: `#1E3A5F` (gradients)
- **Action Blue**: `#2563EB` (buttons, accents)
- **Light Blue**: `#EFF6FF` bg / `#93C5FD` text (badges)
- **White**: `#FFFFFF` (cards, text on dark)
- **Off-white**: `#F9FAFB` / `#F1F5F9` (section bg)
- **Grays**: `#6B7280` / `#4B5563` (descriptions), `#E5E7EB` (borders)
- **Borders**: `8px` buttons, `12px` cards, `16px` feature sections
- **Section padding**: `80px` vertical
- **Max-width**: `1100px`-`1200px`

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
When Sitecore CMS placeholders are empty, the app renders default NovaTech content via:
- `src/lib/default-content.ts` — Static content data for Home, Products, and Solutions pages (exported via `getDefaultContent(routePath)`)
- `src/components/default-content/DefaultContent.tsx` — Renders default components when placeholders are empty, with page-specific layouts
- `src/Layout.tsx` — Checks if placeholders are empty and falls back to default content, passing `routePath` for page-specific defaults

When components are placed in Sitecore CMS, the CMS content takes priority automatically.

## Sitecore CMS Architecture
- **CM URL**: `xmc-icreonpartncfab-novatechshof00c-novatech964b.sitecorecloud.io`
- **Home page ID**: `0a7f28d1a8b24b8090c9e4643fdf866f`
- **Products page ID**: `4aa845a07de340c68dc1f0ae57885350`
- **Solutions page ID**: `c7a26a9dcba24849bd50cb28e6f841a5`
- **Rendering folder**: `326231e90099427aa7e54643f5d9278c`
- **Data folder**: `9af2100833f44c0c8cd5493da38d1268`
- **Layout ID**: `96E5F4BA-A2CF-4A4C-A4E7-64DA88226362`
- **Templates folder**: `/sitecore/templates/Project/NovaTechCollection/Components/`
- Templates: SolutionsHero (`d67b94896e6b40d5aa3f2eb3294ac523`), SolutionCard (`8450eed0ecbc4febbe10aa6229843a05`), ValueProposition (`c67dcadc26cf4dbbb27a00d14a5dbdf0`), CaseStudy (`10fae6daadbb4ad8bf756d879570931e`), ProductHero, ProductFeature, PricingTable, Hero, CTABanner, etc.
- Renderings: SolutionsHero (`a87c0dfc70044580a82cbe3c11912da6`), SolutionCard (`ed0517e8fdcb4239bc68e95cf5dcffaa`), ValueProposition (`8e1da011e7ff4fb5a3576666f28dca83`), CaseStudy (`12ab9af29275447eac8057746533f835`)
- Publishing target: `experienceedge` via `publishSite` mutation
- **Automation Client ID**: `4f0O3Ur6t3FjrxzNWkPJQiLveQuGWLme`

## Important: Sitecore Internal Links
When setting `linktype="internal"` in Sitecore General Link fields (like CTALink), you MUST include the item's GUID in the `id` attribute. Using only `url="/path"` without the GUID will cause the CM's Edge layout resolution to fail for ALL pages (returns `rendered: {}`).

Correct format: `<link linktype="internal" id="{4AA845A0-7DE3-40C6-8DC1-F0AE57885350}" url="/Products" text="Get Started" />`
Wrong format: `<link linktype="internal" url="/Products" text="Get Started" />` (missing id — breaks Edge!)

## XM Cloud Rendering Host Log Diagnosis (Feb 27-28, 2026)
Analyzed 3 rendering host logs to find why Pages Editor wasn't rendering pages.

**Root Cause: Stale Component Map (THE REAL BLOCKER)**
All 3 logs showed `componentMap: Map(16)` — missing all 7 custom components (ProductHero, ProductFeature, PricingTable, SolutionsHero, SolutionCard, ValueProposition, CaseStudy). The XM Cloud EH deployment was NEVER rebuilt after these components were added. CMS data was flowing correctly in all 3 modes (preview, edit, normal) with full field data — the rendering host just couldn't find the components to render them.

**Transient errors (NOT blockers):**
- `TypeError: Failed to parse URL from /` — SDK's `resolveServerUrl()` returns undefined on first request; editing pipeline recovers on subsequent requests
- `TypeError: Cannot read properties of undefined (reading 'context')` — SDK's `getPreview` crash on first request; subsequent editing requests work fine
- Both errors appear at startup and are harmless — the Feb 28 12:10 log (970 lines) proves preview, edit, and normal mode all work after initial errors

**Approach: Near-stock with local preview.** Page.tsx follows the stock Sitecore Content SDK starter pattern with one addition: a `fallbackPage` and `knownPaths` array for local preview (when Edge API has no page data). The `getPage` call has a try-catch so errors fall through to the fallback. No instrumentation.ts or env overrides. The only real fix needed was registering all components in the build.

**Local URLs**: Access pages via `/`, `/Products`, `/Solutions` (without site/locale prefix). The middleware handles the rewrite. Using `/NovaTech/en/Products` directly causes double-prefix issues.

## Key Configuration Changes Made
- `examples/basic-nextjs/package.json`: Changed `config.appName` from `content-sdk-nextjs-app-router` to `basic-nextjs` to match the Sitecore rendering host key
- `examples/basic-nextjs/next.config.ts`: Added `allowedDevOrigins` for Replit proxy, CORS headers for Pages Editor iframe (`X-Frame-Options: ALLOWALL`, `Access-Control-Allow-Origin` on `/_next/*` and `/api/editing/*`)
- `xmcloud.build.json`: Disabled all rendering hosts except `basic-nextjs` to avoid confusion during XM Cloud builds
- `examples/basic-nextjs/sitecore.config.ts`: Reads Edge credentials from env vars with graceful fallback
- `examples/basic-nextjs/eslint.config.mjs`: Added `@typescript-eslint/no-explicit-any: "warn"` (was default warn in the working state, needed explicit override after package updates)
- `examples/basic-nextjs/src/Layout.tsx`: Added default content fallback for empty Sitecore placeholders, optional chaining for layout.sitecore. In editing/preview mode, always renders Sitecore AppPlaceholder (not default content) so editors can add components to empty placeholders
- `examples/basic-nextjs/src/Scripts.tsx`: Guards SDK components that access layout.sitecore
- `examples/basic-nextjs/src/byoc/index.tsx`: Optional chaining for layout.sitecore.context with `Record<string, unknown>` fallback
- `examples/basic-nextjs/src/components/content-sdk/CdpPageView.tsx`: Optional chaining for layout.sitecore with `Record<string, unknown>` fallback
- `examples/basic-nextjs/src/app/[site]/[locale]/[[...path]]/page.tsx`: Uses `SitecorePage` type alias (avoids conflict with component name)
- `examples/basic-nextjs/src/app/api/editing/render/route.ts`: Clean SDK route handler (original stock code, no customizations)
- `examples/basic-nextjs/src/components/default-content/DefaultContent.tsx`: File-level `eslint-disable @typescript-eslint/no-explicit-any` for SDK field type casts

## GitHub Integration
- **Owner**: `slamensdicreon`
- **Repo**: `sitecore-ai-showcase`
- **Branches**: `main` (production, triggers XM Cloud EH deployment), `newdev` (development — changes pushed here first, user merges to `main` manually)
- Connected via Replit OAuth (`conn_github_01KJGTFB06JWZ7MEG7MYF2EKK0`)

## Deployment
- Target: Autoscale
- Build: `cd examples/basic-nextjs && npm run next:build`
- Run: `cd examples/basic-nextjs && npm run next:start -- -p 5000 -H 0.0.0.0`
