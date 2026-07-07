<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/categories')" class="hover:text-indigo-600 transition-colors">
        {{ $t('categories.title') || 'Categories' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('categories.form_title_edit') || 'Edit Category' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-pencil-square" class="w-7 h-7 text-indigo-500" />
        {{ $t('categories.form_title_edit') || 'Edit Category' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('categories.form_subtitle_edit') || 'Update category classifications, properties, and sorting parameters' }}
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
      v-if="category"
      :category-to-edit="category"
      :all-categories="allCategories"
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
import { useCategoryEngine } from '../../features/category/composables/useCategoryEngine'
import { useAppToast } from '../../composables/useAppToast'
import CategoryForm from '../../features/category/components/CategoryForm.vue'
import type { Category, CategoryFormData } from '../../features/category/types'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { fetchCategoryById, updateCategory, isLoading, errorMsg, allCategories, fetchAllCategories } = useCategoryEngine()
const { showSuccess } = useAppToast()

const category = ref<Category | null>(null)

onMounted(async () => {
  const categoryId = String(route.params.id)
  await fetchAllCategories()
  const fetched = await fetchCategoryById(categoryId)
  if (fetched) {
    category.value = fetched
  } else {
    // If not found, send back to list
    router.push(localePath('/categories'))
  }
})

const handleSave = async (data: CategoryFormData) => {
  if (category.value) {
    try {
      await updateCategory(category.value.id, data)
      showSuccess('update', 'Category')
      router.push(localePath('/categories'))
    } catch (e) {
      // Handled in composable
    }
  }
}

const handleCancel = () => {
  router.push(localePath('/categories'))
}
</script>
