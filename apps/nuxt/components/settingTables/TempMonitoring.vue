<template>
    <v-container fluid>
        <v-row>

            <div v-if="isLoading" style="z-index: 10" class="overlay"></div>
            <div v-if="isLoading" class="text-center"
                style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100">
                <v-progress-circular :size="70" :width="7" color="" indeterminate></v-progress-circular>
            </div>

            <!-- 加載超時錯誤提示 -->
            <div v-if="loadingError" style="z-index: 10" class="overlay"></div>
            <div v-if="loadingError" class="text-center"
                style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <div class="mb-4">載入超時，請稍後再試</div>
                <v-btn color="primary" @click="handleErrorReturn">返回</v-btn>
            </div>
            <!-- <v-card style="z-index: 100"  width="500" persistent
                class="centered-card lower-z">
                123
            </v-card> -->
            <!-- <v-btn @click="clearChart">123</v-btn> -->
            <!-- {{ cruisingItems }} -->
            <!-- {{ camera_id }} -->
            <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap">
                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">相機名稱</h4>
                    <v-select width="200px" density="compact" variant="outlined" :items="camItems" item-title="tab_name"
                        item-value="tab_sort" hide-details v-model="camera_id" label="" single-line>
                    </v-select>
                </div>

                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">巡弋點名稱</h4>
                    <v-select width="150px" density="compact" variant="outlined" :items="cruisingItems"
                        item-title="cursingPoint_name" item-value="cursingPoint_id" hide-details
                        v-model="cursingPoint_id" label="" single-line>
                    </v-select>
                </div>

                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">選擇日期</h4>
                    <v-text-field @click="datePlugin" v-model="dateRangeSelected" density="compact" variant="outlined"
                        hide-details type="text" id="datetimerange-input123" size="40"
                        class="v-field__input"></v-text-field>
                </div>


                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">監測物件</h4>
                    <v-select width="120px" density="compact" variant="outlined" :items="roiClassItems"
                        item-title="name" item-value="value" hide-details v-model="roiClass_id" label="" single-line>
                    </v-select>
                </div>


                <v-btn color="grey" @click="handleConfirm">
                    確定
                </v-btn>
                <!-- 
                <v-btn @click="clearChart">清除</v-btn>
                <v-btn @click="">新Data</v-btn> -->
            </v-col>

            <v-col cols="7" class="bordered-section pa-3">

                <h4>巡弋點最高溫度</h4>
                <div ref="chartRefSelectBar" style="width: 100%; height: 200px;"></div>

            </v-col>


            <v-col cols="5" class="bordered-section">
                <h4>高溫時段統計圖</h4>
                <div ref="chartRef4" style="width: 100%; height: 200px;"></div>
            </v-col>

            <v-col cols="7" class="bordered-section pa-0">
                <v-row no-gutters>
                    <v-col cols="12" class="bordered-section pa-3 ">
                        <h4>最高溫度</h4>
                        <div ref="maxChartRef" style="width: 100%; height:200px"></div>

                    </v-col>
                    <v-col cols="12" class="bordered-section pa-3">
                        <h4>最低溫度</h4>
                        <div ref="minChartRef" style="width: 100%; height: 100px;"></div>

                    </v-col>
                    <v-col cols="12" class="bordered-section  pa-3">
                        <h4>平均溫度</h4>
                        <div ref="avgChartRef" style="width: 100%; height: 100px;"></div>
                    </v-col>
                </v-row>
            </v-col>




            <v-col cols="5" class="bordered-section">
                <h4>熱像圖</h4>
                <v-row no-gutters>
                    <v-col cols="12" class="">
                        <!-- 加入ROI -->
                        <div class="relative select-none">
                            <div class="d-flex justify-space-end">
                                <v-select @update:modelValue="handleSelection" width="100px" density="compact"
                                    variant="outlined" :items="roiItems" hide-details v-model="selectRoi" label="新增ROI"
                                    single-line />
                                <v-spacer />
                                <v-switch v-model="magnifierEnabled" label="放大鏡" hide-details density="compact" />
                            </div>
                            <div class="relative" @mousemove="handleMouseMove" @mouseleave="hideMagnifier">
                                <img :src="image_base64.ir" width="640" class="h-auto pointer-events-none" ref="bgImage"
                                    @dragstart.prevent />
                                <div v-if="magnifierEnabled && showMagnifier"
                                    class="absolute pointer-events-none overflow-hidden rounded-full border-2 border-gray-200 shadow-lg"
                                    :style="{
                                        width: '200px',
                                        height: '200px',
                                        left: `${magnifierPos.x - 100}px`,
                                        top: `${magnifierPos.y - 100}px`,
                                        display: showMagnifier ? 'block' : 'none',
                                        border: '1px solid #fff',
                                        zIndex: 9999,
                                    }">
                                    <div class="absolute" :style="{
                                        transform: `scale(2)`,
                                        transformOrigin: '100px 100px',
                                        width: '640px',
                                        height: 'auto'
                                    }">
                                        <img :src="bgImage?.src" class="absolute" :style="{
                                            left: `${-magnifierPos.x + 100}px`,
                                            top: `${-magnifierPos.y + 100}px`,
                                            width: '640px',
                                            height: 'auto'
                                        }" />
                                        <div v-for="roi in rois" :key="roi.roi_id" class="absolute" :style="{
                                            left: `${roi.roi_nodeManual[0] - magnifierPos.x + 100}px`,
                                            top: `${roi.roi_nodeManual[1] - magnifierPos.y + 100}px`
                                        }">
                                            <img src="/public/images/spot_1.png" class="w-8 h-8 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div v-for="roi in rois" :key="roi.roi_id" class="absolute cursor-move" :style="{
                                    left: `${roi.roi_nodeManual[0]}px`,
                                    top: `${roi.roi_nodeManual[1]}px`,
                                    transform: 'translate(-50%, -50%)'  // Center the ROI icon
                                }" @mousedown="startDrag($event, roi)" @contextmenu.prevent="showMenu($event, roi)"
                                    @mouseenter="hoveredRoi = roi" @mouseleave="hoveredRoi = null">
                                    <div class="relative">
                                        <img src="/public/images/spot_1.png" class="w-8 h-8 pointer-events-none"
                                            @dragstart.prevent />
                                        <div v-if="hoveredRoi === roi"
                                            class="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap z-50">
                                            {{ roi.roi_number }}
                                        </div>
                                    </div>
                                </div>

                                <div v-if="activeMenu.show" class="absolute bg-white rounded shadow-lg z-50" :style="{
                                    left: `${activeMenu.x}px`,
                                    top: `${activeMenu.y}px`,
                                }">
                                    <v-list density="compact" width="120">
                                        <v-list-item @click="deleteRoi" density="compact" class="text-red-600">
                                            <v-list-item-title>刪除</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </div>
                            </div>
                        </div>
                        <!-- 加入ROI -->
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
const { $getIpaddress } = useNuxtApp()
useHead({
    // title: '',
    meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' }
    ],
    link: [
        {
            rel: 'stylesheet',
            type: 'text/css',
            href: '/css/vanilla-datetimerange-picker-dark.css'
        }
    ],
    script: [
        {
            type: 'text/javascript'
        }
    ],
    style: [
        { children: 'body { color: white; background-color: #fff; }' }
    ]
})

