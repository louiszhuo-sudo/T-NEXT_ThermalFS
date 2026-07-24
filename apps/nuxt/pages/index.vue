<template>
    <!-- test git checkout -b mailiao -->
    <div class="windows" @mousemove="mousemove" @mouseup="mouseup">
        <template v-if="state.loading">
            <div style="width: 100vw;height: 100vh;">
                <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);text-align: center;">
                    <v-progress-circular model-value="20" :size="128" :width="12" indeterminate></v-progress-circular>
                    <div class="pt-4">初始化</div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="item-card-content-window" :class="state.pageItems.length > 0 ? '' : 'bg-f1f1f1ba'"
                style="overflow: hidden;font-size: 12px;">
                <div class="d-flex header-left-actions">
                    <div class="d-flex def-point-btn" @click="state.menu = !state.menu">
                        <div class="def-point-grid pa-1" style="pointer-events: none;">
                            <button>
                                <NuxtImg src="/images/icon/menufs-meun.svg" width="30" />
                            </button>
                        </div>
                    </div>
                    <div class="d-flex def-point-btn">
                        <!-- <NuxtLink to="setting"> -->
                        <a href="/setting">
                            <div class="def-point-grid pa-1" style="pointer-events: none;">
                                <button>
                                    <NuxtImg src="/images/icon/icon_pop upsetup.svg" width="30" />
                                </button>
                            </div>
                        </a>
                        <!-- </NuxtLink> -->
                    </div>
                </div>
                <div ref="tabScrollRef" class="tab-scroll" @wheel="scrollTabs">
                    <div class="tab-list" :style="{ '--tab-item-width': `${tabItemWidth}px` }">
                        <template v-if="state.pageItems.length > 0">
                            <div class="d-flex def-point-item" v-for="(item, index) in state.pageItems" :key="item.id"
                                @mousedown="(e) => mousedown(e, item.name, item.id)" @mouseover="mouseover"
                                @mouseleave="mouseleave" :data-index="index" data-type="pathItem"
                                :class="item.name === state.page ? 'active-tag' : ''">
                                <div class="def-point-grid pa-1" style="pointer-events: none;">
                                    <NuxtImg class="tab-item-icon" src="/images/icon/icon_pop upcomput-c.svg" width="15" />
                                    <div class="def-point-conent">
                                        <div class="def-point-name">{{ item.name }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <!-- <div class="d-flex ml-1 mt-1 def-point-btn" @click="state.dialog = true">
                <div class="def-point-grid pa-1" style="pointer-events: auto;">
                    <div>
                        <img src="/images/icon/icon_pop upaddpage.svg" width="27"></img>
                    </div>
                </div>
            </div> -->
                <!-- side D 視窗-->
                <div class="d-flex header-right-actions">
                    <div style="width: 150px;">
                        <v-select v-model="state.viewMode" density="compact" hide-details details
                            :items="state.viewModeItems" @update:modelValue="updataSelectMode"></v-select>
                    </div>
                    <v-btn icon="mdi-account-circle" variant="text" style="margin-top: -5px"
                        id="menu-activator1sdlr"></v-btn>
                    <v-menu activator="#menu-activator1sdlr">
                        <v-list>
                            <v-list-item>
                                <v-list-item-title>HI , {{ user.name }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="logout">
                                <v-list-item-title>登出</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <v-btn class="water-cannon-trigger" variant="text" aria-label="開啟水砲控制"
                        @click="waterCannonDialog = true">
                        <img src="/images/fs/water-cannon.png" alt="水砲控制" />
                    </v-btn>
                    <v-btn class="header-notification-trigger" icon variant="text" color="black"
                        @click="openSideD()" style="margin-top: -5px">
                        <v-badge :color="alertNumber !== 0 ? 'error' : 'transparent'" style="color:transparent"
                            :content="alertNumber">
                            <v-icon color="black">mdi-bell</v-icon>
                        </v-badge>
                    </v-btn>
                </div>
                <!-- side D 視窗 -->
                <!-- {{ user }} -->
                <!-- <h2 v-if="loggedIn">
                <v-btn @click="logout">登出</v-btn>
            </h2> -->
            </div>
            <div id="temp-copy-object"></div>
            <div class="t-content-grid" style="height: calc(100% - 36px)"
                :style="state.menu ? 'grid-template-columns: 18.5% 81.5%;' : 'grid-template-columns: 0% 100%;'">
                <div class="t-meun" :style="state.menu ? 'opacity: 1;' : 'opacity: 0;'">
                    <!-- side A 視窗-->
                    <ClientOnly>
                        <!-- 這邊暫時關掉 -->
                        <SideWindowsSideAB></SideWindowsSideAB>
                    </ClientOnly>
                    <!-- side A 視窗-->
                </div>
                <div style="height: 100%;width:100%;font-size: 12px;position: relative;overflow: hidden;"
                    class="scrollable-container">
                    <div style="width:100%;height:100%">
                        <!-- <MapDefault ref="mapImport1" :formtData="state" :mainMode="state.mainMode"
                                        @dataFromChild="handleDataFromChild" /> -->
                        <ClientOnly>
                            <Cctv @cctvToMapMain="cctvToMapMain" @cctvToMapMainCamid="cctvToMapMainCamid"
                                ref="cctvRefe2" :formtData="state" :tabId="state.focusTabId"
                                v-if="state.focusTabId !== null" />
                        </ClientOnly>
                    </div>
                    <!-- <div v-for="(item, index) in state.pageItems" style="width: 100%;height: 100%"
                        :class="`a-tab-a${index}`"> -->
                    <!-- position: absolute;top: 0;left: 0;transition: 0.1s !important; -->
                    <!-- :class="state.page === item.name ? 'tab-auto' : 'tab-hidde'" -->
                    <!-- <template v-if="item.to === 'map'"> -->
                    <!-- <template v-if="state.page === 'map'">  如果要暫存請使用item 反之請使用state -->
                    <!-- <div style="width:100%;height:100%"> -->
                    <!-- <MapDefault ref="mapImport1" :formtData="state" :mainMode="state.mainMode"
                                        @dataFromChild="handleDataFromChild" /> -->
                    <!-- <MapMain :camID="item.camID" :camType="state.selectMainPage.type" @toTab="cctvToMapMain"
                                :ref="(e) => addMainref(e, index)" /> -->
                    <!-- </div>
                    </template> -->
                    <!-- <template v-if="item.to === 'home'"> -->
                    <!-- <template v-else-if="item.to === 'home'"> -->

                    <!-- </template> -->
                    <!-- </div> -->
                </div>
            </div>
            <v-dialog v-model="state.dialog" max-width="400" persistent>
                <!-- <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps">
                    Open Dialog
                </v-btn>
            </template> -->

                <v-card prepend-icon="mdi-open-in-new" title="你要新增嗎?">
                    <v-card-text class="bg-surface-light pt-4">
                        <v-text-field label="視窗名稱" v-model="state.windowName"></v-text-field>
                        <v-select label="Select" v-model="state.addWindow" :items="state.addWindowItems"></v-select>
                    </v-card-text>
                    <template v-slot:actions>
                        <v-spacer></v-spacer>

                        <v-btn @click="state.dialog = false, state.windowName = ''">
                            取消
                        </v-btn>

                        <v-btn @click="pagePush()">
                            新增
                        </v-btn>
                    </template>
                </v-card>
            </v-dialog>
        </template>
        <v-dialog v-model="state.dialogpwd" width="400">
            <v-card>
                <v-card-title class="text-h6">工程模式</v-card-title>

                <v-card-text>
                    <v-text-field v-model="state.password" label="密碼" type="password" @keydown.enter="checkPassword"
                        autofocus />
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="checkPassword">解鎖</v-btn>
                    <v-btn @click="state.dialogpwd = false, state.password = null, state.viewMode = 0">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="waterCannonDialog" class="water-cannon-dialog-shell" width="1434"
            max-width="calc(100vw - 48px)" scrollable>
            <v-card class="water-cannon-dialog">
                <div class="water-cannon-dialog__header">
                    <div>
                        <h2>水砲控制</h2>
                        <p>即時控制與影像預覽</p>
                    </div>
                    <v-btn icon="mdi-close" variant="text" aria-label="關閉水砲控制"
                        @click="waterCannonDialog = false" />
                </div>

                <v-card-text class="water-cannon-dialog__body">
                    <div class="water-cannon-preview-section">
                        <div class="water-cannon-preview-grid">
                            <div v-for="preview in waterCannonPreviews" :key="preview.label"
                                class="water-cannon-preview">
                                <ClientOnly>
                                    <MapOnlyvideo v-if="waterCannonDialog" class="water-cannon-preview__video"
                                        :stream-url="preview.stream" :camID="preview.id" :camType="preview.type" />
                                </ClientOnly>
                            </div>
                        </div>
                        <div class="water-cannon-preview-actions">
                            <span :class="{ 'water-cannon-countdown--empty': waterCannonCountdown <= 0 }">{{
                                waterCannonCountdown > 0
                                ? `倒數 ${waterCannonCountdown} 秒後，自動啟動水砲`
                                : '--' }}</span>
                            <v-btn v-if="waterCannonCountdown > 0" color="#ff6868" variant="flat"
                                @click="triggerWaterCannon">立即啟動</v-btn>
                        </div>
                    </div>

                    <div class="water-cannon-controls">
                        <label>
                            <span>水砲</span>
                            <v-select v-model="waterCannonId" density="compact" hide-details :items="waterCannonIds"
                                @update:model-value="selectWaterCannon" />
                        </label>
                        <label>
                            <span>模式</span>
                            <v-select v-model="waterCannonMode" class="water-cannon-state-select"
                                :class="waterCannonMode === '自動' ? 'is-green' : 'is-red'" density="compact"
                                hide-details :items="waterCannonModes" @update:model-value="setWaterCannonMode">
                                <template #item="{ props, item }">
                                    <v-list-item v-bind="props" class="water-cannon-select-option"
                                        :class="item.raw === '自動' ? 'is-green' : 'is-red'" />
                                </template>
                            </v-select>
                        </label>
                        <label>
                            <span>閘門</span>
                            <v-select v-model="waterCannonGate" class="water-cannon-state-select"
                                :class="waterCannonGate === '開' ? 'is-red' : 'is-green'" density="compact"
                                hide-details :items="waterCannonGates" :disabled="waterCannonMode === '自動'"
                                @update:model-value="setWaterCannonGate">
                                <template #item="{ props, item }">
                                    <v-list-item v-bind="props" class="water-cannon-select-option"
                                        :class="item.raw === '開' ? 'is-red' : 'is-green'" />
                                </template>
                            </v-select>
                        </label>

                        <div class="water-cannon-direction">
                            <span>方向控制</span>
                            <div class="direction-pad" :class="{ 'is-disabled': waterCannonMode === '自動' }">
                                <v-btn class="direction-pad__up" icon="mdi-chevron-up" variant="tonal"
                                    :class="{ 'is-keyboard-pressed': activeWaterCannonDirections.includes('上') }"
                                    :disabled="waterCannonMode === '自動'"
                                    @pointerdown="startWaterCannonDirection('上')"
                                    @pointerup="stopWaterCannonDirection('上')"
                                    @pointerleave="stopWaterCannonDirection('上')" />
                                <v-btn class="direction-pad__left" icon="mdi-chevron-left" variant="tonal"
                                    :class="{ 'is-keyboard-pressed': activeWaterCannonDirections.includes('左') }"
                                    :disabled="waterCannonMode === '自動'"
                                    @pointerdown="startWaterCannonDirection('左')"
                                    @pointerup="stopWaterCannonDirection('左')"
                                    @pointerleave="stopWaterCannonDirection('左')" />
                                <v-btn class="direction-pad__down" icon="mdi-chevron-down" variant="tonal"
                                    :class="{ 'is-keyboard-pressed': activeWaterCannonDirections.includes('下') }"
                                    :disabled="waterCannonMode === '自動'"
                                    @pointerdown="startWaterCannonDirection('下')"
                                    @pointerup="stopWaterCannonDirection('下')"
                                    @pointerleave="stopWaterCannonDirection('下')" />
                                <v-btn class="direction-pad__right" icon="mdi-chevron-right" variant="tonal"
                                    :class="{ 'is-keyboard-pressed': activeWaterCannonDirections.includes('右') }"
                                    :disabled="waterCannonMode === '自動'"
                                    @pointerdown="startWaterCannonDirection('右')"
                                    @pointerup="stopWaterCannonDirection('右')"
                                    @pointerleave="stopWaterCannonDirection('右')" />
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
        <div ref="tabMeasureRef" class="tab-width-measurer" aria-hidden="true">
            <span v-for="item in state.pageItems" :key="item.id" class="def-point-name">{{ item.name }}</span>
        </div>
        <v-navigation-drawer v-model="drawer2" location="right" temporary width="330">
            <client-only>
                <!-- 這邊暫時關掉 -->
                <SideWindowsSideD @update="cctvToMapMainCamidSidD" @update2="autoUpdate"></SideWindowsSideD>
            </client-only>
        </v-navigation-drawer>
    </div>
</template>
<script setup>
import { reloadNuxtApp } from '#app'

const { $jwtAuth, $getIpaddress } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { user, loggedIn } = useJwtAuth()
const cctvRefe2 = ref('')
definePageMeta({
    middleware: ['auth']
})

async function logout() {
    try {
        await $jwtAuth.logout()
    } catch (e) {
        // your error handling
    }
}


const handleReload = () => {
    reloadNuxtApp()
}

//Side D 視窗
const drawer2 = ref(false)
function openSideD() {
    drawer2.value = !drawer2.value;
}
const alertNumber = ref(0);
const parentData = ref('');
const mainRef = ref([]);
const waterCannonDialog = ref(false)
const waterCannonId = ref('1')
const waterCannonMode = ref('手動')
const waterCannonGate = ref('關')
const waterCannonCountdown = ref(20)
const activeWaterCannonDirections = ref([])
const waterCannonStatuses = ref({})
const waterCannonIds = computed(() => {
    const ids = Object.keys(waterCannonStatuses.value)
        .sort((left, right) => Number(left) - Number(right))
    return ids.length ? ids : ['1']
})
const waterCannonModes = ['自動', '手動']
const waterCannonGates = ['關', '開']
const waterCannonPreviews = [
    { id: 'water-cannon-ir1', type: 'ir', label: '熱像 1', stream: 'rtsp://localhost:8889/video/realtime/ir1' },
    { id: 'water-cannon-vis1', type: 'vis', label: '可見光 1', stream: 'rtsp://localhost:8889/video/realtime/vis1' },
    { id: 'water-cannon-ir2', type: 'ir', label: '熱像 2', stream: 'rtsp://localhost:8889/video/realtime/ir2' },
    { id: 'water-cannon-vis2', type: 'vis', label: '可見光 2', stream: 'rtsp://localhost:8889/video/realtime/vis2' }
]
const waterCannonDirectionValueMap = {
    左: 1,
    右: 2,
    上: 3,
    下: 4
}
let waterCannonStatusSocket = null
let waterCannonStatusReconnectTimer = null
const createWaterCannonSession = () => Math.random().toString(36).slice(2)
const syncSelectedWaterCannonStatus = () => {
    const status = waterCannonStatuses.value[waterCannonId.value]
    if (!status) {
        return
    }

    if (status.waterJet_guide_mode !== undefined) {
        waterCannonMode.value = Number(status.waterJet_guide_mode) === 1 ? '自動' : '手動'
    }
    if (status.waterJet_gate_status !== undefined) {
        waterCannonGate.value = Number(status.waterJet_gate_status) === 1 ? '開' : '關'
    }
    if (status.waterJet_countdown !== undefined && Number.isFinite(Number(status.waterJet_countdown))) {
        waterCannonCountdown.value = Number(status.waterJet_countdown)
    }
}
const applyWaterCannonStatus = (content = {}) => {
    const statuses = content.waterJet_id !== undefined
        ? [content]
        : Object.values(content).filter((status) => status?.waterJet_id !== undefined)

    if (!statuses.length) {
        return
    }

    waterCannonStatuses.value = {
        ...waterCannonStatuses.value,
        ...Object.fromEntries(statuses.map((status) => [String(status.waterJet_id), status]))
    }

    if (!waterCannonStatuses.value[waterCannonId.value]) {
        waterCannonId.value = String(statuses[0].waterJet_id)
    }
    syncSelectedWaterCannonStatus()
}
const selectWaterCannon = (waterJetId) => {
    activeWaterCannonDirections.value = []
    waterCannonId.value = String(waterJetId)
    syncSelectedWaterCannonStatus()
}
const scheduleWaterCannonStatusReconnect = () => {
    if (waterCannonStatusReconnectTimer || !waterCannonDialog.value) {
        return
    }

    waterCannonStatusReconnectTimer = setTimeout(() => {
        waterCannonStatusReconnectTimer = null
        connectWaterCannonStatusSocket()
    }, 3000)
}
const connectWaterCannonStatusSocket = () => {
    if (!import.meta.client || waterCannonStatusSocket?.readyState === WebSocket.OPEN || waterCannonStatusSocket?.readyState === WebSocket.CONNECTING) {
        return
    }

    waterCannonStatusSocket = new WebSocket(`ws://${$getIpaddress()}:8710/`)
    waterCannonStatusSocket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data)
            const statusContent = message.content || message
            const hasWaterCannonStatus = statusContent.waterJet_id !== undefined
                || Object.values(statusContent).some((status) => status?.waterJet_id !== undefined)
            if (message.feature === 'waterJet' || hasWaterCannonStatus) {
                applyWaterCannonStatus(statusContent)
            }
        } catch {
            // Ignore non-JSON messages from the status server.
        }
    }
    waterCannonStatusSocket.onclose = () => {
        waterCannonStatusSocket = null
        scheduleWaterCannonStatusReconnect()
    }
}
const closeWaterCannonStatusSocket = () => {
    if (waterCannonStatusReconnectTimer) {
        clearTimeout(waterCannonStatusReconnectTimer)
        waterCannonStatusReconnectTimer = null
    }
    if (waterCannonStatusSocket) {
        waterCannonStatusSocket.onclose = null
        waterCannonStatusSocket.close()
        waterCannonStatusSocket = null
    }
}
const sendWaterCannonCommand = (method, content = {}) => {
    const controlSocket = $webSocketconnect03()
    if (controlSocket?.readyState === WebSocket.OPEN) {
        controlSocket.send(JSON.stringify({
            feature: 'waterJet',
            method,
            session: createWaterCannonSession(),
            content
        }))
        return true
    }
    return false
}
const setWaterCannonMode = (mode) => {
    if (mode === '自動') {
        clearActiveWaterCannonDirection()
    }
    sendWaterCannonCommand('set_waterJet_guide_mode', {
        waterJet_id: Number(waterCannonId.value),
        waterJet_guide_mode: mode === '自動' ? 1 : 2
    })
}
const setWaterCannonGate = (gate) => {
    sendWaterCannonCommand('set_waterJet_gate', {
        waterJet_id: Number(waterCannonId.value),
        waterJet_gate_status: gate === '開' ? 1 : 0
    })
}
const triggerWaterCannon = () => {
    sendWaterCannonCommand('set_waterJet_manualTrigger', {
        waterJet_id: Number(waterCannonId.value)
    })
}
const syncWaterCannonDirection = () => {
    const lastDirection = activeWaterCannonDirections.value.at(-1)
    if (!lastDirection) {
        return
    }
    sendWaterCannonCommand('set_waterJet_continuousMove', {
        waterJet_id: Number(waterCannonId.value),
        waterJet_continuousMove: waterCannonDirectionValueMap[lastDirection]
    })
}
const startWaterCannonDirection = (direction) => {
    if (waterCannonMode.value === '自動') {
        return
    }
    activeWaterCannonDirections.value = [
        ...activeWaterCannonDirections.value.filter((activeDirection) => activeDirection !== direction),
        direction
    ]
    syncWaterCannonDirection()
}
const stopWaterCannonDirection = (direction) => {
    if (!activeWaterCannonDirections.value.includes(direction)) {
        return
    }
    activeWaterCannonDirections.value = activeWaterCannonDirections.value
        .filter((activeDirection) => activeDirection !== direction)
    syncWaterCannonDirection()
}
const waterCannonKeyMap = {
    ArrowUp: '上',
    ArrowLeft: '左',
    ArrowDown: '下',
    ArrowRight: '右'
}
const handleWaterCannonKeyDown = (event) => {
    const direction = waterCannonKeyMap[event.key]
    const isTextInput = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement

    if (!direction || !waterCannonDialog.value || waterCannonMode.value === '自動' || isTextInput) {
        return
    }

    event.preventDefault()
    if (activeWaterCannonDirections.value.includes(direction)) {
        return
    }
    startWaterCannonDirection(direction)
}
const handleWaterCannonKeyUp = (event) => {
    const direction = waterCannonKeyMap[event.key]

    if (direction) {
        stopWaterCannonDirection(direction)
    }
}
const clearActiveWaterCannonDirection = () => {
    activeWaterCannonDirections.value = []
}
watch(waterCannonDialog, (isOpen) => {
    if (isOpen) {
        connectWaterCannonStatusSocket()
    } else {
        closeWaterCannonStatusSocket()
        clearActiveWaterCannonDirection()
    }
})
const handleUpdate = (data) => {
    parentData.value = data;
};

