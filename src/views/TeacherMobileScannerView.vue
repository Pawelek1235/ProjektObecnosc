<template>
  <div class="page">
    <h1 class="title">Skanowanie uczniów</h1>

    <div class="reader-wrapper">
      <div id="reader"></div>
    </div>

    <div class="hint">Skieruj kamerę na kod QR ucznia</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

let scanner: Html5Qrcode | null = null

onMounted(async () => {
  scanner = new Html5Qrcode('reader')

  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (decodedText: string) => {
        try {
          await client.courseSessionAttendanceRegister(decodedText)
        } catch {
          alert('Błąd rejestracji')
        }
      },
      () => {},
    )
  } catch {
    alert('Brak dostępu do kamery')
  }
})

onBeforeUnmount(async () => {
  if (scanner) {
    await scanner.stop()
    scanner = null
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1e293b;
}

.reader-wrapper {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
}

#reader {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
}
</style>
