<template>
  <div class="center">
    <h1>Rejestracja obecności</h1>

    <p v-if="loading">Rejestrowanie...</p>
    <p v-if="success" class="success">Obecność zarejestrowana</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const route = useRoute()
const token = route.params.token as string

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    await client.courseSessionAttendanceRegister(token)
    success.value = true
  } catch {
    error.value = 'Nie udało się zarejestrować obecności'
  } finally {
    loading.value = false
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
