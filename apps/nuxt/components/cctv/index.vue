<template>
    <div class="w-100 h-100" @mouseup="itemMouseup()">
        <template v-for="(item, i) in state.cctvolnyROI" :key="i">
            <!-- <div
                :class="state.focusPage === item.container_camera_id && item.container_type === 1 ? 'cctv-mode-edit' : 'cctv-mode-display'">
                <ClientOnly>
                    <MapMain :ref="el => refsHandler(el, item.container_camera_id)" :camID="item.container_camera_id"
                        :camType="'ir'" @toTab="toMapPage" />
                </ClientOnly>
            </div> -->
        </template>
        <!-- <div style="position: fixed;width:50%;z-index: 99;opacity: .2;pointer-events: none;">
            <img src="/mock/螢幕擷取畫面 2025-12-05 085037.png" style="width: 100%;" />
        </div> -->
        <!-- <div class="realTimeCover-temp" ref="realTimeCanvasTemp" @mousedown="onMousedown" @mouseup="onMouseup"
            @mousemove="onMousemove"></div> -->
        <div class="transform-canvas"
            style="width: 100%;height: 100%;overflow: auto;background-color:#fff;overflow: hidden;">
            <div class="transform-container" style="transform: translate(0, 0) scale(1, 1); transform-origin: 0 0;">
                <div class="grid-stack">
                    <template v-for="(item, index) in state.childrenROI" :key="index">
                        <div class="grid-stack-item"
                            :gs-x="state.focusPage === item.option.camID && item.type === 1 ? 0 : item.x"
                            :gs-y="state.focusPage === item.option.camID && item.type === 1 ? 0 : item.y"
                            :gs-w="state.focusPage === item.option.camID && item.type === 1 ? state.cols : item.w"
                            :gs-h="state.focusPage === item.option.camID && item.type === 1 ? state.rows : item.h"
                            @mouseover="state.itemMouseOver = true" @mouseout="state.itemMouseOver = false"
                            :style="{ zIndex: state.focusPage === item.option.camID && item.type === 1 ? 999 : item.z, opacity: state.savedownID === item.option.container_id ? 0.3 : 1 }"
                            @mousedown="item.type !== 4 && state.focusPage !== item.option.camID && item.type !== 1 ? itemMouseDown(item.option.tabId, item.option.container_id) : ''"
                            @mouseup="itemMouseup(item.option.tabId, item.option.container_id)">
                            <div class="grid-stack-item-content">
                                <!-- {{ item.type }} -->
                                <template v-if="item.type === 4">
                                    <div style="width: 100%; height:100%;">
                                        <ClientOnly>
                                            <MapPanoramic :ref="el => refsHandlerPanoramic(el, item.id)"
                                                :camID="item.option.camID" :camType="'ir'" :formtData="state"
                                                :base64="item.image_base64" @topage123="toMapPage1" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 1">
                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                        <div class="main-dis-c"
                                            :class="[state.focusPage === item.option.camID ? 'cctv-mode-edit' : 'cctv-mode-display', state.savedownID !== null ? 'grid-stack-item-content-canvas-hole' : '']"
                                            @click="toMapPage1(item.option.camID)">
                                        </div>
                                        <ClientOnly>
                                            <MapMain :ref="el => refsHandler(el, item.id)" :camID="item.option.camID"
                                                :formtData="state" :camType="'ir'" @toTab="toMapPage1"
                                                :tabId="item.option.tab_id" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 2">
                                    <div class="grid-stack-item-content-canvas"
                                        :class="state.savedownID !== null ? 'grid-stack-item-content-canvas-hole' : ''">
                                    </div>
                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                        <!-- <ClientOnly>
                                            <MapOnlyvideo :formtData="state" :camID="item.option.camID"
                                                :camType="'vis'" />
                                        </ClientOnly> -->
                                        <ClientOnly>
                                            <MapOnlyvideo :ref="el => refsHandler3(el, item.id)" :formtData="state"
                                                :camID="item.option.camID" :camType="'vis'" v-if="state.test1" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 3">
                                    <div class="grid-stack-item-content-canvas"
                                        :class="state.savedownID !== null ? 'grid-stack-item-content-canvas-hole' : ''">
                                    </div>
                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                        <ClientOnly>
                                            <MapCameraphoto :ref="el => refsHandlerMapImport1(el, item.id)"
                                                :formtData="state" :mainProps="''" :camID="null" camType="vis"
                                                :ptzAlarmID="state.alarmID" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 9">
                                    <!-- HMI 屬性 -->
                                    <div style="width: 100%; height:100%;overflow: hidden;border: #747474 1px solid;"
                                        v-if="true">
                                        <div class="grid-stack" style="pointer-events: auto !important;"
                                            :ref="el => { $nextTick(() => addnested(el, item.option.container_id)) }">
                                            <!-- 左上 -->
                                            <div class="grid-stack-item" style="pointer-events: auto !important;"
                                                :gs-x="0" :gs-y="0" :gs-w="36" :gs-h="21" :gs-id="4">
                                                <div class="grid-stack-item-content"
                                                    style="background-color: #FFF;overflow: hidden;">
                                                    <div class="stack-item-type5-grid-row0">
                                                        <div class="d-flex flex-column align-start justify-center">
                                                            <div
                                                                class="stack-item-type5-grid-title01 ml-2 mt-3 py-1 px-3">
                                                                {{
                                                                    hmicontent.state[item.option.container_id]?.data.camera_name
                                                                }}
                                                            </div>
                                                        </div>
                                                        <div class="stack-item-type5-grid pl-1">
                                                            <div class="d-flex flex-column align-center justify-center"
                                                                style="font-size:1em;">
                                                                <div class="d-flex">
                                                                    <div class="d-rect-www01 mr-1"
                                                                        :style="hmicontent.state[item.option.container_id]?.data.alarm_info.roiAlarm_status === 1 ? 'background:#00FF1D;' : hmicontent.state[item.option.container_id]?.data.alarm_info.roiAlarm_status === 2 ? 'background:#FF0000;' : hmicontent.state[item.option.container_id]?.data.alarm_info.roiAlarm_status === 3 ? 'background:#CFCFCF;' : 'background:#fff;'">
                                                                    </div>
                                                                    <div>超溫監測</div>
                                                                </div>
                                                                <div class="d-flex my-1">
                                                                    <div class="d-rect-www01 mr-1 "
                                                                        :style="hmicontent.state[item.option.container_id]?.data.alarm_info.smokeAlarm_status === 1 ? 'background:#00FF1D;' : hmicontent.state[item.option.container_id]?.data.alarm_info.smokeAlarm_status === 2 ? 'background:#FF0000;' : hmicontent.state[item.option.container_id]?.data.alarm_info.smokeAlarm_status === 3 ? 'background:#CFCFCF;' : 'background:#fff;'">
                                                                    </div>
                                                                    <div>煙霧監測</div>
                                                                </div>
                                                                <div class="d-flex">
                                                                    <div class="d-rect-www01 mr-1 "
                                                                        :style="hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status === 1 ? 'background:#CFCFCF;' : hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status === 2 ? 'background:#00FF1D;' : hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status === 3 ? 'background:#FF0000;' : 'background:#fff;'">
                                                                    </div>
                                                                    <div>巡弋狀態</div>
                                                                </div>
                                                            </div>
                                                            <div style="position: relative;">
                                                                <div style="    position: absolute;
    width: 100%;
    height: 138%;
    top: -30%;">
                                                                    <moduleEcharttop
                                                                        :ref="(e) => { runmoduleEcharttop(item.option.container_id, e) }"
                                                                        :chartsData="hmicontent.state[item.option.container_id]?.data.realtime_roiCurve"
                                                                        chartTextSize="11px"
                                                                        xAxisTextSize="11px"
                                                                        v-if="hmicontent.state[item.option.container_id]?.data">
                                                                    </moduleEcharttop>
                                                                </div>
                                                            </div>
                                                            <div class="d-flex align-end justify-end">
                                                                <div class="d-flex flex-column align-end">
                                                                    <div style="font-size: 2.5em;line-height: 1;"
                                                                        :style="hmicontent.state[item.option.container_id]?.data.realtime_roiCurve.data.length > 0 ? hmicontent.state[item.option.container_id]?.data.realtime_roiCurve.data[hmicontent.state[item.option.container_id]?.data.realtime_roiCurve.data.length
                                                                            - 1][1] >= hmicontent.state[item.option.container_id]?.data.realtime_roiCurve.roi_thresholdManual ? 'color:#F31414' : 'color:#399600' : ''">
                                                                        {{
                                                                            hmicontent.state[item.option.container_id]?.data.realtime_roiCurve.data.length
                                                                                > 0 ?
                                                                                (hmicontent.state[item.option.container_id]?.data.realtime_roiCurve.data[hmicontent.state[item.option.container_id]?.data.realtime_roiCurve.data.length
                                                                                    - 1][1]).toFixed(1)
                                                                                : '--'
                                                                        }}
                                                                    </div>
                                                                    <div>℃</div>
                                                                    <div class="c-switch-lo20">
                                                                        <div class="c-switch-a20"
                                                                            :class="hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status === 1 ? 'c-switch-foucs20' : 'c-switch-after-add20'"
                                                                            @click="ptzswitchEvent(1, hmicontent.state[item.option.container_id])">
                                                                            閒置中
                                                                        </div>
                                                                        <div class="c-switch-b20"
                                                                            :class="hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status === 2 ? 'c-switch-foucs20' : ''"
                                                                            @click="ptzswitchEvent(2, hmicontent.state[item.option.container_id])">
                                                                            巡弋中
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- 左下 -->
                                            <div class="grid-stack-item" :gs-x="0" :gs-y="21" :gs-w="36" :gs-h="29"
                                                :gs-id="3">
                                                <div class="grid-stack-item-content" style="background-color: #FFF;"
                                                    v-if="true">
                                                    <!-- <moduleEchartsbar></moduleEchartsbar> -->
                                                    <!-- direction="vertical"  -->
                                                    <template v-if="hmicontent.state[item.option.container_id]?.data">
                                                        <swiper :slidesPerView="'auto'" :pagination="{
                                                            clickable: true,
                                                        }" :centeredSlides="false" :spaceBetween="2" grabCursor
                                                            :mousewheel="true" loop :modules="modules" class="mySwiper">
                                                            <swiper-slide
                                                                v-for="(item001, index001) in handlecruising(hmicontent.state[item.option.container_id]?.data.cruising_history)"
                                                                :key="index001">
                                                                <div class="myswiper-slider-div-ca001">
                                                                    <div class="myswiper-slider-div-container001 pa-1">

                                                                        <template v-for="(item002, index002) in item001"
                                                                            :key="index002">
                                                                            <div class="myswiper-slider-item-01">
                                                                                <div class="triangle-badge"
                                                                                    v-if="hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status === 1"
                                                                                    :style="hmicontent.state[item.option.container_id]?.data.ptz_onLocation === item002.cruising_id ? 'background: #2F84FF;' : ''">
                                                                                    <span
                                                                                        v-if="hmicontent.state[item.option.container_id]?.data.ptz_onLocation === item002.cruising_id">✔</span>
                                                                                </div>
                                                                                <div class="myswiper-slider-div"
                                                                                    :class="hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status === 1 ? 'myswiper-slider-div-on' : ''"
                                                                                    :style="hmicontent.state[item.option.container_id]?.data.ptz_onLocation === item002.cruising_id ? 'background: #F3F9FF;' : ''"
                                                                                    @click="changeCursingPoint(item002, hmicontent.state[item.option.container_id], hmicontent.state[item.option.container_id]?.data.alarm_info.ptz_working_status)">
                                                                                    <div
                                                                                        class="d-flex align-center justify-center">
                                                                                        <div style="font-size: 0.7em;">
                                                                                            {{
                                                                                                item002.cruising_number
                                                                                            }} {{
                                                                                                item002.cruising_name }}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div style="pointer-events: none;">
                                                                                        <moduleEchartsbar
                                                                                            :ref="(e) => { runmoduleEchartsbar(item002.cruising_id, e) }"
                                                                                            :chartsData="item002">
                                                                                        </moduleEchartsbar>
                                                                                    </div>
                                                                                    <div
                                                                                        class="d-flex align-center justify-space-evenly">
                                                                                        <div :style="item002.absTemp_curve.length
                                                                                            > 1
                                                                                            ? (() => {
                                                                                                const diff =
                                                                                                    item002.absTemp_curve.at(-1)
                                                                                                    -
                                                                                                    item002.absTemp_curve.at(-2)
                                                                                                const fixed =
                                                                                                    diff.toFixed(1)
                                                                                                return diff > 0 ?
                                                                                                    `color:#BE0000;` : 'color:#3DAE4A;'
                                                                                            })()
                                                                                            : ''" style="font-size: 0.7em;">
                                                                                            {{
                                                                                                item002.absTemp_curve.length
                                                                                                    > 1
                                                                                                    ? (() => {
                                                                                                        const diff =
                                                                                                            item002.absTemp_curve.at(-1)
                                                                                                            -
                                                                                                            item002.absTemp_curve.at(-2)
                                                                                                        const fixed =
                                                                                                            diff.toFixed(1)
                                                                                                        return diff > 0 ?
                                                                                                            `+${fixed}` : fixed
                                                                                                    })()
                                                                                                    : ''
                                                                                            }}</div>
                                                                                        <div class="ml-2"
                                                                                            style="color: #272727;font-weight: 500;font-size: 0.7em;">
                                                                                            {{
                                                                                                item002.absTemp_curve.length
                                                                                                    > 0 ?
                                                                                                    (item002.absTemp_curve[item002.absTemp_curve.length
                                                                                                        - 1]).toFixed(1) : ''
                                                                                            }}</div>
                                                                                        <div
                                                                                            :style="item002.absTemp_curve.length > 0 ? item002.absTemp_curve[item002.absTemp_curve.length
                                                                                                - 1] >= item002.roi_thresholdManual ? 'opacity: 1;' : 'opacity: 0;' : ''">
                                                                                            <img
                                                                                                src="/images/icon/alarm-red.png" />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </template>
                                                                        <template
                                                                            v-for="(item002, index02) in 10 - item001.length"
                                                                            :key="index02">
                                                                            <div class="myswiper-slider-div01"></div>
                                                                        </template>
                                                                    </div>
                                                                </div>
                                                            </swiper-slide>
                                                        </swiper>
                                                    </template>
                                                </div>
                                            </div>
                                            <!-- 右上 -->
                                            <div class="grid-stack-item" :gs-x="36" :gs-y="0" :gs-w="14" :gs-h="25"
                                                :gs-id="4">
                                                <div class="grid-stack-item-content pa-1"
                                                    style="background-color: #FFF;">
                                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                                        <!-- <div
                                                        style="width: 100%; height:100%;overflow: hidden;position: relative;">
                                                        <div style="width: 100%; height:100%;z-index: 922222;position: absolute;"> -->
                                                        <!-- <ClientOnly>
                                                        <MapDefault
                                                            :ref="(e) => { runrefMapDefaults(item.id + 700, e) }"
                                                            :formtData="state" :camID="item.option.camID"
                                                            :camType="'ir'" />
                                                    </ClientOnly> -->
                                                        <!-- </div> -->
                                                        <ClientOnly>
                                                            <MapMainroi :ref="el => refsHandler(el, item.id)"
                                                                :camID="item.option.camID" :formtData="state"
                                                                :camType="'ir'" @toTab="toMapPage1" />
                                                        </ClientOnly>
                                                    </div>
                                                    <!-- </div> -->
                                                </div>
                                            </div>
                                            <!-- 右下 -->
                                            <div class="grid-stack-item" :gs-x="36" :gs-y="25" :gs-w="14" :gs-h="25"
                                                :gs-id="4">
                                                <div class="grid-stack-item-content pa-1"
                                                    style="background-color: #FFF;pointer-events: auto !important;">
                                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                                        <ClientOnly>
                                                            <MapMainvideo :ref="el => refsHandler(el, item.id + 100)"
                                                                :camID="item.option.camID" :formtData="state"
                                                                :camType="'ir'" @toTab="toMapPage1" />
                                                        </ClientOnly>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex align-center justify-center into-gk-page-btn"
                                            @click="toMapPage1(item.option.camID)">
                                            <div class="mt-1 mr-1">
                                                <img src="/images/icon/intopage.png" />
                                            </div>
                                            <div>進入單機</div>
                                        </div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div style="width: 100%; height:100%;overflow: hidden;background-color: #e7e7e7;">
                                        <!-- <ClientOnly>
                                            <MapOnlyvideo
                                                :camID="1" :camType="'vis'" />
                                        </ClientOnly> -->
                                    </div>
                                </template>
                                <!-- <template v-else-if="item.type === 'bg'">
                                    <div style="width: 100%; height:100%;overflow: hidden;"></div>
                                </template>
                                <template v-else>
                                    <div style="width: 100%; height:100%;overflow: hidden;"></div>
                                </template> -->
                                <!-- <div class="grid-stack-item-content-canvas"
                                    @click="item.type === 'main' ? toMapPage1(item.option.camID) : ''">
                                </div> -->
                            </div>
                        </div>
                    </template>
                    <!-- <div class="grid-stack-item" :gs-x="0" :gs-y="0" :gs-w="1" :gs-h="1" :style="{ zIndex: 2 }">
                        <div class="grid-stack-item-content">123</div>
                    </div> -->
                </div>
            </div>
        </div>

        <div id="message" style="display: none;">
        </div>
        <!-- <umsdataelement id="UMSDataElement" style="display: none;"></umsdataelement> -->
        <div id="tmtoolbar_manual_rating_injected" style="display: none;">init</div>
        <div id="UMSSendDataEventElement" style="display: none;">init</div>
        <div id="temp-copy-object"></div>
    </div>
