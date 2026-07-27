<template>
  <UCard class="glass-panel relative">
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

    <div v-if="!byDate || byDate.length === 0" class="h-72 flex items-center justify-center text-slate-400 text-base font-semibold">
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

      <!-- Responsive SVG Bar Chart with Left Y-Axis Values & Floating Numerical Values -->
      <div class="relative w-full h-80 pt-2">
        <svg
          class="w-full h-full overflow-visible"
          viewBox="0 0 760 260"
          preserveAspectRatio="none"
          @mouseleave="hoveredIdx = null"
        >
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

          <!-- Y-Axis Title -->
          <text
            x="12"
            y="12"
            class="fill-slate-400 dark:fill-slate-500 font-sans text-[11px] font-bold uppercase tracking-wider"
          >
            {{ $t('dashboard.revenue_in_thb') }}
          </text>

          <!-- Y-Axis Numerical Gridlines & Labels -->
          <g v-for="(tick, tIdx) in yTicks" :key="tIdx">
            <line
              x1="70"
              :y1="tick.y"
              x2="760"
              :y2="tick.y"
              class="stroke-slate-200/80 dark:stroke-slate-800/80"
              stroke-dasharray="4 4"
              stroke-width="1"
            />
            <text
              x="62"
              :y="tick.y + 4"
              text-anchor="end"
              class="fill-slate-400 dark:fill-slate-500 font-sans text-[11px] font-semibold"
            >
              {{ tick.label }}
            </text>
          </g>

          <!-- Baseline Axis Line -->
          <line x1="70" y1="200" x2="760" y2="200" class="stroke-slate-300 dark:stroke-slate-700" stroke-width="1.5" />

          <!-- Forecast Baseline Target Line -->
          <line
            x1="70"
            :y1="forecastLineY"
            x2="760"
            :y2="forecastLineY"
            class="stroke-amber-400 dark:stroke-amber-500"
            stroke-width="2.5"
            stroke-dasharray="6 4"
          />

          <!-- Grouped Bars, Numerical Labels, and Hover Overlay -->
          <g
            v-for="(group, idx) in barGroups"
            :key="idx"
            @mouseenter="hoveredIdx = idx"
          >
            <!-- Hover Background Highlight Column -->
            <rect
              v-if="hoveredIdx === idx"
              :x="group.groupCenterX - group.groupWidth / 2"
              y="20"
              :width="group.groupWidth"
              height="180"
              class="fill-indigo-500/5 dark:fill-indigo-400/10 rx-md"
            />

            <!-- Income Bar -->
            <rect
              :x="group.xIncome"
              :y="group.yIncome"
              :width="group.barWidth"
              :height="group.hIncome"
              rx="4"
              fill="url(#incomeBarGrad)"
              class="transition-all hover:opacity-90 cursor-pointer"
            />

            <!-- Floating Numerical Value above Income Bar -->
            <text
              v-if="group.item.net_revenue > 0"
              :x="group.xIncome + group.barWidth / 2"
              :y="group.yIncome - 6"
              text-anchor="middle"
              class="fill-indigo-600 dark:fill-indigo-400 font-sans text-[11px] font-black"
            >
              {{ formatValCompact(group.item.net_revenue) }}
            </text>

            <!-- Profit Bar -->
            <rect
              :x="group.xProfit"
              :y="group.yProfit"
              :width="group.barWidth"
              :height="group.hProfit"
              rx="4"
              fill="url(#profitBarGrad)"
              class="transition-all hover:opacity-90 cursor-pointer"
            />

            <!-- Floating Numerical Value above Profit Bar -->
            <text
              v-if="group.item.total_profit > 0"
              :x="group.xProfit + group.barWidth / 2"
              :y="group.yProfit - 6"
              text-anchor="middle"
              class="fill-emerald-600 dark:fill-emerald-400 font-sans text-[11px] font-black"
            >
              {{ formatValCompact(group.item.total_profit) }}
            </text>

            <!-- Aligned Beautified X-Axis Date Text -->
            <text
              :x="group.groupCenterX"
              y="226"
              text-anchor="middle"
              class="fill-slate-700 dark:fill-slate-200 font-sans text-[12px] font-extrabold tracking-wide"
            >
              {{ formatDateLabel(group.date) }}
            </text>
          </g>
        </svg>

        <!-- Mouse Hover Interactive Detail Tooltip Card -->
        <div
          v-if="hoveredGroup"
          class="absolute z-20 pointer-events-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-1.5 transition-all text-xs"
          :style="tooltipStyle"
        >
          <p class="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center justify-between gap-3">
            <span>{{ hoveredGroup.date }}</span>
            <span class="text-indigo-600 dark:text-indigo-400 font-mono">{{ hoveredGroup.item.total_orders }} {{ $t('dashboard.orders_unit') }}</span>
          </p>
          <div class="flex items-center justify-between gap-4 font-semibold">
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span class="w-2.5 h-2.5 rounded bg-indigo-500"></span>
              {{ $t('dashboard.daily_income_legend') }}:
            </span>
            <span class="font-extrabold text-indigo-600 dark:text-indigo-400">{{ formatVal(hoveredGroup.item.net_revenue) }}</span>
          </div>
          <div class="flex items-center justify-between gap-4 font-semibold">
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span class="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              {{ $t('dashboard.daily_profit_legend') }}:
            </span>
            <span class="font-extrabold text-emerald-600 dark:text-emerald-400">{{ formatVal(hoveredGroup.item.total_profit) }}</span>
          </div>
          <div class="flex items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Cost: {{ formatVal(hoveredGroup.item.total_cost) }}</span>
            <span>Margin: {{ calculateMargin(hoveredGroup.item) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FinancialByDate, ForecastTrendItem } from '../types'

const props = defineProps<{
  byDate: FinancialByDate[]
  forecastTrend?: ForecastTrendItem[]
}>()

const hoveredIdx = ref<number | null>(null)

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
  return maxInDate > 0 ? maxInDate * 1.25 : 30000
})

