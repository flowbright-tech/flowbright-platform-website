<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Title Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-cog-8-tooth" class="w-7 h-7 text-indigo-500" />
          {{ $t('boms.title') || 'Bill of Materials (BOM)' }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('boms.subtitle') || 'Create, update, and monitor Bill of Materials specifications' }}
        </p>
      </div>
    </div>

    <!-- Error Alert banner if fetch fails -->
    <UAlert
      v-if="errorMsg"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to Load BOMs"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Search & Filter Controls -->
    <BomFilter
      v-model:search-query="searchQuery"
      @open-create="handleOpenCreate"
    />

    <!-- Premium Skeleton Loader for async data fetching -->
    <div v-if="isLoading" class="space-y-4">
      <UCard class="glass-panel overflow-hidden animate-pulse" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
        <div class="p-6 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div class="w-1/4">
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="w-1/4">
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="w-1/12">
              <USkeleton class="h-4 w-10" />
            </div>
            <div class="w-1/12">
              <USkeleton class="h-4 w-12" />
            </div>
            <div class="w-1/12 text-right">
              <USkeleton class="h-4 w-10 ml-auto" />
            </div>
          </div>

          <div v-for="n in 5" :key="n" class="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div class="w-1/4">
              <USkeleton class="h-4 w-4/5" />
            </div>
            <div class="w-1/4">
              <USkeleton class="h-4 w-3/4" />
            </div>
            <div class="w-1/12">
              <USkeleton class="h-5 w-8 rounded-md" />
            </div>
            <div class="w-1/12">
              <USkeleton class="h-4 w-12" />
            </div>
            <div class="w-1/12 flex items-center justify-end gap-2">
              <USkeleton class="h-8 w-8 rounded-md" />
              <USkeleton class="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- BOM Table & Pagination -->
    <BomTable
      v-else
      v-model:page="currentPage"
      :boms="paginatedBoms"
      :total="totalFilteredCount"
      :page-size="pageSize"
      @edit="handleOpenEdit"
      @delete="handleOpenDelete"
    />

    <!-- Reusable Delete Confirmation Modal -->
    <ConfirmModal
      v-model:open="isDeleteModalOpen"
      :title="$t('boms.confirm_delete_title') || 'Confirm BOM Deletion'"
      :description="$t('boms.confirm_delete_desc') || 'Are you sure you want to permanently delete this BOM? Assembly orders referencing this recipe may fail.'"
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
import { useBomEngine } from '../../features/bom/composables/useBomEngine'
import BomFilter from '../../features/bom/components/BomFilter.vue'
import BomTable from '../../features/bom/components/BomTable.vue'
import ConfirmModal from '../../components/app/ConfirmModal.vue'
import { useAppToast } from '../../composables/useAppToast'
import type { Bom } from '../../features/bom/types'

const router = useRouter()
const localePath = useLocalePath()
const {
  searchQuery,
  currentPage,
  pageSize,
  isLoading,
  errorMsg,
  fetchBoms,
  paginatedBoms,
  totalFilteredCount,
  deleteBom
} = useBomEngine()
const { showSuccess } = useAppToast()

const isDeleteModalOpen = ref(false)
const bomToDelete = ref<Bom | null>(null)

onMounted(async () => {
  await fetchBoms()
})

const handleOpenCreate = () => {
  router.push(localePath('/boms/new'))
}

const handleOpenEdit = (bom: Bom) => {
  router.push(localePath(`/boms/${bom.id}`))
}

const handleOpenDelete = (bom: Bom) => {
  bomToDelete.value = bom
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (bomToDelete.value) {
    try {
      await deleteBom(bomToDelete.value.id)
      searchQuery.value = ''
      showSuccess('delete', 'BOM')
      bomToDelete.value = null
      isDeleteModalOpen.value = false
    } catch (err) {
      // Handled in composable
    }
  }
}
</script>
