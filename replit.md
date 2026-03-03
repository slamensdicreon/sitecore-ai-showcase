# TE Connectivity - OrderCloud B2B Commerce Demo

## Overview
A B2B e-commerce demo application inspired by TE Connectivity (te.com), built to demonstrate Sitecore OrderCloud commerce patterns. Features a product catalog of electronic components (connectors, sensors, relays, wire & cable, circuit protection, terminal blocks) with volume pricing, shopping cart, order management, and parts list functionality.

## Architecture
- **Frontend**: React + TypeScript with Wouter routing, TanStack Query, Shadcn UI components, Tailwind CSS
- **Backend**: Express.js REST API with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Design**: TE Connectivity official brand system — TE Orange (#f28d00) primary, TE Dark Teal (#2e4957) secondary, TE Turquoise (#167a87) tertiary, TE Charcoal (#424241) text, Montserrat headings + Inter body text, TE Eco Green (#8fb838) for stock status, TE Ruby (#bc1f00) for destructive actions

## Key Files
- `shared/schema.ts` - All database models: users, categories, products, price_breaks, orders, order_items, cart_items, parts_lists, parts_list_items
- `server/routes.ts` - REST API endpoints for auth, products, cart, orders, parts lists
- `server/storage.ts` - DatabaseStorage implementing IStorage interface
- `server/seed.ts` - Seed data with 14 realistic electronic components across 6 categories
- `server/db.ts` - PostgreSQL connection pool with Drizzle

## Frontend Pages
- `/` - Home page with hero, category grid, featured products
- `/products` - Product catalog with category/industry filters, grid/list views
- `/products/:id` - Product detail with specs, volume pricing, add to cart
- `/cart` - Shopping cart with quantity controls
- `/checkout` - Checkout with shipping address and PO number
- `/orders` - Order history list
- `/orders/:id` - Order detail with line items
- `/parts-lists` - Parts list management (create, expand, add all to cart)
- `/login` - Sign in / register with demo credentials (demo/demo123)

## OrderCloud B2B Patterns Implemented
- Volume/tier-based pricing (price breaks at 1, 25, 100, 500, 1000+ units)
- Customer-specific catalogs (authenticated user experience)
- PO number support on orders
- Parts lists for saved product collections
- Product specifications and datasheet references
- SKU-based product identification
- B2B registration with company name

## Environment
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` - Session encryption key
