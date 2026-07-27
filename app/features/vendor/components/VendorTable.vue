<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable
        :data="vendors"
        :columns="columns"
        :empty-state="{ icon: 'i-heroicons-building-storefront', label: $t('common.no_data') }"
      >
        <!-- Code Column -->
        <template #code-cell="{ row }">
          <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {{ row.original.code || '-' }}
          </span>
        </template>

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

        <!-- Type Column -->
        <template #type-cell="{ row }">
          <UBadge
            :color="row.original.type === 'company' ? 'indigo' : 'sky'"
            variant="subtle"
            size="xs"
            class="uppercase text-[10px] font-extrabold px-2 py-0.5"
          >
            {{ row.original.type || 'company' }}
          </UBadge>
        </template>

        <!-- Created Date Column -->
        <template #created_at-cell="{ row }">
          <span class="text-slate-500 dark:text-slate-400 text-xs">
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

const { t } = useI18n()

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

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    const day = String(date.getDate()).padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch (e) {
    return '-'
  }
}

const columns = computed(() => [
  { accessorKey: 'code', header: t('vendors.col_code') || 'Code' },
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
