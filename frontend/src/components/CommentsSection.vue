<!-- src/components/CommentsSection.vue -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { http } from 'src/utils/http'
import { useAuth, useUser } from '@clerk/vue'
import { Notify, Dialog } from 'quasar'
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
const deletingId = ref<string | null>(null)

const MAX_COMMENT_LENGTH = 5000

const canPost = computed(() => {
  const text = newComment.value.trim()
  return isSignedIn.value && text.length > 0 && text.length <= MAX_COMMENT_LENGTH && !posting.value
})

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
  const content = newComment.value.trim()
  if (!content) return

  // Optimistic UI: add temp comment
  const tempId = `temp-${Date.now()}`
  const optimistic: Comment = {
    id: tempId,
    projectId: props.projectId,
    authorId: myId.value || 'me',
    author: {
      id: myId.value || 'me',
      name: user.value?.fullName || user.value?.firstName || user.value?.username || null,
      email: user.value?.primaryEmailAddress?.emailAddress || null
    },
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  posting.value = true
  newComment.value = ''
  items.value = [optimistic, ...items.value]
  total.value = (total.value || 0) + 1

  try {
    const token = await getToken.value?.()
    const { data } = await http.post<Comment>(`/api/projects/${props.projectId}/comments`, { content }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    // Replace optimistic with real
    items.value = items.value.map(c => c.id === tempId ? data : c)
  } catch {
    // Revert optimistic on error
    items.value = items.value.filter(c => c.id !== tempId)
    total.value = Math.max(0, (total.value || 1) - 1)
    Notify.create({ type: 'negative', message: 'Não foi possível publicar o comentário.' })
  } finally {
    posting.value = false
  }
}

function canDelete(c: Comment): boolean {
  return c.authorId === myId.value || props.projectOwnerId === myId.value
}

function deleteComment(id: string) {
  if (!isSignedIn.value) return
  Dialog.create({
    title: 'Remover comentário',
    message: 'Tem certeza que deseja remover este comentário?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      const token = await getToken.value?.()
      deletingId.value = id
      try {
        await http.delete(`/api/comments/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        items.value = items.value.filter(c => c.id !== id)
        total.value = Math.max(0, (total.value || 1) - 1)
        Notify.create({ type: 'positive', message: 'Comentário removido.' })
      } catch {
        Notify.create({ type: 'negative', message: 'Não foi possível apagar.' })
      } finally {
        deletingId.value = null
      }
    })()
  })
}

onMounted(fetchComments)
watch([page, pageSize], fetchComments)

function getInitials(name?: string | null): string {
  const base = (name || 'Anônimo').trim()
  const parts = base.split(/\s+/).slice(0, 2)
  const initials = parts.map(p => p.charAt(0)).join('')
  return initials.toUpperCase()
}

function displayName(c: Comment): string {
  return c.author?.name || 'Anônimo'
}

function formatRelativeTime(dateIso: string): string {
  const date = new Date(dateIso)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const abs = Math.abs(diffMs)
  const minutes = Math.round(abs / 60000)
  const hours = Math.round(abs / 3600000)
  const days = Math.round(abs / 86400000)
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  if (minutes < 60) return rtf.format(Math.sign(diffMs) * minutes, 'minute')
  if (hours < 24) return rtf.format(Math.sign(diffMs) * hours, 'hour')
  return rtf.format(Math.sign(diffMs) * days, 'day')
}
</script>

<template>
  <div class="q-mt-lg">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle1">Comentários</div>
      <div class="text-caption text-muted">{{ total }} {{ total === 1 ? 'comentário' : 'comentários' }}</div>
    </div>

    <q-input
      v-model="newComment"
      type="textarea"
      autogrow
      outlined
      clearable
      counter
      :maxlength="MAX_COMMENT_LENGTH"
      placeholder="Escreva um comentário... (Ctrl+Enter para enviar)"
      :disable="!isSignedIn"
      @keyup.ctrl.enter="postComment"
    >
      <template #after>
        <q-btn
          color="primary"
          label="Enviar"
          :disable="!canPost"
          :loading="posting"
          @click="postComment"
        />
      </template>
    </q-input>

    <q-separator class="q-my-md" />

    <q-inner-loading :showing="loading"><q-spinner /></q-inner-loading>

    <div v-if="!loading && items.length === 0" class="q-pa-md text-muted">
      <div class="row items-center">
        <q-icon name="chat_bubble_outline" class="q-mr-sm" />
        <span>Nenhum comentário ainda. Seja o primeiro a comentar!</span>
      </div>
    </div>

    <q-list v-else bordered separator>
      <q-item v-for="c in items" :key="c.id">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ getInitials(c.author?.name) }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <strong>{{ displayName(c) }}</strong>
            <span class="text-caption text-muted q-ml-sm">{{ formatRelativeTime(c.createdAt) }}</span>
          </q-item-label>
          <q-item-label caption class="q-mt-xs">
            {{ c.content }}
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="canDelete(c)">
          <q-btn flat dense icon="delete" color="negative" :loading="deletingId === c.id" @click="deleteComment(c.id)" />
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
