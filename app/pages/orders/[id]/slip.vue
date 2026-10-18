<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 flex flex-col items-center">
    <!-- Reusable Top Action Bar (hidden on print) -->
    <PrintActionBar
      :title="$t('orders.slip_title') || 'Receipt Slip Preview (58mm)'"
      :pdf-filename="`Slip_${invoice?.code || invoice?.order_number || orderId}.pdf`"
      :print-button-label="$t('orders.print_slip') || 'Print Slip (58mm)'"
      @print="handlePrintClicked"
    />

    <!-- Paper Saving & Auto-Cut Notice for AN58 (Screen only, hidden on print) -->
    <div class="no-print w-full max-w-sm mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between gap-2 shadow-xs">
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-check-badge" class="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span class="font-medium">
          {{ locale === 'th' ? `ตัดกระดาษอัตโนมัติ: ความยาว ${calculatedHeightMm} มม.` : `Auto-cut length: ${calculatedHeightMm} mm` }}
        </span>
      </div>
      <span class="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
        {{ locale === 'th' ? 'ตั้งค่า Margins: None' : 'Margins: None' }}
      </span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="w-[48mm] bg-white p-3 rounded-xl shadow-md space-y-3">
      <div class="flex flex-col items-start space-y-1.5">
        <USkeleton class="h-3 w-28" />
        <USkeleton class="h-2.5 w-36" />
        <USkeleton class="h-2.5 w-24" />
      </div>
      <div class="border-y border-dashed border-slate-200 py-2 space-y-1.5">
        <USkeleton class="h-2.5 w-24" />
        <USkeleton class="h-2.5 w-32" />
      </div>
      <div class="space-y-1.5">
        <USkeleton class="h-2.5 w-full" />
        <USkeleton class="h-2.5 w-full" />
        <USkeleton class="h-3 w-16 ml-auto" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="w-[48mm] bg-white p-4 rounded-xl shadow-md text-center space-y-2">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-7 h-7 text-rose-500 mx-auto" />
      <h2 class="text-xs font-bold text-slate-800">{{ errorMsg }}</h2>
      <UButton size="xs" color="neutral" variant="solid" @click="fetchInvoiceData">
        Retry
      </UButton>
    </div>

    <!-- 58mm Thermal Slip (Print target - 48mm Printable Head, Dynamic Auto-Height) -->
    <div v-else class="slip-page-container">
      <div class="slip-page print-content">
        <!-- Header: Company Detail (Requirement 1: Show ONLY Company Name, Address, Tel, Email, Website - Kept Left) -->
        <div class="flex flex-col items-start text-left space-y-0.5 pb-1">
          <!-- Company Name (TH & EN) -->
          <h1 class="text-[9.5px] font-extrabold leading-tight text-slate-950 tracking-tight text-left">
            {{ company?.name_th || authCompany?.name_th || 'คลินิก เอ็ม.ที อินเตอร์แล็บ' }}
          </h1>
          <h2
            v-if="(company?.name_en || authCompany?.name_en) && (company?.name_en || authCompany?.name_en) !== (company?.name_th || authCompany?.name_th)"
            class="text-[8px] font-bold leading-tight text-slate-800 text-left"
          >
            {{ company?.name_en || authCompany?.name_en }}
          </h2>

          <!-- Company Address -->
          <p v-if="getCompanyAddress()" class="text-[7.5px] leading-tight text-slate-700 font-medium text-left break-words">
            {{ getCompanyAddress() }}
          </p>

          <!-- Company Phone -->
          <p v-if="getCompanyPhone()" class="text-[7.5px] leading-tight text-slate-700 font-medium text-left">
            {{ locale === 'th' ? 'โทร.' : 'Tel.' }}: {{ formatPhone(getCompanyPhone()) }}
          </p>

          <!-- Company Email -->
          <p v-if="getCompanyEmail()" class="text-[7px] leading-tight text-slate-600 text-left break-all">
            Email: {{ getCompanyEmail().trim() }}
          </p>

          <!-- Company Website -->
          <p v-if="getCompanyWebsite()" class="text-[7px] leading-tight text-slate-600 text-left break-all">
            Web: {{ getCompanyWebsite().trim() }}
          </p>
        </div>

        <!-- Dashed Separator -->
        <div class="border-b border-dashed border-slate-400 my-1"></div>

        <!-- Slip Title & Date/Time & Customer Info -->
        <div class="space-y-0.5">
          <div class="text-center font-extrabold text-[9px] uppercase tracking-wider text-slate-950">
            {{ $t('orders.receipt_slip') || 'RECEIPT / SLIP' }}
          </div>

          <div class="text-[7.5px] text-slate-800 space-y-0.5 pt-0.5">
            <!-- Order Reference Number -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-slate-600">{{ locale === 'th' ? 'เลขที่' : 'No.' }}:</span>
              <span class="font-mono font-bold text-slate-950">{{ invoice?.code || invoice?.order_number || orderId }}</span>
            </div>

            <!-- Date Time (Using Date Time Now at User Client Time) -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-slate-600">{{ locale === 'th' ? 'วันที่' : 'Date' }}:</span>
              <span class="font-mono font-semibold text-slate-950">{{ clientDateTime }}</span>
            </div>

            <!-- Customer Details -->
            <div v-if="customer || invoice?.customer_name" class="flex justify-between items-start">
              <span class="font-medium text-slate-600 shrink-0 mr-1">{{ locale === 'th' ? 'ลูกค้า' : 'Customer' }}:</span>
              <span class="font-bold text-slate-950 text-right break-words">{{ getCustomerFullName() }}</span>
            </div>

            <!-- Payment Channel -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-slate-600">{{ locale === 'th' ? 'ชำระโดย' : 'Channel' }}:</span>
              <span class="font-semibold text-slate-950 capitalize">{{ formatPaymentChannel(invoice?.payment_channel) }}</span>
            </div>
          </div>
        </div>

        <!-- Dashed Separator -->
        <div class="border-b border-dashed border-slate-400 my-1"></div>

        <!-- Order Items (Requirement 2: Completeness of item and amount within 48mm printable head) -->
        <div class="py-0.5">
          <!-- Column headers -->
          <div class="flex justify-between text-[7.5px] font-bold text-slate-800 uppercase pb-0.5 border-b border-slate-300">
            <span>{{ locale === 'th' ? 'รายการสินค้า' : 'Item Description' }}</span>
            <span class="text-right shrink-0">{{ locale === 'th' ? 'จำนวนเงิน' : 'Amount' }}</span>
          </div>

          <!-- Item list -->
          <div class="divide-y divide-dotted divide-slate-300">
            <div
              v-for="(item, idx) in invoice?.items"
              :key="idx"
              class="py-1 text-[8px]"
            >
              <!-- Item Name (Wraps completely, full line, never clipped) -->
              <div class="font-bold text-slate-950 leading-snug break-words">
                {{ idx + 1 }}. {{ getItemName(item) }}
              </div>

              <!-- Package code / SKU if present -->
              <div v-if="getItemCode(item)" class="text-[7px] text-slate-600 font-mono">
                [{{ getItemCode(item) }}]
              </div>

              <!-- Item Quantity x Unit Price (Left) and Total Subtotal (Right, shrink-0 to prevent clipping) -->
              <div class="flex justify-between items-baseline text-[7.5px] text-slate-900 mt-0.5">
                <span class="font-mono text-slate-700">
                  {{ item.quantity || 1 }} x ฿{{ formatPrice(getItemUnitPrice(item)) }}
                </span>
                <span class="font-mono font-bold text-slate-950 text-right shrink-0 ml-1">
                  ฿{{ formatPrice(getItemSubtotal(item)) }}
                </span>
              </div>

              <!-- Item Notes if present -->
              <div v-if="item.notes" class="text-[7px] text-slate-600 italic mt-0.5 break-words">
                * {{ item.notes }}
              </div>
            </div>
          </div>
        </div>

        <!-- Dashed Separator -->
        <div class="border-b border-dashed border-slate-400 my-1"></div>

        <!-- Totals & Total Net -->
        <div class="space-y-0.5 text-[8px]">
          <!-- Subtotal -->
          <div class="flex justify-between text-slate-700">
            <span>{{ locale === 'th' ? 'รวมเงิน' : 'Subtotal' }}</span>
            <span class="font-mono font-bold text-slate-950">฿{{ formatPrice(calculateSubtotal()) }}</span>
          </div>

          <!-- Discount -->
          <div v-if="invoice?.discount && Number(invoice.discount) > 0" class="flex justify-between text-slate-800 font-medium">
            <span>{{ locale === 'th' ? 'ส่วนลด' : 'Discount' }}</span>
            <span class="font-mono text-slate-950">-฿{{ formatPrice(invoice.discount) }}</span>
          </div>

          <!-- Credit Card Charge -->
          <div
            v-if="invoice?.payment_channel === 'credit_card' && (invoice?.credit_card_charge_percent || invoice?.credit_card_percent_charge)"
            class="flex justify-between text-slate-700"
          >
            <span>{{ locale === 'th' ? 'ค่าธรรมเนียมบัตร' : 'Card Fee' }} ({{ invoice.credit_card_charge_percent || invoice.credit_card_percent_charge }}%)</span>
            <span class="font-mono text-slate-950">+{{ invoice.credit_card_charge_percent || invoice.credit_card_percent_charge }}%</span>
          </div>

          <!-- Solid Divider before Total Net -->
          <div class="border-b-2 border-slate-950 my-1"></div>

          <!-- TOTAL NET -->
          <div class="flex justify-between items-baseline text-[9.5px] font-black text-slate-950 py-0.5">
            <span>{{ $t('orders.total_net') || 'TOTAL NET' }}</span>
            <span class="font-mono text-[12px] font-black text-slate-950">
              ฿{{ formatPrice(invoice?.total_amount) }}
            </span>
          </div>

          <!-- Solid Divider after Total Net -->
          <div class="border-b-2 border-slate-950 my-1"></div>

          <!-- Thank You Message -->
          <div class="text-center text-[7.5px] text-slate-600 font-medium pt-1 pb-0.5">
            {{ locale === 'th' ? 'ขอบคุณที่ใช้บริการ' : 'Thank you for your business' }}
          </div>

          <!-- Hardware auto-cut safe margin feed buffer (4mm) -->
          <div class="h-[4mm] print:block"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { definePageMeta } from '#imports'
