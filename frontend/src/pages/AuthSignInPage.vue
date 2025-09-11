<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row full-width">
      <div class="col-12 col-md-6 col-lg-4 offset-md-3 offset-lg-4">
        <q-card class="rounded-borders">
          <q-card-section class="text-center q-pa-xl">
            <div class="q-mb-lg">
              <h1 class="text-h4 text-weight-700 q-mb-sm">
                Entrar
              </h1>
              <p class="text-body1 text-grey-7">
                Acesse sua conta para continuar
              </p>
            </div>

            <div class="q-mb-lg">
              <SignIn />
            </div>

            <div class="text-center">
              <p class="text-body2 text-grey-7 q-mb-sm">
                Não tem uma conta?
              </p>
              <q-btn
                flat
                color="primary"
                label="Criar conta"
                to="/auth/sign-up"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>
