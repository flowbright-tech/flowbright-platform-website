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
        
        <NuxtLink :to="localePath('/dashboard')" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/30">
            F
          </div>
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
        <UDropdown :items="userDropdownItems" :popper="{ placement: 'bottom-end' }">
          <UButton color="gray" variant="ghost" size="md" class="flex items-center gap-2 p-1 sm:px-2">
            <UAvatar
              alt="Chanchai J."
              size="2xs"
              chip-color="emerald"
              class="ring-2 ring-indigo-500/30"
            />
            <div class="hidden md:block text-left">
              <div class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {{ session?.name || 'User' }}
              </div>
              <div class="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                {{ activeTenant?.code }}
              </div>
            </div>
            <UIcon name="i-heroicons-chevron-down" class="w-4.5 h-4.5 text-slate-400" />
          </UButton>
        </UDropdown>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- Desktop Fixed Sidebar -->
      <aside class="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md p-4 space-y-6">
        <!-- Active Tenant Info Badge -->
        <div class="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-500/20">
          <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            {{ $t('header.active_tenant') }}
          </div>
          <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
            {{ activeTenant?.name }}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">
            {{ activeTenant?.region }}
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
              route.path.includes(item.key)
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <UIcon :name="item.icon" class="w-6 h-6" />
            <span>{{ $t(item.labelKey) }}</span>
          </NuxtLink>
        </nav>

        <!-- Session Cleansed Info Footnote -->
        <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-400 flex items-center gap-2">
          <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Tenant Isolated SSG State</span>
        </div>
      </aside>

      <!-- Mobile Slide-out Drawer Menu -->
      <USlideover v-model:open="isMobileMenuOpen" side="left">
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

            <div class="p-3 rounded-xl bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {{ activeTenant?.name }}
            </div>

            <nav class="space-y-1">
              <NuxtLink
                v-for="item in navItems"
                :key="item.key"
                :to="item.to"
                class="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold"
                :class="[
                  route.path.includes(item.key)
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
      confirm-color="rose"
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
import { useNavigation } from '../composables/useNavigation'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useColorMode, useLocalePath, useSwitchLocalePath } from '#imports'
import ConfirmModal from '../components/app/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()

const { navItems } = useNavigation()
const { session, activeTenant, tenants, switchTenant, clearSession } = useAuthEngine()

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

const toggleLanguage = () => {
  const targetLocale = locale.value === 'th' ? 'en' : 'th'
  const targetPath = switchLocalePath(targetLocale)
  router.push(targetPath)
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
      label: session.value?.email || 'admin@flowbright.co',
      slot: 'header',
      disabled: true
    }
  ],
  tenants.value.map(t => ({
    label: `${t.name} (${t.code})`,
    icon: t.id === activeTenant.value.id ? 'i-heroicons-check-circle' : 'i-heroicons-building-office',
    click: () => switchTenant(t.id)
  })),
  [
    {
      label: t('auth.logout'),
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: handleLogout
    }
  ]
])
</script>