import PrintActionBar from '../../../components/PrintActionBar.vue'
import { useApiFetch } from '../../../composables/useApiFetch'
import { useAuthEngine } from '../../../features/auth/composables/useAuthEngine'

definePageMeta({
  layout: false
})

const route = useRoute()
const { locale, t, setLocale } = useI18n()
const { apiFetch } = useApiFetch()
const { company: authCompany } = useAuthEngine()

const orderId = String(route.params.id)
const isLoading = ref(true)
const errorMsg = ref<string | null>(null)
const invoice = ref<any>(null)
const company = ref<any>(null)
const customer = ref<any>(null)
const clientDateTime = ref('')
const calculatedHeightMm = ref(90)

let resizeObserver: ResizeObserver | null = null

const updateDynamicPageSize = () => {
  if (!import.meta.client) return
  const slipEl = document.querySelector('.slip-page') as HTMLElement
  if (!slipEl) return

  const widthPx = slipEl.offsetWidth || 1
  const heightPx = Math.max(slipEl.scrollHeight, slipEl.offsetHeight)
  // Calculate content height in mm based on 48mm printable head width
  const contentHeightMm = Math.ceil((heightPx / widthPx) * 48)
  // Add 6mm feed buffer to ensure hardware cutter blade clears past the footer
  const totalHeightMm = Math.max(35, contentHeightMm + 6)

  calculatedHeightMm.value = totalHeightMm

  let styleEl = document.getElementById('slip-dynamic-page-style') as HTMLStyleElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'slip-dynamic-page-style'
    document.head.appendChild(styleEl)
  }

  // Inject valid CSS <length>{2} rule: width 58mm, height dynamic length (overrides fixed 210mm paper)
  styleEl.textContent = `
    @media print {
      @page {
        size: 58mm ${totalHeightMm}mm !important;
        margin: 0 !important;
      }
    }
  `
}