const yTicks = computed(() => {
  const count = 4
  const max = maxVal.value
  const ticks = []
  for (let i = 0; i <= count; i++) {
    const val = (max / count) * i
    const y = 200 - (val / max) * 180
    ticks.push({
      val,
      y,
      label: formatValCompact(val)
    })
  }
  return ticks
})

const forecastTargetValue = computed(() => {
  if (!props.forecastTrend || props.forecastTrend.length === 0) return maxVal.value * 0.4
  const latestForecast = props.forecastTrend.find(f => f.forecast_revenue > 0)
  return latestForecast ? latestForecast.forecast_revenue / 30 : maxVal.value * 0.4
})

const forecastLineY = computed(() => {
  return 200 - (forecastTargetValue.value / maxVal.value) * 180
})

const barGroups = computed(() => {
  if (!props.byDate || props.byDate.length === 0) return []
  const startX = 70
  const chartWidth = 690
  const count = props.byDate.length
  const groupWidth = chartWidth / count
  const barWidth = Math.min(groupWidth * 0.32, 34)

  return props.byDate.map((item, i) => {
    const groupCenterX = startX + i * groupWidth + groupWidth / 2
    const xIncome = groupCenterX - barWidth - 3
    const xProfit = groupCenterX + 3

    const hIncome = Math.max((item.net_revenue / maxVal.value) * 180, 4)
    const yIncome = 200 - hIncome

    const hProfit = Math.max((item.total_profit / maxVal.value) * 180, 4)
    const yProfit = 200 - hProfit

    return {
      date: item.date,
      groupCenterX,
      groupWidth,
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

const hoveredGroup = computed(() => {
  if (hoveredIdx.value === null || !barGroups.value[hoveredIdx.value]) return null
  return barGroups.value[hoveredIdx.value]
})

const tooltipStyle = computed(() => {
  if (!hoveredGroup.value) return {}
  const leftPct = (hoveredGroup.value.groupCenterX / 760) * 100
  return {
    left: `${Math.min(Math.max(leftPct, 15), 75)}%`,
    top: '25px',
    transform: 'translateX(-50%)'
  }
})

const calculateMargin = (item: FinancialByDate) => {
  if (!item.net_revenue || item.net_revenue === 0) return 0
  return Math.round((item.total_profit / item.net_revenue) * 100)
}

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

const formatValCompact = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return `${Math.round(val)}`
}
</script>
