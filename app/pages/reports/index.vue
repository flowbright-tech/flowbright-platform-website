<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Non-Admin Permission Restriction Banner -->
    <div
      v-if="!isAdmin"
      class="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-4 shadow-sm"
    >
      <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-amber-500 mx-auto" />
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">
        {{ $t('reports.access_restricted_title') }}
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {{ $t('reports.access_restricted_desc') }}
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
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UIcon name="i-heroicons-document-chart-bar" class="w-5 h-5" />
            </div>
            <span>{{ $t('reports.title') }}</span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('reports.subtitle') }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-indigo-500" />
            <span>{{ locale === 'th' ? 'สิทธิ์ผู้ดูแลระบบ' : 'Admin Privileges Active' }}</span>
          </span>
        </div>
      </div>

      <!-- Info Callout Banner -->
      <div class="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/50 flex items-start gap-3.5">
        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
          <div class="font-bold text-slate-900 dark:text-white">
            {{ locale === 'th' ? 'การส่งออกรายงานข้อมูลธุรกิจ' : 'Business Reports & Telemetry Export' }}
          </div>
          <div>
            {{ locale === 'th'
              ? 'ข้อมูลที่ส่งออกจะถูกประมวลผลแบบเรียลไทม์จากระบบฐานข้อมูล และสร้างเป็นไฟล์สเปรดชีต Microsoft Excel (.xlsx) ที่พร้อมนำไปใช้งานในการวิเคราะห์ทางบัญชีหรือบริหารจัดการสต็อก'
              : 'Exported reports are compiled in real-time from the backend database into open standard Microsoft Excel (.xlsx) files, ready for financial reconciliation and inventory audit.'
            }}
          </div>
        </div>
      </div>

      <!-- Reports Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <!-- 1. Stock Balance Report Card -->
        <StockReportCard
          :is-loading="isDownloadingStock"
          @download="downloadStockReport"
        />

        <!-- 2. Sales and Orders Report Card with Date Range -->
        <SalesReportCard
          v-model:start-date="startDate"
          v-model:end-date="endDate"
          :is-loading="isDownloadingSales"
          :active-preset="activePreset"
          @select-preset="applyPreset"
          @download="() => downloadSalesReport()"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'
import { useAuthEngine } from '../../features/auth/composables/useAuthEngine'
import { useReportEngine } from '../../features/report/composables/useReportEngine'
import StockReportCard from '../../features/report/components/StockReportCard.vue'
import SalesReportCard from '../../features/report/components/SalesReportCard.vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const { isAdmin } = useAuthEngine()

const {
  isDownloadingStock,
  isDownloadingSales,
  startDate,
  endDate,
  activePreset,
  applyPreset,
  downloadStockReport,
  downloadSalesReport
} = useReportEngine()
</script>
