<template>
    <v-app dark id="custom-bg">
        <!-- <v-app-bar fixed flat app color="#435155" style="height:64px" class="py-0">
            <img class="ml-6 mr-3 logo" alt="logo" src="/logo.png" width="125em" />
            <v-tabs color="white" hide-slider>
                <template v-for="(item, i) in items">
                    <template>
                        <NuxtLink :to="item.to">
                            <v-tab :key="i" :disabled="item.disabled">
                                <img :src="item.img" max-width="20"></img>
                                <div class="ml-2 ffffont"><span class="ffffont">{{ item.title }}</span></div>
                            </v-tab>
                        </NuxtLink>
                    </template>
</template>
</v-tabs>
<div style="color:#fff;">admin</div>
<v-btn class="mr-1" small depressed color="#00000000" @click="testclick">
    <img src="/images/icon/LOGOUT ICONlogout.svg" />
</v-btn>
</v-app-bar> -->
        <v-main>
            <v-container class="container-custom pa-0 ma-0" style="height: calc(100vh);">
                <!-- <template v-for="(item, i) in snackbarList" :keys="'snackbarxs' + i">
                    <v-snackbar v-model="item.snackbar" :timeout="item.timeout * 1000" :color="item.color" id="ccclww"
                        transition="scroll-x-transition"
                        :style="{ 'margin-bottom': item.calcMargin, 'transition': 'all 0.3s' }" right
                        @input="removeSnackbar(i)">
                        {{ item.text }}
                    </v-snackbar>
                </template> -->
                <NuxtPage />
            </v-container>
        </v-main>
        <!-- <div class="test001111"></div> -->
        <!-- <v-footer height="36" color="#F3F3F3" app>
            <div></div>
        </v-footer> -->
        <v-dialog v-model="wsStatusDialog" fullscreen :scrim="false" transition="dialog-bottom-transition"
            class="ws-status-dialog">
            <v-card class="ws-status-screen" flat>
                <header class="ws-status-header">
                    <div>
                        <div class="ws-status-eyebrow">SYSTEM DIAGNOSTICS</div>
                        <h1 class="ws-status-title">全域 WebSocket 連線狀態</h1>
                        <div class="ws-status-subtitle">
                            每秒更新一次，只讀取連線狀態，不會中斷或重新建立連線
                        </div>
                    </div>
                    <v-btn icon="mdi-close" variant="text" color="white" size="large" aria-label="關閉 WebSocket 診斷視窗"
                        @click="wsStatusDialog = false"></v-btn>
                </header>

                <v-card-text class="ws-status-content">
                    <section class="ws-status-summary">
                        <div class="ws-summary-card">
                            <div class="ws-summary-label">已連線</div>
                            <div class="ws-summary-value ws-summary-value-online">
                                {{ connectedWsCount }}
                                <span>/ {{ wsStatusItems.length }}</span>
                            </div>
                        </div>
                        <div class="ws-summary-card">
                            <div class="ws-summary-label">主機</div>
                            <div class="ws-summary-host">{{ wsStatusHost }}</div>
                        </div>
                        <div class="ws-summary-card">
                            <div class="ws-summary-label">最後更新</div>
                            <div class="ws-summary-host">{{ wsStatusLastUpdated || '尚未更新' }}</div>
                        </div>
                    </section>

                    <section class="ws-status-grid" aria-label="WebSocket 連線列表">
                        <article v-for="item in wsStatusItems" :key="item.port" class="ws-status-item" role="button"
                            tabindex="0" :aria-label="`查看 Port ${item.port} 收發詳情`" @click="openWsDetails(item.port)"
                            @keydown.enter.prevent="openWsDetails(item.port)"
                            @keydown.space.prevent="openWsDetails(item.port)">
                            <div class="ws-status-item-top">
                                <div class="ws-port-group">
                                    <span class="ws-status-dot" :style="{ backgroundColor: item.color }"></span>
                                    <div>
                                        <div class="ws-port-label">PORT</div>
                                        <div class="ws-port-number">{{ item.port }}</div>
                                    </div>
                                </div>
                                <v-chip :color="item.color" variant="flat" size="small" class="ws-status-chip">
                                    {{ item.label }}
                                </v-chip>
                            </div>

                            <dl class="ws-status-details">
                                <div>
                                    <dt>URL</dt>
                                    <dd>{{ item.url }}</dd>
                                </div>
                                <div>
                                    <dt>readyState</dt>
                                    <dd>{{ item.readyStateLabel }}</dd>
                                </div>
                                <div>
                                    <dt>監聽器</dt>
                                    <dd>{{ item.messageListenerCount }} 個 message listener</dd>
                                </div>
                            </dl>
                            <div class="ws-status-card-hint">
                                <span>已記錄 {{ item.messages.length }} 筆收發內容</span>
                                <span>點擊查看 <v-icon icon="mdi-chevron-right" size="18"></v-icon></span>
                            </div>
                        </article>
                    </section>

                    <footer class="ws-status-footer">
                        <span>按</span>
                        <kbd>`</kbd>
                        <span>、</span>
                        <kbd>Esc</kbd>
                        <span>或右上角關閉按鈕離開診斷視窗</span>
                    </footer>
                </v-card-text>

                <transition name="ws-detail">
                    <div v-if="selectedWsItem" class="ws-detail-layer" @click.self="closeWsDetails">
                        <aside class="ws-detail-panel" :aria-label="`Port ${selectedWsItem.port} WebSocket 詳情`">
                            <header class="ws-detail-header">
                                <div class="ws-detail-heading">
                                    <v-btn icon="mdi-arrow-left" variant="text" color="white" size="small"
                                        aria-label="返回 WebSocket 列表" @click="closeWsDetails"></v-btn>
                                    <div>
                                        <div class="ws-port-label">WEBSOCKET DETAILS</div>
                                        <h2>Port {{ selectedWsItem.port }}</h2>
                                    </div>
                                </div>
                                <v-chip :color="selectedWsItem.color" variant="flat" size="small"
                                    class="ws-status-chip">
                                    {{ selectedWsItem.label }}
                                </v-chip>
                            </header>

                            <div class="ws-detail-body">
                                <section class="ws-detail-summary">
                                    <div>
                                        <span>message 監聽器</span>
                                        <strong>{{ selectedWsItem.messageListenerCount }}</strong>
                                    </div>
                                    <div>
                                        <span>送出</span>
                                        <strong class="ws-send-text">{{ selectedWsItem.sentCount }}</strong>
                                    </div>
                                    <div>
                                        <span>接收</span>
                                        <strong class="ws-receive-text">{{ selectedWsItem.receivedCount }}</strong>
                                    </div>
                                    <div>
                                        <span>保留紀錄</span>
                                        <strong>{{ selectedWsItem.messages.length }}</strong>
                                    </div>
                                </section>

                                <div class="ws-listener-note">
                                    <v-icon icon="mdi-information-outline" size="18"></v-icon>
                                    <span>
                                        監聽器數量是目前 socket 上透過 addEventListener 註冊的 message callback；
                                        同一組件重複註冊會分別計數。
                                    </span>
                                </div>

                                <section class="ws-message-section">
                                    <div class="ws-message-toolbar">
                                        <div>
                                            <h3>即時收發內容</h3>
                                            <span>僅記錄診斷視窗開啟期間的內容，最新資料排在最上方</span>
                                        </div>
                                        <div class="ws-message-actions">
                                            <div class="ws-message-filters" aria-label="收發方向篩選">
                                                <button v-for="filter in wsMessageFilters" :key="filter.value" type="button"
                                                    :class="{ active: wsMessageFilter === filter.value }"
                                                    @click="wsMessageFilter = filter.value">
                                                    {{ filter.label }}
                                                </button>
                                            </div>
                                            <v-btn variant="outlined" color="#94a3b8" size="small"
                                                prepend-icon="mdi-delete-outline" @click="clearSelectedWsMessages">
                                                清除
                                            </v-btn>
                                        </div>
                                    </div>

                                    <div v-if="filteredWsMessages.length" class="ws-message-list">
                                        <details v-for="(message, index) in filteredWsMessages" :key="message.id"
                                            class="ws-message-entry" :open="index === 0">
                                            <summary>
                                                <span class="ws-direction-badge"
                                                    :class="message.direction === 'send' ? 'is-send' : 'is-receive'">
                                                    {{ message.direction === 'send' ? 'SEND' : 'RECEIVE' }}
                                                </span>
                                                <time>{{ message.timeLabel }}</time>
                                                <span class="ws-message-route">
                                                    {{ message.feature || '—' }}
                                                    <template v-if="message.method"> / {{ message.method }}</template>
                                                </span>
                                                <span class="ws-message-size">
                                                    {{ message.size }} {{ message.sizeUnit }}
                                                </span>
                                            </summary>
                                            <div class="ws-message-meta">
                                                <span>類型：{{ message.payloadType }}</span>
                                                <span v-if="message.session">session：{{ message.session }}</span>
                                                <span v-if="message.truncated">內容已截斷</span>
                                            </div>
                                            <pre>{{ message.payload }}</pre>
                                        </details>
                                    </div>
                                    <div v-else class="ws-message-empty">
                                        <v-icon icon="mdi-swap-horizontal" size="34"></v-icon>
                                        <strong>目前沒有符合條件的收發紀錄</strong>
                                        <span>保持此視窗開啟，新的 WebSocket 訊息會自動顯示在這裡。</span>
                                    </div>
                                </section>
                            </div>
                        </aside>
                    </div>
                </transition>
            </v-card>
        </v-dialog>
    </v-app>

    <!-- <v-app id="inspire">
        <v-navigation-drawer v-model="drawer">
            <v-list>
                <v-list-item title="home" to="/">

                </v-list-item>
                <v-list-item title="test" to="/test">

                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

            <v-app-bar-title>Application</v-app-bar-title>
        </v-app-bar>

        <v-main>
            <NuxtPage />
        </v-main>
    </v-app> -->
</template>
<script setup>
import L from 'leaflet'
const {
    $getIpaddress,
    $webSocketconnect02,
    $webSocketconnect03,
    $webSocketconnect04,
    $webSocketconnect05,
    $webSocketconnect07,
    $webSocketDiagnostics,
    $setWebSocketDiagnosticsEnabled,
    $clearWebSocketDiagnostics
} = useNuxtApp()

const wsStatusDialog = ref(false)
const wsStatusLastUpdated = ref('')
const wsStatusHost = ref('')
const selectedWsPort = ref(null)
const wsMessageFilter = ref('all')
let wsStatusRefreshTimer = null
const wsMessageFilters = [
    { label: '全部', value: 'all' },
    { label: '送出', value: 'send' },
    { label: '接收', value: 'receive' }
]

const WS_STATUS_META = {
    0: { label: '連線中', color: '#f59e0b', readyStateLabel: '0 — CONNECTING' },
    1: { label: '已連線', color: '#22c55e', readyStateLabel: '1 — OPEN' },
    2: { label: '關閉中', color: '#f97316', readyStateLabel: '2 — CLOSING' },
    3: { label: '已斷線', color: '#ef4444', readyStateLabel: '3 — CLOSED' }
}
const WS_STATUS_UNAVAILABLE = {
    label: '未建立',
    color: '#64748b',
    readyStateLabel: '—'
}
const WS_STATUS_UNKNOWN = {
    label: '未知',
    color: '#8b5cf6',
    readyStateLabel: 'UNKNOWN'
}

const globalWsConnections = [
    { port: '8702', getSocket: () => $webSocketconnect02?.() },
    { port: '8703', getSocket: () => $webSocketconnect03?.() },
    { port: '8704', getSocket: () => $webSocketconnect04?.() },
    { port: '8705', getSocket: () => $webSocketconnect05?.() },
    { port: '8707', getSocket: () => $webSocketconnect07?.() }
]

const wsStatusItems = shallowRef(globalWsConnections.map(({ port }) => ({
    port,
    url: `ws://-:${port}/`,
    readyState: null,
    messageListenerCount: 0,
    sentCount: 0,
    receivedCount: 0,
    messages: [],
    ...WS_STATUS_UNAVAILABLE
})))

