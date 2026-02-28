# Audit: Working State vs Current State — Pages Editor Connection

## Summary

The Pages Editor was working when the project had **Homepage + Products page** (commit `a49de89`). It stopped working after subsequent commits added the Solutions page and attempted to fix build errors. This audit compares the two states file-by-file to identify every critical difference.

---

## Commit Timeline

| Commit | Description | Pages Editor Status |
|--------|-------------|-------------------|
| `76baa7c` | Original starter code (merge PR) | Assumed working |
| `51b4aeb` | Configure dev environments | Working |
| `b1500dc` | Configure Sitecore connection (sitecore.config.ts) | Working |
| `556242e` | Add default content rendering | Working |
| `54ad3f2` | Responsive grid layout for feature cards | Working |
| **`a49de89`** | **Add Products page (last known working)** | **WORKING** |
| `8ca6211` | Add Solutions page components | Unknown (build may have failed?) |
| `a0aab80` | Address ESLint build errors | Build failed |
| `cdd3de6` | Fix build error (restore type for route param) | Build failed |
| `0b61dbd` | Add `ignoreBuildErrors` + `ignoreDuringBuilds` | Build passes, **BROKEN** |
| `e67890b` | Attempt: set editing host URL in route.ts | BROKEN |
| `6ea3c6c` | Attempt: inline via next.config env option | BROKEN |
| `9b56c70` | Attempt: add instrumentation.ts | BROKEN |
| `60fb479` | Attempt: remove env option, set at runtime | BROKEN |
| `1f7d31f` | Attempt: postinstall SDK patch | BROKEN |

---

## Files Changed Between Working (`a49de89`) and Current (`HEAD`)

### Category 1: Configuration Files (HIGH RISK)

#### 1. `next.config.ts`

**Working state:** No `typescript` or `eslint` overrides.
```typescript
const nextConfig: NextConfig = {
  distDir: process.env.NEXTJS_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: [...],
  images: { ... },
  rewrites: async () => { ... },
};
```

**Current state:** Added two new options.
```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,    // <-- ADDED
  },
  eslint: {
    ignoreDuringBuilds: true,   // <-- ADDED
  },
  distDir: process.env.NEXTJS_DIST_DIR || '.next',
  // ... rest identical
};
```

**Risk Assessment:** MEDIUM
- `typescript.ignoreBuildErrors` skips TypeScript type checking during `next build`
- `eslint.ignoreDuringBuilds` skips ESLint during `next build`
- These should NOT affect runtime behavior or the editing flow
- However, they may mask errors that previously prevented deployment of broken code
- **Key question:** Were these options present in the LAST SUCCESSFUL XM Cloud deployment that worked with Pages Editor? If not, they were added AFTER the working deployment.

#### 2. `sitecore.config.ts`

**Working state and current state: IDENTICAL** (no changes since `a49de89`)

The config has been the same since `b1500dc`:
```typescript
export default defineConfig({
  ...(!hasEdgeConfig && !hasLocalConfig
    ? { api: { edge: { contextId: 'not-configured' } } }
    : { api: { edge: { contextId: process.env.SITECORE_EDGE_CONTEXT_ID || ..., clientContextId: ... } } }),
  defaultSite: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME,
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  editingSecret: process.env.SITECORE_EDITING_SECRET,
});
```

**Note:** This file DID change from the original (`76baa7c`) where the else branch was just `{}` and `editingSecret`/`defaultSite`/`defaultLanguage` were not explicitly set. However, since it was in THIS state during the working deployment, it's not the cause.

#### 3. `route.ts` (editing render handler)

**Working state and current state: IDENTICAL**
```typescript
export const { GET, POST, OPTIONS } = createEditingRenderRouteHandlers({});
```

#### 4. `package.json`

**Working state:** No `postinstall` script.
**Current state:** Added `"postinstall": "node scripts/patch-editing-utils.js"`

**Risk Assessment:** LOW-MEDIUM
- The `postinstall` script patches the SDK's `resolveServerUrl` function
- It adds a fallback: `if (!host) return 'http://localhost:3000'`
- This should only HELP, not hurt — but it's new code that wasn't in the working state

---

### Category 2: New Files Added (MEDIUM RISK)

