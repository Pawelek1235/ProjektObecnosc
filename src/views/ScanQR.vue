<template>
  <div class="scanner">
    <h1>QR skanera</h1>

    <div class="qr-box" v-if="qrValue">
      <QrcodeVue :value="qrValue" :size="280" />
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <button @click="goBack">Wróć</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')
const route = useRoute()
const router = useRouter()

const sessionId = Number(route.params.token) // albo id jeśli masz inny parametr
const qrValue = ref<string | null>(null)
const error = ref<string | null>(null)

let interval: number | undefined

async function loadQr() {
  try {
    const result = await client.courseSessionAttendanceScannerTokenGet(sessionId)
    qrValue.value = `${window.location.origin}/student/scan/${result.token}`
  } catch {
    error.value = 'Brak dostępu do generowania QR'
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  loadQr()
  interval = window.setInterval(loadQr, 2000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.scan-page {
  padding: 2rem;
  text-align: center;
}

.success {
  color: green;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
