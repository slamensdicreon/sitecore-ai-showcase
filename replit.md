# Sitecore XM Cloud Front End Starter Kits

## Project Overview
This is the official Sitecore XM Cloud Front End Starter Kits repository. It contains multiple Next.js starter applications for building headless front-end apps powered by Sitecore XM Cloud. The active site being developed is **EAA** (Experimental Aircraft Association) — a redesign of eaa.org on Sitecore XM Cloud.

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

## Pages (EAA Content)
- **Home** (`/`) — Hero (Impact variant: full-viewport video, "Where Aviators Come Together"), 3 FeatureCards, ContentBlock ("Our Mission"), Testimonial, CTABanner ("Ready to Take Flight?")
- **Membership** (`/Products`) — Hero (Product variant: centered, "Product" badge, dual CTAs), 3 ProductFeatures, PricingTable (Individual $40/yr, Family $50/yr, Lifetime), CTABanner
- **Programs** (`/Solutions`) — Hero (Minimal variant: centered, "Solutions" badge, single CTA), 4 SolutionCards, ValueProposition, CaseStudy (Member Spotlight), CTABanner
- Nav links: Home, Membership, Programs (via CMS-managed NavigationLink items)

## EAA Components (12 custom)
Components located in `examples/basic-nextjs/src/components/`:
- **Hero** (unified, 3 variants) - Single component with auto-detecting `Default` export:
  - `Impact` — Full-viewport (100vh) video hero, bottom-left content, dual gradient overlays, primary + secondary CTAs (Home page)
  - `Product` — Centered layout, gradient bg, radial glow, Badge pill, dual side-by-side CTAs (Products page)
  - `Minimal` — Centered layout, gradient bg, two radial glows, Badge pill, single CTA (Solutions page)
  - `Default` — Auto-dispatches based on `params.FieldNames` or field content detection (VideoUrl → Impact, Badge+SecondaryCTA → Product, Badge → Minimal, fallback → Impact)
  - Fields (superset): Heading, Subheading, VideoUrl (File), BackgroundImage (Image), CTAText, CTALink, SecondaryCtaText, SecondaryCtaLink, Badge
  - CMS: Template `400a3c7c`, Rendering `2e9a11fa`; DS items: Home `76bc1947`, Products `631ca584`, Solutions `64ee1317`
- **CTABanner** - Dark navy conversion section with primary/secondary buttons
- **FeatureCard** - White card with icon, title, description, and link
- **Testimonial** - Blockquote with author attribution
- **ContentBlock** - Two-column text + image layout (configurable position)
- **SiteHeader** - Sticky dark navy header with EAA wordmark and hamburger menu; slide-out drawer with CMS-managed navigation links fetched from Edge GraphQL; split into server component (SiteHeader.tsx) and client component (DrawerNav.tsx)
- **SiteFooter** - Dark navy footer with EAA wordmark and copyright
- **ProductFeature** - Alternating left/right feature sections with badge, title, description, image placeholder
- **PricingTable** - 3-tier membership pricing section (Individual, Family, Lifetime)
- **SolutionCard** - Program card with blue accent bar, icon, title, description, metrics, and link
- **ValueProposition** - Stats section with 3 large metric columns (200K+ Members, 850+ Chapters, 70+ Years)
- **CaseStudy** - Member spotlight with company details, quote, author, and 3 metric cards

## EAA Design System (Brand Colors)
- **Primary Navy**: `#061E40` (EAA Deep Cove — hero/banner bg)
- **Secondary Navy**: `#0D3B7A` (gradients)
- **Action Blue**: `#0076C0` (EAA Lochmara — buttons, accents)
- **Light Blue Accent**: `#1A90D5` (gradient endpoints)
- **Light Blue**: `#9AC7F7` (EAA Jordy Blue — badges)
- **Red**: `#EE3524` (EAA AirVenture red — reserved for future use)
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

The 14 custom EAA component files are in `src/components/`.

### Pages Editor / Preview Edge
Defensive code deployed: Pages Editor shows diagnostic error message instead of spinner if Preview Edge returns empty `rendered` object.

## Sitecore Serialization Module (Complete — 14/14 Components, Verified)
The module at `.vscode/authoring/items/novatech.module.json` now contains full serialization for ALL 14 custom EAA components (originally created as NovaTech templates — CMS template names remain NovaTech internally). All YML files have been verified to follow correct Sitecore serialization format (dashed GUIDs, no extra indentation, __Standard Values present). A fresh XM Cloud environment deploy from GitHub will auto-provision:
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

