<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/customers')" class="hover:text-indigo-600 transition-colors">
        {{ $t('customers.title') }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('customers.form_title_new') }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-user-plus" class="w-7 h-7 text-indigo-500" />
        {{ $t('customers.form_title_new') }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('customers.form_subtitle_new') }}
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

    <!-- Customer Form -->
    <CustomerForm
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useCustomerEngine } from '../../features/customer/composables/useCustomerEngine'
import { useAppToast } from '../../composables/useAppToast'
import CustomerForm from '../../features/customer/components/CustomerForm.vue'
import type { CustomerFormData } from '../../features/customer/types'

const router = useRouter()
const localePath = useLocalePath()
const { addCustomer, isLoading, errorMsg } = useCustomerEngine()
const { showSuccess } = useAppToast()

const handleSave = async (data: CustomerFormData) => {
  try {
    await addCustomer(data)
    showSuccess('create', 'Customer')
    router.push(localePath('/customers'))
  } catch (e) {
    // Handled in composable errorMsg
  }
}

const handleCancel = () => {
  router.push(localePath('/customers'))
}
</script>
