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

            <!-- {{ cruisingItems }} -->
            <!-- {{ roiImages }} -->
            <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap">
                <!-- 調試信息 -->
                <!-- <div class="d-flex align-center pr-4">
                    <small class="text-grey">Debug: camItems count: {{ camItems.length }}, camera_id: {{ camera_id }}</small>
                </div> -->
                
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
                    <v-text-field v-model="dateRangeSelected" density="compact" variant="outlined" hide-details
                        type="text" id="datetimerange-input123" size="40" class="v-field__input"></v-text-field>
                </div>

                <v-btn color="grey" @click="handleConfirm">
                    確定
                </v-btn>
                <!-- 
                <v-btn @click="clearChart">清除</v-btn>
                <v-btn @click="showNewData">新Data</v-btn> -->
            </v-col>

            <v-col cols="6" class="bordered-section pa-3">

                <h4 class="pb-3">監測區域</h4>
                <div class="d-flex justify-space-evenly">
                    <img v-if="image_base64.ir" width="390" height=" 292.5" :src="image_base64.ir" />
                    <img v-else width="390" height=" 292.5" style="background-color: grey;" />


                    <v-card variant="outlined" width="390" class="ml-2">
                        <!-- <v-card-title class="pa-0"> -->
                        <h4 class="pa-2">選擇監測物件</h4>
                        <!-- </v-card-title> -->
                        <v-divider />
                        <v-card-text style="height: 250px;overflow-y: auto">
                            <div class="tree-view">
                                <div v-for="group in roiGroups" :key="group.roi_subGroup_name" class="group"
                                    style="overflow: auto;">
                                    <div class="group-header" @click="toggleGroup(group)">
                                        <v-icon>{{ group.isExpanded ? 'mdi-menu-down' : 'mdi-menu-right' }}</v-icon>
                                        <span>{{ group.roi_subGroup_name }}</span>
                                    </div>
                                    <div v-if="group.isExpanded" class="group-content">
                                        <div v-for="item in group.roi_subGroup_data" :key="item.roi_id"
                                            class="group-item" :class="{ 'selected-item': selectedRoi === item.roi_id }"
                                            @click="selectRoi(item.roi_id)">
                                            <div class="item-content">
                                                <div class="image-container">
                                                    <img v-if="item.roi_type == 'spot'"
                                                        src="/public/images/icon/Iconspot.svg" width="30"
                                                        style="background-color: #f2f2f2;padding:4px;border-radius: 5px;" />

                                                    <img v-if="item.roi_type == 'line'"
                                                        src="/public/images/icon/Iconline.svg" width="30"
                                                        style="background-color: #f2f2f2;padding:4px;border-radius: 5px;" />

                                                    <img v-if="item.roi_type == 'scope'"
                                                        src="/public/images/icon/Iconscope.svg" width="30"
                                                        style="background-color: #f2f2f2;padding:4px;border-radius: 5px;" />

                                                    <img v-if="item.roi_type == 'blob'"
                                                        src="/public/images/icon/Iconblob.svg" width="30"
                                                        style="background-color: #f2f2f2;padding:4px;border-radius: 5px;" />
                                                    <span class="roi-number">{{ item.roi_number }}</span>
                                                </div>
                                                <div class="pl-4">{{ item.roi_name }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>



                </div>

                <!-- <img :src="image_base64.vis" width="450" class="h-auto pointer-events-none" ref="bgImage"
                @dragstart.prevent /> -->
            </v-col>




            <v-col cols="6" class="bordered-section">

                <div style="width: 100%; height: 370px;" ref="chartRef2"></div>

            </v-col>


            <v-col cols="6" class="bordered-section">
                <h4 class="pb-3">最高溫度</h4>

                <!-- //! 圖表 -->

                <!-- <button @click="handleRender">渲染圖表</button>
                    <button @click="clearChart">清除圖表</button> -->

                <div style="width: 100%; height: 370px;" ref="chartRef"></div>

                <!-- //! 圖表 -->

            </v-col>

            <v-col cols="6" class="bordered-section">
                <h4 class="pb-3">紅外線影像</h4>
                <div class="d-flex justify-space-evenly">
                    <div class="text-center">
                        <img v-if="roiImages[0]" :src="roiImages[0].image_base64" width="390"
                            class="h-auto pointer-events-none" ref="bgImage" @dragstart.prevent />
                        <img v-else width="390" height=" 292.5" style="background-color: grey;" />
                        <h5 v-if="roiImages[0]">{{ roiImages[0].selected_time }}</h5>
                        <h5 v-else> -- </h5>
                    </div>
                    <div class="text-center">
                        <img v-if="roiImages[1]" :src="roiImages[1].image_base64" width="390"
                            class="h-auto pointer-events-none" ref="bgImage" @dragstart.prevent />
                        <img v-else width="390" height=" 292.5" style="background-color: grey;" />
                        <h5 v-if="roiImages[1]">{{ roiImages[1].selected_time }}</h5>
                        <h5 v-else> -- </h5>

                    </div>

                </div>

            </v-col>





        </v-row>
    </v-container>
</template>

<script setup>

const { $getIress } = useNuxtApp()
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
            src: '/js/moment.min.js',
            type: 'text/javascript'
        },
        {
            src: '/js/vanilla-datetimerange-picker.js',
            type: 'text/javascript'
        }
    ],
    style: [
        { children: 'body { color: white; background-color: #fff; }' }
    ]
})

