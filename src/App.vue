<template>
  <div>
    <header v-if="auth.user" class="app-header">
      <div class="left">AttendMe</div>

      <div class="middle">
        {{ auth.user.name }} {{ auth.user.surname }}
        <span class="role"> – {{ roleLabel }} </span>
      </div>

      <div class="right">
        <button v-if="auth.user.studentId" @click="go('/student')">Dashboard</button>

        <button v-if="auth.user.teacherId" @click="go('/teacher')">Dashboard</button>

        <button class="logout" @click="logout">Wyloguj</button>
      </div>
    </header>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const roleLabel = computed(() => {
  if (auth.user?.teacherId) return 'Wykładowca'
  if (auth.user?.studentId) return 'Student'
  return ''
})

function logout() {
  auth.logout()
  router.push('/login')
}

function go(path: string) {
  router.push(path)
}
</script>

<style scoped>
.app-header {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #0f172a;
}

.left {
  font-weight: 600;
}

.middle {
  color: #334155;
}

.role {
  color: #64748b;
  padding-right: 20px;
}

.right {
  display: flex;
  gap: 0.4rem;
}

button {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
}

button:hover {
  background: #f1f5f9;
}

.logout {
  color: #b91c1c;
  border-color: #fecaca;
}
</style>
