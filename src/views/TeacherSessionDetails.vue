<template>
  <div class="details" v-if="session">
    <div class="top">
      <div>
        <h1>{{ session.courseGroup?.course?.courseName }}</h1>

        <p><strong>Termin:</strong> {{ formatDate(session.dateStart) }}</p>
        <p>
          <strong>Godziny:</strong>
          {{ formatTime(session.dateStart) }} –
          {{ formatTime(session.dateEnd) }}
        </p>
      </div>

      <div class="actions">
        <button class="primary" @click="openScanner">Skaner obecności</button>

        <button class="secondary" @click="openDeviceModal">Rejestracja urządzenia</button>
      </div>
    </div>

    <table class="attendance-table">
      <thead>
        <tr>
          <th>Uczestnik</th>
          <th>Nr albumu</th>
          <th>Obecność</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="a in attendance" :key="a.attendanceLogId">
          <td>{{ a.userName }} {{ a.userSurname }}</td>
          <td>{{ a.studentAlbumIdNumber }}</td>
          <td>
            <span :class="['badge', a.wasUserPresent ? 'present' : 'absent']">
              {{ a.wasUserPresent ? 'Obecny' : 'Brak' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showScanner" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Skaner obecności</h2>
          <button class="close" @click="closeScanner">✕</button>
        </div>

        <div class="qr-wrapper" v-if="scannerUrl">
          <QrcodeVue :value="scannerUrl" :size="300" />
        </div>

        <div class="modal-actions">
          <button class="primary" @click="closeScanner">Zamknij</button>
        </div>
      </div>
    </div>

    <div v-if="showDeviceModal" class="modal-overlay">
      <div class="modal large">
        <div class="modal-header">
          <h2>Rejestracja urządzenia</h2>
          <button class="close" @click="closeDeviceModal">✕</button>
        </div>

        <div class="modal-content">
          <table class="device-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Album</th>
                <th>Urządzenie</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="d in deviceLinks" :key="d.studentId">
                <td>{{ d.name }}</td>
                <td>{{ d.album }}</td>
                <td>
                  <span v-if="d.deviceName" class="device-name">
                    {{ d.deviceName }}
                  </span>
                  <span v-else class="no-device">Brak</span>
                </td>
                <td>
                  <button
                    v-if="d.deviceName"
                    class="danger small"
                    @click="resetDevice(d.studentId)"
                  >
                    Reset
                  </button>

                  <button v-else class="secondary small" @click="copyDeviceLink(d.studentId)">
                    Skopiuj link
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-actions">
          <button class="primary" @click="closeDeviceModal">Zamknij</button>
        </div>
      </div>
    </div>
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        {{ t.message }}
      </div>
    </div>
    <p v-if="loading">Ładowanie…</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'
import type {
  CourseSession,
  CourseSessionAttendanceRecord,
} from '@/backend/AttendMeBackendClientBase'

type DeviceLink = {
  studentId: number
  name: string
  album?: number
  deviceName: string | null
}

const route = useRoute()
const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const sessionId = Number(route.params.id)

const session = ref<CourseSession | null>(null)
const attendance = ref<CourseSessionAttendanceRecord[]>([])
const deviceLinks = ref<DeviceLink[]>([])

const loading = ref(false)
const error = ref<string | null>(null)

const showScanner = ref(false)
const scannerUrl = ref<string>('')

const showDeviceModal = ref(false)

onMounted(fetchData)
type ToastType = 'success' | 'error'

type Toast = {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let toastId = 0

function showToast(message: string, type: ToastType = 'success') {
  const id = toastId++
  toasts.value.push({ id, message, type })

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 3000)
}
async function fetchData() {
  loading.value = true
  error.value = null

  try {
    session.value = await client.courseTeacherSessionGet(sessionId)
    attendance.value = await client.courseSessionAttendanceListGet(sessionId)
  } catch {
    error.value = 'Błąd pobierania danych'
  } finally {
    loading.value = false
  }
}

async function openScanner() {
  try {
    const token = await client.courseSessionAttendanceScannerTokenGet(sessionId)

    scannerUrl.value = `${window.location.origin}/teacher/mobile-scan/${token.token}`

    showScanner.value = true
  } catch {
    error.value = 'Nie udało się wygenerować tokenu'
  }
}

function closeScanner() {
  showScanner.value = false
  scannerUrl.value = ''
}

async function openDeviceModal() {
  showDeviceModal.value = true

  try {
    const list = await client.courseSessionAttendanceListGet(sessionId)

    const map = new Map<number, number | undefined>()

    list.forEach((a) => {
      if (a.attenderUserId) map.set(a.attenderUserId, a.studentAlbumIdNumber)
    })

    const users = await Promise.all(Array.from(map.keys()).map((id) => client.userGet(id)))

    deviceLinks.value = users.map((u) => ({
      studentId: u.userId!,
      name: `${u.name ?? ''} ${u.surname ?? ''}`,
      album: map.get(u.userId!),
      deviceName: u.deviceName ?? null,
    }))
  } catch {
    error.value = 'Błąd ładowania studentów'
  }
}

function closeDeviceModal() {
  showDeviceModal.value = false
}

async function copyDeviceLink(studentId: number) {
  try {
    const result = await client.userDeviceRegisterTokenGet(studentId)

    const link = `${window.location.origin}/student/device/register/${result.token}`

    await navigator.clipboard.writeText(link)
    showToast('Link skopiowany', 'success')
  } catch {
    showToast('Nie udało się wygenerować linku', 'error')
  }
}

async function resetDevice(studentId: number) {
  await client.userDeviceReset(studentId)
  await openDeviceModal()
}

function formatDate(date?: string | Date) {
  return date ? new Date(date).toLocaleDateString('pl-PL') : ''
}

function formatTime(date?: string | Date) {
  return date
    ? new Date(date).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''
}
</script>

<style scoped>
.details {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  background: #f5f7fb;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 0.6rem;
}

.primary,
.secondary,
.danger {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: 0.15s ease;
}

.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
}

.primary:hover {
  opacity: 0.9;
}

.secondary {
  background: white;
  border: 1px solid #e2e8f0;
}

.secondary:hover {
  background: #f8fafc;
}

.danger {
  background: #dc2626;
  color: white;
}

.danger:hover {
  opacity: 0.9;
}

.small {
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
}

.attendance-table,
.device-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.device-table th {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8rem;
  color: #64748b;
  text-align: left;
}

.device-table td {
  vertical-align: middle;
}

th,
td {
  padding: 0.85rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
}

.action-col {
  text-align: right;
  width: 150px;
}

.device-name {
  color: #16a34a;
  font-weight: 500;
}

.no-device {
  color: #94a3b8;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.present {
  background: #16a34a;
  color: white;
}

.absent {
  background: #ef4444;
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  z-index: 1000;
}

.modal {
  position: relative;
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal.large {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0 2rem 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.close {
  position: absolute;
  top: 16px;
  right: 18px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.close:hover {
  opacity: 0.6;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
}
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
}

.toast {
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  min-width: 220px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.2s ease;
}

.toast.success {
  background: #16a34a;
}

.toast.error {
  background: #dc2626;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
