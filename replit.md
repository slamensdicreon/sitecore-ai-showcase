# TE Connectivity - OrderCloud B2B Commerce Demo

## Overview
A comprehensive B2B e-commerce demo inspired by TE Connectivity (te.com), built to demonstrate Sitecore OrderCloud commerce patterns. Addresses TE's Digital Ecosystem RFP requirements: enriched PDPs, multi-language/currency switching, quick-add by part number, enhanced checkout with shipping/tax/payment, product relationships, AI recommendations/chatbot, order management improvements, and role-based personalization.

## Architecture
- **Frontend**: React + TypeScript with Wouter routing, TanStack Query, Shadcn UI components, Tailwind CSS
- **Backend**: Express.js REST API with session-based authentication (trust proxy enabled, explicit session save on login/register)
- **Database**: PostgreSQL with Drizzle ORM
- **Admin**: Standalone React app in `admin/` folder, served at `/oc-admin`
- **Design**: TE Connectivity brand — TE Orange (#f28d00), Dark Teal (#2e4957), Turquoise (#167a87), Charcoal (#424241), Eco Green (#8fb838)

## Key Files
- `shared/schema.ts` - Database models: users, categories, products, price_breaks, orders, order_items, cart_items, parts_lists, parts_list_items, product_relationships, order_status_history
- `server/routes.ts` - REST API endpoints for auth, products, cart, orders, parts lists, OrderCloud admin, AI chat
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

### Admin Tabs
- **Dashboard**: Stats cards (products, categories, orders, users, revenue), recent orders, quick action buttons (Sync to OC, Pull from OC, Add Product, Bulk Sync)
- **Products**: Full local products CRUD — searchable table, create/edit modal, delete with confirmation, stock/status badges
- **Categories**: Local category CRUD — create/edit/delete with slug auto-generation
- **Orders**: All orders across all users — inline status update dropdown, order detail modal with items/shipping/payment/tracking
- **Buyers**: All registered users with company, role, locale, currency
- **OC Products**: OrderCloud synced products — sync, delete individual, bulk delete with confirmation
- **OC Categories**: OrderCloud categories view
- **Pricing**: OrderCloud price schedules with volume tiers
- **Relationships**: Product relationship mappings (related/alternative/accessory)
- **Audit Log**: Tracks all admin actions with timestamps and status
- **Monitoring**: API response times, request counts, error rates, system health status

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

### OrderCloud Admin
- `GET /api/admin/ordercloud/status` - Connection test
- `POST /api/admin/ordercloud/sync` - Push catalog
- `GET /api/admin/ordercloud/products` - List OC products
- `GET /api/admin/ordercloud/categories` - List OC categories
- `GET /api/admin/ordercloud/priceschedules` - List OC price schedules
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
