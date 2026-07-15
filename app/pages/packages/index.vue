<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Title Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-gift" class="w-7 h-7 text-indigo-500" />
          {{ $t('packages.title') || 'Package Master' }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('packages.subtitle') || 'Configure multi-pack bundling and commercial packaging metrics' }}
        </p>
      </div>
    </div>

    <!-- Error Alert banner if fetch fails -->
    <UAlert
      v-if="errorMsg"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to Load Packages"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Search & Filter Controls -->
    <PackageFilter
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

    <!-- Packages Table -->
    <PackageTable
      v-else
      v-model:page="currentPage"
      :packages="paginatedPackages"
      :total="totalFilteredCount"
      :page-size="pageSize"
      @edit="handleOpenEdit"
      @delete="handleOpenDelete"
    />

    <!-- Reusable Delete Confirmation Modal -->
    <ConfirmModal
      v-model:open="isDeleteModalOpen"
      :title="$t('packages.confirm_delete_title') || 'Confirm Package Deletion'"
      :description="$t('packages.confirm_delete_desc') || 'Are you sure you want to permanently delete this package? This action cannot be undone.'"
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
import { usePackageEngine } from '../../features/package/composables/usePackageEngine'
import PackageFilter from '../../features/package/components/PackageFilter.vue'
import PackageTable from '../../features/package/components/PackageTable.vue'
import ConfirmModal from '../../components/app/ConfirmModal.vue'
import { useAppToast } from '../../composables/useAppToast'
import type { Package } from '../../features/package/types'

const router = useRouter()
const localePath = useLocalePath()
const {
  searchQuery,
  currentPage,
  pageSize,
  isLoading,
  errorMsg,
  fetchPackages,
  paginatedPackages,
  totalFilteredCount,
  deletePackage
} = usePackageEngine()
const { showSuccess } = useAppToast()

const isDeleteModalOpen = ref(false)
const packageToDelete = ref<Package | null>(null)

onMounted(async () => {
  await fetchPackages()
})

const handleOpenCreate = () => {
  router.push(localePath('/packages/new'))
}

const handleOpenEdit = (pkg: Package) => {
  router.push(localePath(`/packages/${pkg.id}`))
}

const handleOpenDelete = (pkg: Package) => {
  packageToDelete.value = pkg
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (packageToDelete.value) {
    try {
      await deletePackage(packageToDelete.value.id)
      searchQuery.value = ''
      showSuccess('delete', 'Package')
      packageToDelete.value = null
      isDeleteModalOpen.value = false
    } catch (err) {
      // Handled in composable
    }
  }
}
</script>