const handlePrintClicked = () => {
  updateDynamicPageSize()
}

const fetchInvoiceData = async () => {
  isLoading.value = true
  errorMsg.value = null
  try {
    // 1. Fetch from /api/v1/orders/{id}/invoice
    const res = await apiFetch(`/api/v1/orders/${orderId}/invoice`).catch(() => null)
    if (res && res.ok) {
      const json = await res.json()
      if (json.success && json.data) {
        invoice.value = json.data.order
        company.value = json.data.company
        customer.value = json.data.order?.customer
        isLoading.value = false
        triggerRecalculate()
        return
      }
    }

    // 2. Fallback to /api/v1/orders/{id}
    const orderRes = await apiFetch(`/api/v1/orders/${orderId}`)
    if (orderRes.ok) {
      const orderJson = await orderRes.json()
      if (orderJson.success && orderJson.data) {
        invoice.value = orderJson.data
        customer.value = orderJson.data?.customer
        company.value = authCompany.value
        triggerRecalculate()
      } else {
        throw new Error('Order details not found')
      }
    } else {
      throw new Error(`Failed to load order: ${orderRes.status}`)
    }
  } catch (err: any) {
    console.error('Error fetching slip data:', err)
    errorMsg.value = err.message || 'An error occurred while loading slip details'
  } finally {
    isLoading.value = false
  }
}