</template>
<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Mousewheel, Pagination } from 'swiper/modules'
import 'swiper/css/pagination';
import 'swiper/css'
import 'swiper/css/autoplay'
const { $webSocket02URL } = useNuxtApp()
const { $webSocketconnect02 } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { $webSocketconnect05 } = useNuxtApp()
let grid = null
let container; // 容器 DOM
let container2; // 容器 DOM
let content; // 內部的 transform 物件
let content2; // 內部的 transform 物件
const modules = ref([Mousewheel, Pagination])
const props = useAttrs().formtData
const tabId = useAttrs().tabId
const mapmain = ref([])
const realTimeCover = ref([])
const mapImport1 = ref([])
const mapImport2 = ref([])
const mapImport3 = ref([])
const mapPanoramic = ref([])
const ptzMap01 = ref([])
const pendingInitialCameraId = ref(null)
const realTimeCovertatle = reactive({
    value: 0
})
const hmicontent = reactive({
    state: {}
})
const refMapDefaults = ref([])
const refmoduleEcharttop = ref([])
const refmoduleEchartsbar = ref([])
const realTimeCanvasTemp = ref(null);
const realTimeCanvas = ref(null);
const refreshHmiWk = ref([])
const state = reactive({
    refsItem: true,
    viewMode: 0,
    mainMode: 0, // 0 = 監控模式 ,1 = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    wsRoiData: null,
    wsRoiData1: null,
    ws2: {
        readyState: 0
    },
    wsListener2: {
        close: null,
        message: null
    },
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    ws5: {
        readyState: 0
    },
    wsListener5: {
        close: null,
        message: null
    },
    alarmID: [],
    focusPage: null, // null = 全局
    cctvDisplayList: [],
    cctvolnyROI: [],
    mapimg: '',
    mousedownLocations: { // 暫存滑鼠點擊第一位置
        x: 0,
        y: 0
    },
    tempHoverDiv: null,
    tempHoverindex: 0,
    tempPathItemDivLocaltion: {
        x: 0,
        y: 0
    },
    tempscreensplitList: [],
    tempTabId: 0,
    tempcurrentcctv: [],
    olnytag: true,
    childrenROI: [],
    ptzswitch: 1,
    allItemMain: [],
    cols: 1,
    rows: 1,
    savedownID: null,
    timeout1: null,
    timeout2: null,
    timeout3: null,
    timeout4: null,
    test1: true
})
watch(
    () => props.mainMode,
    (data, prevData) => {
        state.viewMode = data
        console.log('cctv > index ', data);
    }
)
const nestedDOM = ref([])
const addnested = (el, id) => {
    const index = nestedDOM.value.findIndex((e) => e.id === id)
    if (index !== -1) return;
    console.log('addnestedaddnestedaddnestedaddnestedaddnested', id);

    // setTimeout(() => { // 這邊要改成觸發ref機制才對
    let parentDiv = el.parentNode;
    let cols = 50
    let rows = 50
    let gridx = GridStack.init(
        {
            column: cols,
            row: 100,
            float: true,
            margin: 1, // 單位：px，所有方向的間距
            animate: false,
            // cellHeight: 70,
            // acceptWidgets: true,
            // removable: '#trash', // drag-out delete class
        },
        el
    );
    gridx.enableMove(false)
    gridx.enableResize(false)
    gridx.column(cols);
    gridx.cellHeight(parentDiv.getBoundingClientRect().height / rows);
    // setInterval(()=>{
    //     gridx.cellHeight(parentDiv.getBoundingClientRect().height / rows);
    // },1000)
    nestedDOM.value.push({
        el, id, rows, gridx
    })
    // }, 1)
}
// setInterval(() => {
//     console.log(hmicontent);
// }, 1000)
const backvideobtnfn = (e) => {
    console.log('backvideobtnfn');
    // state.mainVideobackbtn = e === 'play' ? true : false
}
const itemMouseDown = (tabid, index) => {
    // console.log(index);
    state.savedownID = index
}
const itemMouseup = (tabid1, index) => {
    if (state.savedownID !== null && index !== undefined) {
        if (state.savedownID !== index) {
            var output = {
                "feature": "layout",
                "method": "set_orderContainer",
                "session": Math.random().toString(36).substr(2),
                "content": {
                    "tab_id": state.tempTabId,
                    "changed_index": [parseInt(state.savedownID), parseInt(index)]
                }
            }
            state.ws3.send(JSON.stringify(output))
            toMapPage(state.tempTabId)
        }
    }
    state.savedownID = null
}
// const winMousemove = (e) => {
//     if (state.savedownID !== null) {
//         console.log(e.target);
//         console.log('sd');

