<template>
  <UCard class="glass-panel">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-rose-500" />
            {{ $t('dashboard.low_stock_items') }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t('dashboard.low_stock_subtitle') }}
          </p>
        </div>
        <UBadge
          :color="items && items.length > 0 ? 'rose' : 'emerald'"
          variant="subtle"
          size="xs"
          class="font-bold"
        >
          {{ items ? items.length : 0 }} {{ $t('dashboard.items_alert') }}
        </UBadge>
      </div>
    </template>

    <div v-if="!items || items.length === 0" class="py-6 text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-emerald-500" />
      <span>{{ $t('dashboard.all_stock_healthy') }}</span>
    </div>

    <div v-else class="divide-y divide-slate-200/60 dark:divide-slate-800/80">
      <div
        v-for="item in items"
        :key="item.id"
        class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            :class="item.stock <= 0 ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'"
          >
            <UIcon :name="item.entity_type === 'bom_item' ? 'i-heroicons-beaker' : 'i-heroicons-archive-box'" class="w-5 h-5" />
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-slate-900 dark:text-white">
                {{ item.name }}
              </span>
              <UBadge
                :color="item.entity_type === 'bom_item' ? 'indigo' : 'sky'"
                variant="subtle"
                size="xs"
                class="uppercase text-[10px] px-1.5 py-0.5 font-semibold"
              >
                {{ item.entity_type.replace('_', ' ') }}
              </UBadge>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ID: <span class="font-mono text-[11px]">{{ item.id.substring(0, 8) }}...</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 self-end sm:self-center">
          <div class="text-right">
            <div class="text-xs font-semibold" :class="item.stock <= 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'">
              Stock: {{ item.stock }} {{ item.unit }}
            </div>
            <div class="text-[11px] text-slate-400 dark:text-slate-500">
              Reserved: {{ item.reserve_stock }} {{ item.unit }}
            </div>
          </div>

          <UBadge
            :color="item.stock <= 0 ? 'rose' : 'amber'"
            variant="solid"
            size="xs"
            class="font-bold uppercase"
          >
            {{ item.stock <= 0 ? 'Out of Stock' : 'Low Stock' }}
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
