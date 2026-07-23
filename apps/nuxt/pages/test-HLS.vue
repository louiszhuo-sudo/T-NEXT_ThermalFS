<template>
    <div class="container-canvas pa-3">
        <div style="height: 100%;">
            <video ref="video1" controls autoplay muted
                style="height: 100%; width: 100%;background-color: black;"></video>
            <!-- <video ref="video2" controls autoplay muted
                style="height: 100%; width: 100%;background-color: black;display: none;"></video> -->
        </div>
        <div class="item201">
            <div class="btneee">
                <v-btn @click="getPlayList()">取得播放列表</v-btn>
                <div class="listiee" style="height: 400px;overflow: auto;">
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-left">
                                    Index
                                </th>
                                <th class="text-left">
                                    曲目
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in state.playList" :key="index"
                                :style="state.currentIndex === index ? 'background-color: #F2F2F2;' : ''">
                                <td>{{ index }}</td>
                                <td>{{ item }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </div>
            </div>
            <div>
                <div style="height: 400px;overflow: auto;">
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-left">
                                    發生時間
                                </th>
                                <th class="text-left">
                                    問題
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in state.message" :key="index">
                                <td>{{ item[0] }}</td>
                                <td>{{ item[1] }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const video1 = ref(null)
const video2 = ref(null)
const { $webSocketconnect03 } = useNuxtApp()
const state = reactive({
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    playList: [],
    currentIndex: null,
    message: []
})
const getPlayList = () => {
    var output = {
        "feature": "test",
        "method": "getPlayList",
        "session": Math.random().toString(36).substr(2),
        "content": {}
    }
    state.ws3.send(JSON.stringify(output))

}
const playVIDEO = (e) => {
    state.playList = e
    const video = video1.value;
    const m3u8Url = 'http://localhost:5002/video/index.m3u8'; // ← 請改成你自己的 .m3u8 路徑

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(m3u8Url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
        hls.on(Hls.Events.FRAG_LOADED, function (event, data) {
            const tsUrl = data.frag.url;
            state.message = [[getCurrentDateTime(), '🎯 目前載入的 TS segment: ' + tsUrl] , ...state.message]
        });

        // 也可以監聽 segment 開始播放的事件
        hls.on(Hls.Events.FRAG_CHANGED, function (event, data) {
            const frag = data.frag;
            state.message = [[getCurrentDateTime(), '▶️ 正在播放的 segment: ' + frag.url] , ...state.message]
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari 支援原生 HLS
        video.src = m3u8Url;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
    } else {
        alert('您的瀏覽器不支援 HLS 播放');
    }
}
function getCurrentDateTime() {
    const now = new Date();

    const pad = n => n.toString().padStart(2, '0');

    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1); // 月份從 0 開始
    const dd = pad(now.getDate());

    const hh = pad(now.getHours());
    const mi = pad(now.getMinutes());
    const ss = pad(now.getSeconds());

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
const playVIDEO1 = (e) => {
    state.playList = e
    let currentIndex = 0;
    const list = state.playList;
    const player = video1.value

    // 初始化播放第一部影片
    if (list.length > 0) {
        player.src = 'http://localhost:5002/video/' + list[currentIndex];
        player.load();
        player.play();
    } else {
        console.log('錯誤 ! 沒有影片可以供撥放')
    }
    state.currentIndex = currentIndex
    player.addEventListener('ended', () => {
        currentIndex++;
        if (currentIndex < list.length) {
            player.src = 'http://localhost:5002/video/' + list[currentIndex];
            player.load();
            player.play();
        } else {
            currentIndex = 0
            player.src = 'http://localhost:5002/video/' + list[0];
            player.load();
            player.play();
            console.log('播放清單結束');
        }
        state.currentIndex = currentIndex
    });
}
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            state.ws3 = $webSocketconnect03()
            if (state.wsListener3.close !== null) {
                state.ws3.removeEventListener("close", state.wsListener3.close)
                state.wsListener3.close = null
            }
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket03()
                }, 1000)
            }
            const messageEvent = (event) => {
                var data = JSON.parse(event.data)
                // console.log(data);
                var feature = data.feature
                var method = data.method
                if (feature === "test" && method === "getPlayList") {
                    playVIDEO(data.content)
                }
            }
            state.ws3.addEventListener("message", messageEvent)
            getPlayList()
            state.ws3.addEventListener("close", colseEvent)
            state.wsListener3.close = colseEvent
        } else if ($webSocketconnect03().readyState !== 1) {
            setTimeout(() => {
                openwebsocket03()
            }, 1000)
        }
    }
    openwebsocket03()
}
onMounted(() => {
    initWs3()
})
onBeforeUnmount(() => {
    if (state.wsListener3.close !== null) {
        state.ws3.removeEventListener("close", state.wsListener3.close)
        state.wsListener3.close = null
    }
    if (state.wsListener3.message !== null) {
        state.ws3.removeEventListener("message", state.wsListener3.message)
        state.wsListener3.message = null
    }
    if (state.ws3 !== null) {
        // state.ws.close()
        state.ws3 = null
    }
})
</script>
<style scoped>
.container-canvas {
    display: grid;
    grid-template-columns: 50% 50%;
    height: 100vh;
    /* background-color: #F2F2F2; */
    /* border: #D3D5D4 1px solid; */
}

.item201 {
    display: grid;
    grid-template-rows: 50% 50%;
}
</style>