<template>
  <UCard class="glass-panel h-full flex flex-col">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-amber-500" />
            {{ $t('dashboard.top_sales_packages') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('dashboard.top_packages_subtitle') }}
          </p>
        </div>
        <UBadge color="amber" variant="subtle" size="sm" class="font-bold px-2.5 py-1">
          {{ $t('dashboard.top_sales_badge') }}
        </UBadge>
      </div>
    </template>

    <div v-if="!packages || packages.length === 0" class="py-8 text-center text-slate-400 text-base font-semibold">
      {{ $t('dashboard.no_packages_sold') }}
    </div>

    <div v-else class="space-y-4 my-auto">
      <div
        v-for="(item, idx) in packages"
        :key="item.package_id"
        class="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
              :class="rankBadgeClass(idx)"
            >
              #{{ idx + 1 }}
            </span>
            <span class="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {{ item.package_name }}
            </span>
          </div>

          <span class="text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0 ml-2">
            {{ item.quantity_sold }} {{ $t('dashboard.sold') }}
          </span>
        </div>

        <!-- Relative Progress Bar -->
        <div class="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="progressBarClass(idx)"
            :style="{ width: `${getPercentage(item.total_revenue)}%` }"
          ></div>
        </div>

        <div class="flex justify-between items-center mt-2.5 text-sm font-semibold">
          <span class="text-slate-500 dark:text-slate-400">{{ $t('dashboard.revenue_label') }}</span>
          <span class="font-extrabold text-base text-slate-900 dark:text-white">
            {{ formatCurrency(item.total_revenue) }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TopSalesPackage } from '../types'

const props = defineProps<{
  packages: TopSalesPackage[]
}>()

const maxRevenue = computed(() => {
  if (!props.packages || props.packages.length === 0) return 1
  return Math.max(...props.packages.map(p => p.total_revenue))
})

const getPercentage = (revenue: number) => {
  if (maxRevenue.value === 0) return 0
  return Math.min(Math.round((revenue / maxRevenue.value) * 100), 100)
}

const rankBadgeClass = (idx: number) => {
  if (idx === 0) return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
  if (idx === 1) return 'bg-slate-300/40 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200'
  return 'bg-amber-900/10 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
}

const progressBarClass = (idx: number) => {
  if (idx === 0) return 'bg-gradient-to-r from-amber-500 to-indigo-600'
  if (idx === 1) return 'bg-indigo-500'
  return 'bg-sky-500'
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val)
}
</script>
