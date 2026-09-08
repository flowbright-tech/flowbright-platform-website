<template>
  <ResetPasswordForm />
</template>

<script setup lang="ts">
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm.vue'

definePageMeta({
  layout: 'auth',
  auth: false
})
</script>
