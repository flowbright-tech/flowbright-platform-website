<template>
  <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
    <!-- Subtle Background Ambient Glow -->
    <div class="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

    <div class="space-y-5 relative">
      <!-- Top Header Row: Icon + Format Badge -->
      <div class="flex items-center justify-between">
        <div class="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
          <UIcon name="i-heroicons-archive-box" class="w-7 h-7" />
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <UIcon name="i-heroicons-table-cells" class="w-3.5 h-3.5" />
            <span>.XLSX</span>
          </span>
        </div>
      </div>

      <!-- Title & Description -->
      <div class="space-y-2">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          {{ $t('reports.stock_report_title') }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {{ $t('reports.stock_report_desc') }}
        </p>
      </div>

      <!-- Feature Highlights -->
      <div class="grid grid-cols-2 gap-2.5 pt-2">
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-2.5">
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500 shrink-0" />
          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">
            {{ locale === 'th' ? 'จำนวนคงเหลือล่าสุด' : 'Current Stock Quantities' }}
          </span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-2.5">
          <UIcon name="i-heroicons-tag" class="w-4 h-4 text-indigo-500 shrink-0" />
          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">
            {{ locale === 'th' ? 'หมวดหมู่และราคาทุน' : 'Categories & Cost Valuations' }}
          </span>
        </div>
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
        class="font-bold shadow-md shadow-emerald-500/10 cursor-pointer"
        @click="$emit('download')"
      >
        <span v-if="isLoading">{{ $t('reports.downloading') }}</span>
        <span v-else>{{ $t('reports.download_stock') }}</span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  isLoading?: boolean
}>()

defineEmits<{
  (e: 'download'): void
}>()

const { locale } = useI18n()
</script>
