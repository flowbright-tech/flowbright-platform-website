<template>
  <div class="w-full max-w-md mx-auto">
    <UCard class="glass-panel shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-800/80 rounded-2xl">
      <template #header>
        <div class="text-center space-y-3 py-4">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-inner">
            <UIcon name="i-heroicons-building-office-2" class="w-10 h-10" />
          </div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {{ $t('auth.login_title') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            {{ $t('auth.login_subtitle') }}
          </p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" novalidate class="space-y-6">
        <!-- API Error Alert -->
        <div v-if="errors.api" class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200/60 dark:border-rose-800/80 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
          <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 shrink-0 text-rose-500" />
          <span>{{ errors.api }}</span>
        </div>

        <!-- Email Field -->
        <UFormField :label="$t('auth.email')" :error="errors.email ? $t(errors.email) : undefined">
          <UInput
            v-model="form.email"
            type="email"
            :placeholder="$t('auth.email_placeholder')"
            icon="i-heroicons-envelope"
            size="lg"
            class="w-full font-medium"
            @input="errors.email = ''"
          />
        </UFormField>

        <!-- Password Field -->
        <div class="space-y-1">
          <UFormField :label="$t('auth.password')" :error="errors.password ? $t(errors.password) : undefined">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.password_placeholder')"
              icon="i-heroicons-lock-closed"
              size="lg"
              class="w-full font-medium"
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

          <!-- Forgot Password Link -->
          <div class="flex items-center justify-end pt-1">
            <NuxtLink :to="localePath('/login')" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {{ $t('auth.forgot_password') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Cleansed Memory Badge -->
        <div v-if="cleansedNotice" class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200/60 dark:border-emerald-800/80 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
          <UIcon name="i-heroicons-shield-check" class="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{{ $t('auth.tenant_cleansed') }}</span>
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
          {{ loading ? $t('auth.signing_in') : $t('auth.sign_in') }}
        </UButton>
      </form>

      <template #footer>
        <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 py-1">
          <span>Flow Bright SRP v4.2</span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon name="i-heroicons-check-badge" class="w-5 h-5 text-indigo-500" />
            SSG Client Isolated
          </span>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthEngine } from '../composables/useAuthEngine'
import { useLocalePath, useRuntimeConfig } from '#imports'

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { tenants, login, loginWithProfile } = useAuthEngine()

const cleansedNotice = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: '',
  api: ''
})

const handleLogin = async () => {
  // Validate Email
  errors.email = ''
  errors.password = ''
  errors.api = ''

  if (!form.email) {
    errors.email = 'auth.email_required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'auth.email_invalid'
  }

  if (!form.password) {
    errors.password = 'auth.password_required'
  } else if (form.password.length < 6) {
    errors.password = 'auth.password_min'
  }

  if (errors.email || errors.password) {
    return
  }

  loading.value = true

  try {
    const config = useRuntimeConfig()
    const apiDomain = config.public.apiDomain || 'https://flowbright-platform-api.onrender.com'
    const res = await fetch(`${apiDomain}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password
      })
    })

    const data = await res.json()

    if (!res.ok) {
      // Map basic validation message or fallback to credentials error translation key
      if (res.status === 401 || res.status === 403) {
        errors.api = t('auth.invalid_credentials')
      } else {
        errors.api = data.message || t('auth.invalid_credentials')
      }
      loading.value = false
      return
    }

    const userProfile = data.data?.user
    const companyProfile = data.data?.user?.company
    const token = data.data?.token || data.token

    if (userProfile && companyProfile && token) {
      loginWithProfile(token, userProfile, companyProfile)
    } else {
      login(form.email, token || 'mock_jwt_token_auth')
    }
    
    cleansedNotice.value = true

    setTimeout(() => {
      loading.value = false
      router.push(localePath('/'))
    }, 400)
  } catch (err: any) {
    loading.value = false
    errors.api = err.message || t('auth.invalid_credentials')
  }
}
</script>
