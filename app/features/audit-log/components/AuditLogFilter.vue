<template>
  <div class="glass-panel p-4 sm:p-5 rounded-2xl mb-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
    <!-- Top Row: Search Input -->
    <div>
      <UFormField :label="$t('audit_logs.filter_search') || 'Search'">
        <UInput
          v-model="searchQuery"
          :placeholder="$t('audit_logs.search_placeholder') || 'Search audit logs, entity ID, order number, details, user...'"
          size="md"
          class="w-full"
          @keydown.enter="$emit('filter')"
        >
          <template #trailing>
            <UButton
              v-if="searchQuery"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="xs"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>
      </UFormField>
    </div>

    <!-- Filter Grid: Action, Entity Type, Start Date, End Date -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Action Selector -->
      <UFormField :label="$t('audit_logs.filter_action')">
        <USelectMenu
          v-model="action"
          :items="actionOptions"
          value-key="value"
          label-key="label"
          class="w-full"
          size="md"
          :placeholder="$t('audit_logs.all_actions')"
        />
      </UFormField>

      <!-- Entity Type Selector -->
      <UFormField :label="$t('audit_logs.filter_entity_type')">
        <USelectMenu
          v-model="entityType"
          :items="entityTypeOptions"
          value-key="value"
          label-key="label"
          searchable
          class="w-full"
          size="md"
          :placeholder="$t('audit_logs.all_entities')"
        />
      </UFormField>

      <!-- Start Date -->
      <UFormField :label="$t('audit_logs.filter_start_date')">
        <UInput
          v-model="startDate"
          type="date"
          class="w-full font-mono text-xs"
          size="md"
        />
      </UFormField>

      <!-- End Date -->
      <UFormField :label="$t('audit_logs.filter_end_date')">
        <UInput
          v-model="endDate"
          type="date"
          class="w-full font-mono text-xs"
          size="md"
        />
      </UFormField>
    </div>

    <!-- Actions Bar: Reset, Status, Filter -->
    <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
      <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <UIcon name="i-heroicons-funnel" class="w-4 h-4 text-indigo-500" />
        <span>{{ hasActiveFilters ? $t('audit_logs.active_filters') : $t('audit_logs.no_filters_applied') }}</span>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          v-if="hasActiveFilters"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-arrow-path"
          size="sm"
          class="font-semibold"
          @click="handleReset"
        >
          {{ $t('common.reset') }}
        </UButton>

        <UButton
          color="primary"
          variant="solid"
          icon="i-heroicons-magnifying-glass"
          size="sm"
          class="font-semibold shadow-sm"
          :loading="isLoading"
          @click="$emit('filter')"
        >
          {{ $t('common.filter') || 'Search' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isLoading?: boolean
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const action = defineModel<string>('action', { default: '' })
const entityType = defineModel<string>('entityType', { default: '' })
const startDate = defineModel<string>('startDate', { default: '' })
const endDate = defineModel<string>('endDate', { default: '' })

const emit = defineEmits<{
  (e: 'filter'): void
  (e: 'reset'): void
}>()

const { t } = useI18n()

const actionOptions = computed(() => [
  { value: '', label: t('audit_logs.all_actions') },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' }
])

const entityTypeOptions = computed(() => [
  { value: '', label: t('audit_logs.all_entities') },
  { value: 'product', label: t('audit_logs.entity_product') },
  { value: 'customer', label: t('audit_logs.entity_customer') },
  { value: 'order', label: t('audit_logs.entity_order') },
  { value: 'vendor', label: t('audit_logs.entity_vendor') },
  { value: 'bom', label: t('audit_logs.entity_bom') },
  { value: 'product_package', label: t('audit_logs.entity_package') },
  { value: 'user', label: t('audit_logs.entity_user') },
  { value: 'company', label: t('audit_logs.entity_company') },
  { value: 'category', label: t('audit_logs.entity_category') }
])

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || action.value || entityType.value || startDate.value || endDate.value)
})

const handleReset = () => {
  searchQuery.value = ''
  action.value = ''
  entityType.value = ''
  startDate.value = ''
  endDate.value = ''
  emit('reset')
}
</script>