const autoUpdate = (data2) => {
    alertNumber.value = data2
};
//Side D 視窗
const state = reactive({
    dialogpwd: false,
    mainMode: 0, // 0 = 監測模式 1 = 工程模式
    viewMode: 0,
    viewModeItems: [
        { title: '監測模式', value: 0 },
        { title: '工程模式', value: 1 }
    ],
    loading: true,
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    items: [
        {
            id: 1,
            title: 'Server 01',
            children: [
                { id: 2, title: '戶外監測' },
            ],
        }
    ],
    panel: [0, 1],
    menuName: '',
    dialog: false,
    mainMode: 'roi', // review = 監控模式 ,roi = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    mainModeItems: ['review', 'roi', 'mask', 'mask-temp-select'],
    addWindowItems: ['map'],
    addWindow: 'map',
    windowName: '',
    wsRoiData: null,
    menu: false,
    pageItems: [],
    // page: '單機監測/IEM4 諧波器室(4F)', // 全局監測 / 單機監測/室內1
    page: '全局監測', // 全局監測 / 單機監測/室內1
    defaultPorintList: [],
    tempHoverDiv: null,
    // 紀錄滑鼠位置
    mousedownLocations: { // 暫存滑鼠點擊第一位置
        x: 0,
        y: 0
    },
    tempPathItemDiv: null,
    tempPathItemDivLocaltion: {
        x: 0,
        y: 0
    },
    tempMoveFocusDiv: {
        div: null,
        up: null,
        down: null
    },
    saveIndex: {
        old: 0,
        new: 0
    },
    layoutData: null,
    focusTabId: null,
    password: null,
    // correctPassword: ''
    correctPassword: 'sa80700271'
})
const TAB_MIN_WIDTH = 150
const TAB_CONTENT_SPACING = 50
const tabItemWidth = ref(TAB_MIN_WIDTH)
const tabMeasureRef = ref(null)
const tabScrollRef = ref(null)

