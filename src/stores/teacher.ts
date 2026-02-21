import { defineStore } from 'pinia'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')
import type {
  CourseSessionListItem,
  CourseSessionAttendanceRecord,
} from '@/backend/AttendMeBackendClientBase'

interface TeacherState {
  sessions: CourseSessionListItem[]
  selectedSession: CourseSessionListItem | null
  attendance: CourseSessionAttendanceRecord[]
  loading: boolean
  error: string | null
}

export const useTeacherStore = defineStore('teacher', {
  state: (): TeacherState => ({
    sessions: [],
    selectedSession: null,
    attendance: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSessions() {
      this.loading = true
      this.error = null

      try {
        const res = await client.courseTeacherSessionsGet({
          pageNumber: 1,
          pageSize: 9999,
        })
        this.sessions = res.items ?? []
      } catch {
        this.error = 'Nie udało się pobrać zajęć'
      } finally {
        this.loading = false
      }
    },

    async fetchSessionDetails(sessionId: number) {
      this.loading = true
      this.error = null

      try {
        // dane sesji (z listy już pobranej)
        this.selectedSession = this.sessions.find((s) => s.courseSessionId === sessionId) ?? null

        // ✅ TYLKO ODCZYT LISTY OBECNOŚCI
        this.attendance = await client.courseSessionAttendanceListGet(sessionId)
      } catch {
        this.error = 'Nie udało się pobrać listy obecności'
      } finally {
        this.loading = false
      }
    },
  },
})