import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';

import * as echarts from 'echarts'
const datePickerInstance = ref(null);
const chartRef = ref(null)
const chartRef2 = ref(null)

let chart = null
let chart2 = null
const selectedPoints = ref([])
const times = ref([])

const sampleData = ref({
    // "2023-06-20 12:00:20": {
    //     "update_time": "2023-06-20 12:00:20",
    //     "max_temperature": 70.9,
    //     "thresholdManual": 30.9,
    //     "thresholdSystem": 30.8,
    //     "ambient_temperature": 28.9
    // },
    // "2023-06-20 12:00:29": {
    //     "update_time": "2023-06-20 12:00:29",
    //     "max_temperature": 83.9,
    //     "thresholdManual": 30.9,
    //     "thresholdSystem": 30.8,
    //     "ambient_temperature": 32.7
    // },
    // "2023-06-20 12:00:39": {
    //     "update_time": "2023-06-20 12:00:39",
    //     "max_temperature": 89.5,
    //     "thresholdManual": 30.9,
    //     "thresholdSystem": 30.8,
    //     "ambient_temperature": 28.9
    // }
})


const predictionData = ref({
    // "2023-06-20 12:00:20": {
    //     "update_time": "2023-06-20 12:00:20",
    //     "max_temperature": 70.9,
    //     "thresholdManual": 30.9,
    //     "thresholdSystem": 30.8,
    //     "ambient_temperature": 28.9
    // },
    // "2023-06-20 12:00:29": {
    //     "update_time": "2023-06-20 12:00:29",
    //     "max_temperature": 83.9,
    //     "thresholdManual": 30.9,
    //     "thresholdSystem": 30.8,
    //     "ambient_temperature": 32.7
    // },
    // "2023-06-20 12:00:39": {
    //     "update_time": "2023-06-20 12:00:39",
    //     "max_temperature": 89.5,
    //     "thresholdManual": 30.9,
    //     "thresholdSystem": 30.8,
    //     "ambient_temperature": 28.9
    // }
})

const initChart = () => {
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['最高溫度', '二級警報溫度', '一級警報溫度', '環境溫度']
        },
        grid: {
            show: false // 移除網格邊框
        },
        xAxis: {
            type: 'category',
            data: [],

        },
        yAxis: {
            type: 'value',
            name: '溫度 (°C)',
        },
        series: [
            {
                name: '最高溫度',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#808080'  // Default gray color
                },
                emphasis: {
                    disabled: true    // Disable hover effect
                }
            },
            {
                name: '二級警報溫度',
                type: 'line',
                data: [],

            },
            {
                name: '一級警報溫度',
                type: 'line',
                data: [],

            },
            {
                name: '環境溫度',
                type: 'line',
                data: [],

            }
        ]
    }

    return option
}

