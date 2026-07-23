<template>
  <div>
    <video
      ref="videoPlayer"
      class="video-js"
      controls
      preload="auto"
      width="640"
      height="480"
    >
      <source v-for="source in videoSources" :key="source.src" :src="source.src" :type="source.type" />
      Your browser does not support the video tag.
    </video>

    <video
      ref="videoPlayer2"
      class="video-js"
      controls
      preload="auto"
      width="640"
      height="480"
    >
      <source v-for="source in videoSources2" :key="source.src" :src="source.src" :type="source.type" />
      Your browser does not support the video tag.
    </video>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const props = defineProps({
  videoSrc: {
    type: String,
    default: ''
  },
  videoSrc2: {
    type: String,
    default: ''
  }
})

const videoPlayer = ref(null)
const videoPlayer2 = ref(null)

const errorMessage = ref('')

const videoSources = computed(() => {
  if (!props.videoSrc) return []
  return [
    { src: props.videoSrc, type: 'video/mp4' },
    { src: props.videoSrc.replace('.mp4', '.webm'), type: 'video/webm' },
    { src: props.videoSrc.replace('.mp4', '.ogg'), type: 'video/ogg' }
  ]
})

const videoSources2 = computed(() => {
  if (!props.videoSrc2) return []
  return [
    { src: props.videoSrc2, type: 'video/mp4' },
    { src: props.videoSrc2.replace('.mp4', '.webm'), type: 'video/webm' },
    { src: props.videoSrc2.replace('.mp4', '.ogg'), type: 'video/ogg' }
  ]
})

let player1 = null
let player2 = null

const initializePlayer1 = () => {
  if (player1) {
    player1.dispose()
  }
  player1 = videojs(videoPlayer.value, {
    sources: videoSources.value
  }, () => {
    console.log('Video player 1 is ready')
    player1.on('error', handleVideoError1)
  })
}

const initializePlayer2 = () => {
  if (player2) {
    player2.dispose()
  }
  player2 = videojs(videoPlayer2.value, {
    sources: videoSources2.value
  }, () => {
    console.log('Video player 2 is ready')
    player2.on('error', handleVideoError2)
  })
}

const handleVideoError1 = () => {
  const error = player1.error()
  console.error('Video.js Error (Player 1):', error.code, error.message)
  errorMessage.value = `播放錯誤 (播放器 1): ${error.message}`
}

const handleVideoError2 = () => {
  const error = player2.error()
  console.error('Video.js Error (Player 2):', error.code, error.message)
  errorMessage.value = `播放錯誤 (播放器 2): ${error.message}`
}

watch(() => props.videoSrc, (newSrc, oldSrc) => {
  if (newSrc && newSrc !== oldSrc) {
    errorMessage.value = ''
    if (player1) {
      player1.src(videoSources.value)
    } else {
      initializePlayer1()
    }
  }
})

watch(() => props.videoSrc2, (newSrc, oldSrc) => {
  if (newSrc && newSrc !== oldSrc) {
    errorMessage.value = ''
    if (player2) {
      player2.src(videoSources2.value)
    } else {
      initializePlayer2()
    }
  }
})

onMounted(() => {
  if (props.videoSrc) {
    initializePlayer1()
  }
  if (props.videoSrc2) {
    initializePlayer2()
  }
})

onBeforeUnmount(() => {
  if (player1) {
    player1.dispose()
  }
  if (player2) {
    player2.dispose()
  }
})
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
