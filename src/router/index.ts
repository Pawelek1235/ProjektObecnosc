import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import TeacherDashboard from '@/views/TeacherDashboard.vue'
import TeacherSessionDetails from '@/views/TeacherSessionDetails.vue'
import ScanQR from '@/views/ScanQR.vue'
import StudentScanView from '@/views/StudentScanView.vue'
import StudentDashboard from '@/views/StudentDashboard.vue'
import GenerateQR from '@/views/GenerateQR.vue'
import StudentQR from '@/views/StudentQR.vue'
import StudentDeviceRegister from '@/views/StudentDeviceRegister.vue'
import StudentSessionDetails from '@/views/StudentSessionDetails.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: LoginView,
      meta: { public: true },
    },

    // ===== TEACHER =====
    {
      path: '/teacher',
      component: TeacherDashboard,
      meta: { role: 'teacher' },
    },
    {
      path: '/teacher/session/:id',
      component: TeacherSessionDetails,
      meta: { role: 'teacher' },
    },
    {
      path: '/teacher/scan/:token',
      component: ScanQR,
      meta: { role: 'teacher' },
      props: true,
    },

    // ===== STUDENT =====
    {
      path: '/student',
      component: StudentDashboard,
      meta: { role: 'student' },
    },
    {
      path: '/student/qr',
      component: GenerateQR,
      meta: { role: 'student' },
    },
    {
      path: '/student/qr/:id?',
      component: StudentQR,
      meta: { role: 'student' },
    },
    {
      path: '/student/session/:id',
      component: StudentSessionDetails,
      meta: { role: 'student' },
    },
    {
      path: '/student/device/register/:token',
      component: StudentDeviceRegister,
      meta: { public: true },
      props: true,
    },
    {
      path: '/student/scan/:token',
      component: StudentScanView,
      meta: { role: 'student' },
      props: true,
    },

    // ===== FALLBACK =====
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // jeśli jeszcze nie inicjalizowany → spróbuj przywrócić
  if (!auth.initialized) {
    await auth.loginFromStorage()
  }

  if (to.meta.public) return true

  if (!auth.user) return '/login'

  if (to.meta.role === 'teacher' && !auth.user.isTeacher) return '/student'

  if (to.meta.role === 'student' && !auth.user.isStudent) return '/teacher'

  if (auth.user && to.path === '/login') {
    if (auth.user.isTeacher) return '/teacher'
    if (auth.user.isStudent) return '/student'
  }

  return true
})
export default router
