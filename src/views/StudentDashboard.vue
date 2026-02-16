<template>
  <div class="dashboard">
    <header class="header">
      <h1>Pulpit studenta</h1>

      <select v-model="filter">
        <option value="today">Dzisiaj</option>
        <option value="week">Bieżący tydzień</option>
        <option value="month">Bieżący miesiąc</option>
        <option value="future">Przyszłe</option>
        <option value="past">Minione</option>
        <option value="all">Wszystkie</option>
      </select>
    </header>

    <p v-if="loading" class="info">Ładowanie zajęć…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!filteredSessions.length && !loading" class="empty">
      Brak zajęć dla wybranego filtra
    </div>

    <div
      v-for="s in filteredSessions"
      :key="s.courseGroupId"
      class="session-row"
      @click="openDetails(s.courseGroupId)"
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
        <span class="group">{{ s.courseGroupName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/student'
import type { CourseSessionListItem } from '@/backend/AttendMeBackendClientBase'

type Filter = 'today' | 'week' | 'month' | 'future' | 'past' | 'all'

const store = useStudentStore()
const router = useRouter()

const filter = ref<Filter>('week')

onMounted(() => {
  store.fetchSessions()
})

const loading = computed(() => store.loading)
const error = computed(() => store.error)

const filteredSessions = computed<CourseSessionListItem[]>(() => {
  const now = new Date()

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return [...store.sessions]
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
        case 'all':
        default:
          return true
      }
    })
    .sort((a, b) => new Date(a.dateStart!).getTime() - new Date(b.dateStart!).getTime())
})

function openDetails(courseGroupId?: number) {
  if (!courseGroupId) return
  router.push(`/student/session/${courseGroupId}`)
}

/* ---------- FORMAT ---------- */
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

function formatDateOnly(date?: string | Date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pl-PL')
}
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: #f8fafc;
  color: #334155;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.header h1 {
  font-size: 1.6rem;
  color: #0f172a;
}

.header select {
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.session-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  margin-bottom: 0.7rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
}

.session-row:hover {
  background: #f1f5f9;
}

.badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}

.left h3 {
  margin: 0.4rem 0 0.2rem;
  font-size: 1.1rem;
  color: #0f172a;
}

.meta {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  gap: 1rem;
}

.group {
  font-size: 0.8rem;
  color: #64748b;
}

.info {
  text-align: center;
  color: #64748b;
}

.error {
  color: #dc2626;
  text-align: center;
}

.empty {
  text-align: center;
  margin-top: 2rem;
  color: #64748b;
}
</style>
