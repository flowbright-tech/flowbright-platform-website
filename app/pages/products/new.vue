<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/products')" class="hover:text-primary-600 transition-colors">
        {{ $t('products.title') || 'Products' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('products.form_title_new') || 'Add New Product' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-shopping-bag" class="w-7 h-7 text-emerald-500" />
        {{ $t('products.form_title_new') || 'Add New Product' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('products.form_subtitle_new') || 'Register a new product in the Master file database' }}
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

    <!-- Product Form -->
    <ProductForm
      :is-loading="isLoading"
      :categories="allCategories"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useProductEngine } from '../../features/product/composables/useProductEngine'
import { useCategoryEngine } from '../../features/category/composables/useCategoryEngine'
import { useAppToast } from '../../composables/useAppToast'
import ProductForm from '../../features/product/components/ProductForm.vue'
import type { ProductFormData } from '../../features/product/types'

const router = useRouter()
const localePath = useLocalePath()
const { addProduct, isLoading, errorMsg } = useProductEngine()
const { allCategories, fetchAllCategories } = useCategoryEngine()
const { showSuccess } = useAppToast()

onMounted(async () => {
  await fetchAllCategories()
})

const handleSave = async (data: ProductFormData) => {
  try {
    await addProduct(data)
    showSuccess('create', 'Product')
    router.push(localePath('/products'))
  } catch (e) {
    // Handled in composable
  }
}

const handleCancel = () => {
  router.push(localePath('/products'))
}
</script>
