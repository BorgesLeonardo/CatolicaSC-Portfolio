<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<template>
  <div class="q-pa-xl flex flex-center">
    <SignIn
      fallbackRedirectUrl="/"
      forceRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    />
  </div>
</template>
