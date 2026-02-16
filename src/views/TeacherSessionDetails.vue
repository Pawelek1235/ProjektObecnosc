<template>
  <div class="page">
    <header class="header">
      <h1>Szczegóły zajęć</h1>
      <button class="back" @click="goBack">⬅ Wróć</button>
    </header>

    <p v-if="loading" class="info">Ładowanie…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="session" class="card">
      <h2>{{ session.courseName }}</h2>

      <p><strong>Grupa:</strong> {{ session.courseGroupName }}</p>

      <!-- TERMIN -->
      <p>
        <strong>Termin:</strong><br />
        {{ formatDateOnly(session.dateStart) }}<br />
        {{ formatTime(session.dateStart) }} – {{ formatTime(session.dateEnd) }}
      </p>

      <div class="actions-top">
        <button @click="refresh">Odśwież</button>
        <button class="primary" @click="scanQR">Skanuj QR</button>
      </div>

      <h3>Lista obecności</h3>

      <table>
        <thead>
          <tr>
            <th>Imię</th>
            <th>Nazwisko</th>
            <th>Nr indeksu</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="a in attendance" :key="a.attenderUserId">
            <td>{{ a.userName }}</td>
            <td>{{ a.userSurname }}</td>
            <td>{{ a.studentAlbumIdNumber }}</td>
            <td>
              <span :class="a.wasUserPresent ? 'present' : 'absent'">
                {{ a.wasUserPresent ? 'Obecny' : 'Nieobecny' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeacherStore } from '@/stores/teacher'

const route = useRoute()
const router = useRouter()
const store = useTeacherStore()

/* ---------- SESSION ID ---------- */
const param = route.params.id
const sessionId = typeof param === 'string' ? Number(param) : NaN

onMounted(() => {
  if (!Number.isNaN(sessionId)) {
    store.fetchSessionDetails(sessionId)
  }
})

/* ---------- STATE ---------- */
const session = computed(() => store.selectedSession)
const attendance = computed(() => store.attendance)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

/* ---------- ACTIONS ---------- */
function refresh() {
  if (!Number.isNaN(sessionId)) {
    store.fetchSessionDetails(sessionId)
  }
}

function scanQR() {
  if (!Number.isNaN(sessionId)) {
    router.push(`/teacher/scan/${sessionId}`)
  }
}

function goBack() {
  router.push('/teacher')
}

/* ---------- FORMAT DATY ---------- */
function formatDateOnly(date?: string | Date | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

function formatTime(date?: string | Date | null) {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1000px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back {
  background: transparent;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1.5rem;
  background: #fff;
}

.actions-top {
  display: flex;
  gap: 0.6rem;
  margin: 1rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.6rem;
}

.present {
  color: green;
  font-weight: bold;
}

.absent {
  color: red;
}

.info {
  text-align: center;
  color: #666;
}

.error {
  color: red;
  text-align: center;
}
</style>
