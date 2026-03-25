---
name: sitecore-page-creation
description: End-to-end process for creating a new page in Sitecore XM Cloud connected to a Next.js App Router frontend. Use when the user asks to create a new page, add components to Sitecore, wire up CMS content, or publish to Experience Edge. Covers React components, component registration, CMS item creation via Authoring GraphQL API, layout configuration, publishing, and deployment.
---

# Sitecore XM Cloud Page Creation

Complete, repeatable process for creating a new page in Sitecore XM Cloud with a Next.js App Router frontend. This covers every step from React component creation to CMS configuration to deployment.

## Prerequisites

Before starting, ensure you have:

1. **Environment variables configured:**
   - `SITECORE_EDGE_CONTEXT_ID` — Server-side Edge context ID
   - `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` — Client-side Edge context ID
   - `SITECORE_EDITING_SECRET` — Editing endpoint auth token

2. **CM URL** — The Sitecore XM Cloud authoring instance URL (check `replit.md`)

3. **Automation credentials** — Client ID and secret for OAuth (stored in `SITECORE_AUTOMATION_CLIENT_SECRET`)

4. **Key project paths** (check `replit.md` for current values):
   - Components: `examples/basic-nextjs/src/components/`
   - Component map: `examples/basic-nextjs/.sitecore/component-map.ts`
   - Default content: `examples/basic-nextjs/src/lib/default-content.ts`
   - Route handler: `examples/basic-nextjs/src/app/[site]/[locale]/[[...path]]/page.tsx`

5. **Sitecore item paths** (check `replit.md` for IDs):
   - Templates: `/sitecore/templates/Project/NovaTechCollection/Components/`
   - Renderings: `/sitecore/layout/Renderings/Project/NovaTech/`
   - Content: `/sitecore/content/NovaTech/NovaTech/Home/`
   - Data: `/sitecore/content/NovaTech/NovaTech/Data/`

---

## Step 1: Create React Components

### File Structure
Each component gets its own directory using kebab-case, with a PascalCase `.tsx` file inside the app root (`examples/basic-nextjs/`):
```
examples/basic-nextjs/src/components/
  my-component/
    MyComponent.tsx
```
All paths below are relative to the app root (`examples/basic-nextjs/`) unless otherwise noted.

### Component Template
```tsx
import { JSX } from 'react';
import { Text, RichText, Image, Link, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface MyComponentFields {
  Heading: Field<string>;        // Single-Line Text → use Field<string>
  Body: Field<string>;           // Rich Text → use Field<string> with <RichText />
  Photo: ImageField;             // Image → use ImageField with <Image />
  CTALink: LinkField;            // General Link → use LinkField with <Link />
  CTAText: Field<string>;        // Button text
}

type MyComponentProps = ComponentProps & {
  fields: MyComponentFields;
};

export const Default = (props: MyComponentProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  // REQUIRED: Empty-state guard for when no datasource is assigned
  if (!fields) {
    return (
      <div className={`component my-component ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">MyComponent requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`component my-component ${styles}`} id={id || undefined}>
      <Text tag="h2" field={fields.Heading} />
      <RichText field={fields.Body} />
      {fields.Photo?.value?.src && (
        <Image field={fields.Photo} style={{ width: '100%', height: 'auto' }} />
      )}
      {fields.CTALink?.value?.href && (
        <Link field={fields.CTALink}>
          <Text field={fields.CTAText} />
        </Link>
      )}
    </div>
  );
};
```

### Key Rules
- **Export name must be `Default`** (named export, not default export)
- **Field names must exactly match** the Sitecore template field names (case-sensitive)
- **Always guard against missing fields**: Check `fields.Image?.value?.src`, `fields.Link?.value?.href` before rendering
- **Use SDK components** (`<Text>`, `<RichText>`, `<Image>`, `<Link>`) instead of raw HTML — these enable inline editing in the Pages Editor
- **Style with inline styles** to avoid CSS conflicts and keep components self-contained

### Field Type Mapping
| Sitecore Field Type | TypeScript Type | React Component |
|---------------------|----------------|-----------------|
| Single-Line Text | `Field<string>` | `<Text field={f} />` |
| Multi-Line Text | `Field<string>` | `<Text field={f} />` |
| Rich Text | `Field<string>` | `<RichText field={f} />` |
| Image | `ImageField` | `<Image field={f} />` |
| General Link | `LinkField` | `<Link field={f}>` |
| Number | `Field<number>` | `<Text field={f} />` |
| Checkbox | `Field<boolean>` | `{f.value && ...}` |

---

## Step 2: Register Components

Update `examples/basic-nextjs/.sitecore/component-map.ts`:

```ts
// Add import (after the "end of built-in components" comment)
// Import path is relative to app root, using 'src/...' (configured via tsconfig paths)
import * as MyComponent from 'src/components/my-component/MyComponent';

