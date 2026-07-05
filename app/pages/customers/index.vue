<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Title Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-user-group" class="w-7 h-7 text-indigo-500" />
          {{ $t('customers.title') }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('customers.subtitle') }} • <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ activeTenant.name }}</span>
        </p>
      </div>
    </div>

    <!-- Error Alert banner if fetch fails -->
    <UAlert
      v-if="errorMsg"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to Load Customers"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Search & Filter Controls -->
    <CustomerFilter
      v-model:search-query="searchQuery"
      @open-create="handleOpenCreate"
    />

    <!-- Premium Skeleton Loader for async data fetching -->
    <div v-if="isLoading" class="space-y-4">
      <UCard class="glass-panel overflow-hidden animate-pulse" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
        <div class="p-6 space-y-6">
          <!-- Mock Table Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div class="w-1/3 flex items-center gap-3">
              <USkeleton class="h-4 w-20" />
            </div>
            <div class="w-1/4">
              <USkeleton class="h-4 w-24" />
            </div>
            <div class="w-1/6">
              <USkeleton class="h-4 w-16" />
            </div>
            <div class="w-1/6">
              <USkeleton class="h-4 w-16" />
            </div>
            <div class="w-1/12 text-right">
              <USkeleton class="h-4 w-10 ml-auto" />
            </div>
          </div>

          <!-- Pulsating Mock Table Rows -->
          <div v-for="n in 5" :key="n" class="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div class="w-1/3 flex items-center gap-3">
              <USkeleton class="h-9 w-9 rounded-lg shrink-0" />
              <div class="space-y-2 w-full">
                <USkeleton class="h-4 w-4/5" />
                <USkeleton class="h-3.5 w-3/5" />
              </div>
            </div>

            <div class="w-1/4">
              <USkeleton class="h-4 w-4/5" />
            </div>

            <div class="w-1/6">
              <USkeleton class="h-5 w-16 rounded-md" />
            </div>

            <div class="w-1/6">
              <USkeleton class="h-5 w-20 rounded-full" />
            </div>

            <div class="w-1/12 flex items-center justify-end gap-2">
              <USkeleton class="h-8 w-8 rounded-md" />
              <USkeleton class="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Customer Table & Pagination -->
    <CustomerTable
      v-else
      v-model:page="currentPage"
      :customers="paginatedCustomers"
      :total="totalFilteredCount"
      :page-size="pageSize"
      @edit="handleOpenEdit"
      @delete="handleOpenDelete"
    />

    <!-- Reusable Delete Confirmation Modal -->
    <ConfirmModal
      v-model:open="isDeleteModalOpen"
      :title="$t('customers.confirm_delete_title')"
      :description="$t('customers.confirm_delete_desc')"
      confirm-color="primary"
      confirm-icon="i-heroicons-trash"
      :confirm-text="$t('common.delete')"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useAuthEngine } from '../../features/auth/composables/useAuthEngine.ts'
import { useCustomerEngine } from '../../features/customer/composables/useCustomerEngine.ts'
import CustomerFilter from '../../features/customer/components/CustomerFilter.vue'
import CustomerTable from '../../features/customer/components/CustomerTable.vue'
import ConfirmModal from '../../components/app/ConfirmModal.vue'
import { useAppToast } from '../../composables/useAppToast'
import type { Customer } from '../../features/customer/types.ts'

const router = useRouter()
const localePath = useLocalePath()
const { activeTenant } = useAuthEngine()
const {
  searchQuery,
  currentPage,
  pageSize,
  isLoading,
  errorMsg,
  fetchCustomers,
  paginatedCustomers,
  totalFilteredCount,
  deleteCustomer
} = useCustomerEngine()
const { showSuccess } = useAppToast()

const isDeleteModalOpen = ref(false)
const customerToDelete = ref<Customer | null>(null)

onMounted(async () => {
  await fetchCustomers()
})

const handleOpenCreate = () => {
  router.push(localePath('/customers/new'))
}

const handleOpenEdit = (customer: Customer) => {
  router.push(localePath(`/customers/${customer.id}`))
}

const handleOpenDelete = (customer: Customer) => {
  customerToDelete.value = customer
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (customerToDelete.value) {
    try {
      await deleteCustomer(customerToDelete.value.id)
      searchQuery.value = '' // Clear all search on delete
      showSuccess('delete', 'Customer')
      customerToDelete.value = null
      isDeleteModalOpen.value = false
    } catch (err) {
      // Handled by composable's errorMsg ref
    }
  }
}
</script>
