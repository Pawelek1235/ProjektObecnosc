<template>
  <div class="qr-page">
    <h1>Rejestracja obecności</h1>

    <p v-if="loading">Pobieranie kodu…</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">✅ Obecność została zarejestrowana</p>

    <div v-if="token && !success" class="qr-box">
      <QrcodeVue :value="token" :size="260" />
      <p class="hint">Zbliż kod do kamery wykładowcy</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const token = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref(false)

let interval: number | undefined

async function fetchTicket() {
  try {
    const res = await client.userAttendanceTicketGet()
    token.value = res.token ?? null
    error.value = null
  } catch {
    token.value = null
    error.value = 'Brak aktywnych zajęć lub urządzenie nie jest zarejestrowane'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTicket()
  interval = window.setInterval(fetchTicket, 2000)
})

watch(token, (newVal, oldVal) => {
  if (oldVal && newVal && oldVal !== newVal) {
    success.value = true
    if (interval) clearInterval(interval)
  }
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
  color: #dc2626;
  margin-top: 0.5rem;
}

.success {
  color: #16a34a;
  font-weight: bold;
  margin-top: 0.5rem;
}
</style>