//     }
// }
const runrefMapDefaults = (id, el) => {
    // console.log('runmoduleEcharttop', id, el);
    const index = refMapDefaults.value.findIndex((e) => e.id === id)
    // if (index !== -1) refmoduleEcharttop.value.splice(index, 1);
    if (index !== -1) return;
    refMapDefaults.value.push({
        id, el
    })
}
const runmoduleEcharttop = (id, el) => {
    // console.log('runmoduleEcharttop', id, el);
    const index = refmoduleEcharttop.value.findIndex((e) => e.id === id)
    // if (index !== -1) refmoduleEcharttop.value.splice(index, 1);
    if (index !== -1) return;
    refmoduleEcharttop.value.push({
        id, el
    })
}
const runmoduleEchartsbar = (id, el) => {
    // console.log('runmoduleEcharttop', id, el);
    const index = refmoduleEchartsbar.value.findIndex((e) => e.id === id)
    if (index !== -1) return;
    refmoduleEchartsbar.value.push({
        id, el
    })
}
// setInterval(()=>{
//     console.log(refmoduleEchartsbar.value);
// },1000)
const generateTemporaryArray = (mainArray, filterArray) => {
    // 將 filterArray 中的物件轉成字串，方便比較
    const filterSet = new Set(filterArray.map(item => JSON.stringify(item)));

    // 使用 map 建立新陣列
    return mainArray.map(item => {
        const isMatched = filterSet.has(JSON.stringify(item));
        return {
            ...item, // 保留原有的鍵值
            display: !isMatched // 如果匹配則 display = false，否則 display = true
        };
    });
}
const refsHandler = (el, id) => {
    if (el) {
        const index = mapmain.value.findIndex((e) => e.id === id)
        if (index === -1) {
            mapmain.value.push({
                el, id
            })
        }
        // mapmain.value[index] = el
    }
}
const refsHandler3 = (el, id) => {
    if (el) {
        const index = mapImport3.value.findIndex((e) => e.id === id)
        if (index === -1) {
            mapImport3.value.push({
                el, id
            })
        }
        // mapmain.value[index] = el
    }
}
const refsHandlerMapImport1 = (el, id) => {
    if (el) {
        const index = ptzMap01.value.findIndex((e) => e.id === id)
        if (index === -1) {
            ptzMap01.value.push({
                el, id
            })
        }
        // mapImport1.value[index] = el
    }
}

