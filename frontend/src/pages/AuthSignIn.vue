<script setup lang="ts">
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/vue'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'

const route = useRoute()
const redirect = (typeof route.query.redirect === 'string' && route.query.redirect) ? String(route.query.redirect) : '/'

// Normalize URLs that accidentally contain a second hash before query ("#/sign-in#/?...")
onMounted(() => {
  const w = typeof window !== 'undefined' ? window : undefined
  if (!w) return
  const href = w.location.href
  if (href.includes('#/?')) {
    const fixed = href.replace('#/?', '?')
    try { w.history.replaceState(null, '', fixed) } catch { w.location.replace(fixed) }
  }
})
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
