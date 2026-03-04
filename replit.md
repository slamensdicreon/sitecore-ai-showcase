# TE Connectivity - OrderCloud B2B Commerce Demo

## Overview
A B2B e-commerce demo application inspired by TE Connectivity (te.com), built to demonstrate Sitecore OrderCloud commerce patterns. Features a product catalog of electronic components (connectors, sensors, relays, wire & cable, circuit protection, terminal blocks) with volume pricing, shopping cart, order management, and parts list functionality.

## Architecture
- **Frontend**: React + TypeScript with Wouter routing, TanStack Query, Shadcn UI components, Tailwind CSS
- **Backend**: Express.js REST API with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Admin**: Standalone React app in `admin/` folder (separately hostable)
- **Design**: TE Connectivity official brand system — TE Orange (#f28d00) primary, TE Dark Teal (#2e4957) secondary, TE Turquoise (#167a87) tertiary, TE Charcoal (#424241) text, Montserrat headings + Inter body text, TE Eco Green (#8fb838) for stock status, TE Ruby (#bc1f00) for destructive actions

## Key Files
- `shared/schema.ts` - All database models: users, categories, products, price_breaks, orders, order_items, cart_items, parts_lists, parts_list_items
- `server/routes.ts` - REST API endpoints for auth, products, cart, orders, parts lists, OrderCloud admin (with CORS)
- `server/storage.ts` - DatabaseStorage implementing IStorage interface
- `server/seed.ts` - Seed data with 14 realistic electronic components across 6 categories
- `server/db.ts` - PostgreSQL connection pool with Drizzle
- `server/ordercloud.ts` - OrderCloud API client (auth, products, categories, price schedules, catalog assignments)
- `server/ordercloud-sync.ts` - Sync script to push/pull catalog data between local DB and OrderCloud

## Frontend Pages (Demo App)
- `/` - Home page with hero, category grid, featured products
- `/products` - Product catalog with category/industry filters, grid/list views
- `/products/:id` - Product detail with specs, volume pricing, add to cart
- `/cart` - Shopping cart with quantity controls
- `/checkout` - Checkout with shipping address and PO number
- `/orders` - Order history list
- `/orders/:id` - Order detail with line items
- `/parts-lists` - Parts list management (create, expand, add all to cart)
- `/login` - Sign in / register with demo credentials (demo/demo123)

## Admin App (Standalone - `admin/` folder)
The OrderCloud admin dashboard lives in a separate `admin/` directory and can be hosted independently from the demo app.

### Running the Admin App
```bash
cd admin
npm install
npm run dev
```

### Building for Production
```bash
cd admin
npm install
npm run build
# Output in admin/dist/ — deploy as static files
```

### Configuration
Set the `VITE_API_BASE_URL` environment variable to point the admin app at the demo backend:
- Local development (same machine): leave empty or set to `http://localhost:5000`
- Remote hosting: set to the full URL of the demo backend (e.g. `https://your-demo.replit.app`)

### Admin Features
- OrderCloud connection status monitoring
- Catalog sync (push local products/categories/prices to OrderCloud)
- Browse OrderCloud products, categories, and price schedules
- Delete individual products from OrderCloud

## OrderCloud Integration
- **API Client**: 8A75679A-A58C-4396-B4FD-0BA06B01EB6D (US East sandbox)
- **API URL**: https://useast-sandbox.ordercloud.io
- **Auth**: Client credentials grant with FullAccess scope
- **Catalog ID**: te-connectivity-catalog
- **Sync**: Pushes categories (as slug IDs), products (as SKU IDs), and price schedules (as ps-{SKU} IDs) to OrderCloud
- **Admin API routes**: `/api/admin/ordercloud/*` — CORS-enabled so the admin app can call them from a different domain
  - GET `/api/admin/ordercloud/status` - Connection test
  - POST `/api/admin/ordercloud/sync` - Push catalog to OrderCloud
  - GET `/api/admin/ordercloud/products` - List OC products
  - GET `/api/admin/ordercloud/categories` - List OC categories
  - GET `/api/admin/ordercloud/priceschedules` - List OC price schedules
  - POST `/api/admin/ordercloud/products` - Create/update product in OC
  - DELETE `/api/admin/ordercloud/products/:sku` - Delete product from OC

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
- `ORDERCLOUD_CLIENT_ID` - OrderCloud API Client ID
- `ORDERCLOUD_CLIENT_SECRET` - OrderCloud API Client Secret
- `ORDERCLOUD_API_URL` - OrderCloud API base URL (https://useast-sandbox.ordercloud.io)