const connectedWsCount = computed(() => {
    return wsStatusItems.value.filter(item => item.readyState === 1).length
})

const selectedWsItem = computed(() => {
    return wsStatusItems.value.find(item => item.port === selectedWsPort.value) || null
})

const filteredWsMessages = computed(() => {
    const messages = selectedWsItem.value?.messages || []
    if (wsMessageFilter.value === 'all') {
        return messages
    }
    return messages.filter(message => message.direction === wsMessageFilter.value)
})

const refreshGlobalWsStatuses = () => {
    const host = $getIpaddress?.() || window.location.hostname || '-'
    wsStatusHost.value = host
    wsStatusItems.value = globalWsConnections.map(({ port, getSocket }) => {
        let socket = null
        try {
            socket = getSocket()
        } catch (error) {
            console.warn(`[WS diagnostics] 無法取得 ${port} WebSocket`, error)
        }

        const readyState = typeof socket?.readyState === 'number' ? socket.readyState : null
        const meta = readyState === null
            ? WS_STATUS_UNAVAILABLE
            : (WS_STATUS_META[readyState] || {
                ...WS_STATUS_UNKNOWN,
                readyStateLabel: String(readyState)
            })

        let diagnostics = {
            messageListenerCount: 0,
            sentCount: 0,
            receivedCount: 0,
            messages: []
        }
        try {
            diagnostics = $webSocketDiagnostics?.(port) || diagnostics
        } catch (error) {
            console.warn(`[WS diagnostics] 無法取得 ${port} 收發診斷資料`, error)
        }

        return {
            port,
            url: socket?.url || `ws://${host}:${port}/`,
            readyState,
            ...diagnostics,
            ...meta
        }
    })
    wsStatusLastUpdated.value = new Intl.DateTimeFormat('zh-TW', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date())
}

