# TE Connectivity - OrderCloud B2B Commerce Demo

## Overview
This project is a B2B e-commerce demo inspired by TE Connectivity, showcasing Sitecore OrderCloud commerce patterns. It addresses requirements for enriched product pages, multi-language/currency support, quick-add functionality, enhanced checkout, product relationships, AI recommendations, and role-based personalization. The project aims to demonstrate a robust B2B commerce solution with advanced features.

## User Preferences
I want to be communicated with using clear and simple language. When suggesting code changes, please provide a concise explanation of the problem being solved and the approach taken. I prefer an iterative development process, where changes are proposed and reviewed in smaller, manageable chunks. Before making any major architectural changes or introducing new third-party libraries, please ask for my approval. Ensure that any generated code adheres to modern TypeScript and React best practices. I prefer that the `admin/` directory and its contents are not modified directly by the agent, as it's a separate administrative application.

## System Architecture
The application is built with a React and TypeScript frontend utilizing Wouter for routing, TanStack Query for data fetching, Shadcn UI for components, and Tailwind CSS for styling. The backend is an Express.js REST API with token-based authentication. PostgreSQL is used as a local cache and session store, with Drizzle ORM. Sitecore OrderCloud serves as the primary system of record for products, buyers, and orders. A separate React admin application is located in the `admin/` folder, accessible at `/oc-admin`, and follows the Sitecore Blok Design System with a purple-blue primary color, Inter font, rounded pill buttons, and a collapsible sidebar.

Core features include:
- **Enriched PDPs**: Detailed product pages with specifications, volume pricing, distributor links, availability, and related products.
- **Multi-language/Currency**: Support for English, German, and Chinese, with USD, EUR, and CNY currency conversion.
- **Enhanced Checkout**: A four-step checkout process covering address, shipping methods (Standard, Express, Next Day), tax/VAT calculation, discount codes, and multiple payment options (Credit Card, PayPal, PO).
- **Product Relationships**: Management of related, alternative, and accessory product mappings.
- **AI Features**: An AI chatbot for product search and order status, and AI-powered recommendations.
- **Order Management**: Comprehensive order history with status tracking, cancellation, and reorder capabilities.
- **Role-based Personalization**: UI adaptations for different buyer personas (e.g., Engineer vs. Purchaser).
- **B2B Patterns**: Implementation of volume pricing, purchase order numbers, and parts lists.
- **Feature Flags**: A database-backed system for toggling AI features (`ai_chatbot`, `ai_recommendations`, `ai_segmentation`, `ai_related_products`) via the admin interface.
- **Sitecore XM Cloud Integration**: Content authoring, Edge delivery, and in-context editing for specific pages (Homepage, Solutions). This involves a custom Content SDK replacement and an editing host for Sitecore Pages communication.
  - CM URL: `xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io`
  - Uses `SITECORE_AUTOMATION2_*` credentials for authoring API
  - Tenant: `TE Connectivity` (renamed from nxp); Site root: `/sitecore/content/TE Connectivity/TE Connectivity`
  - Templates: `/sitecore/templates/Project/nxp`; Renderings: `/sitecore/layout/Renderings/Project/build/NovaTech`
  - Rendering host: `basic-nextjs` at `examples/basic-nextjs/` — stock Content SDK starter with TE components layered on top (same approach as EAA demo on `sitecorebranch`)
  - Datasource location: `./Data` (nested under each page, following EAA pattern)
  - Content tree: Home/Data, Home/Solutions/Transportation/Data, Home/Solutions/Communications/Data, Home/Solutions/Industrial/Data
  - Sync pipeline creates 16 templates, 10 renderings, 16+ datasource items
  - Key XM Cloud GraphQL differences: `parent` field is `ID!` (GUID, not path); `itemId` returns bare lowercase GUIDs; Template Section ID `{E269FBB5-3750-427A-9149-7AA950B49301}`; Template Field ID `{455A3E98-A627-4B40-8035-E683A0331AC7}`; publish uses `experienceedge` target database
- **Sitecore CLI Serialization**: Item serialization for XM Cloud deployment pipeline
  - `authoring/items/te-connector/` — 225 YAML files pulled from XM Cloud with real GUIDs
  - `authoring/items/te-connector/te-connector.module.json` — Sitecore CLI module config
  - `sitecore.json` — Root serialization config pointing to module glob
  - `xmcloud.build.json` — XM Cloud build config pointing `basic-nextjs` to `./examples/basic-nextjs/`
  - `scripts/push-to-github.sh` — Push script for `slamensdicreon/sitecore-ai-showcase` repo

## External Dependencies
- **Sitecore OrderCloud**: Primary system of record for commerce data (products, buyers, orders).
- **PostgreSQL**: Database for local caching, sessions, and custom data models.
- **Express.js**: Backend web framework.
- **React**: Frontend library.
- **TypeScript**: Superset of JavaScript for type-safety.
- **Wouter**: React router.
- **TanStack Query**: Data fetching and caching library.
- **Shadcn UI**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Drizzle ORM**: TypeScript ORM for PostgreSQL.
- **Framer Motion**: Animation library for React.
- **Sitecore XM Cloud**: For content authoring, Edge delivery, and in-context editing.
- **Sitecore Blok Design System**: Design guidelines and components for the admin interface.