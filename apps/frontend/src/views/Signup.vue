<template>
  <div class="q-pa-md" style="max-width: 420px; margin: 0 auto;">
    <h1 class="q-mb-md">Criar conta</h1>
    <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
  </div>
</template>

<script setup lang="ts">
import { SignUp } from '@clerk/vue'
</script>
