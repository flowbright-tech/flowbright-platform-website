<template>
  <UCard class="glass-panel hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 group relative overflow-hidden">
    <div class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/15 transition-all"></div>

    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {{ $t(`dashboard.${metric.key}`) }}
      </span>
      <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
        <UIcon :name="metric.icon" class="w-5 h-5" />
      </div>
    </div>

    <div class="mt-4 flex items-baseline justify-between">
      <div class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {{ metric.value }}
        <span v-if="metric.unitKey" class="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
          {{ $t(`dashboard.${metric.unitKey}`) }}
        </span>
      </div>

      <UBadge
        :color="metric.isPositive ? 'emerald' : 'rose'"
        variant="subtle"
        size="xs"
        class="font-semibold rounded-full"
      >
        <UIcon :name="metric.isPositive ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="w-3 h-3 mr-0.5" />
        {{ metric.change }}
      </UBadge>
    </div>

    <div class="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
      {{ $t('dashboard.vs_last_month') }}
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DashboardMetric } from '../types'

defineProps<{
  metric: DashboardMetric
}>()
</script>
