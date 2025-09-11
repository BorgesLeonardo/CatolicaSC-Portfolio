<template>
  <div class="ui-empty-state text-center q-pa-xl">
    <q-icon
      :name="icon"
      size="4rem"
      :color="iconColor"
      class="q-mb-md"
    />
    <h3 class="text-h6 text-weight-600 q-mb-sm">
      {{ title }}
    </h3>
    <p class="text-body2 text-grey-7 q-mb-lg">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  iconColor?: string
  title: string
  description: string
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  iconColor: 'grey-5',
})
</script>

<style scoped>
.ui-empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
