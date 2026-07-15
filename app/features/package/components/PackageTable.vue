<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable :data="packages" :columns="columns"
        :empty-state="{ icon: 'i-heroicons-gift', label: $t('common.no_data') }">
        <!-- Image / Icon Column -->
        <template #image_url-cell="{ row }">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
            <img v-if="row.original.image_url" :src="row.original.image_url" class="w-full h-full object-cover" />
            <UIcon v-else name="i-heroicons-gift" class="w-5 h-5 text-indigo-500" />
          </div>
        </template>

        <!-- Name EN Column -->
        <template #name_en-cell="{ row }">
          <span class="text-sm font-bold text-slate-900 dark:text-white">
            {{ row.original.name_en || '-' }}
          </span>
        </template>

        <!-- Name TH Column -->
        <template #name_th-cell="{ row }">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {{ row.original.name_th || '-' }}
          </span>
        </template>

        <!-- Price Column -->
        <template #price-cell="{ row }">
          <span class="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
            ฿{{ formatPrice(row.original.price) }}
          </span>
        </template>

        <!-- Items Count Column -->
        <template #items_count-cell="{ row }">
          <span class="text-slate-600 dark:text-slate-400 text-xs font-semibold">
            {{ row.original.items?.length || 0 }} {{ $t('packages.items_count_label') || 'items' }}
          </span>
        </template>

        <!-- Created Date Column -->
        <template #created_at-cell="{ row }">
          <span class="text-slate-500 dark:text-slate-400 text-xs">
            {{ formatDate(row.original.created_at) }}
          </span>
        </template>

        <!-- Actions Column -->
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton color="secondary" variant="ghost" icon="i-heroicons-pencil-square" size="md"
              @click="$emit('edit', row.original)" />
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
import type { Package } from '../types'
const { t } = useI18n()

defineProps<{
  packages: Package[]
  total: number
  pageSize: number
}>()

const page = defineModel<number>('page', { default: 1 })

defineEmits<{
  (e: 'edit', pkg: Package): void
  (e: 'delete', pkg: Package): void
}>()

const formatPrice = (value: number) => {
  if (value === undefined || value === null) return '0.00'
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
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
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${minutes}`
  } catch (e) {
    return '-'
  }
}

const columns = computed(() => [
  { accessorKey: 'image_url', header: '' },
  { accessorKey: 'name_en', header: t('packages.col_name_en') || 'Name (EN)' },
  { accessorKey: 'name_th', header: t('packages.col_name_th') || 'Name (TH)' },
  { accessorKey: 'price', header: t('packages.col_price') || 'Price' },
  { accessorKey: 'items_count', header: t('packages.col_items_count') || 'Products' },
  { accessorKey: 'created_at', header: t('packages.col_created_at') || 'Created Date' },
  { accessorKey: 'actions', header: t('packages.col_actions') || 'Actions', class: 'text-right' }
])
</script>
