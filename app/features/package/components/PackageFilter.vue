<template>
  <div
    class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 glass-panel rounded-2xl mb-6">
    <!-- Search Bar -->
    <div class="flex-1 max-w-md">
      <UInput v-model="searchQuery" trailing-icon="i-heroicons-magnifying-glass"
        :placeholder="$t('packages.search_placeholder') || 'Search packages...'" size="md" class="w-full">
        <template #trailing>
          <UButton v-if="searchQuery" color="gray" variant="ghost" icon="i-lucide-circle-x" size="xs" class="mr-1"
            @click="searchQuery = ''" />
        </template>
      </UInput>
    </div>

    <!-- Create Package Button -->
    <UButton color="primary" icon="i-heroicons-plus" size="md" class="font-semibold shadow-sm shrink-0"
      @click="$emit('open-create')">
      {{ $t('packages.add_package') || 'Add Package' }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
const searchQuery = defineModel<string>('searchQuery', { default: '' })

defineEmits<{
  (e: 'open-create'): void
}>()
</script>