## Current Status (EAA Rebrand Complete — All 3 pages live, Hero unified)
- **Home** (`/`) — 9 components: SiteHeader, Hero (Impact), 3 FeatureCards, ContentBlock, Testimonial, CTABanner, SiteFooter
- **Membership** (`/Products`) — 8 components: SiteHeader, Hero (Product), 3 ProductFeatures, PricingTable, CTABanner, SiteFooter
- **Programs** (`/Solutions`) — 10 components: SiteHeader, Hero (Minimal), 4 SolutionCards, ValueProposition, CaseStudy, CTABanner, SiteFooter
- Products and Solutions are children of Home in the content tree (best practice)
- All content updated to EAA context via Authoring GraphQL API, published to Experience Edge
- Hero consolidated: 4 separate hero components (Hero, HeroImpact, ProductHero, SolutionsHero) merged into a single Hero with 3 named variant exports; old component directories removed
- Brand colors updated from NovaTech (#0A1628/#2563EB) to EAA (#061E40/#0076C0)
- Logo: EAA wordmark (text-based) in header and footer; CMS Logo ImageField takes priority when set
- Nav links: Home, Membership, Programs (CMS-managed NavigationLink items)
- **Serialization module**: All components serialized in `.vscode/authoring/` — `.gitignore` updated to allow commits

## NovaTech Lander Template (Pages Editor)
A separate "NovaTech Lander" template enables marketers to create new landing pages with drag-and-drop NovaTech components in Pages Editor. Completely independent from the existing `Page` template.
- **Template ID**: `02a6160f2a4942c7803f0282b7350b6d` (at `/sitecore/templates/Project/build/NovaTech Lander`)
- **Standard Values ID**: `74fb19416a4347489ee47a5b3485c98f`
- **Page Design**: "NovaTech Lander Design" (`f26ff105bec04e398fbde152fa859fac`) — references Global partial design for auto header/footer
- **Placeholder Settings** (under `/sitecore/layout/Placeholder Settings/Project/build/`):
  - `headless-main` (`69b27afad5d8482aa3596d0e79e963c9`) — 12 main-area components allowed
  - `headless-header` (`fe4d0ef8620741d9a6da804474fa1e57`) — SiteHeader only
  - `headless-footer` (`19c3d9fd60de4fa7b7360ebb885abf1f`) — SiteFooter only
- **Available Renderings**: NovaTech group (`708d8f13`) updated with all 14 actual CMS rendering IDs
- **Partial Designs**: Header and Footer partial designs updated to reference actual SiteHeader/SiteFooter rendering IDs with shared datasources
- **Insert Options**: NovaTech Lander added to Home page's `__Masters` so marketers can create new landing pages as children of Home
- **Rendering Icons**: All 14 renderings have distinctive Sitecore built-in icons (replaces default blue rectangles)
- **Wireframe Images**: Low-fidelity wireframes generated for all 14 components at `examples/basic-nextjs/public/wireframes/`
- **Datasource Locations**: SiteHeader/SiteFooter renderings point to global Data folder; main components use `./Data` (page-local)

## Content Item Organization
Content items are organized under page-local `Data` folders (matching the Landing Page pattern):
- **Home/Data** (`67f5d089c99e443ebb41235a9f504d7f`) — Hero, ContentBlock, CTABanner, 3 FeatureCards, Testimonial
- **Products/Data** (`54d8f04d3e4c47a1b67fb0c6def32a7b`) — ProductHero, 3 ProductFeatures, PricingTable, Products CTABanner
- **Solutions/Data** (`4b51e19aef3a449eab2b47a197b5822a`) — SolutionsHero, 4 SolutionCards, ValueProposition, CaseStudy, Solutions CTABanner
- **Global Data** — SiteHeader (`8c41861a`) and SiteFooter (`57ac498e17ca43b3b772a2a5815fe975`) remain in the site-level Data folder as shared items
- **SiteHeader Nav Links** — NavigationLink template (`6246de49`) with Title + Link fields; 3 child items under SiteHeader datasource (Home, Membership, Programs); fetched via Edge GraphQL at build time with 300s revalidation
- **Automation Credentials**: Client ID `Ha35Bha8Dwj4H6cmdDv20EMh21Za1iad`, secret in env var `SITECORE_AUTOMATION_CLIENT_SECRET`
- **Publishing**: Target database is `experienceedge` (not `web`); use `publishItemMode: SMART`; XM Cloud workflow may require approval of draft items before they propagate to Edge

## Sitecore CMS Architecture
- **CM URL**: `xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io`
- **Home page ID**: `618f06bf2ec246af8906c24c800efa17`
- **Products page ID**: `f19cb6b2a3eb4e74a473b5138f02bacc` (child of Home)
- **Solutions page ID**: `dda9cadfe8d84584aa8a01e321121c22` (child of Home)
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
