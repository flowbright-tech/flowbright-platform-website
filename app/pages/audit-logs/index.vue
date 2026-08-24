<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Non-Admin Permission Restriction Banner -->
    <div
      v-if="!isAdmin"
      class="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-4 shadow-sm"
    >
      <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-amber-500 mx-auto" />
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">
        {{ locale === 'th' ? 'ไม่มีสิทธิ์เข้าถึงส่วนนี้' : 'Access Restricted' }}
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {{ locale === 'th' ? 'การดูและตรวจสอบประวัติการใช้งาน (Audit Logs) สงวนสิทธิ์เฉพาะผู้ใช้งานระดับ Admin เท่านั้น' : 'Audit Logs monitoring is strictly restricted to Admin users only.' }}
      </p>
      <UButton color="neutral" variant="outline" :to="localePath('/')" class="font-bold">
        {{ locale === 'th' ? 'กลับไปยังหน้าแรก' : 'Return to Dashboard' }}
      </UButton>
    </div>

    <!-- Admin Content -->
    <template v-else>
      <!-- Page Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UIcon name="i-heroicons-shield-check" class="w-7 h-7 text-indigo-500" />
            {{ $t('audit_logs.title') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('audit_logs.subtitle') }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-path"
            size="sm"
            class="font-semibold shadow-xs"
            :loading="isLoading"
            @click="handleRefresh"
          >
            {{ $t('dashboard.refresh') }}
          </UButton>
        </div>
      </div>

      <!-- Error Alert banner if fetch fails -->
      <UAlert
        v-if="errorMsg"
        color="red"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :title="$t('audit_logs.load_error_title')"
        :description="errorMsg"
        class="mb-6"
      />

      <!-- Search & Filter Controls -->
      <AuditLogFilter
        v-model:search-query="searchQuery"
        v-model:action="selectedAction"
        v-model:entity-type="selectedEntityType"
        v-model:start-date="startDate"
        v-model:end-date="endDate"
        :is-loading="isLoading"
        @filter="handleFilter"
        @reset="resetFilters"
      />

      <!-- Skeleton Loader for initial fetch -->
      <div v-if="isLoading && auditLogs.length === 0" class="space-y-4">
        <div class="glass-panel p-6 rounded-2xl space-y-4 animate-pulse">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-24" />
          </div>
          <div v-for="n in 5" :key="n" class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <USkeleton class="h-4 w-36" />
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-6 w-16 rounded-md" />
            <USkeleton class="h-4 w-28" />
          </div>
        </div>
      </div>

      <!-- Audit Log Table & Pagination -->
      <AuditLogTable
        v-else
        v-model:page="currentPage"
        :logs="auditLogs"
        :total="totalFilteredCount"
        :page-size="pageSize"
        :is-loading="isLoading"
        @view="handleViewDetail"
      />

      <!-- Audit Log Detailed Inspector Modal -->
      <AuditLogDetailModal
        v-model:open="isDetailModalOpen"
        :log="selectedLog"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'
import { useAuthEngine } from '../../features/auth/composables/useAuthEngine'
import { useAuditLogEngine } from '../../features/audit-log/composables/useAuditLogEngine'
import AuditLogFilter from '../../features/audit-log/components/AuditLogFilter.vue'
import AuditLogTable from '../../features/audit-log/components/AuditLogTable.vue'
import AuditLogDetailModal from '../../features/audit-log/components/AuditLogDetailModal.vue'
import type { AuditLog } from '../../features/audit-log/types'

const localePath = useLocalePath()
const { locale } = useI18n()
const { isAdmin } = useAuthEngine()

const {
  auditLogs,
  totalFilteredCount,
  isLoading,
  errorMsg,
  searchQuery,
  selectedAction,
  selectedEntityType,
  startDate,
  endDate,
  currentPage,
  pageSize,
  fetchAuditLogs,
  resetFilters
} = useAuditLogEngine()

const isDetailModalOpen = ref(false)
const selectedLog = ref<AuditLog | null>(null)

onMounted(async () => {
  if (isAdmin.value) {
    await fetchAuditLogs()
  }
})

const handleFilter = async () => {
  currentPage.value = 1
  await fetchAuditLogs()
}

const handleRefresh = async () => {
  await fetchAuditLogs()
}

const handleViewDetail = (log: AuditLog) => {
  selectedLog.value = log
  isDetailModalOpen.value = true
}
</script>
