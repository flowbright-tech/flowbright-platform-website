<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
      <div class="flex items-center gap-3">
        <img
          v-if="company?.image_url"
          :src="company.image_url"
          alt="Company Logo"
          class="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
          @error="handleImageError"
        />
        <div v-else class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
          {{ companyInitials }}
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {{ companyName }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ locale === 'th' ? 'ยินดีต้อนรับกลับมา' : 'Welcome back' }}, <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ userName }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UBadge color="indigo" variant="subtle" size="md" class="font-semibold px-3 py-1 rounded-lg">
          <UIcon name="i-heroicons-shield-check" class="w-4 h-4 mr-1.5" />
          {{ locale === 'th' ? 'ระดับสิทธิ์: ' : 'Role: ' }}{{ user?.role || 'Admin' }}
        </UBadge>
        <UBadge color="emerald" variant="solid" size="md" class="font-bold px-3 py-1 rounded-lg text-white">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 mr-1.5" />
          {{ company?.plan.toUpperCase() || 'FREE' }} {{ locale === 'th' ? 'แพ็กเกจ' : 'PLAN' }}
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useDashboardEngine } from '../features/dashboard/composables/useDashboardEngine'
import MetricCard from '../features/dashboard/components/MetricCard.vue'
import SalesTrendChart from '../features/dashboard/components/SalesTrendChart.vue'
import RecentActivity from '../features/dashboard/components/RecentActivity.vue'

const { locale } = useI18n()
const { user, company, activeTenant } = useAuthEngine()
const { metrics, chartData, activities } = useDashboardEngine()

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
