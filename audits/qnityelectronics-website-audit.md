# Website Audit: Qnity Electronics (www.qnityelectronics.com)

**Date:** 2026-03-06
**Purpose:** Estimate the templates and components required to rebuild this site using Sitecore XM Cloud with Next.js starter kits.

---

## Executive Summary

Qnity Electronics is a B2B electronics materials company (spun off from DuPont). The site is a mid-to-large corporate website with ~12 distinct page templates and ~35-40 reusable components. The architecture follows a classic corporate pattern: homepage, product/brand hierarchy, industry/application hubs, company information, news/blog, and resource center.

---

## 1. Page Templates (12 Templates)

### T1 - Homepage
**URL:** `/`
**Purpose:** Corporate landing page with marketing-driven content blocks.
**Structure:**
- Hero banner with CTA
- Feature carousel (rotating product/application highlights)
- Value proposition section with embedded video
- Brand showcase grid (6 brands)
- Application areas grid (6 cards)
- Company values section
- News & events listing (latest 7 items)
- Contact CTA banner
- Global footer

**Reuse:** Single use (1 page)

---

### T2 - Industry/Application Hub Page
**URLs:** `/automotive.html`, `/advanced-computing-and-artificial-intelligence.html`, `/5g.html`, etc.
**Purpose:** Landing pages for specific industries or application areas.
**Structure:**
- Breadcrumb navigation
- Hero section with headline + descriptive copy
- Value proposition / overview paragraphs
- Multimedia resources (video embeds, linked assets)
- Accordion sections with nested product references
- Expert contact CTA
- Contact CTA banner

**Reuse:** ~10-15 pages (industries + applications)

---

### T3 - Product Category Page
**URLs:** `/thermal-management-materials.html`, `/electronic-components.html`, etc.
**Purpose:** Category hub grouping multiple products/brands under a solution area.
**Structure:**
- Breadcrumb navigation
- Hero section with category title + overview
- Accordion-based product portfolio (expandable sections with sub-products)
- Resource section (white papers, case studies, application notes)
- Contact CTA banner

**Reuse:** ~10-12 pages

---

### T4 - Brand Page
**URLs:** `/ikonic-polishing-pads.html`, `/kalrez.html`, `/laminates.html`, etc.
**Purpose:** Detailed brand/product family pages with technical information.
**Structure:**
- Breadcrumb navigation
- Hero section with brand name + introduction
- Product series sections (accordion or card-based, each with benefits + applications)
- Cross-link section to related product families
- Contact CTA banner

**Reuse:** ~13 pages (one per brand)

---

### T5 - Company Story / About Page
**URL:** `/our-story.html`
**Purpose:** Rich storytelling page with heavy animation and visual content.
**Structure:**
- Hero with video background
- Value proposition grid (4-column)
- Differentiator blocks (numbered features)
- Embedded video player
- Product image grid (2x2)
- Heritage/history narrative section
- Product slider/carousel
- Press kit download CTA
- Image gallery grid
- FAQ accordion

**Reuse:** 1 page (unique, high-design template)

---

### T6 - Company Info Page (Generic)
**URLs:** `/our-technology.html`, `/our-people.html`
**Purpose:** Modular content pages for company information.
**Structure:**
- Hero section with tagline
- Content blocks (alternating text + media)
- Feature pillars (3-column grid)
- Partnership/collaboration section
- Career CTA
- Contact CTA banner

**Reuse:** ~4-5 pages

---

### T7 - Locations / Visit Us Page
**URL:** `/visit-us.html`
**Purpose:** Global office directory with regional navigation.
**Structure:**
- Hero section with stats (employees, locations)
- Centers of excellence description
- Tabbed regional navigation (North America, EMEA, LATAM, APAC)
- Location cards (city, facility name, address, phone)
- Modal overlays for additional detail

**Reuse:** 1 page

---

### T8 - News Listing Page
**URL:** `/news.html`
**Purpose:** Filterable news article listing.
**Structure:**
- Hero section with title
- Multi-faceted filter bar (type, topic, industry, brands, date/year)
- Article cards (multiple layouts: list, grid small, grid large, no-image)
- Load More pagination

