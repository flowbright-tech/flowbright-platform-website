<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/categories')" class="hover:text-indigo-600 transition-colors">
        {{ $t('categories.title') || 'Categories' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('categories.form_title_new') || 'Add New Category' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-tag" class="w-7 h-7 text-indigo-500" />
        {{ $t('categories.form_title_new') || 'Add New Category' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('categories.form_subtitle_new') || 'Create a new category node in your inventory classification tree' }}
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

    <!-- Category Form -->
    <CategoryForm
      :is-loading="isLoading"
      :all-categories="allCategories"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useCategoryEngine } from '../../features/category/composables/useCategoryEngine'
import { useAppToast } from '../../composables/useAppToast'
import CategoryForm from '../../features/category/components/CategoryForm.vue'
import type { CategoryFormData } from '../../features/category/types'

const router = useRouter()
const localePath = useLocalePath()
const { addCategory, isLoading, errorMsg, allCategories, fetchAllCategories } = useCategoryEngine()
const { showSuccess } = useAppToast()

onMounted(async () => {
  await fetchAllCategories()
})

const handleSave = async (data: CategoryFormData) => {
  try {
    await addCategory(data)
    showSuccess('create', 'Category')
    router.push(localePath('/categories'))
  } catch (e) {
    // Handled in composable
  }
}

const handleCancel = () => {
  router.push(localePath('/categories'))
}
</script>
