<template>
  <div class="scan-page">
    <h1>Skanowanie obecności</h1>

    <p v-if="loading">Inicjalizacja skanera…</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="message" class="success">{{ message }}</p>

    <!-- Kamera -->
    <qrcode-stream v-if="!loading && useCamera" @detect="onDetect" @error="onCameraError" />

    <!-- Fallback: upload obrazu -->
    <qrcode-drop-zone v-else-if="!loading" @decode="onDecode">
      <div class="drop-zone">Brak dostępu do kamery — kliknij lub upuść obraz z kodem QR</div>
    </qrcode-drop-zone>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { QrcodeStream, QrcodeDropZone } from 'vue-qrcode-reader'
import { client } from '@/backend/client'

/* ---------- ROUTE ---------- */
const route = useRoute()
const param = route.params.id
const sessionId = typeof param === 'string' ? Number(param) : NaN

/* ---------- STATE ---------- */
const loading = ref(true)
const error = ref<string | null>(null)
const message = ref<string | null>(null)
const useCamera = ref(true)

/* ---------- INIT ---------- */
onMounted(async () => {
  if (Number.isNaN(sessionId)) {
    error.value = 'Nieprawidłowy identyfikator zajęć'
    loading.value = false
    return
  }

  try {
    // 🔑 Pobranie tokenu sesji skanera
    await client.courseSessionAttendanceScannerTokenGet(sessionId)
  } catch {
    error.value = 'Nie udało się zainicjalizować skanera'
  } finally {
    loading.value = false
  }
})

/* ---------- QR DETECT ---------- */
type DetectedCode = { rawValue: string }

async function onDetect(codes: DetectedCode[]) {
  const code = codes[0]?.rawValue
  if (!code) return

  await registerAttendance(code)
}

async function onDecode(code: string) {
  if (!code) return
  await registerAttendance(code)
}

/* ---------- REGISTER ---------- */
async function registerAttendance(attenderToken: string) {
  try {
    const user = await client.courseSessionAttendanceRegister(attenderToken)
    message.value = `Zarejestrowano obecność: ${user.name} ${user.surname}`
    error.value = null

    setTimeout(() => {
      message.value = null
    }, 3000)
  } catch {
    error.value = 'Nie udało się zarejestrować obecności'
  }
}

/* ---------- CAMERA ERROR ---------- */
function onCameraError(err: unknown) {
  console.warn('Camera error:', err)
  useCamera.value = false
}
</script>

<style scoped>
.scan-page {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
  text-align: center;
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

.drop-zone {
  margin-top: 1.5rem;
  padding: 2rem;
  border: 2px dashed #94a3b8;
  border-radius: 10px;
  color: #475569;
  cursor: pointer;
}
</style>
