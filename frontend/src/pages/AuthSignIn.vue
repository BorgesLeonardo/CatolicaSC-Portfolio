<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const redirect = (typeof route.query.redirect === 'string' && route.query.redirect) ? String(route.query.redirect) : '/'
</script>

<template>
  <div class="q-pa-xl flex flex-center bg-surface">
    <SignIn :afterSignInUrl="redirect" :afterSignUpUrl="redirect" />
  </div>
  
</template>