const processData = (data) => {
    times.value = []
    const maxTemps = []
    const manualThresholds = []
    const systemThresholds = []
    const ambient_temperature = []
    Object.values(data).forEach(item => {
        times.value.push(item.update_time)  // Keep full timestamp for selection
        maxTemps.push({
            value: item.max_temperature,
            itemStyle: {
                color: selectedPoints.value.includes(item.update_time) ? '#5470c6' : '#808080'
            }
        })
        manualThresholds.push(item.thresholdManual)
        systemThresholds.push(item.thresholdSystem)
        ambient_temperature.push(item.ambient_temperature)
    })

    return { times: times.value, maxTemps, manualThresholds, systemThresholds, ambient_temperature }
}

const handleBarClick = (params) => {
    if (params.seriesName !== '最高溫度') return

    const clickedTime = params.name
    // 不需要再查找索引，因為點擊的就是完整時間戳
    const fullTime = clickedTime

    // Check if the point is already selected
    const existingIndex = selectedPoints.value.indexOf(fullTime)
    if (existingIndex !== -1) {
        // Remove selection
        selectedPoints.value.splice(existingIndex, 1)
    } else if (selectedPoints.value.length < 2) {
        // Add new selection
        selectedPoints.value.push(fullTime)
    }

    // Update all bar colors based on selection
    const { maxTemps } = processData(sampleData.value)
    maxTemps.forEach((item, idx) => {
        const currentTime = times.value[idx]
        item.itemStyle.color = selectedPoints.value.includes(currentTime) ? '#5470c6' : '#808080'
    })

    // Update chart with new colors
    const currentOption = chart.getOption()
    currentOption.series[0].data = maxTemps
    chart.setOption(currentOption)

    // Only log to console if there are selected points
    if (selectedPoints.value.length > 0) {
        console.log("取圖片", {
            feature: "history_analysis",
            method: "query_roiImages",
            content: {
                camera_id: camera_id.value,
                cursingPoint_id: cursingPoint_id.value,
                roi_id: selectedRoi.value,
                selected_time: selectedPoints.value.sort()
            },
            session: "sckji8452s"
        })

        if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
            ws4.value.send(JSON.stringify({
                "feature": "history_analysis",
                "method": "query_roiImages",
                "content": {
                    "camera_id": camera_id.value,
                    "cursingPoint_id": cursingPoint_id.value,
                    "roi_id": selectedRoi.value,
                    "selected_time": selectedPoints.value.sort()
                },
                "session": "sckji8452s"
            }));
        }

    } else {
        roiImages.value = roiImagesOG.value
    }
}

const renderChart = () => {
    if (!chart) {
        chart = echarts.init(chartRef.value)
    }
    const option = initChart()
    chart.setOption(option)

    // Add click event handler
    chart.off('click')
    chart.on('click', handleBarClick)
}