const updateTabItemWidth = async () => {
    await nextTick()

    const measureElements = Array.from(tabMeasureRef.value?.children ?? [])
    const longestTextWidth = measureElements.reduce((maxWidth, element) => {
        return Math.max(maxWidth, element.getBoundingClientRect().width)
    }, 0)

    tabItemWidth.value = Math.max(
        TAB_MIN_WIDTH,
        Math.ceil(longestTextWidth + TAB_CONTENT_SPACING)
    )
}

const scrollTabs = (event) => {
    const container = tabScrollRef.value
    if (!container || container.scrollWidth <= container.clientWidth) {
        return
    }

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY
    const previousScrollLeft = container.scrollLeft
    container.scrollLeft += delta

    if (container.scrollLeft !== previousScrollLeft) {
        event.preventDefault()
    }
}

watch(
    () => state.pageItems.map((item) => item.name),
    updateTabItemWidth,
    { flush: 'post' }
)
const checkPassword = () => {
    if (state.password === state.correctPassword) {
        state.dialogpwd = false
        state.password = null
        next(1)
    } else {
        // state.dialogpwd = false
        // state.password = null
        alert('密碼錯誤')
    }
}
const next = (e) => {
    // alert('登入成功，進入下一步')
    // 可加上更多邏輯
    state.mainMode = e
}
const updataSelectMode = (e) => {
    if (e === 1) {
        state.dialogpwd = true
    } else {
        state.mainMode = e
    }
}
const deleteTab = (id) => {
    // console.log('deleteTab', id);
    state.pageItems = state.pageItems.filter((item) => item.id !== id)
}