const triggerRecalculate = () => {
  nextTick(() => {
    updateDynamicPageSize()
    setTimeout(updateDynamicPageSize, 100)
    setTimeout(updateDynamicPageSize, 300)
  })
}

const formatPrice = (val?: number) => {
  if (val === undefined || val === null || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatPhone = (phone?: string) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

const formatPaymentChannel = (channel?: string) => {
  if (!channel) return '-'
  switch (channel.toLowerCase()) {
    case 'cash':
      return t('orders.payment_cash') || 'Cash'
    case 'credit_card':
      return t('orders.payment_credit_card') || 'Credit Card'
    case 'internet_banking':
      return t('orders.payment_internet_banking') || 'Internet Banking'
    default:
      return channel
  }
}

const getCompanyAddress = (): string => {
  if (locale.value === 'th') {
    return company.value?.address_th || company.value?.address_en || authCompany.value?.address_th || authCompany.value?.address_en || ''
  }
  return company.value?.address_en || company.value?.address_th || authCompany.value?.address_en || authCompany.value?.address_th || ''
}

const getCompanyPhone = (): string => {
  return company.value?.phone || authCompany.value?.phone || ''
}

const getCompanyEmail = (): string => {
  return company.value?.email || authCompany.value?.email || ''
}

const getCompanyWebsite = (): string => {
  return company.value?.website || authCompany.value?.website || ''
}

const getItemName = (item: any): string => {
  if (!item) return ''
  if (locale.value === 'th') {
    return (
      item.package_name_th ||
      item.package?.name_th ||
      item.name_th ||
      item.product_name_th ||
      item.package_name_en ||
      item.package?.name_en ||
      item.name_en ||
      item.product_name_en ||
      item.package_name ||
      item.name ||
      item.title ||
      item.product_name ||
      item.package_id ||
      'สินค้า'
    )
  }
  return (
    item.package_name_en ||
    item.package?.name_en ||
    item.name_en ||
    item.product_name_en ||
    item.package_name_th ||
    item.package?.name_th ||
    item.name_th ||
    item.product_name_th ||
    item.package_name ||
    item.name ||
    item.title ||
    item.product_name ||
    item.package_id ||
    'Item'
  )
}

const getItemCode = (item: any): string => {
  if (!item) return ''
  return item.package?.code || item.code || item.package_code || item.sku || ''
}

const getItemUnitPrice = (item: any): number => {
  if (!item) return 0
  if (item.unit_price !== undefined && item.unit_price !== null && !isNaN(Number(item.unit_price)) && Number(item.unit_price) > 0) {
    return Number(item.unit_price)
  }
  if (item.subtotal !== undefined && item.subtotal !== null && item.quantity && Number(item.quantity) > 0) {
    return Number(item.subtotal) / Number(item.quantity)
  }
  if (item.package?.price !== undefined && item.package?.price !== null) {
    return Number(item.package.price)
  }
  return Number(item.unit_price) || 0
}

const getItemSubtotal = (item: any): number => {
  if (!item) return 0
  if (item.subtotal !== undefined && item.subtotal !== null && !isNaN(Number(item.subtotal))) {
    return Number(item.subtotal)
  }
  const unitPrice = getItemUnitPrice(item)
  return (Number(item.quantity) || 1) * unitPrice
}

const getCustomerFullName = () => {
  if (customer.value) {
    const first = customer.value.first_name || ''
    const last = customer.value.last_name || ''
    const full = `${first} ${last}`.trim()
    if (full) return full
  }
  return invoice.value?.customer_name || 'Walk-in Customer'
}

const calculateSubtotal = () => {
  if (!invoice.value?.items || !Array.isArray(invoice.value.items)) {
    return invoice.value?.total_amount || 0
  }
  return invoice.value.items.reduce((acc: number, item: any) => {
    return acc + getItemSubtotal(item)
  }, 0)
}

const updateClientDateTime = () => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const mins = String(now.getMinutes()).padStart(2, '0')
  clientDateTime.value = `${day}/${month}/${year} ${hours}:${mins}`
}

onMounted(() => {
  // Default slip to Thai language unless explicitly in English route
  if (!route.path.startsWith('/en/')) {
    if (setLocale) {
      setLocale('th')
    } else {
      locale.value = 'th'
    }
  }

  // Date time using now at user client time
  updateClientDateTime()

  fetchInvoiceData().then(() => {
    nextTick(() => {
      updateDynamicPageSize()
      const slipEl = document.querySelector('.slip-page')
      if (slipEl && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          updateDynamicPageSize()
        })
        resizeObserver.observe(slipEl)
      }
    })
  })

  if (import.meta.client) {
    window.addEventListener('beforeprint', updateDynamicPageSize)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('beforeprint', updateDynamicPageSize)
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    const styleEl = document.getElementById('slip-dynamic-page-style')
    if (styleEl) {
      styleEl.remove()
    }
  }
})
</script>

<style scoped>
/* Screen View: 58mm compact thermal paper container */
.slip-page-container {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 58mm;
  margin: 0 auto;
}

.slip-page {
  box-sizing: border-box;
  width: 48mm;
  max-width: 48mm;
  min-height: auto;
  height: auto;
  padding: 2.5mm 1.5mm;
  margin: 0 auto;
  background: #ffffff;
  color: #000000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  border-radius: 4px;
}

/* Print CSS Media Queries: 48mm printable head width & dynamic roll height */
@media print {
  @page {
    size: 58mm auto;
    margin: 0;
  }

  html, body {
    width: 58mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body, .min-h-screen {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
    height: auto !important;
  }

  .no-print {
    display: none !important;
  }

  .slip-page-container {
    display: block !important;
    width: 48mm !important;
    max-width: 48mm !important;
    min-height: auto !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 0 0 1mm !important;
    box-shadow: none !important;
  }

  .slip-page {
    box-sizing: border-box !important;
    width: 48mm !important;
    max-width: 48mm !important;
    min-height: auto !important;
    height: auto !important;
    padding: 1.5mm 1mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
  }

  /* Thermal print contrast enforcement: pure black for crisp thermal burn */
  .slip-page * {
    color: #000000 !important;
  }
}
</style>
