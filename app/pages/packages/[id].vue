<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/packages')" class="hover:text-indigo-600 transition-colors">
        {{ $t('packages.title') || 'Packages' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('packages.form_title_edit') || 'Edit Package' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-pencil-square" class="w-7 h-7 text-indigo-500" />
        {{ $t('packages.form_title_edit') || 'Edit Package' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('packages.form_subtitle_edit') || 'Update package details, pricing, and product quantities' }}
      </p>
    </div>

    <!-- Error Alert banner if fetch fails -->
    <UAlert
      v-if="errorMsg"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Form Error"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Package Form -->
    <PackageForm
      v-if="pkg"
      :package-to-edit="pkg"
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <!-- Skeleton Loader while fetching details -->
    <div v-else-if="isLoading" class="space-y-6 max-w-4xl mx-auto">
      <UCard class="glass-panel animate-pulse p-6 sm:p-8 space-y-6">
        <div class="space-y-2">
          <USkeleton class="h-4 w-28" />
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>
        <div class="space-y-2">
          <USkeleton class="h-4 w-28" />
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>
        <div class="flex gap-4">
          <USkeleton class="h-10 w-24 rounded-lg" />
          <USkeleton class="h-10 w-24 rounded-lg ml-auto" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLocalePath } from '#imports'
import { usePackageEngine } from '../../features/package/composables/usePackageEngine'
import { useAppToast } from '../../composables/useAppToast'
import PackageForm from '../../features/package/components/PackageForm.vue'
import type { Package, PackageFormData } from '../../features/package/types'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { fetchPackageById, updatePackage, isLoading, errorMsg } = usePackageEngine()
const { showSuccess } = useAppToast()

const pkg = ref<Package | null>(null)

onMounted(async () => {
  const packageId = String(route.params.id)
  const fetched = await fetchPackageById(packageId)
  if (fetched) {
    pkg.value = fetched
  } else {
    router.push(localePath('/packages'))
  }
})

const handleSave = async (data: PackageFormData) => {
  if (pkg.value) {
    try {
      await updatePackage(pkg.value.id, data)
      showSuccess('update', 'Package')
      router.push(localePath('/packages'))
    } catch (e) {
      // Handled in composable
    }
  }
}

const handleCancel = () => {
  router.push(localePath('/packages'))
}
</script>
