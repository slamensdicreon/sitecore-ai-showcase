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

## NovaTech Components
Components located in `examples/basic-nextjs/src/components/`:
- **Hero** - Full-width banner with heading, subheading, background image, and CTA
- **CTABanner** - Dark navy conversion section with primary/secondary buttons
- **FeatureCard** - White card with icon, title, description, and link
- **Testimonial** - Blockquote with author attribution
- **ContentBlock** - Two-column text + image layout (configurable position)
- **SiteHeader** - Sticky dark navy header with logo and CTA
- **SiteFooter** - Dark navy footer with logo and copyright

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
When Sitecore CMS placeholders are empty (no components placed in the layout), the app renders default NovaTech content via:
- `src/lib/default-content.ts` — Static content data for all components
- `src/components/default-content/DefaultContent.tsx` — Renders default components when placeholders are empty
- `src/Layout.tsx` — Checks if placeholders are empty and falls back to default content

When components are placed in Sitecore CMS, the CMS content takes priority automatically.

## Key Configuration Changes Made
- `examples/basic-nextjs/next.config.ts`: Added `allowedDevOrigins` for Replit proxy compatibility
- `examples/basic-nextjs/sitecore.config.ts`: Reads Edge credentials from env vars with graceful fallback
- `examples/basic-nextjs/src/Layout.tsx`: Added default content fallback for empty Sitecore placeholders

## Deployment
- Target: Autoscale
- Build: `cd examples/basic-nextjs && npm run next:build`
- Run: `cd examples/basic-nextjs && npm run next:start -- -p 5000 -H 0.0.0.0`
