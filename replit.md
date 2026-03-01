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

**This is a CMS content publishing issue, not a code issue.** The defensive code changes prevent the crash and show a diagnostic message instead. To fully fix Pages Editor:
1. Open Content Editor in Sitecore CM
2. Select the Home item
3. Publish > Publish Site to Experience Edge (include subitems)
4. Wait 2-3 minutes for Edge propagation
5. Reload Pages Editor

## Current Status
- **Home** (`/`) and **Products** (`/Products`) render correctly from Live Edge with all components
- **Solutions** (`/Solutions`) is NOT yet published to Live Edge — shows 404
- **Pages Editor**: Defensive code pushed to `newdev` — requires merge to `main` + XM Cloud redeployment. After deploy, editor will show diagnostic message if Preview Edge still empty. CMS republish needed to populate Preview Edge.
- **Preview context ID** (`3FroI...`) returns empty `rendered: {}` for all pages

## Sitecore CMS Architecture
- **CM URL**: `xmc-icreonpartncfab-novatechshof00c-novatech964b.sitecorecloud.io`
- **Editing Host URL**: `https://xmc-2oqiqa6dtxraqi23cxueur-eh.sitecorecloud.io`
- **Home page ID**: `0a7f28d1a8b24b8090c9e4643fdf866f`
- **Products page ID**: `4aa845a07de340c68dc1f0ae57885350`
- **Solutions page ID**: `c7a26a9dcba24849bd50cb28e6f841a5`
- **Rendering folder**: `326231e90099427aa7e54643f5d9278c`
- **Data folder**: `9af2100833f44c0c8cd5493da38d1268`
- **Layout ID**: `96E5F4BA-A2CF-4A4C-A4E7-64DA88226362`
- **Templates folder**: `/sitecore/templates/Project/NovaTechCollection/Components/`
- Publishing target: `experienceedge` via `publishSite` mutation
- **Automation Client ID**: `4f0O3Ur6t3FjrxzNWkPJQiLveQuGWLme`

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