// Add to componentMap (the Map entries)
['MyComponent', { ...MyComponent }],
```

**CRITICAL**: The string key in the Map (`'MyComponent'`) must **exactly match** the `Component Name` field on the Sitecore JSON Rendering item. If these don't match, the component won't render and will show a yellow "missing implementation" warning.

---

## Step 3: Add Default Content Fallback

This ensures the page renders even when Sitecore Edge data is unavailable.

### 3a. Add page content to `src/lib/default-content.ts`

Add a new content object following the existing pattern:
```ts
const myPageContent = {
  'headless-header': homeContent['headless-header'],  // Reuse shared header
  'headless-main': [
    {
      componentName: 'MyComponent',  // Must match component-map key
      fields: {
        Heading: { value: 'Page Title' },
        Body: { value: '<p>Description text</p>' },
        Photo: { value: {} },
        CTAText: { value: 'Learn More' },
        CTALink: { value: { href: '/', text: 'Learn More' } },
      },
    },
  ],
  'headless-footer': homeContent['headless-footer'],  // Reuse shared footer
};
```

Update the `getDefaultContent()` function:
```ts
export function getDefaultContent(routePath?: string) {
  if (routePath?.toLowerCase() === '/my-page' || routePath?.toLowerCase()?.endsWith('/my-page')) {
    return myPageContent;
  }
  // ... existing routes
  return homeContent;
}
```

### 3b. Add route to `knownPaths` in `page.tsx`

In `src/app/[site]/[locale]/[[...path]]/page.tsx`, add the new path:
```ts
const knownPaths = ['/', '/Products', '/MyPage'];
// Note: Matching is case-insensitive (uses .toLowerCase()), but use consistent casing for clarity
```

---

## Step 4: Authenticate with Sitecore CM

### Get OAuth Bearer Token

```bash
curl -s -X POST "https://auth.sitecorecloud.io/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT_ID_HERE",
    "client_secret": "CLIENT_SECRET_HERE",
    "audience": "https://api.sitecorecloud.io",
    "grant_type": "client_credentials"
  }' | node -e "const d=require('fs').readFileSync(0,'utf8');const j=JSON.parse(d);require('fs').writeFileSync('/tmp/sc_bearer_token.txt',j.access_token);console.log('Token saved (' + j.access_token.length + ' chars)');"