const renderChart2 = () => {
    if (!chart2) {
        chart2 = echarts.init(chartRef2.value)
    }

    if (!predictionData.value || Object.keys(predictionData.value).length === 0) {
        const option = initChart2()
        chart2.setOption(option)
        return
    }

    console.log("預測數據:", predictionData.value) // 調試用

    // 處理數據
    const times = []
    const maxTemps = []
    const manualThresholds = []

    Object.values(predictionData.value.data || {}).forEach(item => {
        times.push(item.update_time)
        maxTemps.push(item.max_temperature)
        manualThresholds.push(item.thresholdManual)
    })

    // 計算適當的 x 軸標籤間隔 - 增加間隔以減少標籤數量
    let interval = 0;
    if (times.length > 10) {
        interval = Math.floor(times.length / 5); // 只顯示約5個標籤
    }

    // 根據數據點數量調整標記區域
    let numSections = 3; // 默認分為3個區域
    if (times.length < 6) {
        numSections = Math.max(1, Math.floor(times.length / 2)); // 如果數據點少於6個，則減少區域數量
    }

    // 計算每個區域的大小
    const sectionSize = Math.max(1, Math.floor(times.length / numSections));

    // 創建標記區域
    const defaultMarkAreas = [];
    const colors = ['rgba(255, 0, 0, 0.2)', 'rgba(0, 0, 255, 0.2)', 'rgba(0, 255, 0, 0.2)'];
    const names = ['歷史數據', '當前數據', '預測數據'];

    for (let i = 0; i < numSections; i++) {
        const startIndex = i * sectionSize;
        // 確保最後一個區域包含所有剩餘的點
        const endIndex = (i === numSections - 1) ? times.length - 1 : (i + 1) * sectionSize - 1;

        defaultMarkAreas.push({
            start_index: startIndex,
            end_index: endIndex,
            markArea_color: colors[i % colors.length],
            markArea_name: names[i % names.length]
        });
    }

    // 使用提供的標記區域或默認標記區域
    const markAreas = (predictionData.value.markArea && predictionData.value.markArea.length > 0)
        ? predictionData.value.markArea.map(area => ({
            ...area,
            // 確保 end_index 不超出範圍
            end_index: Math.min(area.end_index, times.length - 1)
        }))
        : defaultMarkAreas

    console.log("標記區域數據:", markAreas) // 調試用

    // 創建一個單獨的系列來處理所有標記區域
    const markAreaData = []

    markAreas.forEach(area => {
        if (area.start_index >= 0 && area.end_index < times.length) {
            // 確保 end_index 不超出範圍且至少比 start_index 大 1
            const endIndex = Math.max(area.start_index + 1, Math.min(area.end_index, times.length - 1));

            markAreaData.push([
                {
                    // name: area.markArea_name,
                    xAxis: area.start_index,
                    itemStyle: {
                        color: area.markArea_color,
                        borderColor: 'transparent', // 移除標記區域的邊框
                        borderWidth: 0
                    }
                },
                {
                    xAxis: endIndex
                }
            ])
        }
    })

    // 獲取預計可用時間和超溫溫度閾值（如果有的話）
    const estimatedUsableTime = predictionData.value.estimatedUsableTime || "未知";
    const overTempThreshold = predictionData.value.overTempThreshold || "未知";

    const option = {
        title: {
            text: '溫度趨勢預測',
            left: 'center',
            top: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            formatter: function (params) {
                let result = params[0].axisValue + '<br/>';

                // 添加數據系列信息
                params.forEach(param => {
                    if (param.seriesName === '最高溫度' || param.seriesName === '警報溫度') {
                        result += param.marker + ' ' + param.seriesName + ': ' + param.value + '°C<br/>';
                    }
                });

                // 添加標記區域信息
                const timeIndex = times.findIndex(t => t === params[0].axisValue);
                for (const area of markAreas) {
                    if (timeIndex >= area.start_index && timeIndex <= area.end_index) {
                        const colorBlock = `<span style="display:inline-block;width:10px;height:10px;background-color:${area.markArea_color};border:1px solid #000;margin-right:5px;"></span>`;
                        result += colorBlock + area.markArea_name + '<br/>';
                        break;
                    }
                }

                return result;
            }
        },
        legend: {
            data: ['最高溫度', '警報溫度'].concat(
                markAreas.map(area => area.markArea_name)
            ),
            top: 30,
            // 保留圖例項的邊框
            itemStyle: {
                borderColor: '#000',
                borderWidth: 1
            }
        },
        grid: {
            top: 70,
            bottom: 80,
            left: 50,
            right: 50,
            show: false // 移除網格邊框
        },
        xAxis: {
            type: 'category',
            data: times,
            boundaryGap: false,
            axisLabel: {
                formatter: function (value) {
                    // 簡化時間顯示，只顯示時間部分
                    const parts = value.split(' ');
                    if (parts.length === 2) {
                        // 只顯示時間部分，不換行
                        return parts[1];
                    }
                    return value;
                },
                interval: interval, // 使用計算的間隔
                rotate: 0, // 不旋轉標籤
                margin: 14
            },
        },
        yAxis: {
            type: 'value',
            name: '溫度 (°C)',
            interval: 5,
            minInterval: 5,
            axisLabel: {
                formatter: function(value) {
                    return value + '°C';
                }
            },
            scale: true
        },
        series: [
            {
                name: '最高溫度',
                type: 'line',
                data: maxTemps,
                z: 10,
                markArea: {
                    silent: true,
                    data: markAreaData,
                    itemStyle: {
                        borderColor: 'transparent', // 移除標記區域的邊框
                        borderWidth: 0
                    }
                }
            },
            {
                name: '警報溫度',
                type: 'line',
                data: manualThresholds,
                lineStyle: {
                    type: 'dashed'
                },
                z: 10
            }
        ]
    }

    // 為每個標記區域添加圖例項，使用矩形圖示
    markAreas.forEach(area => {
        option.series.push({
            name: area.markArea_name,
            type: 'line',
            data: [],
            // 為標記區域保留矩形圖示
            symbol: 'rect',
            itemStyle: {
                color: area.markArea_color,
                borderColor: '#000', // 保留圖例項的邊框
                borderWidth: 1
            }
        })
    })

    chart2.setOption(option)

    // 調試輸出
    console.log("圖表配置:", option);
    console.log("標記區域數據:", markAreaData);
}

