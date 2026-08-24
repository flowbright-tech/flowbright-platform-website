<template>
  <div class="glass-panel p-4 sm:p-5 rounded-2xl mb-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <!-- Action Selector -->
      <UFormField :label="$t('audit_logs.filter_action')">
        <USelect
          v-model="action"
          :items="actionOptions"
          value-key="value"
          label-key="label"
          class="w-full"
          size="md"
        />
      </UFormField>

      <!-- Entity Type Selector -->
      <UFormField :label="$t('audit_logs.filter_entity_type')">
        <USelect
          v-model="entityType"
          :items="entityTypeOptions"
          value-key="value"
          label-key="label"
          class="w-full"
          size="md"
        />
      </UFormField>

      <!-- User ID Filter -->
      <UFormField :label="$t('audit_logs.filter_user_id')">
        <UInput
          v-model="userId"
          :placeholder="$t('audit_logs.placeholder_user_id')"
          class="w-full"
          size="md"
        >
          <template #trailing>
            <UButton
              v-if="userId"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="xs"
              @click="userId = ''"
            />
          </template>
        </UInput>
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

    <!-- Actions Bar: Reset, Filter & Refresh -->
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

const action = defineModel<string>('action', { default: '' })
const entityType = defineModel<string>('entityType', { default: '' })
const userId = defineModel<string>('userId', { default: '' })
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
  { value: 'order', label: t('audit_logs.entity_order') },
  { value: 'product', label: t('audit_logs.entity_product') },
  { value: 'customer', label: t('audit_logs.entity_customer') },
  { value: 'vendor', label: t('audit_logs.entity_vendor') },
  { value: 'product_package', label: t('audit_logs.entity_package') },
  { value: 'bom', label: t('audit_logs.entity_bom') },
  { value: 'category', label: t('audit_logs.entity_category') },
  { value: 'user', label: t('audit_logs.entity_user') }
])

const hasActiveFilters = computed(() => {
  return !!(action.value || entityType.value || userId.value || startDate.value || endDate.value)
})

const handleReset = () => {
  action.value = ''
  entityType.value = ''
  userId.value = ''
  startDate.value = ''
  endDate.value = ''
  emit('reset')
}
</script>