**Reuse:** 1 page

---

### T9 - Blog Listing Page
**URL:** `/blogs.html`
**Purpose:** Blog article listing with category tabs.
**Structure:**
- Hero section
- Category tab navigation (Featured Solutions, Viewpoints, Knowledge, Industry Engagement)
- Article cards (title, excerpt, read more link)
- Show More pagination

**Reuse:** 1 page

---

### T10 - Article Detail Page
**URLs:** `/blogs/what-drives-a-car-that-can-drive-itself.html`, individual news articles
**Purpose:** Individual blog post or news article.
**Structure:**
- Breadcrumb navigation
- Publication metadata (date, category)
- Article headline
- Social sharing buttons (Facebook, Twitter, LinkedIn)
- Rich text body content (paragraphs, images, video embeds)
- Related content cards (2-3 items)
- Contact CTA banner

**Reuse:** ~50-100+ pages (all articles/news items)

---

### T11 - Resource Center Page
**URL:** `/resource-center.html`
**Purpose:** Searchable/filterable document library.
**Structure:**
- Hero section
- Featured documents area
- Search bar with text input
- Multi-faceted filter panel (resource type, technologies, applications, brands, products, markets)
- Sort options (most recent, alphabetical)
- View toggle (list/grid)
- Resource cards with download actions
- Load More pagination
- FAQ section
- Authentication gate for secured content

**Reuse:** 1 page

---

### T12 - Product Finder / Solution Finder
**URL:** `/solution-finder/results.html`
**Purpose:** Faceted product search and comparison tool.
**Structure:**
- Search bar ("Search for a product")
- Filter panel with multi-select facets (product families, brands, industries, categories, applications)
- Clear filters button
- Results count display
- View toggle
- Product comparison feature (up to 6 items)
- Product result cards
- Load More pagination

**Reuse:** 1 page

---

### T13 - Contact / Gateway Page
**URL:** `/contact-us.html`
**Purpose:** Routing page directing users to appropriate contact channels.
**Structure:**
- Three pathway cards (Find a Distributor, Product Finder, News)
- Each with description + "Get Started" CTA

**Reuse:** 1 page

---

### T14 - Distributor Hub Page
**URL:** `/distributors.html`
**Purpose:** Brand-specific distributor routing page.
**Structure:**
- Breadcrumb navigation
- Brand distributor cards (3 featured brands)
- Each with description + "Find a Distributor" CTA linking to brand-specific locators

**Reuse:** 1 page

---

## 2. Component Catalog (~38 Components)

### Navigation & Structure Components

| # | Component | Description | Used In |
|---|-----------|-------------|---------|
| 1 | **Header / Navigation** | Mega-menu with dropdowns, search, user account, mobile hamburger | All pages |
| 2 | **Footer** | Multi-column links, social media, legal links | All pages |
| 3 | **Breadcrumb** | Hierarchical page path navigation | Interior pages |
| 4 | **Investor Banner** | Fixed announcement bar at top of page | All pages |

### Hero Components

| # | Component | Description | Used In |
|---|-----------|-------------|---------|
| 5 | **Hero Banner** | Full-width hero with headline, body text, CTA button | T1, T6, T8, T9 |
| 6 | **Hero Video Background** | Full-screen video background with text overlay | T5 |
| 7 | **Hero with Breadcrumb** | Hero combining title + breadcrumb navigation | T2, T3, T4, T10 |

### Content Components

| # | Component | Description | Used In |
|---|-----------|-------------|---------|
| 8 | **Rich Text Block** | Standard rich text content area | All templates |
| 9 | **Value Proposition Section** | Headline + paragraph + optional embedded video | T1, T5, T6 |
| 10 | **Feature Grid (4-Column)** | Four-column grid with icon/heading/description | T5 |
| 11 | **Differentiator Blocks** | Numbered feature blocks with descriptions | T5 |
| 12 | **Feature Pillars (3-Column)** | Three innovation/technology pillars in columns | T6 |
| 13 | **Stats Bar** | Key figures (employees, locations, etc.) | T7 |

