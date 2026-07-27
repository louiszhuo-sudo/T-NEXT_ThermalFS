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
        <v-dialog v-model="waterCannonDialog" class="water-cannon-dialog-shell" width="1731"
            max-width="calc(100vw - 48px)" scrollable>
            <v-card class="water-cannon-dialog">
                <v-btn class="water-cannon-dialog__close" icon="mdi-close" variant="text" aria-label="關閉水砲控制"
                    @click="waterCannonDialog = false" />
                <v-card-text class="water-cannon-dialog__body">
                    <section class="water-cannon-overview">
                        <h2>水砲控制</h2>
                        <div class="water-cannon-device-list">
                            <button v-for="status in waterCannonList" :key="status.waterJet_id" type="button"
                                class="water-cannon-device-row"
                                :aria-pressed="String(status.waterJet_id) === waterCannonId"
                                @click="selectWaterCannon(status.waterJet_id)">
                                <span class="water-cannon-device-selector"
                                    :class="{ 'is-selected': String(status.waterJet_id) === waterCannonId }">
                                    <span />
                                </span>
                                <span class="water-cannon-device-card"
                                    :class="{ 'is-selected': String(status.waterJet_id) === waterCannonId }">
                                    <span class="water-cannon-device-card__title">
                                        {{ getWaterCannonDisplayName(status) }}
                                    </span>
                                    <span class="water-cannon-device-statuses">
                                        <span
                                            :class="{ 'is-active': isWaterCannonStatusActive(status, 'waterJet_gate_status') }">
                                            水閘啟動
                                        </span>
                                        <span
                                            :class="{ 'is-active': isWaterCannonStatusActive(status, 'waterJet_tempeAlarm_status') }">
                                            溫度異常
                                        </span>
                                        <span
                                            :class="{ 'is-active': isWaterCannonStatusActive(status, 'waterJet_smokeAlarm_status') }">
                                            煙霧偵測
                                        </span>
                                    </span>
                                </span>
                            </button>
                        </div>

                        <div class="water-cannon-system-status">
                            <h3>系統狀態</h3>
                            <div class="water-cannon-system-status__items">
                                <div class="water-cannon-system-card">
                                    <span class="water-cannon-system-card__title">加壓馬達</span>
                                    <span class="water-cannon-system-card__value"
                                        :class="{ 'is-alert': waterCannonPumpDisplay.isAlert }">
                                        {{ waterCannonPumpDisplay.label }}
                                    </span>
                                </div>
                                <div class="water-cannon-system-card">
                                    <span class="water-cannon-system-card__title">水位</span>
                                    <span class="water-cannon-system-card__value"
                                        :class="{ 'is-alert': waterCannonWaterLevelDisplay.isAlert }">
                                        {{ waterCannonWaterLevelDisplay.label }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="water-cannon-preview-section">
                        <div v-for="preview in waterCannonPreviews" :key="preview.key"
                            class="water-cannon-preview">
                            <ClientOnly>
                                <MapOnlyvideo v-if="waterCannonDialog" class="water-cannon-preview__video"
                                    :stream-url="preview.stream" :camID="preview.camID" :camType="preview.type" />
                            </ClientOnly>
                        </div>
                        <div v-if="waterCannonCountdown > 0" class="water-cannon-countdown-overlay">
                            <span>倒數 {{ waterCannonCountdown }} 秒後，自動啟動水砲</span>
                            <v-btn color="#ff4f4f" variant="flat" @click="triggerWaterCannon">立即啟動</v-btn>
                        </div>
                    </section>

                    <section class="water-cannon-controls">
                        <div class="water-cannon-control-group">
                            <h3>模式</h3>
                            <div class="water-cannon-segmented-control">
                                <button type="button" :class="{ 'is-selected': waterCannonMode === '自動' }"
                                    :aria-pressed="waterCannonMode === '自動'" @click="setWaterCannonMode('自動')">
                                    自動
                                </button>
                                <button type="button" :class="{ 'is-selected': waterCannonMode === '手動' }"
                                    :aria-pressed="waterCannonMode === '手動'" @click="setWaterCannonMode('手動')">
                                    手動
                                </button>
                            </div>
                        </div>

                        <div class="water-cannon-control-group">
                            <h3>閘門</h3>
                            <div class="water-cannon-segmented-control water-cannon-segmented-control--gate"
                                :class="{ 'is-disabled': waterCannonMode === '自動' }">
                                <button type="button" :class="{ 'is-selected': waterCannonGate === '開' }"
                                    :aria-pressed="waterCannonGate === '開'" :disabled="waterCannonMode === '自動'"
                                    @click="setWaterCannonGate('開')">
                                    開
                                </button>
                                <button type="button" :class="{ 'is-selected': waterCannonGate === '關' }"
                                    :aria-pressed="waterCannonGate === '關'" :disabled="waterCannonMode === '自動'"
                                    @click="setWaterCannonGate('關')">
                                    關
                                </button>
                            </div>
                        </div>

                        <div class="water-cannon-direction">
                            <h3>方向控制</h3>
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
                    </section>
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
const waterCannonCountdown = ref(0)
const activeWaterCannonDirections = ref([])
const waterCannonSystemStatus = ref({})
const waterCannonStatuses = ref({})
const waterCannonList = computed(() => {
    return Object.values(waterCannonStatuses.value)
        .sort((left, right) => Number(left.waterJet_id) - Number(right.waterJet_id))
})
const waterCannonPreviews = computed(() => {
    const waterJetId = String(waterCannonId.value)
    return [
        {
            key: `water-cannon-ir-${waterJetId}`,
            camID: waterJetId,
            type: 'ir',
            stream: `rtsp://localhost:8889/video/realtime/ir${waterJetId}`
        },
        {
            key: `water-cannon-vis-${waterJetId}`,
            camID: waterJetId,
            type: 'vis',
            stream: `rtsp://localhost:8889/video/realtime/vis${waterJetId}`
        }
    ]
})
const waterCannonPumpDisplay = computed(() => {
    const value = Number(waterCannonSystemStatus.value.waterJet_pump_status)
    if (value === 1) {
        return { label: '啟動', isAlert: false }
    }
    if (value === 0) {
        return { label: '停止', isAlert: true }
    }
    return { label: '--', isAlert: false }
})
const waterCannonWaterLevelDisplay = computed(() => {
    const value = Number(waterCannonSystemStatus.value.waterJet_waterLow_status)
    if (value === 1) {
        return { label: '低水位', isAlert: true }
    }
    if (value === 0) {
        return { label: '正常水位', isAlert: false }
    }
    return { label: '--', isAlert: false }
})
const getWaterCannonDisplayName = (status) => {
    const name = String(status?.waterJet_name ?? status?.waterJet_id ?? '').trim()
    return name.startsWith('水砲') ? name : `水砲 ${name}`
}
const isWaterCannonStatusActive = (status, field) => Number(status?.[field]) === 1
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
const normalizeWaterCannonStatusEntries = (content) => {
    let sourceEntries = []
    if (Array.isArray(content)) {
        sourceEntries = content
    } else if (content && typeof content === 'object') {
        const isDirectStatus = (
            content.waterJet_id !== undefined
            || content.waterJet_pump_status !== undefined
            || content.waterJet_waterLow_status !== undefined
        )
        sourceEntries = isDirectStatus ? [content] : Object.values(content)
    }

    return sourceEntries.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') {
            return []
        }
        if (
            entry.waterJet_id !== undefined
            || entry.waterJet_pump_status !== undefined
            || entry.waterJet_waterLow_status !== undefined
        ) {
            return [entry]
        }
        return Object.values(entry).filter((value) => value && typeof value === 'object')
    })
}
const applyWaterCannonStatus = (content = []) => {
    const entries = normalizeWaterCannonStatusEntries(content)
    const systemStatus = entries.find((entry) => (
        entry.waterJet_pump_status !== undefined
        || entry.waterJet_waterLow_status !== undefined
    ))
    const statuses = entries.filter((entry) => entry.waterJet_id !== undefined)

    if (systemStatus) {
        waterCannonSystemStatus.value = {
            ...waterCannonSystemStatus.value,
            ...systemStatus
        }
    }

    if (!statuses.length) {
        return
    }

    waterCannonStatuses.value = Object.fromEntries(
        statuses.map((status) => [String(status.waterJet_id), status])
    )

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
            applyWaterCannonStatus(message.content ?? message)
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
    waterCannonMode.value = mode
    if (mode === '自動') {
        clearActiveWaterCannonDirection()
    }
    sendWaterCannonCommand('set_waterJet_guide_mode', {
        waterJet_id: Number(waterCannonId.value),
        waterJet_guide_mode: mode === '自動' ? 1 : 2
    })
}
const setWaterCannonGate = (gate) => {
    if (waterCannonMode.value === '自動') {
        return
    }
    waterCannonGate.value = gate
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
    position: relative;
    width: 1731px;
    max-width: calc(100vw - 48px);
    height: 1003px;
    max-height: calc(100vh - 48px);
    overflow: hidden;
    border: 1px solid #333;
    color: #585858;
    box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
}