const handleRender = () => {
    if (!chart) {
        chart = echarts.init(chartRef.value)
    }

    const { times, maxTemps, manualThresholds, systemThresholds, ambient_temperature } = processData(sampleData.value)

    // Calculate appropriate interval for x-axis labels
    let interval = 0; // Default: show all labels
    if (times.length > 20) {
        interval = Math.floor(times.length / 10); // Show approximately 10 labels
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['最高溫度', '二級警報溫度', '一級警報溫度', '環境溫度']
        },
        grid: {
            show: false // 移除網格邊框
        },
        xAxis: {
            type: 'category',
            data: times,  // 使用完整時間戳
            axisLabel: {
                formatter: function (value) {
                    // 將時間戳分割為日期和時間部分並換行顯示
                    const parts = value.split(' ');
                    if (parts.length === 2) {
                        return parts[0] + '\n' + parts[1]; // 日期換行時間
                    }
                    return value;
                },
                interval: interval, // Use calculated interval
                rotate: 0,
                margin: 14
            }
        },
        yAxis: {
            type: 'value',
            name: '溫度 (°C)',
            interval: 5,
            scale:true
        },
        series: [
            {
                name: '最高溫度',
                type: 'bar',
                data: maxTemps,
                emphasis: {
                    disabled: true    // Disable hover effect
                }
            },
            {
                name: '二級警報溫度',
                type: 'line',
                data: manualThresholds,
            },
            {
                name: '一級警報溫度',
                type: 'line',
                data: systemThresholds,
            },
            {
                name: '環境溫度',
                type: 'line',
                data: ambient_temperature,
            }
        ]
    }

    chart.setOption(option)

    // Add click event handler
    chart.off('click')
    chart.on('click', handleBarClick)

    // 渲染第二個圖表
    renderChart2()
}

const initChart2 = () => {
    const option = {
        title: {
            text: '溫度趨勢預測',
            left: 'center',
            top: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['最高溫度', '警報溫度'],
            top: 30,
            // 保留圖例項的邊框
            itemStyle: {
                borderColor: '#000',
                borderWidth: 1
            }
        },
        grid: {
            top: 70,
            bottom: 30,
            left: 50,
            right: 50,
            show: false // 移除網格邊框
        },
        xAxis: {
            type: 'category',
            data: [],
            boundaryGap: false,
        },
        yAxis: {
            type: 'value',
            name: '溫度 (°C)',
        },
        series: [
            {
                name: '最高溫度',
                type: 'line',
                data: []
            },
            {
                name: '警報溫度',
                type: 'line',
                data: [],
                lineStyle: {
                    type: 'dashed'
                }
            }
        ]
    }
    return option
}


const clearChart = () => {
    if (chart) {
        selectedPoints.value = []
        chart.clear()
        chart.setOption(initChart())

        // Re-add click event handler
        chart.off('click')
        chart.on('click', handleBarClick)
    }

    if (chart2) {
        chart2.clear()
        chart2.setOption(initChart2())
    }
}





const chart_data = ref({});


const selectedRoi = ref(null);

