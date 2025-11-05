<script setup lang="ts">
import { SignIn, useAuth } from '@clerk/vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { clearTempAuthRedirectCookie } from 'src/utils/http'

const route = useRoute()
const router = useRouter()
const { isSignedIn } = useAuth()
const redirect = (typeof route.query.redirect === 'string' && route.query.redirect) ? String(route.query.redirect) : '/'
const signUpUrl = `/sign-up?redirect=${encodeURIComponent(redirect)}`

const navigated = ref(false)

function goTargetOnce() {
  if (navigated.value) return
  navigated.value = true
  try {
    sessionStorage.removeItem('auth_redirect_ts')
    sessionStorage.removeItem('auth_redirect_path')
    clearTempAuthRedirectCookie()
  } catch (_err) { void _err }
  void router.replace(redirect || '/')
}

onMounted(() => {
  if (isSignedIn.value) {
    goTargetOnce()
  }
})

watch(isSignedIn, (signed) => {
  if (signed) {
    goTargetOnce()
  }
})
</script>

<template>
  <div class="q-pa-xl flex flex-center bg-surface">
    <SignIn
      :signUpUrl="signUpUrl"
    />
  </div>
  
</template>