const refsHandlerPanoramic = (el, id) => {
    if (el) {
        const index = mapPanoramic.value.findIndex((e) => e.id === id)
        if (index === -1) {
            mapPanoramic.value.push({
                el, id
            })
        }
        // mapImport1.value[index] = el
    }
}
const applySinglePageLayout = (cameraId) => {
    state.childrenROI = state.allItemMain.map((item) => {
        const isFocusedCamera = item.type === 1 && item.option.camID === cameraId
        return {
            ...item,
            x: isFocusedCamera ? 0 : 50,
            y: isFocusedCamera ? 0 : 50,
            w: isFocusedCamera ? state.cols : 1,
            h: isFocusedCamera ? state.rows : 1,
            focus: isFocusedCamera
        }
    })
}
const emit = defineEmits(['cctvToMapMain'])
const toMapPage = (e) => {
    console.log('tab 切換', e);
    state.refsItem = false
    setTimeout(() => {
        state.refsItem = true
    }, 1)
    let data = props.layoutData
    state.tempTabId = e
    let findID = data.layout.findIndex((item) => item.tab_id === e)
    if (findID === -1) return
    // console.log(data.layout);
    const containerData = data.layout[findID]
    // console.log(containerData);
    if (containerData.tab_type === 2) {
        //     state.childrenROI = []
        let cols = containerData.container_splitScreen.total_column // 豎
        let rows = containerData.container_splitScreen.total_row// 橫
        state.cols = cols
        state.rows = rows
        grid.column(cols);
        grid.cellHeight(container.getBoundingClientRect().height / rows);
        let TempchildrenROI = []
        containerData.container_list.forEach((item, index) => {
            const container_type = item.container_type
            let id = `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${container_type === 0 ? item.container_id : item.container_camera_id}`
            TempchildrenROI.push(
                {
                    x: item.container_location.column_start,
                    y: item.container_location.row_start,
                    w: item.container_location.column_width,
                    h: item.container_location.column_height,
                    id,
                }
            )
        })
        let outputItem = []
        state.allItemMain.forEach((item) => {
            let findeindex = TempchildrenROI.findIndex((e) => { return e.id === item.id })
            if (findeindex === -1) {
                item.x = 50
                item.y = 50
                item.w = 1
                item.h = 1
                item.focus = false
                outputItem.push(item)
            } else {
                item.x = TempchildrenROI[findeindex].x
                item.y = TempchildrenROI[findeindex].y
                item.w = TempchildrenROI[findeindex].w
                item.h = TempchildrenROI[findeindex].h
                item.focus = true
                outputItem.push(item)
            }
        })
        state.childrenROI = outputItem
    } else if (containerData.tab_type === 1) {
        applySinglePageLayout(containerData.container_list[0].container_camera_id)
    }
    // else if (containerData.tab_type === 1) {
    //     const container_list = data.layout[findID].container_list[0]
    //     const container_type = container_list.container_type
    //     const id = `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : 'null'}_${container_list.container_camera_id}`
    //     const findid1 = mapmain.value.findIndex((e) => e.id === id)
    //     mapmain.value[findid1].el.cutoverCanvasMap(container_list.container_camera_id)
    // }

    const focusCam = data.layout[findID].tab_type === 2 ? null : data.layout[findID].container_list[0].container_camera_id
    state.focusPage = focusCam
    // setTimeout(() => {
    //     console.log('mapmain', mapmain);
    //     mapmain.value.forEach((item, index) => {
    //         console.log(item);
    //         // item.cutoverCanvasMap(focusCam)
    //     })
    // }, 10)
    // 運行/關閉子元素下的wk
    if (state.timeout1 !== null) {
        clearTimeout(state.timeout1)
    }
    if (state.timeout2 !== null) {
        clearTimeout(state.timeout2)
    }
    if (state.timeout3 !== null) {
        clearTimeout(state.timeout3)
    }
    if (state.timeout4 !== null) {
        clearTimeout(state.timeout4)
    }
    state.timeout1 = setTimeout(() => {
        const container_list = data.layout[findID].container_list
        let tempId = []
        container_list.forEach((item) => {
            const container_type = item.container_type
            const id = `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${container_type === 0 ? item.container_id : item.container_camera_id}`
            tempId.push(id)
        })
        mapmain.value.forEach((item, index) => {
            item.el.switchWK(false)
        })
        ptzMap01.value.forEach((item, index) => {
            item.el.switchWK(false)
        })
        mapPanoramic.value.forEach((item, index) => {
            item.el.switchWK(false)
        })
        state.timeout2 = setTimeout(() => {
            mapmain.value.forEach((item, index) => {
                const findid = tempId.findIndex((e) => e === item.id)
                item.el.switchWK(findid !== -1 ? true : false)
                // if (focusCam !== null) {
                // console.log("toMapPage", focusCam);
                item.el.cutoverCanvasMap(focusCam)
                // }
            })
            ptzMap01.value.forEach((item, index) => {
                const findid = tempId.findIndex((e) => e === item.id)
                item.el.switchWK(findid !== -1 ? true : false)
            })
            mapPanoramic.value.forEach((item, index) => {
                const findid = tempId.findIndex((e) => e === item.id)
                item.el.switchWK(findid !== -1 ? true : false)
                if (findid !== -1) {
                    item.el.cutoverCanvasMap(focusCam)
                }
            })
            mapImport3.value.forEach((item, index) => {
                item.el.invaliMapSzie()
            })
            state.timeout2 = null
        }, 10)
        // state.childrenROI.forEach((item) => {
        //     if (item.focus) {
        //         console.log('f', item.id);
        //     }
        // })
        state.timeout1 = null
        refmoduleEcharttop.value.forEach((e) => {
            e.el.echartSize()
        })
        refmoduleEchartsbar.value.forEach((e) => {
            e.el.echartSize()
        })
        nestedDOM.value.forEach((e) => {
            let parentDiv = e.el.parentNode;
            e.gridx.cellHeight(parentDiv.getBoundingClientRect().height / e.rows);
        })
        refMapDefaults.value.forEach((item, index) => {
            // console.log('refMapDefaults', item);
            item.el.cutoverCanvasMap()
            // const findid = tempId.findIndex((e) => e === item.id)
            // item.el.switchWK(findid !== -1 ? true : false)
            // if (focusCam !== null) {
            // console.log("toMapPage", focusCam);
            // item.el.cutoverCanvasMap(focusCam)
            // }
        })
    }, 10)
    emit('cctvToMapMain', e)

}
const toMapPage1 = (e) => {
    // console.log('toMapPage1', e, props.layoutData.layout);
    let findID = props.layoutData.layout.findIndex((item) => item.tab_type === 1 && item.container_list[0].container_camera_id === e)
    if (findID === -1) return
    // console.log(findID);
    const containerData = props.layoutData.layout[findID]
    console.log('toMapPage1', containerData);
    state.focusPage = e
    // const data = props.layoutData.layout[e]
    const data = containerData
    const container_list = data.container_list[0]
    const container_type = container_list.container_type
    const id = `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${container_type === 0 ? container_list.container_id : container_list.container_camera_id}`
    const findid = mapmain.value.findIndex((e) => e.id === id)
    if (findid === -1) return false
    mapmain.value[findid].el.cutoverCanvasMap(e)
    // mapImport3.value.forEach((item, index) => {
    //     item.el.invaliMapSzie()
    // })
    // 運行/關閉子元素下的wk
    if (state.timeout1 !== null) {
        clearTimeout(state.timeout1)
    }
    if (state.timeout2 !== null) {
        clearTimeout(state.timeout2)
    }
    if (state.timeout3 !== null) {
        clearTimeout(state.timeout3)
    }
    if (state.timeout4 !== null) {
        clearTimeout(state.timeout4)
    }
    state.timeout1 = setTimeout(() => {
        mapmain.value.forEach((item, index) => {
            item.el.switchWK(false)
        })
        ptzMap01.value.forEach((item, index) => {
            item.el.switchWK(false)
        })
        mapPanoramic.value.forEach((item, index) => {
            item.el.switchWK(false)
        })
        state.timeout2 = setTimeout(() => {
            mapmain.value.forEach((item, index) => {
                item.el.switchWK(true)
            })
            ptzMap01.value.forEach((item, index) => {
                item.el.switchWK(true)
            })
            mapPanoramic.value.forEach((item, index) => {
                item.el.switchWK(true)
            })
        }, 10)
        state.timeout1 = null
        refmoduleEcharttop.value.forEach((e) => {
            e.el.echartSize()
        })
        refmoduleEchartsbar.value.forEach((e) => {
            e.el.echartSize()
        })
        nestedDOM.value.forEach((e) => {
            let parentDiv = e.el.parentNode;
            console.log(e);
            e.gridx.cellHeight(parentDiv.getBoundingClientRect().height / e.rows);
        })
    }, 10)
    emit('cctvToMapMainCamid', e)
    return true
}

watch(
    () => mapmain.value.length,
    () => {
        const cameraId = pendingInitialCameraId.value
        if (cameraId === null) return
        if (toMapPage1(cameraId)) {
            pendingInitialCameraId.value = null
        }
    },
    { flush: 'post' }
)

