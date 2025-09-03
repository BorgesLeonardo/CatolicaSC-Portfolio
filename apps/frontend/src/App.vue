<template>
  <div class="q-pa-sm q-gutter-md" style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eee">
    <div class="row q-gutter-sm">
      <router-link to="/">Home</router-link>
      <router-link to="/dashboard">Dashboard</router-link>
    </div>

    <div class="row q-gutter-sm items-center">
      <SignedOut>
        <router-link to="/sign-in">Entrar</router-link>
        <router-link to="/sign-up">Criar conta</router-link>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  </div>

  <router-view />
</template>

<script setup lang="ts">
import { SignedIn, SignedOut, UserButton } from '@clerk/vue'
</script>
