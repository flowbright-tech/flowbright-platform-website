<template>
  <UCard class="glass-panel">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-indigo-500" />
            {{ $t('dashboard.sales_trend') }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t('dashboard.period_this_month') }} (Q3 Performance)
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Actual Revenue
          </span>
          <span class="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            Target
          </span>
        </div>
      </div>
    </template>

    <!-- Theme-Reactive Responsive SVG Chart -->
    <div class="relative w-full h-64 pt-4">
      <svg class="w-full h-full overflow-visible" viewBox="0 0 700 220" preserveAspectRatio="none">
        <defs>
          <!-- Indigo Area Gradient -->
          <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Gridlines -->
        <g class="stroke-slate-200/60 dark:stroke-slate-800/80" stroke-dasharray="4 4" stroke-width="1">
          <line x1="0" y1="30" x2="700" y2="30" />
          <line x1="0" y1="80" x2="700" y2="80" />
          <line x1="0" y1="130" x2="700" y2="130" />
          <line x1="0" y1="180" x2="700" y2="180" />
        </g>

        <!-- Target Line (Dashed) -->
        <path
          d="M 20 150 Q 120 135, 220 125 T 420 105 T 680 75"
          fill="none"
          class="stroke-slate-400/70 dark:stroke-slate-600/70"
          stroke-width="2"
          stroke-dasharray="6 6"
        />

        <!-- Revenue Area Fill -->
        <path
          d="M 20 140 Q 120 110, 220 120 T 420 70 T 680 30 L 680 190 L 20 190 Z"
          fill="url(#indigoGradient)"
        />

        <!-- Revenue Trend Line -->
        <path
          d="M 20 140 Q 120 110, 220 120 T 420 70 T 680 30"
          fill="none"
          class="stroke-indigo-600 dark:stroke-indigo-400"
          stroke-width="3.5"
          stroke-linecap="round"
        />

        <!-- Interactive Data Points -->
        <g v-for="(pt, idx) in points" :key="idx">
          <circle
            :cx="pt.x"
            :cy="pt.y"
            r="5"
            class="fill-white dark:fill-slate-900 stroke-indigo-600 dark:stroke-indigo-400 stroke-[3] transition-all hover:r-7 cursor-pointer"
          />
        </g>
      </svg>

      <!-- Month Labels -->
      <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-2 mt-2">
        <span v-for="item in data" :key="item.month">{{ item.month }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChartDataPoint } from '../types'

const props = defineProps<{
  data: ChartDataPoint[]
}>()

const points = computed(() => {
  const width = 700
  const count = props.data.length
  const step = width / (count - 1)
  return props.data.map((d, i) => {
    // scale revenue 400k..900k to y coord 170..30
    const y = 170 - ((d.revenue - 400000) / 500000) * 140
    return {
      x: 20 + i * ((width - 40) / (count - 1)),
      y
    }
  })
})
</script>
