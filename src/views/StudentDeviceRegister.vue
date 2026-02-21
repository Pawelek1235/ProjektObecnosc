<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Rejestracja urządzenia</h1>

      <p class="subtitle">
        Rejestrujesz urządzenie, którego będziesz używać do sprawdzania obecności. Uzupełnij
        poniższe dane i naciśnij przycisk „Zarejestruj”.
      </p>

      <form @submit.prevent="register">
        <div class="field">
          <label>Nazwa urządzenia</label>
          <input
            v-model="deviceName"
            type="text"
            placeholder="Wprowadź nazwę urządzenia"
            required
          />
        </div>

        <div class="field">
          <label>Twoje imię</label>
          <input v-model="firstName" type="text" placeholder="Wprowadź swoje imię" required />
        </div>

        <div class="field">
          <label>Twoje nazwisko</label>
          <input v-model="lastName" type="text" placeholder="Wprowadź swoje nazwisko" required />
        </div>

        <div class="field">
          <label>Twój numer albumu</label>
          <input v-model="albumNumber" type="number" placeholder="Wprowadź numer albumu" required />
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
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.params.token as string
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

    const result = await client.userDeviceRegisterWithToken(token, {
      deviceName: deviceName.value,
    })

    if (!result.token) {
      throw new Error('Backend nie zwrócił tokena')
    }

    localStorage.setItem('deviceToken', result.token)

    success.value = true
  } catch {
    error.value = 'Błąd rejestracji urządzenia'
  } finally {
    loading.value = false
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

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #1e293b;
}

.subtitle {
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.field {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
  color: #334155;
  font-weight: 500;
}

.field input {
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.9rem;
  transition: 0.15s ease;
}

.field input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.submit {
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: 0.5rem;
}

.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25);
}

.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
  text-align: center;
  font-size: 0.85rem;
}

.success {
  margin-top: 1rem;
  color: #16a34a;
  text-align: center;
  font-size: 0.85rem;
}
</style>
