<script setup lang="ts">
import { SignIn, useAuth } from '@clerk/vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const { isSignedIn, isLoaded } = useAuth()
const redirect = (typeof route.query.redirect === 'string' && route.query.redirect) ? String(route.query.redirect) : '/'
const signUpUrl = `/sign-up?redirect=${encodeURIComponent(redirect)}`

function goBack() {
  const target = typeof redirect === 'string' && redirect ? redirect : '/'
  try {
    // Limpa flag de redirecionamento para evitar loops subsequentes
    sessionStorage.removeItem('auth_redirect_ts')
    sessionStorage.removeItem('auth_redirect_path')
  } catch {}
  if (router.currentRoute.value.fullPath !== target) {
    void router.replace(target)
  }
}

onMounted(() => {
  if (isLoaded.value && isSignedIn.value) {
    goBack()
  }
})

watch([isLoaded, isSignedIn], ([loaded, signed]) => {
  if (loaded && signed) {
    goBack()
  }
})
</script>

<template>
  <div class="q-pa-xl flex flex-center bg-surface">
    <SignIn
      :afterSignInUrl="redirect"
      :signUpUrl="signUpUrl"
    />
  </div>
  
</template>
