# TE Connectivity - OrderCloud B2B Commerce Demo

## Overview
A comprehensive B2B e-commerce demo inspired by TE Connectivity (te.com), built to demonstrate Sitecore OrderCloud commerce patterns. Addresses TE's Digital Ecosystem RFP requirements: enriched PDPs, multi-language/currency switching, quick-add by part number, enhanced checkout with shipping/tax/payment, product relationships, AI recommendations/chatbot, order management improvements, and role-based personalization.

## Architecture
- **Frontend**: React + TypeScript with Wouter routing, TanStack Query, Shadcn UI components, Tailwind CSS
- **Backend**: Express.js REST API with session-based authentication (trust proxy enabled, explicit session save on login/register)
- **Database**: PostgreSQL with Drizzle ORM (local cache/session store; OrderCloud is primary system of record)
- **OrderCloud Integration**: Sitecore OrderCloud is the primary system of record for products, buyers (customer users), and orders. Local PostgreSQL serves as cache and session store.
- **Admin**: Standalone React app in `admin/` folder, served at `/oc-admin`
- **Admin Design**: Sitecore Blok Design System — Primary #5548D9 (purple-blue), Ring #6987f9, Inter font, rounded-4xl pill buttons, collapsible sidebar nav, semantic status colors (success green, warning amber, destructive red)

## OrderCloud Sync Flows
- **Products**: Catalog (categories, products, price schedules) synced via `syncToOrderCloud()` in `server/ordercloud-sync.ts`
- **Buyer Sync**: Registration → `syncBuyerToOrderCloud(user)` creates OC Buyer User under `DEFAULT_BUYER_ID = "te-connectivity-buyers"`. Buyer user ID = sanitized username. Fire-and-forget (non-blocking). Local user gets `ocBuyerId` column updated.
- **Order Sync**: Order placement → `syncOrderToOrderCloud(order, items, user)` creates OC Order with line items (using product SKU as ProductID) and submits it. Fire-and-forget. Local order gets `ocOrderId` column updated.
- **Buyer Org Init**: `ensureBuyerOrganization()` called at startup to ensure the default buyer org exists in OC
- **Bulk Sync**: Admin can trigger `syncAllBuyersToOrderCloud()` and `syncAllOrdersToOrderCloud()` from OC Sync tab

## Key Files
- `shared/schema.ts` - Database models: users (with `ocBuyerId`), categories, products, price_breaks, orders (with `ocOrderId`), order_items, cart_items, parts_lists, parts_list_items, product_relationships, order_status_history, feature_flags, audit_log
- `server/routes.ts` - REST API endpoints for auth (with OC buyer sync), products, cart, orders (with OC order sync), parts lists, OrderCloud admin, AI chat
- `server/ordercloud.ts` - OrderCloud API client: products, categories, price schedules, buyers, buyer users, orders, line items
- `server/ordercloud-sync.ts` - Sync module: catalog sync, buyer sync, order sync, bulk sync operations
- `server/storage.ts` - DatabaseStorage implementing IStorage interface with related products, SKU lookup, discount validation, order cancellation, status history
- `server/seed.ts` - Seed data with 14 electronic components, 6 categories, 28 product relationships
- `client/src/lib/i18n.tsx` - I18n context with EN/DE/ZH translations, USD/EUR/CNY currency conversion
- `client/src/lib/auth.tsx` - Auth context with persona switching (engineer/purchaser), query cache clearing on login/logout, setUser for direct state updates
- `client/src/components/ai-chatbot.tsx` - AI chatbot with product search, order status, and navigation
- `client/src/components/header.tsx` - Header with language/currency switcher, persona dropdown, quick-add by part number

## Frontend Pages
- `/` - Home with hero, categories, featured products, AI recommendations (browsing history)
- `/products` - Catalog with category/industry filters, grid/list views, i18n pricing
- `/products/:id` - Enriched PDP: related/alternative/accessory products, distributor links (Digi-Key/Mouser/Arrow), availability indicators, engineer resources panel, recently-viewed tracking
- `/cart` - Cart with stock availability badges, quantity controls, i18n pricing
- `/checkout` - 4-step checkout: Address → Shipping → Payment → Review. Structured address, shipping methods (Standard/Express/Next Day), tax/VAT calculation, discount codes (TE10=10%, VOLUME20=20%), payment options (Credit Card/PayPal/PO)
- `/orders` - Order history with status badges, PO numbers
- `/orders/:id` - Order detail with status history timeline, tracking, cancel/reorder
- `/parts-lists` - Parts list management
- `/login` - Sign in / register (demo: demo/demo123)

## Admin App (`admin/`)
Served at `/oc-admin` when published. Standalone dev: `cd admin && npm run dev`.

### Admin Sidebar Navigation (Blok Design System)
Collapsible left sidebar (w-60 expanded / w-16 collapsed), 10 nav items with active state, OC connection indicator at bottom.