import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
const isLoading = ref(false);
const loadingError = ref(false);
const loadingTimer = ref(null);

// 處理加載超時
const startLoadingTimer = () => {
    // 清除之前的計時器
    if (loadingTimer.value) {
        clearTimeout(loadingTimer.value);
    }

    // 設置新的計時器，10秒後顯示錯誤
    loadingTimer.value = setTimeout(() => {
        if (isLoading.value) {
            isLoading.value = false;
            loadingError.value = true;
        }
    }, 30000); // 10秒
};

// 處理錯誤返回按鈕
const handleErrorReturn = () => {
    loadingError.value = false;
    // 這裡可以添加返回邏輯，例如重置狀態或返回上一頁
    // 如果需要返回上一頁，可以使用 router.back()
    // 如果需要重置狀態，可以在這裡添加相應的代碼
    currentSelectedIndex = null;
    if (chartSelectBar) {
        chartSelectBar.setOption({
            series: [{
                name: '最大溫度',
                data: resetAllBars()
            }]
        });
    }
};

// 修改現有的顯示加載指示器的地方，添加計時器
const showLoading = () => {
    isLoading.value = true;
    loadingError.value = false;
    startLoadingTimer();
};

// 修改現有的隱藏加載指示器的地方，清除計時器
const hideLoading = () => {
    isLoading.value = false;
    clearLoadingTimer();
};



// 清除加載計時器
const clearLoadingTimer = () => {
    if (loadingTimer.value) {
        clearTimeout(loadingTimer.value);
        loadingTimer.value = null;
    }
};


const cursingPointItems = ref([
    // { name: "單機監測/室外堆置區1", combination_id: 1, cursingPath_id: 1 },
    // { name: "單機監測/室外堆置區2", combination_id: 2, cursingPath_id: 1 },
    // { name: "單機監測/室外堆置區3", combination_id: 3, cursingPath_id: 1 },
    // { name: "單機監測/室外堆置區4", combination_id: 4, cursingPath_id: 1 }
])

const avgChartRef = ref(null)
const minChartRef = ref(null)
const maxChartRef = ref(null)
const isRendered = ref(false)

const charts = ref({
    avg: null,
    min: null,
    max: null
})

const IMAGE_WIDTH = 640  // 新增常量定義圖片寬度
const ROI_SIZE = 32
const MAGNIFIER_SIZE = 200
const MAGNIFIER_CENTER = MAGNIFIER_SIZE / 2

const bgImage = ref(null)
const rois = ref([])
const draggedRoi = ref(null)
const initialMouseOffset = ref({ x: 0, y: 0 })
const roiItems = ref(['Spot'])
const selectRoi = ref(null)
const hoveredRoi = ref(null)

const magnifierEnabled = ref(false)
const showMagnifier = ref(false)
const magnifierPos = ref({ x: 0, y: 0 })

const chartRef4 = ref(null);
let chart4 = null;

const datePickerInstance = ref(null);

const optionBar = ref({
    animation: false,
    animationDurationUpdate: 0,
    // color: ["#546E7A", "#90A4AE", "#B0BEC5", "#CFD8DC", "#ECEFF1"],
    // title: {
    //     text: "最高溫度",
    //     top: '5%',

    //     textStyle: { //主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
    //         fontFamily: 'Arial',
    //         fontSize: 16,
    //         fontStyle: 'normal',
    //         fontWeight: 'normal',
    //     },
    // },
    dataZoom: [
        {
            type: "inside",
            filterMode: 'filter',
            show: true,
            top: '12%',
            height: 30,

            // minValueSpan: 12,
            // maxValueSpan: 12,
            // labelFormatter: function (value) {
            //     return value + ""
            // }
        }
    ],        // realtime: false,
    // zoomOnMouseWheel: 'shift'

    tooltip: {
        animation: false,
        transitionDuration: 0,
        show: true,
        trigger: 'axis',
        showContent: true,
        showDelay: 0,
        axisPointer: {
            show: true,
            animation: false
        },
        // formatter: function (value, index) {
        //     return Math.round(value) + "";
        // },
    },
    legend: {
        left: 140,
        right: '8%',
        top: '0%',
        type: 'scroll',
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        top: 60
    },
    xAxis: {
        name: "(小時)",
        type: 'category',
        boundaryGap: true,
        axisLabel: {
            showMaxLabel: true,
        }
    },
    yAxis: {
        name: "(次數)",
        type: 'value',
        scale: true,
        interval: 1,
        axisLabel: {
            fontSize: 8,
            showMaxLabel: false
        }
    },
    series: []
});






