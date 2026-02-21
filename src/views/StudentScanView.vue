<template>
  <div class="scan">
    <h1>Rejestracja obecności</h1>

    <p v-if="success" class="success">Zarejestrowano obecność</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')
const route = useRoute()

const success = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  const token = route.params.token as string

  if (!token) {
    error.value = 'Brak tokena'
    return
  }

  try {
    await client.courseSessionAttendanceRegister(token)
    success.value = true
  } catch {
    error.value = 'Nie udało się zarejestrować obecności'
  }
})
</script>
<style scoped>
.center {
  text-align: center;
  margin-top: 4rem;
}
.success {
  color: green;
}
.error {
  color: red;
}
</style>