const cctvToMapMain = (e) => {
    let index = state.pageItems.findIndex((item) => item.id === e)
    state.page = state.pageItems[index].name
}
const cctvToMapMainCamid = (e) => {
    console.log('cctvToMapMainCamid', e);
    let index = state.pageItems.findIndex((item) => item.camID === e)
    state.page = state.pageItems[index].name
}
const cctvToMapMainCamidSidD = (e) => {
    console.log('cctvToMapMainCamid', e);
    let index = state.pageItems.findIndex((item) => item.camID === e)
    state.page = state.pageItems[index].name
    cctvRefe2.value.toMapPage1(e)
}
const pagePush = () => {
    state.pageItems.push(
        {
            name: state.windowName,
            to: state.addWindow,
            id: Math.random().toString(36).substr(2),
            stoptime: 10,
            alarm: false,
        }
    )
    state.dialog = false
    state.windowName = ''
}
const mouseover = (e) => {

}
const mousemove = (e) => {
    current(e)
}
const handleDataFromChild = (data) => {
    console.log('Received data from child:', data)
}
const current = (e) => {
    var type = e.target.getAttribute('data-type') // .parentNode
    if (type === 'pathItem' && state.tempPathItemDiv !== null) {
        var index = e.target.getAttribute('data-index')
        state.saveIndex.new = parseInt(index)
        var location = e.target.getBoundingClientRect() // 讀取被觸發的物件
        if (state.tempMoveFocusDiv.div !== e.target) {
            state.tempMoveFocusDiv.div = e.target
            if (state.tempMoveFocusDiv.down !== null) {
                state.tempMoveFocusDiv.down.remove();
                state.tempMoveFocusDiv.down = null
            }
            if (state.tempMoveFocusDiv.up !== null) {
                state.tempMoveFocusDiv.up.remove();
                state.tempMoveFocusDiv.up = null
            }
        }
        if (e.offsetX < (location.width / 2)) {
            if (state.tempMoveFocusDiv.up === null) {
                var newdiv = document.createElement('div')
                newdiv.classList.add('path-add-message-window');
                newdiv.innerHTML = '<div></div>'
                state.tempMoveFocusDiv.up = newdiv
                e.target.parentNode.insertBefore(newdiv, e.target);
                if (state.tempMoveFocusDiv.down !== null) {
                    state.tempMoveFocusDiv.down.remove();
                    state.tempMoveFocusDiv.down = null
                }
            }
        } else {
            if (state.tempMoveFocusDiv.down === null) {
                var newdiv = document.createElement('div')
                newdiv.classList.add('path-add-message-window');
                newdiv.innerHTML = '<div></div>'
                state.tempMoveFocusDiv.down = newdiv
                e.target.insertAdjacentElement('afterend', newdiv);
                if (state.tempMoveFocusDiv.up !== null) {
                    state.tempMoveFocusDiv.up.remove();
                    state.tempMoveFocusDiv.up = null
                }
            }
        }
    }
    if (state.tempPathItemDiv !== null) { // 判斷是否有抓取路徑table item
        var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        var location = {
            x: 0,
            y: 0
        }
        location.y = state.mousedownLocations.y - e.y
        location.x = state.mousedownLocations.x - e.x
        copyDiv.style.top = state.tempPathItemDivLocaltion.y - location.y + 'px'
        copyDiv.style.left = state.tempPathItemDivLocaltion.x - location.x + 'px'
    }
}
const mouseup = (e) => {
    if (state.tempPathItemDiv !== null) {
        var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        copyDiv.innerHTML = '' // 清空克隆物件內容
        var arr = state.pageItems
        const valueToMove = arr.splice(state.saveIndex.old, 1)[0];
        arr.splice(state.saveIndex.new, 0, valueToMove);
        state.pageItems = arr
    }
    state.tempPathItemDiv = null
}
const mousedown = (e, to, index) => {
    // const container = document.querySelector('.scrollable-container');
    // container.scrollTop = 500;  // 直接滾動到容器內部的 500 像素位置
    // scrollToElement(`a-tab-a${index}`)
    state.page = to
    state.focusTabId = index
    cctvRefe2.value.toMapPage(index)
    // cctvRefe2.value.toMapPage(index)
    // if (state.page !== to) {
    //     state.page = 'loading'
    //     setTimeout(() => {
    // console.log(e, to, index);
    mainRef.value.forEach((item) => {
        item.offdig()
    })
    //     }, 500)
    // }
    var type = e.target.getAttribute('data-type') // .parentNode
    if (type === 'pathItem') {
        var index = e.target.getAttribute('data-index')
        state.saveIndex.old = parseInt(index)
        var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        var location = e.target.getBoundingClientRect() // 讀取被觸發的物件
        copyDiv.style.top = location.y + 'px'
        copyDiv.style.left = location.x + 'px'
        var cloneDiv = e.target.cloneNode(true)
        copyDiv.appendChild(cloneDiv)
        state.mousedownLocations.x = e.x
        state.mousedownLocations.y = e.y
        state.tempPathItemDivLocaltion.y = location.y
        state.tempPathItemDivLocaltion.x = location.x
        state.tempPathItemDiv = e.target
    }
    current(e)
}
// const mousedown = (e, to) => {
//     if (state.page !== to) {
//         state.page = 'loading'
//         setTimeout(() => {
//             state.page = to
//         }, 500)
//     }
//     var type = e.target.getAttribute('data-type') // .parentNode
//     if (type === 'pathItem') {
//         var index = e.target.getAttribute('data-index')
//         state.saveIndex.old = parseInt(index)
//         var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
//         var location = e.target.getBoundingClientRect() // 讀取被觸發的物件
//         copyDiv.style.top = location.y + 'px'
//         copyDiv.style.left = location.x + 'px'
//         var cloneDiv = e.target.cloneNode(true)
//         copyDiv.appendChild(cloneDiv)
//         state.mousedownLocations.x = e.x
//         state.mousedownLocations.y = e.y
//         state.tempPathItemDivLocaltion.y = location.y
//         state.tempPathItemDivLocaltion.x = location.x
//         state.tempPathItemDiv = e.target
//     }
//     current(e)
// }
const mouseleave = (e) => {
    const elementsWithClass = state.tempHoverDiv;
    if (state.tempHoverDiv !== null) {
        elementsWithClass.style.opacity = 0
        elementsWithClass.style.pointerEvents = 'none'
        state.tempHoverDiv = null
    }
    if (state.tempMoveFocusDiv.div !== null) {
        state.tempMoveFocusDiv.div = null
        if (state.tempMoveFocusDiv.down !== null) {
            state.tempMoveFocusDiv.down.remove();
            state.tempMoveFocusDiv.down = null
        }
        if (state.tempMoveFocusDiv.up !== null) {
            state.tempMoveFocusDiv.up.remove();
            state.tempMoveFocusDiv.up = null
        }
    }
}
// 切換page 因對應名稱不同 暫寫死
// watch(parentData, (newValue, oldValue) => {
//     if (newValue == 1) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區1"
//     } else if (newValue == 2) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區2"
//     } else if (newValue == 3) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區3"
//     } else if (newValue == 4) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區4"
//     }
// });

