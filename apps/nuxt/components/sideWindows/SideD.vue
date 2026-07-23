<template>
    <!-- <div class="tab-container"> -->
    <div>
        <div class="fixed pt-1" style="background-color: #fff;">
            <div class="tab-header">

<!-- {{ sideDStatus }} -->
                <button @click="changeTab(0)" :class="{ active: activeTab === 0 }" class="tab-button">
                    <v-badge :color="notice !== 0 ? 'error' : 'transparent'" style="color:transparent" :content="notice"
                        offset-x="-8" offset-y="-6">
                        <v-icon style="color:grey">mdi-bell-ring</v-icon>
                        <div style="color:grey" class="pl-2 font mt-1">即時超溫影像</div>
                    </v-badge>
                </button>
                <button @click="changeTab(1)" :class="{ active: activeTab === 1 }" class="tab-button">
                    <v-badge :color="notice2 !== 0 ? 'error' : 'transparent'" :content="notice2" offset-x="-8"
                        offset-y="-6" style="color:transparent">
                        <v-icon style="color:grey">mdi-calendar-text</v-icon>
                        <div style="color:grey" class="pl-2 font mt-1">事件紀錄</div>
                    </v-badge>

                </button>








            </div>
            <v-card tile>
                <div class="pl-2 font" style="color:#5E5E5E;height:48px;display: flex; align-items: center;">
                    {{ activeTab === 0 ? notice : notice2 }} 項事件
                </div>
            </v-card>
        </div>
        <!-- <div class="carousel">
            <transition :name="transitionName">
                <div class="tab-content" :key="activeTab"> -->
        <!-- 123 -->
        <div class="px-2 content" style="padding-top: 115px">
            <v-card elevation="5" v-if="activeTab === 0" v-for="(item, idx) in alarmData" :key="item.id"
                class="mb-3 px-2" :style="getCardStyle(item.alarmEvent_level)">
                <div :style="getAlarmStyle(item.alarmEvent_level)" class="d-flex py-1 align-items-center">
                    <v-icon size="20" class="my-auto">mdi-bell-ring</v-icon>
                    <div class=" pl-1 font"> {{ item.alarmEvent_level === 1 ? '一級警報' : '二級警報' }}</div>
                </div>
                <v-divider />
                <div class="d-flex justify-space-between">
                    <div>{{ item.alarmEvent_cursingPoint_name }}</div>
                    <div>{{ item.alarmEvent_start }}</div>
                </div>
                <!-- <button @click="sendDataToParent">傳給父</button> -->
                <!-- {{ `http://localhost:5002/api/alarmEvent/share/${encodeBackslash(item.alarmEvent_image)}` }} -->
                <!-- {{ item.alarmEvent_doStatus }} -->
                <!-- {{ item.alarmEvent_image }} -->
                {{ item.alarmEvent_gps[0] }},&nbsp;&nbsp;&nbsp; {{ item.alarmEvent_gps[1] }}
                <div class="responsive-container"
                    @click="sendDataToParent(item.alarmEvent_camera_id, notice, notice2)">
                    <NuxtImg class="alarm-image"
                        :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.alarmEvent_image)}`" />
                    <!-- 潛在的記憶體問題: 如果imgUrl經常變化 -->
                </div>
                <v-divider />
                <div v-show="item.alarmEvent_doAvaliable === 1" 
                     :class="['d-flex justify-space-between py-2', { 'disabled-section': !sideDStatus }]">
                    <div class="font my-auto">警報DIO開關</div>
                    <div>
                        <input type="checkbox" :id="'toggle-' + idx" class="toggleCheckbox"
                            v-model="item.alarmEvent_doStatus" :true-value="1" :false-value="0" 
                            @click="setDo(item)" :disabled="!sideDStatus" />
                        <label :for="'toggle-' + idx" class="toggleContainer">
                            <div>關閉</div>
                            <div>啟用</div>
                        </label>
                    </div>
                    <div :class="['button', { 'button-disabled': !item.alarmEvent_doStatus || !sideDStatus }]">
                        <NuxtImg src="/images/power.svg" width="20" alt="power" />
                    </div>
                </div>
            </v-card>
        </div>
        <!-- 123 -->
        <!-- </div>
            </transition>
        </div> -->
        <!-- </div> -->

    </div>


</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, defineEmits } from 'vue';
const { $getIpaddress } = useNuxtApp()
const notice = ref(0)
const notice2 = ref(0)
const sideDStatus = ref(false)

const activeTab = ref(0)
const transitionName = ref('slide-left')


// 定义 emit
const emit = defineEmits({
    update: null,
    update2: null
});

// 方法来触发事件并传递数据
const sendDataToParent = (e) => {
    // console.log("ssss", e);
    emit('update', e);
};

const sendDataToParent2 = (e) => {
    emit('update2', e);
};


const changeTab = (index) => {
    transitionName.value = index > activeTab.value ? 'slide-left' : 'slide-right'
    activeTab.value = index
}


// 使用 const 來聲明不變的值
const IMG_URL = `http://${$getIpaddress()}:5002/api/database/share`;
const WS_URL = `ws://${$getIpaddress()}:8705`;
// DO control is handled by the 8703 channel.
const WS_DO_CONTROL_URL = `ws://${$getIpaddress()}:8703`;

