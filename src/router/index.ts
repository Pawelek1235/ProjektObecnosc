import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import TeacherDashboard from '@/views/TeacherDashboard.vue'
import TeacherSessionDetails from '@/views/TeacherSessionDetails.vue'
import ScanQR from '@/views/ScanQR.vue'

import StudentDashboard from '@/views/StudentDashboard.vue'
import StudentSessionDetails from '@/views/StudentSessionDetails.vue'
import StudentScanView from '@/views/StudentScanView.vue'
import StudentDeviceRegister from '@/views/StudentDeviceRegister.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: LoginView,
      meta: { public: true },
    },

    {
      path: '/student/device/register/:token',
      component: StudentDeviceRegister,
      meta: { public: true },
      props: true,
    },

    {
      path: '/student-home',
      name: 'StudentHome',
      component: () => import('@/views/StudentHome.vue'),
      meta: { deviceOnly: true },
    },
    {
      path: '/student/device-qr',
      component: () => import('@/views/StudentDeviceQR.vue'),
      meta: { deviceOnly: true },
    },

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

    {
      path: '/student',
      component: StudentDashboard,
      meta: { role: 'student' },
    },
    {
      path: '/student/session/:id',
      component: StudentSessionDetails,
      meta: { role: 'student' },
    },
    {
      path: '/student/scan/:token',
      component: StudentScanView,
      meta: { role: 'student' },
      props: true,
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.loginFromStorage()
  }

  if (to.meta.public) return true

  if (to.meta.deviceOnly) {
    const deviceToken = localStorage.getItem('deviceToken')
    return deviceToken ? true : '/login'
  }

  if (!auth.user) return '/login'

  if (to.meta.role === 'teacher' && !auth.user.isTeacher)
    return auth.user.isStudent ? '/student' : '/login'

  if (to.meta.role === 'student' && !auth.user.isStudent)
    return auth.user.isTeacher ? '/teacher' : '/login'

  if (to.path === '/login') {
    if (auth.user.isTeacher) return '/teacher'
    if (auth.user.isStudent) return '/student'
  }

  return true
})

export default router