const changeCursingPoint = (e, hmi, type) => {
    if (type === 1) {
        var output = {
            "feature": "ptz",
            "method": "set_cursingPoint",
            "content": {
                "ptz_id": hmi.data.camera_id,
                "cursingPoint_id": e.cruising_id
            },
            "session": Math.random().toString(36).substring(2, 9)
        }
        // console.log('changeCursingPoint', hmi, output);
        state.ws3.send(JSON.stringify(output))
    }
}
const ptzswitchEvent = (e, hmi) => {
    var output = {
        "feature": "ptz",
        "method": "set_cursingStatus",
        "content": {
            "ptz_id": hmi.data.camera_id,
            "cursing_status": e === 1 ? 0 : 1
        },
        "session": Math.random().toString(36).substring(2, 9)
    }
    // console.log("output", output);
    state.ws3.send(JSON.stringify(output))
}
const clickContainer = (e, item, index, sw) => {
    if (!sw) {
        state.tempHoverindex = index
        let copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        let location = e.target.getBoundingClientRect() // 讀取被觸發的物件
        copyDiv.style.top = location.y + 'px'
        copyDiv.style.left = location.x + 'px'
        copyDiv.style.width = location.width + 'px'
        copyDiv.style.height = location.height + 'px'
        let cloneDiv = e.currentTarget.cloneNode(true)
        copyDiv.appendChild(cloneDiv)
        state.mousedownLocations.x = e.x
        state.mousedownLocations.y = e.y
        state.tempPathItemDivLocaltion.y = location.y
        state.tempPathItemDivLocaltion.x = location.x
        state.tempHoverDiv = e.currentTarget
    }
}
const onMousedown = (e) => { }
const onMousemove = (e) => {
    if (state.tempHoverDiv !== null) {
        let copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        let location = {
            x: 0,
            y: 0
        }
        location.y = state.mousedownLocations.y - e.y
        location.x = state.mousedownLocations.x - e.x
        copyDiv.style.top = state.tempPathItemDivLocaltion.y - location.y + 'px'
        copyDiv.style.left = state.tempPathItemDivLocaltion.x - location.x + 'px'
    }
}
const onMouseup = (e) => {
    // if (state.tempHoverDiv !== null) {
    // state.tempHoverDiv = null
    var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
    copyDiv.innerHTML = '' // 清空克隆物件內容
    // 調換位置
    // 選擇父容器和子元素
    // }
}
const upContainer = (e, item, index, sw) => {
    if (state.tempHoverDiv !== null && state.tempHoverindex !== index) {
        const parent = realTimeCanvasTemp.value;
        const divA = state.tempHoverDiv
        const divC = e.currentTarget
        let aID = divA.getAttribute("data-id");
        let cID = divC.getAttribute("data-id");
        var output = {
            "feature": "layout",
            "method": "set_orderContainer",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "tab_id": state.tempTabId,
                "changed_index": [parseInt(aID), parseInt(cID)]
            }
        }
        state.ws3.send(JSON.stringify(output))
        let data = props.layoutData
        let findID = data.layout.findIndex((item) => item.tab_id === state.tempTabId)
        let findaID = data.layout[findID].container_list.findIndex((item) => divA.getAttribute("data-json") === JSON.stringify(item))
        let findcID = data.layout[findID].container_list.findIndex((item) => divC.getAttribute("data-json") === JSON.stringify(item))
        data.layout[findID].container_list[findaID].container_id = parseInt(cID)
        data.layout[findID].container_list[findcID].container_id = parseInt(aID)
        divA.setAttribute('data-json', JSON.stringify(data.layout[findID].container_list[findaID]));
        divC.setAttribute('data-json', JSON.stringify(data.layout[findID].container_list[findcID]));
        // console.log(findaID, containerData, divA.getAttribute("data-json"), findcID, divC.getAttribute("data-json"));
        // // 對調位置
        if (parent && divA && divC) {
            // 建立兩個占位符
            const placeholderB = document.createElement('div');
            const placeholderD = document.createElement('div');

            // 用占位符替換原位置的元素
            parent.replaceChild(placeholderB, divA);
            parent.replaceChild(placeholderD, divC);

            // 將元素插回到對方的位置
            parent.replaceChild(divA, placeholderD);
            parent.replaceChild(divC, placeholderB);
        }
        state.tempHoverDiv = null
    }
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
const initWs5 = () => {
    const openwebsocket05 = () => {
        if ($webSocketconnect05().readyState === 1) {
            state.ws5 = $webSocketconnect05()
            if (state.wsListener5.close !== null) {
                state.ws5.removeEventListener("close", state.wsListener5.close)
                state.wsListener5.close = null
            }
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket05()
                }, 1000)
            }
            state.ws5.addEventListener("close", colseEvent)
            state.wsListener5.close = colseEvent
            // var tew = 0
            const messageEvent = (event) => {
                var data = JSON.parse(event.data)
                state.wsRoiData1 = data
                data = null
                // console.log(data);
            }
            state.ws5.addEventListener("message", messageEvent)
            // state.wsListener3.message = messageEvent
        } else if ($webSocketconnect05().readyState !== 1) {
            setTimeout(() => {
                openwebsocket05()
            }, 1000)
        }
    }
    openwebsocket05()
}


