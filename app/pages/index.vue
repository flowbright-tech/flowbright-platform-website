<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
      <div class="flex items-center gap-3.5">
        <img
          v-if="company?.image_url"
          :src="company.image_url"
          alt="Company Logo"
          class="w-13 h-13 rounded-2xl object-contain bg-white p-1 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
          @error="handleImageError"
        />
        <div v-else class="w-13 h-13 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
          {{ companyInitials }}
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {{ companyName }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {{ locale === 'th' ? 'ยินดีต้อนรับกลับมา' : 'Welcome back' }}, <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ userName }}</span>
          </p>
        </div>
      </div>

      <!-- Controls: Role Badge & Refresh Button -->
      <div class="flex flex-wrap items-center gap-2.5">
        <UBadge color="indigo" variant="subtle" size="md" class="font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm capitalize">
          <UIcon name="i-heroicons-shield-check" class="w-4.5 h-4.5 mr-1.5 text-indigo-500" />
          {{ $t('dashboard.role') }} {{ user?.role || session?.role || 'Admin' }}
        </UBadge>
        <UBadge color="emerald" variant="solid" size="md" class="font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm text-white">
          <UIcon name="i-heroicons-sparkles" class="w-4.5 h-4.5 mr-1.5" />
          {{ company?.plan?.toUpperCase() || 'FREE' }} {{ $t('dashboard.plan') }}
        </UBadge>
        <UButton
          v-if="isAdmin"
          color="neutral"
          variant="outline"
          size="md"
          :loading="isLoading"
          class="rounded-xl font-bold px-3.5 py-1.5 text-xs sm:text-sm"
          @click="fetchDashboard"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4.5 h-4.5 mr-1.5" />
          {{ $t('dashboard.refresh') }}
        </UButton>
      </div>
    </div>

    <!-- Requirement 4: Restricted Dashboard View for Standard User Type -->
    <div v-if="!isAdmin" class="p-8 sm:p-12 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm my-6">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 shadow-inner">
        <UIcon name="i-heroicons-shield-exclamation" class="w-10 h-10" />
      </div>
      <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
        {{ locale === 'th' ? 'ข้อมูลแดชบอร์ดสงวนสิทธิ์เฉพาะผู้ใช้งานระดับ Admin' : 'Dashboard Information Restricted' }}
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
        {{ locale === 'th' 
          ? 'คุณกำลังเข้าใช้งานในฐานะผู้ใช้ทั่วไป (User) ระบบไม่อนุญาตให้แสดงข้อมูลสถิติ ดัชนีชี้วัดทางการเงิน หรือรายงานสรุปสำหรับบัญชีประเภทนี้' 
          : 'You are logged in as a standard User. Dashboard financial metrics, operational KPIs, and analytical reporting are restricted to Admin users.' 
        }}
      </p>
    </div>

    <!-- Full Dashboard for Admin Users -->
    <template v-else>
      <!-- Error Alert banner if any -->
      <UAlert
        v-if="errorMsg"
        color="rose"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        :title="$t('dashboard.sync_error')"
        :description="errorMsg"
        class="rounded-2xl text-sm"
      />

      <!-- 4 Primary Executive Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          v-for="m in metrics"
          :key="m.id"
          :metric="m"
        />
      </div>

      <!-- Daily Financial Income & Profit Bar Chart (Full Width) -->
      <div class="grid grid-cols-1 gap-6">
        <DailyFinancialBarChart
          :by-date="dailyFinancialRecords"
          :forecast-trend="dashboardData?.forecast_trend || []"
        />
      </div>

      <!-- Revenue Forecast & Trend (Full Width Card) -->
      <div class="grid grid-cols-1 gap-6">
        <ForecastTrendChart :items="dashboardData?.forecast_trend || []" />
      </div>

      <!-- Combined 1/2 Section Grid: Top Sales Packages & Low Stock Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TopSalesPackages :packages="dashboardData?.top_sales_packages || []" />
        </div>
        <div>
          <LowStockAlert :items="dashboardData?.low_stock_items || []" />
        </div>
      </div>
    </template>
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
const { user, session, company, activeTenant, isAdmin } = useAuthEngine()
const { dashboardData, isLoading, errorMsg, metrics, dailyFinancialRecords, fetchDashboard } = useDashboardEngine()

// Explicitly call /api/v1/dashboard only when user is Admin
if (import.meta.client) {
  onMounted(() => {
    if (isAdmin.value) {
      fetchDashboard()
    }
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
  return session.value?.name || 'User'
})
</script>
