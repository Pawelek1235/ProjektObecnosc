<template>
  <div class="scan-page">
    <h2>Skanowanie obecności</h2>

    <qrcode-stream @decode="onDecode" @init="onInit" />

    <p v-if="message" class="success">
      {{ message }}
    </p>

    <p v-if="error" class="error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.params.token as string
const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const message = ref<string | null>(null)
const error = ref<string | null>(null)

let scanningLocked = false
import { onMounted } from 'vue'

onMounted(async () => {
  if (!token) return

  try {
    await client.courseSessionAttendanceRegister(token)
    message.value = 'Obecność zarejestrowana'
    error.value = null
  } catch {
    message.value = null
    error.value = 'Nie udało się zarejestrować obecności'
  }
})
async function onDecode(result: string) {
  if (scanningLocked) return

  scanningLocked = true

  try {
    await client.courseSessionAttendanceRegister(result)
    message.value = 'Obecność zarejestrowana'
    error.value = null
  } catch {
    message.value = null
    error.value = 'Błąd rejestracji obecności'
  }

  setTimeout(() => {
    scanningLocked = false
    message.value = null
    error.value = null
  }, 2000)
}

function onInit(promise: Promise<void>) {
  promise.catch(() => {
    error.value = 'Brak dostępu do kamery'
  })
}
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