const stopWsStatusRefresh = () => {
    if (wsStatusRefreshTimer !== null) {
        clearInterval(wsStatusRefreshTimer)
        wsStatusRefreshTimer = null
    }
}

const startWsStatusRefresh = () => {
    stopWsStatusRefresh()
    $setWebSocketDiagnosticsEnabled?.(true)
    refreshGlobalWsStatuses()
    wsStatusRefreshTimer = setInterval(refreshGlobalWsStatuses, 1000)
}

const openWsDetails = (port) => {
    wsMessageFilter.value = 'all'
    selectedWsPort.value = port
    refreshGlobalWsStatuses()
}

const closeWsDetails = () => {
    selectedWsPort.value = null
}

const clearSelectedWsMessages = () => {
    if (selectedWsPort.value === null) {
        return
    }
    $clearWebSocketDiagnostics?.(selectedWsPort.value)
    refreshGlobalWsStatuses()
}

const isEditableTarget = (target) => {
    if (!(target instanceof HTMLElement)) {
        return false
    }
    return target.matches('input, textarea, select, [contenteditable="true"]')
        || target.closest('input, textarea, select, [contenteditable="true"]') !== null
}

const handleWsStatusKeydown = (event) => {
    if (event.repeat || event.isComposing) {
        return
    }

    if (event.key === 'Escape' && selectedWsPort.value !== null) {
        event.preventDefault()
        closeWsDetails()
        return
    }

    if (event.key === 'Escape' && wsStatusDialog.value) {
        event.preventDefault()
        wsStatusDialog.value = false
        return
    }

    const isBackquote = event.code === 'Backquote' || event.key === '`'
    if (!isBackquote || isEditableTarget(event.target)) {
        return
    }

    event.preventDefault()
    wsStatusDialog.value = !wsStatusDialog.value
}

