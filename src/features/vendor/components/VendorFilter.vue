<template>
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 glass-panel rounded-2xl mb-6">
    <div class="flex-1 flex flex-col sm:flex-row items-center gap-3">
      <!-- Search Bar -->
      <div class="w-full sm:w-80">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          :placeholder="$t('vendors.search_placeholder')"
          size="md"
          class="w-full"
        />
      </div>

      <!-- Category Filter -->
      <div class="w-full sm:w-52">
        <USelect
          v-model="selectedCategory"
          :options="categoryOptions"
          option-attribute="label"
          value-attribute="value"
          size="md"
          class="w-full"
        />
      </div>
    </div>

    <!-- Create Vendor Button -->
    <UButton
      color="primary"
      icon="i-heroicons-plus"
      size="md"
      class="font-semibold shadow-sm"
      @click="$emit('open-create')"
    >
      {{ $t('vendors.add_vendor') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const selectedCategory = defineModel<string>('selectedCategory', { default: 'all' })

defineEmits<{
  (e: 'open-create'): void
}>()

const categoryOptions = computed(() => [
  { label: t('vendors.filter_category'), value: 'all' },
  { label: t('vendors.cat_raw_materials'), value: 'raw_materials' },
  { label: t('vendors.cat_it_hardware'), value: 'it_hardware' },
  { label: t('vendors.cat_logistics'), value: 'logistics' },
  { label: t('vendors.cat_office_supplies'), value: 'office_supplies' }
])
</script>
