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

## NovaTech Components (20 registered)
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
- `SITECORE_EDGE_CONTEXT_ID` - Server-side Edge context ID (Live: `2E2iW...`)
- `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` - Client-side Edge context ID (Live: `2E2iW...`)
- `NEXT_PUBLIC_DEFAULT_SITE_NAME` - Set to "NovaTech"
- `SITECORE_EDITING_SECRET` - Editing endpoint auth token (secret)
- **Note**: Preview context ID (`3FroI...`) returns `rendered: {}` (empty) for all pages; Live context ID (`2E2iW...`) has data for Home and Products

## Running the App
Production mode (serves pre-built static pages):
```
cd examples/basic-nextjs && npm run next:build && npm run next:start -- -p 5000 -H 0.0.0.0
```

## Architecture: Stock SDK Starter + Custom Components + Defensive Editing
Core files are based on the Sitecore Content SDK starter (commit `76baa7c`):
- `Layout.tsx` - Stock
- `Scripts.tsx` - Stock
- `Providers.tsx` - Stock
- `byoc/index.tsx` - Stock
- `CdpPageView.tsx` - Stock
- `sitecore-client.ts` - Stock
- `middleware.ts` - Stock
- `next.config.ts` - Stock
- `package.json` - Stock (`name` and `appName` both `content-sdk-nextjs-app-router`)
- `eslint.config.mjs` - Stock

### Modified Stock Files

**`sitecore.config.ts`** — Near-stock `defineConfig({})`. Only override: when no Edge or Local API env vars are present, passes `contextId: 'not-configured'` to allow builds without credentials. The SDK's internal `getFallbackConfig()` + `deepMerge` handles all env var resolution automatically.

**`page.tsx`** — Stock + defensive try-catch around `client.getPreview()` and `client.getDesignLibraryData()`. If the editing preview fails (e.g., Preview Edge returns empty data), renders a diagnostic error page instead of crashing. Also validates `page.layout.sitecore.context` exists before proceeding.

**`src/app/api/editing/render/route.ts`** — Stock + `resolvePageUrl` option that ensures routes are absolute URLs (prepends `http://localhost:3000` on XM Cloud). This prevents the SDK's catch-block `Response.redirect(route)` from crashing with `Failed to parse URL from /` when `route` is a relative path.

The 14 custom NovaTech component files are in `src/components/`.

### Pages Editor / Preview Edge Issue (Confirmed Root Cause)
The Preview Edge context returns `{ item: { rendered: {} } }` for the EditingQuery — an empty object that is truthy but has NO `sitecore` property. The SDK's fallback check (`rendered || fallback`) doesn't trigger because `{}` is truthy. Then `getPreview()` crashes accessing `{}.sitecore.context`.

Defensive code deployed (merged to `main`, deployed as `43YD56nlWymzcSubguvj2U`): Pages Editor now shows a diagnostic error message instead of infinite spinner. The rendering host logs confirm the error is caught cleanly: `[NovaTech] Editing preview failed: TypeError: Cannot read properties of undefined (reading 'context')`.

**Preview Edge deeper finding**: The Preview Edge HAS items indexed (Home found by path `/sitecore/content/NovaTech/NovaTech/Home`) but the `rendered` field is empty. This means the items are synced to the Preview Edge but layout rendering isn't resolving. This is NOT fixed by "Publish to Experience Edge" — that only publishes to the Live Edge. The Preview Edge is auto-synced from the CM master database. The empty `rendered` field may indicate:
- Layout assignment not resolving in Preview context
- Rendering configuration missing for the Preview endpoint
- May require Sitecore support investigation

### Solutions Page on Live Edge — Route Present, Components Missing
The Solutions page route IS on Live Edge (3 routes: Home, Products, Solutions). However, the page's component placeholders are **empty** — all 3 placeholders (`headless-header`, `headless-main`, `headless-footer`) return `[]`.

**Root cause**: The original Solutions item (`{C7A26A9D-...}`) was silently rejected by Edge. After deleting and recreating with a new GUID (`97495906a38442d4bc3b251e63a0f74f`), the route appeared. However, Edge indexes the page item WITHOUT resolving `__Final Renderings` into component data. Multiple attempts were made:
- Setting `__Final Renderings` with all 10 renderings (same XML structure as working Products page)
- Publishing multiple times with `publishItemMode: FULL`
- Clearing and restoring layout fields ("dirty update" cycle)
- Creating a new version (v2) with layout
- Setting layout in `__Renderings` (shared) field instead
- Full delete/recreate with layout pre-set before first publish

None resolved the empty placeholder issue. Products (created via XM Cloud UI) works perfectly with 8 components. The Edge connector appears to handle API-created items differently from UI-created items for layout resolution.

