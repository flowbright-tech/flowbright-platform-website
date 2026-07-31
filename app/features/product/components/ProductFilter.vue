<template>
  <div
    class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 glass-panel rounded-2xl mb-6">
    <!-- Search Bar -->
    <div class="flex-1 max-w-md">
      <UInput v-model="searchQuery" trailing-icon="i-heroicons-magnifying-glass"
        :placeholder="searchPlaceholder" size="md" class="w-full">
        <template #trailing>
          <UButton v-if="searchQuery" color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="xs" class="mr-1"
            @click="searchQuery = ''" />
        </template>
      </UInput>
    </div>

    <!-- Create Product / Test Button -->
    <UButton color="primary" icon="i-heroicons-plus" size="md" class="font-semibold shadow-sm shrink-0"
      @click="$emit('open-create')">
      {{ addLabel }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useDomainLabels } from '../../../composables/useDomainLabels'

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const { searchPlaceholder, addLabel } = useDomainLabels()

defineEmits<{
  (e: 'open-create'): void
}>()
</script>
