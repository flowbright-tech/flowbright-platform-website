<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 flex flex-col items-center">
    <!-- Top Action bar (hidden on print) -->
    <div class="no-print w-full max-w-[210mm] mb-6 flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-heroicons-arrow-left"
          size="sm"
          @click="goBack"
        >
          {{ $t('common.back') || 'Back' }}
        </UButton>
        <span class="text-sm font-bold text-slate-700 dark:text-slate-200">
          Document Printing Preview
        </span>
      </div>
      <div class="flex items-center gap-3">
        <!-- Language Switcher Button -->
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-heroicons-language"
          @click="toggleLanguage"
        >
          {{ locale === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย' }}
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-printer"
          size="md"
          class="font-semibold shadow-sm"
          @click="printInvoice"
        >
          Print Document (A4)
        </UButton>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="w-full max-w-[210mm] bg-white p-8 rounded-xl shadow-md space-y-6">
      <div class="flex justify-center py-10">
        <USkeleton class="h-48 w-80 rounded-lg" />
      </div>
      <div class="border-y border-slate-100 py-6 space-y-4">
        <div class="grid grid-cols-3 gap-4">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
        </div>
      </div>
      <div class="space-y-3">
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-8 w-full" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="w-full max-w-[210mm] bg-white p-8 rounded-xl shadow-md text-center space-y-4">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-rose-500 mx-auto" />
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">Failed to load document details</h2>
      <p class="text-sm text-slate-500">{{ errorMsg }}</p>
      <UButton color="neutral" variant="solid" @click="fetchInvoiceData">
        Retry
      </UButton>
    </div>

    <!-- Document Sheet (Print target) -->
    <div v-else class="a4-page-container w-full max-w-[210mm]">
      <div class="a4-page print-content flex flex-col justify-between">
        <div>
          <!-- Customer Document Scan Image (Passport/ID Card) -->
          <div class="flex justify-center mb-6">
            <img
              v-if="customer?.image_url"
              :src="customer.image_url"
              class="max-h-[55mm] max-w-[100mm] object-contain border border-slate-200/80 rounded-lg shadow-sm"
              alt="Customer Document"
            />
            <div v-else class="w-[100mm] h-[55mm] bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400">
              <UIcon name="i-heroicons-identification" class="w-12 h-12 text-slate-300" />
              <span class="text-xs font-semibold">No Document / Passport scan uploaded</span>
            </div>
          </div>

          <!-- Document Profile Metadata (2 Clean Rows) -->
          <div class="space-y-3 border-y border-slate-200 py-3.5 text-slate-800 text-[11.5px] font-medium">
            <!-- Row 1 -->
            <div class="flex justify-between items-center w-full">
              <div class="w-[32%] text-left whitespace-nowrap">
                <span class="font-bold text-slate-800">วันที่</span>
                <span class="text-[9.5px] text-slate-500 font-medium ml-0.5">( Billing Date. )</span>
                <span class="text-slate-800 font-bold ml-0.5">:</span>
                <span class="font-mono font-bold text-slate-900 ml-1.5">{{ formatInvoiceDate(invoice?.delivery_date) }}</span>
              </div>
              <div class="w-[20%] text-center whitespace-nowrap">
                <span class="font-bold text-slate-800">HN</span>
                <span class="text-slate-800 font-bold ml-0.5">:</span>
                <span class="font-mono font-bold text-slate-900 ml-1.5">{{ customer?.code || invoice?.customer_code || 'HN' + (invoice?.customer_id?.substring(0, 10) || '') }}</span>
              </div>
              <div class="w-[48%] text-right whitespace-nowrap">
                <span class="font-bold text-slate-800">ช่องทางการชำระเงิน</span>
                <span class="text-[9.5px] text-slate-500 font-medium ml-0.5">( Payment Channel )</span>
                <span class="text-slate-800 font-bold ml-0.5">:</span>
                <span class="font-bold text-slate-900 ml-1.5 capitalize">{{ formatPaymentChannel(invoice?.payment_channel) }}</span>
              </div>
            </div>

            <!-- Row 2 -->
            <div class="flex justify-between items-center w-full">
              <div class="w-[60%] text-left whitespace-nowrap">
                <span class="font-bold text-slate-800">ชื่อ</span>
                <span class="text-[9.5px] text-slate-500 font-medium ml-0.5">( Name )</span>
                <span class="text-slate-800 font-bold ml-0.5">:</span>
                <span class="font-extrabold text-slate-955 ml-1.5 text-[12px]">
                  {{ getCustomerFullName() }}
                </span>
              </div>
              <div class="w-[40%] text-right whitespace-nowrap">
                <span class="font-bold text-slate-800">อายุ</span>
                <span class="text-[9.5px] text-slate-500 font-medium ml-0.5">( Age )</span>
                <span class="text-slate-800 font-bold ml-0.5">:</span>
                <span class="font-bold text-slate-900 ml-1.5">{{ calculatePreciseAge(customer?.birth_date, invoice?.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Charged Items Table -->
          <div class="mt-6">
            <table class="w-full border-collapse border-b border-slate-300">
              <thead>
                <tr class="bg-indigo-50/60 text-[11px] font-bold text-slate-700 border-b border-slate-300">
                  <th class="px-4 py-2.5 text-center w-16">ลำดับ (No.)</th>
                  <th class="px-4 py-2.5 text-left">รายการ (Charged Items)</th>
                  <th class="px-4 py-2.5 text-center w-28">จำนวน (Quantity)</th>
                  <th class="px-4 py-2.5 text-right w-36">จำนวนเงิน ( THB )</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-[11.5px]">
                <tr v-for="(item, index) in invoice?.items" :key="index" class="text-slate-800">
                  <td class="px-4 py-3 text-center font-semibold font-mono">{{ index + 1 }}</td>
                  <td class="px-4 py-3">
                    <div class="font-extrabold text-slate-955 text-[12px]">
                      {{ locale === 'th' ? (item.package?.name_th || item.package_name_th || item.package_id) : (item.package?.name_en || item.package_name_en || item.package_id) }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center font-bold font-mono">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-right font-bold font-mono text-[12px]">
                    {{ formatCurrency(item.subtotal || (item.quantity * item.unit_price)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Calculation Box -->
          <div class="mt-4 flex justify-end">
            <div class="w-80 flex items-center justify-between p-3 border-b border-slate-300 text-[12px]">
              <span class="font-extrabold text-slate-900">รวม (Total Amount)</span>
              <span class="font-mono font-extrabold text-[14px] text-slate-950">
                {{ formatCurrency(invoice?.total_amount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Collector Signatures & print timestamp -->
        <div class="mt-24">
          <div class="flex justify-between items-center text-[12px]">
            <div class="text-slate-400">
              <!-- Left side spacing -->
            </div>
            <div class="text-center font-bold text-slate-800">
              <span class="mr-1">ผู้รับเงิน</span>
              <span class="text-slate-500 font-medium">( Collector )</span>
              <span class="ml-1">..............................................................</span>
            </div>
          </div>

          <!-- Printing timestamp details at bottom right -->
          <div class="flex justify-end text-[9px] font-bold text-slate-400 mt-12">
            Printing Date {{ printDate }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalePath, useSwitchLocalePath } from '#imports'
import { useI18n } from 'vue-i18n'
import { useApiFetch } from '../../../composables/useApiFetch'
import { useAuthEngine } from '../../../features/auth/composables/useAuthEngine'
import { formatDeliveryDate } from '../../../features/order/composables/useOrderEngine'

// Disable layouts entirely for A4 print page
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()
const { apiFetch } = useApiFetch()
const { company: authCompany } = useAuthEngine()

const orderId = String(route.params.id)
const isLoading = ref(true)
const errorMsg = ref<string | null>(null)
const invoice = ref<any>(null)
const company = ref<any>(null)
const customer = ref<any>(null)
const printDate = ref('')

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
    console.error('Error fetching invoice details:', err)
    errorMsg.value = err.message || 'An error occurred while loading invoice details'
  } finally {
    isLoading.value = false
  }
}

// Helpers
const formatInvoiceDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return formatDeliveryDate(dateStr).replace(/-/g, '/')
}

const getCustomerFullName = () => {
  if (!customer.value) return invoice.value?.customer_name || '-'
  const prefix = locale.value === 'th'
    ? customer.value.prefix_th || ''
    : customer.value.prefix_en || ''
  
  const firstName = locale.value === 'th'
    ? customer.value.first_name_th || customer.value.first_name_en || ''
    : customer.value.first_name_en || customer.value.first_name_th || ''
  
  const lastName = locale.value === 'th'
    ? customer.value.last_name_th || customer.value.last_name_en || ''
    : customer.value.last_name_en || customer.value.last_name_th || ''
  
  const combined = `${prefix} ${firstName} ${lastName}`.trim()
  return combined || invoice.value?.customer_name || '-'
}

const calculatePreciseAge = (birthDateStr?: string, referenceDateStr?: string) => {
  if (!birthDateStr) return '-'
  try {
    const birth = new Date(birthDateStr.split('T')[0])
    const ref = referenceDateStr ? new Date(referenceDateStr.split('T')[0]) : new Date()
    if (isNaN(birth.getTime()) || isNaN(ref.getTime())) return '-'
    
    let years = ref.getFullYear() - birth.getFullYear()
    let months = ref.getMonth() - birth.getMonth()
    let days = ref.getDate() - birth.getDate()
    
    if (days < 0) {
      months--
      const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0)
      days += prevMonth.getDate()
    }
    
    if (months < 0) {
      years--
      months += 12
    }
    
    const parts = []
    if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
    
    return parts.length > 0 ? parts.join(', ') : '0 days'
  } catch {
    return '-'
  }
}

const formatPaymentChannel = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case 'cash': return 'Cash'
    case 'credit_card': return 'Credit Card'
    case 'internet_banking': return 'Internet Banking'
    default: return channel || '-'
  }
}

const formatCurrency = (val: number) => {
  return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatPrintDate = (dObj: Date = new Date()) => {
  const day = String(dObj.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const year = dObj.getFullYear()
  const hours = String(dObj.getHours()).padStart(2, '0')
  const minutes = String(dObj.getMinutes()).padStart(2, '0')
  return `${day}-${months[dObj.getMonth()]}-${year} ${hours}:${minutes}`
}

const toggleLanguage = () => {
  const targetLocale = locale.value === 'th' ? 'en' : 'th'
  const targetPath = switchLocalePath(targetLocale)
  router.push(targetPath)
}

const printInvoice = () => {
  if (import.meta.client) {
    window.print()
  }
}

const goBack = () => {
  router.push(localePath('/orders'))
}

onMounted(() => {
  printDate.value = formatPrintDate()
  fetchInvoiceData()
})
</script>

<style scoped>
/* Page Layout Styles */
.a4-page-container {
  display: block;
}

.a4-page {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  padding: 18mm 15mm;
  margin: 0 auto;
  background: white;
  color: #0f172a;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-family: 'Plus Jakarta Sans', sans-serif;
  border-radius: 4px;
}

/* Print CSS Media Queries */
@media print {
  .no-print {
    display: none !important;
  }
  
  body, .min-h-screen {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .a4-page-container {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
  }

  .a4-page {
    width: 100% !important;
    min-height: 297mm !important;
    padding: 12mm 10mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
</style>
