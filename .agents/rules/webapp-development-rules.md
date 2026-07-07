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

## 6. Nuxt 4 Native Architecture & Tooling Exploitation

### 6.1 Multi-Layer Isolation (Domain-Driven Layers)
To prevent cross-domain dependency bleeding as the SRP platform scales across complex ERP modules (Invoicing, Inventory, CRM), developers must leverage Nuxt 4's multi-layer system to encapsulate domains physically, rather than just conceptually.
* **Rule:** Multi-tenant feature modules must be built as autonomous Nuxt Layers under a unified repository layout or a dedicated `modules/` or `features/` setup. Each layer must encapsulate its own domain-specific components, composables, and serverless mock hooks if applicable.
* **Prefixing Components:** Shared components inside local feature layers must utilize specific prefix mappings within their local configuration to make usage origins explicit and transparent.

```typescript
// features/invoicing/nuxt.config.ts
export default defineNuxtConfig({
  components: [
    { path: './components', prefix: 'Inv' } // Automagically prefixes invoicing elements (e.g., <InvTaxTable/>)
  ]
})
6.2 Strict Client-Only Data Utilities
Because this app relies entirely on static compilation via nuxt generate (or an explicit Single Page Application layout), server-side telemetry or authentication leaks during build execution must be avoided.

The server: false Enforcer: Standard execution of useAsyncData or useFetch on global entrypoints is banned unless configured with both server: false and immediate: false.

Safe Lazy Hydration: Fetch runtime telemetry only within explicit client interactions or clean lifecycle triggers.

TypeScript
// Hard enforcement for runtime client-side calls
const { data: stockRecords, execute, status } = await useAsyncData(
  'inventory-feed',
  () => $api('/api/v1/inventory/items'),
  {
    server: false,    // Crucial: Prevents Nuxt from trying to compile or mock this during build time
    immediate: false  // Delays invocation until explicitly required by client-side mounted events
  }
)

onMounted(() => {
  execute() // Securely initializes state strictly within the client browser context
})
7. Nuxt UI Integration Framework (Design-Token First) and use skill for antigravity
Nuxt UI must be implemented using a Headless-First / Design-Token mindset to maintain the presentational vs. smart component boundaries established in Section 2.1.

7.1 Unified Design Configuration (Zero Inline Bloat)
Rule: Do not scatter chaotic, inline tailwind override utilities via the ui property directly across nested features. All standard component mutations must be handled globally inside app.config.ts.

Atomic Primitives: Local feature views must inherit from structured primitives rather than inventing custom atomic styles per module.

TypeScript
// app.config.ts - Centralized Design Token Matrix for Flow Bright SRP
export default defineAppConfig({
  ui: {
    primary: 'emerald', // Flow Bright corporate aesthetic
    gray: 'cool',
    button: {
      default: {
        size: 'sm',
        loadingIcon: 'i-lucide-loader-circle'
      },
      padding: {
        sm: 'px-3 py-1.5'
      }
    }
  }
})
7.2 Strict Form & Schema Validation (Decoupled State)
Nuxt UI provides excellent integration with structural validation schemas (such as Zod). For high-integrity SME software, validation schemas must be completely separated from view templates.

Form States: Always bind <UForm> wrappers against explicit reactive definitions validated via strict TypeScript/Zod structures.

Calculations: Complex UI representations like data tables (<UDataTable>) must pass actions directly to domain composables instead of calculating transformations inside the markup layout.

Code snippet
<!-- features/inventory/components/StockAdjustmentForm.vue -->
<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const emit = defineEmits(['submitAdjustment'])

// 1. Structural Validation Rule - Enforced outside the HTML layout
const formValidationSchema = z.object({
  sku: z.string().min(4, 'SKU must be at least 4 characters long'),
  quantity: z.number().int().positive('Adjustment quantity must be a positive integer')
})

type FormData = z.output<typeof formValidationSchema>
const state = reactive({ sku: '', quantity: 0 })

const handleFormSubmission = (event: FormSubmitEvent<FormData>) => {
  // Bubbles completely clean, pre-validated data to the Smart Component or Domain Composable
  emit('submitAdjustment', event.data)
}
</script>

<template>
  <UForm :schema="formValidationSchema" :state="state" @submit="handleFormSubmission" class="space-y-4">
    <UFormGroup label="Asset SKU Identifier" name="sku">
      <UInput placeholder="e.g., INV-PROD-001" v-model="state.sku"/>
    </UFormGroup>

    <UFormGroup label="Quantity Delta" name="quantity">
      <UInput type="number" v-model.number="state.quantity"/>
    </UFormGroup>

    <UButton block type="submit" variant="solid">
      Commit Adjustment
    </UButton>
  </UForm>
</template>
8. Build & Verification Guardrails
To lock down compilation security, configure explicit optimization checks within your primary workspace configuration file.

TypeScript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // Forces Single Page Application/SSG mode explicitly at core configuration

  nitro: {
    prerender: {
      crawlLinks: false, // Safeguard: prevents static crawler from indexing secure paths during generation
      routes: ['/']      // Only pre-builds the application shell framework
    }
  },

  experimental: {
    typedPages: true // Full compile-time routing safety matrix across dynamic ERP modules
  }
})

Bundle Monitoring: Runs checking page bundle budgets on every commit via CI pipelines. Individual route chunk sizes must not exceed 150kb.