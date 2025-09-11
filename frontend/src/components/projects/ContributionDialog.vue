<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="rounded-borders" style="min-width: 400px; max-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-600">Contribuir para {{ projectName }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-if="imageUrl" class="q-mb-md">
          <q-img
            :src="imageUrl"
            class="rounded-borders"
            style="width: 100%; height: 150px"
            fit="cover"
          />
        </div>

        <div class="text-body2 text-grey-7 q-mb-md">
          Escolha o valor da sua contribuição:
        </div>

        <!-- Preset Values -->
        <div class="row q-gutter-sm q-mb-md">
          <q-btn
            v-for="value in presetValues"
            :key="value"
            :color="selectedAmount === value ? 'primary' : 'grey-3'"
            :text-color="selectedAmount === value ? 'white' : 'grey-8'"
            :label="`R$ ${value}`"
            @click="selectAmount(value)"
            class="col"
            rounded
          />
        </div>

        <!-- Custom Amount -->
        <q-input
          v-model.number="customAmount"
          label="Valor personalizado (R$)"
          type="number"
          outlined
          :min="minAmountCents / 100"
          :step="0.01"
          @update:model-value="onCustomAmountChange"
        >
          <template #hint>
            Valor mínimo: R$ {{ (minAmountCents / 100).toFixed(2) }}
          </template>
        </q-input>

        <div class="text-caption text-grey-7 q-mt-sm">
          Sua contribuição será processada de forma segura via Stripe.
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          v-close-popup
          class="q-mr-sm"
        />
        <q-btn
          color="primary"
          :label="`Contribuir R$ ${finalAmount.toFixed(2)}`"
          :loading="loading"
          :disable="!isValidAmount"
          @click="processContribution"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { loadStripe } from '@stripe/stripe-js'
import http from '../services/http'

interface Props {
  modelValue: boolean
  projectId: number
  projectName: string
  imageUrl?: string
  currency?: string
  presetValues?: number[]
  minAmountCents?: number
  checkoutEndpoint?: string
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'BRL',
  presetValues: () => [25, 50, 100, 200],
  minAmountCents: 500,
  checkoutEndpoint: '/api/contributions/checkout',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const $q = useQuasar()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedAmount = ref<number | null>(null)
const customAmount = ref<number | null>(null)
const loading = ref(false)

const finalAmount = computed(() => {
  return selectedAmount.value || customAmount.value || 0
})

const isValidAmount = computed(() => {
  return finalAmount.value >= props.minAmountCents / 100
})

const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  customAmount.value = null
}

const onCustomAmountChange = () => {
  selectedAmount.value = null
}

// Reset form when dialog opens
watch(isOpen, (newValue) => {
  if (newValue) {
    selectedAmount.value = null
    customAmount.value = null
  }
})

const processContribution = async () => {
  if (!isValidAmount.value) return

  loading.value = true

  try {
    const amountCents = Math.round(finalAmount.value * 100)
    
    const response = await http.post(props.checkoutEndpoint, {
      projectId: props.projectId,
      amount: amountCents,
      currency: props.currency.toLowerCase(),
      successUrl: `${window.location.origin}/checkout/success`,
      cancelUrl: `${window.location.origin}/checkout/cancel`,
    })

    const { id: sessionId } = response.data

    // Load Stripe
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    
    if (!stripe) {
      throw new Error('Stripe não pôde ser carregado')
    }

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    })

    if (error) {
      throw new Error(error.message || 'Stripe checkout error')
    }
  } catch (error: unknown) {
    console.error('Erro ao processar contribuição:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar contribuição'
    $q.notify({
      type: 'negative',
      message: errorMessage,
    })
  } finally {
    loading.value = false
  }
}
</script>
