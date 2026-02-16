import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'

import TeacherDashboard from '@/views/TeacherDashboard.vue'
import TeacherSessionDetails from '@/views/TeacherSessionDetails.vue'
import ScanQR from '@/views/ScanQR.vue'

import StudentDashboard from '@/views/StudentDashboard.vue'
import GenerateQR from '@/views/GenerateQR.vue'
import StudentQR from '@/views/StudentQR.vue'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: LoginView,
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
      path: '/teacher/scan/:id',
      component: ScanQR,
      meta: { role: 'teacher' },
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

    // ===== FALLBACK =====
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
    {
      path: '/student/device-register',
      component: () => import('@/views/StudentDeviceRegister.vue'),
    },
    {
      path: '/student/session/:id',
      component: () => import('@/views/StudentSessionDetails.vue'),
      meta: { role: 'student' },
    },
    {
      path: '/student/device/register/:token',
      component: () => import('@/views/StudentDeviceRegister.vue'),
    },
    {
      path: '/student/device/register/:token',
      component: () => import('@/views/StudentDeviceRegister.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // 🟢 publiczne strony (np. rejestracja urządzenia)
  if (to.meta.public) {
    return true
  }

  // 🔒 brak zalogowanego użytkownika → login
  if (!auth.user && to.path !== '/login') {
    return '/login'
  }

  // 🔁 zalogowany → nie wracaj na login
  if (auth.user && to.path === '/login') {
    if (auth.user.teacherId) return '/teacher'
    if (auth.user.studentId) return '/student'
  }

  // 👨‍🏫 role
  if (to.meta.role === 'teacher' && !auth.user?.teacherId) {
    return '/student'
  }

  if (to.meta.role === 'student' && !auth.user?.studentId) {
    return '/teacher'
  }

  return true
})

export default router