| File | Purpose |
|------|---------|
| `scripts/patch-editing-utils.js` | SDK postinstall patch |
| `src/instrumentation.ts` | Sets env var at server startup |
| `src/components/solutions-hero/SolutionsHero.tsx` | Solutions page component |
| `src/components/solution-card/SolutionCard.tsx` | Solutions page component |
| `src/components/value-proposition/ValueProposition.tsx` | Solutions page component |
| `src/components/case-study/CaseStudy.tsx` | Solutions page component |

**Risk Assessment for `instrumentation.ts`:** MEDIUM
- Sets `process.env.SITECORE_INTERNAL_EDITING_HOST_URL = 'http://localhost:3000'`
- This file did NOT exist in the working state
- Next.js `instrumentation.ts` runs at server startup
- Could potentially interfere with other SDK behavior if the env var has side effects

**Risk Assessment for new components:** LOW
- These are rendering components only
- They wouldn't affect the editing flow or URL resolution
- BUT they ARE registered in `component-map.ts`, which is used by the editing config endpoint

---

### Category 3: Modified Existing Files (LOW-MEDIUM RISK)

#### 1. `page.tsx`

**Only change:** Added `'/Solutions'` to `knownPaths` array:
```diff
- const knownPaths = ['/', '/Products'];
+ const knownPaths = ['/', '/Products', '/Solutions'];
```

**Risk Assessment:** LOW — This only affects fallback rendering, not editing.

#### 2. `.sitecore/component-map.ts`

**Change:** Added 4 new component imports and registrations (SolutionsHero, SolutionCard, ValueProposition, CaseStudy).

**Risk Assessment:** LOW-MEDIUM
- This file is used by `/api/editing/config` endpoint
- The editing config tells the CM what components the rendering host supports
- Adding components should not break existing functionality
- **BUT:** If any of these component imports throw at module load time, it could prevent the entire route from loading

#### 3. `src/components/default-content/DefaultContent.tsx`

**Changes:**
- Added `// @ts-nocheck` and `/* eslint-disable @typescript-eslint/no-explicit-any */` at top
- Added imports for Solutions components
- Added `DefaultSolutionsContent` function
- Added routing logic for `/solutions` path

**Risk Assessment:** LOW — This is a rendering fallback, not part of the editing flow.

#### 4. `src/lib/default-content.ts`

**Change:** Added Solutions page default content data.

**Risk Assessment:** LOW — Data file only.

---

## Critical Differences Summary

### Changes That COULD Affect Pages Editor

| # | Change | File | Risk | In Working State? |
|---|--------|------|------|-------------------|
| 1 | `typescript.ignoreBuildErrors: true` | next.config.ts | MEDIUM | NO |
| 2 | `eslint.ignoreDuringBuilds: true` | next.config.ts | MEDIUM | NO |
| 3 | `postinstall` SDK patch script | package.json + scripts/ | LOW-MEDIUM | NO |
| 4 | `instrumentation.ts` (env var setter) | src/instrumentation.ts | MEDIUM | NO |
| 5 | 4 new components in component-map.ts | .sitecore/component-map.ts | LOW-MEDIUM | NO |
| 6 | `// @ts-nocheck` in DefaultContent.tsx | DefaultContent.tsx | LOW | NO |

### Changes That Should NOT Affect Pages Editor

| # | Change | File | Reason |
|---|--------|------|--------|
| 1 | `/Solutions` added to knownPaths | page.tsx | Fallback rendering only |
| 2 | New Solutions components (4 files) | src/components/ | Rendering only |
| 3 | Solutions default content data | default-content.ts | Data only |
| 4 | DefaultSolutionsContent renderer | DefaultContent.tsx | Rendering only |

---

## Rendering Host Error Analysis

### Error 1: `TypeError: Failed to parse URL from /`
```
at <unknown> (.next-container/server/app/api/editing/render/route.js:1:4346)
```

- Occurs in the editing render route handler
- The SDK's `resolveServerUrl(req)` returns an invalid base URL
- `new URL('/', invalidBase)` throws `ERR_INVALID_URL`
- The `resolveServerUrl` function checks (in order):
  1. `process.env.SITECORE_INTERNAL_EDITING_HOST_URL` — NOT SET in XM Cloud
  2. `process.env.SITECORE` — NOT SET ("XmCloud build JSON file was not found")
  3. Request headers (`x-forwarded-host` or `host`) — Apparently NULL

