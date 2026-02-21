<template>
  <div class="dashboard">
    <header class="header">
      <h1>Pulpit wykładowcy</h1>

      <div class="filters">
        <input v-model="search" type="text" placeholder="Szukaj..." class="search" />

        <select v-model="filter">
          <option value="today">Dzisiaj</option>
          <option value="week">Bieżący tydzień</option>
          <option value="month">Bieżący miesiąc</option>
          <option value="future">Przyszłe</option>
          <option value="past">Minione</option>
          <option value="all">Wszystkie</option>
        </select>
      </div>
    </header>

    <p v-if="loading">Ładowanie zajęć…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!filteredSessions.length && !loading" class="empty">Brak zajęć</div>

    <div
      v-for="s in filteredSessions"
      :key="s.courseSessionId"
      class="session-row"
      @click="openDetails(s.courseSessionId!)"
    >
      <div class="left">
        <span class="badge">
          {{ formatDay(s.dateStart) }}
          {{ formatTime(s.dateStart) }} –
          {{ formatTime(s.dateEnd) }}
        </span>

        <h3>{{ s.courseName }}</h3>

        <div class="meta">
          <span>{{ s.courseGroupName }}</span>
          <span>{{ s.locationName || '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'
import type { CourseSessionListItem } from '@/backend/AttendMeBackendClientBase'

const router = useRouter()

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

type Filter = 'today' | 'week' | 'month' | 'future' | 'past' | 'all'

const sessions = ref<CourseSessionListItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filter = ref<Filter>('week')
const search = ref('')

onMounted(fetchSessions)

async function fetchSessions() {
  loading.value = true
  error.value = null

  try {
    const result = await client.courseTeacherSessionsGet({
      pageNumber: 1,
      pageSize: 999999,
    })

    sessions.value = result.items ?? []
  } catch {
    error.value = 'Błąd pobierania zajęć'
  } finally {
    loading.value = false
  }
}

const filteredSessions = computed(() => {
  const now = new Date()
  const q = search.value.toLowerCase()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return sessions.value
    .filter((s) => {
      if (!s.dateStart) return false
      const d = new Date(s.dateStart)

      switch (filter.value) {
        case 'today':
          return d >= startOfDay && d <= endOfDay
        case 'week':
          return d >= startOfWeek && d <= endOfWeek
        case 'month':
          return d >= startOfMonth && d <= endOfMonth
        case 'future':
          return d > now
        case 'past':
          return d < now
        default:
          return true
      }
    })
    .filter((s) => {
      if (!q) return true

      return s.courseName?.toLowerCase().includes(q) || s.courseGroupName?.toLowerCase().includes(q)
    })
    .sort((a, b) => new Date(a.dateStart!).getTime() - new Date(b.dateStart!).getTime())
})

function openDetails(id: number) {
  router.push(`/teacher/session/${id}`)
}

function formatDay(date?: string | Date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pl-PL', { weekday: 'long' }).toUpperCase()
}

function formatTime(date?: string | Date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
/* ===== LAYOUT ===== */

.dashboard {
  max-width: 1050px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  background: #f5f7fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ===== HEADER ===== */

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.7rem;
  font-weight: 600;
  color: #1e293b;
}

/* ===== FILTERS ===== */

.filters {
  display: flex;
  gap: 0.6rem;
}

.search,
select {
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  background: white;
  transition: 0.15s ease;
}

.search:focus,
select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

/* ===== SESSION CARD ===== */

.session-row {
  background: white;
  padding: 1.2rem;
  border-radius: 14px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.session-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.session-row h3 {
  margin: 0.5rem 0 0.4rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
}

/* ===== DATE BADGE ===== */

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* ===== META INFO ===== */

.meta {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  gap: 1.2rem;
}

/* ===== STATES ===== */

.error {
  margin-top: 1rem;
  color: #dc2626;
  font-size: 0.9rem;
}

.empty {
  margin-top: 3rem;
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
}
</style>
