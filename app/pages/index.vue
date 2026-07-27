<template>
  <div class="space-y-8 max-w-7xl mx-auto pb-12">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800/80">
      <div class="flex items-center gap-4">
        <img
          v-if="company?.image_url"
          :src="company.image_url"
          alt="Company Logo"
          class="w-14 h-14 rounded-2xl object-contain bg-white p-1.5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
          @error="handleImageError"
        />
        <div v-else class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
          {{ companyInitials }}
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {{ companyName }}
          </h1>
          <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
            {{ locale === 'th' ? 'ยินดีต้อนรับกลับมา' : 'Welcome back' }}, <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ userName }}</span>
          </p>
        </div>
      </div>

      <!-- Controls: Refresh Button & Badges -->
      <div class="flex flex-wrap items-center gap-3">
        <UBadge color="indigo" variant="subtle" size="md" class="font-bold px-3.5 py-1.5 rounded-xl text-sm">
          <UIcon name="i-heroicons-shield-check" class="w-5 h-5 mr-1.5 text-indigo-500" />
          {{ $t('dashboard.role') }} {{ user?.role || 'Admin' }}
        </UBadge>
        <UBadge color="emerald" variant="solid" size="md" class="font-bold px-3.5 py-1.5 rounded-xl text-sm text-white">
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5 mr-1.5" />
          {{ company?.plan?.toUpperCase() || 'FREE' }} {{ $t('dashboard.plan') }}
        </UBadge>
        <UButton
          color="neutral"
          variant="outline"
          size="md"
          :loading="isLoading"
          class="rounded-xl font-bold px-4 py-2 text-sm"
          @click="fetchDashboard"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-1.5" />
          {{ $t('dashboard.refresh') }}
        </UButton>
      </div>
    </div>

    <!-- Error Alert banner if any -->
    <UAlert
      v-if="errorMsg"
      color="rose"
      variant="subtle"
      icon="i-heroicons-exclamation-triangle"
      :title="$t('dashboard.sync_error')"
      :description="errorMsg"
      class="rounded-2xl text-base"
    />

    <!-- 4 Primary Executive Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <MetricCard
        v-for="m in metrics"
        :key="m.id"
        :metric="m"
      />
    </div>

    <!-- Daily Financial Income & Profit Bar Chart -->
    <div class="grid grid-cols-1 gap-8">
      <DailyFinancialBarChart
        :by-date="dailyFinancialRecords"
        :forecast-trend="dashboardData?.forecast_trend || []"
      />
    </div>

    <!-- Main Section Grid: Forecast & Revenue Trend vs Top Sales Packages -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <ForecastTrendChart :items="dashboardData?.forecast_trend || []" />
      </div>
      <div>
        <TopSalesPackages :packages="dashboardData?.top_sales_packages || []" />
      </div>
    </div>

    <!-- Bottom Section Grid: Low Stock Inventory Alerts -->
    <div class="grid grid-cols-1 gap-8">
      <LowStockAlert :items="dashboardData?.low_stock_items || []" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useDashboardEngine } from '../features/dashboard/composables/useDashboardEngine'
import MetricCard from '../features/dashboard/components/MetricCard.vue'
import DailyFinancialBarChart from '../features/dashboard/components/DailyFinancialBarChart.vue'
import ForecastTrendChart from '../features/dashboard/components/ForecastTrendChart.vue'
import TopSalesPackages from '../features/dashboard/components/TopSalesPackages.vue'
import LowStockAlert from '../features/dashboard/components/LowStockAlert.vue'

const { locale } = useI18n()
const { user, company, activeTenant } = useAuthEngine()
const { dashboardData, isLoading, errorMsg, metrics, dailyFinancialRecords, fetchDashboard } = useDashboardEngine()

// Explicitly call /api/v1/dashboard exactly 1 time on page mount
if (import.meta.client) {
  onMounted(() => {
    fetchDashboard()
  })
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

const companyName = computed(() => {
  if (company.value) {
    return locale.value === 'th' ? company.value.name_th : company.value.name_en
  }
  return activeTenant.value?.name || 'Company Name'
})

const companyInitials = computed(() => {
  const name = companyName.value
  return name ? name.charAt(0) : 'C'
})

const userName = computed(() => {
  if (user.value) {
    return locale.value === 'th' 
      ? `${user.value.first_name_th} ${user.value.last_name_th}` 
      : `${user.value.first_name_en} ${user.value.last_name_en}`
  }
  return 'User'
})
</script>
