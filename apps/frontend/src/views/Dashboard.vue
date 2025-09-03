<template>
  <!-- Se não logado, redireciona -->
  <SignedOut>
    <RedirectToSignIn />
  </SignedOut>

  <!-- Se logado, mostra conteúdo -->
  <SignedIn>
    <div class="q-pa-md">
      <div class="row items-center q-gutter-md">
        <UserButton />
        <div>
          <h1 class="q-mb-xs">Dashboard</h1>
          <p>Você está autenticado ✅</p>
        </div>
      </div>
    </div>
  </SignedIn>
</template>

<script setup lang="ts">
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/vue'
</script>
