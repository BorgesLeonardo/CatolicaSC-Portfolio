<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="modern-toolbar" elevated>
      <q-toolbar class="q-px-lg">
        <q-btn 
          flat 
          dense 
          round 
          icon="menu" 
          aria-label="Menu" 
          @click="toggleLeftDrawer"
          class="lt-lg"
        />

        <q-toolbar-title class="q-ml-sm">
          <div class="row items-center no-wrap">
            <q-icon name="campaign" size="md" color="primary" class="q-mr-sm" />
            <span class="text-h6">Crowdfunding</span>
          </div>
        </q-toolbar-title>

        <!-- Desktop Navigation -->
        <div class="gt-md">
          <q-tabs 
            v-model="currentTab" 
            align="left" 
            class="text-grey-8"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="home" label="Início" to="/" />
            <q-tab name="campaigns" label="Campanhas" to="/projects" />
            <q-tab name="about" label="Como Funciona" />
          </q-tabs>
        </div>

        <q-space />

        <!-- Auth Buttons -->
        <div class="q-gutter-sm row items-center">
          <SignedOut>
            <q-btn 
              flat 
              label="Entrar" 
              to="/sign-in" 
              class="text-weight-medium"
              text-color="grey-8"
            />
            <q-btn 
              unelevated
              label="Cadastrar" 
              to="/sign-up"
              color="primary"
              class="text-weight-medium q-px-lg"
              style="border-radius: 8px;"
            />
          </SignedOut>
          <SignedIn>
            <q-btn 
              flat 
              icon="add" 
              label="Nova Campanha" 
              to="/projects/new"
              color="primary"
              class="text-weight-medium gt-sm"
            />
            <q-btn 
              flat 
              icon="dashboard" 
              label="Dashboard" 
              to="/me"
              class="text-weight-medium gt-sm"
              text-color="grey-8"
            />
            <UserButton />
          </SignedIn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer 
      v-model="leftDrawerOpen" 
      show-if-above 
      bordered
      class="bg-grey-1"
      :width="280"
    >
      <div class="q-pa-lg">
        <div class="row items-center q-mb-lg">
          <q-icon name="campaign" size="md" color="primary" />
          <span class="text-h6 q-ml-sm text-weight-bold">Crowdfunding</span>
        </div>

        <q-list class="rounded-borders">
          <q-item-label header class="text-weight-bold text-grey-8">
            Navegação
          </q-item-label>
          
          <q-item 
            clickable 
            v-ripple 
            to="/"
            class="rounded-borders q-mb-xs"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Início</q-item-label>
            </q-item-section>
          </q-item>

          <q-item 
            clickable 
            v-ripple 
            to="/projects"
            class="rounded-borders q-mb-xs"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="campaign" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Campanhas</q-item-label>
            </q-item-section>
          </q-item>

          <SignedIn>
            <q-separator class="q-my-md" />
            <q-item-label header class="text-weight-bold text-grey-8">
              Minha Conta
            </q-item-label>

            <q-item 
              clickable 
              v-ripple 
              to="/projects/new"
              class="rounded-borders q-mb-xs"
              active-class="bg-primary text-white"
            >
              <q-item-section avatar>
                <q-icon name="add_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Nova Campanha</q-item-label>
              </q-item-section>
            </q-item>

            <q-item 
              clickable 
              v-ripple 
              to="/me"
              class="rounded-borders q-mb-xs"
              active-class="bg-primary text-white"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Dashboard</q-item-label>
              </q-item-section>
            </q-item>
          </SignedIn>
        </q-list>

        <SignedOut>
          <div class="q-mt-xl">
            <q-btn 
              unelevated
              color="primary" 
              label="Começar Agora"
              to="/sign-up"
              class="full-width text-weight-medium"
              style="border-radius: 8px;"
              size="md"
            />
          </div>
        </SignedOut>
      </div>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SignedIn, SignedOut, UserButton } from '@clerk/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const leftDrawerOpen = ref(false)
const currentTab = ref('home')

// Atualiza a tab ativa baseada na rota atual
function updateCurrentTab() {
  if (route.path === '/') {
    currentTab.value = 'home'
  } else if (route.path.startsWith('/projects')) {
    currentTab.value = 'campaigns'
  }
}

// Atualiza a tab quando a rota muda
updateCurrentTab()

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
