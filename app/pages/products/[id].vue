<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/products')" class="hover:text-primary-600 transition-colors">
        {{ $t('products.title') || 'Products' }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('products.form_title_edit') || 'Edit Product' }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-pencil-square" class="w-7 h-7 text-emerald-500" />
        {{ $t('products.form_title_edit') || 'Edit Product' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('products.form_subtitle_edit') || 'Modify product parameters, stock levels, and analytical properties' }}
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

    <!-- Product Form -->
    <ProductForm
      v-if="product"
      :category-to-edit="product"
      :categories="allCategories"
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
import { useProductEngine } from '../../features/product/composables/useProductEngine'
import { useCategoryEngine } from '../../features/category/composables/useCategoryEngine'
import { useAppToast } from '../../composables/useAppToast'
import ProductForm from '../../features/product/components/ProductForm.vue'
import type { Product, ProductFormData } from '../../features/product/types'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { fetchProductById, updateProduct, isLoading, errorMsg } = useProductEngine()
const { allCategories, fetchAllCategories } = useCategoryEngine()
const { showSuccess } = useAppToast()

const product = ref<Product | null>(null)

onMounted(async () => {
  const productId = String(route.params.id)
  await fetchAllCategories()
  const fetched = await fetchProductById(productId)
  if (fetched) {
    product.value = fetched
  } else {
    router.push(localePath('/products'))
  }
})

const handleSave = async (data: ProductFormData) => {
  if (product.value) {
    try {
      await updateProduct(product.value.id, data)
      showSuccess('update', 'Product')
      router.push(localePath('/products'))
    } catch (e) {
      // Handled in composable
    }
  }
}

const handleCancel = () => {
  router.push(localePath('/products'))
}
</script>
