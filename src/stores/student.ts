import { defineStore } from 'pinia'
import type { AttendanceLog, CourseSessionListItem } from '@/backend/AttendMeBackendClientBase'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

interface StudentState {
  sessions: CourseSessionListItem[]
  attendance: AttendanceLog[]
  loading: boolean
  error: string | null
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    sessions: [],
    attendance: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSessions() {
      this.loading = true
      this.error = null

      try {
        const res = await client.courseStudentSessionsGet({
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

    async fetchAttendance(courseGroupId: number) {
      this.error = null
      try {
        this.attendance = await client.courseStudentAttendanceGet(courseGroupId)
      } catch {
        this.error = 'Nie udało się pobrać frekwencji'
      }
    },
  },

  getters: {
    attendancePercentage(state): number {
      if (!state.sessions.length) return 0
      if (!state.attendance.length) return 0

      return Math.round((state.attendance.length / state.sessions.length) * 100)
    },
  },
})
