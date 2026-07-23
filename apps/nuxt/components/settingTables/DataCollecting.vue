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



            <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">
                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">相機名稱</h4>
                    <v-select width="200px" density="compact" variant="outlined" :items="camItems" item-title="tab_name"
                        item-value="tab_sort" hide-details v-model="camera_id" label="" single-line>
                    </v-select>
                </div>

                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">選擇月份</h4>
                    <v-text-field v-model="selectedMonth" type="month" density="compact" variant="outlined" hide-details
                        class="mr-2"></v-text-field>
                    <v-btn color="grey" @click="handleConfirm">
                        確定
                    </v-btn>
                </div>
                <!-- <v-spacer />
                <v-btn @click="clearChart">清除</v-btn>
                <v-btn @click="showNewData">新Data</v-btn> -->
            </v-col>

            <v-col cols="12" class="bordered-section">
                <v-row no-gutters>
                    <v-col cols="12" class="">
                        <h4>全局溫度</h4>
                    </v-col>
                    <v-col cols="3" class="pa-4 text-center">
                        <h4>每日資料蒐集率</h4>
                        <div ref="chartRef" style="width: 100%; height: 280px;"></div>
                    </v-col>
                    <v-col cols="3" class="pa-4 text-center">
                        <h4>當月資料狀況統計</h4>
                        <div ref="chartRef2" style="width: 100%; height: 280px;"></div>
                    </v-col>
                </v-row>

            </v-col>


            <v-col cols="12" class="bordered-section">
                <v-row no-gutters>
                    <v-col cols="12" class="">
                        <h4>監測區域溫度</h4>
                    </v-col>
                    <v-col cols="3" class="pa-4 text-center">
                        <h4>每日資料蒐集率</h4>
                        <div ref="chartRef3" style="width: 100%; height: 280px;"></div>
                    </v-col>
                    <v-col cols="3" class="pa-4 text-center">
                        <h4>當月資料狀況統計</h4>
                        <div ref="chartRef4" style="width: 100%; height: 280px;"></div>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
const { $getIpaddress } = useNuxtApp()
const isLoading = ref(false);
const loadingError = ref(false);
const loadingTimeout = ref(null);
// select
const camItems = ref([]);
const camera_id = ref(null);
const handleMonthChange = (newValue) => {
    const [year, month] = newValue.split('-');
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startTime = `${formatDate(firstDay)} 00:00:00`;
    const endTime = `${formatDate(lastDay)} 23:59:59`;

    getSavingStatus(startTime, endTime);
};


const chartRef = ref(null);
const chartRef2 = ref(null);
const chartRef3 = ref(null);
const chartRef4 = ref(null);
let resizeObserver = null;

let chart = null;
let chart2 = null;
let chart3 = null;
let chart4 = null;

const ws3 = ref(null);
const ws4 = ref(null);
const data_on = ref(false);

const handleErrorReturn = () => {
    loadingError.value = false;
};

const optionHeatmap = ref({
    animation: false,
    animationDurationUpdate: 0,

    tooltip: {
        formatter: function (params) {
            const date = params.data[0].substring(0, 10);
            const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
            const dayOfWeek =
                daysOfWeek[new Date(params.data[0].substring(0, 10)).getDay()];

            const value = params.data[1];


            return `${date} (${dayOfWeek})<br/>資料收集率 ${value} %<br/>`;
        }
    },
    calendar: {
        top: 60,
        left: 30,
        right: 30,
        bottom: 30,
        cellSize: ['auto', 'auto'],
        orient: 'vertical',
        range: ['2023-06'],
        yearLabel: { show: false },
        splitLine: { show: false }, // Hide grid lines
        splitArea: { show: false }, // Hide the area between grid lines
        dayLabel: {
            show: true,
            // firstDay: 1,
            margin: 5,
            color: 'black',
            fontSize: 10,
            formatter: (value) => echarts.time.format(value, '{dd}')
        }
    },
    label: {
        show: true,
        formatter: function (params) {
            // Extract the date from the data
            const date = echarts.time.format(params.data[0], '{dd}', false);
            return date;
        }
    },

    visualMap: {
        min: 0,
        max: 100,
        type: 'piecewise',
        left: 'center',
        bottom: 0,
        inRange: {
            color: ['#5291FF', '#C7DBFF']
        },
        orient: 'horizontal',
        pieces: [
            { min: 0, max: 90.0, label: '90%以下', color: '#ECEFF1' },  // 最淺色
            { min: 90, max: 95.9, label: '90~95%', color: '#CFD8DC' },  // 較淺色
            { min: 96, max: 99.9, label: '96-99%', color: '#90A4AE' },  // 較深色
            { min: 100, max: 100, label: '100%', color: '#546E7A' },    // 最深色
        ]
    },

    // grid: {
    //     top: '7.5%',
    //     left: '3%',
    //     right: '6%',
    //     bottom: '5%',
    //     // containLabel: true
    // },

    series: []
});


