<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable
        :data="vendors"
        :columns="columns"
        :empty-state="{ icon: 'i-heroicons-building-storefront', label: $t('common.no_data') }"
      >
        <!-- Name EN Column -->
        <template #name_en-cell="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar
              v-if="row.original.image_url"
              :src="row.original.image_url"
              :alt="row.original.name_en"
              size="xs"
              class="shrink-0"
            />
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ row.original.name_en || '-' }}
            </span>
          </div>
        </template>

        <!-- Name TH Column -->
        <template #name_th-cell="{ row }">
          <span class="text-sm text-slate-700 dark:text-slate-300">
            {{ row.original.name_th || '-' }}
          </span>
        </template>

        <!-- Contact Name Column -->
        <template #contact_name-cell="{ row }">
          <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {{ row.original.contact_name || '-' }}
          </span>
        </template>

        <!-- Phone Column -->
        <template #phone-cell="{ row }">
          <span class="text-xs font-mono text-slate-600 dark:text-slate-300">
            {{ row.original.phone || '-' }}
          </span>
        </template>

        <!-- Email Column -->
        <template #email-cell="{ row }">
          <span class="text-slate-600 dark:text-slate-300 text-xs font-medium">
            {{ row.original.email || '-' }}
          </span>
        </template>

        <!-- Type Column (Balanced size & high visibility in both light & dark themes) -->
        <template #type-cell="{ row }">
          <span
            :class="row.original.type === 'company'
              ? 'bg-indigo-500/15 text-indigo-950 border border-indigo-400/60 dark:bg-indigo-500/25 dark:text-indigo-300 dark:border-indigo-400/50'
              : 'bg-sky-500/15 text-sky-950 border border-sky-400/60 dark:bg-sky-500/25 dark:text-sky-300 dark:border-sky-400/50'"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase shadow-sm transition-all"
          >
            <UIcon :name="row.original.type === 'company' ? 'i-heroicons-building-office' : 'i-heroicons-user'" class="w-3.5 h-3.5 shrink-0" />
            {{ row.original.type || 'company' }}
          </span>
        </template>

        <!-- Created Date Column formatted as dd-mmm-yy hh:mm -->
        <template #created_at-cell="{ row }">
          <span class="text-slate-500 dark:text-slate-400 text-xs font-mono">
            {{ formatDateTime(row.original.created_at) }}
          </span>
        </template>

        <!-- Actions Column -->
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <!-- Edit Button -->
            <UButton
              color="secondary"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              size="md"
              @click="$emit('edit', row.original)"
            />
            <!-- Delete Button -->
            <UButton
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              size="md"
              @click="$emit('delete', row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Pagination & Stats Bar -->
    <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
      <div class="text-xs text-slate-500 dark:text-slate-400">
        {{ $t('common.showing_results', {
          from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, total), total
        })
        }}
      </div>

      <UPagination
        v-model:page="page"
        :items-per-page="pageSize"
        :total="total"
        size="sm"
        :active-button="{ color: 'primary' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Vendor } from '../types'
import { useFormatter } from '../../../composables/useFormatter'

const { t } = useI18n()
const { formatDateTime } = useFormatter()

defineProps<{
  vendors: Vendor[]
  total: number
  pageSize: number
}>()

const page = defineModel<number>('page', { default: 1 })

defineEmits<{
  (e: 'edit', vendor: Vendor): void
  (e: 'delete', vendor: Vendor): void
}>()

const columns = computed(() => [
  { accessorKey: 'name_en', header: t('vendors.col_name_en') || 'Name (EN)' },
  { accessorKey: 'name_th', header: t('vendors.col_name_th') || 'Name (TH)' },
  { accessorKey: 'contact_name', header: t('vendors.col_contact_name') || 'Contact Person' },
  { accessorKey: 'phone', header: t('vendors.col_phone') || 'Phone' },
  { accessorKey: 'email', header: t('vendors.col_email') || 'Email' },
  { accessorKey: 'type', header: t('vendors.col_type') || 'Type' },
  { accessorKey: 'created_at', header: t('vendors.col_created_at') || 'Created Date' },
  { accessorKey: 'actions', header: t('vendors.col_actions') || 'Actions', class: 'text-right' }
])
</script>
