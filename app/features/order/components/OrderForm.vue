<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <UCard class="glass-panel" :ui="{ body: { padding: 'p-6 sm:p-8' } }">
      <form @submit.prevent="submitForm" class="space-y-8">

        <!-- Section 1: Customer Selection & Details -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <UIcon name="i-heroicons-user" class="w-5 h-5 text-indigo-500" />
            {{ $t('orders.sec_customer') || 'Customer Information' }}
          </h3>

          <div class="space-y-4">
            <!-- Customer Dropdown Search -->
            <UFormField :error="errors.customer_name || undefined">
              <template #label>
                <span>{{ $t('orders.select_customer') || 'Select Customer from Database' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>

              <USelectMenu
                v-model="selectedCustomer"
                v-model:search-term="customerSearchQuery"
                :items="customerOptions"
                :placeholder="$t('orders.select_customer') || 'Type to search customer by code or name...'"
                size="md"
                class="w-full"
                label-key="label"
                ignore-filter
                :loading="isSearchingCustomers"
              />
            </UFormField>

            <!-- Auto-populated Customer Fields -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Customer Name -->
              <UFormField :error="errors.customer_name || undefined">
                <template #label>
                  <span>{{ $t('orders.customer_name') || 'Customer Name' }}</span>
                  <span class="text-red-500 font-bold ml-0.5">*</span>
                </template>
                <UInput
                  v-model="form.customer_name"
                  placeholder="e.g. John Doe"
                  size="md"
                  class="w-full"
                />
              </UFormField>

              <!-- Customer Email -->
              <UFormField :label="$t('orders.customer_email') || 'Customer Email'">
                <UInput
                  v-model="form.customer_email"
                  type="email"
                  placeholder="e.g. customer@example.com"
                  size="md"
                  class="w-full"
                />
              </UFormField>

              <!-- Customer Phone -->
              <UFormField :label="$t('orders.customer_phone') || 'Customer Phone'">
                <UInput
                  v-model="form.customer_phone"
                  placeholder="e.g. 0812345678"
                  size="md"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Section 2: Delivery & Payment Details -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <UIcon name="i-heroicons-truck" class="w-5 h-5 text-emerald-500" />
            {{ $t('orders.sec_delivery') || 'Delivery & Payment Details' }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Delivery Date (Default Today, Date Only) -->
            <UFormField :error="errors.delivery_date || undefined">
              <template #label>
                <span>{{ $t('orders.delivery_date') || 'Delivery Date' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <UInput
                v-model="form.delivery_date"
                type="date"
                size="md"
                class="w-full font-mono"
              />
            </UFormField>

            <!-- Payment Channel (Required, No Default) -->
            <UFormField :error="errors.payment_channel || undefined">
              <template #label>
                <span>{{ $t('orders.payment_channel') || 'Payment Channel' }}</span>
                <span class="text-red-500 font-bold ml-0.5">*</span>
              </template>
              <USelectMenu
                v-model="form.payment_channel"
                :items="paymentOptions"
                value-key="value"
                label-key="label"
                placeholder="Select payment channel..."
                size="md"
                class="w-full"
              />
            </UFormField>

            <!-- Order Status (Default Pending, Searchable Dropdown) -->
            <UFormField :label="$t('orders.status') || 'Order Status'">
              <USelectMenu
                v-model="form.status"
                :items="statusOptions"
                value-key="value"
                label-key="label"
                size="md"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Section 3: Package Items -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-gift" class="w-5 h-5 text-indigo-500" />
              <span>{{ $t('orders.sec_items') || 'Order Package Items' }}</span>
              <span class="text-red-500 font-bold ml-0.5">*</span>
            </h3>

            <!-- Package Search & Dropdown -->
            <div class="w-72">
              <USelectMenu
                v-model="selectedPackage"
                v-model:search-term="packageSearchQuery"
                :items="packageOptions"
                :placeholder="$t('orders.package_placeholder') || 'Type to search packages...'"
                size="sm"
                class="w-full"
                label-key="label"
                ignore-filter
                :loading="isSearchingPackages"
              />
            </div>
          </div>

          <!-- Empty Items State -->
          <div v-if="form.items.length === 0" class="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
            <UIcon name="i-heroicons-archive-box-x-mark" class="w-10 h-10 text-slate-400 mx-auto" />
            <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {{ $t('orders.no_items_placeholder') || 'No packages added yet. Use the package dropdown search above to add items.' }}
            </p>
          </div>

          <!-- Items Table -->
          <div v-else class="space-y-4">
            <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/30">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    <th class="px-4 py-3 text-left w-1/3">Package Name</th>
                    <th class="px-4 py-3 text-left w-24">Unit Price</th>
                    <th class="px-4 py-3 text-left w-20">Quantity</th>
                    <th class="px-4 py-3 text-left w-28">Subtotal</th>
                    <th class="px-4 py-3 text-left">Notes</th>
                    <th class="px-4 py-3 text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-for="(item, index) in form.items" :key="item.package_id">
                    <td class="px-4 py-3">
                      <div class="font-bold text-sm text-slate-900 dark:text-white">
                        {{ locale === 'th' ? (item.package_name_th || item.package_name_en) : (item.package_name_en || item.package_name_th) }}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <UInput
                        v-model.number="item.unit_price"
                        type="number"
                        disabled
                        size="xs"
                        class="w-24 font-bold font-mono bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <UInput
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        size="xs"
                        class="w-20 font-bold font-mono"
                      />
                    </td>
                    <td class="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      ฿{{ formatCurrency(item.subtotal) }}
                    </td>
                    <td class="px-4 py-3">
                      <UInput
                        v-model="item.notes"
                        placeholder="Item note..."
                        size="xs"
                        class="w-full"
                      />
                    </td>
                    <td class="px-4 py-3 text-center">
                      <UButton
                        type="button"
                        color="error"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        size="xs"
                        @click="removeItem(index)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Total Amount Bar -->
            <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
                {{ $t('orders.total_amount') || 'Total Amount' }}
              </span>
              <span class="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                ฿{{ formatCurrency(form.total_amount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Section 4: General Order Notes -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-amber-500" />
            {{ $t('orders.sec_notes') || 'Additional Notes' }}
          </h3>

          <UTextarea
            v-model="form.notes"
            :placeholder="$t('orders.notes_placeholder') || 'Optional special delivery instructions or order notes...'"
            rows="3"
            class="w-full"
          />
        </div>

        <!-- Action Buttons (Save Button with Check Icon) -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <UButton type="button" color="neutral" variant="ghost" @click="$emit('cancel')">
            {{ $t('common.cancel') || 'Cancel' }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            icon="i-heroicons-check"
            class="px-6 font-semibold"
            :loading="isLoading"
          >
            {{ $t('common.save') || 'Save Order' }}
          </UButton>
        </div>

      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Order, OrderFormData } from '../types'
import { calculateItemSubtotal, calculateOrderTotal, getTodayDateString, safeLowerCase } from '../composables/useOrderEngine'
import { useApiFetch } from '../../../composables/useApiFetch'
import { useAppToast } from '../../../composables/useAppToast'
import type { Customer } from '../../customer/types'
import type { Package } from '../../package/types'

const { t, locale } = useI18n()
const { apiFetch } = useApiFetch()
const { showError } = useAppToast()

const props = defineProps<{
  orderToEdit?: Order | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: OrderFormData): void
  (e: 'cancel'): void
}>()

// Form reactive state - Payment channel has NO DEFAULT value (required field), Status defaults to 'pending'
const form = reactive<OrderFormData>({
  customer_id: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  delivery_date: getTodayDateString(), // Default today date
  payment_channel: '', // No default value
  status: 'pending', // Default pending
  notes: '',
  total_amount: 0,
  items: []
})

// Validation errors
const errors = reactive({
  customer: '',
  customer_name: '',
  delivery_date: '',
  payment_channel: '',
  items: ''
})

// Search states for Customer Dropdown
const selectedCustomer = ref<any>(null)
const customerSearchQuery = ref('')
const customerOptions = ref<any[]>([])
const isSearchingCustomers = ref(false)

// Search states for Package Dropdown
const selectedPackage = ref<any>(null)
const packageSearchQuery = ref('')
const packageOptions = ref<any[]>([])
const isSearchingPackages = ref(false)

// Payment Channels (Strictly 3 options: Cash, Credit Card, Internet Banking)
const paymentOptions = computed(() => [
  { value: 'cash', label: t('orders.payment_cash') || 'Cash' },
  { value: 'credit_card', label: t('orders.payment_credit_card') || 'Credit Card' },
  { value: 'internet_banking', label: t('orders.payment_internet_banking') || 'Internet Banking' }
])

const statusOptions = computed(() => [
  { value: 'pending', label: t('orders.status_pending') || 'Pending' },
  { value: 'processing', label: t('orders.status_processing') || 'Processing' },
  { value: 'completed', label: t('orders.status_completed') || 'Completed' },
  { value: 'cancelled', label: t('orders.status_cancelled') || 'Cancelled' }
])

// Debounce helper
function debounce(fn: Function, delay = 300) {
  let timeoutId: any
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// Dynamic Customer API Query (Shows Customer Code + Name)
const fetchCustomerOptions = async (query: string) => {
  isSearchingCustomers.value = true
  try {
    const res = await apiFetch(`/api/v1/customers?search=${encodeURIComponent(query.toLowerCase())}&page=1&limit=10`)
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        customerOptions.value = json.data.map((c: Customer) => {
          const name = locale.value === 'th'
            ? `${c.first_name_th || ''} ${c.last_name_th || ''}`.trim() || c.first_name_en || c.email
            : `${c.first_name_en || ''} ${c.last_name_en || ''}`.trim() || c.email
          const displayLabel = c.code ? `[${c.code}] ${name}` : name
          return {
            id: c.id,
            label: displayLabel,
            name,
            email: c.email || '',
            phone: c.phone || ''
          }
        })
      } else {
        customerOptions.value = []
      }
    } else {
      customerOptions.value = []
    }
  } catch (err) {
    console.error('Error fetching customers:', err)
    customerOptions.value = []
  } finally {
    isSearchingCustomers.value = false
  }
}

const debouncedFetchCustomerOptions = debounce((query: string) => {
  fetchCustomerOptions(query)
}, 300)

watch(customerSearchQuery, (newVal) => {
  debouncedFetchCustomerOptions(newVal)
})

// On customer select, populate form customer details
watch(selectedCustomer, (val) => {
  if (val) {
    form.customer_id = val.id
    form.customer_name = val.name
    form.customer_email = val.email
    form.customer_phone = val.phone
  }
})

// Dynamic Package API Query
const fetchPackageOptions = async (query: string) => {
  isSearchingPackages.value = true
  try {
    const res = await apiFetch(`/api/v1/packages?search=${encodeURIComponent(query.toLowerCase())}&page=1&limit=10`)
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        packageOptions.value = json.data.map((p: Package) => ({
          id: p.id,
          label: locale.value === 'th' ? `${p.name_th} (฿${p.price})` : `${p.name_en} (฿${p.price})`,
          name_en: p.name_en,
          name_th: p.name_th,
          price: p.price
        }))
      } else {
        packageOptions.value = []
      }
    } else {
      packageOptions.value = []
    }
  } catch (err) {
    console.error('Error fetching packages:', err)
    packageOptions.value = []
  } finally {
    isSearchingPackages.value = false
  }
}

const debouncedFetchPackageOptions = debounce((query: string) => {
  fetchPackageOptions(query)
}, 300)

watch(packageSearchQuery, (newVal) => {
  debouncedFetchPackageOptions(newVal)
})

// On package select, add item to order items list
watch(selectedPackage, (val) => {
  if (val) {
    const existing = form.items.find(i => i.package_id === val.id)
    if (existing) {
      existing.quantity += 1
      existing.subtotal = calculateItemSubtotal(existing.quantity, existing.unit_price)
    } else {
      const unit_price = Number(val.price) || 0
      const quantity = 1
      form.items.push({
        package_id: val.id,
        quantity,
        unit_price,
        subtotal: calculateItemSubtotal(quantity, unit_price),
        notes: '',
        package_name_en: val.name_en,
        package_name_th: val.name_th
      })
    }
    recalculateOrderTotal()
    selectedPackage.value = null
  }
})

// Deep watcher on form.items to automatically recalculate item subtotals and total amount whenever quantity changes
watch(
  () => form.items,
  (newItems) => {
    if (Array.isArray(newItems)) {
      newItems.forEach(item => {
        item.subtotal = calculateItemSubtotal(item.quantity, item.unit_price)
      })
      form.total_amount = calculateOrderTotal(newItems)
    }
  },
  { deep: true }
)

// Helper methods
const recalculateOrderTotal = () => {
  form.total_amount = calculateOrderTotal(form.items)
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
  recalculateOrderTotal()
}

const formatCurrency = (val: number) => {
  return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Initial fetch for dropdown options on mount
onMounted(() => {
  fetchCustomerOptions('')
  fetchPackageOptions('')
})

// Watch editing prop to populate form on edit
watch(() => props.orderToEdit, (newVal) => {
  if (newVal) {
    form.customer_id = newVal.customer_id || ''
    form.customer_name = newVal.customer_name || ''
    form.customer_email = newVal.customer_email || ''
    form.customer_phone = newVal.customer_phone || ''
    form.delivery_date = newVal.delivery_date ? newVal.delivery_date.split('T')[0] : getTodayDateString()
    form.payment_channel = newVal.payment_channel ? newVal.payment_channel.toLowerCase() : ''
    form.status = (newVal.status || 'pending').toLowerCase()
    form.notes = newVal.notes || ''
    form.total_amount = newVal.total_amount || 0
    form.items = Array.isArray(newVal.items)
      ? newVal.items.map(item => ({
          package_id: item.package_id,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          subtotal: item.subtotal || calculateItemSubtotal(item.quantity || 1, item.unit_price || 0),
          notes: item.notes || '',
          package_name_en: item.package_name_en || (item as any).package?.name_en || (item as any).name_en || item.package_id,
          package_name_th: item.package_name_th || (item as any).package?.name_th || (item as any).name_th || item.package_id
        }))
      : []
    recalculateOrderTotal()
  }
}, { immediate: true })

// Form Submission with required field validation
const submitForm = () => {
  // Clear previous errors
  errors.customer = ''
  errors.customer_name = ''
  errors.delivery_date = ''
  errors.payment_channel = ''
  errors.items = ''

  let isValid = true

  if (!form.customer_name.trim()) {
    errors.customer_name = safeLowerCase(t('orders.err_customer_required') || 'please select or specify customer information')
    isValid = false
  }

  if (!form.delivery_date) {
    errors.delivery_date = safeLowerCase(t('orders.err_delivery_date_required') || 'delivery date is required')
    isValid = false
  }

  if (!form.payment_channel) {
    errors.payment_channel = safeLowerCase(t('orders.err_payment_channel_required') || 'please select a payment channel')
    isValid = false
  }

  if (form.items.length === 0) {
    const errMsg = safeLowerCase(t('orders.err_items_empty') || 'order must contain at least one package item')
    errors.items = errMsg
    showError(errMsg)
    isValid = false
  }

  for (let i = 0; i < form.items.length; i++) {
    if (form.items[i].quantity <= 0) {
      const errMsg = `${safeLowerCase(t('orders.err_quantity_invalid') || 'quantity must be greater than 0')} (row ${i + 1})`
      errors.items = errMsg
      showError(errMsg)
      isValid = false
      break
    }
  }

  if (!isValid) {
    return
  }

  recalculateOrderTotal()
  emit('save', {
    ...form,
    status: safeLowerCase(form.status || 'pending'),
    payment_channel: safeLowerCase(form.payment_channel)
  })
}
</script>
