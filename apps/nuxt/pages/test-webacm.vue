<template>
    <div class="pa-3">
        <v-btn @click="initCamera" class="ma-2" color="primary">啟動相機</v-btn>
        <v-select v-model="selectedDeviceId" :items="cameraList" item-title="label" item-value="deviceId" label="選擇鏡頭"
            class="ma-2" @update:modelValue="switchCamera"></v-select>
        <v-btn @click="refreshURL" class="ma-2" color="secondary">重新整理</v-btn>

        <video ref="videoEl" autoplay playsinline muted class="mt-4" width="100%" style="border-radius: 8px;" />
    </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const videoEl = ref(null)
const stream = ref(null)
const cameraList = ref([])         // 可用鏡頭列表
const selectedDeviceId = ref(null) // 目前使用的鏡頭 ID

// 🔹 取得所有攝影機設備
const listCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    cameraList.value = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, idx) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${idx + 1}`,
        }))
}

// 🔹 啟動指定鏡頭
const startCamera = async (deviceId = null) => {
    try {
        if (stream.value) {
            stream.value.getTracks().forEach((t) => t.stop())
        }

        const constraints = {
            audio: false,
            video: deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: { ideal: 'environment' } }, // 預設後鏡頭
        }

        stream.value = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoEl.value) videoEl.value.srcObject = stream.value
    } catch (err) {
        console.error('啟動相機失敗:', err)
        alert('無法啟動相機：' + err.message)
    }
}

// 🔹 初始化相機（按鈕點擊後觸發）
const initCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的瀏覽器不支援相機權限存取')
        return
    }

    await listCameras()
    if (cameraList.value.length === 0) {
        alert('找不到任何相機設備')
        return
    }

    // 預設啟動第一個（或後鏡頭）
    selectedDeviceId.value = cameraList.value[0].deviceId
    await startCamera(selectedDeviceId.value)
}

// 🔹 切換鏡頭
const switchCamera = async (newId) => {
    await startCamera(newId)
}

// 🔹 離開頁面時釋放資源
onBeforeUnmount(() => {
    if (stream.value) {
        stream.value.getTracks().forEach((t) => t.stop())
    }
})

// 🔹 重新整理頁面
const refreshURL = () => {
    window.location.reload()
}
</script>