const handleMouseMove = (event) => {
    if (!magnifierEnabled.value || !bgImage.value) return

    const rect = bgImage.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        showMagnifier.value = true
        magnifierPos.value = { x, y }
    } else {
        showMagnifier.value = false
    }
}

const hideMagnifier = () => {
    showMagnifier.value = false
}

const activeMenu = ref({
    show: false,
    x: 0,
    y: 0,
    roi: null
})

const handleSelection = (value) => {
    if (!value) return
    addRoi()
    nextTick(() => {
        selectRoi.value = null
    })
}

const addRoi = () => {
    if (!bgImage.value) return

    // Get image dimensions
    const imageWidth = 640
    const imageHeight = 512

    // Calculate center point
    const centerX = imageWidth / 2
    const centerY = imageHeight / 2

    // Generate new ROI ID
    const newRoiId = 5001 + rois.value.length

    // Create new ROI object
    const newRoi = {
        roi_type: "spot",
        roi_id: newRoiId,
        roi_number: `${newRoiId}_temp`,
        roi_name: `temp${rois.value.length + 1}`,
        roi_nodeManual: [centerX, centerY]  // Position at center
    }

    rois.value.push(newRoi)
    emitUpdate()

    // Transform coordinates to relative values
    const transformedRois = rois.value.map(roi => {
        const transformedRoi = { ...roi }
        if (transformedRoi.roi_nodeManual && transformedRoi.roi_nodeManual.length === 2) {
            transformedRoi.roi_nodeManual = [
                transformedRoi.roi_nodeManual[0] / imageWidth,
                transformedRoi.roi_nodeManual[1] / imageHeight
            ]
        }
        return transformedRoi
    })
    console.log("取得新圖表-add ROI", {
        "feature": "history_temperature",
        "method": "query_recalculate_roiTemperature",
        "content": {
            "camera_id": camera_id.value,
            "cursingPoint_id": cursingPoint_id.value,
            "selected_time": current_selected_time.value,
            "roi_info": transformedRois,
            "roiClass_id": roiClass_id.value
        },
        "session": "sckji8452s",
    });
    // Send WebSocket message
    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
        ws4.value.send(JSON.stringify({
            "feature": "history_temperature",
            "method": "query_recalculate_roiTemperature",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_time": current_selected_time.value,
                "roi_info": transformedRois,
                "roiClass_id": roiClass_id.value
            },
            "session": "sckji8452s",
        }))
    }
}

const showMenu = (event, roi) => {
    activeMenu.value = {
        show: true,
        x: roi.roi_nodeManual[0] + ROI_SIZE + 5,
        y: roi.roi_nodeManual[1],
        roi: roi
    }
}

const deleteRoi = () => {
    if (activeMenu.value.roi) {
        const index = rois.value.findIndex(r => r.roi_id === activeMenu.value.roi.roi_id)
        if (index !== -1) {
            rois.value.splice(index, 1)
            emitUpdate()
        }
    }
    activeMenu.value.show = false

    // 取得圖片實際尺寸
    const imageWidth = 640  // 圖片寬度
    const imageHeight = 512 // 圖片高度

    // 轉換ROI座標為相對值並發送到WebSocket
    const transformedRois = rois.value.map(roi => {
        const transformedRoi = { ...roi };
        if (transformedRoi.roi_nodeManual && transformedRoi.roi_nodeManual.length === 2) {
            transformedRoi.roi_nodeManual = [
                transformedRoi.roi_nodeManual[0] / imageWidth,
                transformedRoi.roi_nodeManual[1] / imageHeight
            ];
        }
        return transformedRoi;
    });

    showLoading()

    console.log("取得新圖表-delete ROI", {
        "feature": "history_temperature",
        "method": "query_recalculate_roiTemperature",
        "content": {
            "camera_id": camera_id.value,
            "cursingPoint_id": cursingPoint_id.value,
            "selected_time": current_selected_time.value,
            "roi_info": transformedRois,
            "roiClass_id": roiClass_id.value
        },
        "session": "sckji8452s",
    });
    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {

        ws4.value.send(JSON.stringify({
            "feature": "history_temperature",
            "method": "query_recalculate_roiTemperature",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_time": current_selected_time.value,
                "roi_info": transformedRois,
                "roiClass_id": roiClass_id.value
            },
            "session": "sckji8452s",
        }));
    }



}

const closeMenu = (event) => {
    if (activeMenu.value.show &&
        !event.target.closest('.v-list') &&
        !event.target.closest('img')) {
        activeMenu.value.show = false
    }
}

const startDrag = (event, roi) => {
    if (event.button !== 0) return
    event.preventDefault()
    draggedRoi.value = roi
    activeMenu.value.show = false

    const roiElement = event.currentTarget
    const rect = roiElement.getBoundingClientRect()
    initialMouseOffset.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }

    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event) => {
    if (!draggedRoi.value || !bgImage.value) return

    const imgRect = bgImage.value.getBoundingClientRect()

    // Calculate new position considering the center offset
    let newX = event.clientX - imgRect.left
    let newY = event.clientY - imgRect.top

    // Constrain the position to keep the center point within the image bounds
    newX = Math.max(0, Math.min(newX, IMAGE_WIDTH))
    newY = Math.max(0, Math.min(newY, imgRect.height))

    draggedRoi.value.roi_nodeManual = [newX, newY]
    emitUpdate()
}