const optionPie = ref({
    animation: false,
    animationDurationUpdate: 0,
    color: ['#ECEFF1', '#90A4AE', '#546E7A'], // 自定義顏色

    // grid: {
    //     top: '15%',
    //     left: '3%',
    //     right: '6%',
    //     bottom: '8%',
    //     // containLabel: true
    // },
    tooltip: {
        trigger: 'item'
    },
    legend: {
        left: 'center',
        bottom: 0
    },
    series: []
});


const echart = ref(
    {
        "raw_savingStatus": {
            "overall_savingStatus": {
                "complete": 0,
                "missing": 0,
                "error": 0
            },
            "day_savingStatus": []
        },
        "roi_savingStatus": {
            "overall_savingStatus": {
                "complete": 0,
                "missing": 0,
                "error": 0
            },
            "day_savingStatus": []
        }
    }
)




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
    return `${year}-${month}-${day}`;
}

const selectedMonth = ref(null); // 临时存储选择的年月
const dateRangeSelected = ref(new Date().toISOString().slice(0, 7)); // 最终确认的年月
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const handleConfirm = () => {
    // Check for empty values
    if (!selectedMonth.value || !camera_id.value) {
        alert('選項不得為空！請選擇相機名稱和月份。');
        return;
    }

    const [year, month] = selectedMonth.value.split('-');
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // 更新显示的年月
    dateRangeSelected.value = formatDate(firstDay).slice(0, 7);

    // 创建包含完整时间范围的对象
    const result = {
        start_time: formatDate(firstDay) + " " + "00:00:00",
        end_time: formatDate(lastDay) + " " + "23:59:59",
    };

    // 显示加载状态
    isLoading.value = true;
    
    // 设置超时检测
    loadingTimeout.value = setTimeout(() => {
        if (isLoading.value) {
            isLoading.value = false;
            loadingError.value = true;
        }
    }, 30000); // 30秒超时

    // 调用获取数据的函数
    getSavingStatus(result.start_time, result.end_time);
};



// Function to update chart data
const updateChartData_day1 = (data) => {
    try {
        // 檢查數據是否存在且為陣列
        if (!data || !Array.isArray(data)) {
            console.error('數據格式不正確:', data);
            return;
        }

        // 從第一筆數據中獲取年月來更新日曆範圍
        if (data.length > 0) {
            const firstDate = data[0][0].substring(0, 7); // 獲取 YYYY-MM
            optionHeatmap.value.calendar.range = firstDate;
        }

        optionHeatmap.value.series = {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: data,
            animation: false,
            label: {
                show: true
            },
            itemStyle: {
                borderColor: '#ffffff',
                borderWidth: 5
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
        }

        // 檢查並更新圖表
        if (chart) {
            chart.setOption(optionHeatmap.value, true);
        } else {
            console.warn('圖表實例 chart1 不存在');
        }

    } catch (error) {
        console.error('更新熱力圖時發生錯誤:', error);
    }
};


const updateChartData_overall1 = (data) => {

    const formattedData = Object.entries(data).map(([key, value]) => ({
        value: value,
        name: key,
    }));

    optionPie.value.series = {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
        },
        label: {
            show: true,
            position: 'center',
            formatter: `蒐集完整率\n ${data.complete}%`, // 固定显示 "完整度\n99.7%"
            fontSize: 14,
            lineHeight: 20,
        },
        emphasis: {
            scale: true, // 允许高亮时放大，但不改变文本
            // itemStyle: {
            //     color: "#3B697E" // 保持原始颜色不变
            // },
            // itemStyle: {
            //     shadowBlur: 0.1,
            //     shadowColor: 'rgba(0, 0, 0, 0.5)'
            // }
            // label: {
            //     show: false, // 保持高亮时标签的显示状态
            //     formatter: '蒐集完整率\n99.7%', // 高亮时仍然显示固定的文本
            //     fontSize: 20,
            //     fontWeight: 'bold',
            //     lineHeight: 30
            // }
        },
        labelLine: {
            show: false
        },
        data: formattedData
    }





    if (chart2) {
        chart2.setOption(optionPie.value, true);
    }
};

const updateChartData_day2 = (data) => {
    // 從第一筆數據中獲取年月
    if (data && data.length > 0) {
        const firstDate = data[0][0].substring(0, 7); // 獲取 YYYY-MM
        optionHeatmap.value.calendar.range = firstDate;
    }

    optionHeatmap.value.series = {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data,
        animation: false,
        label: {
            show: true
        },
        itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 5
        },
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        },
    }

    if (chart3) {
        // 使用完整的配置重新設置
        chart3.setOption(optionHeatmap.value, true);
    }
};


const updateChartData_overall2 = (data) => {

    const formattedData = Object.entries(data).map(([key, value]) => ({
        value: value,
        name: key,
    }));

    optionPie.value.series = {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
        },
        label: {
            show: true,
            position: 'center',
            formatter: `蒐集完整率\n ${data.complete}%`, // 固定显示 "完整度\n99.7%"
            fontSize: 14,
            lineHeight: 20,
        },
        emphasis: {
            scale: true, // 允许高亮时放大，但不改变文本
            // label: {
            //     show: false, // 保持高亮时标签的显示状态
            //     formatter: '蒐集完整率\n99.7%', // 高亮时仍然显示固定的文本
            //     fontSize: 20,
            //     fontWeight: 'bold',
            //     lineHeight: 30
            // }
        },
        labelLine: {
            show: false
        },
        data: formattedData
    }





    if (chart4) {
        chart4.setOption(optionPie.value, true);
    }
};





