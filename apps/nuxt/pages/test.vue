<template>
    <div class="pa-3 grid-c">
        <div class="btn-c d-flex">
            <v-btn @click="refreshURL" class="ma-2" color="secondary" size="x-large" hide-details
                density="compact">重新整理</v-btn>
            <v-btn @click="state.qrcode = ''" class="ma-2" color="secondary" size="x-large" hide-details
                density="compact">清空input</v-btn>
        </div>
        <div class="btn-c d-flex">
            <div style="width: 70%;">
                <v-text-field label="QR CODE 內容" v-model="state.qrcode" hide-details></v-text-field>
            </div>
            <div style="width: 20%;">
                <v-btn class="ma-2" color="secondary" size="x-large" hide-details density="compact"
                    @click="dialog = true">ROI</v-btn>
            </div>
        </div>
        <div class="map-c">
            <div class="item-c" v-if="state.rr">
                <ClientOnly>
                    <MapDefaultphone ref="mapmain" :formtData="state" :camID="1" :camType="'ir'"
                        @startThermalCapture="startThermalCapture" />
                    <!-- backbtn = 自訂main的返回鍵 -->
                </ClientOnly>
            </div>
        </div>
        <div style="height: 40px;"></div>
        <div class="container">
            <div class="track" id="track">
                <div v-for="(item, index) in state.boximgs" :key="index">
                    <img :src="item.base64" />
                </div>
            </div>
            <div class="selector-bar"></div>
        </div>
        <!-- dialog -->
        <v-dialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>
            <v-card>
                <v-toolbar>
                    <v-btn icon="mdi-close" @click="dialog = false"></v-btn>

                    <v-toolbar-title>設定</v-toolbar-title>
                </v-toolbar>

                <v-list lines="two">
                    <v-list-subheader>新增ROI物件</v-list-subheader>
                    <v-list-item subtitle="單點測溫：快速量測區域最高溫 / 最低溫" title="SPOT"
                        @click="dialog = false, requestBtnGroupEvent('spot')">
                        <template v-slot:prepend>
                            <v-list-item-action start>
                                <img src="/images/icon/Iconspot.png"
                                    style="width:24px;height:24px;margin: 10px 20px;" />
                            </v-list-item-action>
                        </template>
                    </v-list-item>

                    <v-list-item subtitle="線性量測：顯示沿線溫度分佈曲線" title="LINE"
                        @click="dialog = false, requestBtnGroupEvent('line')">
                        <template v-slot:prepend>
                            <v-list-item-action start>
                                <img src="/images/icon/Iconline.png"
                                    style="width:24px;height:24px;margin: 10px 20px;" />
                            </v-list-item-action>
                        </template>
                    </v-list-item>

                    <v-list-item subtitle="區域量測：監測指定區域的平均、最高與最低溫" title="SCOPE"
                        @click="dialog = false, requestBtnGroupEvent('scope')">
                        <template v-slot:prepend>
                            <v-list-item-action start>
                                <img src="/images/icon/Iconscope.png"
                                    style="width:24px;height:24px;margin: 10px 20px;" />
                            </v-list-item-action>
                        </template>
                    </v-list-item>

                    <v-list-item subtitle="自動熱斑偵測：分析區域內的異常溫度群集" title="BLOB"
                        @click="dialog = false, requestBtnGroupEvent('blob')">
                        <template v-slot:prepend>
                            <v-list-item-action start>
                                <img src="/images/icon/Iconblob.png"
                                    style="width:24px;height:24px;margin: 10px 20px;" />
                            </v-list-item-action>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
