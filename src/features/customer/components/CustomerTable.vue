<template>
  <div class="space-y-4">
    <UCard class="glass-panel overflow-hidden" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable
        :rows="customers"
        :columns="columns"
        :empty-state="{ icon: 'i-heroicons-user-group', label: $t('common.no_data') }"
      >
        <!-- Name & Code Column -->
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              {{ row.name.charAt(0) }}
            </div>
            <div>
              <div class="font-bold text-slate-900 dark:text-white text-sm">
                {{ row.name }}
              </div>
              <div class="text-[11px] font-mono text-slate-400">
                {{ row.code }} • {{ row.phone }}
              </div>
            </div>
          </div>
        </template>

        <!-- Email Column -->
        <template #email-data="{ row }">
          <span class="text-slate-600 dark:text-slate-300 text-xs font-medium">
            {{ row.email }}
          </span>
        </template>

        <!-- Segment Column -->
        <template #segment-data="{ row }">
          <UBadge
            :color="
              row.segment === 'enterprise' ? 'indigo' :
              row.segment === 'sme' ? 'sky' : 'slate'
            "
            variant="subtle"
            size="xs"
            class="capitalize font-semibold"
          >
            {{ $t(`customers.segment_${row.segment}`) }}
          </UBadge>
        </template>

        <!-- Status Column -->
        <template #status-data="{ row }">
          <UBadge
            :color="
              row.status === 'active' ? 'emerald' :
              row.status === 'suspended' ? 'rose' : 'amber'
            "
            variant="soft"
            size="xs"
            class="capitalize font-semibold rounded-full"
          >
            <UIcon
              :name="
                row.status === 'active' ? 'i-heroicons-check-circle' :
                row.status === 'suspended' ? 'i-heroicons-x-circle' : 'i-heroicons-clock'
              "
              class="w-3.5 h-3.5 mr-1"
            />
            {{ $t(`customers.status_${row.status}`) }}
          </UBadge>
        </template>

        <!-- Actions Column -->
        <template #actions-data="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              size="xs"
              @click="$emit('edit', row)"
            />
            <UButton
              color="rose"
              variant="ghost"
              icon="i-heroicons-trash"
              size="xs"
              @click="$emit('delete', row)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Pagination & Stats Bar -->
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

const columns = computed(() => [
  { key: 'name', label: t('customers.col_name') },
  { key: 'email', label: t('customers.col_email') },
  { key: 'segment', label: t('customers.col_segment') },
  { key: 'status', label: t('customers.col_status') },
  { key: 'actions', label: t('customers.col_actions'), class: 'text-right' }
])
</script>
