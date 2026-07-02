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

    <!-- Search & Filter Controls -->
    <CustomerFilter
      v-model:search-query="searchQuery"
      v-model:selected-segment="selectedSegment"
      v-model:selected-status="selectedStatus"
      @open-create="handleOpenCreate"
    />

    <!-- Customer Table & Pagination -->
    <CustomerTable
      v-model:page="currentPage"
      :customers="paginatedCustomers"
      :total="totalFilteredCount"
      :page-size="pageSize"
      @edit="handleOpenEdit"
      @delete="handleOpenDelete"
    />

    <!-- Customer Create / Edit Slideover Drawer -->
    <CustomerDrawer
      v-model:is-open="isDrawerOpen"
      :customer-to-edit="customerToEdit"
      @save="handleSaveCustomer"
    />

    <!-- Reusable Delete Confirmation Modal -->
    <ConfirmModal
      v-model:open="isDeleteModalOpen"
      :title="$t('customers.confirm_delete_title')"
      :description="$t('customers.confirm_delete_desc')"
      confirm-color="rose"
      confirm-icon="i-heroicons-trash"
      :confirm-text="$t('common.delete')"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useCustomerEngine } from '../features/customer/composables/useCustomerEngine'
import CustomerFilter from '../features/customer/components/CustomerFilter.vue'
import CustomerTable from '../features/customer/components/CustomerTable.vue'
import CustomerDrawer from '../features/customer/components/CustomerDrawer.vue'
import type { Customer, CustomerFormData } from '../features/customer/types'

const { activeTenant } = useAuthEngine()
const {
  searchQuery,
  selectedSegment,
  selectedStatus,
  currentPage,
  pageSize,
  paginatedCustomers,
  totalFilteredCount,
  addCustomer,
  updateCustomer,
  deleteCustomer
} = useCustomerEngine()

const isDrawerOpen = ref(false)
const customerToEdit = ref<Customer | null>(null)

const isDeleteModalOpen = ref(false)
const customerToDelete = ref<Customer | null>(null)

const handleOpenCreate = () => {
  customerToEdit.value = null
  isDrawerOpen.value = true
}

const handleOpenEdit = (customer: Customer) => {
  customerToEdit.value = customer
  isDrawerOpen.value = true
}

const handleOpenDelete = (customer: Customer) => {
  customerToDelete.value = customer
  isDeleteModalOpen.value = true
}

const confirmDelete = () => {
  if (customerToDelete.value) {
    deleteCustomer(customerToDelete.value.id)
    customerToDelete.value = null
    isDeleteModalOpen.value = false
  }
}

const handleSaveCustomer = (data: CustomerFormData, id?: string) => {
  if (id) {
    updateCustomer(id, data)
  } else {
    addCustomer(data)
  }
}
</script>