```

- Client ID is stored in project notes (check `replit.md` scratchpad)
- Client secret is in `SITECORE_AUTOMATION_CLIENT_SECRET` environment variable
- Token expires after ~24 hours — re-authenticate if you get 401s
- Save token to `/tmp/sc_bearer_token.txt` for reuse

### Verify Token
```bash
TOKEN=$(cat /tmp/sc_bearer_token.txt)
curl -s -X POST "https://CM_URL/sitecore/api/authoring/graphql/v1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "sc_apikey: API_KEY" \
  -d '{"query": "{ item(where: { path: \"/sitecore/content\" }) { name } }"}'
```

---

## Step 5: Create CMS Items via Authoring GraphQL API

All mutations go to: `POST https://CM_URL/sitecore/api/authoring/graphql/v1`

Headers:
```
Content-Type: application/json
Authorization: Bearer TOKEN
sc_apikey: API_KEY
```

### 5a. Create Data Template

First create the template item, then add a field section, then add fields to the section.

**Create template:**
```graphql
mutation {
  createItem(input: {
    name: "MyComponent"
    templateId: "AB86861A6030462C898F21C4D18C8109"  # /sitecore/templates/System/Templates/Template
    parent: "PARENT_TEMPLATE_FOLDER_ID"
    fields: [
      { name: "__Base template", value: "{1930BBEB-7805-471A-A3BE-4858AC7CF696}" }
    ]
  }) {
    item { itemId name }
  }
}
```

**Note on `__Base template`**: Use `{1930BBEB-7805-471A-A3BE-4858AC7CF696}` (Standard template) as the base. For data templates that need standard values inheritance, this is the correct base.

**Create field section on template:**
```graphql
mutation {
  createItem(input: {
    name: "Content"
    templateId: "E269FBB5CE3C4B7F952D251C4B563EB9"  # Template Section
    parent: "TEMPLATE_ID_FROM_ABOVE"
  }) {
    item { itemId name }
  }
}
```

**Create fields on section:**
```graphql
mutation {
  createItem(input: {
    name: "Heading"
    templateId: "455A3E98A627455C8D3848B5AB789FEB"  # Template Field
    parent: "SECTION_ID_FROM_ABOVE"
    fields: [
      { name: "Type", value: "Single-Line Text" }
    ]
  }) {
    item { itemId name }
  }
}
```

**Common field types** (values for the "Type" field):
- `Single-Line Text`
- `Rich Text`
- `Image`
- `General Link`
- `Multi-Line Text`
- `Number`
- `Checkbox`
- `Droplink`
- `Treelist`

### 5b. Create JSON Rendering Item

```graphql
mutation {
  createItem(input: {
    name: "MyComponent"
    templateId: "04646A89996747EDA3101C2C78C3B170"  # /sitecore/templates/System/Layout/Renderings/Json Rendering
    parent: "RENDERING_FOLDER_ID"
    fields: [
      { name: "Component Name", value: "MyComponent" },
      { name: "Datasource Template", value: "TEMPLATE_ID_IN_BRACES" }
    ]
  }) {
    item { itemId name }
  }
}
```

**CRITICAL**: The `Component Name` field value must **exactly match** the key used in `component-map.ts`. This is how the layout service maps renderings to React components.

The `Datasource Template` should be the template ID in `{GUID}` format, e.g., `{2531D2D8-9F0A-4F39-9552-F42107DFC3B4}`.

### 5c. Create Data Folder and Datasource Items

**Create data folder (optional, for organization):**
```graphql
mutation {
  createItem(input: {
    name: "My Components"
    templateId: "A87A00B1E6DB45AB8B54636FEC3B5523"  # Common/Folder template
    parent: "DATA_FOLDER_ID"
  }) {
    item { itemId name }
  }
}
```

**Create datasource item:**
```graphql
mutation {
  createItem(input: {
    name: "My First Item"
    templateId: "MY_COMPONENT_TEMPLATE_ID"
    parent: "DATA_SUBFOLDER_ID"
    fields: [
      { name: "Heading", value: "Welcome to My Page" },
      { name: "Body", value: "<p>This is the body content.</p>" }
    ]
  }) {
    item { itemId name }
  }
}
```

**For fields with special characters (XML, HTML)**: Use GraphQL variables to avoid escaping issues:
```javascript
const body = JSON.stringify({
  query: 'mutation Create($parentId: ID!, $value: String!) { createItem(input: { name: "MyItem", templateId: "TEMPLATE_ID", parent: $parentId, fields: [{ name: "Body", value: $value }] }) { item { itemId } } }',
  variables: { parentId: "PARENT_ID", value: "<p>HTML content here</p>" }
});
```

### 5d. Create the Page Item

```graphql
mutation {
  createItem(input: {
    name: "MyPage"
    templateId: "PAGE_TEMPLATE_ID"  # Usually the "Page" template
    parent: "HOME_PAGE_ID"
    fields: [
      { name: "Title", value: "My New Page" }
    ]
  }) {
    item { itemId name }
  }
}
```

**Page template ID**: Look up the Home page's template ID by querying it — pages typically use the same template.

---

## Step 6: Configure Page Layout

The `__Final Renderings` field defines which components appear on the page and in which placeholders.

### XML Format

```xml
<r xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}" l="{LAYOUT_ID}">
    <r ds="{HEADER_DATASOURCE_ID}" id="{SITEHEADER_RENDERING_ID}" par="" ph="headless-header" uid="{UNIQUE_GUID_1}" />
    <r ds="{COMPONENT1_DATASOURCE_ID}" id="{COMPONENT1_RENDERING_ID}" par="" ph="headless-main" uid="{UNIQUE_GUID_2}" />
    <r ds="{COMPONENT2_DATASOURCE_ID}" id="{COMPONENT2_RENDERING_ID}" par="" ph="headless-main" uid="{UNIQUE_GUID_3}" />
    <r ds="{FOOTER_DATASOURCE_ID}" id="{SITEFOOTER_RENDERING_ID}" par="" ph="headless-footer" uid="{UNIQUE_GUID_4}" />
  </d>
</r>
```

### Field Reference
- `d id` — Device ID. Use `{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}` (Default device)
- `d l` — Layout ID. Copy from the Home page's existing layout
- `r ds` — Datasource item ID (the content item, in `{GUID}` format)
- `r id` — Rendering item ID (the JSON Rendering, in `{GUID}` format)
- `r par` — Rendering parameters (usually empty string)
- `r ph` — Placeholder name (`headless-header`, `headless-main`, or `headless-footer`)
- `r uid` — A unique GUID for this rendering instance (generate a new one for each `<r>`)

### Setting the Layout via API

Use GraphQL variables to avoid XML escaping issues:

```javascript
const renderings = '<r xmlns:xsd="http://www.w3.org/2001/XMLSchema"><d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}" l="{LAYOUT_ID}">...</d></r>';

node -e '
const https = require("https");
const renderings = require("fs").readFileSync("/tmp/renderings.txt", "utf8");
const body = JSON.stringify({
  query: "mutation UpdateLayout($itemId: ID!, $value: String!) { updateItem(input: { itemId: $itemId, fields: [{ name: \"__Final Renderings\", value: $value }] }) { item { name } } }",
  variables: { itemId: "PAGE_ITEM_ID", value: renderings }
});
// ... send request
'
```

### Also Set `__Renderings` (Shared Layout)

```xml
<r xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}" l="{LAYOUT_ID}" />
</r>
```

This sets the shared layout device and layout reference. Copy the exact value from the Home page.

---

## Step 7: Publish to Experience Edge

```graphql
mutation {
  publishSite(input: {
    publishSiteMode: FULL
    targetDatabases: ["experienceedge"]
    languages: ["en"]
  }) {
    operationId
  }
}
```

**CRITICAL field names:**
- `publishSiteMode` (not `siteName`) — use `FULL` for complete publish
- `targetDatabases` (not `publishingTargets`) — use `["experienceedge"]`
- `languages` — use `["en"]` or whichever languages are needed

Wait 30-60 seconds after publishing for Edge to sync.

### Verify on CM Edge (Preview)

```bash
curl -s "https://CM_URL/sitecore/api/graph/edge" \
  -H "Content-Type: application/json" \
  -H "sc_apikey: API_KEY" \
  -d '{"query": "{ layout(site: \"NovaTech\", routePath: \"/MyPage\", language: \"en\") { item { rendered } } }"}'
```

If `rendered` is `{}` (empty object), there's a layout resolution error — see Pitfalls section.

---

## Step 8: Deploy to XM Cloud

New components only exist on Replit until pushed to the git repository. The XM Cloud rendering host builds from git.

### Files to Push
1. Component files: `src/components/my-component/MyComponent.tsx`
2. Updated component map: `.sitecore/component-map.ts`

### Push via GitHub API

Use the GitHub integration (see integrations skill) to get an access token, then:

1. Get current `main` branch SHA
2. Create blobs for each file (base64 encoded)
3. Create a new tree with the files
4. Create a commit pointing to the new tree
5. Update `refs/heads/main` to the new commit

### After Pushing
1. Go to XM Cloud Deploy app
2. Trigger a new deployment for the **rendering host** (not the CM/authoring platform)
3. Wait for build to complete — verify the build log shows your components being registered
4. The Pages Editor should now render your new components

---

## Critical Pitfalls & Lessons Learned

### 1. Internal Links MUST Include Item GUID

When setting `linktype="internal"` in a General Link field, you MUST include the target item's GUID:

**CORRECT:**
```xml
<link linktype="internal" id="{4AA845A0-7DE3-40C6-8DC1-F0AE57885350}" url="/Products" text="Get Started" />
```

**WRONG (breaks ALL pages on the site):**
```xml
<link linktype="internal" url="/Products" text="Get Started" />
```

Without the `id` attribute, the CM's Edge layout resolution fails silently and returns `rendered: {}` for **every page** on the entire site. Use `linktype="external"` if you don't have the target item's GUID:

```xml
<link linktype="external" url="/Products" text="Get Started" />
```

### 2. SDK Patch for `rendered: {}` Handling

The Sitecore Content SDK (`@sitecore-content-sdk/core`) crashes when Edge returns `rendered: {}` (empty object). Two layout-service.js files must be patched to check for `rendered.sitecore` before using the rendered data.

**This patch must be re-applied after `npm install`.**

Patched files (both need the same fix):
1. `node_modules/@sitecore-content-sdk/core/dist/cjs/layout/layout-service.js` (CommonJS)
2. `node_modules/@sitecore-content-sdk/core/dist/esm/layout/layout-service.js` (ESM)

In each file, find where `rendered` is used and add a guard: `if (rendered && rendered.sitecore) { ... }` — skip processing if `rendered` is an empty object.

### 3. GraphQL XML Escaping

Sitecore field values containing XML/HTML (`__Final Renderings`, Rich Text, General Link) will cause GraphQL parse errors if embedded directly in the query string. **Always use GraphQL variables** for these fields:

```javascript
const body = JSON.stringify({
  query: 'mutation Update($itemId: ID!, $value: String!) { updateItem(input: { itemId: $itemId, fields: [{ name: "__Final Renderings", value: $value }] }) { item { name } } }',
  variables: { itemId: "...", value: xmlString }
});
```

### 4. Component Name Matching

Three things must match exactly (case-sensitive):
1. The `Component Name` field on the Sitecore JSON Rendering item
2. The key in the `componentMap` in `component-map.ts`
3. The `componentName` in default content fallback data

If any of these don't match, the component won't render.

### 5. Rendering Host vs CM Deployment

XM Cloud has **two separate deployments**:
- **CM (Authoring)** — deploys the .NET Sitecore instance, pushes serialized items
- **Rendering Host (EH)** — deploys the Next.js application

New React components require a **rendering host redeployment**. The CM deployment does NOT include the rendering host build.

### 6. EH 403 From External Sources

The rendering host URL (`xmc-...-eh.sitecorecloud.io`) returns 403 for external requests. This is normal — the EH is only accessible from within Sitecore's internal network (Pages Editor, CM). Don't use external accessibility as a health check.

### 7. Publish API Field Names

The publish mutation changed field names between versions. Use:
```graphql
publishSite(input: {
  publishSiteMode: FULL          # NOT "siteName"
  targetDatabases: ["experienceedge"]  # NOT "publishingTargets"
  languages: ["en"]
})
```

### 8. Template System IDs

These are Sitecore system template IDs needed for creating items:

| Item Type | Template ID |
|-----------|-------------|
| Template (data template) | `AB86861A6030462C898F21C4D18C8109` |
| Template Section | `E269FBB5CE3C4B7F952D251C4B563EB9` |
| Template Field | `455A3E98A627455C8D3848B5AB789FEB` |
| JSON Rendering | `04646A89996747EDA3101C2C78C3B170` |
| Folder | `A87A00B1E6DB45AB8B54636FEC3B5523` |

### 9. ESLint `no-explicit-any` Build Failures

The project's ESLint config extends `next/typescript`, which enables the `@typescript-eslint/no-explicit-any` rule. This means `as any` type casts will **fail the production build** (`next build`) even though they work fine in development (`next dev`).

**Key facts:**
- `next dev` does NOT run ESLint — only `next build` does
- The `DefaultContent.tsx` file is a bridge/adapter that takes loosely-typed default content data and passes it to strictly-typed component props — it legitimately needs relaxed typing
- Add `/* eslint-disable @typescript-eslint/no-explicit-any */` at the very top of `DefaultContent.tsx`
- **Always run `npx next lint` before pushing code** to catch build-breaking ESLint errors early

**Pattern for DefaultContent.tsx:**
```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react';
// ... rest of file with as any casts for component field props
```

**Do NOT use `as any` in component files** (e.g., `SolutionsHero.tsx`). Those should use proper Sitecore SDK types (`Field<string>`, `ImageField`, `LinkField`). The ESLint disable is only appropriate for the default content bridge file.

---

## Verification Checklist

Before considering the page complete, verify each of these:

- [ ] **ESLint passes**: Run `npx next lint` in the app directory before pushing — catches `no-explicit-any` and other build-breaking errors that `next dev` silently ignores
- [ ] **Component renders locally**: Visit the page URL on Replit, confirm 200 status and visual output
- [ ] **CMS content displays**: Verify actual Sitecore field values appear (not just fallback defaults)
- [ ] **All placeholders populated**: Header, main content, and footer all render
- [ ] **Links work**: Internal navigation links point to correct URLs
- [ ] **CM Edge preview works**: Query `CM_URL/sitecore/api/graph/edge` and confirm `rendered` contains `sitecore.route` data
- [ ] **No layout resolution errors**: `rendered` is NOT `{}` — if it is, check for broken internal links (Pitfall #1)
- [ ] **Component map matches**: Component names in map, rendering items, and default content all match
- [ ] **Code pushed to git**: All new component files and updated component-map.ts are in the `main` branch
- [ ] **Rendering host redeployed**: XM Cloud Deploy shows successful EH build with new components
- [ ] **Pages Editor renders**: Components show actual content, not yellow "missing implementation" boxes
