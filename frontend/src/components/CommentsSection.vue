<!-- src/components/CommentsSection.vue -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { http } from 'src/utils/http'
import { useAuth, useUser } from '@clerk/vue'
import { Notify } from 'quasar'
import type { Comment, CommentResponse } from 'src/components/models'

const props = defineProps<{
  projectId: string
  projectOwnerId: string
}>()

const { isSignedIn, getToken } = useAuth()
const { user } = useUser()
const myId = computed(() => user.value?.id)

const items = ref<Comment[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const newComment = ref('')
const posting = ref(false)

async function fetchComments() {
  loading.value = true
  try {
    const { data } = await http.get<CommentResponse>(`/api/projects/${props.projectId}/comments`, {
      params: { page: page.value, pageSize: pageSize.value }
    })
    items.value = data.items ?? []
    total.value = data.total ?? 0
  } finally {
    loading.value = false
  }
}

async function postComment() {
  if (!isSignedIn.value) {
    Notify.create({ type: 'warning', message: 'Entre para comentar.' }); return
  }
  if (!newComment.value.trim()) return
  posting.value = true
  try {
    const token = await getToken.value?.()
    await http.post(`/api/projects/${props.projectId}/comments`, { content: newComment.value }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    newComment.value = ''
    await fetchComments()
  } catch {
    Notify.create({ type: 'negative', message: 'Não foi possível publicar o comentário.' })
  } finally {
    posting.value = false
  }
}

function canDelete(c: Comment): boolean {
  return c.authorId === myId.value || props.projectOwnerId === myId.value
}

async function deleteComment(id: string) {
  if (!isSignedIn.value) return
  const token = await getToken.value?.()
  try {
    await http.delete(`/api/comments/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    await fetchComments()
  } catch {
    Notify.create({ type: 'negative', message: 'Não foi possível apagar.' })
  }
}

onMounted(fetchComments)
watch([page, pageSize], fetchComments)
</script>

<template>
  <div class="q-mt-lg">
    <div class="text-subtitle1 q-mb-sm">Comentários</div>

    <q-input
      v-model="newComment"
      type="textarea"
      autogrow
      outlined
      placeholder="Escreva um comentário..."
      :disable="!isSignedIn"
    >
      <template #after>
        <q-btn
          color="primary"
          label="Enviar"
          :disable="!isSignedIn || !newComment"
          :loading="posting"
          @click="postComment"
        />
      </template>
    </q-input>

    <q-separator class="q-my-md" />

    <q-inner-loading :showing="loading"><q-spinner /></q-inner-loading>

    <q-list bordered separator>
      <q-item v-for="c in items" :key="c.id">
        <q-item-section>
          <div class="text-body2">{{ c.content }}</div>
          <div class="text-caption text-grey-7">{{ new Date(c.createdAt).toLocaleString('pt-BR') }}</div>
        </q-item-section>
        <q-item-section side v-if="canDelete(c)">
          <q-btn flat dense icon="delete" color="negative" @click="deleteComment(c.id)" />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="q-mt-sm flex justify-end">
      <q-pagination
        v-model="page"
        :max="Math.max(1, Math.ceil(total / pageSize))"
        boundary-numbers
        direction-links
      />
    </div>
  </div>
</template>
