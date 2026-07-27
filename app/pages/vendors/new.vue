<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Breadcrumb & Page Header -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div class="flex items-center gap-3">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          size="sm"
          @click="goBack"
        />
        <div>
          <h1 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UIcon name="i-heroicons-building-storefront" class="w-6 h-6 text-indigo-500" />
            {{ $t('vendors.add_vendor') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t('vendors.add_vendor_subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error Alert banner if save fails -->
    <UAlert
      v-if="errorMsg"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Failed to Save Vendor"
      :description="errorMsg"
    />

    <!-- Vendor Form Component -->
    <VendorForm
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useVendorEngine } from '../../features/vendor/composables/useVendorEngine'
import VendorForm from '../../features/vendor/components/VendorForm.vue'
import { useAppToast } from '../../composables/useAppToast'
import type { VendorFormData } from '../../features/vendor/types'

const router = useRouter()
const localePath = useLocalePath()
const { addVendor, isLoading, errorMsg } = useVendorEngine()
const { showSuccess } = useAppToast()

const goBack = () => {
  router.push(localePath('/vendors'))
}

const handleSave = async (data: VendorFormData) => {
  try {
    await addVendor(data)
    showSuccess('create', 'Vendor')
    goBack()
  } catch (err) {
    // Error handled by composable errorMsg
  }
}
</script>
