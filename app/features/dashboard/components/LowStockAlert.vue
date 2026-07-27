<template>
  <UCard class="glass-panel h-full flex flex-col">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
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

    <div v-if="!items || items.length === 0" class="py-8 text-center text-slate-500 dark:text-slate-400 text-base font-semibold flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-emerald-500" />
      <span>{{ $t('dashboard.all_stock_healthy') }}</span>
    </div>

    <div v-else class="divide-y divide-slate-200/60 dark:divide-slate-800/80 my-auto">
      <div
        v-for="item in items"
        :key="item.id"
        class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            :class="item.stock <= 0 ? 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400 border border-rose-500/40' : 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400 border border-amber-500/40'"
          >
            <UIcon :name="item.entity_type === 'bom_item' ? 'i-heroicons-beaker' : 'i-heroicons-archive-box'" class="w-6 h-6" />
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {{ item.name }}
              </span>
              <UBadge
                :color="item.entity_type === 'bom_item' ? 'indigo' : 'sky'"
                variant="subtle"
                size="sm"
                class="uppercase text-xs px-2.5 py-0.5 font-extrabold rounded-lg shrink-0"
              >
                {{ item.entity_type.replace('_', ' ') }}
              </UBadge>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {{ $t('dashboard.id_label') }} <span class="font-mono font-semibold text-slate-700 dark:text-slate-300">{{ item.id.substring(0, 8) }}...</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 self-end sm:self-center shrink-0">
          <div class="text-right">
            <div class="text-sm sm:text-base font-extrabold" :class="item.stock <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'">
              {{ $t('dashboard.stock_label') }} <span class="font-mono">{{ item.stock }}</span> {{ item.unit }}
            </div>
            <div class="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              {{ $t('dashboard.reserved_label') }} <span class="font-mono">{{ item.reserve_stock }}</span> {{ item.unit }}
            </div>
          </div>

          <!-- Color-coded High Contrast Badges for Out of Stock (Rose Red) & Low Stock (Warning Amber) -->
          <UBadge
            v-if="item.stock <= 0"
            color="rose"
            variant="solid"
            size="md"
            class="font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm shadow-rose-500/25 text-white flex items-center shrink-0"
          >
            <UIcon name="i-heroicons-x-circle" class="w-4 h-4 mr-1.5 text-white shrink-0" />
            {{ $t('dashboard.out_of_stock') }}
          </UBadge>

          <UBadge
            v-else
            color="amber"
            variant="solid"
            size="md"
            class="font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm shadow-amber-500/25 text-slate-950 flex items-center shrink-0"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 mr-1.5 text-slate-950 shrink-0" />
            {{ $t('dashboard.low_stock') }}
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
