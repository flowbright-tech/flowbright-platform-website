<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/packages')" class="hover:text-indigo-600 transition-colors">
        {{ $t('packages.title') || 'Packages' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('packages.form_title_new') || 'Add New Package' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-gift" class="w-7 h-7 text-indigo-500" />
        {{ $t('packages.form_title_new') || 'Add New Package' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('packages.form_subtitle_new') || 'Create a new package with bundling products and special price' }}
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
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { usePackageEngine } from '../../features/package/composables/usePackageEngine'
import { useAppToast } from '../../composables/useAppToast'
import PackageForm from '../../features/package/components/PackageForm.vue'
import type { PackageFormData } from '../../features/package/types'

const router = useRouter()
const localePath = useLocalePath()
const { addPackage, isLoading, errorMsg } = usePackageEngine()
const { showSuccess } = useAppToast()

const handleSave = async (data: PackageFormData) => {
  try {
    await addPackage(data)
    showSuccess('create', 'Package')
    router.push(localePath('/packages'))
  } catch (e) {
    // Handled in composable
  }
}

const handleCancel = () => {
  router.push(localePath('/packages'))
}
</script>