const alarmData = ref([]);
let ws = null; // 使用 let 因為這個值會被重新賦值

// 8705 端口數據接收超時檢測相關變量（參考 useChartWebSocket.js 的 [WS2] 機制）
let dataTimeoutTimer = null;
let reconnectPromise = null;

// 非阻塞延遲函數
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 非阻塞重連函數
const reconnectAsync = async () => {
    // 如果已經有重連任務在進行，不重複執行
    if (reconnectPromise) return;
    
    reconnectPromise = (async () => {
        console.log('[WS8705] 3 秒內未收到數據，準備斷開重連');
        disconnect();
        await delay(500);
        console.log('[WS8705] 開始重連...');
        setupWebSocket();
        reconnectPromise = null;
    })();
    
    return reconnectPromise;
};

// 使用 computed 屬性來優化樣式計算
const getCardStyle = computed(() => (level) => ({
    'background-color': level === 1 ? '#FFFDF4' : level === 2 ? '#FFF7F7' : ''
}));

const getAlarmStyle = computed(() => (level) => ({
    color: level === 1 ? '#FFC700' : level === 2 ? '#FF1313' : ''
}));


const setDo = (e) => {
    // The 8703 connection carries both heartbeat and DO control messages.
    if (!sideDStatus.value) {
        console.error("DO control WebSocket is not connected. Cannot execute setDo.");
        return;
    }

    const data = {
        feature: "do",
        method: "set_doStatus_alarmEvent",
        content: {
            alarmEvent_id: e.alarmEvent_id,
            alarmEvent_doStatus: e.alarmEvent_doStatus === 1 ? 0 : 1
        },
        session: "sckji8452s"
    }
    console.log("setDo data:", data);
    sendDoControlMessage(data)
}

// 開始數據接收超時檢測（針對 8705 端口）
const startDataTimeout = () => {
    clearDataTimeout();
    
    // console.log('[WS8705] 開始監聽數據接收，3 秒內未收到數據將重連');
    
    dataTimeoutTimer = setTimeout(() => {
        if (ws) {
            // 非阻塞方式觸發重連
            reconnectAsync().catch(err => {
                console.error('[WS8705] 重連過程出錯:', err);
            });
        }
    }, 3000); // 3 秒超時
};

// 重置數據接收超時計時器
const resetDataTimeout = () => {
    clearDataTimeout();
    startDataTimeout(); // 重新開始計時
};

// 清除數據接收超時計時器
const clearDataTimeout = () => {
    if (dataTimeoutTimer) {
        clearTimeout(dataTimeoutTimer);
        dataTimeoutTimer = null;
    }
};

function setupWebSocket() {
    if (ws) ws.close();

    // 清除現有的超時計時器
    clearDataTimeout();
    // 取消正在進行的重連任務
    reconnectPromise = null;

    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log("[WS8705] WebSocket connected");
        // 連接成功後，開始監聽數據接收
        startDataTimeout();
    };

    ws.onmessage = (e) => {
        // 重置數據接收計時器
        resetDataTimeout();
        
        try {
            const data = JSON.parse(e.data);
            if (data.overall_alarmStatus) {
                if (data.overall_alarmStatus[0]) {

                    if (data.overall_alarmStatus[0].content.length) {
                        if (data.overall_alarmStatus[0].content.length) {
                            notice.value = data.overall_alarmStatus[0].content.length
                        } else {
                            notice.value = 0
                        }
                    } else {
                        notice.value = 0
                    }
                } else {
                    notice.value = 0
                }
            } else {
                notice.value = 0
            }




            sendDataToParent2(notice.value + notice2.value)

            if (activeTab.value === 0) {
                alarmData.value = data.overall_alarmStatus[0].content;
            } else if (activeTab.value === 1) {
                alarmData.value = {}
            }
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    };

    ws.onclose = () => {
        console.log("[WS8705] WebSocket disconnected");
        // 清除數據接收超時計時器
        clearDataTimeout();
        // 如果沒有正在進行的超時重連任務，則進行普通重連
        // 避免與超時重連機制衝突
        if (!reconnectPromise) {
            setTimeout(setupWebSocket, 1000);
        }
    };

    ws.onerror = (error) => {
        console.error("[WS8705] WebSocket error:", error);
        clearDataTimeout();
    };
}




function encodeBackslash(input) {
    return input.replace(/\\/g, '%5C%5C');
}


let ws3;
let pingInterval;

function setupWebSocket8703() {
    if (ws3) ws3.close();
    
    // 開始嘗試連接時設置為 false
    sideDStatus.value = false;

    ws3 = new WebSocket(WS_DO_CONTROL_URL);

    ws3.onopen = () => {
        console.log("DO control and heartbeat WebSocket8703 connected");
        sideDStatus.value = true;
        // sendDoControlMessage({ type: 'subscribe', channel: 'updates' });
        // 開始每秒發送 ping 消息
        startPingInterval();
    };

    ws3.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            console.log("WebSocket8703 received:", data);
        } catch (error) {
            console.error("Error parsing WebSocket8703 message:", error);
        }
    };

    ws3.onclose = () => {
        console.log("WebSocket8703 disconnected");
        sideDStatus.value = false;
        clearPingInterval();
        // 延遲重連，確保狀態先更新為 false
        setTimeout(() => {
            setupWebSocket8703();
        }, 1000);
    };

    ws3.onerror = (error) => {
        console.error("WebSocket8703 error:", error);
        sideDStatus.value = false;
    };
}

