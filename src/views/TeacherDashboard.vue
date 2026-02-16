<template>
  <div class="dashboard">
    <header class="header">
      <h1>Pulpit wykładowcy</h1>

      <div class="filters">
        <input v-model="search" type="text" placeholder="Szukaj" class="search" />

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

    <div v-if="!filteredSessions.length && !loading" class="empty">
      Brak zajęć dla wybranych filtrów
    </div>

    <div>
      <div
        v-for="s in filteredSessions"
        :key="s.courseSessionId"
        class="session-row clickable"
        @click="details(s.courseSessionId)"
      >
        <div class="left">
          <span class="badge">
            {{ formatDay(s.dateStart) }}
            {{ formatTime(s.dateStart) }} – {{ formatTime(s.dateEnd) }}
          </span>

          <h3>{{ s.courseName }}</h3>

          <div class="meta">
            <span>{{ s.locationName || '—' }}</span>
            <span>{{ formatDateOnly(s.dateStart) }}</span>
          </div>
        </div>

        <div class="right">
          <span class="group">
            {{ s.courseGroupName }}
          </span>

          <div class="actions">
            <button class="secondary" @click.stop="scan(s.courseSessionId)">Skanuj QR</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeacherStore } from '@/stores/teacher'
import type { CourseSessionListItem } from '@/backend/AttendMeBackendClientBase'

const store = useTeacherStore()
const router = useRouter()

type Filter = 'today' | 'week' | 'month' | 'future' | 'past' | 'all'

const filter = ref<Filter>('week')
const search = ref('')

onMounted(() => {
  store.fetchSessions()
})

const loading = computed(() => store.loading)
const error = computed(() => store.error)

function isValidSession(s: CourseSessionListItem): s is CourseSessionListItem & {
  courseSessionId: number
  dateStart: string | Date
  dateEnd: string | Date
} {
  return Boolean(s.courseSessionId && s.dateStart && s.dateEnd)
}

const filteredSessions = computed(() => {
  const now = new Date()
  const q = search.value.trim().toLowerCase()

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

  return store.sessions
    .filter(isValidSession)

    .filter((s) => {
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
        case 'all':
        default:
          return true
      }
    })

    .filter((s) => {
      if (!q) return true

      const dateText = new Date(s.dateStart).toLocaleString('pl-PL').toLowerCase()

      return (
        s.courseName?.toLowerCase().includes(q) ||
        s.courseGroupName?.toLowerCase().includes(q) ||
        s.locationName?.toLowerCase().includes(q) ||
        dateText.includes(q)
      )
    })

    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
})

function details(id: number) {
  router.push(`/teacher/session/${id}`)
}

function scan(id: number) {
  router.push(`/teacher/scan/${id}`)
}

function toDate(date?: string | Date) {
  if (!date) return null
  return typeof date === 'string' ? new Date(date) : date
}

function formatDay(date?: string | Date) {
  const d = toDate(date)
  return d ? d.toLocaleDateString('pl-PL', { weekday: 'long' }).toUpperCase() : ''
}

function formatTime(date?: string | Date) {
  const d = toDate(date)
  return d
    ? d.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''
}

function formatDateOnly(date?: string | Date) {
  const d = toDate(date)
  return d ? d.toLocaleDateString('pl-PL') : ''
}
</script>

<style>
.dashboard {
  max-width: 1100px;
  margin: auto;
  padding: 1.8rem;
  background: #f1f5f9;
  min-height: 100vh;
  color: #334155;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.9rem;
  font-weight: 700;
  color: #0f172a;
}

.filters {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.search {
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
}

.session-row {
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.session-row.clickable {
  cursor: pointer;
}

.session-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.left {
  flex: 1;
}

.left h3 {
  margin: 0.4rem 0 0.3rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #0f172a;
}

.meta {
  display: flex;
  gap: 1.2rem;
  font-size: 0.85rem;
  color: #64748b;
}

.badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
}

.right {
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.group {
  font-size: 0.8rem;
  color: #64748b;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.actions button {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.actions button.secondary {
  background: #e2e8f0;
  color: #334155;
}

.error {
  color: #dc2626;
  font-weight: 600;
  text-align: center;
  margin-top: 1rem;
}

.empty {
  text-align: center;
  margin-top: 3rem;
  font-size: 0.95rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .session-row {
    flex-direction: column;
    gap: 0.8rem;
  }

  .right {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
