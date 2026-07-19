<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 no-print flex flex-col items-center">
    <!-- Top Action bar (hidden on print) -->
    <div class="w-full max-w-[210mm] mb-6 flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-heroicons-arrow-left"
          size="sm"
          @click="goBack"
        >
          {{ $t('common.back') || 'Back to Orders' }}
        </UButton>
        <span class="text-sm font-bold text-slate-700 dark:text-slate-200">
          Invoice Printing Preview
        </span>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-printer"
        size="md"
        class="font-semibold shadow-sm"
        @click="printInvoice"
      >
        Print Invoice (A4)
      </UButton>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="w-full max-w-[210mm] bg-white p-8 rounded-xl shadow-md space-y-6">
      <div class="flex justify-between items-start">
        <div class="flex gap-4">
          <USkeleton class="h-14 w-14 rounded-full" />
          <div class="space-y-2">
            <USkeleton class="h-5 w-72" />
            <USkeleton class="h-4 w-96" />
            <USkeleton class="h-4 w-80" />
          </div>
        </div>
      </div>
      <div class="border-y border-slate-100 py-6 space-y-4">
        <USkeleton class="h-6 w-1/3" />
        <div class="grid grid-cols-2 gap-4">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
        </div>
      </div>
      <div class="space-y-3">
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-12 w-full" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="w-full max-w-[210mm] bg-white p-8 rounded-xl shadow-md text-center space-y-4">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-rose-500 mx-auto" />
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">Failed to load invoice</h2>
      <p class="text-sm text-slate-500">{{ errorMsg }}</p>
      <UButton color="neutral" variant="solid" @click="fetchInvoiceData">
        Retry
      </UButton>
    </div>

    <!-- Invoice Sheet (Print target) -->
    <div v-else class="a4-page-container">
      <div class="a4-page print-content">
        <!-- Logo & Header Section -->
        <div class="flex gap-5 items-start">
          <!-- SVG Clinic Logo (Mockup match) -->
          <div class="shrink-0">
            <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="68" height="68" rx="14" fill="#0F172A" />
              <!-- Test tube silhouette -->
              <path d="M30 16H38V22H30V16Z" fill="#38BDF8" />
              <path d="M30 22V44C30 48.4183 33.5817 52 38 52C42.4183 52 46 48.4183 46 44V22H30Z" fill="white" fill-opacity="0.25" />
              <path d="M26 16C26 14.8954 26.8954 14 28 14H40C41.1046 14 42 14.8954 42 16C42 17.1046 41.1046 18 40 18H28C26.8954 18 26 17.1046 26 16Z" fill="#38BDF8" />
              <!-- Blood droplets / Cross -->
              <circle cx="34" cy="38" r="4" fill="#EF4444" />
              <circle cx="38" cy="46" r="3.5" fill="#EF4444" />
            </svg>
          </div>
          <!-- Clinic Details (TH & EN) -->
          <div class="flex-1 space-y-1 text-slate-800">
            <h1 class="text-base font-extrabold leading-tight tracking-tight">
              คลินิก เอ็ม.ที อินเตอร์แล็บ ( M.T.INTER MEDICAL LABORATORY CLINIC )
            </h1>
            <h2 class="text-[13px] font-bold leading-tight">
              บริษัท เมโทรเมด จำกัด (สำนักงานใหญ่) ( METRO MED COMPANY LIMITED )
            </h2>
            <p class="text-[10px] leading-snug text-slate-600 font-medium">
              193/421 หมู่ 10 ต.หนองปรือ อ.บางละมุง จ.ชลบุรี 20150 โทร. : 082-4956642
            </p>
            <p class="text-[10px] leading-snug text-slate-600 font-medium">
              193/421 Moo.10 Nongprue,Banglamung Chonburi Thailand 20150 Tel. : (+66) 082-4956642
            </p>
            <p class="text-[9.5px] text-slate-500 font-semibold flex items-center gap-4 pt-0.5">
              <span>Email : mtinterlab.pattaya@gmail.com</span>
              <span>Website : https://mtinterlab.co</span>
            </p>
          </div>
        </div>

        <!-- Horizontal separator line -->
        <hr class="border-slate-300 my-4" />

        <!-- Invoice Subheader Details -->
        <div class="grid grid-cols-3 items-center gap-2 mb-5">
          <div class="text-[13px] font-extrabold text-slate-900 flex items-center gap-1">
            <span>ใบเสร็จรับเงิน</span>
            <span class="text-slate-600 text-xs font-bold">(RECEIPT)</span>
          </div>
          <div class="text-[12.5px] font-bold text-center text-slate-800">
            เลขที่ <span class="text-[11px] text-slate-500 font-medium">(Billing No.)</span>
            <span class="font-mono ml-1.5 text-slate-900 font-extrabold">{{ invoice?.code || invoice?.order_number || '-' }}</span>
          </div>
          <div class="text-[12.5px] font-bold text-right text-slate-800">
            วันที่ <span class="text-[11px] text-slate-500 font-medium">(Billing Date.)</span>
            <span class="font-mono ml-1.5 text-slate-900 font-extrabold">{{ formatInvoiceDate(invoice?.delivery_date) }}</span>
          </div>
        </div>

        <!-- Customer Profile Metadata Section -->
        <div class="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50/50">
          <div class="flex justify-between items-center text-[12px]">
            <div>
              <span class="font-bold text-slate-800">ได้รับเงินจาก</span>
              <span class="text-[10px] text-slate-500 font-semibold ml-1">( Received from ) :</span>
              <span class="font-extrabold text-slate-900 ml-1.5 text-[12.5px]">{{ invoice?.customer_name || '-' }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-800">ช่องทางการชำระเงิน</span>
              <span class="text-[10px] text-slate-500 font-semibold ml-1">( Payment Channel ) :</span>
              <span class="font-bold text-slate-900 ml-1.5 capitalize">{{ formatPaymentChannel(invoice?.payment_channel) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4 text-[11px]">
            <div>
              <span class="font-bold text-slate-700">HN :</span>
              <span class="font-mono font-bold text-slate-900 ml-1.5">{{ customer?.code || 'HN' + (invoice?.customer_id?.substring(0, 10) || '') }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-700">วันเดือนปีเกิด</span>
              <span class="text-[9.5px] text-slate-500 font-semibold ml-0.5">( DateOfBirth ) :</span>
              <span class="font-mono font-bold text-slate-900 ml-1.5">{{ formatBirthDate(customer?.birth_date) }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-700">อายุ</span>
              <span class="text-[9.5px] text-slate-500 font-semibold ml-0.5">( Age ) :</span>
              <span class="font-bold text-slate-900 ml-1.5">{{ calculateAge(customer?.birth_date) }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-700">Passport No. :</span>
              <span class="font-mono font-bold text-slate-900 ml-1.5">{{ customer?.passport || customer?.id_card || '-' }}</span>
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
                  <div class="font-extrabold text-slate-950 text-[12px]">
                    {{ locale === 'th' ? (item.package_name_th || (item as any).package?.name_th || (item as any).name_th || item.package_name_en || (item as any).package?.name_en || item.package_id) : (item.package_name_en || (item as any).package?.name_en || (item as any).name_en || item.package_name_th || (item as any).package?.name_th || item.package_id) }}
                  </div>
                  <div v-if="item.notes" class="text-[10px] text-slate-500 italic mt-0.5 font-medium">
                    {{ item.notes }}
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

        <!-- Footer Signatures & Print timestamps -->
        <div class="mt-20 flex flex-col space-y-16">
          <div class="flex justify-between items-center text-[12px]">
            <div class="text-slate-400">
              <!-- Left side empty spacing -->
            </div>
            <div class="text-center font-bold text-slate-800">
              <span class="mr-1">ผู้รับเงิน</span>
              <span class="text-slate-500 font-medium">( Collector )</span>
              <span class="ml-1">..............................................................</span>
            </div>
          </div>

          <!-- Printing timestamp details at bottom right -->
          <div class="flex justify-end text-[9px] font-bold text-slate-400">
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
import { useLocalePath } from '#imports'
import { useI18n } from 'vue-i18n'
import { useApiFetch } from '../../../composables/useApiFetch'
import { formatDeliveryDate, safeLowerCase } from '../../../features/order/composables/useOrderEngine'

// Disable layouts entirely for A4 print page
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { locale } = useI18n()
const { apiFetch } = useApiFetch()

const orderId = String(route.params.id)
const isLoading = ref(true)
const errorMsg = ref<string | null>(null)
const invoice = ref<any>(null)
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
        invoice.value = json.data
        if (invoice.value.customer_id) {
          const custRes = await apiFetch(`/api/v1/customers/${invoice.value.customer_id}`).catch(() => null)
          if (custRes && custRes.ok) {
            const custJson = await custRes.json()
            if (custJson.success && custJson.data) {
              customer.value = custJson.data
            }
          }
        }
        return
      }
    }

    // 2. Fallback to /api/v1/orders/{id}
    const orderRes = await apiFetch(`/api/v1/orders/${orderId}`)
    if (orderRes.ok) {
      const orderJson = await orderRes.json()
      if (orderJson.success && orderJson.data) {
        invoice.value = orderJson.data
        if (invoice.value.customer_id) {
          const custRes = await apiFetch(`/api/v1/customers/${invoice.value.customer_id}`).catch(() => null)
          if (custRes && custRes.ok) {
            const custJson = await custRes.json()
            if (custJson.success && custJson.data) {
              customer.value = custJson.data
            }
          }
        }
      } else {
        throw new Error('Order details not found')
      }
    } else {
      throw new Error(`Failed to load order: ${orderRes.status}`)
    }
  } catch (err: any) {
    console.error('Error fetching invoice data:', err)
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

const calculateAge = (birthDateStr?: string) => {
  if (!birthDateStr) return '-'
  try {
    const cleanStr = birthDateStr.split('T')[0]
    const birthDate = new Date(cleanStr)
    if (isNaN(birthDate.getTime())) return '-'
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : '-'
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
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
  }

  .a4-page {
    width: 100% !important;
    min-height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }

  @page {
    size: A4;
    margin: 15mm 10mm;
  }
}
</style>