### Card & Grid Components

| # | Component | Description | Used In |
|---|-----------|-------------|---------|
| 14 | **Brand Showcase Card** | Brand logo/name + brief description + learn more link | T1 |
| 15 | **Brand Showcase Grid** | 6-up grid layout for brand cards | T1 |
| 16 | **Application Card** | Application area with description + CTA | T1 |
| 17 | **Application Grid** | 6-up grid for application cards | T1 |
| 18 | **News Card** | Title + date + excerpt + read more link (multiple layout variants: list, grid-small, grid-large, no-image) | T1, T8, T9 |
| 19 | **Pathway Card** | Title + description + "Get Started" CTA | T13, T14 |
| 20 | **Related Content Card** | Thumbnail + title + link for related articles/products | T10 |
| 21 | **Location Card** | City, facility name, address, phone number | T7 |
| 22 | **Resource Card** | Document title, type badge, download action | T11 |
| 23 | **Product Result Card** | Product name, brand, category with compare checkbox | T12 |

### Interactive Components

| # | Component | Description | Used In |
|---|-----------|-------------|---------|
| 24 | **Accordion** | Expandable/collapsible content sections | T2, T3, T4, T5 |
| 25 | **Feature Carousel / Slider** | Rotating content slides with navigation dots + counter | T1, T5 |
| 26 | **Tab Navigation** | Horizontal tabs for content switching | T7, T9 |
| 27 | **FAQ Accordion** | Expandable Q&A pairs | T5, T11 |
| 28 | **Video Player / Modal** | HTML5 video with play button, modal lightbox | T1, T2, T5, T6, T10 |
| 29 | **Image Gallery Grid** | Multi-image showcase (2x2 or freeform) | T5 |

### Search & Filter Components

| # | Component | Description | Used In |
|---|-----------|-------------|---------|
| 30 | **Search Bar** | Text input search field | T11, T12 |
| 31 | **Faceted Filter Panel** | Multi-select filter groups with clear all | T8, T11, T12 |
| 32 | **Sort Dropdown** | Sort options (date, alphabetical) | T11 |
| 33 | **View Toggle** | Switch between list/grid display | T11, T12 |
| 34 | **Load More Button** | Progressive pagination | T8, T9, T11, T12 |
| 35 | **Product Comparison Bar** | Compare up to 6 selected products | T12 |

### CTA & Utility Components

| # | Component | Description | Used In |
|---|-----------|-------------|---------|
| 36 | **Contact CTA Banner** | "We're here to help" full-width call-to-action strip | Most templates |
| 37 | **Social Sharing Buttons** | Facebook, Twitter, LinkedIn share icons | T10 |
| 38 | **Press Kit / Download CTA** | Download link with description | T5 |

---

## 3. Template Sizing Summary

| Template | Complexity | Est. Components per Page | Content Volume |
|----------|-----------|-------------------------|----------------|
| T1 - Homepage | High | 12-15 | 1 page |
| T2 - Industry/Application Hub | Medium | 6-8 | 10-15 pages |
| T3 - Product Category | Medium | 6-7 | 10-12 pages |
| T4 - Brand Page | Medium | 5-7 | 13 pages |
| T5 - Company Story | High | 12-15 | 1 page |
| T6 - Company Info (Generic) | Medium | 6-8 | 4-5 pages |
| T7 - Locations | Medium-High | 5-6 | 1 page |
| T8 - News Listing | Medium-High | 5-6 | 1 page |
| T9 - Blog Listing | Medium | 4-5 | 1 page |
| T10 - Article Detail | Low-Medium | 5-6 | 50-100+ pages |
| T11 - Resource Center | High | 7-9 | 1 page |
| T12 - Product Finder | High | 6-8 | 1 page |
| T13 - Contact Gateway | Low | 3-4 | 1 page |
| T14 - Distributor Hub | Low | 3-4 | 1 page |

