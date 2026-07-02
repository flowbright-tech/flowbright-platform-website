<template>
  <UCard class="glass-panel">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-clock" class="w-5 h-5 text-indigo-500" />
          {{ $t('dashboard.recent_activity') }}
        </h2>
        <UBadge color="indigo" variant="soft" size="xs" class="rounded-full">
          Live Audit Feed
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <div
        v-for="item in activities"
        :key="item.id"
        class="flex items-start justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800/60"
      >
        <div class="flex items-start gap-3">
          <div
            :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
              item.type === 'invoice' ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' :
              item.type === 'vendor' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
              'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
            ]"
          >
            <UIcon
              :name="
                item.type === 'invoice' ? 'i-heroicons-document-text' :
                item.type === 'vendor' ? 'i-heroicons-shopping-bag' :
                'i-heroicons-user-plus'
              "
              class="w-5 h-5"
            />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {{ item.title }}
            </p>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ item.timestamp }}
            </span>
          </div>
        </div>

        <div v-if="item.amount" class="text-right">
          <span class="text-sm font-bold text-slate-900 dark:text-white">
            {{ item.amount }}
          </span>
          <div class="mt-0.5">
            <UBadge
              :color="
                item.status === 'completed' ? 'emerald' :
                item.status === 'pending' ? 'amber' : 'rose'
              "
              variant="subtle"
              size="xs"
            >
              {{ item.status }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ActivityItem } from '../types'

defineProps<{
  activities: ActivityItem[]
}>()
</script>
