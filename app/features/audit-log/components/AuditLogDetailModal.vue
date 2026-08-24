<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-2xl' }">
    <template #content>
      <div v-if="log" class="p-6 space-y-6 bg-white dark:bg-slate-900 rounded-2xl max-h-[85vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :class="[
                log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                log.action === 'UPDATE' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              ]"
            >
              <UIcon :name="getActionIcon(log.action)" class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span
                  :class="getActionBadgeClass(log.action)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase transition-all"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {{ log.action }}
                </span>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs"
                >
                  <UIcon :name="getEntityTypeIcon(log.entity_type)" class="w-3.5 h-3.5 text-indigo-500" />
                  {{ log.entity_type }}
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white mt-1">
                {{ $t('audit_logs.detail_title') }}
              </h3>
            </div>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="sm"
            @click="isOpen = false"
          />
        </div>

        <!-- Meta Summary Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Operator / User Info -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {{ $t('audit_logs.operator') }}
            </span>
            <div class="flex items-center gap-3">
              <UAvatar
                :alt="getAuditUserDisplayName(log.user, locale)"
                size="sm"
                class="ring-1 ring-indigo-500/30"
              />
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ getAuditUserDisplayName(log.user, locale) }}
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {{ log.user?.email || $t('audit_logs.unknown_user') }}
                </div>
              </div>
              <UBadge v-if="log.user?.role" color="primary" variant="subtle" size="xs" class="capitalize">
                {{ log.user.role }}
              </UBadge>
            </div>
          </div>

          <!-- Timestamp -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {{ $t('audit_logs.timestamp') }}
            </span>
            <div class="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{{ formatAuditDateTime(log.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Details / Payload JSON Viewer -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 text-indigo-500" />
              {{ $t('audit_logs.details_payload') }}
            </span>
            <UButton
              color="neutral"
              variant="outline"
              size="xs"
              :icon="isCopied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
              @click="copyJsonPayload"
            >
              {{ isCopied ? $t('common.copied') : $t('common.copy_json') }}
            </UButton>
          </div>

          <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto shadow-inner max-h-72">
            <pre class="leading-relaxed whitespace-pre-wrap break-words">{{ formattedDetails }}</pre>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <UButton color="neutral" variant="outline" @click="isOpen = false">
            {{ $t('common.close') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AuditLog } from '../types'
import {
  getActionBadgeClass,
  getActionIcon,
  getEntityTypeIcon,
  formatAuditDateTime,
  getAuditUserDisplayName
} from '../composables/useAuditLogEngine'

const props = defineProps<{
  log: AuditLog | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const { locale } = useI18n()
const isCopied = ref(false)

const formattedDetails = computed(() => {
  if (!props.log?.details) return '// No additional details payload recorded'
  try {
    return JSON.stringify(props.log.details, null, 2)
  } catch {
    return String(props.log.details)
  }
})

const copyJsonPayload = async () => {
  if (!props.log?.details) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.log.details, null, 2))
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy JSON payload', err)
  }
}
</script>
