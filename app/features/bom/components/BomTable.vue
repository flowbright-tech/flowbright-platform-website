<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable :data="boms" :columns="columns"
        :empty-state="{ icon: 'i-heroicons-cog-8-tooth', label: $t('common.no_data') }">
        
        <!-- Name Column -->
        <template #bom_name-cell="{ row }">
          <span class="text-sm font-bold text-slate-900 dark:text-white">
            {{ row.original.bom_name || '-' }}
          </span>
        </template>

        <!-- Associated Product Column -->
        <template #product-cell="{ row }">
          <div v-if="row.original.product" class="flex flex-col">
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {{ locale === 'th' ? row.original.product.name_th : row.original.product.name_en }}
            </span>
            <span class="text-xs font-mono text-slate-400">
              SKU: {{ row.original.product.sku }}
            </span>
          </div>
          <span v-else class="text-xs text-slate-400 font-mono">
            Unassigned (ID: {{ row.original.product_id || '-' }})
          </span>
        </template>

        <!-- Version Column -->
        <template #version-cell="{ row }">
          <UBadge color="neutral" variant="soft" size="sm" class="font-mono">
            v{{ row.original.version }}
          </UBadge>
        </template>

        <!-- Component Items Count Column -->
        <template #items_count-cell="{ row }">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ row.original.items?.length ?? 0 }} items
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

    <!-- Pagination -->
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
import type { Bom } from '../types'

const { t, locale } = useI18n()

defineProps<{
  boms: Bom[]
  total: number
  pageSize: number
}>()

const page = defineModel<number>('page', { default: 1 })

defineEmits<{
  (e: 'edit', bom: Bom): void
  (e: 'delete', bom: Bom): void
}>()

const columns = computed(() => [
  { accessorKey: 'bom_name', header: t('boms.col_name') || 'BOM Name' },
  { accessorKey: 'product', header: t('boms.col_product') || 'Associated Product' },
  { accessorKey: 'version', header: t('boms.col_version') || 'Version' },
  { accessorKey: 'items_count', header: t('boms.col_items_count') || 'Components Count' },
  { accessorKey: 'actions', header: t('boms.col_actions') || 'Actions', class: 'text-right' }
])
</script>
