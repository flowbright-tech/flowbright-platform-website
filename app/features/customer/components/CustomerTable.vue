<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable :data="customers" :columns="columns"
        :empty-state="{ icon: 'i-heroicons-user-group', label: $t('common.no_data') }">
        <!-- Code Column -->
        <template #code-cell="{ row }">
          <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {{ row.original.code }}
          </span>
        </template>

        <!-- Name EN Column -->
        <template #name_en-cell="{ row }">
          <div class="flex items-center gap-2">

            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ getNameEn(row.original) }}
            </span>
          </div>
        </template>

        <!-- Name TH Column -->
        <template #name_th-cell="{ row }">
          <span class="text-sm text-slate-700 dark:text-slate-300">
            {{ getNameTh(row.original) }}
          </span>
        </template>

        <!-- Email Column -->
        <template #email-cell="{ row }">
          <span class="text-slate-600 dark:text-slate-300 text-xs font-medium">
            {{ row.original.email }}
          </span>
        </template>

        <!-- DOB Column -->
        <template #birth_date-cell="{ row }">
          <span class="text-slate-600 dark:text-slate-300 text-xs">
            {{ formatDate(row.original.birth_date) }}
          </span>
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
            <!-- Edit Button: Secondary color -->
            <UButton color="secondary" variant="ghost" icon="i-heroicons-pencil-square" size="md"
              @click="$emit('edit', row.original)" />
            <!-- Delete Button: Error color -->
            <UButton color="error" variant="ghost" icon="i-heroicons-trash" size="md"
              @click="$emit('delete', row.original)" />
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

      <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" size="sm"
        :active-button="{ color: 'primary' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Customer } from '../types'

const { t } = useI18n()

defineProps<{
  customers: Customer[]
  total: number
  pageSize: number
}>()

const page = defineModel<number>('page', { default: 1 })

defineEmits<{
  (e: 'edit', customer: Customer): void
  (e: 'delete', customer: Customer): void
}>()


const getNameEn = (customer: Customer) => {
  const prefix = customer.prefix_en ? `${customer.prefix_en} ` : ''
  const first = customer.first_name_en || ''
  const last = customer.last_name_en || ''
  return `${prefix}${first} ${last}`.trim() || '-'
}

const getNameTh = (customer: Customer) => {
  const prefix = customer.prefix_th ? `${customer.prefix_th}` : ''
  const first = customer.first_name_th || ''
  const last = customer.last_name_th || ''
  return `${prefix}${first} ${last}`.trim() || '-'
}

const formatDate = (dateStr?: string) => {
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

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    const day = String(date.getDate()).padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${minutes}`
  } catch (e) {
    return '-'
  }
}

const columns = computed(() => [
  { accessorKey: 'code', header: t('customers.col_code') || 'Code' },
  { accessorKey: 'name_en', header: t('customers.col_name_en') || 'Name (EN)' },
  { accessorKey: 'name_th', header: t('customers.col_name_th') || 'Name (TH)' },
  { accessorKey: 'email', header: t('customers.col_email') },
  { accessorKey: 'birth_date', header: t('customers.col_dob') || 'Date of Birth' },
  { accessorKey: 'created_at', header: t('customers.col_created_at') || 'Created Date' },
  { accessorKey: 'actions', header: t('customers.col_actions'), class: 'text-right' }
])
</script>
