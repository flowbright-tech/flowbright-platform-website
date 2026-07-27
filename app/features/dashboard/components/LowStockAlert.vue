<template>
  <UCard class="glass-panel">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-rose-500" />
            {{ $t('dashboard.low_stock_items') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ $t('dashboard.low_stock_subtitle') }}
          </p>
        </div>
        <UBadge
          :color="items && items.length > 0 ? 'rose' : 'emerald'"
          variant="subtle"
          size="sm"
          class="font-bold px-2.5 py-1"
        >
          {{ items ? items.length : 0 }} {{ $t('dashboard.items_alert') }}
        </UBadge>
      </div>
    </template>

    <div v-if="!items || items.length === 0" class="py-8 text-center text-slate-500 dark:text-slate-400 text-base font-semibold flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-emerald-500" />
      <span>{{ $t('dashboard.all_stock_healthy') }}</span>
    </div>

    <div v-else class="divide-y divide-slate-200/60 dark:divide-slate-800/80">
      <div
        v-for="item in items"
        :key="item.id"
        class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            :class="item.stock <= 0 ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'"
          >
            <UIcon :name="item.entity_type === 'bom_item' ? 'i-heroicons-beaker' : 'i-heroicons-archive-box'" class="w-6 h-6" />
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {{ item.name }}
              </span>
              <UBadge
                :color="item.entity_type === 'bom_item' ? 'indigo' : 'sky'"
                variant="subtle"
                size="xs"
                class="uppercase text-xs px-2 py-0.5 font-bold"
              >
                {{ item.entity_type.replace('_', ' ') }}
              </UBadge>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {{ $t('dashboard.id_label') }} <span class="font-mono font-semibold">{{ item.id.substring(0, 8) }}...</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 self-end sm:self-center">
          <div class="text-right">
            <div class="text-sm sm:text-base font-bold" :class="item.stock <= 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'">
              {{ $t('dashboard.stock_label') }} {{ item.stock }} {{ item.unit }}
            </div>
            <div class="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              {{ $t('dashboard.reserved_label') }} {{ item.reserve_stock }} {{ item.unit }}
            </div>
          </div>

          <UBadge
            :color="item.stock <= 0 ? 'rose' : 'amber'"
            variant="solid"
            size="sm"
            class="font-bold uppercase px-2.5 py-1"
          >
            {{ item.stock <= 0 ? $t('dashboard.out_of_stock') : $t('dashboard.low_stock') }}
          </UBadge>
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
