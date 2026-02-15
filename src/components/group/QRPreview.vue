<template>
  <div class="qrcode-card">
    <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="qrcode-img" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const qrDataUrl = ref('')
const currentUrl = ref('')

const props = defineProps({
  code: {
    type: String,
    default: null,
    required: true,
  },
})

watch(
  () => props.code,
  async (newCode) => {
    currentUrl.value = window.location + `?code=${newCode}`
    qrDataUrl.value = await QRCode.toDataURL(currentUrl.value, {
      width: 200,
      margin: 2,
    })
  },
)

onMounted(() => {
  if (props.code) {
    currentUrl.value = window.location + `?code=${props.code}`
    QRCode.toDataURL(currentUrl.value, { width: 200, margin: 2 }).then((url) => {
      qrDataUrl.value = url
    })
  }
})
</script>

<style scoped>
.qrcode-card h3 {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  border-radius: 1rem;
}

.qrcode-url {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #888;
  word-break: break-all;
}
</style>
