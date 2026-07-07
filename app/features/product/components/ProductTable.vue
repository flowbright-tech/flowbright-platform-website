<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable :data="products" :columns="columns"
        :empty-state="{ icon: 'i-heroicons-tag', label: $t('common.no_data') }">
        
        <!-- Image / Icon Column -->
        <template #image_url-cell="{ row }">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
            <img v-if="row.original.image_url" :src="row.original.image_url" class="w-full h-full object-cover" />
            <UIcon v-else name="i-heroicons-shopping-bag" class="w-5 h-5 text-emerald-500" />
          </div>
        </template>

        <!-- Name Column (combines EN and TH for compact view) -->
        <template #name-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-900 dark:text-white">
              {{ row.original.name_en || '-' }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ row.original.name_th || '-' }}
            </span>
          </div>
        </template>

        <!-- Identifiers Column (SKU & Barcode) -->
        <template #identifiers-cell="{ row }">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 font-mono text-[10px] uppercase">SKU:</span>
              <span class="text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                {{ row.original.sku || '-' }}
              </span>
            </div>
            <div v-if="row.original.barcode" class="flex items-center gap-1.5">
              <span class="text-slate-400 font-mono text-[10px] uppercase">BAR:</span>
              <span class="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                {{ row.original.barcode }}
              </span>
            </div>
          </div>
        </template>

        <!-- Price Column -->
        <template #price-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-900 dark:text-white">
              {{ formatCurrency(row.original.selling_price) }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ $t('products.cost_label') || 'Cost' }}: {{ formatCurrency(row.original.cost) }}
            </span>
          </div>
        </template>

        <!-- Stock Column -->
        <template #stock-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-bold" :class="row.original.stock <= 5 ? 'text-amber-500' : 'text-slate-900 dark:text-white'">
              {{ row.original.stock }} {{ row.original.unit || 'pcs' }}
            </span>
            <span class="text-xs text-slate-400">
              {{ $t('products.reserved_label') || 'Reserved' }}: {{ row.original.reserve_stock || 0 }}
            </span>
          </div>
        </template>

        <!-- Status Column -->
        <template #is_active-cell="{ row }">
          <UBadge
            :color="row.original.is_active ? 'success' : 'neutral'"
            variant="soft"
            size="sm"
            class="font-semibold"
          >
            {{ row.original.is_active ? $t('common.active') || 'Active' : $t('common.inactive') || 'Inactive' }}
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
import type { Product } from '../types'

const { t } = useI18n()

defineProps<{
  products: Product[]
  total: number
  pageSize: number
}>()

const page = defineModel<number>('page', { default: 1 })

defineEmits<{
  (e: 'edit', product: Product): void
  (e: 'delete', product: Product): void
}>()

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null || isNaN(val)) return '-'
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val)
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
  { accessorKey: 'image_url', header: '' },
  { accessorKey: 'name', header: t('products.col_name') || 'Product Name' },
  { accessorKey: 'identifiers', header: t('products.col_identifiers') || 'SKU / Barcode' },
  { accessorKey: 'product_type', header: t('products.col_type') || 'Type' },
  { accessorKey: 'price', header: t('products.col_price') || 'Selling Price' },
  { accessorKey: 'stock', header: t('products.col_stock') || 'Inventory' },
  { accessorKey: 'is_active', header: t('products.col_status') || 'Status' },
  { accessorKey: 'created_at', header: t('products.col_created_at') || 'Created Date' },
  { accessorKey: 'actions', header: t('products.col_actions') || 'Actions', class: 'text-right' }
])
</script>