const selectRoi = (roiId) => {
    roiImages.value = roiImagesOG.value
    selectedRoi.value = roiId;
    
    // Show loading indicator
    isLoading.value = true;
    
    // Set timeout for loading
    const loadingTimeout = setTimeout(() => {
        isLoading.value = false;
        loadingError.value = true;
    }, 30000); // 30 seconds timeout

    // Get current date range
    const [startDate, endDate] = dateRangeSelected.value.split(' - ');

    // Send updated selection to websocket
    console.log("eeeee", {
        "feature": "history_analysis",
        "method": "query_roiMax",
        "content": {
            "camera_id": camera_id.value,
            "cursingPoint_id": cursingPoint_id.value,
            "roi_id": roiId,
            "selected_start_time": startDate,
            "selected_end_time": endDate
        },
        "session": "sckji8452s"
    })
    
    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
        // Store original message handler
        const originalOnMessage = ws4.value.onmessage;
        
        // Override message handler to clear loading state
        ws4.value.onmessage = (event) => {
            clearTimeout(loadingTimeout);
            isLoading.value = false;
            
            // Call the original handler
            originalOnMessage(event);
        };
        
        ws4.value.send(JSON.stringify({
            "feature": "history_analysis",
            "method": "query_roiMax",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "roi_id": roiId,
                "selected_start_time": startDate,
                "selected_end_time": endDate
            },
            "session": "sckji8452s"
        }));
    }
}


const roiImages = ref([])
const roiImagesOG = ref([])

const camItems = ref([]);
const camera_id = ref(null);
const cruisingItems = ref([]);
const cursingPoint_id = ref(null);
// const dateRangeItems = ref([{ name: '2024-08-30' }]);
const dateRangeSelected = ref('');
const current_selected_time = ref([]);

const image_base64 = ref({ ir: "", vis: "" })

const ws3 = ref(null);
const ws4 = ref(null);

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





// Date Range Picker 初始化函數
const datePlugin = () => {
    // 先清理已存在的實例
    if (datePickerInstance.value) {
        datePickerInstance.value.destroy();
    }

    // 確保 DOM 完全加載
    nextTick(() => {
        setTimeout(() => {
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


                console.log("", convertISOToCustomFormat(start.format()));
                console.log("", convertISOToCustomFormat(end.format()));

                dateRangeSelected.value = convertISOToCustomFormat(start.format()).toString() + " " + "-" + " " + convertISOToCustomFormat(end.format()).toString()

                // console.log("dfgdggfdfdgdg", convertISOToCustomFormat(start.format()), convertISOToCustomFormat(end.format()))
                // getHistoryCruising(convertISOToCustomFormat(start.format()), convertISOToCustomFormat(end.format()))

                // alert(start.format() + " - " + end.format());




            });
        }, 100); // 給予一個小延遲確保 DOM 已經準備好
    });
}






//! step 1
const getCruisingList = () => {

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

    };
    ws4.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log("sdsddsdsd", data);
        //!
        if (data.feature === "history_analysis" && data.method === "query_roiList") {
            console.log("query_roiList", data.content)
            image_base64.value.ir = `data:image/jpg;base64,${data.content.image_base64.ir}`
            image_base64.value.vis = `data:image/jpg;base64,${data.content.image_base64.vis}`
            roiGroups.value = data.content.roi_info.map(group => ({
                ...group,
                isExpanded: true // 默认展开所有组
            }));
        }


        if (data.feature === "history_analysis" && data.method === "query_roiMax") {
            console.log("query_roiMax", data.content.barchart_roiMax.data)
            clearChart()
            sampleData.value = data.content.barchart_roiMax.data
            predictionData.value = data.content.barchart_roiMaxPrediction
            handleRender()
        }

        if (data.feature === "history_analysis" && data.method === "query_roiImages") {
            console.log("query_roiImages", data.content)
            if (data.content.length !== 0) {
                // for (let i = 0; i < data.content.length ; i++) {

                //     data.content[i]
                // }
                roiImages.value = data.content.map(group => ({
                    image_base64: `data:image/jpg;base64,${group.image_base64.vis}`,
                    selected_time: group.selected_time
                }));
            } else {
                roiImages.value = roiImagesOG.value
            }

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
        // 先只獲取相機列表，確保數據能正確載入
        camIdList()
        // 延遲獲取巡弋點列表，避免衝突
        setTimeout(() => {
            getCruisingList()
        }, 1000)
    };

    ws3.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("AssetAging WebSocket3 message:", data);

        if (data.feature === "cursing" && data.method === "query_cursingPoint") {
            cruisingItems.value = data.content
        }

        if (data.feature === "layout" && data.method === "query_overallTabContainer") {
            const originalArray = data.content
            // Filter out items that don't contain "單機" in their tab_name
            camItems.value = originalArray.filter(item => item.tab_name.includes("單機"));
            console.log("AssetAging camItems updated:", camItems.value)
            console.log("AssetAging camItems length:", camItems.value.length)
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
const getHistoryCruising = (e, e2) => {

    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {


        console.log("qwqeqweweqwdsfd", {
            "feature": "history_analysis",
            "method": "query_roiList",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_start_time": e,
                "selected_end_time": e2
            },
            "session": "sckji8452s",
        });

        ws4.value.send(JSON.stringify({
            "feature": "history_analysis",
            "method": "query_roiList",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_start_time": e,
                "selected_end_time": e2
            },
            "session": "sckji8452s",
        }));
    }

}