function startPingInterval() {
    // 清除現有的定時器
    clearPingInterval();
    
    // 每秒發送 ping 消息
    pingInterval = setInterval(() => {
        if (ws3 && ws3.readyState === WebSocket.OPEN) {
            const pingMessage = {
                feature: "ping",
                method: "null",
                content: "null",
                session: "sckji8452s"
            };
            try {
                ws3.send(JSON.stringify(pingMessage));
                // console.log("Sent ping to WebSocket8703");
            } catch (err) {
                // console.error("Ping send failed:", err);
                sideDStatus.value = false;
            }
        }
    }, 1000);
}

function clearPingInterval() {
    if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
    }
}

function sendDoControlMessage(message) {
    if (ws3 && ws3.readyState === WebSocket.OPEN) {
        ws3.send(JSON.stringify(message));
    } else {
        console.error("DO control WebSocket8703 is not open. Unable to send message.");
    }
}

// 斷開 8705 連接函數（比照 useChartWebSocket.js 的 disconnect）
const disconnect = () => {
    console.log('[WS8705] 斷開連接');
    
    // 清除數據接收超時計時器
    clearDataTimeout();
    
    // 取消正在進行的重連任務
    reconnectPromise = null;
    
    if (ws) {
        ws.close();
        ws = null;
    }
};



onMounted(() => {
    setupWebSocket()
    setupWebSocket8703()
})


onUnmounted(() => {
    // 斷開 8705 WebSocket
    disconnect();
    
    // Close the shared 8703 DO-control and heartbeat WebSocket.
    if (ws3) {
        ws3.close();
        ws3 = null;
        sideDStatus.value = false;
    }
    
    // 清除 ping 定時器
    clearPingInterval();
});
</script>

<style scoped>
/* 樣式部分保持不變 */
</style>

<style scoped>
.font {
    font-weight: 700;
    /* color: #434343; */
}


.responsive-container {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
}

.alarm-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: fill;
}

.toggleContainer {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 150px;
    border: 1px solid #BDBDBD;
    border-radius: 20px;
    background: #fff;
    font-weight: bold;
    cursor: pointer;
}

.toggleContainer::before {
    content: '';
    position: absolute;
    width: 50%;
    height: 100%;
    left: 0%;
    border-radius: 20px;
    background: #E25232;
    transition: all 0.3s;
    border: 2px solid #CC3514;
}

.toggleCheckbox:checked+.toggleContainer::before {
    left: 50%;
}

.toggleContainer div {
    padding: 6px;
    text-align: center;
    z-index: 1;
}

.toggleCheckbox {
    display: none;
}

.toggleCheckbox:checked+.toggleContainer div:first-child {
    color: #8A8A8A;
}

.toggleCheckbox:checked+.toggleContainer div:last-child {
    color: #fff;
}

.toggleCheckbox+.toggleContainer div:first-child {
    color: #fff;
}

.toggleCheckbox+.toggleContainer div:last-child {
    color: #8A8A8A;
}

.button {
    position: relative;
    width: 35px;
    height: 35px;
    border: 3px solid #CC3514;
    border-radius: 50%;
    background: rgb(226, 82, 50);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 2px;
    box-shadow: 0 0 10px rgba(255, 99, 71, 1);
    transition: all 0.3s ease;
}

.button-disabled {
    background: #8A8A8A;
    border-color: #666;
    box-shadow: none;
}

.disabled-section {
    opacity: 0.5;
    pointer-events: none;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.disabled-section .toggleContainer {
    background: #e0e0e0;
    border-color: #ccc;
    cursor: not-allowed;
}

.disabled-section .font {
    color: #999;
}
</style>

<style scoped>
.tab-header {
    display: flex;
    border-bottom: 1px solid #ccc;
    /* position: fixed; */
    z-index: 9999;
}

.fixed {
    position: fixed;
    z-index: 9999;
}



.tab-button {
    padding: 10px 20px;
    border: none;
    background-color: #f1f1f1;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
    justify-content: center;
    white-space: nowrap;
}

.tab-button.active {
    background-color: #fff;
    border-bottom: 2px solid #36619D;
}

.carousel {
    position: relative;
    /* overflow: auto; */
    height: 900px;
    /* Adjust height as needed */
}

.tab-content {
    position: absolute;
    width: 100%;
    transition: transform 0.5s;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.5s;
}

.slide-left-enter-from {
    transform: translateX(100%);
}

.slide-left-leave-to {
    transform: translateX(-100%);
}

.slide-right-enter-from {
    transform: translateX(-100%);
}

.slide-right-leave-to {
    transform: translateX(100%);
}
</style>