const stopDrag = () => {
    draggedRoi.value = null
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)



    // 取得圖片實際尺寸
    const imageWidth = 640  // 圖片寬度
    const imageHeight = 512 // 圖片高度

    // 轉換ROI座標為相對值並發送到WebSocket
    const transformedRois = rois.value.map(roi => {
        const transformedRoi = { ...roi };
        if (transformedRoi.roi_nodeManual && transformedRoi.roi_nodeManual.length === 2) {
            transformedRoi.roi_nodeManual = [
                transformedRoi.roi_nodeManual[0] / imageWidth,
                transformedRoi.roi_nodeManual[1] / imageHeight
            ];
        }
        return transformedRoi;
    });

    showLoading()


    console.log("取得新圖表-drop ROI", {
        "feature": "history_temperature",
        "method": "query_recalculate_roiTemperature",
        "content": {
            "camera_id": camera_id.value,
            "cursingPoint_id": cursingPoint_id.value,
            "selected_time": current_selected_time.value,
            "roi_info": transformedRois,
            "roiClass_id": roiClass_id.value
        },
        "session": "sckji8452s",
    });
    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {

        ws4.value.send(JSON.stringify({
            "feature": "history_temperature",
            "method": "query_recalculate_roiTemperature",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_time": current_selected_time.value,
                "roi_info": transformedRois,
                "roiClass_id": roiClass_id.value
            },
            "session": "sckji8452s",
        }));
    }



}

const emitUpdate = () => {
    const event = new CustomEvent('roi-update', {
        detail: rois.value
    })
    window.dispatchEvent(event)
}




// select
const camItems = ref([]);
const roiClassItems = ref([{ name: '電抗', value: 3 }, { name: '電容', value: 4 }, { name: '接點', value: 5 }, { name: 'others', value: 0 }]);
const camera_id = ref(null);
const roiClass_id = ref(null);
const cruisingItems = ref([]);
const cursingPoint_id = ref(null);
// const dateRangeItems = ref([{ name: '2024-08-30' }]);
const dateRangeSelected = ref("");
const current_selected_time = ref([]);

const chartRefSelectBar = ref(null)
const chartRefPeak = ref(null)

const chartData = ref({
    "echart_roiMax": {},
    "echart_roiMin": {},
    "echart_roiAvg": {},
    "roiTemperature_image_URL": {
        "ir": "xxxx",
        "vis": "xxxx"
    }
})

let resizeObserver = null;

let chartSelectBar = null;


const DEFAULT_BAR_COLOR = '#d9d9d9';
const SELECTED_BAR_COLOR = '#e8b500';
const THRESHOLD1_COLOR = '#ff730E';
const THRESHOLD2_COLOR = '#FF8F8F';
const AMBIENT_COLOR = '#909BFF';

let currentSelectedIndex = null;


const image_base64 = ref({ ir: "", vis: "" })