let children = [
    // { x: 0, y: 6, w: 12, h: 2, content: '123123', id: 0 },
    // { x: 3, y: 0, w: 3, h: 2, content: '123123', id: 0 }
];
const runHMIwk = (item) => {
    // console.log('runHMIwk', item.tab_id);
    let temp = new Worker('/worker/wktows02-hmi.js')
    temp.addEventListener('message', (e) => {
        var res = e.data
        var type = res.type
        var parameter = res.parameter
        if (type === 'open') {
            // console.log('開啟worker /worker/wktows02-cctv.js', item);
            temp.postMessage({
                type: 'start',
                parameter: {
                    wsURL: $webSocket02URL(),
                    item: JSON.stringify(item)
                }
            })
        } else if (type === 'ws') {
            let jsonData = JSON.parse(parameter)
            // console.log('jsonData', jsonData);
            // if (jsonData?.feature === 'refresh_hmi') {
            let temp = {}
            for (var i = 0; i < jsonData.length; i++) {
                // console.log('hmicontent[jsonData[i].container_id]hmicontent[jsonData[i].container_id]hmicontent[jsonData[i].container_id]', hmicontent[jsonData[i].container_id]);
                // hmicontent[jsonData[i].container_id].data.realtime_roiCurve.roi_thresholdManual = 99
                // hmicontent[jsonData[i].container_id].data = jsonData[i]
                // hmicontent[jsonData[i].container_id] = { data: jsonData[i] }
                temp[jsonData[i].container_id] = { data: jsonData[i] }
            }
            hmicontent.state = temp
            // state.childrenROI = temp
            // }
        } else if (type === 'close') {
            temp.terminate();
            temp = null
            refreshHmiWk.value = refreshHmiWk.value.filter((e) => e.item.tab_id !== item.tab_id)
            setTimeout(() => {
                runHMIwk(item)
                console.log('close', refreshHmiWk.value);
            }, 1)
        }
    })
    refreshHmiWk.value.push({
        e: temp,
        item
    })
}
const handlecruising = (arr) => {
    // const result = [];

    // for (let i = 0; i < arr.length; i += size) {
    //     let chunk = arr.slice(i, i + size);

    //     // 若不足 size，就補滿
    //     if (chunk.length < size) {
    //         const missing = size - chunk.length;
    //         const fillItems = Array.from({ length: missing }, () => ({ type: 'none' }));
    //         chunk = chunk.concat(fillItems);
    //     }

    //     result.push(chunk);
    // }

    // return result;
    const result = [];
    for (let i = 0; i < arr.length; i += 10) {
        result.push(arr.slice(i, i + 10));
    }
    return result;
}
onMounted(() => {
    initWs3()
    initWs5()
    // gridstack 執行
    if (true) {
        // grid 1
        container = document.querySelector(".transform-canvas");
        content = document.querySelector(".transform-container");
        GridStack.renderCB = function (el, w) {
            el.innerHTML = w.content;
        };
        grid = GridStack.init({
            disableDrag: true,
            disableResize: true,

            column: 4,
            float: true,
            margin: 1, // 單位：px，所有方向的間距
            animate: false,
            // cellHeight: 70,
            // acceptWidgets: true,
            // removable: '#trash', // drag-out delete class
            children,
            row: 100
        });
        // grids.forEach(function (grid, i) {
        // addEvents(grid, i);
        grid.enableMove(false)
        grid.enableResize(false)
        // });
        let data = props.layoutData
        let findID = data.layout.findIndex((item) => item.tab_id === tabId)
        if (findID === -1) return
        const containerData = data.layout[findID]
        let cols = containerData.container_splitScreen.total_column // 豎
        let rows = containerData.container_splitScreen.total_row // 橫
        state.cols = cols
        state.rows = rows
        grid.column(cols);
        grid.cellHeight(container.getBoundingClientRect().height / rows);
        const tempItemAll = []
        props.layoutData.layout.forEach((item) => {
            if (item.tab_type === 1) {
                const container_type = item.container_list[0].container_type
                tempItemAll.push({
                    x: 50,
                    y: 50,
                    w: 1,
                    h: 1,
                    focus: false,
                    option: container_type === 4 ? {} : {
                        camID: item.container_list[0].container_camera_id,
                        tabId: findID,
                        tab_id: item.tab_id
                    },
                    id: `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${item.container_list[0].container_camera_id}`,
                    z: container_type === 1 ? 1 : container_type === 2 ? 1 : container_type === 3 ? 1 : container_type === 4 ? 3 : 2,
                    // type: container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : 'null',
                    type: container_type,
                    image_base64: container_type === 4 ? item.image_base64 : undefined
                })
            }
        })
        props.layoutData.layout.forEach((item) => {
            if (item.tab_type === 2) {
                const container_list = item.container_list
                container_list.forEach((item, index0001) => {
                    const container_type = item.container_type
                    let id = `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${container_type === 0 ? item.container_id : item.container_camera_id}`
                    let findeindex = tempItemAll.findIndex((e) => { return e.id === id })
                    if (findeindex === -1) {
                        tempItemAll.push({
                            x: 50,
                            y: 50,
                            w: 1,
                            h: 1,
                            focus: false,
                            option: container_type === 4 ? { camID: item.container_camera_id } : {
                                camID: item.container_camera_id,
                                tabId: findID,
                                container_id: item.container_id,
                                tab_id: item.tab_id,
                                hmi: {
                                    camera_name: '相機1',
                                    realtime_roiCurve: {
                                        cruising_id: 15,
                                        roi_thresholdManual: 80,
                                        data: [[1731317280000, 20], [1731317380000, 30], [1731317380000, 20]]
                                    },
                                    cruising_history: [
                                        {
                                            cruising_id: 0,
                                            cruising_number: 15,
                                            cruising_name: "預設點15",
                                            roi_thresholdManual: 80.0,
                                            time: [[1731317280000, 20.7], [1731317290000, 20.9]],
                                            absTemp_curve: [62.5, 63.5, 62.7, 60.7, 69.1],
                                            relativeTmep_bar_scaleMax: 5.0,
                                            relativeTmep_bar: [-3.1, 1.5, -2.1, 4.1, -1.1]
                                        }
                                    ],
                                    alarm_info: {
                                        roiAlarm_status: 0,
                                        smokeAlarm_status: 1,
                                        ptz_working_status: 2
                                    },
                                    ptz_onLocation: 5
                                }
                            },
                            id: `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${container_type === 0 ? item.container_id : item.container_camera_id}`,
                            z: container_type === 1 ? 1 : container_type === 2 ? 1 : container_type === 3 ? 1 : container_type === 4 ? 3 : 2,
                            // type: container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : 'null',
                            type: container_type,
                            image_base64: container_type === 4 ? item.image_base64 : undefined
                        })
                    }
                })
                // console.log('runHMIwk(item)', item);
                const hmiFind = item.container_list.findIndex((item) => item.container_type === 9) // 暫時用這個方法去判斷tab 是否是hmi
                if (hmiFind !== -1) {
                    runHMIwk(item)
                }
            }
        })
        // console.log("tempItemAll", props.layoutData.layout, tempItemAll);
        state.allItemMain = tempItemAll
        if (containerData.tab_type === 1) {
            applySinglePageLayout(containerData.container_list[0].container_camera_id)
        } else {
            // 把所有的物件先新增到gk中
            let TempchildrenROI = []
            containerData.container_list.forEach((item) => {
                const container_type = item.container_type
                let id = `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${container_type === 0 ? item.container_id : item.container_camera_id}`
                TempchildrenROI.push(
                    {
                        x: item.container_location.column_start,
                        y: item.container_location.row_start,
                        w: item.container_location.column_width,
                        h: item.container_location.column_height,
                        id,
                    }
                )
            })
            let outputItem = []
            state.allItemMain.forEach((item) => {
                let findeindex = TempchildrenROI.findIndex((e) => { return e.id === item.id })
                if (findeindex === -1) {
                    item.x = 50
                    item.y = 50
                    item.w = 1
                    item.h = 1
                    item.focus = false
                    outputItem.push(item)
                } else {
                    item.x = TempchildrenROI[findeindex].x
                    item.y = TempchildrenROI[findeindex].y
                    item.w = TempchildrenROI[findeindex].w
                    item.h = TempchildrenROI[findeindex].h
                    item.focus = true
                    outputItem.push(item)
                }
            })
            state.childrenROI = outputItem
        }
        console.log('state.childrenROI', JSON.parse(JSON.stringify(state.childrenROI)));
        // 稍後GK載入完,運行/關閉子元素下的wk
        const focusCam = data.layout[findID].tab_type === 2 ? null : data.layout[findID].container_list[0].container_camera_id
        state.focusPage = focusCam
        if (focusCam !== null) {
            pendingInitialCameraId.value = focusCam
        }
        setTimeout(() => {
            const container_list = data.layout[findID].container_list
            let tempId = []
            container_list.forEach((item) => {
                const container_type = item.container_type
                const id = `camID_${container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : container_type === 9 ? 'hmi' : 'null'}_${item.container_camera_id}`
                tempId.push(id)
            })
            mapmain.value.forEach((item, index) => {
                item.el.switchWK(false)
            })
            ptzMap01.value.forEach((item, index) => {
                item.el.switchWK(false)
            })
            mapPanoramic.value.forEach((item, index) => {
                item.el.switchWK(false)
            })

            setTimeout(() => {
                mapmain.value.forEach((item, index) => {
                    const findid = tempId.findIndex((e) => e === item.id)
                    // console.log('findid !== -1 ? true : false', findid !== -1 ? true : false);
                    item.el.switchWK(findid !== -1 ? true : false)
                })
                ptzMap01.value.forEach((item, index) => {
                    const findid = tempId.findIndex((e) => e === item.id)
                    item.el.switchWK(findid !== -1 ? true : false)
                })
                mapPanoramic.value.forEach((item, index) => {
                    const findid = tempId.findIndex((e) => e === item.id)
                    item.el.switchWK(findid !== -1 ? true : false)
                    if (findid !== -1) {
                        item.el.cutoverCanvasMap(focusCam)
                    }
                })
                mapImport3.value.forEach((item, index) => {
                    item.el.invaliMapSzie()
                })
            }, 1)
        }, 10)
    }

    console.log('Swiper, SwiperSlide ', Swiper, SwiperSlide);
    // 暫時接換到單機頁面
    // setTimeout(() => {
    //     toMapPage(1022)
    // }, 1000)
})
onBeforeUnmount(() => {
    if (state.wsListener2.close !== null) {
        state.ws2.removeEventListener("close", state.wsListener2.close)
        state.wsListener2.close = null
    }
    if (state.wsListener2.message !== null) {
        state.ws2.removeEventListener("message", state.wsListener2.message)
        state.wsListener2.message = null
    }
    if (state.ws2 !== null) {
        // state.ws.close()
        state.ws2 = null
    }
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
    if (state.wsListener5.close !== null) {
        state.ws5.removeEventListener("close", state.wsListener5.close)
        state.wsListener5.close = null
    }
    if (state.wsListener5.message !== null) {
        state.ws5.removeEventListener("message", state.wsListener5.message)
        state.wsListener5.message = null
    }
    if (state.ws5 !== null) {
        // state.ws.close()
        state.ws5 = null
    }
})
defineExpose({
    toMapPage,
    toMapPage1
})
</script>
<style scope>
.mock-div1 {
    background: #DDDDDD;
    width: 100%;
    height: 100%;
}

.realTimeCover1 {
    /* width: 100%;
    height: 100%; */
    /* position: absolute;
    z-index: -999; */
}

.realTimeCover,
.realTimeCover-temp {
    width: 100%;
    height: 100%;
    /* display: flex; */
    /* flex-wrap: wrap; */
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
}

