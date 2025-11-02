<script setup lang="ts">
import { SignUp, useAuth } from '@clerk/vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const { isSignedIn, isLoaded } = useAuth()
const redirect = (typeof route.query.redirect === 'string' && route.query.redirect) ? String(route.query.redirect) : '/'
const signInUrl = `/sign-in?redirect=${encodeURIComponent(redirect)}`

function goHome() {
  const target = typeof redirect === 'string' && redirect ? redirect : '/'
  try {
    // Limpa flag de redirecionamento para evitar loops subsequentes
    sessionStorage.removeItem('auth_redirect_ts')
    sessionStorage.removeItem('auth_redirect_path')
  } catch (_err) {
    if (import.meta.env.DEV) console.debug(_err)
  }
  if (router.currentRoute.value.fullPath !== target) {
    void router.replace(target)
  }
}

onMounted(() => {
  if (isLoaded.value && isSignedIn.value) {
    goHome()
  }
})

watch([isLoaded, isSignedIn], ([loaded, signed]) => {
  if (loaded && signed) {
    goHome()
  }
})
</script>

<template>
  <div class="q-pa-xl flex flex-center bg-surface">
    <SignUp
      :afterSignUpUrl="redirect"
      :afterSignInUrl="redirect"
      :signInUrl="signInUrl"
    />
  </div>
</template>