// watch(state, (newValue, oldValue) => {
//     parentData.value = ""
//     console.log("sdskab", newValue.page, parentData.value);
// });
// 切換page
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            const requestBackend = () => {
                let output = [{
                    "feature": "streaming",
                    "method": "query_webRTC_list",
                    "session": Math.random().toString(36).substr(2),
                    "content": {}
                }, {
                    "feature": "layout",
                    "method": "query_overallTabContainer",
                    "session": Math.random().toString(36).substr(2),
                    "content": {}
                }]
                output.forEach((item) => state.ws3.send(JSON.stringify(item)))

            }

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
            state.ws3.addEventListener("close", colseEvent)
            state.wsListener3.close = colseEvent
            // var tew = 0
            let layoutData = {
                layout: null,
                historyDataframe: null
            }
            const runLayout = () => {
                if (layoutData.layout !== null && layoutData.historyDataframe !== null) {
                    // console.log('tablist', layoutData);
                    state.loading = false;
                    state.layoutData = layoutData
                    let pageItemsOut = []
                    let tablist = layoutData.layout
                    const globalTab = tablist.find((item) => item.tab_type === 2)
                    const firstSingleTab = tablist.find((item) => item.tab_type === 1)
                    const selectedTab = tablist.find((item) => item.tab_id === state.focusTabId)
                    const initialTab = selectedTab ?? globalTab ?? firstSingleTab

                    if (initialTab) {
                        state.focusTabId = initialTab.tab_id
                        state.page = initialTab.tab_name
                    }

                    tablist.forEach((item) => {
                        console.log(item);
                        pageItemsOut.push({
                            name: item.tab_name,
                            to: item.tab_type === 1 ? 'home' : 'map',
                            camID: item.tab_type === 1 ? item.container_list[0].container_camera_id : undefined,
                            id: item.tab_id,
                            stoptime: 10,
                            alarm: false,
                            top: 0
                        })
                    })
                    state.pageItems = pageItemsOut
                    // console.log("init", layoutData);
                }
            }
            const messageEvent = (event) => {
                let data = JSON.parse(event.data)
                let feature = data.feature
                let method = data.method
                if (feature === "layout" && method === "query_overallTabContainer") {
                    layoutData.layout = data.content
                    // console.log('query_overallTabContainer', data.content);
                    runLayout()
                } else if (feature === "streaming" && method === "query_webRTC_list") {
                    layoutData.historyDataframe = data.content
                    runLayout()
                }

            }
            state.ws3.addEventListener("message", messageEvent)
            requestBackend()
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
    updateTabItemWidth()
    document.fonts?.ready.then(updateTabItemWidth)
    window.addEventListener('keydown', handleWaterCannonKeyDown)
    window.addEventListener('keyup', handleWaterCannonKeyUp)
    window.addEventListener('blur', clearActiveWaterCannonDirection)

    // 直接進入工程模式
    // setTimeout(() => {
    //     state.dialogpwd = false
    //     state.password = null
    //     next(1)
    // }, 3000)
})
onBeforeUnmount(() => {
    closeWaterCannonStatusSocket()
    clearActiveWaterCannonDirection()
    window.removeEventListener('keydown', handleWaterCannonKeyDown)
    window.removeEventListener('keyup', handleWaterCannonKeyUp)
    window.removeEventListener('blur', clearActiveWaterCannonDirection)
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
.windows {
    background: #fff;
    width: 100%;
    height: 100%;
}



.t-content-grid {
    display: grid;
    transition: all .3s;
    height: 100%;
}

.t-meun {
    border-right: #B4B4B4 1px solid;
    transition: all .3s;
    overflow: auto;
    display: flex;
    flex-direction: column;
}

.item-card-content-window {
    /* flex-grow: 1;
    padding: .5em; */
    overflow: hidden;
    display: flex;
    height: 36px;
    border-bottom: 1px #B4B4B4 solid;
}

.header-left-actions,
.header-right-actions {
    flex: 0 0 auto;
    min-width: max-content;
}

.water-cannon-trigger {
    width: 36px;
    min-width: 36px;
    height: 36px;
    margin-left: -4px;
    margin-top: -2px;
    padding: 6px;
}

.header-notification-trigger {
    margin-left: -4px;
}

.water-cannon-trigger img {
    width: 22px;
    height: 22px;
    object-fit: contain;
}

.water-cannon-dialog {
    width: 1434px;
    max-width: calc(100vw - 48px);
    min-height: 966px;
    color: #414141;
}

.water-cannon-dialog__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 24px 8px;
    border-bottom: 1px solid #e3e3e3;
}

.water-cannon-dialog__header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
}

