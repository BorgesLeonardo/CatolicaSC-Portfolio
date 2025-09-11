<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>Crowdfunding</q-toolbar-title>

        <div class="q-gutter-sm">
          <SignedOut>
            <q-btn flat label="Entrar" to="/sign-in" />
            <q-btn flat label="Cadastrar" to="/sign-up" />
          </SignedOut>
          <SignedIn>
            <q-btn flat label="Nova Campanha" to="/projects/new" />
            <q-btn flat label="Minhas Campanhas" to="/me" />
            <UserButton />
          </SignedIn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navegação</q-item-label>
        <q-item clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/projects/new">
          <q-item-section avatar>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Nova Campanha</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/me">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Minhas Campanhas</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SignedIn, SignedOut, UserButton } from '@clerk/vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
