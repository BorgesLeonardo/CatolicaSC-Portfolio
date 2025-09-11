<template>
  <q-card class="rounded-borders project-card" flat bordered>
    <!-- Image -->
    <div class="project-image-container">
      <q-img
        :src="imageUrl || '/placeholder-project.jpg'"
        :alt="`Imagem da campanha ${title}`"
        class="project-image"
        fit="cover"
        loading="lazy"
      >
        <div class="absolute-bottom-right q-pa-sm">
          <q-chip
            v-if="isEndingSoon"
            color="warning"
            text-color="white"
            size="sm"
            icon="schedule"
          >
            Termina em breve
          </q-chip>
        </div>
      </q-img>
    </div>

    <q-card-section>
      <!-- Title -->
      <h3 class="text-h6 text-weight-600 q-mb-xs project-title">
        {{ title }}
      </h3>

      <!-- Owner -->
      <p class="text-caption text-grey-7 q-mb-md">
        por {{ ownerName }}
      </p>

      <!-- Progress -->
      <UiProgress
        :label="`R$ ${formatMoney(raised || 0)} arrecadados`"
        :current="raised || 0"
        :total="goal || 0"
        class="q-mb-md"
      />

      <!-- Stats -->
      <div class="row items-center justify-between text-caption text-grey-7">
        <div class="row items-center q-gutter-sm">
          <span>
            <q-icon name="people" size="xs" class="q-mr-xs" />
            {{ supporters || 0 }} apoiadores
          </span>
        </div>
        <div v-if="endsAt" class="text-right">
          <q-icon name="schedule" size="xs" class="q-mr-xs" />
          {{ formatDate(endsAt) }}
        </div>
      </div>
    </q-card-section>

    <q-card-actions class="q-pa-md q-pt-none">
      <q-btn
        color="primary"
        label="Ver detalhes"
        icon="visibility"
        :to="`/projects/${id}`"
        class="full-width"
        rounded
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiProgress from '../ui/UiProgress.vue'

interface Props {
  id: number
  title: string
  ownerName?: string
  imageUrl?: string
  goal?: number
  raised?: number
  supporters?: number
  endsAt?: string
}

const props = defineProps<Props>()

const isEndingSoon = computed(() => {
  if (!props.endsAt) return false
  const endDate = new Date(props.endsAt)
  const now = new Date()
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysLeft <= 7 && daysLeft > 0
})

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style scoped>
.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.project-image-container {
  height: 200px;
  overflow: hidden;
  border-radius: 1rem 1rem 0 0;
}

.project-image {
  width: 100%;
  height: 100%;
}

.project-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 2.8em;
}
</style>