const updateChartData_selectTimeRange = (data) => {
    try {
        const timeData = [];
        const temperatureData = [];
        const threshold1Data = [];
        const threshold2Data = [];
        const ambientData = [];
        const timeInfo = {};

        // 檢查 data 是否為空或未定義
        if (!data || Object.keys(data).length === 0) {
            if (chartSelectBar) {
                chartSelectBar.setOption({
                    xAxis: { data: [] },
                    series: [{
                        name: '最大溫度',
                        data: []
                    }, {
                        name: '一級警報溫度',
                        data: []
                    }, {
                        name: '二級警報溫度',
                        data: []
                    }, {
                        name: '環境溫度',
                        data: []
                    }]
                });
            }
            return;
        }

        Object.keys(data).forEach(timestamp => {
            if (data[timestamp] && data[timestamp].start_time) {  // 添加數據存在性檢查
                timeData.push(timestamp);
                temperatureData.push({
                    value: data[timestamp].max_temperature,
                    start_time: data[timestamp].start_time,
                    end_time: data[timestamp].end_time,
                    originalColor: data[timestamp].backgroundColor_bar,
                    itemStyle: {
                        color: addTransparency(data[timestamp].backgroundColor_bar, 0.4) // 初始設為半透明
                    }
                });
                threshold1Data.push(data[timestamp].thresholdSystem);
                threshold2Data.push(data[timestamp].thresholdManual);
                ambientData.push(data[timestamp].ambient_temperature);
                timeInfo[timestamp] = {
                    start_time: data[timestamp].start_time,
                    end_time: data[timestamp].end_time
                };
            }
        });

        // 添加一個函數來為顏色添加透明度
        function addTransparency(color, alpha) {
            // 如果顏色是十六進制格式 (#RRGGBB)
            if (color.startsWith('#')) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            // 如果顏色已經是 rgba 格式
            else if (color.startsWith('rgba')) {
                return color.replace(/rgba\((.+?), .+?\)/, `rgba($1, ${alpha})`);
            }
            // 如果顏色是 rgb 格式
            else if (color.startsWith('rgb')) {
                return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
            }
            return color; // 如果無法處理，返回原始顏色
        }

        const option = {
            title: {
                text: '',
                left: 'center'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
                top: 60
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    let result = `${params[0].name}<br/>`;

                    params.forEach(param => {
                        const color = param.color;
                        const seriesName = param.seriesName;
                        const value = param.value;

                        if (seriesName === '最大溫度') {
                            const marker = param.marker;
                            const start = param.data.start_time;
                            const end = param.data.end_time;
                            result += `${marker}${seriesName}: ${value}°C<br/>`;
                            result += `${marker}起始時間: ${start}<br/>`;
                            result += `${marker}終止時間: ${end}<br/>`;
                        } else {
                            result += `${param.marker}${seriesName}: ${value}°C<br/>`;
                        }
                    });

                    return result;
                }
            },
            legend: {
                data: [
                    {
                        name: '最大溫度',
                        itemStyle: {
                            color: DEFAULT_BAR_COLOR
                        }
                    },

                    {
                        name: '一級警報溫度',
                        itemStyle: {
                            color: THRESHOLD1_COLOR
                        }
                    },
                    {
                        name: '二級警報溫度',
                        itemStyle: {
                            color: THRESHOLD2_COLOR
                        }
                    },
                    {
                        name: '環境溫度',
                        itemStyle: {
                            color: AMBIENT_COLOR
                        }
                    }
                ],
                left: 80,
                right: '8%',
                top: '0%',
                type: 'scroll',
            },
            xAxis: {
                type: 'category',
                data: timeData,
                axisLabel: {
                    formatter: function (value) {
                        // Assuming the value is a date-time string, split it into date and time
                        const parts = value.split(' ');
                        return parts.join('\n'); // Join with a newline character
                    },
                    showMaxLabel: true,
                }
            },
            yAxis: {
                type: 'value',
                name: '(°C)',
                scale: true,
                interval: 5,
                showMaxLabel: true,
            },
            series: [
                {
                    name: '最大溫度',
                    type: 'bar',
                    data: temperatureData,
                    selectedMode: false,
                    emphasis: {
                        disabled: true
                    }
                },
                {
                    name: '一級警報溫度',
                    type: 'line',
                    smooth: true,
                    data: threshold1Data,


                    itemStyle: {
                        color: THRESHOLD1_COLOR

                    },
                    lineStyle: {
                        width: 2,
                        type: 'solid'
                    }
                },
                {
                    name: '二級警報溫度',
                    type: 'line',
                    smooth: true,
                    data: threshold2Data,
                    itemStyle: {
                        color: THRESHOLD2_COLOR

                    },
                    lineStyle: {
                        width: 2,
                        type: 'solid'
                    }
                },
                {
                    name: '環境溫度',
                    type: 'line',
                    smooth: true,
                    data: ambientData,
                    itemStyle: {
                        color: AMBIENT_COLOR
                    },
                    lineStyle: {
                        width: 2,
                        type: 'solid'
                    }
                }
            ]
        };

        if (chartRefSelectBar.value) {
            if (!chartSelectBar) {
                chartSelectBar = echarts.init(chartRefSelectBar.value);
            }

            const resetAllBars = () => {
                return temperatureData.map(item => ({
                    ...item,
                    itemStyle: {
                        color: addTransparency(item.originalColor, 0.5) // 所有柱子設為半透明
                    }
                }));
            };

            chartSelectBar.off('click');  // 移除舊的事件監聽器
            chartSelectBar.on('click', function (params) {
                clearChart();
                if (params.seriesName === '最大溫度') {
                    const timestamp = params.name;
                    const dataIndex = params.dataIndex;

                    if (currentSelectedIndex === dataIndex) {
                        chartSelectBar.setOption({
                            series: [{
                                name: '最大溫度',
                                data: resetAllBars()
                            }]
                        });
                        currentSelectedIndex = null;
                    } else {
                        const newData = resetAllBars();
                        if (newData[dataIndex]) {  // 添加檢查
                            // 點選的柱子使用原始顏色（不透明）
                            newData[dataIndex].itemStyle.color = newData[dataIndex].originalColor;
                        }

                        chartSelectBar.setOption({
                            series: [{
                                name: '最大溫度',
                                data: newData
                            }]
                        });

                        currentSelectedIndex = dataIndex;

                        // 確保時間資訊存在
                        if (timeInfo[timestamp]) {
                            showLoading()
                            current_selected_time.value = [{
                                start_time: timeInfo[timestamp].start_time,
                                end_time: timeInfo[timestamp].end_time
                            }];

                            if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
                                ws4.value.send(JSON.stringify({
                                    "feature": "history_temperature",
                                    "method": "query_roiTemperature",
                                    "content": {
                                        "camera_id": camera_id.value,
                                        "cursingPoint_id": cursingPoint_id.value,
                                        "selected_time": current_selected_time.value,
                                        "roiClass_id": roiClass_id.value
                                    },
                                    "session": "sckji8452s",
                                }));
                            }
                        }
                    }
                }
            });

            chartSelectBar.setOption(option);
        }
    } catch (error) {
        console.error("更新選擇時間範圍圖表時出錯:", error);
    }
};



const ws3 = ref(null);
const ws4 = ref(null);
const ws5 = ref(null);
const data_on = ref(false);

const startTime = ref('')
const endTime = ref('')
const convertISOToCustomFormat = (isoString) => {
    const date = new Date(isoString);

    // 提取年、月、日、小时、分钟和秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 格式化为 'YYYY-MM-DD HH:MM:SS'
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


const datePlugin = () => {
    // 先清理已存在的實例
    if (datePickerInstance.value) {
        datePickerInstance.value.destroy();
        datePickerInstance.value = null;
    }

    // 確保 DOM 完全加載
    nextTick(() => {
        setTimeout(() => {
            const element = document.getElementById('datetimerange-input123');
            if (!element) {
                console.error('找不到日期選擇器元素');
                return;
            }

            datePickerInstance.value = new DateRangePicker('datetimerange-input123', {
                timePicker: true,
                alwaysShowCalendars: true,
                timePickerSeconds: true,
                locale: {
                    applyLabel: '確定',
                    cancelLabel: '取消',
                    format: "YYYY-MM-DD HH:mm:ss",
                    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                        '七月', '八月', '九月', '十月', '十一月', '十二月'
                    ],
                },
                autoUpdateInput: false
            }, function (start, end) {
                console.log("開始時間:", convertISOToCustomFormat(start.format()));
                console.log("結束時間:", convertISOToCustomFormat(end.format()));

                dateRangeSelected.value = convertISOToCustomFormat(start.format()).toString() + " " + "-" + " " + convertISOToCustomFormat(end.format()).toString();

                clearChart();
                clearBarChart();
                startTime.value = convertISOToCustomFormat(start.format())
                endTime.value = convertISOToCustomFormat(end.format())
                // getHistoryCruising(startTime.value, endTime.value);
            });
        }, 100); // 給予一個小延遲確保 DOM 已經準備好
    });
}

