<template>
  <UCard class="glass-panel hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 group relative overflow-hidden p-1">
    <div class="absolute -right-6 -top-6 w-28 h-28 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/15 transition-all"></div>

    <div class="flex items-center justify-between">
      <span class="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        {{ $t(`dashboard.${metric.key}`) }}
      </span>
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
        :class="iconBgClass"
      >
        <UIcon :name="metric.icon" class="w-6 h-6" />
      </div>
    </div>

    <div class="mt-4">
      <div class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {{ metric.value }}
      </div>

      <div v-if="metric.subTextKey" class="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <span>{{ $t(`dashboard.${metric.subTextKey}`) }}</span>
        <span class="font-extrabold text-slate-800 dark:text-slate-200">{{ metric.subTextVal }}</span>
      </div>

      <div v-else-if="metric.subText" class="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        {{ metric.subText }}
      </div>

      <div v-else-if="metric.change" class="mt-2 flex items-center gap-2">
        <UBadge
          :color="metric.isPositive ? 'emerald' : 'rose'"
          variant="subtle"
          size="sm"
          class="font-bold rounded-full px-2 py-0.5"
        >
          <UIcon :name="metric.isPositive ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="w-4 h-4 mr-1" />
          {{ metric.change }}
        </UBadge>
        <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">{{ $t('dashboard.vs_last_period') }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardMetric } from '../types'

const props = defineProps<{
  metric: DashboardMetric
}>()

const iconBgClass = computed(() => {
  switch (props.metric.color) {
    case 'emerald':
      return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
    case 'amber':
      return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
    case 'sky':
      return 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
    case 'indigo':
    default:
      return 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
  }
})
</script>
