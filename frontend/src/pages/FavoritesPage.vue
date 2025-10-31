<script setup lang="ts">
import { computed, onMounted } from 'vue'
import CampaignCard from 'src/components/CampaignCard.vue'
import DynamicGrid from 'src/components/DynamicGrid.vue'
import { useFavoritesStore } from 'src/stores/favorites'
import type { Project } from 'src/components/models'
import { useRouter } from 'vue-router'
import { useUser } from '@clerk/vue'

const router = useRouter()
const { isSignedIn, user } = useUser()
const favorites = useFavoritesStore()

onMounted(() => {
  favorites.setUser(user.value?.id ?? null)
})

const items = computed<Project[]>(() => favorites.items)

function openProject(id: string) {
  void router.push(`/projects/${id}`)
}

function toggleFavorite(project: Project) {
  if (!isSignedIn.value) {
    const redirect = encodeURIComponent('/favorites')
    void router.push(`/sign-in?redirect=${redirect}`)
    return
  }
  favorites.toggle(project)
}
</script>

<template>
  <q-page class="bg-surface">
    <!-- Header -->
    <section class="favorites-header">
      <div class="header-background">
        <div class="header-pattern"></div>
      </div>
      <div class="container">
        <div class="header-content">
          <div class="header-badge">
            <q-icon name="favorite" size="sm" class="q-mr-xs" />
            Favoritos
          </div>
          <h1 class="header-title">Campanhas Favoritas</h1>
          <p class="header-subtitle">Suas campanhas salvas com o coração</p>
        </div>
      </div>
    </section>

    <!-- Listagem -->
    <section class="q-pb-xl q-pt-lg">
      <div class="container">
        <div v-if="items.length === 0" class="empty-state">
          <q-icon name="favorite_border" size="4rem" class="empty-icon" />
          <h3 class="empty-title">Você ainda não tem favoritos</h3>
          <p class="empty-description">Explore as campanhas e toque no coração para salvar aqui.</p>
          <q-btn to="/projects" unelevated color="primary" label="Explorar campanhas" />
        </div>

        <DynamicGrid 
          v-else
          :items="items"
          layout="grid"
          :animated="true"
          :responsive="true"
          min-item-width="350px"
          gap="24px"
          item-key="id"
        >
          <template #default="{ item: project }">
            <CampaignCard
              :project="project"
              :is-favorite="true"
              @click="openProject"
              @favorite="toggleFavorite"
            />
          </template>
        </DynamicGrid>
      </div>
    </section>
  </q-page>
</template>

<style scoped lang="scss">
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}
.empty-state {
  text-align: center;
  padding: 64px 0;
}

// === HEADER ===
.favorites-header {
  background: var(--gradient-hero);
  color: white;
  padding: 80px 0 64px;
  position: relative;
  overflow: hidden;
}

.header-background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.header-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>') repeat;
}

.header-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  margin-bottom: 12px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: clamp(1.0625rem, 2.5vw, 1.25rem);
  opacity: 0.95;
  line-height: 1.6;
}

.empty-icon { color: var(--color-primary); }
.empty-title { margin-top: 8px; }
.empty-description {
  color: #64748b;
  margin: 6px auto 16px;
  max-width: 680px;
  text-align: center;
}

/* Dark mode tweaks */
[data-theme='dark'] .empty-description { color: #cbd5e1; }

@media (max-width: 768px) {
  .container { padding: 0 16px; }
  .favorites-header { padding: 64px 0 48px; }
}
</style>