.water-cannon-dialog__close {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
}

.water-cannon-dialog__body {
    display: grid;
    grid-template-columns: minmax(430px, 540px) minmax(520px, 636px) minmax(360px, 426px);
    justify-content: center;
    gap: 24px;
    width: 100%;
    height: 100%;
    padding: 16px 28px 30px !important;
    overflow: auto;
    box-sizing: border-box;
}

.water-cannon-overview {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    padding: 24px 0 8px;
}

.water-cannon-overview h2,
.water-cannon-overview h3,
.water-cannon-controls h3 {
    margin: 0;
    font-size: 25px;
    font-weight: 400;
    line-height: 1.2;
    text-align: center;
}

.water-cannon-device-list {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 24px;
    margin-top: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 4px;
}

.water-cannon-device-row {
    display: grid;
    min-width: 0;
    flex: 0 0 auto;
    grid-template-columns: 50px minmax(0, 440px);
    gap: 34px;
    align-items: center;
    width: 100%;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
    font: inherit;
    text-align: left;
}

.water-cannon-device-selector {
    display: flex;
    width: 49px;
    height: 49px;
    align-items: center;
    justify-content: center;
    border: 2px solid #b8b8b8;
    border-radius: 50%;
    background: #f7f7f7;
    box-sizing: border-box;
}

