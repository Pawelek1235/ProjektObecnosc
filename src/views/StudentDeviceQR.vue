<template>
  <div class="device-qr">
    <h1>Twój QR urządzenia</h1>

    <div class="qr-wrapper">
      <div v-if="qrValue" class="qr-box">
        <QrcodeVue :value="qrValue" :size="260" />
      </div>
    </div>

    <button class="back" @click="goBack">Wróć</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'

const router = useRouter()
const qrValue = ref<string | null>(null)

onMounted(() => {
  const deviceToken = localStorage.getItem('deviceToken')

  if (!deviceToken) {
    qrValue.value = null
    return
  }

  qrValue.value = deviceToken
})

function goBack() {
  router.push('/student-home')
}
</script>
<style scoped>
.device-qr {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
  text-align: center;
  padding: 2rem;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
}

.qr-box {
  background: white;
  padding: 1.5rem;
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.back {
  margin-top: 1.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.error {
  color: #dc2626;
  margin-top: 1rem;
}
</style>
