<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Non-Admin Permission Restriction Banner -->
    <div v-if="!isAdmin" class="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-4 shadow-sm">
      <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-amber-500 mx-auto" />
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">
        {{ locale === 'th' ? 'ไม่มีสิทธิ์เข้าถึงส่วนนี้' : 'Access Restricted' }}
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {{ locale === 'th' ? 'การจัดการสูตรประกอบ/BOM สงวนสิทธิ์เฉพาะผู้ใช้งานระดับ Admin เท่านั้น' : 'BOM management is restricted to Admin users only.' }}
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
                <USkeleton class="h-4 w-4/5" />
              </div>
              <div class="w-1/12">
                <USkeleton class="h-5 w-14 rounded-md" />
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
        :description="$t('boms.confirm_delete_desc') || 'Are you sure you want to permanently delete this Bill of Materials specification?'"
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
import { useBomEngine } from '../../features/bom/composables/useBomEngine'
import BomFilter from '../../features/bom/components/BomFilter.vue'
import BomTable from '../../features/bom/components/BomTable.vue'
import ConfirmModal from '../../components/app/ConfirmModal.vue'
import { useAppToast } from '../../composables/useAppToast'
import type { Bom } from '../../features/bom/types'

const router = useRouter()
const localePath = useLocalePath()
const { locale } = useI18n()
const { isAdmin } = useAuthEngine()
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
  if (isAdmin.value) {
    await fetchBoms()
  }
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
