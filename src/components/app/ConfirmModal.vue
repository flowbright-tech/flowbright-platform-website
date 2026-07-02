<template>
  <UModal v-model:open="isOpen">
    <div class="p-6 space-y-4 bg-white dark:bg-slate-900 rounded-2xl">
      <div class="flex items-center gap-3" :class="confirmColor === 'rose' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="confirmColor === 'rose' ? 'bg-rose-500/10' : 'bg-indigo-500/10'">
          <UIcon :name="icon" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ title }}
        </h3>
      </div>

      <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {{ description }}
      </p>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <UButton color="gray" variant="ghost" @click="handleCancel">
          {{ cancelText || $t('common.cancel') }}
        </UButton>
        <UButton :color="confirmColor || 'primary'" :icon="confirmIcon" @click="handleConfirm">
          {{ confirmText || $t('common.confirm') }}
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const isOpen = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    confirmColor?: 'primary' | 'rose' | 'amber' | 'emerald' | 'gray'
    icon?: string
    confirmIcon?: string
  }>(),
  {
    confirmColor: 'primary',
    icon: 'i-heroicons-exclamation-triangle',
    confirmIcon: 'i-heroicons-check'
  }
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
  isOpen.value = false
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>
