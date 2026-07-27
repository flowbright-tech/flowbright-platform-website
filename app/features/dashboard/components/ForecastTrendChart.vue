<template>
  <UCard class="glass-panel">
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

    <div v-if="!items || items.length === 0" class="h-64 flex items-center justify-center text-slate-400 text-base font-semibold">
      {{ $t('dashboard.no_data') }}
    </div>

    <!-- SVG Multi-Series Line Chart -->
    <div v-else class="relative w-full h-64 pt-4">
      <svg class="w-full h-full overflow-visible" viewBox="0 0 700 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Grid lines -->
        <g class="stroke-slate-200/60 dark:stroke-slate-800/80" stroke-dasharray="4 4" stroke-width="1">
          <line x1="0" y1="30" x2="700" y2="30" />
          <line x1="0" y1="75" x2="700" y2="75" />
          <line x1="0" y1="120" x2="700" y2="120" />
          <line x1="0" y1="165" x2="700" y2="165" />
        </g>

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

        <!-- Data Point Nodes -->
        <g v-for="(node, idx) in chartNodes" :key="idx">
          <!-- Forecast Node -->
          <circle
            :cx="node.x"
            :cy="node.yForecast"
            r="5"
            class="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-2 hover:r-7 transition-all"
          >
            <title>{{ node.period }}: {{ $t('dashboard.forecast') }} {{ formatVal(node.item.forecast_revenue) }}</title>
          </circle>

          <!-- Actual Node -->
          <circle
            v-if="node.item.actual_revenue > 0"
            :cx="node.x"
            :cy="node.yActual"
            r="6"
            class="fill-white dark:fill-slate-900 stroke-emerald-500 stroke-[3] hover:r-8 transition-all cursor-pointer"
          >
            <title>{{ node.period }}: {{ $t('dashboard.actual') }} {{ formatVal(node.item.actual_revenue) }}</title>
          </circle>
        </g>
      </svg>

      <!-- Period Labels -->
      <div class="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold px-2 mt-4">
        <span v-for="item in items" :key="item.period">{{ item.period }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ForecastTrendItem } from '../types'

const props = defineProps<{
  items: ForecastTrendItem[]
}>()

const maxVal = computed(() => {
  if (!props.items || props.items.length === 0) return 30000
  const max = Math.max(
    ...props.items.map(i => Math.max(i.actual_revenue, i.forecast_revenue))
  )
  return max > 0 ? max * 1.15 : 30000
})

const chartNodes = computed(() => {
  if (!props.items || props.items.length === 0) return []
  const width = 700
  const count = props.items.length
  const step = (width - 40) / Math.max(count - 1, 1)

  return props.items.map((item, i) => {
    const x = 20 + i * step
    const yActual = 185 - (item.actual_revenue / maxVal.value) * 155
    const yForecast = 185 - (item.forecast_revenue / maxVal.value) * 155
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
  return `${firstX},185 ${pts} ${lastX},185`
})

const formatVal = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val)
}
</script>