---

## 4. Estimation Summary

| Category | Count |
|----------|-------|
| **Unique Page Templates** | 14 |
| **Reusable Components** | 38 |
| **Estimated Total Pages** | ~100-170 |
| **High-complexity Templates** | 4 (Homepage, Company Story, Resource Center, Product Finder) |
| **Medium-complexity Templates** | 7 (Industry Hub, Product Category, Brand, Company Info, Locations, News Listing, Blog Listing) |
| **Low-complexity Templates** | 3 (Article Detail, Contact Gateway, Distributor Hub) |

---

## 5. Recommended XM Cloud Starter Kit Mapping

Given the repository's available starter kits, the closest matches are:

| Qnity Section | Recommended Starter Base | Rationale |
|---------------|-------------------------|-----------|
| Homepage, Company pages | `kit-nextjs-article-starter` | Editorial-style layout with rich content blocks, carousels, and storytelling |
| Product/Brand hierarchy | `kit-nextjs-product-listing` | Product-focused with filtering and categorization patterns |
| Locations / Visit Us | `kit-nextjs-location-finder` | Location finder with regional navigation and address cards |
| News/Blog | `kit-nextjs-article-starter` | Article listing and detail pages with filtering |

### Key Technical Considerations

1. **Accordion Component** - Heavily used across product category, brand, and application pages. Should be a flexible, reusable component supporting nested content.
2. **Faceted Search/Filter** - Resource Center and Product Finder both require sophisticated filtering. Consider a shared filter component with configurable facets.
3. **Video Modal** - Used on 5+ templates. Build as a standalone reusable component triggered by CTA buttons.
4. **Card System** - At least 8 different card variants identified. Consider a single Card component with variant props (news, brand, application, pathway, location, resource, product, related).
5. **Mega Navigation** - Complex dropdown menu with brand listings, product categories, industries, and applications. This is a significant standalone effort.
6. **Authentication Gate** - Resource Center requires user sign-in for secured content downloads.

---

## 6. Component Variant Matrix

Components that should support multiple rendering variants:

| Component | Variants |
|-----------|----------|
| Hero | Default, Video Background, With Breadcrumb |
| Card | News (list, grid-sm, grid-lg, no-image), Brand, Application, Pathway, Location, Resource, Product, Related |
| Accordion | Standard, FAQ, Nested (with sub-accordions) |
| Grid Layout | 2-column, 3-column, 4-column, 6-up |
| CTA | Banner (full-width), Inline, Button, Download |
| Listing | News, Blog, Resource, Product Results |
| Filter | Single-select, Multi-select, Date/Year picker |
| Carousel | Feature (with dots + counter), Product slider, News slider |

---

## 7. Content Model Implications

### Sitecore Template Types Needed

| Template Type | Purpose | Key Fields |
|--------------|---------|------------|
| **Page Templates** | 14 page types as defined above | Standard page fields + placeholder configurations |
| **Brand Item** | Datasource for brand cards | Name, Logo, Description, Link, Products (multilist) |
| **Product Category** | Datasource for product listings | Name, Description, Products (multilist), Resources |
| **Product Item** | Individual product entries | Name, Brand, Category, Description, Specs, Documents |
| **News/Blog Article** | Article content items | Title, Date, Category, Body (rich text), Image, Related Items |
| **Location** | Office/facility entries | City, Facility Name, Address, Phone, Region, Coordinates |
| **Resource Document** | Downloadable resources | Title, Type, File, Brands, Products, Industries |
| **Application Area** | Industry/application entries | Name, Description, Image, Related Products, Related Brands |
| **FAQ Item** | Question and answer pairs | Question, Answer (rich text) |
| **CTA Item** | Reusable call-to-action | Headline, Body, Button Text, Button Link |

---

*This audit provides a structural foundation for scoping the XM Cloud implementation. Actual effort will depend on design fidelity, animation complexity (particularly for T5 - Company Story), integration requirements (authentication, analytics), and content migration volume.*
