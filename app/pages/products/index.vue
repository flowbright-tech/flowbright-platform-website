<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Non-Admin Permission Restriction Banner -->
    <div v-if="!isAdmin" class="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-4 shadow-sm">
      <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-amber-500 mx-auto" />
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">
        {{ locale === 'th' ? 'ไม่มีสิทธิ์เข้าถึงส่วนนี้' : 'Access Restricted' }}
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {{ locale === 'th' ? 'การจัดการข้อมูลสินค้า/รายการตรวจหลัก สงวนสิทธิ์เฉพาะผู้ใช้งานระดับ Admin เท่านั้น' : 'Product and Test Master management is restricted to Admin users only.' }}
      </p>
      <UButton color="neutral" variant="outline" :to="localePath('/')" class="font-bold">
        {{ locale === 'th' ? 'กลับไปยังหน้าแรก' : 'Return to Dashboard' }}
      </UButton>
    </div>

    <!-- Admin Content -->
    <template v-else>
      <!-- Page Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UIcon :name="isLab ? 'i-heroicons-beaker' : 'i-heroicons-shopping-bag'" class="w-7 h-7 text-emerald-500" />
            {{ title }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Error Alert banner if fetch fails -->
      <UAlert
        v-if="errorMsg"
        color="red"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        title="Failed to Load Data"
        :description="errorMsg"
        class="mb-6"
      />

      <!-- Search & Filter Controls -->
      <ProductFilter
        v-model:search-query="searchQuery"
        @open-create="handleOpenCreate"
      />

      <!-- Premium Skeleton Loader for async data fetching -->
      <div v-if="isLoading" class="space-y-4">
        <UCard class="glass-panel overflow-hidden animate-pulse" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
          <div class="p-6 space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div class="w-1/12">
                <USkeleton class="h-8 w-8 rounded-lg" />
              </div>
              <div class="w-1/4">
                <USkeleton class="h-4 w-28" />
              </div>
              <div class="w-1/4">
                <USkeleton class="h-4 w-28" />
              </div>
              <div class="w-1/12">
                <USkeleton class="h-4 w-12" />
              </div>
              <div class="w-1/12">
                <USkeleton class="h-4 w-10" />
              </div>
              <div class="w-1/12 text-right">
                <USkeleton class="h-4 w-10 ml-auto" />
              </div>
            </div>

            <div v-for="n in 5" :key="n" class="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div class="w-1/12">
                <USkeleton class="h-10 w-10 rounded-lg shrink-0" />
              </div>
              <div class="w-1/4">
                <USkeleton class="h-4 w-4/5" />
              </div>
              <div class="w-1/4">
                <USkeleton class="h-4 w-4/5" />
              </div>
              <div class="w-1/12">
                <USkeleton class="h-5 w-14 rounded-md" />
              </div>
              <div class="w-1/12">
                <USkeleton class="h-4 w-8" />
              </div>
              <div class="w-1/12 flex items-center justify-end gap-2">
                <USkeleton class="h-8 w-8 rounded-md" />
                <USkeleton class="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Product Table & Pagination -->
      <ProductTable
        v-else
        v-model:page="currentPage"
        :products="paginatedProducts"
        :total="totalFilteredCount"
        :page-size="pageSize"
        @edit="handleOpenEdit"
        @delete="handleOpenDelete"
      />

      <!-- Reusable Delete Confirmation Modal -->
      <ConfirmModal
        v-model:open="isDeleteModalOpen"
        :title="confirmDeleteTitle"
        :description="confirmDeleteDesc"
        confirm-color="primary"
        confirm-icon="i-heroicons-trash"
        :confirm-text="$t('common.delete')"
        @confirm="confirmDelete"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'
import { useAuthEngine } from '../../features/auth/composables/useAuthEngine'
import { useDomainLabels } from '../../composables/useDomainLabels'
import { useProductEngine } from '../../features/product/composables/useProductEngine'
import ProductFilter from '../../features/product/components/ProductFilter.vue'
import ProductTable from '../../features/product/components/ProductTable.vue'
import ConfirmModal from '../../components/app/ConfirmModal.vue'
import { useAppToast } from '../../composables/useAppToast'
import type { Product } from '../../features/product/types'

const router = useRouter()
const localePath = useLocalePath()
const { locale } = useI18n()
const { isAdmin } = useAuthEngine()
const { title, subtitle, isLab, confirmDeleteTitle, confirmDeleteDesc } = useDomainLabels()
const {
  searchQuery,
  currentPage,
  pageSize,
  isLoading,
  errorMsg,
  fetchProducts,
  paginatedProducts,
  totalFilteredCount,
  deleteProduct
} = useProductEngine()
const { showSuccess } = useAppToast()

const isDeleteModalOpen = ref(false)
const productToDelete = ref<Product | null>(null)

onMounted(async () => {
  if (isAdmin.value) {
    await fetchProducts()
  }
})

const handleOpenCreate = () => {
  router.push(localePath('/products/new'))
}

const handleOpenEdit = (product: Product) => {
  router.push(localePath(`/products/${product.id}`))
}

const handleOpenDelete = (product: Product) => {
  productToDelete.value = product
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (productToDelete.value) {
    try {
      await deleteProduct(productToDelete.value.id)
      searchQuery.value = ''
      showSuccess('delete', isLab.value ? 'Test' : 'Product')
      productToDelete.value = null
      isDeleteModalOpen.value = false
    } catch (err) {
      // Handled in composable
    }
  }
}
</script>