.realTimeCover>div,
.realTimeCover-temp>div {
    padding: .25em;
}

.realTimeCover-item {
    width: 100%;
    height: 100%;
    /* padding: .25em; */
    /* transition: all 1s; */
    /* border: 1px solid #000; */
}

.goToMore-canvas {
    position: relative;
}

.goToMore-canvas-u {
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.goToMore-canvas-hover {
    background-color: #000;
    opacity: 0;
    transition: opacity .3s;
}

.goToMore-canvas-hover:hover {
    opacity: .4;
}




#temp-copy-object {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    opacity: .8;
}
</style>
<style>
.main-dis-c {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 9;
    cursor: pointer;
    transition: background .3s;
}

.main-dis-c:hover {
    background: #00000013;
}


.cctv-mode-display {
    /* pointer-events: none !important; */
    /* visibility: hidden; */
}

.cctv-mode-edit {
    pointer-events: none !important;
    visibility: hidden;
    /* position: absolute; */
    /* width: 100%; */
    /* height: 100%; */
    /* top: 0; */
    /* left: 0; */
    /* z-index: 999; */
}

.sidebar {
    background: rgb(215, 243, 215);
    padding: 25px 0;
    height: 100px;
    text-align: center;
}


.sidebar>.grid-stack-item,
.sidebar-item {
    width: 100px;
    height: 50px;
    border: 2px dashed green;
    text-align: center;
    line-height: 35px;
    background: rgb(192, 231, 192);
    cursor: default;
    display: inline-block;
}

.stack-item-type5-grid-title01 {
    background: #E2E2E2;
    font-size: 14px;
}

.grid-stack {
    background: #ffffff;
}

.grid-stack.grid-stack-static {
    background: #ffffff;
}

.sidebar>.grid-stack-item,
.grid-stack-item-content {
    text-align: center;
    background-color: #ffffff;
    position: relative;
}

.grid-stack-item-content-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99999;
    transition: background .3s;
    cursor: pointer;
}

.grid-stack-item-content-canvas:hover {
    background: #00000013;
}

.grid-stack-item-content-canvas-hole {
    transition: background .3s;
}

.grid-stack-item-content-canvas-hole:hover {
    background: #0077ff28;
}

.ui-draggable-disabled.ui-resizable-disabled>.grid-stack-item-content {
    background-color: #f1f1f1;
}

.grid-stack-item-removing {
    opacity: 0.5;
}

.trash {
    height: 100px;
    background: rgba(255, 0, 0, 0.1) center center url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDQzOC41MjkgNDM4LjUyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjUyOSA0MzguNTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQxNy42ODksNzUuNjU0Yy0xLjcxMS0xLjcwOS0zLjkwMS0yLjU2OC02LjU2My0yLjU2OGgtODguMjI0TDMwMi45MTcsMjUuNDFjLTIuODU0LTcuMDQ0LTcuOTk0LTEzLjA0LTE1LjQxMy0xNy45ODkgICAgQzI4MC4wNzgsMi40NzMsMjcyLjU1NiwwLDI2NC45NDUsMGgtOTEuMzYzYy03LjYxMSwwLTE1LjEzMSwyLjQ3My0yMi41NTQsNy40MjFjLTcuNDI0LDQuOTQ5LTEyLjU2MywxMC45NDQtMTUuNDE5LDE3Ljk4OSAgICBsLTE5Ljk4NSw0Ny42NzZoLTg4LjIyYy0yLjY2NywwLTQuODUzLDAuODU5LTYuNTY3LDIuNTY4Yy0xLjcwOSwxLjcxMy0yLjU2OCwzLjkwMy0yLjU2OCw2LjU2N3YxOC4yNzQgICAgYzAsMi42NjQsMC44NTUsNC44NTQsMi41NjgsNi41NjRjMS43MTQsMS43MTIsMy45MDQsMi41NjgsNi41NjcsMi41NjhoMjcuNDA2djI3MS44YzAsMTUuODAzLDQuNDczLDI5LjI2NiwxMy40MTgsNDAuMzk4ICAgIGM4Ljk0NywxMS4xMzksMTkuNzAxLDE2LjcwMywzMi4yNjQsMTYuNzAzaDIzNy41NDJjMTIuNTY2LDAsMjMuMzE5LTUuNzU2LDMyLjI2NS0xNy4yNjhjOC45NDUtMTEuNTIsMTMuNDE1LTI1LjE3NCwxMy40MTUtNDAuOTcxICAgIFYxMDkuNjI3aDI3LjQxMWMyLjY2MiwwLDQuODUzLTAuODU2LDYuNTYzLTIuNTY4YzEuNzA4LTEuNzA5LDIuNTctMy45LDIuNTctNi41NjRWODIuMjIxICAgIEM0MjAuMjYsNzkuNTU3LDQxOS4zOTcsNzcuMzY3LDQxNy42ODksNzUuNjU0eiBNMTY5LjMwMSwzOS42NzhjMS4zMzEtMS43MTIsMi45NS0yLjc2Miw0Ljg1My0zLjE0aDkwLjUwNCAgICBjMS45MDMsMC4zODEsMy41MjUsMS40Myw0Ljg1NCwzLjE0bDEzLjcwOSwzMy40MDRIMTU1LjMxMUwxNjkuMzAxLDM5LjY3OHogTTM0Ny4xNzMsMzgwLjI5MWMwLDQuMTg2LTAuNjY0LDguMDQyLTEuOTk5LDExLjU2MSAgICBjLTEuMzM0LDMuNTE4LTIuNzE3LDYuMDg4LTQuMTQxLDcuNzA2Yy0xLjQzMSwxLjYyMi0yLjQyMywyLjQyNy0yLjk5OCwyLjQyN0gxMDAuNDkzYy0wLjU3MSwwLTEuNTY1LTAuODA1LTIuOTk2LTIuNDI3ICAgIGMtMS40MjktMS42MTgtMi44MS00LjE4OC00LjE0My03LjcwNmMtMS4zMzEtMy41MTktMS45OTctNy4zNzktMS45OTctMTEuNTYxVjEwOS42MjdoMjU1LjgxNVYzODAuMjkxeiIgZmlsbD0iI2ZmOWNhZSIvPgoJCTxwYXRoIGQ9Ik0xMzcuMDQsMzQ3LjE3MmgxOC4yNzFjMi42NjcsMCw0Ljg1OC0wLjg1NSw2LjU2Ny0yLjU2N2MxLjcwOS0xLjcxOCwyLjU2OC0zLjkwMSwyLjU2OC02LjU3VjE3My41ODEgICAgYzAtMi42NjMtMC44NTktNC44NTMtMi41NjgtNi41NjdjLTEuNzE0LTEuNzA5LTMuODk5LTIuNTY1LTYuNTY3LTIuNTY1SDEzNy4wNGMtMi42NjcsMC00Ljg1NCwwLjg1NS02LjU2NywyLjU2NSAgICBjLTEuNzExLDEuNzE0LTIuNTY4LDMuOTA0LTIuNTY4LDYuNTY3djE2NC40NTRjMCwyLjY2OSwwLjg1NCw0Ljg1MywyLjU2OCw2LjU3QzEzMi4xODYsMzQ2LjMxNiwxMzQuMzczLDM0Ny4xNzIsMTM3LjA0LDM0Ny4xNzJ6IiBmaWxsPSIjZmY5Y2FlIi8+CgkJPHBhdGggZD0iTTIxMC4xMjksMzQ3LjE3MmgxOC4yNzFjMi42NjYsMCw0Ljg1Ni0wLjg1NSw2LjU2NC0yLjU2N2MxLjcxOC0xLjcxOCwyLjU2OS0zLjkwMSwyLjU2OS02LjU3VjE3My41ODEgICAgYzAtMi42NjMtMC44NTItNC44NTMtMi41NjktNi41NjdjLTEuNzA4LTEuNzA5LTMuODk4LTIuNTY1LTYuNTY0LTIuNTY1aC0xOC4yNzFjLTIuNjY0LDAtNC44NTQsMC44NTUtNi41NjcsMi41NjUgICAgYy0xLjcxNCwxLjcxNC0yLjU2OCwzLjkwNC0yLjU2OCw2LjU2N3YxNjQuNDU0YzAsMi42NjksMC44NTQsNC44NTMsMi41NjgsNi41N0MyMDUuMjc0LDM0Ni4zMTYsMjA3LjQ2NSwzNDcuMTcyLDIxMC4xMjksMzQ3LjE3MnogICAgIiBmaWxsPSIjZmY5Y2FlIi8+CgkJPHBhdGggZD0iTTI4My4yMiwzNDcuMTcyaDE4LjI2OGMyLjY2OSwwLDQuODU5LTAuODU1LDYuNTctMi41NjdjMS43MTEtMS43MTgsMi41NjItMy45MDEsMi41NjItNi41N1YxNzMuNTgxICAgIGMwLTIuNjYzLTAuODUyLTQuODUzLTIuNTYyLTYuNTY3Yy0xLjcxMS0xLjcwOS0zLjkwMS0yLjU2NS02LjU3LTIuNTY1SDI4My4yMmMtMi42NywwLTQuODUzLDAuODU1LTYuNTcxLDIuNTY1ICAgIGMtMS43MTEsMS43MTQtMi41NjYsMy45MDQtMi41NjYsNi41Njd2MTY0LjQ1NGMwLDIuNjY5LDAuODU1LDQuODUzLDIuNTY2LDYuNTdDMjc4LjM2NywzNDYuMzE2LDI4MC41NSwzNDcuMTcyLDI4My4yMiwzNDcuMTcyeiIgZmlsbD0iI2ZmOWNhZSIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=) no-repeat;
}

