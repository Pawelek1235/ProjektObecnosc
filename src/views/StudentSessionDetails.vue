<template>
  <div class="page">
    <header class="header">
      <h1>Szczegóły zajęć</h1>
      <button class="back" @click="goBack">⬅ Wróć</button>
    </header>

    <p v-if="loading" class="info">Ładowanie danych…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="session" class="card">
      <!-- NAZWA -->
      <h2>{{ session.courseName }}</h2>

      <!-- GRUPA -->
      <p>
        <strong>Grupa:</strong>
        {{ session.courseGroupName }}
      </p>

      <!-- TERMIN -->
      <p>
        <strong>Termin:</strong><br />
        {{ formatDateOnly(session.dateStart) }}<br />
        {{ formatTime(session.dateStart) }} – {{ formatTime(session.dateEnd) }}
      </p>

      <!-- STATUS -->
      <p class="status">
        Status zajęć:
        <span :class="isActive ? 'active' : 'inactive'">
          {{ isActive ? 'Aktywne' : 'Nieaktywne' }}
        </span>
      </p>

      <!-- FREKWENCJA -->
      <div class="attendance-box">
        <p>
          <strong>Obecności:</strong>
          {{ attendance.length }} / {{ totalSessions }}
        </p>
        <p>
          <strong>Frekwencja:</strong>
          {{ attendancePercentage }}%
        </p>
      </div>

      <!-- AKCJE -->
      <div class="actions">
        <button @click="refresh">Odśwież</button>

        <button class="primary" :disabled="!isActive" @click="registerAttendance">
          Rejestruj obecność
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')
import type { CourseSessionListItem, AttendanceLog } from '@/backend/AttendMeBackendClientBase'

/* ---------- ROUTER ---------- */
const route = useRoute()
const router = useRouter()

const param = route.params.id
const courseGroupId = typeof param === 'string' ? Number(param) : NaN

/* ---------- STATE ---------- */
const session = ref<CourseSessionListItem | null>(null)
const allSessions = ref<CourseSessionListItem[]>([])
const attendance = ref<AttendanceLog[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

/* ---------- FETCH ---------- */
async function fetchData() {
  if (Number.isNaN(courseGroupId)) {
    error.value = 'Nieprawidłowy identyfikator zajęć'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    // wszystkie zajęcia w grupie
    const sessions = await client.courseStudentGroupSessionsGet(courseGroupId)

    allSessions.value = sessions
    session.value = sessions[0] ?? null

    // obecności studenta
    attendance.value = await client.courseStudentAttendanceGet(courseGroupId)
  } catch {
    error.value = 'Nie udało się pobrać danych zajęć'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

/* ---------- COMPUTED ---------- */
const isActive = computed(() => {
  if (!session.value?.dateStart || !session.value?.dateEnd) return false
  const now = new Date()
  return now >= new Date(session.value.dateStart) && now <= new Date(session.value.dateEnd)
})

const totalSessions = computed(() => allSessions.value.length)

const attendancePercentage = computed(() => {
  if (!attendance.value.length || !totalSessions.value) return 0
  return Math.round((attendance.value.length / totalSessions.value) * 100)
})

/* ---------- ACTIONS ---------- */
function refresh() {
  fetchData()
}

function registerAttendance() {
  if (!session.value?.courseSessionId) return
  router.push(`/student/qr/${session.value.courseSessionId}`)
}

function goBack() {
  router.push('/student')
}

/* ---------- FORMAT ---------- */
function formatDateOnly(date?: string | Date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pl-PL')
}

function formatTime(date?: string | Date) {
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
  max-width: 800px;
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
  padding: 0.45rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
}

.status {
  margin-top: 1rem;
}

.active {
  color: #16a34a;
  font-weight: bold;
}

.inactive {
  color: #dc2626;
  font-weight: bold;
}

.attendance-box {
  margin: 1rem 0;
  padding: 0.8rem;
  background: #f1f5f9;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}

.actions button {
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #e2e8f0;
}

.actions .primary {
  background: #2563eb;
  color: white;
}

.actions button:disabled {
  opacity: 0.6;
  cursor: default;
}

.info {
  text-align: center;
  color: #666;
}

.error {
  color: #dc2626;
  text-align: center;
}
</style>
