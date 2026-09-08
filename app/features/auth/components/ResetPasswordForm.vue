<template>
  <div class="w-full max-w-md mx-auto">
    <UCard class="glass-panel shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-800/80 rounded-2xl">
      <template #header>
        <div class="text-center space-y-3 py-4">
          <div
            class="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-500/5 dark:from-indigo-400/20 dark:to-purple-500/10 p-2.5 ring-1 ring-indigo-500/20 shadow-xl shadow-indigo-500/10 backdrop-blur-sm group transition-transform duration-300 hover:scale-105"
          >
            <img
              src="/apple-touch-icon.png"
              alt="FlowBright Platform"
              class="w-full h-full object-contain rounded-2xl drop-shadow-md"
            />
          </div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {{ isSuccess ? $t('auth.password_reset_success_title') : $t('auth.reset_password_title') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            {{ isSuccess ? $t('auth.password_reset_success_desc') : $t('auth.reset_password_subtitle') }}
          </p>
        </div>
      </template>

      <!-- Success State -->
      <div v-if="isSuccess" class="space-y-6 py-2">
        <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200/60 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          <div class="space-y-1">
            <p class="font-bold">{{ $t('auth.password_reset_success_title') }}</p>
            <p class="text-slate-600 dark:text-slate-300">
              {{ $t('auth.password_reset_success_desc') }}
            </p>
          </div>
        </div>

        <UButton
          block
          size="lg"
          color="primary"
          class="font-bold py-3 shadow-lg shadow-indigo-600/20 rounded-xl hover:shadow-indigo-600/30 transition-all text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600"
          @click="navigateToLogin"
        >
          {{ $t('auth.sign_in') }}
        </UButton>
      </div>

      <!-- Missing / Expired Recovery Token Warning -->
      <div v-else-if="tokenChecked && !recoveryToken" class="space-y-6 py-2">
        <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200/60 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div class="space-y-1">
            <p class="font-bold">{{ $t('toast.action_failed') }}</p>
            <p class="text-slate-600 dark:text-slate-300">
              {{ recoveryErrorDescription || $t('auth.invalid_or_missing_token') }}
            </p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <NuxtLink :to="localePath('/forgot-password')">
            <UButton
              block
              size="lg"
              color="primary"
              class="font-bold py-2.5 rounded-xl transition-all"
            >
              {{ $t('auth.request_new_link') }}
            </UButton>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/login')"
            class="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            <span>{{ $t('auth.back_to_login') }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Reset Password Form -->
      <form v-else @submit.prevent="handleSubmit" novalidate class="space-y-6">
        <!-- New Password Field -->
        <UFormField :label="$t('auth.new_password')" :error="errors.password ? $t(errors.password) : undefined">
          <UInput
            v-model="form.new_password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="$t('auth.new_password_placeholder')"
            icon="i-heroicons-lock-closed"
            size="lg"
            class="w-full font-medium"
            :disabled="loading"
            @input="errors.password = ''"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="ghost"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                size="sm"
                class="mr-1"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Real-Time Password Criteria Checklist -->
        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
          <p class="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
            {{ $t('auth.reset_password_subtitle') }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div class="flex items-center gap-1.5" :class="rules.minLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
              <UIcon :name="rules.minLength ? 'i-heroicons-check-circle' : 'i-heroicons-minus-circle'" class="w-4 h-4 shrink-0" />
              <span>{{ $t('auth.password_rule_length') }}</span>
            </div>
            <div class="flex items-center gap-1.5" :class="rules.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
              <UIcon :name="rules.hasUpper ? 'i-heroicons-check-circle' : 'i-heroicons-minus-circle'" class="w-4 h-4 shrink-0" />
              <span>{{ $t('auth.password_rule_upper') }}</span>
            </div>
            <div class="flex items-center gap-1.5" :class="rules.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
              <UIcon :name="rules.hasLower ? 'i-heroicons-check-circle' : 'i-heroicons-minus-circle'" class="w-4 h-4 shrink-0" />
              <span>{{ $t('auth.password_rule_lower') }}</span>
            </div>
            <div class="flex items-center gap-1.5" :class="rules.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
              <UIcon :name="rules.hasNumber ? 'i-heroicons-check-circle' : 'i-heroicons-minus-circle'" class="w-4 h-4 shrink-0" />
              <span>{{ $t('auth.password_rule_number') }}</span>
            </div>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <UFormField :label="$t('auth.confirm_password')" :error="errors.confirmPassword ? $t(errors.confirmPassword) : undefined">
          <UInput
            v-model="form.confirm_password"
            :type="showConfirmPassword ? 'text' : 'password'"
            :placeholder="$t('auth.confirm_password_placeholder')"
            icon="i-heroicons-lock-closed"
            size="lg"
            class="w-full font-medium"
            :disabled="loading"
            @input="errors.confirmPassword = ''"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="ghost"
                :icon="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                size="sm"
                class="mr-1"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Match Confirmation Indicator -->
        <div v-if="form.confirm_password" class="flex items-center gap-1.5 text-xs" :class="passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400'">
          <UIcon :name="passwordsMatch ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" class="w-4 h-4 shrink-0" />
          <span>{{ passwordsMatch ? $t('auth.password_rule_match') : $t('auth.passwords_dont_match') }}</span>
        </div>

        <!-- Submit Button -->
        <UButton
          type="submit"
          block
          size="lg"
          color="primary"
          :loading="loading"
          class="font-bold py-3 shadow-lg shadow-indigo-600/20 rounded-xl hover:shadow-indigo-600/30 transition-all text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          {{ loading ? $t('auth.updating_password') : $t('auth.update_password') }}
        </UButton>

        <!-- Back to Sign In Link -->
        <div class="text-center pt-1">
          <NuxtLink
            :to="localePath('/login')"
            class="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5" />
            <span>{{ $t('auth.back_to_login') }}</span>
          </NuxtLink>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthEngine, validatePasswordRules, extractRecoveryDetails } from '../composables/useAuthEngine'
import { useAppToast } from '../../../composables/useAppToast'
import { useLocalePath } from '#imports'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { updatePassword, clearSession } = useAuthEngine()
const { showError, showSuccess } = useAppToast()

const loading = ref(false)
const isSuccess = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const tokenChecked = ref(false)
const recoveryToken = ref<string | null>(null)
const recoveryErrorDescription = ref<string | null>(null)

const form = reactive({
  new_password: '',
  confirm_password: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

const rules = computed(() => validatePasswordRules(form.new_password))

const passwordsMatch = computed(() => {
  return form.new_password && form.confirm_password && form.new_password === form.confirm_password
})

const syncRecoveryCredentials = () => {
  const details = extractRecoveryDetails(route)
  if (details.token) {
    recoveryToken.value = details.token
  }
  if (details.errorDescription) {
    recoveryErrorDescription.value = details.errorDescription
  } else if (details.error) {
    recoveryErrorDescription.value = details.error
  }
  tokenChecked.value = true
}

onMounted(() => {
  syncRecoveryCredentials()
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', syncRecoveryCredentials)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('hashchange', syncRecoveryCredentials)
  }
})

const navigateToLogin = () => {
  router.push(localePath('/login'))
}

const handleSubmit = async () => {
  errors.password = ''
  errors.confirmPassword = ''

  if (!recoveryToken.value) {
    showError(recoveryErrorDescription.value || t('auth.invalid_or_missing_token'))
    return
  }

  if (!form.new_password) {
    errors.password = 'auth.password_required'
  } else if (!rules.value.isValid) {
    errors.password = 'auth.password_rules_error'
  }

  if (!form.confirm_password) {
    errors.confirmPassword = 'auth.confirm_password_required'
  } else if (form.new_password !== form.confirm_password) {
    errors.confirmPassword = 'auth.passwords_dont_match'
  }

  if (errors.password || errors.confirmPassword) {
    showError(t(errors.password || errors.confirmPassword))
    return
  }

  loading.value = true

  try {
    await updatePassword(form.new_password, recoveryToken.value)
    isSuccess.value = true
    showSuccess('update', t('auth.password'))

    // Scrub token from address bar for security
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Cleanse any old session memory
    clearSession()

    setTimeout(() => {
      router.push(localePath('/login'))
    }, 2000)
  } catch (err: any) {
    showError(err)
    const msg = (err?.message || '').toLowerCase()
    if (msg.includes('token') || msg.includes('expired') || msg.includes('unauthorized')) {
      recoveryToken.value = null
      recoveryErrorDescription.value = err.message
    }
  } finally {
    loading.value = false
  }
}
</script>
