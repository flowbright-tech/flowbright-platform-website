<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Title Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-building-storefront" class="w-7 h-7 text-amber-500" />
          {{ $t('vendors.title') }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('vendors.subtitle') }} • <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ activeTenant.name }}</span>
        </p>
      </div>
    </div>

    <!-- Search & Category Filter Controls -->
    <VendorFilter
      v-model:search-query="searchQuery"
      v-model:selected-category="selectedCategory"
      @open-create="handleOpenCreate"
    />

    <!-- Vendor Table & Pagination -->
    <VendorTable
      v-model:page="currentPage"
      :vendors="paginatedVendors"
      :total="totalFilteredCount"
      :page-size="pageSize"
      @edit="handleOpenEdit"
      @delete="handleOpenDelete"
    />

    <!-- Vendor Create / Edit Slideover Drawer -->
    <VendorDrawer
      v-model:is-open="isDrawerOpen"
      :vendor-to-edit="vendorToEdit"
      @save="handleSaveVendor"
    />

    <!-- Reusable Delete Confirmation Modal -->
    <ConfirmModal
      v-model:open="isDeleteModalOpen"
      :title="$t('vendors.confirm_delete_title')"
      :description="$t('vendors.confirm_delete_desc')"
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
import { useVendorEngine } from '../features/vendor/composables/useVendorEngine'
import VendorFilter from '../features/vendor/components/VendorFilter.vue'
import VendorTable from '../features/vendor/components/VendorTable.vue'
import VendorDrawer from '../features/vendor/components/VendorDrawer.vue'
import type { Vendor, VendorFormData } from '../features/vendor/types'

const { activeTenant } = useAuthEngine()
const {
  searchQuery,
  selectedCategory,
  currentPage,
  pageSize,
  paginatedVendors,
  totalFilteredCount,
  addVendor,
  updateVendor,
  deleteVendor
} = useVendorEngine()

const isDrawerOpen = ref(false)
const vendorToEdit = ref<Vendor | null>(null)

const isDeleteModalOpen = ref(false)
const vendorToDelete = ref<Vendor | null>(null)

const handleOpenCreate = () => {
  vendorToEdit.value = null
  isDrawerOpen.value = true
}

const handleOpenEdit = (vendor: Vendor) => {
  vendorToEdit.value = vendor
  isDrawerOpen.value = true
}

const handleOpenDelete = (vendor: Vendor) => {
  vendorToDelete.value = vendor
  isDeleteModalOpen.value = true
}

const confirmDelete = () => {
  if (vendorToDelete.value) {
    deleteVendor(vendorToDelete.value.id)
    vendorToDelete.value = null
    isDeleteModalOpen.value = false
  }
}

const handleSaveVendor = (data: VendorFormData, id?: string) => {
  if (id) {
    updateVendor(id, data)
  } else {
    addVendor(data)
  }
}
</script>
