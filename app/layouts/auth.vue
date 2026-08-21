<template>
  <div
    class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 antialiased relative overflow-hidden">
    <!-- Top Floating Header Controls -->
    <header class="w-full max-w-7xl mx-auto flex items-center justify-between py-2">
      <NuxtLink :to="localePath('/')" class="inline-flex items-center group">
        <div
          class="flex items-center px-3 py-1.5 rounded-xl bg-white/90 dark:bg-white border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all duration-200 group-hover:shadow-md group-hover:border-indigo-300 dark:group-hover:border-indigo-400 group-hover:scale-[1.02]">
          <img src="/logo.png" alt="SRP"
            class="h-8 sm:h-9 w-auto object-contain" />
        </div>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <UButton color="gray" variant="ghost" size="md" class="font-semibold text-xs flex items-center gap-1.5"
          @click="toggleLanguage">
          <UIcon name="i-heroicons-language" class="w-5 h-5 text-indigo-500" />
          <span>{{ locale === 'th' ? 'TH' : 'EN' }}</span>
        </UButton>

        <UButton color="gray" variant="ghost" size="md" :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
          class="text-amber-500 dark:text-indigo-400" @click="isDark = !isDark" />
      </div>
    </header>

    <!-- Main Auth Center Slot -->
    <main class="my-auto py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="text-center text-xs text-slate-400 dark:text-slate-600">
      © 2026 Swift Crown Tech. Built for modern SMEs with Nuxt 4 SSG architecture.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useColorMode, useLocalePath, useSwitchLocalePath } from '#imports'

const router = useRouter()
const { locale } = useI18n()
const localePath = useLocalePath()
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
