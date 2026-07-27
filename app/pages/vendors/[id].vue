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
            {{ $t('vendors.edit_vendor') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ vendorToEdit ? (vendorToEdit.name_en || vendorToEdit.name_th) : $t('vendors.edit_vendor_subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error Alert banner if fetch or save fails -->
    <UAlert
      v-if="errorMsg"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Error"
      :description="errorMsg"
    />

    <!-- Skeleton loader while fetching vendor details by ID -->
    <div v-if="isFetching" class="space-y-6">
      <UCard class="glass-panel p-6 animate-pulse">
        <div class="space-y-4">
          <USkeleton class="h-6 w-1/3" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>
      </UCard>
    </div>

    <!-- Vendor Form Component -->
    <VendorForm
      v-else-if="vendorToEdit"
      :vendor-to-edit="vendorToEdit"
      :is-loading="isLoading"
      @save="handleSave"
      @cancel="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalePath } from '#imports'
import { useVendorEngine } from '../../features/vendor/composables/useVendorEngine'
import VendorForm from '../../features/vendor/components/VendorForm.vue'
import { useAppToast } from '../../composables/useAppToast'
import type { Vendor, VendorFormData } from '../../features/vendor/types'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { fetchVendorById, updateVendor, isLoading, errorMsg } = useVendorEngine()
const { showSuccess } = useAppToast()

const vendorId = String(route.params.id)
const vendorToEdit = ref<Vendor | null>(null)
const isFetching = ref(true)

onMounted(async () => {
  if (vendorId) {
    isFetching.value = true
    vendorToEdit.value = await fetchVendorById(vendorId)
    isFetching.value = false
  }
})

const goBack = () => {
  router.push(localePath('/vendors'))
}

const handleSave = async (data: VendorFormData) => {
  try {
    await updateVendor(vendorId, data)
    showSuccess('update', 'Vendor')
    goBack()
  } catch (err) {
    // Error handled by composable errorMsg
  }
}
</script>
