<template>
  <div class="min-h-screen flex items-center justify-center">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-indigo-500 animate-spin" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'
import { useLocalePath } from '#imports'

const router = useRouter()
const localePath = useLocalePath()
const { isAuthenticated } = useAuthEngine()

onMounted(() => {
  if (isAuthenticated.value) {
    router.replace(localePath('/dashboard'))
  } else {
    router.replace(localePath('/login'))
  }
})
</script>
