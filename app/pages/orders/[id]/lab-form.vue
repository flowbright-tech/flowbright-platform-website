<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-3 sm:py-6 px-2 sm:px-6 flex flex-col items-center">
    <!-- Reusable Top Action Bar -->
    <PrintActionBar
      title="Lab Technician Worksheet (Lab In / Lab Out)"
      :pdf-filename="`Lab_Worksheet_${order?.code || order?.order_number || orderId}.pdf`"
    />

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="w-full max-w-[210mm] bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-6">
      <div class="flex justify-center py-6">
        <USkeleton class="h-10 w-80 rounded-lg" />
      </div>
      <div class="border-y border-slate-100 py-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    <div v-else-if="errorMsg" class="w-full max-w-[210mm] bg-white p-6 sm:p-8 rounded-xl shadow-md text-center space-y-4">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-rose-500 mx-auto" />
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">Failed to load Lab Worksheet details</h2>
      <p class="text-sm text-slate-500">{{ errorMsg }}</p>
      <UButton color="neutral" variant="solid" @click="fetchLabFormData">
        Retry
      </UButton>
    </div>

    <!-- Document Sheet (Print target & responsive A4 view) -->
    <div v-else class="a4-page-container w-full max-w-[210mm]">
      <div class="a4-page print-content flex flex-col justify-between">
        <div>
          <!-- Lab Form Header (Company Logo Image, No Icons) -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b-2 border-slate-800 mb-3">
            <div class="flex items-center gap-3">
              <img
                v-if="company?.image_url"
                :src="company.image_url"
                alt="Company Logo"
                class="h-10 sm:h-12 max-w-[160px] object-contain shrink-0"
              />
              <div>
                <h1 class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {{ company?.name_th || 'เอ็มทีอินเตอร์เมดิคอลแล็บ' }}
                </h1>
                <p class="text-[11px] font-semibold text-slate-600">
                  {{ company?.name_en || 'M.T. Inter Medical Laboratory' }}
                </p>
              </div>
            </div>
            <div class="text-left sm:text-right">
              <div class="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-400 font-extrabold text-[11px] uppercase tracking-wider rounded">
                LAB TECHNICIAN WORKSHEET
              </div>
              <div class="text-[10.5px] font-mono font-bold text-slate-700 mt-0.5">
                Order Ref: {{ order?.code || order?.order_number || orderId }}
              </div>
            </div>
          </div>

          <!-- Customer Information Card (Space Optimized & Responsive) -->
          <div class="border border-slate-300 rounded-lg p-2.5 space-y-1.5 bg-slate-50/50 mb-3 text-[11px]">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between items-center flex-wrap gap-1">
              <span class="font-bold text-slate-800">
                ข้อมูลผู้ป่วย / ข้อมูลลูกค้า (Customer & Patient Profile)
              </span>
              <span class="font-mono text-[10.5px] text-slate-600">
                HN: {{ customer?.code || order?.customer_code || 'HN' + (order?.customer_id?.substring(0, 8) || '') }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <div>
                <span class="font-bold text-slate-700">ชื่อ-นามสกุล : </span>
                <span class="font-extrabold text-slate-900">{{ getCustomerFullName() }}</span>
              </div>
              <div>
                <span class="font-bold text-slate-700">วันเกิด : </span>
                <span class="font-mono font-bold text-slate-900">{{ formatBirthDate(customer?.birth_date) }}</span>
              </div>
              <div class="sm:text-right">
                <span class="font-bold text-slate-700">อายุ : </span>
                <span class="font-bold text-slate-900">{{ calculatePreciseAge(customer?.birth_date, order?.created_at) }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 border-t border-slate-200/60 text-[10.5px]">
              <div>
                <span class="font-bold text-slate-700">เพศ : </span>
                <span class="font-bold text-slate-900 capitalize">{{ customer?.gender || '-' }}</span>
              </div>
              <div>
                <span class="font-bold text-slate-700">โทรศัพท์ : </span>
                <span class="font-mono font-bold text-slate-900">{{ customer?.phone || order?.customer_phone || '-' }}</span>
              </div>
              <div class="sm:text-right">
                <span class="font-bold text-slate-700">Passport / ID : </span>
                <span class="font-mono font-bold text-slate-900">{{ customer?.passport || customer?.id_card || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div class="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/50 mb-4 text-[11px]">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between items-center flex-wrap gap-1">
              <span class="font-bold text-slate-800">
                รายละเอียดคำสั่งซื้อ (Order Details)
              </span>
              <span class="font-mono text-[10.5px] text-slate-600">
                วันที่ส่งตรวจ: {{ formatInvoiceDate(order?.delivery_date) }}
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px]">
              <div>
                <span class="font-bold text-slate-700">ช่องทางการชำระเงิน: </span>
                <span class="font-bold text-slate-900 capitalize">{{ formatPaymentChannel(order?.payment_channel) }}</span>
              </div>
              <div class="sm:text-right">
                <span class="font-bold text-slate-700">สถานะคำสั่งซื้อ: </span>
                <span class="font-bold text-emerald-700 uppercase">{{ order?.status || 'Active' }}</span>
              </div>
            </div>
            <div v-if="order?.notes" class="text-[10px] text-amber-900 bg-amber-50 p-1 rounded border border-amber-200 mt-1">
              <span class="font-bold">หมายเหตุพิเศษ: </span>{{ order.notes }}
            </div>
          </div>

          <!-- Table 1: Lab In Items -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <h2 class="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                รายการทดสอบภายในห้องปฏิบัติการ (Lab In Tests)
              </h2>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Total: {{ labInItems.length }} Tests
              </span>
            </div>

            <div class="overflow-x-auto border border-slate-300 rounded-lg">
              <table v-if="labInItems.length > 0" class="w-full border-collapse text-[10px] sm:text-[10.5px] min-w-[550px] sm:min-w-full">
                <thead>
                  <tr class="bg-emerald-100/70 text-slate-900 font-bold border-b border-slate-300">
                    <th class="px-2 py-1.5 text-center border-r border-slate-300 w-8">ลำดับ</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300 w-24">รหัส/SKU</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300">รายการทดสอบ (Test Name)</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300 w-32">ชนิดตัวอย่าง (Sample)</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300 w-28">วิธีวิเคราะห์ (Method)</th>
                    <th class="px-2 py-1.5 text-center w-24">ผลลัพธ์ / หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="(item, idx) in labInItems" :key="idx" class="text-slate-800">
                    <td class="px-2 py-1 text-center font-mono font-bold border-r border-slate-200">{{ idx + 1 }}</td>
                    <td class="px-2 py-1 font-mono font-bold text-slate-900 border-r border-slate-200">
                      {{ getItemSku(item) }}
                    </td>
                    <td class="px-2 py-1 border-r border-slate-200">
                      <div class="font-extrabold text-slate-900 leading-tight">{{ getItemName(item) }}</div>
                      <div v-if="getItemPackageName(item)" class="text-[9px] text-slate-500 font-semibold leading-tight">
                        Package: {{ getItemPackageName(item) }}
                      </div>
                      <div v-if="item.principle || item.product?.principle" class="text-[9px] text-slate-500 italic leading-tight">
                        {{ item.principle || item.product?.principle }}
                      </div>
                    </td>
                    <td class="px-2 py-1 border-r border-slate-200 font-medium">
                      {{ item.sample_type_volum || item.product?.sample_type_volum || '-' }}
                    </td>
                    <td class="px-2 py-1 border-r border-slate-200 font-medium">
                      {{ item.method || item.product?.method || '-' }}
                      <span v-if="item.reference_range_unit || item.product?.reference_range_unit" class="text-[9.5px] text-slate-500">
                        ({{ item.reference_range_unit || item.product?.reference_range_unit }})
                      </span>
                    </td>
                    <td class="px-2 py-1 text-center text-slate-400 font-mono text-[9.5px]">
                      [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-else class="p-2.5 text-center text-[11px] text-slate-500 font-medium bg-slate-50">
                ไม่มีรายการทดสอบ Lab In สำหรับคำสั่งซื้อนี้ (No Lab In tests required)
              </div>
            </div>
          </div>

          <!-- Table 2: Lab Out Items -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <h2 class="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                รายการทดสอบส่งตรวจภายนอก (Lab Out Tests)
              </h2>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Total: {{ labOutItems.length }} Tests
              </span>
            </div>

            <div class="overflow-x-auto border border-slate-300 rounded-lg">
              <table v-if="labOutItems.length > 0" class="w-full border-collapse text-[10px] sm:text-[10.5px] min-w-[550px] sm:min-w-full">
                <thead>
                  <tr class="bg-amber-100/70 text-slate-900 font-bold border-b border-slate-300">
                    <th class="px-2 py-1.5 text-center border-r border-slate-300 w-8">ลำดับ</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300 w-24">รหัส/SKU</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300">รายการทดสอบ (Test Name)</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300 w-32">ชนิดตัวอย่าง (Sample)</th>
                    <th class="px-2 py-1.5 text-left border-r border-slate-300 w-28">Lead Time / จัดเก็บ</th>
                    <th class="px-2 py-1.5 text-center w-24">สถานะการส่งตรวจ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="(item, idx) in labOutItems" :key="idx" class="text-slate-800">
                    <td class="px-2 py-1 text-center font-mono font-bold border-r border-slate-200">{{ idx + 1 }}</td>
                    <td class="px-2 py-1 font-mono font-bold text-slate-900 border-r border-slate-200">
                      {{ getItemSku(item) }}
                    </td>
                    <td class="px-2 py-1 border-r border-slate-200">
                      <div class="font-extrabold text-slate-900 leading-tight">{{ getItemName(item) }}</div>
                      <div v-if="getItemPackageName(item)" class="text-[9px] text-slate-500 font-semibold leading-tight">
                        Package: {{ getItemPackageName(item) }}
                      </div>
                      <div v-if="item.collection_remark || item.product?.collection_remark" class="text-[9px] text-amber-700 italic leading-tight">
                        Instruction: {{ item.collection_remark || item.product?.collection_remark }}
                      </div>
                    </td>
                    <td class="px-2 py-1 border-r border-slate-200 font-medium">
                      {{ item.sample_type_volum || item.product?.sample_type_volum || '-' }}
                    </td>
                    <td class="px-2 py-1 border-r border-slate-200 font-medium">
                      {{ item.leadtime || item.product?.leadtime || '-' }} / {{ item.storage_condition || item.product?.storage_condition || '-' }}
                    </td>
                    <td class="px-2 py-1 text-center font-bold text-amber-700 text-[10px]">
                      Pending Outsource
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-else class="p-2.5 text-center text-[11px] text-slate-500 font-medium bg-slate-50">
                ไม่มีรายการทดสอบ Lab Out สำหรับคำสั่งซื้อนี้ (No Lab Out tests required)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useApiFetch } from '../../../composables/useApiFetch'
import { useAuthEngine } from '../../../features/auth/composables/useAuthEngine'
import { formatDeliveryDate } from '../../../features/order/composables/useOrderEngine'
import PrintActionBar from '../../../components/PrintActionBar.vue'

// Disable page layouts for A4 printing
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const { apiFetch } = useApiFetch()
const { company: authCompany } = useAuthEngine()

const orderId = String(route.params.id)
const isLoading = ref(true)
const errorMsg = ref<string | null>(null)
const order = ref<any>(null)
const company = ref<any>(null)
const customer = ref<any>(null)
const labItems = ref<any[]>([])
const printDate = ref('')

const extractLabItemsFromOrder = (orderData: any): any[] => {
  if (!orderData || !Array.isArray(orderData.items)) return []
  const list: any[] = []
  orderData.items.forEach((item: any) => {
    if (item.package && Array.isArray(item.package.items)) {
      item.package.items.forEach((pkgItem: any) => {
        if (pkgItem.product) {
          list.push({
            package_id: item.package_id,
            package_name_en: item.package?.name_en || item.package_name_en,
            package_name_th: item.package?.name_th || item.package_name_th,
            product_id: pkgItem.product_id,
            product_name_en: pkgItem.product.name_en,
            product_name_th: pkgItem.product.name_th,
            sku: pkgItem.product.sku,
            unit: pkgItem.product.unit,
            quantity: pkgItem.quantity || item.quantity || 1,
            lab_flag: pkgItem.product.lab_flag || 'labout',
            method: pkgItem.product.method,
            sample_type_volum: pkgItem.product.sample_type_volum,
            reference_range_unit: pkgItem.product.reference_range_unit,
            leadtime: pkgItem.product.leadtime,
            storage_condition: pkgItem.product.storage_condition,
            collection_remark: pkgItem.product.collection_remark
          })
        }
      })
    } else {
      list.push(item)
    }
  })
  return list
}

const fetchLabFormData = async () => {
  isLoading.value = true
  errorMsg.value = null
  try {
    const res = await apiFetch(`/api/v1/orders/${orderId}/lab-form`).catch(() => null)
    if (res && res.ok) {
      const json = await res.json()
      if (json.success && json.data) {
        order.value = json.data.order || json.data
        company.value = json.data.company || authCompany.value
        customer.value = json.data.customer || json.data.order?.customer
        labItems.value = json.data.lab_items || json.data.order?.lab_items || extractLabItemsFromOrder(order.value)
        isLoading.value = false
        return
      }
    }

    const orderRes = await apiFetch(`/api/v1/orders/${orderId}`)
    if (orderRes.ok) {
      const orderJson = await orderRes.ok ? await orderRes.json() : null
      if (orderJson && orderJson.success && orderJson.data) {
        order.value = orderJson.data
        customer.value = orderJson.data?.customer
        company.value = orderJson.data?.company || authCompany.value
        labItems.value = orderJson.data?.lab_items || extractLabItemsFromOrder(orderJson.data)
      } else {
        throw new Error('Order details not found')
      }
    } else {
      throw new Error(`Failed to load order: ${orderRes.status}`)
    }
  } catch (err: any) {
    console.error('Error fetching lab form data:', err)
    errorMsg.value = err.message || 'An error occurred while loading lab form details'
  } finally {
    isLoading.value = false
  }
}

// Categorized items by lab_flag ('labin' vs 'labout')
const labInItems = computed(() => {
  return labItems.value.filter((item: any) => {
    const flag = (item.lab_flag || item.product?.lab_flag || item.package?.lab_flag || '').toLowerCase()
    return flag === 'labin'
  })
})

const labOutItems = computed(() => {
  return labItems.value.filter((item: any) => {
    const flag = (item.lab_flag || item.product?.lab_flag || item.package?.lab_flag || '').toLowerCase()
    return flag === 'labout' || flag !== 'labin'
  })
})

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
  if (!customer.value) return order.value?.customer_name || '-'
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
  return combined || order.value?.customer_name || '-'
}

const getItemName = (item: any) => {
  if (locale.value === 'th') {
    return item.product_name_th || item.product?.name_th || item.package_name_th || item.name_th || item.name_en || 'Unspecified Test'
  }
  return item.product_name_en || item.product?.name_en || item.package_name_en || item.name_en || item.name_th || 'Unspecified Test'
}

const getItemPackageName = (item: any) => {
  if (locale.value === 'th') {
    return item.package_name_th || item.package?.name_th || ''
  }
  return item.package_name_en || item.package?.name_en || ''
}

const getItemSku = (item: any) => {
  return item.sku || item.product?.sku || item.package?.sku || item.code || '-'
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
    if (years > 0) parts.push(`${years} yrs`)
    if (months > 0) parts.push(`${months} mos`)
    if (days > 0) parts.push(`${days} days`)

    return parts.length > 0 ? parts.join(' ') : '0 days'
  } catch {
    return '-'
  }
}

const formatPaymentChannel = (channel?: string) => {
  switch (channel?.toLowerCase()) {
    case 'cash': return 'Cash'
    case 'credit_card': return 'Credit Card'
    case 'internet_banking': return 'Internet Banking'
    default: return channel || '-'
  }
}

const formatPrintDate = (dObj: Date = new Date()) => {
  const day = String(dObj.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const year = dObj.getFullYear()
  const hours = String(dObj.getHours()).padStart(2, '0')
  const minutes = String(dObj.getMinutes()).padStart(2, '0')
  return `${day}-${months[dObj.getMonth()]}-${year} ${hours}:${minutes}`
}

onMounted(() => {
  printDate.value = formatPrintDate()
  fetchLabFormData()
})
</script>

<style scoped>
.a4-page-container {
  display: block;
}

.a4-page {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  padding: 12mm 15mm;
  margin: 0 auto;
  background: white;
  color: #0f172a;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-family: 'Plus Jakarta Sans', sans-serif;
  border-radius: 4px;
}

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
    padding: 10mm 12mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    box-sizing: border-box !important;
  }

  tr {
    page-break-inside: avoid;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
</style>