//! step 1
const getSavingStatus = (e, e2) => {
    console.log("sfsdfdssdfsd", {
        "feature": "history_savingStatus",
        "method": "query_savingStatus",
        "content": {
            "camera_id": camera_id.value,
            "start_time": e,
            "end_time": e2
        },
        "session": "sckji8452s"
    });

    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
        ws4.value.send(JSON.stringify({
            "feature": "history_savingStatus",
            "method": "query_savingStatus",
            "content": {
                "camera_id": camera_id.value,
                "start_time": e,
                "end_time": e2
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


// Simulate WebSocket connection
let websocketInterval;

const getWebSocket3 = () => {
    ws3.value = new WebSocket(`ws://${$getIpaddress()}:8703`);

    ws3.value.onopen = () => {
        console.log("WebSocket connected");
        // requestInitialData();
        camIdList()
    };

    ws3.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("", data);



        if (data.feature === "layout" && data.method === "query_overallTabContainer") {
            const originalArray = data.content
            // Filter out items that don't contain "單機" in their tab_name
            camItems.value= originalArray.filter(item => item.tab_name.includes("單機"));
            console.log("12345678910", camItems.value)
            // camera_id.value =  camItems.value[0].tab_sort
            // cruisingItems.value = data.content
        }


    };

    ws3.value.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws3.value.onclose = () => {
        console.log("WebSocket disconnected");
        setTimeout(initWebSocket, 5000); // 重連機制
    };
}


const getWebSocket4 = () => {
    ws4.value = new WebSocket(`ws://${$getIpaddress()}:8704`);

    ws4.value.onopen = () => {
        console.log("WebSocket connected");
        // requestInitialData();
        // handleConfirm()
    };

    ws4.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("", data);

        if (data.feature === "history_savingStatus" && data.method === "query_savingStatus") {
            console.log("sdfdsfuoshs", data.content)
            showNewData(
                data.content.raw_savingStatus.day_savingStatus,
                data.content.raw_savingStatus.overall_savingStatus,
                data.content.roi_savingStatus.day_savingStatus,
                data.content.roi_savingStatus.overall_savingStatus
            )

// 清除超时计时器并隐藏加载状态
if (loadingTimeout.value) {
                clearTimeout(loadingTimeout.value);
                loadingTimeout.value = null;
            }
            isLoading.value = false;
            // updateChartData_day1(99);
            // updateChartData_overall1(99);
        }




    };

    ws3.value.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws3.value.onclose = () => {
        console.log("WebSocket disconnected");
        setTimeout(initWebSocket, 5000); // 重連機制
    };
}


function requestInitialData() {

    if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
        ws3.value.send(JSON.stringify({
            "feature": "request_initial_data",
            "session": "sckji8452s"
        }));
    }
}

const clearChart = () => {
    updateChartData_day1([]);
    updateChartData_overall1([]);
    updateChartData_day2([]);
    updateChartData_overall2([]);


};

// 显示新数据
const showNewData = (e, e2, e3, e4) => {
    // updateChartData_day1(echart.value.raw_savingStatus.day_savingStatus);
    // updateChartData_overall1(echart.value.raw_savingStatus.overall_savingStatus);
    // updateChartData_day2(echart.value.roi_savingStatus.day_savingStatus);
    // updateChartData_overall2(echart.value.roi_savingStatus.overall_savingStatus);

    updateChartData_day1(e);
    updateChartData_overall1(e2);
    updateChartData_day2(e3);
    updateChartData_overall2(e4);


};



onMounted(() => {
    // Initialize charts with empty data
    if (chartRef.value) {
        chart = echarts.init(chartRef.value);
        chart.setOption(optionHeatmap.value);
    }

    if (chartRef2.value) {
        chart2 = echarts.init(chartRef2.value);
        chart2.setOption(optionPie.value);
    }
    if (chartRef3.value) {
        chart3 = echarts.init(chartRef3.value);
        chart3.setOption(optionHeatmap.value);
    }
    if (chartRef4.value) {
        chart4 = echarts.init(chartRef4.value);
        chart4.setOption(optionPie.value);
    }

    // Connect to WebSockets but don't fetch data automatically
    getWebSocket3();
    getWebSocket4();
    // Removed handleConfirm() call to prevent automatic data fetching
});

onUnmounted(() => {
    if (chart) {
        chart.dispose();
    }
    if (chart2) {
        chart2.dispose();
    }
    if (chart3) {
        chart3.dispose();
    }
    if (chart4) {
        chart4.dispose();
    }
    if (websocketInterval) {
        clearInterval(websocketInterval);
    }
});
</script>
<!-- <style >
.table-condensed  thead tr:nth-child(2),
.table-condensed  tbody {
    display: none
}

.drp-calendar {
    width: 500px
}
</style> -->
<style scoped>
.bordered-section {
    outline: 1px solid #B8B8B8;
    position: relative;
    background: #fff;
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