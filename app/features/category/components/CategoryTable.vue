<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable :data="categories" :columns="columns"
        :empty-state="{ icon: 'i-heroicons-tag', label: $t('common.no_data') }">
        <!-- Image / Icon Column -->
        <template #image_url-cell="{ row }">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
            <img v-if="row.original.image_url" :src="row.original.image_url" class="w-full h-full object-cover" />
            <UIcon v-else name="i-heroicons-folder" class="w-5 h-5 text-indigo-500" />
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



        <!-- Sort Order Column -->
        <template #sort_order-cell="{ row }">
          <span class="text-slate-600 dark:text-slate-400 text-xs font-mono">
            {{ row.original.sort_order }}
          </span>
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
import type { Category } from '../types'
const { t, locale } = useI18n()

defineProps<{
  categories: Category[]
  total: number
  pageSize: number
}>()

const page = defineModel<number>('page', { default: 1 })

defineEmits<{
  (e: 'edit', category: Category): void
  (e: 'delete', category: Category): void
}>()



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
  { accessorKey: 'name_en', header: t('categories.col_name_en') || 'Name (EN)' },
  { accessorKey: 'name_th', header: t('categories.col_name_th') || 'Name (TH)' },
  { accessorKey: 'sort_order', header: t('categories.col_sort_order') || 'Sort Order' },
  { accessorKey: 'is_active', header: t('categories.col_status') || 'Status' },
  { accessorKey: 'created_at', header: t('categories.col_created_at') || 'Created Date' },
  { accessorKey: 'actions', header: t('categories.col_actions') || 'Actions', class: 'text-right' }
])
</script>
