<template>
  <UCard class="glass-panel">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-indigo-500" />
            {{ $t('dashboard.daily_chart_title') }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t('dashboard.daily_chart_subtitle') }}
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs font-medium">
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3 h-3 rounded bg-indigo-500"></span>
            Daily Income (Net Revenue)
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3 h-3 rounded bg-emerald-500"></span>
            Daily Net Profit
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span class="w-3 h-0.5 bg-amber-400 border border-dashed border-amber-500"></span>
            Forecast Target
          </span>
        </div>
      </div>
    </template>

    <div v-if="!byDate || byDate.length === 0" class="h-64 flex items-center justify-center text-slate-400 text-sm">
      {{ $t('dashboard.no_daily_data') }}
    </div>

    <div v-else class="space-y-4">
      <!-- Summary metrics header line -->
      <div class="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
        <div class="text-center">
          <p class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Total Income</p>
          <p class="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{{ formatVal(totalIncome) }}</p>
        </div>
        <div class="text-center border-x border-slate-200/60 dark:border-slate-800/60">
          <p class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Total Profit</p>
          <p class="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{{ formatVal(totalProfit) }}</p>
        </div>
        <div class="text-center">
          <p class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Orders Executed</p>
          <p class="text-sm font-black text-slate-900 dark:text-white mt-0.5">{{ totalOrders }} orders</p>
        </div>
      </div>

      <!-- Responsive SVG Grouped Bar Chart -->
      <div class="relative w-full h-64 pt-2">
        <svg class="w-full h-full overflow-visible" viewBox="0 0 700 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#4f46e5" />
            </linearGradient>
            <linearGradient id="profitBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="100%" stop-color="#059669" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines -->
          <g class="stroke-slate-200/60 dark:stroke-slate-800/80" stroke-dasharray="4 4" stroke-width="1">
            <line x1="0" y1="20" x2="700" y2="20" />
            <line x1="0" y1="70" x2="700" y2="70" />
            <line x1="0" y1="120" x2="700" y2="120" />
            <line x1="0" y1="170" x2="700" y2="170" />
          </g>

          <!-- Forecast Baseline Target Line -->
          <line
            x1="0"
            :y1="forecastLineY"
            x2="700"
            :y2="forecastLineY"
            class="stroke-amber-400 dark:stroke-amber-500"
            stroke-width="2"
            stroke-dasharray="6 4"
          />

          <!-- Grouped Bars per Date -->
          <g v-for="(group, idx) in barGroups" :key="idx">
            <!-- Income Bar -->
            <rect
              :x="group.xIncome"
              :y="group.yIncome"
              :width="group.barWidth"
              :height="group.hIncome"
              rx="3"
              fill="url(#incomeBarGrad)"
              class="transition-all hover:opacity-80 cursor-pointer"
            >
              <title>{{ group.date }}: Net Revenue {{ formatVal(group.item.net_revenue) }} (Cost: {{ formatVal(group.item.total_cost) }})</title>
            </rect>

            <!-- Profit Bar -->
            <rect
              :x="group.xProfit"
              :y="group.yProfit"
              :width="group.barWidth"
              :height="group.hProfit"
              rx="3"
              fill="url(#profitBarGrad)"
              class="transition-all hover:opacity-80 cursor-pointer"
            >
              <title>{{ group.date }}: Profit {{ formatVal(group.item.total_profit) }} ({{ group.item.total_orders }} orders)</title>
            </rect>
          </g>
        </svg>

        <!-- Date Labels -->
        <div class="flex justify-around text-xs text-slate-500 dark:text-slate-400 font-medium px-2 mt-3">
          <div v-for="item in byDate" :key="item.date" class="text-center">
            <span class="font-mono text-[11px] font-bold">{{ formatDateLabel(item.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FinancialByDate, ForecastTrendItem } from '../types'

const props = defineProps<{
  byDate: FinancialByDate[]
  forecastTrend?: ForecastTrendItem[]
}>()

const totalIncome = computed(() => {
  return (props.byDate || []).reduce((acc, i) => acc + i.net_revenue, 0)
})

const totalProfit = computed(() => {
  return (props.byDate || []).reduce((acc, i) => acc + i.total_profit, 0)
})

const totalOrders = computed(() => {
  return (props.byDate || []).reduce((acc, i) => acc + i.total_orders, 0)
})

const maxVal = computed(() => {
  if (!props.byDate || props.byDate.length === 0) return 30000
  const maxInDate = Math.max(...props.byDate.map(d => Math.max(d.net_revenue, d.total_profit)))
  return maxInDate > 0 ? maxInDate * 1.2 : 30000
})

const forecastTargetValue = computed(() => {
  if (!props.forecastTrend || props.forecastTrend.length === 0) return maxVal.value * 0.4
  const latestForecast = props.forecastTrend.find(f => f.forecast_revenue > 0)
  return latestForecast ? latestForecast.forecast_revenue / 30 : maxVal.value * 0.4
})

const forecastLineY = computed(() => {
  return 170 - (forecastTargetValue.value / maxVal.value) * 150
})

const barGroups = computed(() => {
  if (!props.byDate || props.byDate.length === 0) return []
  const chartWidth = 700
  const count = props.byDate.length
  const groupWidth = chartWidth / count
  const barWidth = Math.min(groupWidth * 0.3, 30)

  return props.byDate.map((item, i) => {
    const groupCenterX = i * groupWidth + groupWidth / 2
    const xIncome = groupCenterX - barWidth - 2
    const xProfit = groupCenterX + 2

    const hIncome = Math.max((item.net_revenue / maxVal.value) * 150, 4)
    const yIncome = 170 - hIncome

    const hProfit = Math.max((item.total_profit / maxVal.value) * 150, 4)
    const yProfit = 170 - hProfit

    return {
      date: item.date,
      xIncome,
      yIncome,
      hIncome,
      xProfit,
      yProfit,
      hProfit,
      barWidth,
      item
    }
  })
})

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`
  }
  return dateStr
}

const formatVal = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val || 0)
}
</script>
