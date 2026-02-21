<template>
  <div class="page">
    <h1>Rejestracja urządzenia</h1>

    <p v-if="loading">Rejestrowanie urządzenia…</p>

    <p v-if="success" class="success">
      ✅ Urządzenie zostało zarejestrowane<br />
      Możesz teraz rejestrować obecność
    </p>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  const token = route.params.token

  if (typeof token !== 'string') {
    error.value = 'Brak tokenu rejestracyjnego'
    loading.value = false
    return
  }

  try {
    /**
     * 🔑 KRYTYCZNE:
     * ustawiamy tymczasowy token urządzenia
     * (client sam wrzuci go do Authorization)
     */
    client.deviceTokenResult = { token }

    /**
     * 🔁 Rejestracja urządzenia
     * token idzie w Authorization header
     */
    const res = await client.userDeviceRegister({
      deviceName: 'Telefon studenta',
    })

    if (!res.token) {
      throw new Error()
    }

    // 💾 zapis STAŁEGO tokenu urządzenia
    client.deviceTokenResult = res

    success.value = true

    setTimeout(() => {
      router.push('/student')
    }, 2000)
  } catch {
    error.value = 'Nie udało się zarejestrować urządzenia'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  text-align: center;
}

.success {
  color: #16a34a;
  font-weight: bold;
}

.error {
  color: #dc2626;
}
</style>
