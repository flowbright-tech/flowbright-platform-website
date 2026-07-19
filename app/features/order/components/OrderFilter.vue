<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
    <!-- Search Input -->
    <div class="relative w-full sm:w-96">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        :placeholder="$t('orders.search_placeholder') || 'Search orders...'"
        size="md"
        class="w-full"
      />
    </div>

    <!-- Action Button -->
    <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
      <UButton
        color="primary"
        icon="i-heroicons-plus-circle"
        size="md"
        class="font-semibold shadow-sm px-5 w-full sm:w-auto justify-center"
        @click="$emit('create')"
      >
        {{ $t('orders.add_order') || 'Create Order' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = defineModel<string>('searchQuery', { default: '' })

defineEmits<{
  (e: 'create'): void
}>()
</script>
