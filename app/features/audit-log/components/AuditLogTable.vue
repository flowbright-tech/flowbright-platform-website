<template>
  <div class="space-y-4">
    <div class="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
      <UTable
        :data="logs"
        :columns="columns"
        :loading="isLoading"
      >
        <!-- Created Date Column formatted as dd-mmm-yy hh:mm (consistent with other features) -->
        <template #created_at-cell="{ row }">
          <span class="text-slate-500 dark:text-slate-400 text-xs font-mono">
            {{ formatAuditDateTime(row.original.created_at) }}
          </span>
        </template>

        <!-- User / Operator Cell -->
        <template #user-cell="{ row }">
          <div class="flex items-center gap-2.5 py-1">
            <UAvatar
              :alt="getAuditUserDisplayName(row.original.user, locale)"
              size="xs"
              class="ring-1 ring-indigo-500/20 shrink-0"
            />
            <div class="flex flex-col min-w-0 max-w-[180px]">
              <span class="font-bold text-xs text-slate-900 dark:text-white truncate">
                {{ getAuditUserDisplayName(row.original.user, locale) }}
              </span>
              <div class="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <span class="truncate">{{ row.original.user?.email || row.original.user_id || $t('audit_logs.unknown_user') }}</span>
              </div>
            </div>
            <UBadge
              v-if="row.original.user?.role"
              color="neutral"
              variant="subtle"
              size="xs"
              class="capitalize shrink-0 hidden sm:inline-flex"
            >
              {{ row.original.user.role }}
            </UBadge>
          </div>
        </template>

        <!-- Action Cell (Same style and color as Order Status) -->
        <template #action-cell="{ row }">
          <span
            :class="getActionBadgeClass(row.original.action)"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase transition-all"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {{ row.original.action }}
          </span>
        </template>

        <!-- Entity Type & Target ID Cell -->
        <template #entity_type-cell="{ row }">
          <div class="flex flex-col gap-1 py-1">
            <div class="flex items-center gap-1.5">
              <UBadge color="neutral" variant="soft" size="xs" class="font-bold capitalize flex items-center gap-1">
                <UIcon :name="getEntityTypeIcon(row.original.entity_type)" class="w-3 h-3 text-indigo-500" />
                {{ row.original.entity_type }}
              </UBadge>
            </div>
            <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]" :title="row.original.entity_id">
              {{ row.original.entity_id }}
            </span>
          </div>
        </template>

        <!-- Details Summary Cell -->
        <template #details-cell="{ row }">
          <div class="max-w-xs truncate py-1">
            <template v-if="row.original.details && Object.keys(row.original.details).length > 0">
              <div class="flex flex-wrap gap-1 items-center">
                <span
                  v-for="(val, key) in getPreviewDetails(row.original.details)"
                  :key="key"
                  class="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono"
                >
                  <span class="text-slate-400 font-medium">{{ key }}:</span>
                  <span class="font-semibold">{{ String(val) }}</span>
                </span>
              </div>
            </template>
            <span v-else class="text-xs text-slate-400 italic">
              -
            </span>
          </div>
        </template>

        <!-- Actions Cell -->
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end">
            <UButton
              color="primary"
              variant="ghost"
              icon="i-heroicons-eye"
              size="sm"
              :title="$t('audit_logs.view_details')"
              @click="$emit('view', row.original)"
            >
              <span class="hidden sm:inline text-xs font-semibold">{{ $t('audit_logs.view_details') }}</span>
            </UButton>
          </div>
        </template>
      </UTable>

      <!-- Empty State -->
      <div v-if="!isLoading && logs.length === 0" class="p-12 text-center space-y-3">
        <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 text-slate-400 mx-auto" />
        <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {{ $t('audit_logs.no_logs_found') }}
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {{ $t('audit_logs.no_logs_hint') }}
        </p>
      </div>
    </div>

    <!-- Pagination & Stats Bar -->
    <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
      <div class="text-xs text-slate-500 dark:text-slate-400">
        {{ $t('common.showing_results', {
          from: ((page - 1) * pageSize) + 1,
          to: Math.min(page * pageSize, total),
          total
        }) }}
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
import type { AuditLog } from '../types'
import {
  getActionBadgeClass,
  getEntityTypeIcon,
  formatAuditDateTime,
  getAuditUserDisplayName
} from '../composables/useAuditLogEngine'

const props = defineProps<{
  logs: AuditLog[]
  total: number
  pageSize: number
  isLoading?: boolean
}>()

const page = defineModel<number>('page', { default: 1 })

defineEmits<{
  (e: 'view', log: AuditLog): void
}>()

const { t, locale } = useI18n()

const columns = computed(() => [
  { accessorKey: 'created_at', header: t('audit_logs.col_timestamp') },
  { accessorKey: 'user', header: t('audit_logs.col_operator') },
  { accessorKey: 'action', header: t('audit_logs.col_action') },
  { accessorKey: 'entity_type', header: t('audit_logs.col_entity') },
  { accessorKey: 'details', header: t('audit_logs.col_details') },
  { accessorKey: 'actions', header: t('audit_logs.col_actions') }
])

const getPreviewDetails = (details: Record<string, any>) => {
  const result: Record<string, any> = {}
  const keys = Object.keys(details).slice(0, 2)
  for (const k of keys) {
    result[k] = details[k]
  }
  return result
}
</script>
