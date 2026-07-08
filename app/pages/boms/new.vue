<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/boms')" class="hover:text-primary-600 transition-colors">
        {{ $t('boms.title') || 'Bill of Materials' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('boms.form_title_new') || 'Add New BOM' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-cog-8-tooth" class="w-7 h-7 text-emerald-500" />
        {{ $t('boms.form_title_new') || 'Add New BOM' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('boms.form_subtitle_new') || 'Register a new Bill of Materials recipe' }}
      </p>
    </div>

    <!-- Error Alert banner if form fails -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
      title="Form Submission Error"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- BOM Form -->
    <BomForm
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useBomEngine } from '../../features/bom/composables/useBomEngine'
import { useAppToast } from '../../composables/useAppToast'
import BomForm from '../../features/bom/components/BomForm.vue'
import type { BomFormData } from '../../features/bom/types'

const router = useRouter()
const localePath = useLocalePath()
const { addBom, isLoading, errorMsg } = useBomEngine()
const { showSuccess } = useAppToast()

const handleSave = async (data: BomFormData) => {
  try {
    await addBom(data)
    showSuccess('create', 'BOM')
    router.push(localePath('/boms'))
  } catch (e) {
    // Handled in composable
  }
}

const handleCancel = () => {
  router.push(localePath('/boms'))
}
</script>
