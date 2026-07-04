<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable
        :data="vendors"
        :columns="columns"
        :empty-state="{ icon: 'i-heroicons-building-storefront', label: $t('common.no_data') }"
      >
        <!-- Name Column -->
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              {{ row.original.name.charAt(0) }}
            </div>
            <div>
              <div class="font-bold text-slate-900 dark:text-white text-sm">
                {{ row.original.name }}
              </div>
              <div class="text-[11px] font-mono text-slate-400">
                {{ row.original.code }} • {{ row.original.phone }}
              </div>
            </div>
          </div>
        </template>

        <!-- Tax ID Column -->
        <template #taxId-cell="{ row }">
          <span class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {{ row.original.taxId }}
          </span>
        </template>

        <!-- Reg ID Column -->
        <template #regId-cell="{ row }">
          <span class="font-mono text-xs text-slate-500">
            {{ row.original.regId }}
          </span>
        </template>

        <!-- Category Column -->
        <template #category-cell="{ row }">
          <UBadge
            :color="
              row.original.category === 'raw_materials' ? 'amber' :
              row.original.category === 'it_hardware' ? 'indigo' :
              row.original.category === 'logistics' ? 'emerald' : 'sky'
            "
            variant="subtle"
            size="xs"
            class="capitalize font-semibold"
          >
            {{ $t(`vendors.cat_${row.original.category}`) }}
          </UBadge>
        </template>

        <!-- Actions Column -->
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              size="xs"
              @click="$emit('edit', row.original)"
            />
            <UButton
              color="rose"
              variant="ghost"
              icon="i-heroicons-trash"
              size="xs"
              @click="$emit('delete', row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Pagination & Stats -->
    <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
      <div class="text-xs text-slate-500 dark:text-slate-400">
        {{ $t('common.showing_results', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, total), total }) }}
      </div>

      <UPagination
        v-model="page"
        :page-count="pageSize"
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

const columns = computed(() => [
  { accessorKey: 'name', header: t('vendors.col_name') },
  { accessorKey: 'taxId', header: t('vendors.col_tax_id') },
  { accessorKey: 'regId', header: t('vendors.col_reg_id') },
  { accessorKey: 'category', header: t('vendors.col_category') },
  { accessorKey: 'actions', header: t('vendors.col_actions'), class: 'text-right' }
])
</script>
