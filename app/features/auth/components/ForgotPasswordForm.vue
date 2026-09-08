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
            {{ isSubmitted ? $t('auth.reset_link_sent_title') : $t('auth.forgot_password_title') }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            {{ isSubmitted ? $t('auth.reset_link_sent_desc', { email: form.email }) : $t('auth.forgot_password_subtitle') }}
          </p>
        </div>
      </template>

      <!-- Success State: Instructions Sent -->
      <div v-if="isSubmitted" class="space-y-6 py-2">
        <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200/60 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          <div class="space-y-1">
            <p class="font-bold">{{ $t('auth.reset_link_sent_title') }}</p>
            <p class="text-slate-600 dark:text-slate-300">
              {{ $t('auth.reset_link_sent_desc', { email: form.email }) }}
            </p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <UButton
            block
            size="lg"
            variant="outline"
            color="primary"
            :loading="loading"
            class="font-bold py-2.5 rounded-xl transition-all"
            @click="handleSubmit"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1.5" />
            {{ $t('auth.resend_link') }}
          </UButton>

          <NuxtLink
            :to="localePath('/login')"
            class="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            <span>{{ $t('auth.back_to_login') }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Input State: Enter Email -->
      <form v-else @submit.prevent="handleSubmit" novalidate class="space-y-6">
        <!-- Email Field -->
        <UFormField :label="$t('auth.email')" :error="errors.email ? $t(errors.email) : undefined">
          <UInput
            v-model="form.email"
            type="email"
            :placeholder="$t('auth.email_placeholder')"
            icon="i-heroicons-envelope"
            size="lg"
            class="w-full font-medium"
            :disabled="loading"
            @input="errors.email = ''"
          />
        </UFormField>

        <!-- Submit Button -->
        <UButton
          type="submit"
          block
          size="lg"
          color="primary"
          :loading="loading"
          class="font-bold py-3 shadow-lg shadow-indigo-600/20 rounded-xl hover:shadow-indigo-600/30 transition-all text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          {{ loading ? $t('auth.sending_reset_link') : $t('auth.send_reset_link') }}
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
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthEngine } from '../composables/useAuthEngine'
import { useAppToast } from '../../../composables/useAppToast'
import { useLocalePath } from '#imports'

const { t } = useI18n()
const localePath = useLocalePath()
const { requestPasswordReset } = useAuthEngine()
const { showError } = useAppToast()

const loading = ref(false)
const isSubmitted = ref(false)

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const handleSubmit = async () => {
  errors.email = ''

  const trimmedEmail = form.email.trim()
  if (!trimmedEmail) {
    errors.email = 'auth.email_required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'auth.email_invalid'
  }

  if (errors.email) {
    showError(t(errors.email))
    return
  }

  loading.value = true

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectTo = `${origin}/resetpassword`

    await requestPasswordReset(trimmedEmail, redirectTo)
    isSubmitted.value = true
  } catch (err: any) {
    showError(err)
  } finally {
    loading.value = false
  }
}
</script>
