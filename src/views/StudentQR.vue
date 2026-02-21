<template>
  <div class="qr-page">
    <h1>Rejestracja obecności</h1>

    <p v-if="loading">Pobieranie kodu…</p>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <div v-if="token" class="qr-box">
      <QrcodeVue :value="token" :size="220" />
      <p class="hint">Zbliż kod do kamery wykładowcy</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import QrcodeVue from 'qrcode.vue'

const token = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

let interval: number | undefined

async function fetchTicket() {
  try {
    const res = await client.userAttendanceTicketGet()
    token.value = res.token ?? null
    error.value = null
  } catch {
    token.value = null
    error.value = 'Brak aktywnych zajęć LUB urządzenie nie jest zarejestrowane.'
  } finally {
    loading.value = false
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
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  text-align: center;
}

.qr-box {
  margin-top: 1.5rem;
}

.hint {
  margin-top: 1rem;
  color: #64748b;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
  font-weight: 500;
}
</style>
