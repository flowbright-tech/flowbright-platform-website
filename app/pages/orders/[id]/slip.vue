<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 flex flex-col items-center">
    <!-- Reusable Top Action Bar (hidden on print) -->
    <PrintActionBar
      :title="$t('orders.slip_title') || 'Receipt Slip Preview (58mm)'"
      :pdf-filename="`Slip_${invoice?.code || invoice?.order_number || orderId}.pdf`"
      :print-button-label="$t('orders.print_slip') || 'Print Slip (58mm)'"
    />

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="w-[58mm] bg-white p-3 rounded-xl shadow-md space-y-3">
      <div class="flex flex-col items-center space-y-1.5">
        <USkeleton class="h-8 w-8 rounded-full" />
        <USkeleton class="h-3 w-28" />
        <USkeleton class="h-2.5 w-36" />
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
    <div v-else-if="errorMsg" class="w-[58mm] bg-white p-4 rounded-xl shadow-md text-center space-y-2">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-7 h-7 text-rose-500 mx-auto" />
      <h2 class="text-xs font-bold text-slate-800">{{ errorMsg }}</h2>
      <UButton size="xs" color="neutral" variant="solid" @click="fetchInvoiceData">
        Retry
      </UButton>
    </div>

    <!-- 58mm Thermal Slip (Print target - Paper-Saving & Auto Height) -->
    <div v-else class="slip-page-container">
      <div class="slip-page print-content">
        <!-- Header: Company Detail -->
        <div class="flex flex-col items-center text-center space-y-0.5">
          <!-- Logo (if available) -->
          <div v-if="company?.image_url" class="w-8 h-8 mb-0.5 rounded overflow-hidden shrink-0">
            <img :src="company.image_url" class="w-full h-full object-contain" alt="Logo" />
          </div>

          <!-- Company Name (TH & EN) -->
          <h1 class="text-[10px] font-extrabold leading-tight text-slate-900 tracking-tight">
            {{ company?.name_th || 'คลินิก เอ็ม.ที อินเตอร์แล็บ' }}
          </h1>
          <h2 class="text-[8.5px] font-bold leading-tight text-slate-700">
            {{ company?.name_en || 'METRO MED COMPANY LIMITED' }}
          </h2>

          <!-- Company Address -->
          <p class="text-[7px] leading-tight text-slate-600 font-medium">
            {{ locale === 'th' ? (company?.address_th || company?.address_en || '') : (company?.address_en || company?.address_th || '') }}
          </p>

          <!-- Company Phone -->
          <p v-if="company?.phone" class="text-[7px] leading-tight text-slate-600 font-medium">
            {{ locale === 'th' ? 'โทร.' : 'Tel.' }}: {{ formatPhone(company.phone) }}
          </p>

          <!-- Company Tax ID -->
          <p v-if="company?.tax_id" class="text-[7px] leading-tight text-slate-600 font-medium">
            {{ locale === 'th' ? 'เลขประจำตัวผู้เสียภาษี' : 'Tax ID' }}: {{ company.tax_id }}
          </p>

          <!-- Company Email & Dynamic Website -->
          <p v-if="company?.email" class="text-[6.5px] text-slate-500">
            Email: {{ company.email.trim() }}
          </p>
          <p v-if="company?.website" class="text-[6.5px] text-slate-500">
            Web: {{ company.website.trim() }}
          </p>
        </div>

        <!-- Dashed Separator -->
        <div class="border-b border-dashed border-slate-400 my-1"></div>

        <!-- Slip Title & Date/Time & Customer Info -->
        <div class="space-y-0.5">
          <div class="text-center font-extrabold text-[10px] uppercase tracking-wider text-slate-900">
            {{ $t('orders.receipt_slip') || 'RECEIPT / SLIP' }}
          </div>

          <div class="text-[7.5px] text-slate-700 space-y-0.5 pt-0.5">
            <!-- Date Time (Using Date Time Now at User Client Time) -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-slate-500">{{ locale === 'th' ? 'วันที่' : 'Date' }}:</span>
              <span class="font-mono font-semibold text-slate-900">{{ clientDateTime }}</span>
            </div>

            <!-- Customer Details (HN removed) -->
            <div v-if="customer || invoice?.customer_name" class="flex justify-between items-center">
              <span class="font-medium text-slate-500">{{ locale === 'th' ? 'ลูกค้า' : 'Customer' }}:</span>
              <span class="font-bold text-slate-900 truncate max-w-[34mm] text-right">{{ getCustomerFullName() }}</span>
            </div>

            <!-- Payment Channel -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-slate-500">{{ locale === 'th' ? 'ชำระโดย' : 'Channel' }}:</span>
              <span class="font-semibold text-slate-900 capitalize">{{ formatPaymentChannel(invoice?.payment_channel) }}</span>
            </div>
          </div>
        </div>

        <!-- Dashed Separator -->
        <div class="border-b border-dashed border-slate-400 my-1"></div>

        <!-- Order Items -->
        <div>
          <!-- Column headers -->
          <div class="flex justify-between text-[7px] font-bold text-slate-500 uppercase pb-0.5 border-b border-slate-200">
            <span>{{ locale === 'th' ? 'รายการสินค้า' : 'Item Description' }}</span>
            <span>{{ locale === 'th' ? 'จำนวนเงิน' : 'Amount' }}</span>
          </div>

          <!-- Item list -->
          <div class="divide-y divide-dotted divide-slate-200">
            <div
              v-for="(item, idx) in invoice?.items"
              :key="idx"
              class="py-0.5 text-[7.5px]"
            >
              <div class="font-bold text-slate-900 leading-tight break-words">
                {{ getItemName(item) }}
              </div>
              <div class="flex justify-between items-center text-[7px] text-slate-600">
                <span class="font-mono">{{ item.quantity }} x ฿{{ formatPrice(item.unit_price) }}</span>
                <span class="font-mono font-bold text-slate-900">
                  ฿{{ formatPrice(item.subtotal || (item.quantity * item.unit_price)) }}
                </span>
              </div>
              <div v-if="item.notes" class="text-[6.5px] text-slate-400 italic">
                * {{ item.notes }}
              </div>
            </div>
          </div>
        </div>

        <!-- Dashed Separator -->
        <div class="border-b border-dashed border-slate-400 my-1"></div>

        <!-- Totals & Total Net -->
        <div class="space-y-0.5 text-[7.5px]">
          <!-- Subtotal -->
          <div class="flex justify-between text-slate-600">
            <span>{{ locale === 'th' ? 'รวมเงิน' : 'Subtotal' }}</span>
            <span class="font-mono">฿{{ formatPrice(calculateSubtotal()) }}</span>
          </div>

          <!-- Discount -->
          <div v-if="invoice?.discount && Number(invoice.discount) > 0" class="flex justify-between text-emerald-600 font-medium">
            <span>{{ locale === 'th' ? 'ส่วนลด' : 'Discount' }}</span>
            <span class="font-mono">-฿{{ formatPrice(invoice.discount) }}</span>
          </div>

          <!-- Credit Card Charge -->
          <div
            v-if="invoice?.payment_channel === 'credit_card' && (invoice?.credit_card_charge_percent || invoice?.credit_card_percent_charge)"
            class="flex justify-between text-slate-600"
          >
            <span>{{ locale === 'th' ? 'ค่าธรรมเนียมบัตร' : 'Card Fee' }} ({{ invoice.credit_card_charge_percent || invoice.credit_card_percent_charge }}%)</span>
            <span class="font-mono">+{{ invoice.credit_card_charge_percent || invoice.credit_card_percent_charge }}%</span>
          </div>

          <!-- Solid Divider before Total Net -->
          <div class="border-b border-slate-900 my-0.5"></div>

          <!-- TOTAL NET -->
          <div class="flex justify-between items-center text-[9.5px] font-extrabold text-slate-900 py-0.5">
            <span>{{ $t('orders.total_net') || 'TOTAL NET' }}</span>
            <span class="font-mono text-[11.5px] font-black text-indigo-700">
              ฿{{ formatPrice(invoice?.total_amount) }}
            </span>
          </div>

          <!-- Solid Divider after Total Net -->
          <div class="border-b border-slate-900 my-0.5"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const getItemName = (item: any) => {
  if (locale.value === 'th') {
    return item.package_name_th || item.package?.name_th || item.package_name_en || item.package?.name_en || item.name_th || item.name_en || item.product_name_th || item.product_name_en || 'สินค้า'
  }
  return item.package_name_en || item.package?.name_en || item.package_name_th || item.package?.name_th || item.name_en || item.name_th || item.product_name_en || item.product_name_th || 'Item'
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
    return acc + (Number(item.subtotal) || (Number(item.quantity) * Number(item.unit_price)) || 0)
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
  // Requirement 2: Default slip to Thai language unless explicitly in English route
  if (!route.path.startsWith('/en/')) {
    if (setLocale) {
      setLocale('th')
    } else {
      locale.value = 'th'
    }
  }

  // Requirement 4: Date time using now at user client time
  updateClientDateTime()

  fetchInvoiceData()
})
</script>

<style scoped>
/* Screen View: 58mm compact thermal paper container (paper saving) */
.slip-page-container {
  display: block;
  width: 58mm;
  max-width: 58mm;
  min-height: auto;
  height: auto;
}

.slip-page {
  box-sizing: border-box;
  width: 58mm;
  min-height: auto;
  height: auto;
  padding: 2.5mm 2mm;
  margin: 0 auto;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  border-radius: 4px;
}

/* Print CSS Media Queries: dynamic height for minimal paper usage */
@media print {
  @page {
    size: 58mm auto;
    margin: 0;
  }

  body, .min-h-screen {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .no-print {
    display: none !important;
  }

  .slip-page-container {
    width: 58mm !important;
    max-width: 58mm !important;
    min-height: auto !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 auto !important;
    box-shadow: none !important;
  }

  .slip-page {
    width: 58mm !important;
    max-width: 58mm !important;
    min-height: auto !important;
    height: auto !important;
    padding: 2mm 1.5mm !important;
    margin: 0 auto !important;
    box-shadow: none !important;
    border: none !important;
    background: white !important;
    color: black !important;
  }
}
</style>
