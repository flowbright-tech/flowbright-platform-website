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
        :loading="isExportingPdf"
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
import { ref } from 'vue'
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
const isExportingPdf = ref(false)

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

const loadPdfGeneratorLibraries = (): Promise<{ htmlToImage: any; jsPDF: any }> => {
  return new Promise((resolve, reject) => {
    const checkReady = () => {
      const h2i = (window as any).htmlToImage
      const jspdf = (window as any).jspdf?.jsPDF || (window as any).jsPDF
      if (h2i && jspdf) {
        resolve({ htmlToImage: h2i, jsPDF: jspdf })
        return true
      }
      return false
    }

    if (checkReady()) return

    let loadedCount = 0
    const onScriptLoad = () => {
      loadedCount++
      if (loadedCount >= 2 || checkReady()) {
        const h2i = (window as any).htmlToImage
        const jspdf = (window as any).jspdf?.jsPDF || (window as any).jsPDF
        if (h2i && jspdf) {
          resolve({ htmlToImage: h2i, jsPDF: jspdf })
        } else {
          setTimeout(() => {
            const h2iRetry = (window as any).htmlToImage
            const jspdfRetry = (window as any).jspdf?.jsPDF || (window as any).jsPDF
            if (h2iRetry && jspdfRetry) {
              resolve({ htmlToImage: h2iRetry, jsPDF: jspdfRetry })
            } else {
              reject(new Error('PDF generator libraries failed to initialize'))
            }
          }, 300)
        }
      }
    }

    // 1. Load html-to-image
    if (!(window as any).htmlToImage) {
      const s1 = document.createElement('script')
      s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js'
      s1.onload = onScriptLoad
      s1.onerror = (e) => reject(e)
      document.head.appendChild(s1)
    } else {
      loadedCount++
    }

    // 2. Load jsPDF
    if (!((window as any).jspdf || (window as any).jsPDF)) {
      const s2 = document.createElement('script')
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s2.onload = onScriptLoad
      s2.onerror = (e) => reject(e)
      document.head.appendChild(s2)
    } else {
      loadedCount++
    }
  })
}

const handleExportPdf = async () => {
  emit('exportPdf')
  if (!import.meta.client) return

  const targetEl = (document.querySelector('.a4-page') || document.querySelector('.print-content')) as HTMLElement
  if (!targetEl) return

  isExportingPdf.value = true
  try {
    const { htmlToImage, jsPDF } = await loadPdfGeneratorLibraries()

    // 1. Convert DOM node to PNG image data (skip fonts to prevent CORS fetch errors)
    const imgData = await htmlToImage.toPng(targetEl, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      filter: (node: Node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false
        }
        return true
      }
    })

    // 2. Create jsPDF document instance
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm

    // 3. Render image onto PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

    const rawName = props.pdfFilename || `${props.title || 'document'}.pdf`
    const cleanFilename = rawName.endsWith('.pdf') ? rawName : `${rawName}.pdf`

    // 4. Directly trigger PDF save file download dialog
    pdf.save(cleanFilename)
  } catch (err: any) {
    console.error('Failed to export PDF:', err)
  } finally {
    isExportingPdf.value = false
  }
}

const handlePrint = () => {
  emit('print')
  if (import.meta.client) {
    window.print()
  }
}
</script>
