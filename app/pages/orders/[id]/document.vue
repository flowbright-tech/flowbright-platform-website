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

          <!-- Document Profile Metadata (Beautified Single-Language Responsive Grid) -->
          <div class="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 space-y-3 text-slate-800 text-[11.5px] font-medium my-4 shadow-2xs">
            <!-- Row 1: Billing Date, HN, Payment Channel -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 pb-3 border-b border-slate-200/80 items-center">
              <div class="sm:col-span-4 flex items-center gap-1">
                <span class="font-bold text-slate-800 shrink-0">
                  {{ locale === 'th' ? 'วันที่' : 'Date' }} :
                </span>
                <span class="font-mono font-bold text-slate-900 ml-0.5">{{ formatInvoiceDate(invoice?.delivery_date) }}</span>
              </div>
              <div class="sm:col-span-3 flex items-center justify-center gap-1 shrink-0 text-center">
                <span class="font-bold text-slate-800 shrink-0">HN :</span>
                <span class="font-mono font-bold text-slate-900 ml-0.5">{{ customer?.code || invoice?.customer_code || 'HN' + (invoice?.customer_id?.substring(0, 10) || '') }}</span>
              </div>
              <div class="sm:col-span-5 flex items-center justify-end gap-1 shrink-0">
                <span class="font-bold text-slate-800 shrink-0">
                  {{ locale === 'th' ? 'ช่องทางการชำระเงิน' : 'Payment Channel' }} :
                </span>
                <span class="font-bold text-slate-900 ml-0.5 capitalize">{{ formatPaymentChannel(invoice?.payment_channel) }}</span>
              </div>
            </div>

            <!-- Row 2: Customer Name, Date of Birth (Centralized), Age (Y/M/D) -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
              <!-- Name -->
              <div class="sm:col-span-4 flex items-center gap-1 min-w-0">
                <span class="font-bold text-slate-800 shrink-0">
                  {{ locale === 'th' ? 'ชื่อ' : 'Name' }} :
                </span>
                <span class="font-extrabold text-slate-950 text-[12px] truncate ml-0.5">
                  {{ getCustomerFullName() }}
                </span>
              </div>

              <!-- Date of Birth (Centralized) -->
              <div class="sm:col-span-4 flex items-center justify-center gap-1 shrink-0 text-center">
                <span class="font-bold text-slate-800 shrink-0">
                  {{ locale === 'th' ? 'วันเดือนปีเกิด' : 'Date of Birth' }} :
                </span>
                <span class="font-mono font-bold text-slate-900 ml-0.5">{{ formatBirthDate(customer?.birth_date) }}</span>
              </div>

              <!-- Age -->
              <div class="sm:col-span-4 flex items-center justify-end gap-1 shrink-0">
                <span class="font-bold text-slate-800 shrink-0">
                  {{ locale === 'th' ? 'อายุ' : 'Age' }} :
                </span>
                <span class="font-bold text-slate-900 ml-0.5">{{ calculatePreciseAge(customer?.birth_date, invoice?.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Charged Items Table -->
          <div class="mt-6">
            <table class="w-full border-collapse border-b border-slate-300">
              <thead>
                <tr class="bg-indigo-50/60 text-[11px] font-bold text-slate-700 border-b border-slate-300">
                  <th class="px-4 py-2.5 text-center w-16">{{ locale === 'th' ? 'ลำดับ' : 'No.' }}</th>
                  <th class="px-4 py-2.5 text-left">{{ locale === 'th' ? 'รายการ' : 'Charged Items' }}</th>
                  <th class="px-4 py-2.5 text-center w-28">{{ locale === 'th' ? 'จำนวน' : 'Quantity' }}</th>
                  <th class="px-4 py-2.5 text-right w-36">{{ locale === 'th' ? 'จำนวนเงิน (บาท)' : 'Amount (THB)' }}</th>
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
              <span class="font-extrabold text-slate-900">{{ locale === 'th' ? 'ราคารวมสุทธิ' : 'Total Amount' }}</span>
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
              <span class="mr-1">{{ locale === 'th' ? 'ผู้รับเงิน' : 'Collector' }}</span>
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

const formatBirthDate = (dateStr?: string) => {
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
    const refDate = referenceDateStr ? new Date(referenceDateStr.split('T')[0]) : new Date()
    if (isNaN(birth.getTime()) || isNaN(refDate.getTime())) return '-'
    
    let years = refDate.getFullYear() - birth.getFullYear()
    let months = refDate.getMonth() - birth.getMonth()
    let days = refDate.getDate() - birth.getDate()
    
    if (days < 0) {
      months--
      const prevMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0)
      days += prevMonth.getDate()
    }
    
    if (months < 0) {
      years--
      months += 12
    }
    
    const parts = []
    if (years > 0) parts.push(locale.value === 'th' ? `${years} ปี` : `${years} yrs`)
    if (months > 0) parts.push(locale.value === 'th' ? `${months} เดือน` : `${months} mos`)
    if (days > 0) parts.push(locale.value === 'th' ? `${days} วัน` : `${days} days`)
    
    return parts.length > 0 ? parts.join(' ') : (locale.value === 'th' ? '0 วัน' : '0 days')
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
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    padding: 10mm 10mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
  }

  /* Optimize layout density to strictly fit A4 single page */
  .a4-page img,
  .a4-page div.w-\[100mm\] {
    max-height: 40mm !important;
    height: 40mm !important;
  }

  .a4-page th,
  .a4-page td {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }

  /* Shrink margins to prevent overflow */
  .mb-6 {
    margin-bottom: 0.75rem !important;
  }
  .mt-6 {
    margin-top: 0.75rem !important;
  }
  .mt-4 {
    margin-top: 0.5rem !important;
  }
  .mt-24 {
    margin-top: auto !important; /* Let flex push it down if there is space */
    padding-top: 1rem !important;
  }
  .mt-12 {
    margin-top: 1rem !important;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
</style>