watch(wsStatusDialog, (isOpen) => {
    if (isOpen) {
        startWsStatusRefresh()
    } else {
        stopWsStatusRefresh()
        $setWebSocketDiagnosticsEnabled?.(false)
        closeWsDetails()
    }
})

useState('editTimehandleBarSwitch', () => null)
useHead({
    // script: [{
    //     src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.geometryutil.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/turf.min.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // { src: '/js/L.PixiOverlay.js' }, // 目前沒有用到pixijs
    // {
    //     src: '/js/crypto-js.min.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/leaflet.rotatedMarker.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/Leaflet.ImageOverlay.Rotated.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/Leaflet.GeotagPhoto.min.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // }]
});
// const locales = useLocales()
// const locale = useLocale()
// const date = useLocaleDate(new Date('2016-10-26'))
const items = reactive([
    {
        icon: "mdi-tooltip-image-outline",
        img: '/images/head-icon/fileMessage.svg',
        title: "home",
        to: "/",
        disabled: false,
        // permission: this.$auth.hasScope('user'),
    },
    {
        icon: "mdi-tooltip-image-outline",
        img: '/images/head-icon/fileMessage.svg',
        title: "設定",
        to: "/setting",
        disabled: false,
        // permission: this.$auth.hasScope('user'),
    },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/analyze.svg',
    //   title: "檢測分析",
    //   to: "/analyze",
    //   disabled: false
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/output.svg',
    //   title: "報告輸出",
    //   to: "/",
    //   disabled: true
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/stroy.svg',
    //   title: "檢測歷史",
    //   to: "/historyData",
    //   disabled: false,
    //   permission: this.$auth.hasScope('user'),
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/setting.svg',
    //   title: "基本設定",
    //   to: "/setup",
    //   disabled: false,
    //   permission: this.$auth.hasScope('user'),
    //   // permission: this.$auth.hasScope('louis'),
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/setting.svg',
    //   title: "權限設定",
    //   to: "/permission",
    //   disabled: false,
    //   permission: this.$auth.hasScope('admin'),
    // }
    {
        icon: "mdi-tooltip-image-outline",
        img: '/images/head-icon/fileMessage.svg',
        title: "setting",
        to: "/setting",
        disabled: false,
        // permission: this.$auth.hasScope('user'),
    },
])
const testclick = () => {
    console.log('click btn');
}
var ws9 = null
const fps = () => {
    if (ws9 !== null) {
        ws9.close()
        ws9 = null
    }
    ws9 = new WebSocket(`ws://localhost:8901/`);
    ws9.onopen = (e) => {
        console.log('(plugins)串流連接成功::8901');
    }
    // eslint-disable-next-line no-undef
    // var stats1 = new Stats();
    // stats1.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats1.dom);
    var index = 0
    function animate() {
        // stats1.begin();
        // monitored code goes here
        index++
        // stats1.end();
        requestAnimationFrame(animate);
    }
    setInterval(() => {
        // console.log(index);
        ws9.send(JSON.stringify({
            f: index
        }))
        index = 0
    }, 1000)
    requestAnimationFrame(animate);
}
const lows = () => {
    const stats = document.createElement('div');
    stats.style.position = 'fixed';
    stats.style.top = '10px';
    stats.style.left = '10px';
    stats.style.padding = '8px';
    stats.style.background = 'rgba(0, 0, 0, 0.7)';
    stats.style.color = 'white';
    stats.style.fontSize = '14px';
    stats.style.fontFamily = 'monospace';
    stats.style.zIndex = '1000';
    stats.style.borderRadius = '4px';
    // stats.style.display = 'none'; // 預設隱藏
    stats.style.zIndex = '9999';
    document.body.appendChild(stats);

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    stats.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();
    let frameTimes = [];
    let fps = 0;
    let lowFrametime = Infinity;
    let fpsHistory = [];
    let lowHistory = [];
    let shift1 = 100
    function update() {
        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;

        frameTimes.push(delta);
        if (frameTimes.length > shift1) frameTimes.shift();

        const avgFrametime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        fps = Math.round(1000 / avgFrametime);
        lowFrametime = Math.min(...frameTimes).toFixed(2);

        fpsHistory.push(fps);
        lowHistory.push(parseFloat(lowFrametime));
        if (fpsHistory.length > shift1) fpsHistory.shift();
        if (lowHistory.length > shift1) lowHistory.shift();

        stats.innerHTML = `<span style="color: lime;">FPS: ${fps}</span><br><span style="color: red;">Low Frametime: ${lowFrametime} ms</span><br>`;
        stats.appendChild(canvas);

        drawChart();
        requestAnimationFrame(update);
    }

    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        for (let i = 0; i < fpsHistory.length; i++) {
            const x = (i / fpsHistory.length) * canvas.width;
            const y = canvas.height - (fpsHistory[i] / 100 * canvas.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        for (let i = 0; i < lowHistory.length; i++) {
            const x = (i / lowHistory.length) * canvas.width;
            const y = canvas.height - (lowHistory[i] / 50 * canvas.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    update();
}
onMounted(() => {
    window.addEventListener('keydown', handleWsStatusKeydown)
    if (false) {
        // ===== 設定 =====
        const PRIMARY = "http://localhost:3000";
        const BACKUPS = [
            "http://192.168.0.173:3001",
            "http://192.168.0.67:3000",
            "http://192.168.0.68:3000"
        ];

        const CHECK_INTERVAL = 3000;
        const FAILURE_THRESHOLD = 2;
        const HEALTH_PATH = "/api/health";

        let failCount = 0;
        let mode = "primary";
        // primary = 我現在就是主要機
        // backup  = 我現在是備援機


        // ===== 取得目前所在 server =====
        const CURRENT = window.location.origin;
        if (CURRENT !== PRIMARY) {
            mode = "backup";
        }


        // ===== ping =====
        async function ping(url) {
            try {
                const res = await fetch(url + HEALTH_PATH);
                console.log('ping ok : ', mode);
                return res.ok;
            } catch (err) {
                console.log('ping fail : ', mode);
                return false;
            }
        }


        // ===== main loop =====
        async function monitor() {
            if (mode === "primary") {
                // 主機永遠不該跳備援（主機 localhost:3000 故障無意義）
                return;
            }

            if (mode === "backup") {
                // 在備援時：要監控 primary 是否恢復
                const alive = await ping(PRIMARY);

                if (alive) {
                    console.warn("Primary recovered. Switching back.");
                    window.location.href = PRIMARY;
                }
            }
        }


        // ===== 專門處理 failover（主機掛了時呼叫一次） =====
        async function failoverToBackup() {
            for (const b of BACKUPS) {
                const ok = await ping(b);
                if (ok) {
                    console.warn("Switching to backup:", b);
                    window.location.href = b;
                    return;
                }
            }

            console.error("No backup server available!");
        }


        // ===== 主機掛掉後才要做 failover (發生在 primary 時) =====
        async function monitorPrimary() {
            if (window.location.origin !== PRIMARY) return;

            const alive = await ping(PRIMARY);

            if (!alive) {
                failCount++;

                if (failCount >= FAILURE_THRESHOLD) {
                    await failoverToBackup();
                }
            } else {
                failCount = 0;
            }
        }


        // ===== 啟動 =====

        if (CURRENT === PRIMARY) {
            setInterval(monitorPrimary, CHECK_INTERVAL);
        } else {
            setInterval(monitor, CHECK_INTERVAL);
        }
    }
})
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleWsStatusKeydown)
    stopWsStatusRefresh()
    $setWebSocketDiagnosticsEnabled?.(false)
})
</script>
<style scoped>
.ws-status-dialog {
    z-index: 9999;
}

.ws-status-screen {
    min-height: 100vh;
    color: #e2e8f0;
    background:
        radial-gradient(circle at 10% 0%, rgb(37 99 235 / 22%), transparent 34%),
        radial-gradient(circle at 95% 100%, rgb(14 165 233 / 14%), transparent 38%),
        #0b1220;
}

.ws-status-header {
    min-height: 112px;
    padding: 24px clamp(24px, 4vw, 64px);
    border-bottom: 1px solid rgb(148 163 184 / 18%);
    background: rgb(15 23 42 / 78%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}

.ws-status-eyebrow {
    margin-bottom: 4px;
    color: #38bdf8;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .18em;
}

.ws-status-title {
    margin: 0;
    color: #f8fafc;
    font-size: clamp(24px, 2.3vw, 36px);
    font-weight: 700;
    line-height: 1.2;
}

.ws-status-subtitle {
    margin-top: 7px;
    color: #94a3b8;
    font-size: 14px;
}

.ws-status-content {
    width: min(1440px, 100%);
    margin: 0 auto;
    padding: clamp(24px, 4vw, 56px) !important;
}

.ws-status-summary {
    margin-bottom: 28px;
    display: grid;
    grid-template-columns: minmax(180px, .65fr) repeat(2, minmax(240px, 1fr));
    gap: 16px;
}

.ws-summary-card {
    min-height: 112px;
    padding: 20px 24px;
    border: 1px solid rgb(148 163 184 / 16%);
    border-radius: 14px;
    background: rgb(30 41 59 / 72%);
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.ws-summary-label {
    margin-bottom: 8px;
    color: #94a3b8;
    font-size: 13px;
}

.ws-summary-value {
    color: #f8fafc;
    font-size: 34px;
    font-weight: 700;
    line-height: 1;
}

.ws-summary-value span {
    color: #64748b;
    font-size: 18px;
    font-weight: 500;
}

.ws-summary-value-online {
    color: #4ade80;
}

.ws-summary-host {
    overflow-wrap: anywhere;
    color: #e2e8f0;
    font-family: Consolas, Monaco, monospace;
    font-size: 17px;
}

.ws-status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.ws-status-item {
    min-width: 0;
    padding: 22px 24px;
    border: 1px solid rgb(148 163 184 / 16%);
    border-radius: 14px;
    background: rgb(15 23 42 / 82%);
    box-shadow: 0 12px 30px rgb(0 0 0 / 16%);
    cursor: pointer;
    transition: border-color .2s, background .2s, transform .2s;
}

.ws-status-item:hover,
.ws-status-item:focus-visible {
    border-color: rgb(56 189 248 / 48%);
    background: rgb(22 34 55 / 94%);
    outline: none;
    transform: translateY(-2px);
}

.ws-status-item-top,
.ws-port-group {
    display: flex;
    align-items: center;
}

.ws-status-item-top {
    margin-bottom: 20px;
    justify-content: space-between;
    gap: 16px;
}

.ws-port-group {
    gap: 14px;
}

.ws-status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 16px currentColor;
}

.ws-port-label {
    color: #64748b;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .14em;
}

.ws-port-number {
    color: #f8fafc;
    font-family: Consolas, Monaco, monospace;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.05;
}

.ws-status-chip {
    min-width: 78px;
    font-weight: 700;
    justify-content: center;
}

.ws-status-details {
    margin: 0;
    display: grid;
    gap: 12px;
}

.ws-status-details>div {
    min-width: 0;
    padding-top: 12px;
    border-top: 1px solid rgb(148 163 184 / 12%);
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 12px;
}

.ws-status-details dt {
    color: #64748b;
    font-size: 12px;
}

.ws-status-details dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
    color: #cbd5e1;
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
}

.ws-status-card-hint {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid rgb(148 163 184 / 12%);
    color: #64748b;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 12px;
}

.ws-status-card-hint>span:last-child {
    color: #38bdf8;
    display: flex;
    align-items: center;
}

.ws-detail-layer {
    position: fixed;
    inset: 0;
    z-index: 10;
    background: rgb(2 6 23 / 62%);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: flex-end;
}

.ws-detail-panel {
    width: min(980px, 92vw);
    height: 100vh;
    border-left: 1px solid rgb(148 163 184 / 20%);
    color: #e2e8f0;
    background: #0b1220;
    box-shadow: -24px 0 70px rgb(0 0 0 / 35%);
    display: flex;
    flex-direction: column;
}

.ws-detail-header {
    min-height: 92px;
    padding: 18px 24px;
    border-bottom: 1px solid rgb(148 163 184 / 16%);
    background: #111c2f;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.ws-detail-heading {
    display: flex;
    align-items: center;
    gap: 10px;
}

.ws-detail-heading h2 {
    margin: 2px 0 0;
    color: #f8fafc;
    font-family: Consolas, Monaco, monospace;
    font-size: 26px;
    line-height: 1.1;
}

.ws-detail-body {
    min-height: 0;
    padding: 24px;
    overflow-y: auto;
}

.ws-detail-summary {
    margin-bottom: 16px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.ws-detail-summary>div {
    min-width: 0;
    padding: 16px 18px;
    border: 1px solid rgb(148 163 184 / 14%);
    border-radius: 10px;
    background: #111c2f;
}

.ws-detail-summary span {
    color: #64748b;
    display: block;
    font-size: 12px;
}

.ws-detail-summary strong {
    margin-top: 4px;
    color: #f8fafc;
    display: block;
    font-family: Consolas, Monaco, monospace;
    font-size: 24px;
}

.ws-detail-summary .ws-send-text {
    color: #38bdf8;
}

.ws-detail-summary .ws-receive-text {
    color: #4ade80;
}

.ws-listener-note {
    margin-bottom: 22px;
    padding: 10px 12px;
    border: 1px solid rgb(56 189 248 / 16%);
    border-radius: 8px;
    color: #7dd3fc;
    background: rgb(14 165 233 / 8%);
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    line-height: 1.55;
}

.ws-message-section {
    min-height: 300px;
}

.ws-message-toolbar {
    margin-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 18px;
}

.ws-message-toolbar h3 {
    margin: 0;
    color: #f8fafc;
    font-size: 18px;
}

.ws-message-toolbar>div>span {
    margin-top: 3px;
    color: #64748b;
    display: block;
    font-size: 12px;
}

.ws-message-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.ws-message-filters {
    padding: 3px;
    border: 1px solid rgb(148 163 184 / 14%);
    border-radius: 7px;
    background: #111827;
    display: flex;
}

.ws-message-filters button {
    min-width: 54px;
    padding: 5px 10px;
    border: 0;
    border-radius: 5px;
    color: #64748b;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
}

.ws-message-filters button.active {
    color: #e0f2fe;
    background: #075985;
}

.ws-message-list {
    display: grid;
    gap: 9px;
}

.ws-message-entry {
    border: 1px solid rgb(148 163 184 / 14%);
    border-radius: 9px;
    background: #0f192a;
    overflow: hidden;
}

.ws-message-entry[open] {
    border-color: rgb(56 189 248 / 26%);
}

.ws-message-entry summary {
    min-height: 48px;
    padding: 10px 14px;
    color: #94a3b8;
    cursor: pointer;
    display: grid;
    grid-template-columns: 78px 78px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    list-style: none;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
}

.ws-message-entry summary::-webkit-details-marker {
    display: none;
}

.ws-direction-badge {
    width: 72px;
    padding: 3px 7px;
    border-radius: 5px;
    text-align: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .06em;
}

.ws-direction-badge.is-send {
    color: #7dd3fc;
    background: rgb(14 165 233 / 16%);
}

.ws-direction-badge.is-receive {
    color: #86efac;
    background: rgb(34 197 94 / 16%);
}

.ws-message-route {
    min-width: 0;
    overflow: hidden;
    color: #cbd5e1;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ws-message-size {
    color: #64748b;
    text-align: right;
}

.ws-message-meta {
    padding: 8px 14px;
    border-top: 1px solid rgb(148 163 184 / 10%);
    color: #64748b;
    background: rgb(2 6 23 / 30%);
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-family: Consolas, Monaco, monospace;
    font-size: 11px;
}

.ws-message-entry pre {
    max-height: 360px;
    margin: 0;
    padding: 14px;
    overflow: auto;
    color: #dbeafe;
    background: #060c17;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.ws-message-empty {
    min-height: 240px;
    border: 1px dashed rgb(148 163 184 / 18%);
    border-radius: 10px;
    color: #475569;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    text-align: center;
}

.ws-message-empty strong {
    color: #94a3b8;
    font-size: 14px;
}

.ws-message-empty span {
    font-size: 12px;
}

.ws-detail-enter-active,
.ws-detail-leave-active {
    transition: opacity .2s;
}

.ws-detail-enter-active .ws-detail-panel,
.ws-detail-leave-active .ws-detail-panel {
    transition: transform .2s ease;
}

.ws-detail-enter-from,
.ws-detail-leave-to {
    opacity: 0;
}

.ws-detail-enter-from .ws-detail-panel,
.ws-detail-leave-to .ws-detail-panel {
    transform: translateX(40px);
}

.ws-status-footer {
    margin-top: 30px;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 7px;
    font-size: 13px;
}

.ws-status-footer kbd {
    min-width: 30px;
    padding: 3px 8px;
    border: 1px solid #475569;
    border-bottom-width: 2px;
    border-radius: 5px;
    color: #cbd5e1;
    background: #1e293b;
    font-family: Consolas, Monaco, monospace;
    text-align: center;
}

@media (max-width: 760px) {
    .ws-status-header {
        min-height: 96px;
        padding: 18px 20px;
    }

    .ws-status-subtitle {
        display: none;
    }

    .ws-status-content {
        padding: 20px !important;
    }

    .ws-status-summary,
    .ws-status-grid {
        grid-template-columns: 1fr;
    }

    .ws-summary-card {
        min-height: 92px;
    }

    .ws-status-details>div {
        grid-template-columns: 1fr;
        gap: 4px;
    }

    .ws-detail-panel {
        width: 100vw;
    }

    .ws-detail-body {
        padding: 16px;
    }

    .ws-detail-summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ws-message-toolbar {
        align-items: stretch;
        flex-direction: column;
    }

    .ws-message-actions {
        justify-content: space-between;
    }

    .ws-message-entry summary {
        grid-template-columns: 72px 70px minmax(0, 1fr);
    }

    .ws-message-size {
        display: none;
    }
}

.ffffont {
    color: #fff !important;
}

.container-custom {
    position: absolute;
    max-width: 100%;
    width: 100%;
    height: 100%;
    background-image: url('/bgimg.png');
    background-repeat: no-repeat;
    background-size: cover;
}

.test001111 {
    position: fixed;
    left: 100%;
    top: 100%;
    width: 30px;
    height: 30px;
    background-color: #000;
    transform: translate(-30px, -30px);
    transition: all .3s;
    z-index: 99;
}

.test001111:hover {
    width: 300px;
    height: 300px;
    transform: translate(-300px, -300px);
}
</style>
<style>
.div-point {
    background-color: #fff;
    width: 22px;
    height: 22px;
    border-radius: 24px;
    border: 1px #000 solid;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    transform: translate(2px, -11px);
}

.spot-div-number {
    background-color: #fff;
    width: fit-content;
    height: 22px;
    border-radius: 24px;
    /* border: 1px #000 solid; */
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1em;
    /* transform: translate(-23px, -29px); */
    /* transform: translate(-26%, -46px);*/
    transform: translate(-5%, -39px);
    padding: .0em .3em;
    color: #565656;
}

.temperature-bar-bubble-number {
    /* position: absolute;
    left: 50%;
    top: 56%;
    transform: translate(-50%, -50%); */
    color: #000000;
    position: absolute;
    right: 0;
    top: 56%;
    /* transform: translate(90%, -50%); */
    transform: translate(109%, -28%);
    font-size: 17px;
    text-shadow: 1px 0px 0px rgb(255, 255, 0), 0px 1px 0px rgb(255, 255, 0), -1px 0px 0px rgb(255, 255, 0), 0px -1px 0px rgb(255, 255, 0),
        0px 0px 2px rgb(255, 255, 0);
    pointer-events: none;
}

.alarm-point {
    width: 10px;
    height: 10px;
    border-radius: 10px;
    /* transform: translate(-22px, -30px); */
    transform: translate(-16px, -23px);
}

.P-ADFF00 {
    background-color: #ADFF00;
}

.P-FFDD28 {
    background-color: #FFDD28;
}

.P-FF0909 {
    background-color: #FF0909;
}

.P-FF7223 {
    background-color: #FF7223;
}

.c-meun-treeview-item {
    box-shadow: 1px 1px 7px 0px #00000061;
}

.c-meun-treeview {
    padding: .50em;
    background: #fff;
    transition: background .2s;
    cursor: pointer;
}

.c-meun-treeview:hover {
    background: #e4e4e4;
}

.c-meun-treeview:active {
    background: #c7c7c7;
}

.page-enter-active,
.page-leave-active {
    transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}

/* * {
    user-select: none;
} */

html {
    overflow-y: hidden;
}

.switch-field {
    display: flex;
    margin-bottom: 36px;
    overflow: hidden;
}

.switch-field input {
    position: absolute !important;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    width: 1px;
    border: 0;
    overflow: hidden;
}

.switch-field label {
    /* 	background-color: #e4e4e4; */
    font-size: 9px;
    line-height: 1;
    text-align: center;
    padding: 8px 16px;
    margin-right: -1px;
    border: 1px solid rgba(0, 0, 0, 0.102);
    /* 	box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.1); */
    transition: all 0.3s ease-in-out;
    color: rgba(0, 0, 0, 0.102);
    font-size: 9px;
}

.switch-field label:hover {
    cursor: pointer;
}

.switch-field input:checked+label {
    background-color: white;
    box-shadow: none;
    color: #4f5e62;
    border: 1px solid #4f5e62;
}

.switch-field label:first-of-type {
    border-radius: 4px 0 0 4px;
}

.switch-field label:last-of-type {
    border-radius: 0 4px 4px 0;
}

.frame-hard-cam {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    /* width: 106px; */
    justify-content: space-between;
}

.frame-hard-cam-status {
    width: 15px;
    height: 15px;
    border-radius: 15px;
    background-color: #8ab284;
}

.frame-hard-cam-log {
    max-height: 268px;
    overflow-y: scroll;
}

.frame-hard-cam-log>div {
    background-color: #f0f2f3;
    font-size: 14px;
    color: #4f5e62;
}

.frame-hard-setting div {
    font-size: 14px;
}

.frame-hard-btu {
    cursor: pointer;
}

.frame-content {
    border: 1px solid #d7dbdc;
    border-radius: 8px;
}

.frame-content>div {
    border-bottom: 1px solid #d7dbdc;
    display: grid;
    grid-template-columns: 110px 35px;
}

.frame-content>div:last-child {
    border-bottom: 0px solid #d7dbdc;
}

.frame-content input::-webkit-outer-spin-button,
.frame-content input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.openedit {
    border: 1px solid #d9d9d9 !important;
    border-radius: 5px !important;
}

.reset-btn {
    background-color: white;
    border: 2px solid #ccc;
    border-radius: 5px;
    padding: 8px;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    /* 設置按鈕大小 */
    height: 32px;
}

.reset-btn img {
    width: 26px;
    height: 26px;
    opacity: 0.7;
}

.reset-btn123 {
    background-color: white;
    border: 2px solid #ccc;
    border-radius: 5px;
    padding: 8px;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    /* 設置按鈕大小 */
    height: 32px;
    position: absolute;
    right: 5px;
    bottom: 5px;
}

.reset-btn123 img {
    width: 26px;
    height: 26px;
    opacity: 0.7;
}

.hidden {
    display: none;
}

.el-display * {
    visibility: hidden;
    pointer-events: none;
}

.hidden-btn {
    visibility: hidden;
    pointer-events: none;
    position: fixed;
    top: -100000px;
    left: -10000px;
}

.camera-pr-canvas {
    width: 440px;
    box-shadow: 0px 0px 4px 2px #00000038;
    min-height: 100px;
    background-color: #FFF;
}

.camera-pr-title {
    line-height: 2.1;
    color: #444;
}

.camera-pr-content-title {
    color: #5F5F5F;
}

.camera-pr-content-btn {
    background-color: #5C9ACC;
    color: #fff;
    padding: 0.1em 1.0em;
    cursor: pointer;
    transition: background-color .1s;
    border-radius: 1px;
    height: 27px;
}

.camera-pr-content-btn:hover {
    background-color: #4e94ce;
}

.camera-pr-content-btn:active {
    background-color: #228ce2;
}

#fov-input div {
    /* height: 20px !important; */
    /* padding: 0px; */
}

#fov-input input {
    min-height: 20px !important;
    padding: 0px !important;
}

#fov-input123 input {
    min-height: 20px !important;
    padding: 0px !important;
    color: #000 !important;
    border: 1px solid !important;
}

.patrol-puse-control-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #00000023;
}

.patrol-puse-control {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffffc9;
    text-align: center;
    width: 300px;
    height: 120px;
    opacity: 1;
    color: #9D9D9D;
    font-size: 18px;
}

.checkChangeBoxDiv-btn {
    background-color: #fff;
    display: flex;
    width: fit-content;
    padding: 0em 0.5em;
    pointer-events: none;
}

.ptz-input-grid .v-field {
    height: 30px;
}

.ptz-input-grid .v-field input {
    padding: 0px 3px !important;
    min-height: 30px !important;
}

/* input {
    user-select: text !important;
} */
</style>
