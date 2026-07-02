<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UIcon name="i-heroicons-squares-2x2" class="w-7 h-7 text-indigo-500" />
          {{ $t('dashboard.title') }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('dashboard.subtitle') }} • <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ activeTenant.name }}</span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UBadge color="indigo" variant="subtle" size="md" class="font-semibold px-3 py-1 rounded-lg">
          <UIcon name="i-heroicons-building-office" class="w-4 h-4 mr-1.5" />
          {{ activeTenant.code }}
        </UBadge>
      </div>
    </div>

    <!-- 4 Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        v-for="m in metrics"
        :key="m.id"
        :metric="m"
      />
    </div>

    <!-- Visual Chart & Audit Trail Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <SalesTrendChart :data="chartData" />
      </div>
      <div>
        <RecentActivity :activities="activities" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useDashboardEngine } from '../features/dashboard/composables/useDashboardEngine'
import MetricCard from '../features/dashboard/components/MetricCard.vue'
import SalesTrendChart from '../features/dashboard/components/SalesTrendChart.vue'
import RecentActivity from '../features/dashboard/components/RecentActivity.vue'

const { activeTenant } = useAuthEngine()
const { metrics, chartData, activities } = useDashboardEngine()
</script>