- **Dashboard**: KPI cards (products, categories, orders, buyers, revenue, avg order value, OC synced count), revenue trend area chart, orders-by-status donut chart, top selling products, low stock alerts, recent orders feed, quick actions (sync, pull, add product, export CSV)
- **Analytics**: Business analytics with top products by revenue/units bar charts, user role & language pie charts, top buyers table, inventory overview by category
- **Products**: Full CRUD — searchable table, create/edit modal, delete, stock/status badges, price breaks count, CSV export
- **Categories**: CRUD with product counts per category, slug auto-generation
- **Orders**: All orders with status filter dropdown, inline status update, risk indicators (high/medium/low by value), order detail modal with financial breakdown, CSV export
- **Buyers**: Users table with order count & total spent per user, locale/currency info, OC sync status indicators, CSV export
- **OC Sync**: Consolidated OrderCloud management — connection status, products/categories/price schedules/buyer users/orders tables, sync all/sync buyers/sync orders/pull/delete all actions, sync log
- **Relationships**: Product relationship mappings (related/alternative/accessory)
- **Audit Log**: Persistent DB-backed audit log with category filters (system/product/order/category/sync), actor tracking, CSV export
- **Settings**: Integration health dashboard, real AI feature flag toggles (persisted to DB), notification templates, export center

### Feature Flags System
DB table `feature_flags` with 4 AI flags: `ai_chatbot`, `ai_recommendations`, `ai_segmentation`, `ai_related_products` (all default true).
- Admin toggles in Settings tab call `PATCH /api/admin/feature-flags/:key` to persist changes and write audit log entries
- Storefront reads `GET /api/feature-flags` (public, returns `{key: boolean}` map) with 30s stale time
- `client/src/App.tsx` conditionally renders AIChatbot based on `ai_chatbot` flag
- `client/src/pages/product-detail.tsx` conditionally fetches/shows related products based on `ai_related_products` flag

## RFP Features Demonstrated
1. **Enriched PDP**: Specs tabs, volume pricing, distributor links, availability indicators, related products
2. **Multi-language/Currency**: EN/DE/ZH language switching, USD/EUR/CNY with live conversion
3. **Quick-add by Part Number**: SKU lookup in header, instant add-to-cart
4. **Enhanced Checkout**: Structured address, shipping methods with costs, tax/VAT, discount codes, multiple payment methods
5. **Product Relationships**: Related, alternative, accessory product mappings (28 seeded relationships)
6. **AI Features**: Chatbot with product search and navigation, AI-powered recommendations on home page
7. **Order Management**: Status history timeline, tracking numbers, cancel/reorder, audit trail
8. **Role-based Personalization**: Engineer vs Purchaser personas with adapted UI emphasis
9. **B2B Patterns**: Volume pricing, PO numbers, parts lists, company-specific catalogs

## API Endpoints
### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Products
- `GET /api/products` - List products (query: categorySlug, search)
- `GET /api/products/:id` - Product detail with price breaks
- `GET /api/products/:id/related` - Related/alternative/accessory products
- `GET /api/products/sku/:sku` - Lookup product by SKU (for quick-add)

### Cart & Orders
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order (with shipping/tax/discount/payment)
- `GET /api/orders/:id` - Order detail
- `GET /api/orders/:id/history` - Order status history
- `POST /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/validate-discount` - Validate discount code

### User
- `PATCH /api/users/preferences` - Update locale, currency, role

### Admin Dashboard API
- `GET /api/admin/stats` - Dashboard stats (products, categories, orders, users, revenue)
- `GET /api/admin/orders` - All orders with items and user info
- `PATCH /api/admin/orders/:id/status` - Update order status + tracking
- `GET /api/admin/users` - All users (without passwords)
- `GET /api/admin/local-products` - All products with price breaks
- `POST /api/admin/local-products` - Create product
- `PUT /api/admin/local-products/:id` - Update product
- `DELETE /api/admin/local-products/:id` - Delete product
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `POST /api/admin/pull-from-oc` - Pull catalog from OrderCloud

### Feature Flags
- `GET /api/feature-flags` - Public: get all flags as `{key: boolean}` map
- `GET /api/admin/feature-flags` - Admin: get all flags with metadata
- `PATCH /api/admin/feature-flags/:key` - Toggle a feature flag (body: `{enabled: boolean}`)

### OrderCloud Admin
- `GET /api/admin/ordercloud/status` - Connection test
- `POST /api/admin/ordercloud/sync` - Push catalog + buyers to OrderCloud
- `GET /api/admin/ordercloud/products` - List OC products
- `GET /api/admin/ordercloud/categories` - List OC categories
- `GET /api/admin/ordercloud/priceschedules` - List OC price schedules
- `GET /api/admin/ordercloud/buyers` - List OC buyer users
- `GET /api/admin/ordercloud/orders` - List OC orders (incoming)
- `POST /api/admin/ordercloud/sync-buyers` - Bulk sync all local users to OC
- `POST /api/admin/ordercloud/sync-orders` - Bulk sync unsynced orders to OC
- `DELETE /api/admin/ordercloud/products/:sku` - Delete OC product

## Demo Data
- **Discount codes**: TE10 (10% off), VOLUME20 (20% off)
- **Shipping**: Standard (Free), Express ($15), Next Day ($35)
- **Tax rate**: 8.25% (labeled as VAT for EUR)
- **Currency rates**: 1 USD = 0.92 EUR = 7.24 CNY
- **Credentials**: demo / demo123

## Environment
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `ORDERCLOUD_CLIENT_ID` - OrderCloud API Client ID
- `ORDERCLOUD_CLIENT_SECRET` - OrderCloud API Client Secret
- `ORDERCLOUD_API_URL` - OrderCloud API base URL
