<template>
  <UCard class="glass-panel relative">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar-square" class="w-5.5 h-5.5 sm:w-6 sm:h-6 text-indigo-500 shrink-0" />
            {{ $t('dashboard.daily_chart_title') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t('dashboard.daily_chart_subtitle') }}
          </p>
        </div>

        <!-- Legend Swatches -->
        <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3 h-3 rounded bg-indigo-500"></span>
            {{ $t('dashboard.daily_income_legend') }}
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3 h-3 rounded bg-emerald-500"></span>
            {{ $t('dashboard.daily_profit_legend') }}
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span class="w-3.5 h-0.5 bg-amber-400 border border-dashed border-amber-500"></span>
            {{ $t('dashboard.forecast_target_legend') }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="!byDate || byDate.length === 0" class="h-72 flex items-center justify-center text-slate-400 text-sm sm:text-base font-semibold">
      {{ $t('dashboard.no_daily_data') }}
    </div>

    <div v-else class="space-y-4">
      <!-- Summary metrics header line -->
      <div class="grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
        <div class="text-center">
          <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold truncate">{{ $t('dashboard.total_income_header') }}</p>
          <p class="text-sm sm:text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono truncate">{{ formatFullVal(totalIncome) }}</p>
        </div>
        <div class="text-center border-x border-slate-200/60 dark:border-slate-800/60">
          <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold truncate">{{ $t('dashboard.total_profit_header') }}</p>
          <p class="text-sm sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono truncate">{{ formatFullVal(totalProfit) }}</p>
        </div>
        <div class="text-center">
          <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold truncate">{{ $t('dashboard.orders_executed_header') }}</p>
          <p class="text-sm sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 truncate">{{ totalOrders }} <span class="text-xs font-semibold">{{ $t('dashboard.orders_unit') }}</span></p>
        </div>
      </div>

      <!-- Touch & Responsive Chart Viewport with Zero Overlap Y-Axis -->
      <div class="relative w-full overflow-x-auto scrollbar-thin pt-2">
        <div class="min-w-[580px] sm:min-w-full h-72 sm:h-84">
          <svg
            class="w-full h-full overflow-visible"
            viewBox="0 0 800 260"
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

            <!-- Clean Top-Left Y-Axis Header Label -->
            <text
              x="88"
              y="14"
              text-anchor="end"
              class="fill-slate-400 dark:fill-slate-500 font-sans text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider"
            >
              {{ $t('dashboard.revenue_in_thb') }}
            </text>

            <!-- Y-Axis Gridlines & Spaced Numbers -->
            <g v-for="(tick, tIdx) in yTicks" :key="tIdx">
              <line
                x1="100"
                :y1="tick.y"
                x2="780"
                :y2="tick.y"
                class="stroke-slate-200/80 dark:stroke-slate-800/80"
                stroke-dasharray="4 4"
                stroke-width="1"
              />
              <text
                x="88"
                :y="tick.y + 4"
                text-anchor="end"
                class="fill-slate-500 dark:fill-slate-400 font-mono text-[10px] sm:text-[11px] font-bold"
              >
                {{ tick.label }}
              </text>
            </g>

            <!-- Baseline Axis Line -->
            <line x1="100" y1="210" x2="780" y2="210" class="stroke-slate-300 dark:stroke-slate-700" stroke-width="1.5" />

            <!-- Forecast Target Line -->
            <line
              x1="100"
              :y1="forecastLineY"
              x2="780"
              :y2="forecastLineY"
              class="stroke-amber-400 dark:stroke-amber-500"
              stroke-width="2.5"
              stroke-dasharray="6 4"
            />

            <!-- Grouped Bars, Floating Value Labels, and Hover Overlay -->
            <g
              v-for="(group, idx) in barGroups"
              :key="idx"
              @mouseenter="hoveredIdx = idx"
              @touchstart.passive="hoveredIdx = idx"
              @click="hoveredIdx = idx"
            >
              <!-- Hover Background Highlight Column -->
              <rect
                v-if="hoveredIdx === idx"
                :x="group.groupCenterX - group.groupWidth / 2"
                y="25"
                :width="group.groupWidth"
                height="185"
                class="fill-indigo-500/10 dark:fill-indigo-400/15 rx-md cursor-pointer"
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

              <!-- Floating Clean Number above Income Bar -->
              <text
                v-if="group.item.net_revenue > 0"
                :x="group.xIncome + group.barWidth / 2"
                :y="group.yIncome - 6"
                text-anchor="middle"
                class="fill-indigo-600 dark:fill-indigo-400 font-mono text-[10px] sm:text-[11px] font-black"
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

              <!-- Floating Clean Number above Profit Bar -->
              <text
                v-if="group.item.total_profit > 0"
                :x="group.xProfit + group.barWidth / 2"
                :y="group.yProfit - 6"
                text-anchor="middle"
                class="fill-emerald-600 dark:fill-emerald-400 font-mono text-[10px] sm:text-[11px] font-black"
              >
                {{ formatValCompact(group.item.total_profit) }}
              </text>

              <!-- Aligned Beautified X-Axis Date Text -->
              <text
                :x="group.groupCenterX"
                y="238"
                text-anchor="middle"
                class="fill-slate-700 dark:fill-slate-200 font-sans text-[11px] sm:text-[12px] font-extrabold tracking-wide"
              >
                {{ formatDateLabel(group.date) }}
              </text>
            </g>
          </svg>
        </div>

        <!-- Touch & Mouse Hover Interactive Detail Callout Card -->
        <div
          v-if="hoveredGroup"
          class="absolute z-20 pointer-events-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-1.5 transition-all text-xs"
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
            <span class="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{{ formatFullVal(hoveredGroup.item.net_revenue) }}</span>
          </div>
          <div class="flex items-center justify-between gap-4 font-semibold">
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span class="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              {{ $t('dashboard.daily_profit_legend') }}:
            </span>
            <span class="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatFullVal(hoveredGroup.item.total_profit) }}</span>
          </div>
          <div class="flex items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Cost: {{ formatFullVal(hoveredGroup.item.total_cost) }}</span>
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

// Calculate clean rounded maximum Y value
const roundedMaxVal = computed(() => {
  if (!props.byDate || props.byDate.length === 0) return 30000
  const maxInDate = Math.max(...props.byDate.map(d => Math.max(d.net_revenue, d.total_profit)))
  if (maxInDate <= 0) return 30000
  const target = maxInDate * 1.15
  const magnitude = Math.pow(10, Math.floor(Math.log10(target)))
  return Math.ceil(target / (magnitude / 2)) * (magnitude / 2)
})

const yTicks = computed(() => {
  const count = 5
  const max = roundedMaxVal.value
  const ticks = []
  for (let i = 0; i <= count; i++) {
    const val = (max / count) * i
    const y = 210 - (val / max) * 180
    ticks.push({
      val,
      y,
      label: formatFullVal(val)
    })
  }
  return ticks.reverse()
})

const forecastTargetValue = computed(() => {
  if (!props.forecastTrend || props.forecastTrend.length === 0) return roundedMaxVal.value * 0.4
  const latestForecast = props.forecastTrend.find(f => f.forecast_revenue > 0)
  return latestForecast ? latestForecast.forecast_revenue / 30 : roundedMaxVal.value * 0.4
})

const forecastLineY = computed(() => {
  return 210 - (forecastTargetValue.value / roundedMaxVal.value) * 180
})

const barGroups = computed(() => {
  if (!props.byDate || props.byDate.length === 0) return []
  const startX = 100
  const chartWidth = 680
  const count = props.byDate.length
  const groupWidth = chartWidth / count
  const barWidth = Math.min(groupWidth * 0.34, 32)

  return props.byDate.map((item, i) => {
    const groupCenterX = startX + i * groupWidth + groupWidth / 2
    const xIncome = groupCenterX - barWidth - 2.5
    const xProfit = groupCenterX + 2.5

    const hIncome = Math.max((item.net_revenue / roundedMaxVal.value) * 180, 4)
    const yIncome = 210 - hIncome

    const hProfit = Math.max((item.total_profit / roundedMaxVal.value) * 180, 4)
    const yProfit = 210 - hProfit

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
  const leftPct = (hoveredGroup.value.groupCenterX / 800) * 100
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

const formatValCompact = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return `${Math.round(val)}`
}

const formatFullVal = (val: number) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)
}
</script>
