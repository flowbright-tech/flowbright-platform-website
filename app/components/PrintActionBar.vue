<template>
  <!-- Top Action bar (hidden on print) -->
  <div class="no-print w-full max-w-[210mm] mb-4 sm:mb-6 flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700">
    <div class="flex items-center gap-2 sm:gap-3">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-heroicons-arrow-left"
        size="sm"
        @click="handleBack"
      >
        {{ $t('common.back') || 'Back' }}
      </UButton>
      <span class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
        {{ title }}
      </span>
    </div>
    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      <!-- Language Switcher Button -->
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-heroicons-language"
        @click="handleToggleLanguage"
      >
        {{ locale === 'th' ? 'English' : 'ไทย' }}
      </UButton>

      <!-- Export PDF Button (Error color - Red) -->
      <UButton
        color="error"
        variant="solid"
        icon="i-heroicons-arrow-down-tray"
        size="sm"
        class="font-semibold shadow-xs"
        @click="handleExportPdf"
      >
        Export PDF
      </UButton>

      <!-- Print Button (Print (A4)) -->
      <UButton
        color="primary"
        icon="i-heroicons-printer"
        size="sm"
        class="font-semibold shadow-sm"
        @click="handlePrint"
      >
        Print (A4)
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLocalePath, useSwitchLocalePath } from '#imports'

const props = defineProps<{
  title: string
  backPath?: string
  pdfFilename?: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'print'): void
  (e: 'exportPdf'): void
  (e: 'toggleLanguage'): void
}>()

const { locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const handleBack = () => {
  emit('back')
  if (props.backPath) {
    router.push(localePath(props.backPath))
  } else {
    router.push(localePath('/orders'))
  }
}

const handleToggleLanguage = () => {
  emit('toggleLanguage')
  const targetLocale = locale.value === 'th' ? 'en' : 'th'
  const targetPath = switchLocalePath(targetLocale)
  router.push(targetPath)
}

const handleExportPdf = () => {
  emit('exportPdf')
  if (!import.meta.client) return

  const originalTitle = document.title
  try {
    const rawName = props.pdfFilename || `${props.title || 'document'}.pdf`
    const cleanFilename = rawName.replace(/[^a-zA-Z0-9_.-]/g, '_')
    document.title = cleanFilename
    window.print()
  } finally {
    setTimeout(() => {
      document.title = originalTitle
    }, 1500)
  }
}

const handlePrint = () => {
  emit('print')
  if (import.meta.client) {
    window.print()
  }
}
</script>
