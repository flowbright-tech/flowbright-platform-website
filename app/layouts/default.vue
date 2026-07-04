<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
    <!-- Header Navigation Bar -->
    <header class="glass-header h-16 flex items-center justify-between px-4 sm:px-6">
      <!-- Left: Mobile Menu Trigger + Brand Logo -->
      <div class="flex items-center gap-3">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-bars-3"
          size="lg"
          class="lg:hidden"
          @click="isMobileMenuOpen = true"
        />
        
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5">
          <img
            src="/icon.svg"
            alt="Flow Bright Logo"
            class="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-200/40 dark:border-slate-800/40 shadow-sm"
          />
          <div class="hidden sm:block">
            <span class="font-bold text-base text-slate-900 dark:text-white tracking-tight">
              Flow Bright
            </span>
            <span class="ml-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
              SRP
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- Right Controls: Language Switcher, Theme Toggle, Tenant & User Dropdown -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Language Switcher -->
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

        <!-- Color Mode Toggle -->
        <UButton
          color="gray"
          variant="ghost"
          size="md"
          :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
          class="text-amber-500 dark:text-indigo-400"
          @click="isDark = !isDark"
        />

        <!-- Tenant & User Dropdown Menu -->
        <UDropdownMenu :items="userDropdownItems" :content="{ align: 'end' }">
          <UButton color="gray" variant="ghost" size="md" class="flex items-center gap-2 p-1 sm:px-2">
            <UAvatar
              :alt="displayName"
              size="2xs"
              chip-color="emerald"
              class="ring-2 ring-indigo-500/30"
            />
            <div class="hidden md:block text-left">
              <div class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {{ displayName }}
              </div>
              <div class="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 capitalize">
                {{ user?.role || session?.role || 'User' }}
              </div>
            </div>
            <UIcon name="i-heroicons-chevron-down" class="w-4.5 h-4.5 text-slate-400" />
          </UButton>
        </UDropdownMenu>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- Desktop Fixed Sidebar -->
      <aside class="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md p-4 space-y-6">
        <!-- Active Tenant Info Badge -->
        <div class="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-500/20 flex gap-2.5 items-center">
          <img
            v-if="company?.image_url"
            :src="company.image_url"
            alt="Company Logo"
            class="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border border-slate-200/40 dark:border-slate-800/40 shadow-sm shrink-0"
            @error="handleImageError"
          />
          <div class="flex-1 min-w-0">
            <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
              {{ locale === 'th' ? 'องค์กรที่ใช้งาน' : 'Active Organization' }}
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
              {{ companyName }}
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {{ company ? company.tax_id : activeTenant?.code }}
            </div>
          </div>
        </div>
        
        <!-- Navigation Menu -->
        <nav class="space-y-1.5 flex-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            class="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
            :class="[
              route.path === item.to
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <UIcon :name="item.icon" class="w-6 h-6" />
            <span>{{ $t(item.labelKey) }}</span>
          </NuxtLink>
        </nav>

        
      </aside>

      <!-- Mobile Slide-out Drawer Menu -->
      <USlideover v-model:open="isMobileMenuOpen" side="left">
        <template #content>
          <div class="p-6 flex-1 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
            <div class="space-y-6">
              <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">
                    F
                  </div>
                  <span class="font-bold text-slate-900 dark:text-white">Flow Bright SRP</span>
                </div>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" size="sm" @click="isMobileMenuOpen = false" />
              </div>

              <div class="p-3 rounded-xl bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                {{ companyName }}
              </div>

              <nav class="space-y-1">
                <NuxtLink
                  v-for="item in navItems"
                  :key="item.key"
                  :to="item.to"
                  class="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold"
                  :class="[
                    route.path === item.to
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  ]"
                  @click="isMobileMenuOpen = false"
                >
                  <UIcon :name="item.icon" class="w-6 h-6" />
                  <span>{{ $t(item.labelKey) }}</span>
                </NuxtLink>
              </nav>
            </div>

            <UButton
              color="rose"
              variant="soft"
              block
              icon="i-heroicons-arrow-right-on-rectangle"
              @click="handleLogout"
            >
              {{ $t('auth.logout') }}
            </UButton>
          </div>
        </template>
      </USlideover>

      <!-- Main Workspace View -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <!-- Reusable Logout Confirmation Modal -->
    <ConfirmModal
      v-model:open="isLogoutConfirmOpen"
      :title="$t('auth.confirm_logout_title')"
      :description="$t('auth.confirm_logout_desc')"
      confirm-color="primary"
      confirm-icon="i-heroicons-arrow-right-on-rectangle"
      :confirm-text="$t('auth.logout')"
      @confirm="confirmLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNavigation } from '../composables/useNavigation.ts'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine.ts'
import { useColorMode, useLocalePath, useSwitchLocalePath } from '#imports'
import ConfirmModal from '../components/app/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()

const { navItems } = useNavigation()
const { session, activeTenant, clearSession, user, company } = useAuthEngine()

const isMobileMenuOpen = ref(false)
const isLogoutConfirmOpen = ref(false)

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(val) {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

const displayName = computed(() => {
  if (user.value) {
    return locale.value === 'th'
      ? `${user.value.first_name_th} ${user.value.last_name_th}`
      : `${user.value.first_name_en} ${user.value.last_name_en}`
  }
  return session.value?.name || 'User'
})

const companyName = computed(() => {
  if (company.value) {
    return locale.value === 'th'
      ? company.value.name_th
      : company.value.name_en
  }
  return activeTenant.value?.name || 'Flow Bright Company'
})

const toggleLanguage = () => {
  const targetLocale = locale.value === 'th' ? 'en' : 'th'
  const targetPath = switchLocalePath(targetLocale)
  router.push(targetPath)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

const handleLogout = () => {
  isMobileMenuOpen.value = false
  isLogoutConfirmOpen.value = true
}

const confirmLogout = () => {
  clearSession()
  router.push(localePath('/login'))
}

const userDropdownItems = computed(() => [
  [
    {
      label: user.value?.email || session.value?.email || '',
      slot: 'header',
      disabled: true
    }
  ],
  [
    {
      label: companyName.value,
      icon: 'i-heroicons-building-office',
      disabled: true
    }
  ],
  [
    {
      label: t('auth.logout'),
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: handleLogout
    }
  ]
])
</script>
