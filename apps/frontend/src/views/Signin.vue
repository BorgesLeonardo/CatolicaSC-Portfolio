<template>
  <div class="q-pa-md" style="max-width: 420px; margin: 0 auto;">
    <h1 class="q-mb-md">Entrar</h1>
    <!-- UI pronta do Clerk -->
    <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
  </div>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>
