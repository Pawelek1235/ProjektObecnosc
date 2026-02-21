<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Rejestracja urządzenia</h1>

      <p class="subtitle">
        Rejestrujesz urządzenie, którego będziesz używać do sprawdzania obecności. Uzupełnij dane i
        naciśnij „Zarejestruj”.
      </p>

      <form @submit.prevent="register">
        <div class="field">
          <label>Nazwa urządzenia</label>
          <input v-model="deviceName" type="text" required />
        </div>

        <div class="field">
          <label>Twoje imię</label>
          <input v-model="firstName" type="text" required />
        </div>

        <div class="field">
          <label>Twoje nazwisko</label>
          <input v-model="lastName" type="text" required />
        </div>

        <div class="field">
          <label>Twój numer albumu</label>
          <input v-model.number="albumNumber" type="number" required />
        </div>

        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? 'Rejestrowanie...' : 'Zarejestruj' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Urządzenie zostało zarejestrowane.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'
import { useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()

const token = route.params.token as string | undefined

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const deviceName = ref('')
const firstName = ref('')
const lastName = ref('')
const albumNumber = ref<number | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function register() {
  loading.value = true
  error.value = null
  success.value = false

  try {
    if (!token) {
      throw new Error('Brak tokena w URL')
    }

    if (!albumNumber.value) {
      throw new Error('Numer albumu jest wymagany')
    }

    const result = await client.userDeviceRegisterWithToken(token, {
      deviceName: deviceName.value,
      studentName: firstName.value,
      studentSurname: lastName.value,
      albumIdNumber: albumNumber.value,
    })

    if (!result?.token) {
      throw new Error('Backend nie zwrócił tokena urządzenia')
    }

    localStorage.setItem('deviceToken', result.token)

    router.push('/student-home')
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Błąd rejestracji urządzenia'
    error.value = message
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.register-card {
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 2.5rem;
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.field {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}

.field input {
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.submit {
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
  text-align: center;
}

.success {
  margin-top: 1rem;
  color: #16a34a;
  text-align: center;
}
</style>
