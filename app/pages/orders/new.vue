<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Breadcrumb Header -->
    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <NuxtLink :to="localePath('/orders')" class="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium">
        <UIcon name="i-heroicons-clipboard-document-check" class="w-4 h-4" />
        <span>{{ $t('orders.title') || 'Order Management' }}</span>
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5 text-slate-400" />
      <span class="text-slate-900 dark:text-white font-bold">{{ $t('orders.form_title_new') || 'Create New Order' }}</span>
    </div>

    <!-- Title & Description -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-plus-circle" class="w-7 h-7 text-indigo-500" />
        {{ $t('orders.form_title_new') || 'Create New Order' }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('orders.form_subtitle_new') || 'Fill in customer details, select delivery date, and add package items' }}
      </p>
    </div>

    <!-- Error Alert if save fails -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to Save Order"
      :description="errorMsg"
      class="mb-6"
    />

    <!-- Order Form -->
    <OrderForm
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'
import { useOrderEngine } from '../../features/order/composables/useOrderEngine'
import type { OrderFormData } from '../../features/order/types'
import OrderForm from '../../features/order/components/OrderForm.vue'
import { useAppToast } from '../../composables/useAppToast'

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { showSuccess, showError } = useAppToast()

const { addOrder, isLoading, errorMsg } = useOrderEngine()

const handleSave = async (formData: OrderFormData) => {
  try {
    const newOrder = await addOrder(formData)
    if (newOrder) {
      showSuccess(t('common.save_success') || 'Order created successfully')
      router.push(localePath('/orders'))
    }
  } catch (err: any) {
    showError(err.message || t('common.save_failed') || 'Failed to create order')
  }
}

const handleCancel = () => {
  router.push(localePath('/orders'))
}
</script>