const updateChartData_peakHour = (data) => {
    if (!data || !Array.isArray(data)) {
        // Handle empty or invalid data
        optionBar.value.series = [];
        if (chart4) {
            chart4.setOption(optionBar.value);
        }
        return;
    }

    // Configure the bar chart options
    optionBar.value = {
        animation: false,
        animationDurationUpdate: 0,
        // color: ["#546E7A", "#90A4AE", "#B0BEC5", "#CFD8DC", "#ECEFF1"],
        tooltip: {
            animation: false,
            transitionDuration: 0,
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                let result = `Hour ${params[0].axisValue}<br/>`;
                params.forEach(param => {
                    if (param.value !== null) {
                        result += `${param.marker}${param.seriesName}: ${param.value} times<br/>`;
                    }
                });
                return result;
            }
        },
        legend: {
            left: 140,
            right: '8%',
            top: '0%',
            type: 'scroll',
            data: data.map(item => item.roi_number)
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
            top: 60
        },
        xAxis: {
            name: "(小時)",
            type: 'category',
            data: Array.from({ length: 24 }, (_, i) => i),
            boundaryGap: true,
            axisLabel: {
                showMaxLabel: true
            }
        },
        yAxis: {
            name: "(次數)",
            type: 'value',
            scale: true,
            minInterval: 1,
            interval: 5,
            axisLabel: {
                showMaxLabel: true,
            },
        },
        series: data.map(item => ({
            name: item.roi_number,
            type: 'bar',
            stack: 'total',
            emphasis: {
                focus: 'series'
            },
            data: item.data.map(hourData => hourData[1]),
            animation: false,
            symbol: 'none',
            showSymbol: false,
            hoverAnimation: false,
            smooth: false,
            lineStyle: {
                width: 0.5
            }
        }))
    };

    // Update the chart with new options
    if (chart4) {
        chart4.setOption(optionBar.value, true);
    }
};











// Simulate WebSocket connection
let websocketInterval;

//! step 1
const getCruisingList = () => {
    console.log("获取巡弋点列表，相机ID:", camera_id.value);

    if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
        ws3.value.send(JSON.stringify({
            "feature": "cursing",
            "method": "query_cursingPoint",
            "content": {
                "combination_id": camera_id.value,
                "cursingPath_id": camera_id.value,
            },
            "session": "sckji8452s"
        }));
    } else {
        console.error("WebSocket3 未连接，无法获取巡弋点列表");
    }
}

const camIdList = () => {

    if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
        ws3.value.send(JSON.stringify({
            "feature": "layout",
            "method": "query_overallTabContainer",
            "content": {},
            "session": "sckji8452s"
        }));
    }
}




const getWebSocket4 = () => {
    ws4.value = new WebSocket(`ws://${$getIpaddress()}:8704`);

    ws4.value.onopen = () => {
        console.log("WebSocket4 connected");

        // 移除 getCruisingList() 調用，因為此時 camera_id.value 可能還是 null
        // getCruisingList()
    };

    ws4.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log("sdsddsdsd", data);

        if (data.feature === "history_cursing" && data.method === "query_cursingEvent") {
            console.log("dsfdssdfsdfsf", data.content)

            //*? 
            updateChartData_selectTimeRange(data.content.barchart_roiMax.data)
            updateChartData_peakHour(data.content.table_peakHour.echart_data);
            console.log("dfsrdsf", data.content)
            hideLoading();
            //*? 
        }

        if (data.feature === "history_dataframe" && data.method === "query_image") {
            console.log("imggggggg", data.content[0])
            image_base64.value.ir = `data:image/jpg;base64,${data.content[0].image_base64.ir}`
        }



        if (data.feature === "history_temperature" && data.method === "query_roiTemperature") {
            console.log("query_roiTemperature", data.content)
            // chartData.value = data.content[0]
            // clearChart()
            renderCharts(data.content[0])
        }



        if (data.feature === "history_temperature" && data.method === "query_recalculate_roiTemperature") {
            console.log("query_recalculate_roiTemperature", data.content)
            // chartData.value = data.content[0]
            renderCharts(data.content[0])
        }
    };

    ws4.value.onerror = (error) => {
        console.error("WebSocket4 error:", error);
    };

    ws4.value.onclose = () => {
        console.log("WebSocket4 disconnected");
        setTimeout(getWebSocket4, 5000); // 重連機制
    };
}



const getWebSocket3 = () => {
    ws3.value = new WebSocket(`ws://${$getIpaddress()}:8703`);

    ws3.value.onopen = () => {
        console.log("WebSocket3 connected");

        // 移除 getCruisingList() 調用，因為它需要 camera_id.value，但此時還是 null
        // getCruisingList()
        camIdList()
    };

    ws3.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("sdsddsdsd", data);

        if (data.feature === "cursing" && data.method === "query_cursingPoint") {
            console.log("收到巡弋点列表:", data.content);
            cruisingItems.value = data.content;

            // 直接在这里设置 cursingPoint_id
            if (data.content && data.content.length > 0) {
                console.log("设置新的巡弋点ID:", data.content[0].cursingPoint_id);
                cursingPoint_id.value = data.content[0].cursingPoint_id;
            } else {
                console.log("巡弋点列表为空");
            }
        }

        if (data.feature === "layout" && data.method === "query_overallTabContainer") {
            const originalArray = data.content
            // Filter out items that don't contain "單機" in their tab_name
            camItems.value = originalArray.filter(item => item.tab_name.includes("單機"));
            console.log("12345678910", camItems.value)
            //    camera_id.value =  camItems.value[0].tab_sort
            // cruisingItems.value = data.content
        }

    };

    ws3.value.onerror = (error) => {
        console.error("WebSocket3 error:", error);
    };

    ws3.value.onclose = () => {
        console.log("WebSocket3 disconnected");
        setTimeout(getWebSocket3, 5000); // 重連機制
    };
}





