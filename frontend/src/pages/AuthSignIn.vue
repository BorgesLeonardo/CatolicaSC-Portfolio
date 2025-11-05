<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const redirect = (typeof route.query.redirect === 'string' && route.query.redirect) ? String(route.query.redirect) : '/'
const signUpUrl = `/sign-up?redirect=${encodeURIComponent(redirect)}`
</script>

<template>
  <div class="q-pa-xl flex flex-center bg-surface">
    <SignIn
      :afterSignInUrl="redirect"
      :signUpUrl="signUpUrl"
    />
  </div>
  
</template>
