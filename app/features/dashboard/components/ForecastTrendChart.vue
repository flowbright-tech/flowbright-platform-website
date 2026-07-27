<template>
  <UCard class="glass-panel relative">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-presentation-chart-line" class="w-5.5 h-5.5 sm:w-6 sm:h-6 text-indigo-500 shrink-0" />
            {{ $t('dashboard.forecast_trend') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t('dashboard.forecast_subtitle') }}
          </p>
        </div>
        <div class="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3 h-1.5 rounded-full bg-emerald-500"></span>
            {{ $t('dashboard.actual_revenue_legend') }}
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span class="w-3 h-1.5 rounded-full bg-indigo-500 border border-dashed border-indigo-400"></span>
            {{ $t('dashboard.forecast_revenue_legend') }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="!items || items.length === 0" class="h-72 flex items-center justify-center text-slate-400 text-sm sm:text-base font-semibold">
      {{ $t('dashboard.no_data') }}
    </div>

    <!-- Touch & Responsive Chart Viewport with Top-Left Axis Label -->
    <div v-else class="relative w-full overflow-x-auto scrollbar-thin pt-3">
      <div class="min-w-[580px] sm:min-w-full h-72 sm:h-84">
        <svg
          class="w-full h-full overflow-visible"
          viewBox="0 0 800 260"
          preserveAspectRatio="none"
          @mouseleave="hoveredIdx = null"
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Clean Top-Left Y-Axis Label "Revenue in THB" -->
          <text
            x="20"
            y="16"
            text-anchor="start"
            class="fill-slate-400 dark:fill-slate-500 font-sans text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider"
          >
            {{ $t('dashboard.revenue_in_thb') }}
          </text>

          <!-- Y-Axis Gridlines & Right-Aligned Numbers -->
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

          <!-- Forecast Line (Dashed) -->
          <polyline
            :points="forecastPoints"
            fill="none"
            class="stroke-indigo-500 dark:stroke-indigo-400"
            stroke-width="3"
            stroke-dasharray="6 4"
          />

          <!-- Actual Revenue Area Fill -->
          <polygon
            :points="actualAreaPoints"
            fill="url(#actualGradient)"
          />

          <!-- Actual Line -->
          <polyline
            :points="actualPoints"
            fill="none"
            class="stroke-emerald-500 dark:stroke-emerald-400"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Hover Guideline Column -->
          <g v-if="hoveredNode">
            <line
              :x1="hoveredNode.x"
              y1="25"
              :x2="hoveredNode.x"
              y2="210"
              class="stroke-indigo-400 dark:stroke-indigo-500"
              stroke-dasharray="3 3"
              stroke-width="1.5"
            />
          </g>

          <!-- Data Point Nodes, Values & Mouse/Touch Interactivity -->
          <g
            v-for="(node, idx) in chartNodes"
            :key="idx"
            @mouseenter="hoveredIdx = idx"
            @touchstart.passive="hoveredIdx = idx"
            @click="hoveredIdx = idx"
          >
            <!-- Hit Target Area -->
            <rect
              :x="node.x - 20"
              y="25"
              width="40"
              height="185"
              fill="transparent"
              class="cursor-pointer"
            />

            <!-- Forecast Node -->
            <circle
              :cx="node.x"
              :cy="node.yForecast"
              :r="hoveredIdx === idx ? 7 : 5"
              class="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-2 transition-all cursor-pointer"
            />

            <!-- Forecast Floating Value Label -->
            <text
              v-if="node.item.forecast_revenue > 0"
              :x="node.x"
              :y="node.yForecast - 8"
              text-anchor="middle"
              class="fill-indigo-600 dark:fill-indigo-400 font-mono text-[10px] sm:text-[11px] font-bold"
            >
              {{ formatValCompact(node.item.forecast_revenue) }}
            </text>

            <!-- Actual Node -->
            <circle
              v-if="node.item.actual_revenue > 0"
              :cx="node.x"
              :cy="node.yActual"
              :r="hoveredIdx === idx ? 8 : 6"
              class="fill-white dark:fill-slate-900 stroke-emerald-500 stroke-[3] transition-all cursor-pointer"
            />

            <!-- Actual Floating Value Label -->
            <text
              v-if="node.item.actual_revenue > 0"
              :x="node.x"
              :y="node.yActual - 10"
              text-anchor="middle"
              class="fill-emerald-600 dark:fill-emerald-400 font-mono text-[10px] sm:text-[11px] font-black"
            >
              {{ formatValCompact(node.item.actual_revenue) }}
            </text>

            <!-- Beautified Native X-Axis Label -->
            <text
              :x="node.x"
              y="238"
              text-anchor="middle"
              class="fill-slate-700 dark:fill-slate-200 font-sans text-[11px] sm:text-[12px] font-extrabold tracking-wide"
            >
              {{ formatPeriodLabel(node.period) }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Touch & Mouse Hover Detail Callout Card -->
      <div
        v-if="hoveredNode"
        class="absolute z-20 pointer-events-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-1.5 transition-all text-xs"
        :style="tooltipStyle"
      >
        <p class="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center justify-between gap-3">
          <span>{{ formatPeriodLabel(hoveredNode.period) }} ({{ hoveredNode.period }})</span>
          <UBadge color="indigo" variant="subtle" size="xs" class="font-bold">
            PROJECTION
          </UBadge>
        </p>
        <div class="flex items-center justify-between gap-4 font-semibold">
          <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {{ $t('dashboard.actual_revenue_legend') }}:
          </span>
          <span class="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatFullVal(hoveredNode.item.actual_revenue) }}</span>
        </div>
        <div class="flex items-center justify-between gap-4 font-semibold">
          <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            {{ $t('dashboard.forecast_revenue_legend') }}:
          </span>
          <span class="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{{ formatFullVal(hoveredNode.item.forecast_revenue) }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ForecastTrendItem } from '../types'

const props = defineProps<{
  items: ForecastTrendItem[]
}>()

const hoveredIdx = ref<number | null>(null)

// Calculate clean rounded maximum Y value
const roundedMaxVal = computed(() => {
  if (!props.items || props.items.length === 0) return 30000
  const max = Math.max(
    ...props.items.map(i => Math.max(i.actual_revenue, i.forecast_revenue))
  )
  if (max <= 0) return 30000
  const target = max * 1.15
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

const chartNodes = computed(() => {
  if (!props.items || props.items.length === 0) return []
  const startX = 100
  const chartWidth = 660
  const count = props.items.length
  const step = chartWidth / Math.max(count - 1, 1)

  return props.items.map((item, i) => {
    const x = startX + i * step
    const yActual = 210 - (item.actual_revenue / roundedMaxVal.value) * 185
    const yForecast = 210 - (item.forecast_revenue / roundedMaxVal.value) * 185
    return {
      x,
      yActual,
      yForecast,
      period: item.period,
      item
    }
  })
})

const forecastPoints = computed(() => {
  return chartNodes.value.map(n => `${n.x},${n.yForecast}`).join(' ')
})

const actualPoints = computed(() => {
  return chartNodes.value.map(n => `${n.x},${n.yActual}`).join(' ')
})

const actualAreaPoints = computed(() => {
  if (chartNodes.value.length === 0) return ''
  const firstX = chartNodes.value[0].x
  const lastX = chartNodes.value[chartNodes.value.length - 1].x
  const pts = chartNodes.value.map(n => `${n.x},${n.yActual}`).join(' ')
  return `${firstX},210 ${pts} ${lastX},210`
})

const hoveredNode = computed(() => {
  if (hoveredIdx.value === null || !chartNodes.value[hoveredIdx.value]) return null
  return chartNodes.value[hoveredIdx.value]
})

const tooltipStyle = computed(() => {
  if (!hoveredNode.value) return {}
  const leftPct = (hoveredNode.value.x / 800) * 100
  return {
    left: `${Math.min(Math.max(leftPct, 15), 75)}%`,
    top: '25px',
    transform: 'translateX(-50%)'
  }
})

const formatPeriodLabel = (periodStr: string) => {
  if (!periodStr) return ''
  const parts = periodStr.split('-')
  if (parts.length === 2) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const mIdx = parseInt(parts[1], 10) - 1
    if (mIdx >= 0 && mIdx < 12) {
      return `${monthNames[mIdx]} '${parts[0].substring(2)}`
    }
  }
  return periodStr
}

const formatValCompact = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return `${Math.round(val)}`
}

const formatFullVal = (val: number) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
}
</script>