const mapmain = ref(null)
const dialog = ref(false)
const state = reactive({
    qrcode: '',
    viewMode: 1,
    mainMode: 'roi', // 0 = 監控模式 ,1 = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    alarmID: [],
    cursingPointValue: 0,
    rr: false,
    boximgs: []
})
const requestBtnGroupEvent = (data) => {
    // 接收btnGroup 資料傳送至pixijscanvas1
    console.log('main requestBtnGroupEvent', data);
    mapmain.value.requestBtnGroupEvent({ type: data })
}
const refreshURL = () => {
    window.location.reload()
}
const toMapPage1 = (e) => {
    console.log('toMapPage1', e);
}
const initlightbox = (e) => {
    // light box
    const track = document.getElementById('track');
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let translateX = 0;
    let snapTimeout;
    let isSnapping = false;

    // 🧩 初始化選擇指定索引（0-based）
    function initSelect(index = 0) {
        const items = [...track.children];
        if (items.length === 0) return;

        // index 守衛：超出範圍自動歸零
        if (index < 0 || index >= items.length) index = 0;

        const item = items[index];
        const rect = item.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        const center = window.innerWidth / 2;
        const diff = mid - center;

        // 設定初始 translateX
        translateX = -diff;
        track.style.transform = `translateX(${translateX}px)`;

        console.log(`初始化選到: ${item.textContent}`);
    }

    // 滑鼠拖動
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        track.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            track.style.cursor = 'grab';
            clearTimeout(snapTimeout);
            snapTimeout = setTimeout(snapToNearest, 120);
        }
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        track.style.transform = `translateX(${currentX}px)`;
        translateX = currentX;
    });

    // 觸控拖動
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
    });
    track.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            clearTimeout(snapTimeout);
            snapTimeout = setTimeout(snapToNearest, 120);
        }
    });
    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX - startX;
        track.style.transform = `translateX(${currentX}px)`;
        translateX = currentX;
    });

    function snapToNearest() {
        if (isSnapping) return;
        isSnapping = true;

        requestAnimationFrame(() => {
            setTimeout(() => {
                const items = [...track.children];
                const center = window.innerWidth / 2;
                let nearest = null;
                let minDist = Infinity;

                items.forEach(item => {
                    const rect = item.getBoundingClientRect();
                    const mid = rect.left + rect.width / 2;
                    const dist = Math.abs(mid - center);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = item;
                    }
                });

                if (nearest) {
                    const rect = nearest.getBoundingClientRect();
                    const mid = rect.left + rect.width / 2;
                    const diff = mid - center;

                    translateX -= diff;
                    track.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
                    track.style.transform = `translateX(${translateX}px)`;

                    setTimeout(() => {
                        track.style.transition = '';
                        isSnapping = false;
                    }, 400);

                    console.log('選到:', nearest.textContent);
                } else {
                    isSnapping = false;
                }
            }, 80);
        });
    }
    initSelect(e)
}
const st = ref(true)
const startThermalCapture = (e) => {
    if (e.length > 0 && st.value) {
        initlightbox(2)
        st.value = false
    }
    state.boximgs = e
}
onMounted(() => {
    state.rr = true
    setTimeout(() => {
        mapmain.value.switchWK(true)
        setTimeout(() => {
            state.viewMode = 1
            state.mainMode = 'roi'
        }, 500)
    }, 1000)

    // initlightbox(1)
})
</script>
<style scoped>
.grid-c {
    display: grid;
    grid-template-rows: auto auto 1fr auto auto;
    height: 100vh;
}

.btn-c {
    /* height: 80px; */
    width: 100%;
}

.map-c {
    position: relative;
    width: 100%;
    height: 100%;
}

.item-c {
    position: absolute;
    width: 100%;
    height: 100%;
}

.light-c {
    width: 100%;
    height: 140px;
}
</style>
<style>
.container * {
    user-select: none !important;
}

.container {
    position: relative;
    padding: 0em 0em;
    width: 100%;
    height: 140px;
    background: #e2e2e2;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

/* 可拖動圖片列 */
.track {
    display: flex;
    align-items: center;
    gap: 10px;
    transition: transform 0.1s ease-out;
    cursor: grab;
}

/* 單張圖片卡 */
.track div {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    position: relative;
    color: white;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    /* padding-bottom: 6px; */
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
}

.track div img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    pointer-events: none;
    object-fit: cover;
}

.selector-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 110px;
    height: 110px;
    transform: translate(-50%, -50%);
    z-index: 10;
    pointer-events: none;

    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.08);
    /* backdrop-filter: blur(8px) saturate(180%); */
    /* -webkit-backdrop-filter: blur(8px) saturate(180%); */

    box-shadow:
        0 0 8px rgba(255, 255, 255, 0.25),
        inset 0 0 6px rgba(255, 255, 255, 0.25),
        0 0 20px rgba(0, 0, 0, 0.3);

    transition: all 0.3s ease;
}

.selector-bar:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.7);
    box-shadow:
        0 0 10px rgba(255, 255, 255, 0.3),
        inset 0 0 8px rgba(255, 255, 255, 0.3),
        0 0 25px rgba(0, 0, 0, 0.35);
}
</style>