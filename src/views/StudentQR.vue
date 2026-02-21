<template>
  <div class="qr-page">
    <h2>Rejestracja obecności</h2>

    <div class="qr-container" v-if="qrValue">
      <qrcode-vue :value="qrValue" :size="260" />
    </div>

    <div v-else class="loading">Generowanie kodu...</div>

    <p v-if="message" class="message">
      {{ message }}
    </p>

    <p v-if="error" class="error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const qrValue = ref<string | null>(null)
const error = ref<string | null>(null)
const message = ref<string | null>(null)

let interval: number | undefined

async function fetchTicket() {
  try {
    const res = await client.userAttendanceTicketGet()
    qrValue.value = res.token ?? null
    error.value = null
  } catch {
    error.value = 'Brak aktywnych zajęć lub urządzenie nie jest zarejestrowane.'
  }
}

onMounted(() => {
  fetchTicket()
  interval = window.setInterval(fetchTicket, 2000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.qr-page {
  padding: 2rem;
  text-align: center;
}

.qr-container {
  margin: 2rem 0;
}

.loading {
  margin: 2rem;
  font-size: 1.1rem;
}

.message {
  color: green;
}

.error {
  color: red;
}
</style>
