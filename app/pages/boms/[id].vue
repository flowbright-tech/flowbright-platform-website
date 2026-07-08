<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/boms')" class="hover:text-primary-600 transition-colors">
        {{ $t('boms.title') || 'Bill of Materials' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('boms.form_title_edit') || 'Edit BOM' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-pencil-square" class="w-7 h-7 text-emerald-500" />
        {{ $t('boms.form_title_edit') || 'Edit BOM' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('boms.form_subtitle_edit') || 'Modify Bill of Materials items and versioning' }}
      </p>
    </div>

    <!-- Error Alert banner if form fails -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
      title="Form Error"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- BOM Form -->
    <BomForm
      v-if="bom"
      :category-to-edit="bom"
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <!-- Skeleton Loader while fetching details -->
    <div v-else-if="isLoading" class="space-y-6 max-w-5xl mx-auto">
      <UCard class="glass-panel animate-pulse p-6 sm:p-8 space-y-6">
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-10 w-full rounded-lg" />
          </div>
          <div class="space-y-2">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-10 w-full rounded-lg" />
          </div>
          <div class="space-y-2">
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div class="space-y-2">
          <USkeleton class="h-4 w-28" />
          <USkeleton class="h-24 w-full rounded-lg" />
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
import { useBomEngine } from '../../features/bom/composables/useBomEngine'
import { useAppToast } from '../../composables/useAppToast'
import BomForm from '../../features/bom/components/BomForm.vue'
import type { Bom, BomFormData } from '../../features/bom/types'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { fetchBomById, updateBom, isLoading, errorMsg } = useBomEngine()
const { showSuccess } = useAppToast()

const bom = ref<Bom | null>(null)

onMounted(async () => {
  const bomId = String(route.params.id)
  const fetched = await fetchBomById(bomId)
  if (fetched) {
    bom.value = fetched
  } else {
    router.push(localePath('/boms'))
  }
})

const handleSave = async (data: BomFormData) => {
  if (bom.value) {
    try {
      await updateBom(bom.value.id, data)
      showSuccess('update', 'BOM')
      router.push(localePath('/boms'))
    } catch (e) {
      // Handled in composable
    }
  }
}

const handleCancel = () => {
  router.push(localePath('/boms'))
}
</script>
