<template>
  <div class="home">
    <h1>Urządzenie zarejestrowane</h1>
    <p>Możesz teraz skanować obecność lub przejść do pulpitu.</p>

    <div class="buttons">
      <button class="primary" @click="goScan">Skanuj obecność</button>

      <button class="secondary" @click="goDashboard">Otwórz pulpit</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function goScan() {
  router.push('/student/device-qr')
}

function goDashboard() {
  if (!auth.user) {
    router.push('/login')
    return
  }

  if (auth.user.isTeacher) router.push('/teacher')
  else router.push('/student')
}
</script>

<style>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.8rem;
  text-align: center;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.home h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.home p {
  font-size: 1rem;
  color: #475569;
  max-width: 420px;
  line-height: 1.5;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  min-width: 180px;
  padding: 0.75rem 1.2rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.18s ease;
}

.primary {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  box-shadow: 0 6px 18px rgba(22, 163, 74, 0.25);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(22, 163, 74, 0.35);
}

.secondary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25);
}

.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.35);
}

button:active {
  transform: scale(0.97);
}

@media (max-width: 600px) {
  .buttons {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}
</style>
