<script setup lang="ts">
import { SignUp } from '@clerk/vue'
</script>

<template>
  <div class="q-pa-xl flex flex-center">
    <SignUp
      fallbackRedirectUrl="/"
      forceRedirectUrl="/"
      signInFallbackRedirectUrl="/"
    />
  </div>
</template>
