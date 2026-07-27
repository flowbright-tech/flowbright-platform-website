<template>
  <UCard class="glass-panel">
    <template #header>
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar-square" class="w-6 h-6 text-indigo-500" />
            {{ $t('dashboard.daily_chart_title') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('dashboard.daily_chart_subtitle') }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold">
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3.5 h-3.5 rounded bg-indigo-500"></span>
            {{ $t('dashboard.daily_income_legend') }}
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3.5 h-3.5 rounded bg-emerald-500"></span>
            {{ $t('dashboard.daily_profit_legend') }}
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span class="w-4 h-0.5 bg-amber-400 border border-dashed border-amber-500"></span>
            {{ $t('dashboard.forecast_target_legend') }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="!byDate || byDate.length === 0" class="h-64 flex items-center justify-center text-slate-400 text-base font-semibold">
      {{ $t('dashboard.no_daily_data') }}
    </div>

    <div v-else class="space-y-4">
      <!-- Summary metrics header line -->
      <div class="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
        <div class="text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{{ $t('dashboard.total_income_header') }}</p>
          <p class="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{{ formatVal(totalIncome) }}</p>
        </div>
        <div class="text-center border-x border-slate-200/60 dark:border-slate-800/60">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{{ $t('dashboard.total_profit_header') }}</p>
          <p class="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{{ formatVal(totalProfit) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{{ $t('dashboard.orders_executed_header') }}</p>
          <p class="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{{ totalOrders }} {{ $t('dashboard.orders_unit') }}</p>
        </div>
      </div>

      <!-- Theme-Reactive Responsive SVG Grouped Bar Chart with Native X-Axis Date Labels -->
      <div class="w-full h-72 pt-2">
        <svg class="w-full h-full overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
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
            <line x1="0" y1="65" x2="700" y2="65" />
            <line x1="0" y1="110" x2="700" y2="110" />
            <line x1="0" y1="155" x2="700" y2="155" />
          </g>

          <!-- Baseline Axis Line -->
          <line x1="0" y1="180" x2="700" y2="180" class="stroke-slate-300 dark:stroke-slate-700" stroke-width="1.5" />

          <!-- Forecast Baseline Target Line -->
          <line
            x1="0"
            :y1="forecastLineY"
            x2="700"
            :y2="forecastLineY"
            class="stroke-amber-400 dark:stroke-amber-500"
            stroke-width="2.5"
            stroke-dasharray="6 4"
          />

          <!-- Grouped Bars & Beautified X-Axis Date Labels -->
          <g v-for="(group, idx) in barGroups" :key="idx">
            <!-- Income Bar -->
            <rect
              :x="group.xIncome"
              :y="group.yIncome"
              :width="group.barWidth"
              :height="group.hIncome"
              rx="4"
              fill="url(#incomeBarGrad)"
              class="transition-all hover:opacity-85 cursor-pointer"
            >
              <title>{{ group.date }}: Revenue {{ formatVal(group.item.net_revenue) }}</title>
            </rect>

            <!-- Profit Bar -->
            <rect
              :x="group.xProfit"
              :y="group.yProfit"
              :width="group.barWidth"
              :height="group.hProfit"
              rx="4"
              fill="url(#profitBarGrad)"
              class="transition-all hover:opacity-85 cursor-pointer"
            >
              <title>{{ group.date }}: Profit {{ formatVal(group.item.total_profit) }}</title>
            </rect>

            <!-- Aligned Beautified X-Axis Date Text -->
            <text
              :x="group.centerX"
              y="208"
              text-anchor="middle"
              class="fill-slate-700 dark:fill-slate-200 font-sans text-[13px] font-extrabold tracking-wide"
            >
              {{ formatDateLabel(group.date) }}
            </text>
          </g>
        </svg>
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
  return 180 - (forecastTargetValue.value / maxVal.value) * 155
})

const barGroups = computed(() => {
  if (!props.byDate || props.byDate.length === 0) return []
  const chartWidth = 700
  const count = props.byDate.length
  const groupWidth = chartWidth / count
  const barWidth = Math.min(groupWidth * 0.32, 34)

  return props.byDate.map((item, i) => {
    const centerX = i * groupWidth + groupWidth / 2
    const xIncome = centerX - barWidth - 3
    const xProfit = centerX + 3

    const hIncome = Math.max((item.net_revenue / maxVal.value) * 155, 4)
    const yIncome = 180 - hIncome

    const hProfit = Math.max((item.total_profit / maxVal.value) * 155, 4)
    const yProfit = 180 - hProfit

    return {
      date: item.date,
      centerX,
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
  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime())) {
    const parts = dateStr.split('-')
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr
  }
  const day = dateObj.getDate()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${monthNames[dateObj.getMonth()]}`
}

const formatVal = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val || 0)
}
</script>
