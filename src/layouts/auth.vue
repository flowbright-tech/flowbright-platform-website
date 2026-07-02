<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 antialiased relative overflow-hidden">
    <!-- Top Floating Header Controls -->
    <header class="w-full max-w-7xl mx-auto flex items-center justify-between py-2">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xl shadow-md">
          F
        </div>
        <span class="font-bold text-slate-900 dark:text-white tracking-tight">
          Flow Bright SRP
        </span>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="gray"
          variant="ghost"
          size="md"
          class="font-semibold text-xs flex items-center gap-1.5"
          @click="toggleLanguage"
        >
          <UIcon name="i-heroicons-language" class="w-5 h-5 text-indigo-500" />
          <span>{{ locale === 'th' ? 'TH' : 'EN' }}</span>
        </UButton>

        <UButton
          color="gray"
          variant="ghost"
          size="md"
          :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
          class="text-amber-500 dark:text-indigo-400"
          @click="isDark = !isDark"
        />
      </div>
    </header>

    <!-- Main Auth Center Slot -->
    <main class="my-auto py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="text-center text-xs text-slate-400 dark:text-slate-600">
      © 2026 Flow Bright Tech. Built for modern SMEs with Nuxt 4 SSG architecture.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useColorMode, useSwitchLocalePath } from '#imports'

const router = useRouter()
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(val) {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

const toggleLanguage = () => {
  const targetLocale = locale.value === 'th' ? 'en' : 'th'
  const targetPath = switchLocalePath(targetLocale)
  router.push(targetPath)
}
</script>