const roiGroups = ref([])


const toggleGroup = (group) => {
    group.isExpanded = !group.isExpanded
}



onMounted(() => {
    renderChart()
    renderChart2()
    getWebSocket3()
    getWebSocket4()
    datePlugin()
});

const handleResize = () => {
    if (chart) {
        chart.resize()
    }
    if (chart2) {
        chart2.resize()
    }
}

window.addEventListener('resize', handleResize)

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (chart) {
        chart.dispose()
        chart = null
    }
    if (chart2) {
        chart2.dispose()
        chart2 = null
    }
});

// ... existing code ...
watch(camera_id, (newVal) => {
    // 当相机ID变化时，重新获取巡弋点列表
    getCruisingList();
    // 不要在这里设置 cursingPoint_id，因为 cruisingItems 还没有更新
});

// 添加对 cruisingItems 的监听
watch(cruisingItems, (newItems) => {
    // 当 cruisingItems 更新后，再设置 cursingPoint_id
    if (newItems && newItems.length > 0) {
        cursingPoint_id.value = newItems[0].cursingPoint_id;
    }
});

const isLoading = ref(false);
const loadingError = ref(false);

const handleConfirm = () => {
    if (!camera_id.value || !cursingPoint_id.value || !dateRangeSelected.value) {
        // Show alert when any required field is empty
        alert("選項不得為空");
        return;
    }

    isLoading.value = true;

    // Parse date range
    const [startDate, endDate] = dateRangeSelected.value.split(' - ');

    // Clear previous data
    clearChart();
    roiImages.value = [];
    selectedRoi.value = null;

    // Set timeout for loading
    const loadingTimeout = setTimeout(() => {
        isLoading.value = false;
        loadingError.value = true;
    }, 30000); // 30 seconds timeout

    // Request data
    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
        ws4.value.send(JSON.stringify({
            "feature": "history_analysis",
            "method": "query_roiList",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_start_time": startDate,
                "selected_end_time": endDate
            },
            "session": "sckji8452s",
        }));
    }

    // Update WebSocket message handler to clear loading state
    const originalOnMessage = ws4.value.onmessage;
    ws4.value.onmessage = (event) => {
        clearTimeout(loadingTimeout);
        isLoading.value = false;

        // Call the original handler
        originalOnMessage(event);
    };
}

const handleErrorReturn = () => {
    loadingError.value = false;
}

</script>
<style scoped>
.chart-container {
    border: 1px solid #ddd;
    margin: 0 auto;
}

.button-container {
    text-align: center;
}

button {
    margin: 0 10px;
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}







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


<style scoped>
.tree-view {
    padding: 0px;
}

.group {
    margin-bottom: 8px;
}

.group-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.group-header:hover {
    background-color: #eeeeee;
}

.group-content {
    margin-left: 24px;
    margin-top: 8px;
}

.group-item {
    padding: 6px;
    margin-bottom: 4px;
}

.item-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.item-type {
    color: #666;
    font-size: 0.9em;
}

.image-container {
    position: relative;
    display: inline-block;
}

.roi-number {
    position: absolute;
    bottom: 5px;
    right: -8px;
    background-color: #F2F2F2;
    border: 1px solid #87878766;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #666;
}


.selected-item {
    background-color: #B4D3FF;
    border-radius: 4px;
}

.group-item {
    cursor: pointer;
}

.group-item:hover {
    background-color: #f5f5f5;
    border-radius: 4px;
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
</style>