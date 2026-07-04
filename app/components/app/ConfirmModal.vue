<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-6 space-y-4 bg-white dark:bg-slate-900 rounded-2xl">
        <div class="flex items-center gap-3 text-red-600 dark:text-red-400">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 dark:bg-red-500/20">
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
          <UButton
            :color="confirmColor || 'primary'"
            :icon="confirmIcon"
            class="text-white dark:text-slate-950 font-bold px-4 py-2 hover:bg-indigo-700 dark:hover:bg-indigo-300"
            @click="handleConfirm"
          >
            {{ confirmText || $t('common.confirm') }}
          </UButton>
        </div>
      </div>
    </template>
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
