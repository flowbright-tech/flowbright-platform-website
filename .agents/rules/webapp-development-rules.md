---
trigger: always_on
---

# Antigravity Development Rules: Flow Bright SRP Frontend

This document outlines the strict architectural constraints, security policies, and best practices for developing the **Flow Bright SRP (SME Resource Planning)** frontend platform using **Nuxt (v4.x+)** compiled as a **Static Site Generation (SSG)** asset.

---

## 1. Architectural Blueprint (Large-Scale & Static-First)

### 1.1 Static-Only Enforcement (`nuxt generate`)
* **Rule:** No server-side rendering (SSR) logic allowed at runtime. The app must compile to pure static assets (`dist/`).
* **Data Fetching:** Never use `useFetch` or `useAsyncData` on page initialization without `immediate: false` unless fetching publicly available global configuration files. 
* **Client Hydration:** Dynamic company data, inventory, and transaction states must be lazy-fetched on the client inside the `onMounted` lifecycle hook or triggered explicitly by user actions using a standalone client API client layer.

### 1.2 Folder Structure (Feature-Driven / Domain-First)
To prevent directory clutter as the ERP scales across multi-tenant modules (Invoicing, Inventory, CRM), we enforce a **Feature-Sliced/Domain** structure under an extended Nuxt Layer or root directory.

```text
src/
├── app/                  # App shell, layouts, global styles, routing gate
├── components/           # Global, highly generic atomic UI elements (AppButton, AppInput)
├── composables/          # Global generic utilities (useFormatter, useLocalStorage)
├── features/             # Domain-specific modules (The core ERP code)
│   ├── inventory/
│   │   ├── components/   # Feature-specific items (StockStatusBadge, InventoryTable)
│   │   ├── composables/  # Feature state and mutations (useInventoryEngine)
│   │   ├── types.ts      # Domain strict TypeScript interfaces
│   │   └── inventory.spec.ts
│   └── invoicing/
└── pages/                # Clean routing mapping only. Delays logic to features.
2. Code Quality & Reusability (Clean Architecture)
2.1 Component Isolation
Presentational vs. Smart: Components under components/ must be pure and dumb. They accept parameters via defineProps and bubble interactions up via defineEmits. No side-effects, no business logic, no API calls.

Composable-Driven State: Wrap all business workflows inside custom domain composables (e.g., useTaxCalculator()). Components should merely consume these reactive values.

2.2 Reusability Paradigm
Write abstract components first by designing configurations via TypeScript types instead of hardcoding business variations.

Auto-Import Management: Rely on Nuxt auto-imports only for local context. Explicitly export/import cross-domain abstractions to ensure code transparency during large refactors.

3. Strict Security Policies
3.1 Client-Side Attack Minimization
XSS Mitigation: Never use v-html to render incoming data from backends (e.g., product descriptions, supplier notes) unless run through an explicit clarification/sanitization utility like DOMPurify.

Token Storage: Authentication tokens must never be stored in accessible localStorage. They must live in secure, HttpOnly, SameSite=Strict cookies issued by the backend gateway.

3.2 Tenant Isolation and State Cleansing
Rule: When a tenant switches accounts or logs out, the frontend memory space must be completely scrubbed to prevent cross-tenant telemetry contamination.

Implementation: Store definitions must implement a native reset mechanism:

TypeScript
// composables/useAuthStore.ts
export const useAuthStore = () => {
  const token = useState<string | null>('auth_token', () => null)
  const tenantId = useState<string | null>('tenant_id', () => null)

  const clearSession = () => {
    token.value = null
    tenantId.value = null
    if (import.meta.client) {
      // Clear runtime memory caches or indexing databases here
    }
  }

  return { token, tenantId, clearSession }
}
4. Testing Mandate (Unit & Integration)
Every business-critical feature (tax computations, matrix math for pricing, permission matrix mapping) must achieve 100% unit test coverage. We use @nuxt/test-utils combined with vitest.

4.1 Composable Unit Testing Spec
Tests must be kept side-by-side with the implementation layer or grouped neatly inside a testing/ mirror. Avoid testing UI rendering where business logic testing yields higher ROI.

TypeScript
// features/inventory/composables/useInventoryEngine.spec.ts
import { describe, it, expect } from 'vitest'
import { calculateStockValuation } from './useInventoryEngine'

describe('Inventory Calculation Engine', () => {
  it('should accurately calculate FIFO valuation across multiple batch costs', () => {
    const batches = [
      { quantity: 10, unitCost: 100 }, // Total 1000
      { quantity: 5, unitCost: 120 }   // Total 600
    ]
    const result = calculateStockValuation(batches)
    expect(result).toBe(1600)
  })

  it('should safely return 0 total value if stock array is completely empty', () => {
    expect(calculateStockValuation([])).toBe(0)
  })
})
5. Performance Constraints (Sub-Second SME Experience)
Lazy Loading: Always prefix non-critical layout blocks or secondary popups using Nuxt's lazy capabilities: <LazyInventoryAdjustmentModal v-if="isOpen" />.

Dependency Auditing: Packages that import heavy footprints (e.g., Lodash, Moment.js) are explicitly banned. Use date-fns or native modern browser APIs (Intl.NumberFormat).

Bundle Monitoring: Runs checking page bundle budgets on every commit via CI pipelines. Individual route chunk sizes must not exceed 150kb.