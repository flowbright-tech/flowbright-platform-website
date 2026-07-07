<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Glowing background elements -->
    <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="max-w-md w-full relative z-10">
      <UCard class="glass-panel overflow-hidden relative" :ui="{ body: { padding: 'p-8 sm:p-10' } }">
        <!-- Giant status code watermark -->
        <div class="absolute -top-6 -right-6 text-[10rem] font-extrabold text-slate-200/30 dark:text-slate-800/15 pointer-events-none select-none font-mono leading-none tracking-tighter">
          {{ statusCode }}
        </div>

        <div class="space-y-6 relative z-10">
          <!-- Company / Brand Logo -->
          <div class="flex items-center justify-center">
            <div class="w-18 h-18 rounded-2xl bg-white dark:bg-slate-900 p-2 border border-slate-200/50 dark:border-slate-800/70 shadow-md">
              <img :src="companyLogo" alt="Logo" class="w-full h-full object-contain rounded-xl" />
            </div>
          </div>

          <!-- Titles -->
          <div class="text-center space-y-2">
            <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {{ errorTitle }}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {{ errorDesc }}
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-col gap-2 pt-2">
            <UButton
              color="primary"
              size="md"
              block
              icon="i-heroicons-home"
              class="font-semibold shadow-sm"
              @click="handleClearError"
            >
              {{ $t('errors.clear_error') || 'Go Back Home' }}
            </UButton>

            <div class="grid grid-cols-2 gap-2">
              <UButton
                color="secondary"
                variant="ghost"
                size="md"
                icon="i-heroicons-arrow-left"
                class="font-semibold"
                @click="goBack"
              >
                {{ $t('errors.go_back') || 'Go Back' }}
              </UButton>

              <UButton
                color="neutral"
                variant="ghost"
                size="md"
                icon="i-heroicons-arrow-path"
                class="font-semibold"
                @click="refreshPage"
              >
                {{ $t('errors.refresh_page') || 'Reload' }}
              </UButton>
            </div>
          </div>

          <!-- Debug Diagnostics Panel -->
          <div v-if="error" class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              @click="isDetailsOpen = !isDetailsOpen"
              class="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
            >
              <span>{{ $t('errors.developer_details') || 'Developer Technical Details' }}</span>
              <UIcon
                :name="isDetailsOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                class="w-4 h-4"
              />
            </button>
            
            <div v-if="isDetailsOpen" class="mt-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 text-left overflow-auto max-h-48">
              <div class="font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed space-y-1">
                <div><span class="font-bold text-slate-500">Code:</span> {{ error.statusCode }}</div>
                <div v-if="error.statusMessage"><span class="font-bold text-slate-500">Status:</span> {{ error.statusMessage }}</div>
                <div v-if="error.message"><span class="font-bold text-slate-500">Message:</span> {{ error.message }}</div>
                <div v-if="error.stack" class="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] opacity-80">{{ error.stack }}</div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { clearError } from '#imports'
import { useAuthEngine } from './features/auth/composables/useAuthEngine'

const { t } = useI18n()
const isDetailsOpen = ref(false)
const { company } = useAuthEngine()

const props = defineProps<{
  error: any
}>()

const companyLogo = computed(() => {
  return company.value?.image_url || '/icon.svg'
})

const statusCode = computed(() => {
  return Number(props.error?.statusCode) || 500
})


const errorTitle = computed(() => {
  const code = statusCode.value
  if (code === 400) return t('errors.bad_request_title') || 'Invalid Request (400)'
  if (code === 404) return t('errors.not_found_title') || 'Page Not Found (404)'
  if (code === 500) return t('errors.server_error_title') || 'Internal Server Error (500)'
  return t('errors.generic_title') || 'An Error Occurred'
})

const errorDesc = computed(() => {
  const code = statusCode.value
  if (code === 400) return t('errors.bad_request_desc') || 'The platform encountered an incorrect input or bad request syntax.'
  if (code === 404) return t('errors.not_found_desc') || 'The requested resource does not exist or has been moved.'
  if (code === 500) return t('errors.server_error_desc') || 'An unexpected error occurred on the application server.'
  return props.error?.message || t('errors.generic_desc') || 'The application encountered a client-side or network runtime exception.'
})

const handleClearError = () => {
  clearError({ redirect: '/' })
}

const goBack = () => {
  if (import.meta.client) {
    window.history.back()
  }
}

const refreshPage = () => {
  if (import.meta.client) {
    window.location.reload()
  }
}
</script>