/* make nested grid have slightly darker bg take almost all space (need some to tell them apart) so items inside can have similar to external size+margin */
.grid-stack>.grid-stack-item.grid-stack-sub-grid>.grid-stack-item-content {
    background: rgba(0, 0, 0, 0.1);
    inset: 0 2px;
}

.grid-stack.grid-stack-nested {
    background: none;
    inset: 0;
}

.grid-stack {
    /* background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 8.33%; */
    /* 控制網格大小 */
}
</style>
<style>
/* 移除點擊淡化、透明效果 */
.grid-stack-item,
.grid-stack-item-content,
.grid-stack-item.ui-draggable-dragging,
.grid-stack-item.ui-resizable-resizing,
.grid-stack-placeholder {
    opacity: 1 !important;
    background: inherit !important;
}

/* Placeholder 也移除虛線框/底色 */
.grid-stack-placeholder>.placeholder-content {
    opacity: 1 !important;
    background: transparent !important;
    border: none !important;
}

/* 移除 hover 時的變色 */
.grid-stack-item:hover {
    opacity: 1 !important;
}
</style>
<style>
.swiper {
    width: 100%;
    height: 100%;
    user-select: none;
}

.swiper-slide {
    text-align: center;
    font-size: 18px;
    background: #FBFBFB;
    /* width: calc(570px / 2) !important; */
    width: calc(100% - 5px) !important;
    height: 100% !important;
    /* Center slide text vertically */
    /* display: flex; */
    /* justify-content: center; */
    /* align-items: center; */
}

.myswiper-slider-div-ca001 {
    width: 100%;
    height: 95%;
    border: 1px solid #aaa;
}

.myswiper-slider-div-container001 {
    display: grid;


    /* 🟢 定義 2 欄，每欄寬 50% */
    grid-template-columns: 49% 49%;

    /* 🟢 每欄最多 4 行（可依需求調整） */
    grid-template-rows: repeat(5, 1fr);

    /* 🟢 關鍵：改成從上往下填，滿一欄後換到右邊 */
    grid-auto-flow: column;

    /* (可選) 間距 */
    gap: 0px;
    height: 90%;
}

.myswiper-slider-item-01 {
    /* background: #2196f3; */
    /* color: white; */
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border: 1px solid #fff;
    width: 100%;
    position: relative;
    max-height: 50px;
}


.myswiper-slider-div {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 30% 40% 30%;
    font-size: 14px;
    font-weight: 400;
    border: 0.5px solid #aaa;
    transition: background .2s;
}

.myswiper-slider-div01 {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 30% 40% 30%;
    font-size: 14px;
    font-weight: 400;
    border: 0.5px solid #CACACA;
    background: #FBFBFB;
}

.myswiper-slider-div>div {
    width: 100%;
    height: 100%;
}

.myswiper-slider-div-on {
    cursor: pointer;
}

.myswiper-slider-div-on:hover {
    background: #e9e9e9;
}

.myswiper-slider-div-on:active {
    background: #cccccc;
}

.swiper-slide-active {
    border: #fff 3px solid;
}

.triangle-badge {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 18px;
    /* 整個形狀寬度 */
    height: 18px;
    /* 整個形狀高度 */
    background: #DDDDDD;
    /* 底色，可改 */
    clip-path: polygon(0 0, 100% 0, 0 100%);
    /* 斜三角形 */

    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    color: white;
    /* 文字顏色 */
    font-size: 10px;
    /* ✔ 大小 */
    font-weight: bold;
}

.triangle-badge>span {
    margin-left: 3px;
    margin-top: -2px;
}

.swiper-pagination {
    margin: 0px 0px -5px 0px;
}

.swiper-pagination.swiper-pagination-lock {
    display: flex !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    justify-content: center;
}

.swiper-pagination.swiper-pagination-lock>span {
    width: 8px;
    /* 整個形狀寬度 */
    height: 8px;
    display: block !important;
}
</style>
<style>
/* 這邊是type 5 專用css */
.stack-item-type5-grid-row0 {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 30px 1fr;
}

.stack-item-type5-grid {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 20% 60% 20%;
}

.d-rect-www01 {
    width: 15px;
    height: 10px;
    border: 1px #000 solid;
    border-radius: 2px;
    margin-top: 5px;
}

/* 開關css */
.c-switch-lo20 {
    position: relative;
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    border: #878787 1px solid;
    border-radius: 3px;
    color: #878787;
    cursor: pointer;
    background: #fff;
    width: 90px;
    height: 25px;
    line-height: 2;
    font-size: 0.875em;
}

.c-switch-a20 {
    position: relative;
    z-index: 1;
}

.c-switch-b20 {
    z-index: 1;
}

.c-switch-a20::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #878787;
    border: #979797 1px solid;
    border-radius: 3px;
    z-index: -1;
    /* transition: all .3s; */
    opacity: 0.65;
}

.c-switch-after-add20::after {
    background-color: #6795D4;
    border: #5075A9 1px solid;
    left: 100%;
    box-shadow: 0px 0px 0px 0px #6795D4;
    /* animation: gogogo20 2.5s infinite linear; */
}

.c-switch-after-add-220::after {
    background-color: #ffe56f;
    border: #ffe56f 1px solid;
    left: 100%;
    box-shadow: 0px 0px 0px 0px #6795D4;
    /* animation: gogogo220 2.5s infinite linear; */
}

.c-switch-after-add120::after {
    border: #5075A9 1px solid;
    left: 100%;
}

.c-switch-foucs20 {
    color: #fff;
}

@keyframes gogogo20 {
    0% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #6795D4;
    }

    50% {
        opacity: 1;
        box-shadow: 1px 1px 8px 5px #6795D4;
    }

    100% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #6795D4;
    }
}

@keyframes gogogo220 {
    0% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #ffe56f;
    }

    50% {
        opacity: 1;
        box-shadow: 1px 1px 8px 5px #f5d23a;
    }

    100% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #ffe56f;
    }
}

/* 開關css */

/* 未選中的圓點 */
.swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    background: #EDEDED;
    /* 灰色 */
    opacity: 1;
    /* Swiper 預設 0.2，改成 1 比較清楚 */
    margin: 7px 4px !important;
}

/* 選中的圓點 */
.swiper-pagination-bullet-active {
    background: #D5D5D5;
    /* 你想要的顏色 */
    /* width: 14px; */
    /* height: 14px; */
}
</style>
<style>
.into-gk-page-btn {
    position: absolute;
    bottom: 9px;
    right: 11px;
    padding: .5em;
    color: #fff;
    background: #000000ad;
    border-radius: 4px;
    transition: background .3s;
    cursor: pointer;
    user-select: none;
    z-index: 100;
}

.into-gk-page-btn:hover {
    background: #00000075;
}

.temp-hmi-stack {
    height: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: 50%;

}

.temp-hmi-stack>div {
    position: unset !important;
    width: 100%;
    height: 100%;
}
</style>
<style lang="scss">
@for $columns from 1 through 50 {
    .gs-#{$columns}>.grid-stack-item {
        width: calc(100% / #{$columns});

        @for $i from 1 through $columns - 1 {
            &[gs-x='#{$i}'] {
                left: calc(100% / #{$columns} * #{$i});
            }

            &[gs-w='#{$i+1}'] {
                width: calc(100% / #{$columns} * #{$i + 1});
            }
        }
    }
}
</style>
