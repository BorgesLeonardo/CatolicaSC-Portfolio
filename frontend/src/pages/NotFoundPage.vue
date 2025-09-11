<template>
  <q-page class="flex flex-center">
    <UiEmptyState
      icon="error_outline"
      title="Página não encontrada"
      description="A página que você está procurando não existe ou foi movida."
    >
      <template #action>
        <q-btn
          color="primary"
          label="Voltar ao início"
          to="/"
          icon="home"
        />
      </template>
    </UiEmptyState>
  </q-page>
</template>

<script setup lang="ts">
import UiEmptyState from '../components/ui/UiEmptyState.vue'
</script>
