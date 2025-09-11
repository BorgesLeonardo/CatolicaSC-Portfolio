<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menu de navegação"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-toolbar-title>
          CatólicaSC Portfolio
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center">
          <template v-if="!isAuthenticated">
            <q-btn
              flat
              label="Entrar"
              to="/auth/sign-in"
              class="text-white"
            />
            <q-btn
              color="secondary"
              label="Cadastrar"
              to="/auth/sign-up"
              class="text-white"
            />
          </template>
          
          <template v-else>
            <q-btn
              flat
              round
              dense
              icon="person"
              :aria-label="`Menu do perfil de ${user?.firstName || 'Usuário'}`"
            >
              <q-menu>
                <q-list style="min-width: 200px">
                  <q-item clickable v-close-popup to="/profile">
                    <q-item-section avatar>
                      <q-icon name="person" />
                    </q-item-section>
                    <q-item-section>Perfil</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="signOut">
                    <q-item-section avatar>
                      <q-icon name="logout" />
                    </q-item-section>
                    <q-item-section>Sair</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header class="text-grey-8">
          Navegação
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useClerk } from '@clerk/vue'
import EssentialLink from 'src/components/EssentialLink.vue'

const { isSignedIn: isAuthenticated, user, signOut: clerkSignOut } = useClerk()

const leftDrawerOpen = ref(false)

const essentialLinks = [
  {
    title: 'Início',
    caption: 'Página inicial',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Campanhas',
    caption: 'Ver todas as campanhas',
    icon: 'campaign',
    link: '/projects',
  },
  {
    title: 'Criar Campanha',
    caption: 'Nova campanha',
    icon: 'add_circle',
    link: '/projects/create',
    requiresAuth: true,
  },
  {
    title: 'Perfil',
    caption: 'Meu perfil',
    icon: 'person',
    link: '/profile',
    requiresAuth: true,
  },
]

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const signOut = async () => {
  try {
    await clerkSignOut()
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>