**Recommended fix**: Add components to the Solutions page through the **XM Cloud Pages Editor UI** or **Content Editor presentation details**. This uses the native Sitecore UI flow which correctly triggers Edge layout resolution. Alternatively, open a Sitecore support ticket requesting an Edge re-index for the Solutions page.

## Sitecore Serialization Module (Complete — 14/14 Components, Verified)
The module at `.vscode/authoring/items/novatech.module.json` now contains full serialization for ALL 14 custom NovaTech components. All YML files have been verified to follow correct Sitecore serialization format (dashed GUIDs, no extra indentation, __Standard Values present). A fresh XM Cloud environment deploy from GitHub will auto-provision:
- **Templates** (with all fields + __Standard Values): Hero, ContentBlock, CTABanner, FeatureCard, Testimonial, SiteHeader, SiteFooter, ProductHero, ProductFeature, PricingTable, SolutionsHero, SolutionCard, ValueProposition, CaseStudy
- **Json Renderings** for each component (componentName, datasource template, datasource location)
- **Rendering Variants** and **Data Folders** for site setup
- **Placeholder Settings** (`headless-main`) allowing all 12 main-area components, plus `headless-header` (SiteHeader) and `headless-footer` (SiteFooter)
- **Available Renderings** branch template including all 14 components + CCL starter renderings

### Module File Counts (210 total YML files)
- `novatech.templates/` — 14 template roots + 14 Data sections + 14 __Standard Values + ~65 field YMLs
- `novatech.renderings/` — 14 rendering YMLs
- `novatech.modules/.../Rendering Variants/` — 14 variant setup YMLs
- `novatech.modules/.../Data Folders/` — 14 data folder setup YMLs
- `novatech.placeholderSettings/` — 3 YMLs (headless-main with 12 allowed controls, headless-header, headless-footer)
- `novatech.templates.branches/` — 1 available renderings branch YML (43 renderings)

## Current Status
- **Serialization module**: All 14 components fully serialized in `.vscode/authoring/` — `.gitignore` updated to allow `.vscode/authoring/` directory to be committed
- **Home** (`/`) — Layout set with 9 components via Authoring API
- **Products** (`/Products`) — Layout set with 8 components via Authoring API
- **Solutions** (`/Solutions`) — Layout set with 10 components via Authoring API
- **Pages Editor**: Deployed with defensive error handling
- Content created via Authoring GraphQL API with 14 renderings, 14 templates, datasource items, and page layouts published to Experience Edge

## Sitecore CMS Architecture
- **CM URL**: `xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io`
- **Home page ID**: `618f06bf2ec246af8906c24c800efa17`
- **Products page ID**: `22179458777c4bcfac606e0bf2c0938d`
- **Solutions page ID**: `246bbc13e6944f539bf8db74056ab7c3`
- **Site root ID**: `9afefa3d1df54c6f9b2df49be877e6a6`
- **Rendering folder**: `405b9345e31841bab30cc917e38f36a3`
- **Data folder**: `f5decb875fa94f1fbf6d4cd613c5397b`
- **Templates folder**: `f53dd5fe73a04592b6dceb53d47c57a7`
- **Layout ID**: `96E5F4BA-A2CF-4A4C-A4E7-64DA88226362`
- Publishing target: `experienceedge` via `publishSite` mutation
- **Automation Client ID**: `Ha35Bha8Dwj4H6cmdDv20EMh21Za1iad`

## Important: Sitecore Internal Links
When setting `linktype="internal"` in Sitecore General Link fields (like CTALink), you MUST include the item's GUID in the `id` attribute. Using only `url="/path"` without the GUID will cause the CM's Edge layout resolution to fail for ALL pages (returns `rendered: {}`).

Correct format: `<link linktype="internal" id="{4AA845A0-7DE3-40C6-8DC1-F0AE57885350}" url="/Products" text="Get Started" />`
Wrong format: `<link linktype="internal" url="/Products" text="Get Started" />` (missing id — breaks Edge!)

## GitHub Integration
- **Owner**: `slamensdicreon`
- **Repo**: `sitecore-ai-showcase`
- **Branches**: `main` (production, triggers XM Cloud EH deployment), `newdev` (development — changes pushed here first, user merges to `main` manually)
- Connected via Replit OAuth (`conn_github_01KJGTFB06JWZ7MEG7MYF2EKK0`)

## Deployment
- Target: Autoscale
- Build: `cd examples/basic-nextjs && npm run next:build`
- Run: `cd examples/basic-nextjs && npm run next:start -- -p 5000 -H 0.0.0.0`
