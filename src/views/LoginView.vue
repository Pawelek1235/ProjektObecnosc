<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1>Logowanie</h1>

      <form @submit.prevent="submit">
        <input v-model="login" type="text" autocomplete="username" />

        <input v-model="password" type="password" autocomplete="current-password" />

        <button type="submit" :disabled="auth.loading">Zaloguj</button>

        <p v-if="auth.error" class="error">
          {{ auth.error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const login = ref('')
const password = ref('')

const auth = useAuthStore()
const router = useRouter()

async function submit() {
  try {
    await auth.login(login.value, password.value)

    const redirect = router.currentRoute.value.query.redirect as string | undefined

    if (redirect) {
      router.push(redirect)
      return
    }

    if (auth.user?.teacherId) {
      router.push('/teacher')
    } else if (auth.user?.studentId) {
      router.push('/student')
    }
  } catch {}
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.login-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 2rem 2.2rem;
  width: 320px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.login-card h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #0f172a;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

input {
  padding: 0.55rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

input:focus {
  outline: none;
  border-color: #2563eb;
}

button {
  margin-top: 0.6rem;
  padding: 0.55rem;
  border-radius: 6px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  text-align: center;
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}
</style>
