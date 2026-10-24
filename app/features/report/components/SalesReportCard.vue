<template>
  <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
    <!-- Subtle Background Ambient Glow -->
    <div class="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

    <div class="space-y-5 relative">
      <!-- Top Header Row: Icon + Format Badge -->
      <div class="flex items-center justify-between">
        <div class="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
          <UIcon name="i-heroicons-chart-bar" class="w-7 h-7" />
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            <UIcon name="i-heroicons-table-cells" class="w-3.5 h-3.5" />
            <span>.XLSX</span>
          </span>
        </div>
      </div>

      <!-- Title & Description -->
      <div class="space-y-2">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          {{ $t('reports.sales_report_title') }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {{ $t('reports.sales_report_desc') }}
        </p>
      </div>

      <!-- Date Presets Row -->
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-indigo-500" />
            {{ $t('reports.presets') }}
          </span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in presetsList"
            :key="p.key"
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
            :class="[
              activePreset === p.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            ]"
            @click="$emit('selectPreset', p.key)"
          >
            {{ $t(p.labelKey) }}
          </button>
        </div>
      </div>

      <!-- Date Inputs Row: Start Date & End Date -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <UFormField :label="$t('reports.start_date')">
          <UInput
            v-model="startDate"
            type="date"
            class="w-full font-mono text-xs"
            size="md"
            icon="i-heroicons-calendar"
          />
        </UFormField>

        <UFormField :label="$t('reports.end_date')">
          <UInput
            v-model="endDate"
            type="date"
            class="w-full font-mono text-xs"
            size="md"
            icon="i-heroicons-calendar"
          />
        </UFormField>
      </div>

      <!-- Validation Warning if start_date > end_date -->
      <div
        v-if="startDate && endDate && startDate > endDate"
        class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2"
      >
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 shrink-0 text-rose-500" />
        <span>{{ $t('reports.invalid_date_range') }}</span>
      </div>
    </div>

    <!-- Bottom Action Button -->
    <div class="pt-6 mt-6 border-t border-slate-200/60 dark:border-slate-800/80">
      <UButton
        color="primary"
        variant="solid"
        block
        size="lg"
        icon="i-heroicons-arrow-down-tray"
        :loading="isLoading"
        :disabled="!startDate || !endDate || startDate > endDate"
        class="font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
        @click="$emit('download')"
      >
        <span v-if="isLoading">{{ $t('reports.downloading') }}</span>
        <span v-else>{{ $t('reports.download_sales') }}</span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReportPreset } from '../types'

defineProps<{
  isLoading?: boolean
  activePreset?: ReportPreset | null
}>()

const startDate = defineModel<string>('startDate', { default: '' })
const endDate = defineModel<string>('endDate', { default: '' })

defineEmits<{
  (e: 'download'): void
  (e: 'selectPreset', preset: ReportPreset): void
}>()

const presetsList: Array<{ key: ReportPreset; labelKey: string }> = [
  { key: 'this_month', labelKey: 'reports.preset_this_month' },
  { key: 'last_month', labelKey: 'reports.preset_last_month' },
  { key: 'last_30_days', labelKey: 'reports.preset_last_30_days' },
  { key: 'last_7_days', labelKey: 'reports.preset_last_7_days' },
  { key: 'today', labelKey: 'reports.preset_today' }
]
</script>