.water-cannon-device-selector span {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #c9c9c9;
}

.water-cannon-device-selector.is-selected span {
    background: #0095ff;
}

.water-cannon-device-card {
    display: flex;
    height: 141px;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
    border: 2px solid #b8b8b8;
    border-radius: 3px;
    background: #fff;
    box-sizing: border-box;
}

.water-cannon-device-card.is-selected {
    padding: 4px;
    border: 3px solid #0095ff;
}

.water-cannon-device-card__title {
    display: flex;
    min-height: 56px;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background: #e6e6e6;
    font-size: 25px;
}

.water-cannon-device-statuses {
    display: grid;
    min-height: 0;
    flex: 1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
}

.water-cannon-device-statuses > span {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 1px solid #b8b8b8;
    border-radius: 4px;
    background: #fff;
    font-size: 22px;
    text-align: center;
    white-space: nowrap;
}

.water-cannon-device-statuses > span.is-active {
    background: #ffcccc;
}

.water-cannon-system-status {
    flex: 0 0 auto;
    margin-top: 28px;
}

.water-cannon-system-status__items {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;
    width: 440px;
    max-width: calc(100% - 84px);
    margin: 14px 0 0 84px;
}

.water-cannon-system-card {
    display: flex;
    height: 138px;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
    border: 2px solid #b8b8b8;
    border-radius: 3px;
    box-sizing: border-box;
}

.water-cannon-system-card__title,
.water-cannon-system-card__value {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 24px;
}

.water-cannon-system-card__title {
    min-height: 44px;
    background: #e6e6e6;
}

.water-cannon-system-card__value {
    min-height: 0;
    flex: 1;
    border: 1px solid #b8b8b8;
    background: #fff;
}

.water-cannon-system-card__value.is-alert {
    background: #ffcccc;
}

.water-cannon-preview-section {
    position: relative;
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.water-cannon-preview {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: #eee;
}

.water-cannon-preview :deep(.water-cannon-preview__video) {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.water-cannon-countdown-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 5;
    display: flex;
    width: 420px;
    min-height: 126px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
    padding: 18px 24px;
    background: rgb(255 255 255 / 88%);
    color: #f44336;
    font-size: 22px;
    text-align: center;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
}

.water-cannon-countdown-overlay :deep(.v-btn) {
    color: #fff;
    font-size: 20px;
}

.water-cannon-controls {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    padding-top: 28px;
}

.water-cannon-control-group + .water-cannon-control-group {
    margin-top: 32px;
}

.water-cannon-segmented-control {
    display: flex;
    height: 104px;
    gap: 7px;
    margin-top: 12px;
    padding: 5px;
    border: 2px solid #bebebe;
    border-radius: 3px;
    box-sizing: border-box;
}

.water-cannon-segmented-control button {
    min-width: 0;
    flex: 1;
    padding: 10px;
    border: 1px solid #b8b8b8;
    border-radius: 5px;
    color: #fff;
    background: #afafaf;
    cursor: pointer;
    font: inherit;
    font-size: 28px;
}

.water-cannon-segmented-control button.is-selected {
    background: #0095ff;
}

.water-cannon-segmented-control--gate button.is-selected {
    background: #74c5ff;
}

.water-cannon-segmented-control.is-disabled {
    opacity: .65;
}

.water-cannon-segmented-control button:disabled {
    cursor: default;
}

.water-cannon-direction {
    min-height: 0;
    flex: 1;
    margin-top: 32px;
}

.direction-pad {
    display: grid;
    width: 100%;
    max-height: 423px;
    aspect-ratio: 426 / 423;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(3, minmax(0, 1fr));
    gap: 9px;
    align-items: center;
    margin-top: 12px;
    padding: 14px;
    border: 2px solid #bebebe;
    border-radius: 5px;
    box-sizing: border-box;
}

.direction-pad :deep(.v-btn) {
    width: 100%;
    min-width: 0;
    height: 100%;
    border: 1px solid #aaa;
    border-radius: 5px;
    color: #999;
    background: #d7d7d7;
    transition: transform .08s ease, background-color .08s ease, box-shadow .08s ease;
}

.direction-pad :deep(.v-btn.is-keyboard-pressed) {
    color: #fff;
    background-color: #8d8d8d;
    box-shadow: inset 0 3px 5px rgb(0 0 0 / 28%);
    transform: scale(.94);
}

.direction-pad :deep(.v-icon) {
    font-size: 52px;
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
    grid-row: 3;
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
