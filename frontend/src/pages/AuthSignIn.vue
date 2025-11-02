<script setup lang="ts">
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const redirect = (typeof route.query.redirect === 'string' && route.query.redirect) ? String(route.query.redirect) : '/'
</script>

<template>
  <div class="q-pa-xl flex flex-center bg-surface" style="min-height: 60vh">
    <ClerkLoaded>
      <SignIn :afterSignInUrl="redirect" :afterSignUpUrl="redirect" />
    </ClerkLoaded>
    <ClerkLoading>
      <q-spinner color="primary" size="lg" />
    </ClerkLoading>
  </div>
  
</template>
