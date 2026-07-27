<template>
  <UCard class="glass-panel h-full flex flex-col">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-rose-500" />
            {{ $t('dashboard.low_stock_items') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t('dashboard.low_stock_subtitle') }}
          </p>
        </div>
        <UBadge
          :color="items && items.length > 0 ? 'rose' : 'emerald'"
          variant="subtle"
          size="md"
          class="font-extrabold text-sm sm:text-base px-3.5 py-1.5 rounded-xl shrink-0 uppercase tracking-wider shadow-xs"
        >
          {{ items ? items.length : 0 }} {{ $t('dashboard.items_alert') }}
        </UBadge>
      </div>
    </template>

    <div v-if="!items || items.length === 0" class="py-10 text-center text-slate-500 dark:text-slate-400 text-base font-semibold flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-emerald-500" />
      <span>{{ $t('dashboard.all_stock_healthy') }}</span>
    </div>

    <!-- Spacious, Modern, Ultra-Readable Stock Alert Cards -->
    <div v-else class="space-y-3.5 my-auto">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        :class="item.stock <= 0
          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60 shadow-xs'
          : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60 shadow-xs'"
      >
        <!-- Item Info (Left) -->
        <div class="flex items-center gap-3.5 min-w-0">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            :class="item.stock <= 0
              ? 'bg-rose-500 text-white shadow-rose-500/25'
              : 'bg-amber-500 text-white shadow-amber-500/25'"
          >
            <UIcon :name="item.stock <= 0 ? 'i-heroicons-x-circle' : 'i-heroicons-exclamation-triangle'" class="w-6.5 h-6.5" />
          </div>

          <div class="min-w-0 flex flex-wrap items-center gap-2">
            <span class="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {{ item.name }}
            </span>
            <span
              class="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider shrink-0"
              :class="item.entity_type === 'bom_item'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                : 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'"
            >
              {{ item.entity_type.replace('_', ' ') }}
            </span>
          </div>
        </div>

        <!-- Stock Status & Figures (Right) -->
        <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50 dark:border-slate-800/50">
          <!-- Clear Status Pill Badge -->
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider border shadow-xs"
            :class="item.stock <= 0
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200 border-rose-300 dark:border-rose-700'
              : 'bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border-amber-300 dark:border-amber-700'"
          >
            <span class="w-2 h-2 rounded-full animate-pulse" :class="item.stock <= 0 ? 'bg-rose-600' : 'bg-amber-600'"></span>
            {{ item.stock <= 0 ? $t('dashboard.out_of_stock') : $t('dashboard.low_stock') }}
          </span>

          <!-- Readable Stock Numbers -->
          <div class="text-right">
            <div class="text-sm sm:text-base font-extrabold" :class="item.stock <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'">
              {{ $t('dashboard.stock_label') }} <span class="text-lg sm:text-xl font-black font-mono">{{ item.stock }}</span> {{ item.unit }}
            </div>
            <div class="text-xs font-bold text-slate-500 dark:text-slate-400">
              {{ $t('dashboard.reserved_label') }} <span class="font-mono">{{ item.reserve_stock }}</span> {{ item.unit }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { LowStockItem } from '../types'

defineProps<{
  items: LowStockItem[]
}>()
</script>
