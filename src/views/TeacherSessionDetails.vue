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

    <!-- TABELA OBECNOŚCI -->
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

    <!-- ================== SCANNER MODAL ================== -->
    <div v-if="showScanner" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Skaner obecności</h2>
          <button class="close" @click="closeScanner">✕</button>
        </div>

        <div class="qr-wrapper">
          <QrcodeVue :value="scannerUrl" :size="300" />
        </div>

        <div class="modal-actions">
          <button class="secondary" @click="copyUrl">Skopiuj adres</button>
          <button class="primary" @click="closeScanner">Zamknij</button>
        </div>
      </div>
    </div>

    <!-- ================== DEVICE MODAL ================== -->
    <div v-if="showDeviceModal" class="modal-overlay">
      <div class="modal large">
        <div class="modal-header">
          <h2>Linki do rejestracji urządzenia</h2>
          <button class="close" @click="closeDeviceModal">✕</button>
        </div>

        <table class="device-table">
          <thead>
            <tr>
              <th>Uczestnik</th>
              <th>Nr albumu</th>
              <th>Aktualne urządzenie</th>
              <th>Link</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="d in deviceLinks" :key="d.studentId">
              <td>{{ d.name }}</td>
              <td>{{ d.album }}</td>

              <td>
                <span v-if="d.deviceName">
                  {{ d.deviceName }}
                  <button class="danger small" @click="resetDevice(d.studentId)">Resetuj</button>
                </span>
                <span v-else>-</span>
              </td>

              <td>
                <button class="secondary small" @click="copyDeviceLink(d.link)">
                  Skopiuj link
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="modal-actions">
          <button class="primary" @click="closeDeviceModal">Zamknij</button>
        </div>
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

/* ================= TYPES ================= */

type DeviceLink = {
  studentId: number
  name: string
  album: number | undefined
  deviceName: string | null
  link: string
}

/* ================= SETUP ================= */

const route = useRoute()

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

const sessionId = Number(route.params.id)

/* ================= STATE ================= */

const session = ref<CourseSession | null>(null)
const attendance = ref<CourseSessionAttendanceRecord[]>([])
const deviceLinks = ref<DeviceLink[]>([])

const loading = ref(false)
const error = ref<string | null>(null)

const showScanner = ref(false)
const showDeviceModal = ref(false)

const scannerUrl = ref('')

/* ================= INIT ================= */

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  error.value = null

  try {
    session.value = await client.courseTeacherSessionGet(sessionId)

    attendance.value = await client.courseSessionAttendanceListGet(sessionId)

    deviceLinks.value = attendance.value
      .filter((a) => a.attenderUserId !== undefined)
      .map((a) => ({
        studentId: a.attenderUserId as number,
        name: `${a.userName ?? ''} ${a.userSurname ?? ''}`,
        album: a.studentAlbumIdNumber,
        deviceName: null,
        link: `${window.location.origin}/student/device/register/${a.attenderUserId}`,
      }))
  } catch {
    error.value = 'Błąd pobierania danych'
  } finally {
    loading.value = false
  }
}

/* ================= SCANNER ================= */

async function openScanner() {
  const token = await client.courseSessionAttendanceScannerTokenGet(sessionId)

  scannerUrl.value = `${window.location.origin}/teacher/scan/${token.token}`

  showScanner.value = true
}

function closeScanner() {
  showScanner.value = false
}

function copyUrl() {
  navigator.clipboard.writeText(scannerUrl.value)
}

/* ================= DEVICE ================= */

function openDeviceModal() {
  showDeviceModal.value = true
}

function closeDeviceModal() {
  showDeviceModal.value = false
}

function copyDeviceLink(link: string) {
  navigator.clipboard.writeText(link)
}

async function resetDevice(studentId: number) {
  await client.userDeviceReset(studentId)
  fetchData()
}

/* ================= FORMAT ================= */

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
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.primary {
  background: #2563eb;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.secondary {
  background: #e2e8f0;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.danger {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
}

.small {
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
}

.attendance-table,
.device-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
}

th,
td {
  padding: 0.8rem;
  border-bottom: 1px solid #e2e8f0;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.present {
  background: #16a34a;
  color: white;
}

.absent {
  background: #dc2626;
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 14px;
  width: 500px;
}

.modal.large {
  width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.error {
  color: red;
}
</style>