function requestInitialData() {

    if (ws5.value && ws5.value.readyState === WebSocket.OPEN) {
        ws5.value.send(JSON.stringify({
            "feature": "request_initial_data",
            "session": "sckji8452s"
        }));
    }
}

//! step 2
const getHistoryCruising = (e, e2, e3) => {
    showLoading();

    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {


        console.log("qwqeqweweqwdsfd", {
            "feature": "history_cursing",
            "method": "query_cursingEvent",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_start_time": e,
                "selected_end_time": e2,
                "roiClass_id": e3
            },
            "session": "sckji8452s",
        });

        ws4.value.send(JSON.stringify({
            "feature": "history_cursing",
            "method": "query_cursingEvent",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_start_time": e,
                "selected_end_time": e2,
                "roiClass_id": e3
            },
            "session": "sckji8452s",
        }));
    }
}




const getChartOption = (data, title) => {
    // 添加數據檢查
    if (!data || !data.echart_data) {
        return {
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
                top: 60
            }
        };
    }

    return {
        // ... existing options ...
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
                zoomOnMouseWheel: true,
                moveOnMouseMove: true
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                const time = params[0].data[0]
                let result = `<div class="font-bold">${time}</div>`
                params.forEach(param => {
                    const colorDot = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>`
                    result += `${colorDot}${param.seriesName}: ${param.data[1]}°C<br/>`
                })
                return result
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#ccc',
            borderWidth: 1,
            padding: [5, 10],
            textStyle: {
                color: '#333'
            }
        },
        legend: {
            data: data.echart_data.map(item => item.roi_number),
            type: 'scroll',
            // top: 15
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
            top: 60
        },
        xAxis: {
            type: 'time',
            boundaryGap: false,
            axisLabel: {
                formatter: '{HH}:{mm}:{ss}'
            }
        },
        yAxis: {
            type: 'value',
            name: '溫度 (°C)',
            interval: 5,
            scale: true,
            axisLabel: {
                formatter: '{value} °C'
            }
        },
        series: data.echart_data.map(item => ({
            name: item.roi_number,
            type: 'line',
            data: item.data,
            smooth: true,
            showSymbol: false,
            emphasis: {
                focus: 'series'
            }
        }))
    }
}

// Modify the initChart function to add hover event handling
const initChart = (el, data, title) => {
    if (!el) return null;
    if (!data || !data.echart_data) {
        console.warn(`沒有有效的數據用於圖表: ${title}`);
        return null;
    }

    // 確保元素是空的
    if (el.__echarts__) {
        echarts.dispose(el);
    }

    const chart = echarts.init(el);
    const option = getChartOption(data, title);
    chart.setOption(option);

    // 使用節流函數來限制請求頻率
    let lastSentTime = 0;
    const throttleDelay = 300; // 300毫秒的節流延遲

    // 直接在圖表容器上添加滑鼠移動事件
    el.addEventListener('mousemove', (event) => {
        const currentTime = Date.now();
        if (currentTime - lastSentTime < throttleDelay) return;

        // 獲取滑鼠在圖表中的位置
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 檢查滑鼠是否在圖表區域內
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            try {
                // 將像素位置轉換為數據位置
                const xValue = chart.convertFromPixel({ xAxisIndex: 0 }, x);
                if (xValue) {
                    const formattedTime = moment(xValue).format('YYYY-MM-DD HH:mm:ss');

                    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
                        console.log("發送圖片請求:", formattedTime);
                        ws4.value.send(JSON.stringify({
                            "feature": "history_dataframe",
                            "method": "query_image",
                            "content": {
                                "camera_id": camera_id.value,
                                "cursingPoint_id": cursingPoint_id.value,
                                "selected_time": formattedTime,
                            },
                            "session": "sckji8452s",
                        }));
                        lastSentTime = currentTime;
                    }
                }
            } catch (error) {
                console.error("轉換座標時出錯:", error);
            }
        }
    });

    return chart;
};

const renderCharts = (data) => {
    // 先清除所有現有的圖表實例
    Object.values(charts.value).forEach(chart => {
        if (chart) {
            chart.dispose();
        }
    });

    // 重置 charts 對象
    charts.value = {
        avg: null,
        min: null,
        max: null
    };

    const chartInstances = [];

    // 重新初始化每個圖表
    if (data.echart_roiAvg) {
        charts.value.avg = initChart(avgChartRef.value, data.echart_roiAvg, '平均溫度');
        if (charts.value.avg) chartInstances.push(charts.value.avg);
    }

    if (data.echart_roiMin) {
        charts.value.min = initChart(minChartRef.value, data.echart_roiMin, '最小溫度');
        if (charts.value.min) chartInstances.push(charts.value.min);
    }

    if (data.echart_roiMax) {
        charts.value.max = initChart(maxChartRef.value, data.echart_roiMax, '最大溫度');
        if (charts.value.max) chartInstances.push(charts.value.max);
    }

    // 只在有圖表實例時進行連接
    if (chartInstances.length > 0) {
        echarts.connect(chartInstances);
    }

    isRendered.value = true;
    hideLoading(); // 使用新的函數隱藏加載指示器

};





// 清除圖表數據
const clearChart = () => {
    rois.value = []
    image_base64.value = { ir: "", vis: "" }
    // Clear echarts instances except chartSelectBar
    Object.values(charts.value).forEach(chart => {
        if (chart) {
            try {
                chart.clear()
                chart.dispose()
            } catch (error) {
                console.error("清除圖表時出錯:", error)
            }
        }
    })
    charts.value = {
        avg: null,
        min: null,
        max: null
    }
    isRendered.value = false
};

const clearBarChart = () => {
    // Clear echarts instances except chartSelectBar
    if (chartSelectBar) {
        try {
            updateChartData_selectTimeRange({});
            chartSelectBar.clear();
        } catch (error) {
            console.error("清除選擇條形圖時出錯:", error)
        }
    }

    if (chart4) {
        try {
            updateChartData_peakHour([]);
            chart4.clear();
        } catch (error) {
            console.error("清除圖表4時出錯:", error)
        }
    }
};






// 圖表大小調整函數
const resizeChart = () => {
    [chartSelectBar].forEach(chart => {
        chart && chart.resize();
    });
};

const initChart4 = () => {
    if (chartRef4.value) {
        chart4 = echarts.init(chartRef4.value);
        chart4.setOption(optionBar.value);

        // 添加到 resize 監聽列表
        if (resizeObserver) {
            resizeObserver.observe(chartRef4.value);
        }
    }
};

onMounted(() => {
    document.addEventListener('click', closeMenu)

    getWebSocket3()
    getWebSocket4()
    datePlugin()

    initChart4(); // 初始化圖表

    // 添加 resize 監聽
    window.addEventListener('resize', resizeChart);

    // 設置 ResizeObserver
    resizeObserver = new ResizeObserver(resizeChart);
    [chartRefSelectBar.value]
        .filter(Boolean)
        .forEach(ref => resizeObserver.observe(ref));

});



onUnmounted(() => {
    // 清理 DateRangePicker 實例
    if (datePickerInstance.value) {
        datePickerInstance.value.destroy();
        datePickerInstance.value = null;
    }

    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('click', closeMenu)


    // 清理事件監聽
    window.removeEventListener('resize', resizeChart);

    // 清理 ResizeObserver
    if (resizeObserver) {
        resizeObserver.disconnect();
    }


    // 清理 WebSocket
    if (websocketInterval) {
        clearInterval(websocketInterval);
    }
});



// 處理確定按鈕點擊事件
const handleConfirm = () => {
    try {
        console.log("確定按鈕被點擊");
        console.log("當前狀態:", {
            dateRange: dateRangeSelected.value,
            cameraId: camera_id.value,
            cursingPointId: cursingPoint_id.value,
            roiClassId: roiClass_id.value
        });
        
        // 檢查所有必填項目
        if (!dateRangeSelected.value || dateRangeSelected.value === "") {
            console.log("錯誤: 未選擇日期範圍");
            alert("請選擇日期範圍");
            return;
        }

        // 從 dateRangeSelected 解析日期範圍
        if (dateRangeSelected.value && dateRangeSelected.value.includes("-")) {
            const parts = dateRangeSelected.value.split(" - ");
            if (parts.length === 2) {
                startTime.value = parts[0].trim();
                endTime.value = parts[1].trim();
                console.log("解析的開始時間:", startTime.value);
                console.log("解析的結束時間:", endTime.value);
            } else {
                console.error("日期格式不正確:", dateRangeSelected.value);
                alert("日期格式不正確，請重新選擇");
                return;
            }
        } else {
            console.error("日期格式不包含分隔符:", dateRangeSelected.value);
            alert("日期格式不正確，請重新選擇");
            return;
        }

        if (!camera_id.value) {
            console.log("錯誤: 未選擇相機名稱");
            alert("請選擇相機名稱");
            return;
        }

        if (!cursingPoint_id.value) {
            console.log("錯誤: 未選擇巡弋點名稱");
            alert("請選擇巡弋點名稱");
            return;
        }

        if (!roiClass_id.value) {
            console.log("錯誤: 未選擇監測物件");
            alert("請選擇監測物件");
            return;
        }

        // 先顯示加載指示器，然後再清理圖表
        console.log("開始加載數據...");
        showLoading();

        // 確保圖表實例被正確清理
        setTimeout(() => {
            console.log("清理圖表...");
            clearChart();
            clearBarChart();
            console.log("發送歷史巡弋請求:", {
                startTime: startTime.value,
                endTime: endTime.value,
                roiClassId: roiClass_id.value
            });
            getHistoryCruising(startTime.value, endTime.value, roiClass_id.value);
        }, 100);
    } catch (error) {
        console.error("處理確認按鈕時出錯:", error);
        hideLoading();
        alert("處理請求時出錯，請稍後再試");
    }
};

// 修改 watch 監聽，移除自動觸發查詢
watch(camera_id, (newVal, oldVal) => {
    console.log("相机ID变更:", oldVal, "->", newVal);
    if (newVal !== oldVal) {
        clearChart();
        clearBarChart();
        getCruisingList();
    }
});

watch(cruisingItems, (newItems) => {
    console.log("巡弋点列表更新:", newItems);
    if (newItems && newItems.length > 0) {
        console.log("从列表中设置巡弋点ID:", newItems[0].cursingPoint_id);
        cursingPoint_id.value = newItems[0].cursingPoint_id;
    }
});

watch(cursingPoint_id, (newVal, oldVal) => {
    console.log("巡弋点ID变更:", oldVal, "->", newVal);
    if (newVal !== oldVal) {
        clearChart();
        clearBarChart();
        // 移除自動觸發查詢
        // getHistoryCruising(startTime.value, endTime.value, roiClass_id.value);
    }
});

watch(dateRangeSelected, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        clearChart();
        clearBarChart();
        // 移除自動觸發查詢
        // getHistoryCruising(startTime.value, endTime.value, roiClass_id.value);
    }
});


</script>
<style scoped>
.bordered-section {
    outline: 1px solid #B8B8B8;
    position: relative;
    background: #fff;
}

.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.select-none {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
}
</style>
<style>
/* 確保日期時間選擇器的下拉選單永遠在最上層 */
.daterangepicker {
    z-index: 99999 !important;
    /* 使用很大的值確保在最上層 */
}

/* 時間選擇器的下拉部分 */
.calendar-time {
    z-index: 99999 !important;
}

/* 確保時間選擇器的下拉選單也在最上層 */
.daterangepicker .calendar-time select {
    z-index: 100000 !important;
}


.centered-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    ;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    /* 黑色半透明 */
}
</style>