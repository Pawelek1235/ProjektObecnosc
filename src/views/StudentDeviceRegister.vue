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
    await client.userDeviceRegister({
      deviceName: deviceName.value,
    })

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
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.register-card {
  width: 420px;
  background: rgba(15, 23, 42, 0.85);
  padding: 2rem;
  border-radius: 14px;
  color: white;
  backdrop-filter: blur(6px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.logo {
  width: 80px;
  display: block;
  margin: 0 auto 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.field input {
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
}

.field input:focus {
  outline: none;
  border-color: #22c55e;
}

.submit {
  width: 100%;
  padding: 0.7rem;
  border-radius: 8px;
  border: none;
  background: #16a34a;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: #ef4444;
  text-align: center;
}

.success {
  margin-top: 1rem;
  color: #22c55e;
  text-align: center;
}
</style>