.water-cannon-dialog__header p {
    margin: 4px 0 0;
    color: #777;
    font-size: 13px;
}

.water-cannon-dialog__body {
    display: grid;
    grid-template-columns: minmax(0, 1032px) 264px;
    gap: 58px;
    padding: 10px 38px 14px !important;
}

.water-cannon-preview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.water-cannon-preview-section {
    display: flex;
    min-width: 0;
    flex-direction: column;
}

.water-cannon-preview-actions {
    display: flex;
    min-height: 52px;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding-top: 10px;
    color: #f44336;
    font-size: 14px;
}

.water-cannon-countdown--empty {
    color: #000;
}

.water-cannon-preview {
    position: relative;
    min-height: 390px;
    overflow: hidden;
}

.water-cannon-preview :deep(.water-cannon-preview__video) {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.water-cannon-controls {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.water-cannon-controls label,
.water-cannon-direction {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
}

.water-cannon-state-select.is-green :deep(.v-select__selection-text) {
    color: #006400;
    font-weight: 600;
}

.water-cannon-state-select.is-red :deep(.v-select__selection-text) {
    color: #8b0000;
    font-weight: 600;
}

.water-cannon-state-select.v-input--disabled {
    opacity: 1;
}

.water-cannon-select-option.is-green {
    color: #006400;
    font-weight: 600;
}

.water-cannon-select-option.is-red {
    color: #8b0000;
    font-weight: 600;
}

.direction-pad {
    display: grid;
    grid-template-columns: repeat(3, 84px);
    grid-template-rows: repeat(2, 84px);
    gap: 6px;
    align-items: center;
    justify-content: start;
}

.direction-pad :deep(.v-btn) {
    width: 84px;
    min-width: 84px;
    height: 84px;
    border-radius: 4px;
    transition: transform .08s ease, background-color .08s ease, box-shadow .08s ease;
}

.direction-pad :deep(.v-btn.is-keyboard-pressed) {
    color: #fff;
    background-color: #8d8d8d;
    box-shadow: inset 0 3px 5px rgb(0 0 0 / 28%);
    transform: scale(.94);
}

.direction-pad :deep(.v-icon) {
    font-size: 36px;
}

.direction-pad :deep(.direction-pad__up) {
    grid-column: 2;
    grid-row: 1;
}

.direction-pad :deep(.direction-pad__left) {
    grid-column: 1;
    grid-row: 2;
}

.direction-pad :deep(.direction-pad__down) {
    grid-column: 2;
    grid-row: 2;
}

.direction-pad :deep(.direction-pad__right) {
    grid-column: 3;
    grid-row: 2;
}

.direction-pad.is-disabled {
    opacity: .55;
}

@media (max-width: 720px) {
    .water-cannon-dialog {
        min-height: 0;
    }

    .water-cannon-dialog__body {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 24px !important;
    }

    .water-cannon-controls {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .water-cannon-preview {
        min-height: 180px;
    }
}

.tab-scroll {
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
}

.tab-scroll::-webkit-scrollbar {
    display: none;
}

.tab-list {
    display: flex;
    width: max-content;
    min-width: 100%;
    height: 100%;
}

.def-point-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 60% 1fr;
    cursor: pointer;
    /* background-color: #fff; */
    align-items: center;
}

.def-point-item {
    background-color: #E7EEEF;
    transition: .2s;
    border: 1px #B4B4B4 solid;
    cursor: pointer;
    box-sizing: border-box;
    flex: 0 0 var(--tab-item-width, 150px);
    width: var(--tab-item-width, 150px);
}

.def-point-item .def-point-grid {
    display: flex;
    grid-template-columns: none;
    justify-content: center;
    gap: 8px;
    padding-right: 12px !important;
    padding-left: 12px !important;
}

.tab-item-icon {
    flex: 0 0 15px;
}

.def-point-btn {
    background-color: #fff;
    transition: .2s;
    /* border: 2px #EAEAEA solid; */
    cursor: pointer;
    width: 35px;
}

.active-tag {
    border-bottom: 0px;
    /* border: 0px #B4B4B4 solid; */
    background-color: #fff;
}

.def-point-item:hover,
.def-point-btn:hover {
    background-color: #fdfdfd;
}

.def-point-name {
    color: #2B2D2C;
    font-weight: 700;
    white-space: nowrap;
}

.def-point-stoptime {
    font-size: 14px;
}

.def-point-conent {
    flex: 0 0 auto;
    overflow: visible;
}

.tab-width-measurer {
    position: fixed;
    top: -10000px;
    left: -10000px;
    visibility: hidden;
    pointer-events: none;
    white-space: nowrap;
}

.tab-width-measurer .def-point-name {
    display: inline-block;
    font-size: 12px;
}

#temp-copy-object {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    opacity: .8;
}

.path-add-message-window {
    width: 4px;
    position: relative;
    /* height: 114px; */
    background-color: #8297ff;
}

.path-add-message-window>div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #8297ff;
}

/* select style */
.windows .item-select .v-select.v-input--dense .v-select__selection--comma {
    margin: 0px !important;
}

.windows .item-select .v-text-field fieldset,
.windows .v-text-field .v-input__control {
    height: 35px !important;
}

.windows .item-select .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)>.v-input__control>.v-input__slot,
.v-text-field.v-text-field--enclosed .v-text-field__details {
    height: 35px !important;
}

.windows .item-select .v-select__slot {
    height: 32px !important;
}

.windows .item-select .v-input__append-inner {
    margin-top: 3px !important;
}

.windows .item-select .v-input__slot {
    padding: 0px 6px !important;
}

.windows .v-field__input {
    padding: 0px 0px 0px 9px !important;
    min-height: 38px !important;
}
</style>
