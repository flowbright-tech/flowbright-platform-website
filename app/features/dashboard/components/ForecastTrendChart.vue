<template>
  <UCard class="glass-panel relative">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-presentation-chart-line" class="w-6 h-6 text-indigo-500" />
            {{ $t('dashboard.forecast_trend') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('dashboard.forecast_subtitle') }}
          </p>
        </div>
        <div class="flex items-center gap-4 text-xs sm:text-sm font-semibold">
          <span class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3.5 h-1.5 rounded-full bg-emerald-500"></span>
            {{ $t('dashboard.actual_revenue_legend') }}
          </span>
          <span class="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span class="w-3.5 h-1.5 rounded-full bg-indigo-500 border border-dashed border-indigo-400"></span>
            {{ $t('dashboard.forecast_revenue_legend') }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="!items || items.length === 0" class="h-72 flex items-center justify-center text-slate-400 text-base font-semibold">
      {{ $t('dashboard.no_data') }}
    </div>

    <!-- Theme-Reactive SVG Multi-Series Line Chart with Y-Axis Values, Floating Numbers & Mouse Hover -->
    <div v-else class="relative w-full h-80 pt-3">
      <svg
        class="w-full h-full overflow-visible"
        viewBox="0 0 760 260"
        preserveAspectRatio="none"
        @mouseleave="hoveredIdx = null"
      >
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
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
            y1="20"
            :x2="hoveredNode.x"
            y2="200"
            class="stroke-indigo-400 dark:stroke-indigo-500"
            stroke-dasharray="3 3"
            stroke-width="1.5"
          />
        </g>

        <!-- Data Point Nodes, Values & Mouse Interactivity -->
        <g v-for="(node, idx) in chartNodes" :key="idx" @mouseenter="hoveredIdx = idx">
          <!-- Hit Target Area -->
          <rect
            :x="node.x - 20"
            y="20"
            width="40"
            height="180"
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
            class="fill-indigo-600 dark:fill-indigo-400 font-sans text-[11px] font-bold"
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
            class="fill-emerald-600 dark:fill-emerald-400 font-sans text-[11px] font-black"
          >
            {{ formatValCompact(node.item.actual_revenue) }}
          </text>

          <!-- Beautified Native X-Axis Label -->
          <text
            :x="node.x"
            y="226"
            text-anchor="middle"
            class="fill-slate-700 dark:fill-slate-200 font-sans text-[12px] font-extrabold tracking-wide"
          >
            {{ formatPeriodLabel(node.period) }}
          </text>
        </g>
      </svg>

      <!-- Mouse Hover Detail Callout Card -->
      <div
        v-if="hoveredNode"
        class="absolute z-20 pointer-events-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-1.5 transition-all text-xs"
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
          <span class="font-extrabold text-emerald-600 dark:text-emerald-400">{{ formatVal(hoveredNode.item.actual_revenue) }}</span>
        </div>
        <div class="flex items-center justify-between gap-4 font-semibold">
          <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            {{ $t('dashboard.forecast_revenue_legend') }}:
          </span>
          <span class="font-extrabold text-indigo-600 dark:text-indigo-400">{{ formatVal(hoveredNode.item.forecast_revenue) }}</span>
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

const maxVal = computed(() => {
  if (!props.items || props.items.length === 0) return 30000
  const max = Math.max(
    ...props.items.map(i => Math.max(i.actual_revenue, i.forecast_revenue))
  )
  return max > 0 ? max * 1.2 : 30000
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

const chartNodes = computed(() => {
  if (!props.items || props.items.length === 0) return []
  const startX = 80
  const chartWidth = 660
  const count = props.items.length
  const step = chartWidth / Math.max(count - 1, 1)

  return props.items.map((item, i) => {
    const x = startX + i * step
    const yActual = 200 - (item.actual_revenue / maxVal.value) * 180
    const yForecast = 200 - (item.forecast_revenue / maxVal.value) * 180
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
  return `${firstX},200 ${pts} ${lastX},200`
})

const hoveredNode = computed(() => {
  if (hoveredIdx.value === null || !chartNodes.value[hoveredIdx.value]) return null
  return chartNodes.value[hoveredIdx.value]
})

const tooltipStyle = computed(() => {
  if (!hoveredNode.value) return {}
  const leftPct = (hoveredNode.value.x / 760) * 100
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

const formatVal = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 }).format(val)
}

const formatValCompact = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return `${Math.round(val)}`
}
</script>