### Error 2: `TypeError: Cannot read properties of undefined (reading 'context')`
```
at l.getPreview (.next-container/server/chunks/905.js:106:3727)
```

- Occurs in the page route when draft mode is active
- `getPreview()` tries to access `data.layoutData.sitecore.context`
- The `layoutData.sitecore` is `undefined`, meaning the editing data fetch failed
- This is likely a SECONDARY error caused by Error 1 (editing render fails → data unavailable)

---

## Key Questions to Investigate

1. **Was there a successful XM Cloud deployment at commit `a49de89`?**
   - If yes, what did the rendering host log look like? Were there errors?
   - If no, when was the LAST successful deployment that worked with Pages Editor?

2. **Did the "XmCloud build JSON file was not found" message appear in working deployments too?**
   - If yes, the `process.env.SITECORE` was NEVER set, and `resolveServerUrl` was using the request header fallback (option 3)
   - If no, `process.env.SITECORE` WAS set in working deployments, meaning the build JSON file existed at some point

3. **Are the `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` options causing webpack to bundle code differently?**
   - Possible: skipping type checking/linting could change how webpack processes modules
   - Test: Try removing these options and fixing the underlying type/lint errors instead

4. **Does the `instrumentation.ts` file interfere with the XM Cloud runtime?**
   - This file didn't exist in the working state
   - It sets `process.env.SITECORE_INTERNAL_EDITING_HOST_URL` at server startup
   - This env var is read by `resolveServerUrl()` — if it's set, the function returns early without checking request headers
   - **Potential issue:** If the env var IS correctly set but the VALUE is wrong for the XM Cloud container networking, it would cause the same error

5. **Does the `postinstall` script run correctly in the XM Cloud build?**
   - The XM Cloud build uses `npm install --force`
   - Postinstall scripts should still run, but need to verify in build logs

---

## Recommended Next Steps

### Option A: Revert to Working State (Quickest Path)
Revert ALL changes between `a49de89` and `HEAD` except for the Solutions components, and redeploy:
1. Remove `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` from `next.config.ts`
2. Remove `instrumentation.ts`
3. Remove `postinstall` script and `scripts/patch-editing-utils.js`
4. Fix the actual TypeScript/ESLint errors instead of suppressing them
5. Keep Solutions components and component-map changes

### Option B: Incremental Rollback
Start from the working state and add changes ONE AT A TIME, deploying after each:
1. Deploy with only Solutions components + component-map changes
2. If working, add `DefaultContent.tsx` changes
3. If working, add `typescript.ignoreBuildErrors` (if truly needed)
4. Isolate which specific change breaks Pages Editor

### Option C: Environment Variable Fix
Add `SITECORE_INTERNAL_EDITING_HOST_URL=http://localhost:3000` as an environment variable in the XM Cloud deployment settings (not in code). This sets it at the OS level where it cannot be overridden by webpack.

---

## Appendix: Full Diff (Working → Current)

### Files Modified
- `next.config.ts`: +6 lines (typescript/eslint ignore options)
- `page.tsx`: +1 line (added '/Solutions' to knownPaths)
- `component-map.ts`: +8 lines (4 imports + 4 registrations)
- `DefaultContent.tsx`: +84 lines (Solutions rendering + ts-nocheck)
- `default-content.ts`: +137 lines (Solutions content data)
- `package.json`: +2 lines (postinstall script)

### Files Added
- `scripts/patch-editing-utils.js` (39 lines)
- `src/instrumentation.ts` (5 lines)
- `src/components/case-study/CaseStudy.tsx` (229 lines)
- `src/components/solution-card/SolutionCard.tsx` (166 lines)
- `src/components/solutions-hero/SolutionsHero.tsx` (137 lines)
- `src/components/value-proposition/ValueProposition.tsx` (144 lines)

### Files Unchanged (Same in Both States)
- `sitecore.config.ts`
- `route.ts`
- `Layout.tsx`
- `Scripts.tsx`
- `byoc/index.tsx`
- `CdpPageView.tsx`
- All existing components (Hero, FeatureCard, CTABanner, etc.)
