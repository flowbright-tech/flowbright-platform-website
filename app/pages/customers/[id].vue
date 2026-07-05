<template>
  <div class="space-y-6">
    <!-- Breadcrumb / Header -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <NuxtLink :to="localePath('/customers')" class="hover:text-indigo-600 transition-colors">
        {{ $t('customers.title') }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
      <span class="text-slate-900 dark:text-white">{{ $t('customers.form_title_edit') }}</span>
    </div>

    <!-- Header -->
    <div class="pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        <UIcon name="i-heroicons-pencil-square" class="w-7 h-7 text-indigo-500" />
        {{ $t('customers.form_title_edit') }}
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ $t('customers.form_subtitle_edit') }}
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

    <!-- Skeleton Loader when loading initial customer data -->
    <div v-if="isLoadingData && !customerToEdit" class="space-y-6">
      <UCard class="glass-panel p-6 space-y-6 animate-pulse">
        <div class="space-y-4">
          <USkeleton class="h-6 w-1/4" />
          <USkeleton class="h-10 w-full rounded-xl" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <USkeleton class="h-10 w-full rounded-xl" />
          <USkeleton class="h-10 w-full rounded-xl" />
        </div>
      </UCard>
    </div>

    <!-- Customer Form -->
    <CustomerForm
      v-else-if="customerToEdit"
      :customer-to-edit="customerToEdit"
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useCustomerEngine } from '../../features/customer/composables/useCustomerEngine'
import { useAppToast } from '../../composables/useAppToast'
import CustomerForm from '../../features/customer/components/CustomerForm.vue'
import type { Customer, CustomerFormData } from '../../features/customer/types'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { updateCustomer, fetchCustomerById, isLoading, errorMsg } = useCustomerEngine()
const { showSuccess } = useAppToast()

const id = route.params.id as string
const customerToEdit = ref<Customer | null>(null)
const isLoadingData = ref(true)

onMounted(async () => {
  try {
    const data = await fetchCustomerById(id)
    if (data) {
      customerToEdit.value = data
    } else {
      router.push(localePath('/customers'))
    }
  } catch (e) {
    // Handled in composable errorMsg
  } finally {
    isLoadingData.value = false
  }
})

const handleSave = async (data: CustomerFormData) => {
  try {
    await updateCustomer(id, data)
    showSuccess('update', 'Customer')
    router.push(localePath('/customers'))
  } catch (e) {
    // Handled in composable errorMsg
  }
}

const handleCancel = () => {
  router.push(localePath('/customers'))
}
</script>
