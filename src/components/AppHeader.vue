<template>
  <header class="header" v-if="auth.user">
    <div class="left">
      <span class="title">Attend Me</span>
    </div>

    <div class="right" v-if="auth.user">
      <span class="user">
        {{ fullName }}
        <small class="role">({{ roleLabel }})</small>
      </span>

      <button @click="logout">Wyloguj</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const fullName = computed(() => {
  if (!auth.user) return ''
  return `${auth.user.name ?? ''} ${auth.user.surname ?? ''}`
})

const roleLabel = computed(() => {
  if (auth.user?.teacherId) return 'Wykładowca'
  if (auth.user?.studentId) return 'Student'
  return ''
})

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  height: 56px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.2rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user {
  font-size: 0.85rem;
  color: #334155;
}

.role {
  color: #64748b;
}

button {
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  color: #111827;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

button:hover {
  background: #d1d5db;
}
</style>
