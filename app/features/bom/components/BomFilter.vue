<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
    <div class="relative w-full sm:max-w-xs">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="md"
        class="w-full"
        :placeholder="$t('boms.search_placeholder') || 'Search BOMs...'"
      />
      <UButton
        v-if="searchQuery"
        color="neutral"
        variant="ghost"
        icon="i-heroicons-x-mark"
        size="xs"
        class="absolute right-2.5 top-1/2 -translate-y-1/2"
        @click="searchQuery = ''"
      />
    </div>

    <UButton
      color="primary"
      icon="i-heroicons-plus"
      size="md"
      class="font-semibold shadow-sm shrink-0"
      @click="$emit('open-create')"
    >
      {{ $t('boms.add_bom') || 'Add BOM' }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
const searchQuery = defineModel<string>('searchQuery', { default: '' })

defineEmits<{
  (e: 'open-create'): void
}>()
</script>
